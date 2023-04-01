const { ethers, upgrades } = require("hardhat");
import { readAddressList, storeAddressList } from "./helper";


async function main() {

  const addressList = readAddressList();
  const MyTokenV2 = await ethers.getContractFactory(
    "MyTokenV2"
  );
  console.log("Upgrading MyTokenV2...");
  const contract =  await upgrades.upgradeProxy(
    addressList.proxy,
    MyTokenV2
  );

  await contract.deployed();

  const admin = await upgrades.erc1967.getAdminAddress(contract.address);

  const implementation = await upgrades.erc1967.getImplementationAddress(contract.address);

  console.log(implementation," ImplementationAddress")

  console.log(admin," AdminAddress");

  
  addressList['proxyV2'] = contract.address;
  addressList['adminV2'] = admin;
  addressList['implementationV2'] = implementation;
  storeAddressList(addressList);
  console.log("Upgraded Successfully");
}

main();