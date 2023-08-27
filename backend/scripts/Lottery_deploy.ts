import { ethers } from "ethers";
import { Lottery__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  const factory = require("node-factories");
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`\nWallet balance ${balance}.`);
  if (balance < 0.01) {
    throw new Error("Not enough ether.");
  }
  const lotteryFactory = new Lottery__factory(wallet);
  const lotteryContract = await lotteryFactory.deploy(
    "LotteryToken",
    "LOT",
    1000,
    10,
    1
  );
  await lotteryContract.waitForDeployment();
  const address = await lotteryContract.getAddress();
  console.log(`\nVoting Token contract deployed to the address ${address}.`);
  console.log(`Wallet balance ${balance}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
