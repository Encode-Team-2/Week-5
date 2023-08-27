import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useBet } from "@/hooks/useBets";

const Bets = () => {
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [times, setTimes] = useState(1);

  return <div>Bets</div>;
};

export default Bets;
