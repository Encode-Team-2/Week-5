"use client";
import InstructionsComponent from "@/components/instructionsComponent";
import styles from "./page.module.css";
import Bets from "@/components/bets";
import "./globals.css";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* <Bets></Bets> */}
      <InstructionsComponent></InstructionsComponent>
    </main>
  );
}
