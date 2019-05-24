import { Box, Text } from "ink";
import React from "react";
import { Indent, Layout, Line, Prose } from "./components";

type HelpProps = {
  children: Array<Object>,

  // The command that the help will be printed for. Leave empty to see a list of all commands.
  command: string
};

const HelpOne = ({ children, command }) => {
  const cmd = children.reduce((p, c) => {
    return c.commandName === command ? c : p;
  });
  const props = cmd.props.filter(p => p.name !== "children");
  const maxName = Object.keys(props).reduce((p, n) => {
    const nl = props[n].name.length;
    return p > nl ? p : nl;
  }, 0);
  const maxType = Object.keys(props).reduce((p, n) => {
    const nl = props[n].type.length;
    return p > nl ? p : nl;
  }, 0);

  return (
    <Layout>
      <Prose>{`
        Usage
        -----
      `}</Prose>
      <Box>
        <Indent>{cmd.commandName}</Indent>
        {Object.keys(props).map(k => {
          const prop = props[k];
          return ` --${prop.name}=${
            prop.optional ? JSON.stringify(prop.default) : "[required]"
          }`;
        })}
      </Box>
      {props.length ? (
        <>
          <Line />
          <Prose>{`
            Options
            -------
          `}</Prose>
          {Object.keys(props).map(k => {
            const prop = props[k];
            const description = ` ${prop.description}`;
            const indentName = " ".repeat(maxName - prop.name.length + 2);
            const indentType = " ".repeat(maxType - prop.type.length);
            const name = `${prop.name}`;
            const type = ` ${prop.type}`;
            return (
              <Line key={name}>
                {indentName + name + type + indentType + description}
              </Line>
            );
          })}
        </>
      ) : (
        ""
      )}
    </Layout>
  );
};

const HelpAll = ({ children }) => {
  const chr = children;
  const max = chr.reduce((p, n) => {
    const nl = n.commandName.length;
    return p > nl ? p : nl;
  }, 0);
  return (
    <Layout>
      <Prose>{`
        Usage
        -----
          help
          help --command cmd-name
            
        Available commands
        ------------------
      `}</Prose>
      {children.map(c => (
        <Line key={c.commandName} indent={max - c.commandName.length + 2}>
          {`${c.commandName} ${c.description}`}
        </Line>
      ))}
    </Layout>
  );
};

// Displays the available commands.
export class Help extends React.Component<HelpProps> {
  static defaultProps = {
    command: ""
  };
  render() {
    return (
      <>
        {this.props.command.length ? (
          <HelpOne {...this.props} />
        ) : (
          <HelpAll {...this.props} />
        )}
      </>
    );
  }
}
