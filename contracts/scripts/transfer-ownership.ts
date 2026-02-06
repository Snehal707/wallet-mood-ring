import { ethers } from "hardhat";

/**
 * Transfer contract ownership from old compromised wallet to new wallet
 * 
 * IMPORTANT: This requires the OLD wallet's private key temporarily.
 * After transfer, the old wallet should be considered fully compromised.
 * 
 * Usage:
 * 1. Set OLD_PRIVATE_KEY in .env (temporarily, for this one transaction)
 * 2. Set NEW_OWNER_ADDRESS in .env
 * 3. Run: npx hardhat run scripts/transfer-ownership.ts --network base
 */

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x613AaBFB890632AE2939FA6aEb065a692D4D7A32";
  const newOwnerAddress = process.env.NEW_OWNER_ADDRESS || "0x79FD75a3fC633259aDD60885f927d973d3A3642b";
  const oldPrivateKey = process.env.OLD_PRIVATE_KEY;

  if (!oldPrivateKey) {
    throw new Error("OLD_PRIVATE_KEY not set in .env file");
  }

  console.log("⚠️  WARNING: Using compromised wallet to transfer ownership");
  console.log("Contract Address:", contractAddress);
  console.log("Current Owner (old):", await getCurrentOwner(contractAddress));
  console.log("New Owner:", newOwnerAddress);
  console.log("");

  // Connect with old wallet
  const oldWallet = new ethers.Wallet(oldPrivateKey, ethers.provider);
  console.log("Old Wallet Address:", oldWallet.address);

  // Verify old wallet is the current owner
  const currentOwner = await getCurrentOwner(contractAddress);
  if (oldWallet.address.toLowerCase() !== currentOwner.toLowerCase()) {
    throw new Error(`Old wallet ${oldWallet.address} is not the current owner ${currentOwner}`);
  }

  // Get contract instance
  const MoodBadge = await ethers.getContractFactory("MoodBadge");
  const contract = MoodBadge.attach(contractAddress).connect(oldWallet);

  console.log("\n📝 Transferring ownership...");
  const tx = await contract.transferOwnership(newOwnerAddress);
  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Ownership transferred!");
  console.log("Block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());

  // Verify new owner
  const newOwner = await contract.owner();
  console.log("\n✅ Verification:");
  console.log("New contract owner:", newOwner);
  if (newOwner.toLowerCase() === newOwnerAddress.toLowerCase()) {
    console.log("✅ SUCCESS: Ownership transfer confirmed!");
  } else {
    console.log("❌ ERROR: Ownership transfer failed!");
  }
}

async function getCurrentOwner(contractAddress: string): Promise<string> {
  const MoodBadge = await ethers.getContractFactory("MoodBadge");
  const contract = MoodBadge.attach(contractAddress);
  return await contract.owner();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
