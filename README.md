# Seadog

> A framework for building command-line tools with React and Ink.

- ⚛️ Use React!
- 📔 Your class names are your command names.
- 👮 CLI options are generated from your TS prop types.
- 🔮 Default `help` command included.

It's inspired heavily by [`pastel`](https://github.com/vadimdemedes/pastel) with
two fundamental differences:

1. It works off of entry points and their exports, as opposed to your file
   system. This means you can expicitly define command components and can
   co-locate utilities and non-command code.
2. It doesn't use `prop-types`. Instead it extracts prop information from
   TypeScript prop types using
   [`extract-react-types`](https://github.com/atlassian/extract-react-types).

## Install

Whether you do this as a dep or dev dep depends on how you will use it. If
you're writing stuff for just your repo and dev loop, then a dev dep is fine. If
you're publishing commands to be used as a dependency, then use it as a standard
dep.

```sh
npm i seadog
```

## Usage

As mentioned earlier, Seadog works off of entry points and exports instead of
your file system. To defien a basic entry point to work from, create a `cli.tsx`
file and put the following into it:

```ts
import * as React from "react";
import { Box } from "ink";

type Props = {
  // The name to say hello to.
  name: string;
};

// Prints: Hello, <name>!
export default class Hello extends React.Component<Props> {
  static defaultProps = {
    name: "World"
  };
  render() {
    return <Box>Hello, {this.props.name}!</Box>;
  }
}
```

You then need to expose this file to the CLI. Create a `./bin.js` file and put
the following into it:

```js
require("seadog").run("./cli");
```

You should now be able to run `node ./bin.js` and see:

```sh
Hello, World!
```

You can also pass it props, like `node ./bin.js --name You`:

```sh
Hello, You!
```

### Default vs named commands

The `Hello` command not only gets exposed as `hello`, but it also gets exposed
as the default command. Thus both `node ./bin.js` and `node ./bin.js hello` are
synonymous. The `hello` command becomes an alias for the default command because
you have exported it as the default export. To not have a default command,
sipmly remove the default export.

_A default command must have an alias._

### Built-in help

Seadog comes with a built-in `help` command. To invoke the help, run
`node ./bin.js help`:

```sh
Usage
-----
  help
  help --command cmd-name

Available commands
------------------
  help
  hello Prints: Hello, <name>!
```

This displays an overview of your CLI. Run `node ./bin.js help --command hello`
to see the help for your `hello` command.

```sh
Usage
-----
  hello --name="World"

Options
-------
  name string The name to say hello to.
```

### Overriding the built-in help

If you want to override the built-in `help` command, just export a class with
the name of `Help`.

The `Help` component receives two props:

1. `command` - if the help is being displayed for a particular command. This is
   `null` if the global help is being displayed.
2. `children` - An array of commands / prop info.

```ts
type Children = Array<{
  commandName: string;
  component: ComponentType<{}>;
  componentName: string;
  description: string;
  isDefault: boolean;
  props: Array<{
    default: any;
    description: string;
    name: string;
    optional: boolean;
    type: string;
  }>;
}>;
```
