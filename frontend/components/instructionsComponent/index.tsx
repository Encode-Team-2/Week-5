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
      <br />
      <LotteryInfo></LotteryInfo>
      <br />
      <LotteryOwnerPanel></LotteryOwnerPanel>
      <br />
      <PlayerPannel></PlayerPannel>
      <br />
      <ReturnTokens></ReturnTokens>
    </div>
  );
}

function LotteryInfo() {
  return (
    <div>
      <LotteryStatus></LotteryStatus>
      <BetsClosingTime></BetsClosingTime>
      <LotteryTokenPurchaseRatio></LotteryTokenPurchaseRatio>
      <LotteryBetPrice></LotteryBetPrice>
      <LotteryBetFee></LotteryBetFee>
      <PrizePool></PrizePool>
      <Winners></Winners>
    </div>
  );
}

function PlayerPannel() {
  return (
    <div>
      <BuyTokens></BuyTokens>
      <ApproveBet></ApproveBet>
      <Bet></Bet>
      <BetMany></BetMany>
      <PrizeWithdraw></PrizeWithdraw>
    </div>
  );
}

function LotteryOwnerPanel() {
  return (
    <div>
      <OpenBets></OpenBets>
      <CloseLottery></CloseLottery>
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
    address: TOKEN_ADDRESS,
    abi: TOKEN_JSON.abi,
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

function BuyTokens() {
  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "purchaseTokens",
  });

  if (isLoading) return <div>{CONFIRM_TRANSACTION_MESSAGE}</div>;
  if (isSuccess)
    return <div>View TX on Etherscan: 👉 {etherscanUrl(data!.hash)}</div>;
  if (error) <div>Error Minting: {JSON.stringify(error)}</div>;
  // TODO allow input amount of tokens
  return (
    <div>
      <button
        disabled={!write}
        onClick={() => {
          write({
            value: MINT_VALUE,
          });
        }}
      >
        BuyLottery {ethers.formatEther(MINT_VALUE.toString())} Token
      </button>
    </div>
  );
}

function LotteryStatus() {
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

function LotteryTokenPurchaseRatio() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "purchaseRatio",
  });

  if (isLoading) return <div>Fetching purchaseRatio....</div>;
  if (isError) return <div>Error fetching purchaseRatio</div>;

  if (data) return <div>PurchaseRatio 1 ETH - {data.toString()} LTK</div>;
  if (!data) return <div>Error</div>;
}

function LotteryBetPrice() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "betPrice",
  });

  if (isLoading) return <div>Fetching betPrice....</div>;
  if (isError) return <div>Error fetching betPrice</div>;

  if (data)
    return <div>BetPrice {ethers.formatEther(data.toString())} LTK</div>;
  if (!data) return <div>Error</div>;
}

function LotteryBetFee() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "betFee",
  });

  if (isLoading) return <div>Fetching betFee....</div>;
  if (isError) return <div>Error fetching betFee</div>;

  if (data) return <div>BetFee {ethers.formatEther(data.toString())} LTK</div>;
  if (!data) return <div>Error</div>;
}

function PrizePool() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "prizePool",
  });

  if (isLoading) return <div>Fetching prizePool....</div>;
  if (isError) return <div>Error fetching prizePool</div>;

  if (data)
    return <div>PrizePool {ethers.formatEther(data.toString())} LTK</div>;
  if (!data) return <div>PrizePool 0LTK</div>;
}

function Winners() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "prize",
  });

  if (isLoading) return <div>Fetching prize....</div>;
  if (isError) return <div>Error fetching winners</div>;

  if (data) return <div>Winners: {data.toString()}</div>;
  if (!data) return <div>No Winners</div>;
}

function OpenBets() {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  // TODO allow user to input duration
  const betsOpenDurationSeconds = 5 * 60; // 20 min
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
      {isSuccess && (
        <div>View TX on Etherscan: 👉 : {etherscanUrl(data!.hash)}</div>
      )}
      {error && <div>Error: {JSON.stringify(error.message)}</div>}
    </div>
  );
}

function ApproveBet() {
  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: TOKEN_ADDRESS,
    abi: TOKEN_JSON.abi,
    functionName: "approve",
  });

  return (
    <div>
      <button
        disabled={!write}
        onClick={() => {
          write({
            args: [LOTTERY_ADDRESS, ethers.MaxUint256],
          });
        }}
      >
        Approve a Bet
      </button>
      {isLoading && <div>{CONFIRM_TRANSACTION_MESSAGE}</div>}
      {isSuccess && (
        <div>View TX on Etherscan: 👉 {etherscanUrl(data!.hash)}</div>
      )}
      {error && <div>Error Approving Bet: {JSON.stringify(error.message)}</div>}
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
        Place a Bet
      </button>
      {isLoading && <div>{CONFIRM_TRANSACTION_MESSAGE}</div>}
      {isSuccess && (
        <div>View TX on Etherscan: 👉 {etherscanUrl(data!.hash)}</div>
      )}
      {error && <div>Error Placing Bet: {JSON.stringify(error.message)}</div>}
    </div>
  );
}

function BetMany() {
  const [amount, setAmount] = useState(0);
  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "betMany",
  });

  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
        placeholder="How many times to bet?"
      />
      <button
        disabled={!write}
        onClick={() => {
          write({
            args: [amount],
          });
        }}
      >
        Place Many Bet
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

function BetsClosingTime() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "betsClosingTime",
  });

  const timestamp = data ? parseInt(data.toString()) * 1000 : null; // Convert to milliseconds
  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString()
    : "N/A";

  return (
    <div>
      {isLoading && <div>Fetching betsClosingTime....</div>}
      {!isLoading && (
        <div>
          Bet Closing Time: {isError ? "Error fetching" : formattedDate}
        </div>
      )}
    </div>
  );
}

function CloseLottery() {
  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "closeLottery",
  });

  return (
    <div>
      <button disabled={!write} onClick={() => write()}>
        Close Lottery
      </button>
      {isLoading && <div>{CONFIRM_TRANSACTION_MESSAGE}</div>}
      {isSuccess && (
        <div>View TX on Etherscan: 👉 {etherscanUrl(data!.hash)}</div>
      )}
      {error && (
        <div>Error Closing Lottery: {JSON.stringify(error.message)}</div>
      )}
    </div>
  );
}

function PrizeWithdraw() {
  const [amount, setAmount] = useState(0);
  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "prizeWithdraw",
  });

  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
        placeholder="Enter amount to withdraw"
      />

      <button
        disabled={!write}
        onClick={() => {
          write({
            args: [amount],
          });
        }}
      >
        Withdraw
      </button>

      {isLoading && <div>{CONFIRM_TRANSACTION_MESSAGE}</div>}
      {isSuccess && (
        <div>View TX on Etherscan: 👉 {etherscanUrl(data!.hash)}</div>
      )}
      {error && <div>Error Withdrawing: {JSON.stringify(error.message)}</div>}
    </div>
  );
}

function ReturnTokens() {
  const [amount, setAmount] = useState(0);
  const { data, isLoading, isSuccess, write, error } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LOTTERY_JSON.abi,
    functionName: "returnTokens",
  });

  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
        placeholder="Enter token amount to return"
      />

      <button
        disabled={!write}
        onClick={() => {
          write({
            args: [amount],
          });
        }}
      >
        Return Tokens
      </button>

      {isLoading && <div>{CONFIRM_TRANSACTION_MESSAGE}</div>}
      {isSuccess && (
        <div>View TX on Etherscan: 👉 {etherscanUrl(data!.hash)}</div>
      )}
      {error && <div>Error returning: {JSON.stringify(error.message)}</div>}
    </div>
  );
}
