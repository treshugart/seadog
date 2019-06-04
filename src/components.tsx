import { Box, Text } from "ink";
import * as React from "react";
import stripIndent from "strip-indent";

export const Indent = ({
  children,
  count = 2
}: {
  children?: any;
  count?: number;
}) => (
  <Text>
    {" ".repeat(count)}
    {children}
  </Text>
);

export const Line = ({
  children,
  count = 1,
  indent = 0
}: {
  children?: any;
  count?: number;
  indent?: true | number;
}) => (
  <Box>
    <Indent count={indent === true ? 2 : indent}>
      {children || " "}
      {"\n".repeat(count - 1)}
    </Indent>
  </Box>
);

export const Prose = ({ children }: { children?: any }) => {
  const ch = stripIndent(children).split("\n");
  if (ch[0].trim() === "") {
    ch.shift();
  }
  if (ch[ch.length - 1].trim() === "") {
    ch.pop();
  }
  return (
    <React.Fragment>
      {ch.map((line, key) => (
        <Line key={key}>{line || " "}</Line>
      ))}
    </React.Fragment>
  );
};
