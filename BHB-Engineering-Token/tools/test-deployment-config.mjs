import { spawnSync } from "node:child_process";

const hardhatCli = new URL("../node_modules/hardhat/dist/src/cli.js", import.meta.url);

function runHardhat(args) {
  return spawnSync(process.execPath, [hardhatCli.pathname, ...args], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
    env: process.env,
  });
}

const missingSafe = runHardhat([
  "ignition",
  "deploy",
  "ignition/modules/BHBEngineeringToken.ts",
  "--deployment-id",
  "deployment-guard-test",
]);
const missingSafeOutput = `${missingSafe.stdout || ""}\n${missingSafe.stderr || ""}`;

if (missingSafe.status === 0 || !missingSafeOutput.includes("initialOwner")) {
  console.error(missingSafeOutput);
  throw new Error("Production deployment must fail closed when initialOwner is missing.");
}

const localDeployment = runHardhat([
  "ignition",
  "deploy",
  "ignition/modules/BHBEngineeringTokenLocal.ts",
  "--deployment-id",
  "local-deployment-control-test",
]);

if (localDeployment.status !== 0) {
  console.error(localDeployment.stdout);
  console.error(localDeployment.stderr);
  throw new Error("The explicit local-development deployment path must remain usable.");
}

console.log("Deployment guard passed: production requires initialOwner and local deployment remains available.");
