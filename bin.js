#! /usr/bin/env node

const util = require("util");
const babelFile = require("babel-file");
const babylonOptions = require("babylon-options");
const chokidar = require("chokidar");
const concurrently = require("concurrently");
const cosmiconfig = require("cosmiconfig");
const decamelize = require("decamelize");
const ert = require("extract-react-types");
const fs = require("fs-extra");
const minimist = require("minimist");
const path = require("path");
const resolve = util.promisify(require("resolve"));

const cli = minimist(process.argv.splice(2));

async function createBabelFile(filename) {
  return babelFile(await fs.readFile(filename), {
    filename,
    parserOpts: babylonOptions({
      sourceType: "module",
      plugins: [
        "jsx",
        "flow",
        "doExpressions",
        "objectRestSpread",
        "classProperties",
        "exportExtensions",
        "asyncGenerators",
        "functionBind",
        "functionSent",
        "dynamicImport"
      ]
    })
  });
}

async function createEntry(src, dst) {
  const info = await getComponentInfo(src);
  const code = `
    import * as ink from "ink";
    import minimist from "minimist";
    import * as React from "react";
    import * as src from "${path.relative(dst, src)}";

    const args = minimist(process.argv.splice(2));
    const command = args._[0] || "default";
    const commands = ${JSON.stringify(info)};
    const props = { command, commands, ...args };

    if (commands[command]) {
      const Component = src[commands[command].componentName];
      ink.render(<Component {...props} />);
    } else {
      throw new Error(\`The command "\${command}" does not exist.\`);
    }
  `;
  await fs.outputFile("./bin/index.tsx", code);
}

async function getComponentInfo(componentPath) {
  const componentFile = await resolve(componentPath, {
    basedir: process.cwd(),
    extensions: [".ts", ".tsx"]
  });
  const componentFileContents = await fs.readFile(componentFile);
  const suffix = componentFile.split(".").pop();

  const exportedComponents = ert.findExportedComponents(
    (await createBabelFile(componentFile)).path,
    "typescript",
    componentFile
  );

  return exportedComponents
    .map(extractedTypes => {
      const isDefault =
        extractedTypes.path.parent.type === "ExportDefaultDeclaration";
      const componentName = extractedTypes.name;
      const description =
        (extractedTypes.component.value &&
          extractedTypes.component.value.trailingComments &&
          extractedTypes.component.value.trailingComments
            .map(c => c.value)
            .join("\n  ")) ||
        "";
      const props =
        (extractedTypes.component.value &&
          extractedTypes.component.value.members &&
          extractedTypes.component.value.members.map(m => ({
            default: m.default ? m.default.value : null,
            description:
              (m.leadingComments &&
                m.leadingComments.map(c => c.value).join(" ")) ||
              "",
            name: decamelize(m.key.name),
            optional: !!m.default,
            type: m.value.kind
          }))) ||
        [];
      const commandName = decamelize(componentName, "-");

      return {
        commandName,
        componentName,
        description,
        isDefault,
        props
      };
    })
    .reduce((o, c) => {
      o[c.commandName] = c;

      // If this is the default export we also alias it as the default command.
      // This means you can optionally alias your command as the default simply
      // by exporting it as a default export.
      if (c.isDefault) {
        o.default = c;
      }

      return o;
    }, {});
}

async function getConfig() {
  const search = await cosmiconfig("tsconfig").search();
  return search
    ? search.config
    : {
        compilerOptions: {
          allowJs: true,
          esModuleInterop: true,
          jsx: "react",
          outDir: "bin"
        }
      };
}

function makeCliOptions(opt, joiner) {
  const formatted = [];
  for (let o in opt) {
    let v = opt[o];
    if (v == null) {
      continue;
    } else if (typeof v === "boolean") {
      o = v ? o : `no-${o}`;
      v = "";
    } else if (Array.isArray(v)) {
      v = `="${v.join(",")}"`;
    } else {
      v = `="${v}"`;
    }
    formatted.push(`--${o}${v}`);
  }
  return `${joiner}${formatted.join(joiner)}`;
}

(async () => {
  const tsconfig = await getConfig();
  const src = cli._[0];
  const opt = {
    ...{ outDir: "bin", watch: cli.watch },
    ...tsconfig.compilerOptions
  };
  const entryFile = path.join(opt.outDir, "index.tsx");

  await fs.remove(opt.outDir);
  await createEntry(src, opt.outDir);

  // Watching the entry and rebuilding the generated file will invoke TS.
  // Setting { persistent: false } allows ^C to work.
  await chokidar.watch(src, { persistent: false }).on("all", async () => {
    createEntry(src, opt.outDir);
  });

  // We have to run this with concurrently because running a script in watch
  // mode blocks all other output.
  concurrently([
    {
      command: `npx tsc ${entryFile} ${makeCliOptions(opt, "\\\n  ")}`,
      name: "ts"
    }
  ]);
})();
