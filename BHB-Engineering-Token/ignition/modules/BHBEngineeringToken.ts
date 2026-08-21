import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BHBEngineeringTokenModule", (module) => {
  const deployer = module.getAccount(0);
  const initialOwner = module.getParameter("initialOwner", deployer);
  const token = module.contract("BHBEngineeringToken", [initialOwner]);

  return { token };
});
