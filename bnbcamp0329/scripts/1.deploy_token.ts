// scripts/1.deploy_box.ts
import { ethers } from "hardhat"
import { upgrades } from "hardhat"
import { readAddressList, storeAddressList } from "./helper";
async function main() {

  const ERC20UpgradableV1 = await ethers.getContractFactory(
    "MyToken"
  );
  console.log("Deploying ERC20UpgradableV1...");
  const contract = await upgrades.deployProxy(ERC20UpgradableV1, ["SushiToken","Sushi"], {
    initializer: "initialize",
    kind: "transparent",
  });
  await contract.deployed();
  console.log("ERC20UpgradableV1 deployed to:", contract.address); 

  const admin = await upgrades.erc1967.getAdminAddress(contract.address);

  const implementation = await upgrades.erc1967.getImplementationAddress(contract.address);

  console.log(implementation," ImplementationAddress")

  console.log(admin," AdminAddress");

  const addressList = readAddressList();

  addressList['proxy'] = contract.address;
  addressList['admin'] = admin;
  addressList['implementation'] = implementation;
  storeAddressList(addressList);
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})