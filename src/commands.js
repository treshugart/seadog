import { Text } from "ink";
import React from "react";
import { Layout } from "./components";

type HelpProps = {
  // The command that the help will be printed for.
  command: string,

  // List of command data to use for printing the help.
  commands: Array<Object>
};

export class Help extends React.Component<HelpProps> {
  render() {
    return <Layout>help</Layout>;
  }
}
