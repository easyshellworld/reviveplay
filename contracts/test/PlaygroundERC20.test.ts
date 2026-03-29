import { expect } from "chai";
import { ethers } from "hardhat";

describe("PlaygroundERC20", () => {
  it("should deploy PlaygroundERC20 with correct initial parameters", async () => {
    const [deployer] = await ethers.getSigners();
    
    const PlaygroundERC20 = await ethers.getContractFactory("PlaygroundERC20");
    const erc20 = await PlaygroundERC20.deploy(
      "My Test Token",
      "MTT",
      18,
      BigInt(1000000),
      deployer.address
    );
    await erc20.waitForDeployment();

    // Verify token name, symbol, and decimals
    expect(await erc20.name()).to.equal("My Test Token");
    expect(await erc20.symbol()).to.equal("MTT");
    expect(await erc20.decimals()).to.equal(18);

    // Verify initial supply
    const balance = await erc20.balanceOf(deployer.address);
    expect(balance).to.equal(BigInt(1000000) * BigInt(10) ** BigInt(18));

    // Verify owner is deployer
    expect(await erc20.owner()).to.equal(deployer.address);
  });

  it("should allow owner to mint additional tokens", async () => {
    const [deployer, user1] = await ethers.getSigners();
    
    const PlaygroundERC20 = await ethers.getContractFactory("PlaygroundERC20");
    const erc20 = await PlaygroundERC20.deploy(
      "My Test Token",
      "MTT",
      18,
      BigInt(1000000),
      deployer.address
    );
    await erc20.waitForDeployment();

    const initialBalance = await erc20.balanceOf(user1.address);
    const mintAmount = BigInt(1000) * BigInt(10) ** BigInt(18);

    await erc20.mint(user1.address, BigInt(1000));

    const newBalance = await erc20.balanceOf(user1.address);
    expect(newBalance).to.equal(initialBalance + mintAmount);
  });

  it("should not allow non-owner to mint tokens", async () => {
    const [deployer, user1] = await ethers.getSigners();
    
    const PlaygroundERC20 = await ethers.getContractFactory("PlaygroundERC20");
    const erc20 = await PlaygroundERC20.deploy(
      "My Test Token",
      "MTT",
      18,
      BigInt(1000000),
      deployer.address
    );
    await erc20.waitForDeployment();

    await expect(
      erc20.connect(user1).mint(user1.address, BigInt(1000))
    ).to.be.reverted;
  });

  it("should scale minted amounts by the configured decimals", async () => {
    const [deployer, user1] = await ethers.getSigners();

    const PlaygroundERC20 = await ethers.getContractFactory("PlaygroundERC20");
    const erc20 = await PlaygroundERC20.deploy(
      "Zero Decimal Token",
      "ZDT",
      6,
      BigInt(10),
      deployer.address
    );
    await erc20.waitForDeployment();

    await erc20.mint(user1.address, BigInt(25));

    expect(await erc20.balanceOf(user1.address)).to.equal(BigInt(25) * BigInt(10) ** BigInt(6));
  });
});
