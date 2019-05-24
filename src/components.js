import { Box, Text } from "ink";
import React from "react";
import stripIndent from "strip-indent";

export const Indent = ({ children, count = 2 }) => (
  <Text>
    {" ".repeat(count)}
    {children}
  </Text>
);

export const Layout = ({ children }) => (
  <>
    <Box> </Box>
    {children}
    <Box> </Box>
  </>
);

export const Line = ({ children, count = 1, indent = 0 }) => (
  <Box>
    <Indent count={indent === true ? 2 : indent}>
      {children || " "}
      {"\n".repeat(count - 1)}
    </Indent>
  </Box>
);

export const Prose = ({ children }) => {
  const ch = stripIndent(children).split("\n");
  if (ch[0].trim() === "") {
    ch.shift();
  }
  if (ch[ch.length - 1].trim() === "") {
    ch.pop();
  }
  return ch.map((line, key) => <Line key={key}>{line || " "}</Line>);
};
