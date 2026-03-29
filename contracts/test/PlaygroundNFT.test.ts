import { expect } from "chai";
import { ethers } from "hardhat";

describe("PlaygroundNFT", () => {
  it("should deploy PlaygroundNFT with correct parameters", async () => {
    const [deployer] = await ethers.getSigners();
    
    const PlaygroundNFT = await ethers.getContractFactory("PlaygroundNFT");
    const nftContract = await PlaygroundNFT.deploy(deployer.address);
    await nftContract.waitForDeployment();

    expect(await nftContract.name()).to.equal(
      "Polkadot Revive Playground Graduate"
    );
    expect(await nftContract.symbol()).to.equal("PRPG");
    expect(await nftContract.owner()).to.equal(deployer.address);
    expect(await nftContract.maxPerWallet()).to.equal(5);
  });

  it("should allow minting NFTs", async () => {
    const [deployer, user1] = await ethers.getSigners();
    
    const PlaygroundNFT = await ethers.getContractFactory("PlaygroundNFT");
    const nftContract = await PlaygroundNFT.deploy(deployer.address);
    await nftContract.waitForDeployment();

    const tokenURI = "data:application/json;base64,eyJuYW1lIjoiVGVzdCBORlQiLCJkZXNjcmlwdGlvbiI6IkRlc2NyaXB0aW9uIiwiaW1hZ2UiOiJodHRwczovL2V4YW1wbGUuY29tL2ltYWdlLnBuZyJ9";

    await nftContract.safeMint(user1.address, tokenURI);

    // Verify NFT is minted
    const tokenId = 1;
    expect(await nftContract.ownerOf(tokenId)).to.equal(
      user1.address
    );
    expect(await nftContract.tokenURI(tokenId)).to.equal(tokenURI);
    expect(await nftContract.totalMinted()).to.equal(1);
  });

  it("should prevent minting more than maxPerWallet NFTs", async () => {
    const [deployer, user1] = await ethers.getSigners();
    
    const PlaygroundNFT = await ethers.getContractFactory("PlaygroundNFT");
    const nftContract = await PlaygroundNFT.deploy(deployer.address);
    await nftContract.waitForDeployment();

    const tokenURI = "data:application/json;base64,eyJuYW1lIjoiVGVzdCBORlQiLCJkZXNjcmlwdGlvbiI6IkRlc2NyaXB0aW9uIiwiaW1hZ2UiOiJodHRwczovL2V4YW1wbGUuY29tL2ltYWdlLnBuZyJ9";

    // Mint max allowed NFTs
    for (let i = 0; i < 5; i++) {
      await nftContract.safeMint(user1.address, tokenURI);
    }

    // Try to mint one more
    await expect(
      nftContract.safeMint(user1.address, tokenURI)
    ).to.be.reverted;
  });

  it("should increment nextTokenId and allow open minting to another recipient", async () => {
    const [deployer, user1, user2] = await ethers.getSigners();

    const PlaygroundNFT = await ethers.getContractFactory("PlaygroundNFT");
    const nftContract = await PlaygroundNFT.deploy(deployer.address);
    await nftContract.waitForDeployment();

    expect(await nftContract.nextTokenId()).to.equal(1);

    await nftContract.connect(user1).safeMint(user2.address, "data:application/json;base64,eyJuYW1lIjoib3Blbi1taW50In0=");

    expect(await nftContract.ownerOf(1)).to.equal(user2.address);
    expect(await nftContract.nextTokenId()).to.equal(2);
    expect(await nftContract.mintedPerWallet(user1.address)).to.equal(1);
  });

  it("should allow the owner to update maxPerWallet", async () => {
    const [deployer] = await ethers.getSigners();

    const PlaygroundNFT = await ethers.getContractFactory("PlaygroundNFT");
    const nftContract = await PlaygroundNFT.deploy(deployer.address);
    await nftContract.waitForDeployment();

    await nftContract.setMaxPerWallet(2);

    expect(await nftContract.maxPerWallet()).to.equal(2);
  });
});
