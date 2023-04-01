import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("MyToken Test", function () {
  const MINT_AMOUNT = 10;
  const INITIAL_SUPPLY = 0;

  async function deployMyTokenFixture() {
    const [dev, alice] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
   
    const  myToken = await upgrades.deployProxy(MyToken, ["SushiToken","Sushi"], {initializer: 'initialize'})

    return { dev, alice, myToken };
  }

  async function mintAliceFixture() {
    const { dev, alice, myToken } = await loadFixture(deployMyTokenFixture);
    await myToken.connect(dev).mint(alice.address,MINT_AMOUNT);

    return { dev, alice, myToken };
  }

  describe("Deployment", function () {
    it("should have the correct name and symbol", async function () {
      const { myToken } = await loadFixture(deployMyTokenFixture);

      expect(await myToken.name()).to.equal("SushiToken");
      expect(await myToken.symbol()).to.equal("Sushi");
    });

    it("should have the correct owner after deployment", async function () {
      const { myToken, dev } = await loadFixture(deployMyTokenFixture);

      expect(await myToken.owner()).to.equal(dev.address);
    });

    it("should be able to mint the initial supply to owner", async function () {
      const { myToken, dev } = await loadFixture(deployMyTokenFixture);

      expect(await myToken.balanceOf(dev.address)).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("Mint & Burn", function () {
    it("should be able to mint a token", async function () {
      const { myToken, alice } = await loadFixture(deployMyTokenFixture);

      await expect(myToken.connect(alice).mint(alice.address, MINT_AMOUNT))
        .to.emit(myToken, "Mint")
        .withArgs(alice.address, MINT_AMOUNT)
        .to.emit(myToken, "Transfer")
        .withArgs(ethers.constants.AddressZero, alice.address, MINT_AMOUNT);


      expect(await myToken.balanceOf(alice.address)).to.equal(MINT_AMOUNT);
      expect(await myToken.totalSupply()).to.equal(
        INITIAL_SUPPLY + MINT_AMOUNT
      );
    });

 

    it("should be able to burn a token by the owner", async function () {
      const { myToken, dev } = await loadFixture(deployMyTokenFixture);

      //console.log("myToken ===========", myToken);

      await myToken.connect(dev).mint(dev.address, MINT_AMOUNT);
      await myToken.connect(dev).burn( MINT_AMOUNT);;

      expect(await myToken.balanceOf(dev.address)).to.equal(0);
     
    });


  });

  describe("Transfer", function () {
    it("should be able to transfer", async function () {

      const { myToken, dev, alice } = await loadFixture(mintAliceFixture);
  
      await myToken.connect(dev).mint(dev.address, MINT_AMOUNT);
      await myToken.connect(dev).transfer(alice.address, MINT_AMOUNT);
      expect(await myToken.balanceOf(dev.address)).to.equal(0);
     
    });
  });
});
