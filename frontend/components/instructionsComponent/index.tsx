import { useAccount, useContractRead, useNetwork } from "wagmi";
import styles from "./instructionsComponent.module.css";

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
    address: "0x23A1B07200F9972CC0F5A4e40bb591eD37866172", // TODO fetch from env
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

  const balance = typeof data === "number" ? data : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div>Balance: {balance}</div>;
}
