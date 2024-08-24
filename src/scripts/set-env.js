#!/usr/bin/node
const fs = require("fs");
const appPath = process.argv[2];
const environment = process.argv[3];
const envFileContent = require(appPath +
  "/src/environments/environment." +
  environment +
  ".ts");
fs.writeFileSync(
  appPath + "/src/environments/environment.ts",
  JSON.stringify(envFileContent, undefined, 2)
);
console.log("Env set to " + process.argv[2]);
