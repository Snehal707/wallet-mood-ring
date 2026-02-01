import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");
  
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  if (!deployer) {
    throw new Error("No deployer found. Check your private key in .env");
  }

  console.log("Deploying MoodBadge with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("\n⚠️  WARNING: Account has 0 ETH!");
    console.error("Get Base Sepolia ETH from: https://faucet.quicknode.com/base/sepolia");
    process.exit(1);
  }

  console.log("\nDeploying contract...");
  const MoodBadge = await ethers.getContractFactory("MoodBadge");
  const moodBadge = await MoodBadge.deploy(deployer.address);

  console.log("Waiting for deployment confirmation...");
  await moodBadge.waitForDeployment();

  const address = await moodBadge.getAddress();
  
  console.log("\n✅ SUCCESS!");
  console.log("=====================================");
  console.log("MoodBadge deployed to:", address);
  console.log("=====================================");
  console.log("\nNext steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add to your main .env.local file:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("3. Restart your dev server: npm run dev");
  console.log("=====================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
