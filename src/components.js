import { Text } from "ink";
import React from "react";
import stripIndent from "strip-indent";

export const Indent = ({ children, count = 2 }) => (
  <>
    {" ".repeat(count)}
    {children}
  </>
);

export const Layout = ({ children }) => (
  <>
    <Line />
    <Line>{children}</Line>
    <Line />
  </>
);

export const Line = ({ children = " ", count = 1, indent = 0 }) => (
  <>
    <Indent count={indent === true ? 2 : indent}>{children}</Indent>
  </>
);

export const Prose = ({ children }) => stripIndent(children);
