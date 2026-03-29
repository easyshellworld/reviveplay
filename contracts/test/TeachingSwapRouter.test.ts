import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, parseUnits } from "viem";

describe("TeachingSwapRouter", () => {
  it("should deploy with correct initial rate", async () => {
    const [deployer] = await ethers.getSigners();
    
    const TeachingSwapRouter = await ethers.getContractFactory("TeachingSwapRouter");
    const swapRouter = await TeachingSwapRouter.deploy(
      deployer.address,
      BigInt(1000)
    );
    await swapRouter.waitForDeployment();

    expect(await swapRouter.rate()).to.equal(BigInt(1000));
    expect(await swapRouter.owner()).to.equal(deployer.address);
  });

  it("should allow owner to update rate", async () => {
    const [deployer] = await ethers.getSigners();
    
    const TeachingSwapRouter = await ethers.getContractFactory("TeachingSwapRouter");
    const swapRouter = await TeachingSwapRouter.deploy(
      deployer.address,
      BigInt(1000)
    );
    await swapRouter.waitForDeployment();

    const newRate = BigInt(2000);
    await swapRouter.setRate(newRate);

    expect(await swapRouter.rate()).to.equal(newRate);
  });

  it("should reject a zero rate update", async () => {
    const [deployer] = await ethers.getSigners();

    const TeachingSwapRouter = await ethers.getContractFactory("TeachingSwapRouter");
    const swapRouter = await TeachingSwapRouter.deploy(
      deployer.address,
      BigInt(1000)
    );
    await swapRouter.waitForDeployment();

    await expect(swapRouter.setRate(0)).to.be.reverted;
  });

  it("should allow swapping tokens", async () => {
    const [deployer, user1] = await ethers.getSigners();

    // Deploy test ERC20
    const PlaygroundERC20 = await ethers.getContractFactory("PlaygroundERC20");
    const testToken = await PlaygroundERC20.deploy(
      "Test Token",
      "TT",
      18,
      parseUnits("1000000", 18),
      user1.address
    );
    await testToken.waitForDeployment();

    // Deploy swap router with initial liquidity
    const TeachingSwapRouter = await ethers.getContractFactory("TeachingSwapRouter");
    const swapRouter = await TeachingSwapRouter.deploy(
      deployer.address,
      BigInt(1000)
    );
    await swapRouter.waitForDeployment();

    // Send initial liquidity to swap router
    await deployer.sendTransaction({
      to: await swapRouter.getAddress(),
      value: parseEther("10"),
    });

    // Approve tokens to swap router
    const amountIn = parseUnits("1000", 18);
    await testToken.connect(user1).approve(
      await swapRouter.getAddress(),
      amountIn
    );

    // Execute swap
    await swapRouter.connect(user1).swap(
      await testToken.getAddress(),
      amountIn
    );
  });

  it("should reject swaps when PAS liquidity is insufficient", async () => {
    const [deployer, user1] = await ethers.getSigners();

    const PlaygroundERC20 = await ethers.getContractFactory("PlaygroundERC20");
    const testToken = await PlaygroundERC20.deploy(
      "Test Token",
      "TT",
      18,
      BigInt(1000),
      user1.address
    );
    await testToken.waitForDeployment();

    const TeachingSwapRouter = await ethers.getContractFactory("TeachingSwapRouter");
    const swapRouter = await TeachingSwapRouter.deploy(
      deployer.address,
      BigInt(1000)
    );
    await swapRouter.waitForDeployment();

    const amountIn = parseUnits("1000", 18);
    await testToken.connect(user1).approve(
      await swapRouter.getAddress(),
      amountIn
    );

    await expect(
      swapRouter.connect(user1).swap(await testToken.getAddress(), amountIn)
    ).to.be.reverted;
  });
});
