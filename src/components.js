import { Text } from "ink";
import React from "react";

export const Layout = ({ children }) => (
  <Text>
    {"\n"}
    {children}
    {"\n\n"}
  </Text>
);
