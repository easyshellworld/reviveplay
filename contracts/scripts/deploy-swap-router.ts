import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TeachingSwapRouter to Polkadot Hub TestNet...");

  // Deploy TeachingSwapRouter with initial rate of 1000 (1000 token = 1 PAS)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from address:", await deployer.getAddress());

  const TeachingSwapRouter = await ethers.getContractFactory("TeachingSwapRouter");
  const swapRouter = await TeachingSwapRouter.deploy(
    await deployer.getAddress(),
    BigInt(1000),
  );

  await swapRouter.waitForDeployment();
  const swapAddress = await swapRouter.getAddress();

  console.log("TeachingSwapRouter deployed to:", swapAddress);

  // Send 5000 PAS to the swap router as initial liquidity (method 2: after deployment but automatic)
  console.log("Sending initial liquidity (5000 PAS) to swap router...");
  const tx = await deployer.sendTransaction({
    to: swapAddress,
    value: ethers.parseEther("5000"),
  });

  await tx.wait();
  console.log("Liquidity added:", tx.hash);

  console.log("\n✅ Swap Router deployment complete!");
  console.log("Swap Router Address:", swapAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
