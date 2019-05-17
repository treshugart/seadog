import { Text } from "ink";
import React from "react";
import { Layout, Prose } from "./components";

type HelpProps = {
  children: Array<Object>,

  // The command that the help will be printed for. Leave empty to see a list of all commands.
  command: string
};

const HelpOne = ({ children, command }) => {
  const cmd = children.reduce((p, c) => {
    return c.commandName === command ? c : p;
  });

  const maxName = Object.keys(cmd.props).reduce((p, n) => {
    const nl = cmd.props[n].name.length;
    return p > nl ? p : nl;
  }, 0);
  const maxType = Object.keys(cmd.props).reduce((p, n) => {
    const nl = cmd.props[n].type.length;
    return p > nl ? p : nl;
  }, 0);
  return (
    <Prose>{`
      Usage
      -----

        ${cmd.commandName}${Object.keys(cmd.props)
      .map(k => {
        const prop = cmd.props[k];
        return ` --${prop.name}=${
          prop.optional ? JSON.stringify(prop.default) : "[required]"
        }`;
      })
      .join("")}${
      cmd.props.length
        ? `

      Options
      -------

        ${Object.keys(cmd.props)
          .filter(k => cmd.props[k].description)
          .map(k => {
            const prop = cmd.props[k];
            const description = ` ${prop.description}`;
            const indentName = " ".repeat(maxName - prop.name.length + 2);
            const indentType = " ".repeat(maxType - prop.type.length);
            const name = `${prop.name}`;
            const type = ` ${prop.type}`;
            return indentName + name + type + indentType + description;
          })
          .join("\n        ")}`
        : ""
    }
    `}</Prose>
  );
};

const HelpAll = ({ children }) => {
  const chr = children;
  const max = chr.reduce((p, n) => {
    const nl = n.commandName.length;
    return p > nl ? p : nl;
  }, 0);
  return (
    <Prose>{`
      Usage
      -----

        help
        help --command cmd-name
      
      Available commands
      ------------------
        ${children
          .map(
            c => `
        ${" ".repeat(max - c.commandName.length)}${c.commandName} ${
              c.description
            }`
          )
          .join("")}
    `}</Prose>
  );
};

// Displays the available commands.
export class Help extends React.Component<HelpProps> {
  static defaultProps = {
    command: ""
  };
  render() {
    return (
      <Layout>
        {this.props.command.length ? (
          <HelpOne {...this.props} />
        ) : (
          <HelpAll {...this.props} />
        )}
      </Layout>
    );
  }
}
