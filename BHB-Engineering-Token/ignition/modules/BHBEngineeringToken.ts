import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BHBEngineeringTokenModule", (module) => {
  const deployer = module.getAccount(0);
  const token = module.contract("BHBEngineeringToken", [deployer]);

  return { token };
});
