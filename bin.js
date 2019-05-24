import React from "react";
import { Box } from "ink";

type Props = {
  // The name to say hello to.
  name: string,

  // Testing.
  asdfasdf: string
};

// Prints "Hello, [name]!".
export default class Test extends React.Component<Props> {
  static defaultProps = {
    name: "World"
  };
  render() {
    return <Box>Hello, {this.props.name}!</Box>;
  }
}

// Another testable component.
export class AnotherTest extends React.Component<{}> {
  render() {
    return <Box>Another test</Box>;
  }
}
