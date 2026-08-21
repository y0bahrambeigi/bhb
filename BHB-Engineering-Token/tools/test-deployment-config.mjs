import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

const temporaryDirectory = mkdtempSync(join(tmpdir(), "bhb-deployment-guard-"));
const parameterFile = join(temporaryDirectory, "parameters.json");
writeFileSync(parameterFile, JSON.stringify({
  BHBEngineeringTokenModule: {
    initialOwner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    safeCreationTransactionHash: `0x${"11".repeat(32)}`,
  },
}));

try {
  const parameterizedDeployment = runHardhat([
    "ignition",
    "deploy",
    "ignition/modules/BHBEngineeringToken.ts",
    "--parameters",
    parameterFile,
    "--deployment-id",
    "production-parameter-control-test",
  ]);
  if (parameterizedDeployment.status !== 0) {
    console.error(parameterizedDeployment.stdout);
    console.error(parameterizedDeployment.stderr);
    throw new Error("Production deployment must accept the Safe address plus its public creation evidence.");
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
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
