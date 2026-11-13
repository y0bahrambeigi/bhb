import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BHBEngineeringTokenModule", (module) => {
  const initialOwner = module.getParameter<string>("initialOwner");
  const token = module.contract("BHBEngineeringToken", [initialOwner]);

  return { token };
});
