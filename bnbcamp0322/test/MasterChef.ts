import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MasterChef Test", function () {
  const MINT_AMOUNT = 10;
  const INITIAL_SUPPLY = 100;

  async function deployMyTokenFixture() {
    const [dev, alice] = await ethers.getSigners();

    const SushiToken = await ethers.getContractFactory("MyToken");
    const sushiToken = await SushiToken.deploy("SushiToken","Sushi");

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.connect(dev).deploy("MyToken","MYT");


    const MasterChef = await ethers.getContractFactory("MasterChef");
    const masterChef = await MasterChef.connect(dev).deploy(sushiToken.address);

    return { dev, alice, myToken, sushiToken, masterChef };
  }

  async function mintAliceFixture() {
    const { dev, alice, myToken, sushiToken, masterChef } = await loadFixture(deployMyTokenFixture);
    await myToken.connect(dev).mint(alice.address, 1000);
    await myToken.connect(alice).increaseAllowance(masterChef.address,1000);
    await sushiToken.connect(dev).transferOwnership(masterChef.address);

    return { dev, alice, myToken, sushiToken, masterChef  };
  }

  describe("Deployment", function () {
    it("should have the correct name and symbol", async function () {
      const { myToken, sushiToken } = await loadFixture(deployMyTokenFixture);

       expect(await sushiToken.name()).to.equal("SushiToken");
       expect(await sushiToken.symbol()).to.equal("Sushi");

      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MYT");
    });

    it("should have the correct owner after deployment", async function () {
      const { myToken, dev, sushiToken, masterChef } = await loadFixture(deployMyTokenFixture);
      await sushiToken.connect(dev).transferOwnership(masterChef.address)

      expect(await sushiToken.owner()).to.equal(masterChef.address);
    });

    it("should be able to mint the initial supply to owner", async function () {
      const { myToken, dev  } = await loadFixture(deployMyTokenFixture);

      expect(await myToken.balanceOf(dev.address)).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("Staking", function () {

    it("add myToken", async function () {
      const { myToken, dev, sushiToken, masterChef } = await loadFixture(mintAliceFixture);
 
      await expect(masterChef.add(myToken.address))
      .to.emit(masterChef, "Add")
      .withArgs(myToken.address,0 )
   
    });

     it("deposit", async function () {
       const { myToken, dev , masterChef , alice } = await loadFixture(mintAliceFixture);
       await masterChef.add(myToken.address)
    await expect(masterChef.connect(alice).deposit(0, 10))
        .to.emit(masterChef, "Deposit")
        .withArgs(alice.address,0 , 10);
     });


     it("withdraw", async function () {
        const { myToken, dev , masterChef , alice } = await loadFixture(mintAliceFixture);
        await masterChef.add(myToken.address);
        await masterChef.connect(alice).deposit(0, 10);
         await expect(masterChef.connect(alice).withdraw(0, 10))
         .to.emit(masterChef, "Withdraw")
         .withArgs(alice.address,0 , 10);
      });

      it("withdraw failed", async function () {
        const { myToken, dev , masterChef , alice } = await loadFixture(mintAliceFixture);
        await masterChef.add(myToken.address);
        await masterChef.connect(alice).deposit(0, 10);
         await expect(masterChef.connect(alice).withdraw(0, 100))
         .to.be.revertedWith("withdraw: not good");
      });

      it("reward before staking", async function () {
        const {  alice, sushiToken } = await loadFixture(mintAliceFixture);

        expect(await sushiToken.balanceOf(alice.address)).to.equal(0);
   
      });


      it("reward after staking", async function () {
        const { myToken,  masterChef , alice, sushiToken } = await loadFixture(mintAliceFixture);
        await masterChef.add(myToken.address);
        await masterChef.connect(alice).deposit(0, 10);
        await masterChef.connect(alice).deposit(0, 10)
        await masterChef.connect(alice).withdraw(0, 10);
        expect(await sushiToken.balanceOf(alice.address)).to.equal(2000);
   
      });
  });


});
