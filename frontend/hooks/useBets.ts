import { useEffect, useState } from "react";
import { useContractRead, useContractWrite, useNetwork } from "wagmi";
import { waitForTransaction, readContract } from "@wagmi/core";

import TOKEN from "../artifacts/LotteryToken.json";
import LOTTERY from "../artifacts/Lottery.json";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const LOTTERY_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS;

export const useBet = (address?: string) => {
  const [betPrice, setBetPrice] = useState<bigint>();
  const [betFee, setBetFee] = useState<bigint>();

  const { chain } = useNetwork();

  const bet = useContractWrite({
    address: LOTTERY_ADDRESS as `0x${string}`,
    abi: LOTTERY.abi,
    functionName: "bet",
  });

  const betMany = useContractWrite({
    address: LOTTERY_ADDRESS as `0x${string}`,
    abi: LOTTERY.abi,
    functionName: "betMany",
  });

  const betPriceData = useContractRead({
    address: LOTTERY_ADDRESS as `0x${string}`,
    abi: LOTTERY.abi,
    functionName: "betPrice",
    args: [],
  });

  const betFeeData = useContractRead({
    address: LOTTERY_ADDRESS as `0x${string}`,
    abi: LOTTERY.abi,
    functionName: "betFee",
    args: [],
  });

  const approve = useContractWrite({
    address: TOKEN_ADDRESS as `0x${string}`,
    abi: TOKEN.abi,
    functionName: "approve",
    args: [LOTTERY_ADDRESS, (betFee ?? BigInt(0)) + (betPrice ?? BigInt(0))],
  });

  useEffect(() => {
    if (betPriceData) {
      setBetPrice(betPriceData.data as bigint);
    }

    if (betFeeData) {
      setBetFee(betFeeData.data as bigint);
    }
  }, [betPriceData, betFeeData]);

  return {
    bet,
    betMany,
    betPrice,
    betFee,
    approve,
  };
};
