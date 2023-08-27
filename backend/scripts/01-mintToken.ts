import { ethers } from "ethers";
import { Lottery, LotteryToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("10000");
const TOKEN_ADDRESS = "0x23a1b07200f9972cc0f5a4e40bb591ed37866172";
const DEMUR_ADDRESS = "0x2dc7709B7af83c61c82cbd2555DCda60ec481c29";
const HAZ_ADDRESS = "0x6FC5113b55771b884880785042e78521B8b719fa";

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const signer = wallet.connect(provider);

  const lotteryTokenFactory = new LotteryToken__factory(signer);
  const tokenContract = lotteryTokenFactory.attach(TOKEN_ADDRESS) as Lottery;

  const mintTx = await tokenContract.mint(HAZ_ADDRESS, MINT_VALUE);
  await mintTx.wait();

  const transferTx = await tokenContract.transfer(DEMUR_ADDRESS, MINT_VALUE);
  await transferTx.wait();

  console.log("Minted 10000 tokens to", HAZ_ADDRESS);
  console.log("Transferred 10000 tokens to", DEMUR_ADDRESS);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
