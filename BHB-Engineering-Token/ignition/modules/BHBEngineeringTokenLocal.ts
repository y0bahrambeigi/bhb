import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BHBEngineeringTokenLocalModule", (module) => {
  const localDeployer = module.getAccount(0);
  const token = module.contract("BHBEngineeringToken", [localDeployer]);

  return { token };
});
