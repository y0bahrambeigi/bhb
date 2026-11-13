import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const addressesFile = resolve(projectRoot, "ignition/deployments/chain-11155111/deployed_addresses.json");
const dashboardFile = resolve(projectRoot, "dashboard/deployment.json");

try {
  const addresses = JSON.parse(await readFile(addressesFile, "utf8"));
  const entry = Object.entries(addresses).find(([key]) => key.endsWith("#BHBEngineeringToken"));
  if (!entry) throw new Error("BHBEngineeringToken was not found in the Sepolia deployment results.");

  const [, address] = entry;
  const deployment = {
    chainId: 11155111,
    address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://sepolia.etherscan.io/address/${address}`,
  };

  await writeFile(dashboardFile, `${JSON.stringify(deployment, null, 2)}\n`, "utf8");
  console.log(`Dashboard configured for ${address}`);
} catch (error) {
  console.error(`Unable to sync Sepolia address: ${error.message}`);
  process.exitCode = 1;
}
