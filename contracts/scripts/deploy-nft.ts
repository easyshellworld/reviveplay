import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PlaygroundNFT to Polkadot Hub TestNet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from address:", await deployer.getAddress());

  const PlaygroundNFT = await ethers.getContractFactory("PlaygroundNFT");
  const nftContract = await PlaygroundNFT.deploy(
    await deployer.getAddress(),
  );

  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();

  console.log("PlaygroundNFT deployed to:", nftAddress);

  console.log("\n✅ NFT contract deployment complete!");
  console.log("NFT Address:", nftAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
