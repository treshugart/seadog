const babelFile = require("babel-file");
const babylonOptions = require("babylon-options");
const camelcase = require("camelcase");
const cosmiconfig = require("cosmiconfig");
const decamelize = require("decamelize");
const {
  extractReactTypes,
  findExportedComponents
} = require("extract-react-types");
const fs = require("fs-extra");
const { render, Text } = require("ink");
const minimist = require("minimist");
const path = require("path");
const React = require("react");
const readPkgUp = require("read-pkg-up");

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

async function getBabelConfig() {
  const { config } = (await cosmiconfig("babel").search()) || {};
  return (
    config || {
      plugins: ["@babel/plugin-proposal-class-properties"],
      presets: [
        ["@babel/preset-env", { targets: { node: true } }],
        "@babel/preset-flow",
        "@babel/preset-react"
      ]
    }
  );
}

async function getTsConfig() {
  const { config } = (await cosmiconfig("tsconfig").search()) || {};
  return config;
}

// TODO - AOT compile babel for prod (can use this for dev).
async function registerBabel() {
  require("@babel/register")(await getBabelConfig());
}

// TODO - AOT compile ts for prod (can use this for dev).
async function registerTypeScript() {
  require("ts-node").register(await getTsConfig());
}

async function getComponentInfo(componentPath) {
  const componentFile = require.resolve(componentPath);
  const componentFileContents = await fs.readFile(componentFile);
  const pkg = (await readPkgUp()).package;
  const dep = pkg.devDependencies || {};
  const suffix = componentFile.split(".").pop();

  let typeSystem = "";
  if (suffix.indexOf("js") === 0) {
    typeSystem = "flow";
    await registerBabel();
  } else if (suffix.indexOf("ts") === 0) {
    typeSystem = "typescript";
    await registerTypeScript();
  }

  const exportedComponents = findExportedComponents(
    (await createBabelFile(componentFile)).path,
    typeSystem,
    componentFile
  );

  const components = require(componentPath);
  return exportedComponents.map(extractedTypes => {
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
      component: components[isDefault ? "default" : componentName],
      componentName,
      description,
      isDefault,
      props
    };
  });
}

function componentsArrayToObject(components) {
  return components.reduce((o, c) => {
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

async function run(entries) {
  const args = minimist(process.argv.splice(2));
  const command = args._[0] || "default";
  const props = { _: command, ...args };

  if (!Array.isArray(entries)) {
    entries = [entries];
  }

  // TODO check CLI param values against types.

  const componentsArray = (await getComponentInfo(
    path.join(__dirname, "commands")
  )).concat(
    ...(await Promise.all(
      entries.map(
        async e => await getComponentInfo(path.join(process.cwd(), e))
      )
    ))
  );
  const componentsObject = componentsArrayToObject(componentsArray);

  if (componentsObject[command]) {
    render(
      React.createElement(
        componentsObject[command].component,
        props,
        componentsArray
      )
    );
  } else {
    throw new Error(`The command "${command}" does not exist.`);
  }
}

module.exports = {
  run
};
