import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("MyToken Test", function () {
  const MINT_AMOUNT = 10;
  const INITIAL_SUPPLY = 0;

  async function deployMyTokenFixture() {
    const [dev, alice] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
    
   
    const  myToken = await upgrades.deployProxy(MyToken, ["SushiToken","Sushi"], {initializer: 'initialize'})
    const  myTokenV2 = await  await upgrades.upgradeProxy(
      myToken.address,
      MyTokenV2
    );
    return { dev, alice, myTokenV2 };
  }


  describe("Mint & Burn", function () {
    it("should be able to add User into the Whitelist", async function () {
      const { myTokenV2, alice, dev } = await loadFixture(deployMyTokenFixture);

      await expect(myTokenV2.connect(dev).addUser(alice.address));


      expect(await myTokenV2.verifyUser(alice.address)).to.equal(true);
    
    });

 
    it("should be not able to mint ", async function () {
      const { myTokenV2, alice, dev } = await loadFixture(deployMyTokenFixture);

      await expect(
        myTokenV2.connect(alice).mint(alice.address, MINT_AMOUNT)
      ).to.be.revertedWith("address is not in whiltelist");
    
    });
   


  });

});
