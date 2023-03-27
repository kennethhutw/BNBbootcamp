import { ethers, network } from "hardhat";
import { storeMyTokenAddress, 
  storeSushiTokenAddress,
  storeMasterChefAddress} from "./helper";

async function main() {
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy("MyToken","MYT");

  const SushiToken = await ethers.getContractFactory("MyToken");
  const sushiToken = await SushiToken.deploy("SushiToken","Sushi");

  await myToken.deployed();
  await sushiToken.deployed();

  console.log(
    "Deployed MyToken on",
    network.name,
    "by",
    myToken.deployTransaction.from
  );
  console.log(`Deployed MyToken to: ${myToken.address}`);
  console.log(`MyToken Transaction hash: ${myToken.deployTransaction.hash}`);

  console.log(`Deployed SushiToken to: ${sushiToken.address}`);
  console.log(`SushiToken Transaction hash: ${sushiToken.deployTransaction.hash}`);

  const MasterChef = await ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(sushiToken.address);

  await masterChef.deployed();

  console.log(`Deployed SushiToken to: ${masterChef.address}`);
  console.log(`SushiToken Transaction hash: ${masterChef.deployTransaction.hash}`);

  storeMyTokenAddress(network.name, myToken.address);
  storeSushiTokenAddress(network.name, sushiToken.address);

  storeMasterChefAddress(network.name, masterChef.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
