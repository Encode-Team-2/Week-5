import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
} from "wagmi";
import styles from "./instructionsComponent.module.css";
import { ethers } from "ethers";

import TOKEN_JSON from "../../assets/LotteryToken.json";
import LOTTERY_JSON from "../../assets/Lottery.json";
import { useState } from "react";

const TOKEN_ADDRESS = "0x23A1B07200F9972CC0F5A4e40bb591eD37866172";
const LOTTERY_ADDRESS = "0x56DdBb08d92eeE9812d7C4eae696268d6781EEa1";
const MINT_VALUE = ethers.parseUnits("1");
const CONFIRM_TRANSACTION_MESSAGE = "Confirm Transaction in your Wallet";

export default function InstructionsComponent() {
  return (
    <div className={styles.container}>
      <div className={styles.get_started}>
        <PageBody></PageBody>
      </div>
    </div>
  );
}

function PageBody() {
  return (
    <div>
      <WalletInfo></WalletInfo>
      <BetsOpen></BetsOpen>
      <OpenBets></OpenBets>
      <Bet></Bet>
      <GetRandomNumber></GetRandomNumber>
      <BetsClosingTime></BetsClosingTime>
    </div>
  );
}

function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  if (address)
    return (
      <div>
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <TokenSymbol></TokenSymbol>
        <TokenBalance address={address}></TokenBalance>
        <Mint address={address}></Mint>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS, // TODO fetch from env
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [params.address],
  });

  const balance = typeof data === "bigint" ? data.toString() : "0";
  const balanceInETH = ethers.formatEther(balance);

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div>Balance: {balanceInETH}</div>;
}

function TokenSymbol() {
  const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: TOKEN_JSON.abi,
    functionName: "symbol",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <p>Fetching name…</p>;
  if (isError) return <p>Error fetching name.</p>;
  return (
    <p>
      Token symbol: <b>{name}</b>
    </p>
  );
}

function Mint(params: { address: `0x${string}` }) {
  const [toAddress, setToAddress] = useState("0x");

  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: TOKEN_ADDRESS,
    abi: TOKEN_JSON.abi,
    functionName: "mint",
  });

  if (isLoading) return <div>{CONFIRM_TRANSACTION_MESSAGE}</div>;
  if (isSuccess)
    return <div>View TX on Etherscan: 👉 {etherscanUrl(data!.hash)}</div>;
  if (error) <div>Error Minting: {JSON.stringify(error)}</div>;

  return (
    <div>
      <input
        type="text"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="Enter address to mint to"
      />

      <button
        disabled={!write}
        onClick={() => {
          setToAddress(params.address);
        }}
      >
        Choose connected address
      </button>

      <button
        disabled={!write}
        onClick={() => {
          write({
            args: [toAddress, MINT_VALUE],
          });
        }}
      >
        Mint {MINT_VALUE.toString()} Lottery Tokens
      </button>
    </div>
  );
}

function BetsOpen() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "betsOpen",
  });

  if (isLoading) return <div>Fetching betsOpen....</div>;
  if (isError) return <div>Error fetching betsOpen</div>;

  if (data) return <div>Bets are open</div>;
  if (!data) return <div>Bets are closed</div>;
}

function OpenBets() {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const betsOpenDurationSeconds = 20 * 60; // 20 min
  const closingTime = currentTimestamp + betsOpenDurationSeconds;

  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "openBets",
  });

  return (
    <div>
      <button
        disabled={!write || isLoading}
        onClick={() => {
          write({
            args: [closingTime],
          });
        }}
      >
        OpenBets
      </button>

      {isLoading && <div>{CONFIRM_TRANSACTION_MESSAGE}</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      {error && <div>Error: {JSON.stringify(error.message)}</div>}
    </div>
  );
}

function Bet() {
  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "bet",
  });

  return (
    <div>
      <button disabled={!write} onClick={() => write()}>
        Place Bet
      </button>
      {isLoading && <div>{CONFIRM_TRANSACTION_MESSAGE}</div>}
      {isSuccess && <div>Bet Placed! TX: {etherscanUrl(data!.hash)}</div>}
      {error && <div>Error Placing Bet: {JSON.stringify(error.message)}</div>}
    </div>
  );
}

function etherscanUrl(hash: string) {
  return <a href={`https://sepolia.etherscan.io/tx/${hash}`}>{hash}</a>;
}

function GetRandomNumber() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "getRandomNumber",
  });

  const randomNumber =
    typeof data === "bigint" ? (data as any).toString() : "N/A";

  if (isLoading) return <div>Fetching RandomNumber....</div>;
  if (isError) return <div>Error fetching RandomNumber</div>;
  return <div>Random Number: {randomNumber}</div>;
}

function BetsClosingTime() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "betsClosingTime",
  });

  const displayValue = isError
    ? "Error fetching"
    : isLoading
    ? "Fetching"
    : data?.toString() || "N/A";

  return (
    <div>
      {isLoading && <div>{displayValue} betsClosingTime....</div>}
      {!isLoading && <div>Bet Closing Time: {displayValue}</div>}
    </div>
  );
}
