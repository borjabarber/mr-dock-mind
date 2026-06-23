import React from "react";
import { render } from "ink";
import { InteractiveApp } from "./InteractiveApp.js";

export async function runInteractive(): Promise<void> {
  const instance = render(<InteractiveApp />);
  await instance.waitUntilExit();
}
