import { ethers } from "ethers";
import { LotteryToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("10000");
const TOKEN_ADDRESS = "0x23a1b07200f9972cc0f5a4e40bb591ed37866172";
const DEMUR_ADDRESS = "0x2dc7709B7af83c61c82cbd2555DCda60ec481c29";

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
  const tokenContract = lotteryTokenFactory.attach(TOKEN_ADDRESS);

  const mintTx = await tokenContract.mint(DEMUR_ADDRESS, MINT_VALUE);
  await mintTx.wait();

  console.log("Minted 10000 tokens to", DEMUR_ADDRESS);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
