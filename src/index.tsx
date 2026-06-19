const nodeVersion = parseInt(process.version.slice(1), 10);
if (nodeVersion < 18) {
  console.error(
    `\n  berwapp requires Node.js 18 or higher.\n  You are using Node.js ${process.version}.\n  Please upgrade: https://nodejs.org\n`
  );
  process.exit(1);
}

import updateNotifier from "update-notifier";
import { createRequire } from "module";
import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "./app.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

updateNotifier({ pkg }).notify();

const program = new Command();

program
  .name("berwapp")
  .description("TUI scaffolding tool for modern web projects")
  .version(pkg.version)
  .option("-y, --yes", "skip prompts and use defaults")
  .option("-n, --name <name>", "project name")
  .parse(process.argv);

const opts = program.opts();

render(React.createElement(App, { skipPrompts: !!opts.yes, projectName: opts.name ?? "" }));
