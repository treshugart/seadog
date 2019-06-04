import { Box } from "ink";
import * as React from "react";
import { Indent, Line, Prose } from "./components";

type HelpProps = {
  // The command that the help will be printed for. Leave empty to see a list of all commands.
  name?: string;
  commands?: object;
};

const HelpOne = ({ name = "", commands = {} }: HelpProps) => {
  const cmd = commands[name];
  const props = {};

  for (const prop of cmd.props) {
    if (prop.description) {
      props[prop.name] = prop;
    }
  }

  const hasProps = !!Object.keys(props).length;
  const maxName = Object.keys(props).reduce((p, n) => {
    const nl = props[n].name.length;
    return p > nl ? p : nl;
  }, 0);
  const maxType = Object.keys(props).reduce((p, n) => {
    const nl = props[n].type.length;
    return p > nl ? p : nl;
  }, 0);

  return (
    <React.Fragment>
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
      {hasProps ? (
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
    </React.Fragment>
  );
};

const HelpAll = ({ commands = {} }: { commands?: object }) => {
  const chr = Object.values(commands);
  const max = chr.reduce((p, n) => {
    const nl = n.commandName.length;
    return p > nl ? p : nl;
  }, 0);
  return (
    <React.Fragment>
      <Prose>{`
        Available commands
        ------------------
      `}</Prose>
      {chr.map(c => (
        <Line key={c.commandName} indent={max - c.commandName.length + 2}>
          {`${c.commandName} ${c.description}`}
        </Line>
      ))}
    </React.Fragment>
  );
};

// Displays the available commands.
export class Help extends React.Component<HelpProps> {
  static defaultProps = {
    name: "",
    commands: {}
  };
  render() {
    return (
      <>
        {this.props.name ? (
          <HelpOne {...this.props} />
        ) : (
          <HelpAll {...this.props} />
        )}
      </>
    );
  }
}
