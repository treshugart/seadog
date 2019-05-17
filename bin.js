import React from "react";
import { Text } from "ink";

type Props = {
  // The name to say hello to.
  name: string
};

function Layout({ children }) {
  return (
    <Text>
      {"\n"}
      {children}
      {"\n\n"}
    </Text>
  );
}

// Prints "Hello, [name]!".
export default class Test extends React.Component<Props> {
  static defaultProps = {
    name: "World"
  };
  render() {
    return <Layout>Hello, {this.props.name}!</Layout>;
  }
}

// Another testable component.
export class AnotherTest extends React.Component<{}> {
  render() {
    return <Layout>Another test</Layout>;
  }
}
