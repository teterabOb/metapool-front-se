"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [montoDeposito, setMontoDeposito] = useState<string | bigint>("");
  const [montoWithdraw, setMontoWithdraw] = useState<string | bigint>("");

  const { writeContractAsync: writeStaking } = useScaffoldWriteContract("Staking");
  const { writeContractAsync: writeLiquidityUnstake } = useScaffoldWriteContract("LiquidUnstakePool");
  const { writeContractAsync: writeWithdrawal } = useScaffoldWriteContract("Withdrawal");

  const stake = async () => {
    try {
      await writeStaking({
        functionName: "depositETH",
        args: [connectedAddress],
        value: BigInt(montoDeposito),
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const stakeLiquidUnstakePool = async () => {
    try {
      await writeLiquidityUnstake({
        functionName: "depositETH",
        args: [connectedAddress],
        value: BigInt(montoDeposito),
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const withdrawLiquidityUnstake = async () => {
    try {
      await writeLiquidityUnstake({
        functionName: "withdraw",
        args: [BigInt(montoWithdraw), connectedAddress, connectedAddress],
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };
  const requestDelayedUnstake = async () => {
    try {
      await writeStaking({
        functionName: "withdraw",
        args: [BigInt(montoWithdraw), connectedAddress, connectedAddress],
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const completeWithdraw = async () => {
    try {
      await writeWithdrawal({
        functionName: "completeWithdraw",
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  // Getting deposito minimo
  const { data: pendingWithdraws } = useScaffoldReadContract({
    contractName: "Withdrawal",
    functionName: "pendingWithdraws",
    args: [connectedAddress],
  });

  // Getting deposito minimo
  const { data: minDeposit } = useScaffoldReadContract({
    contractName: "Staking",
    functionName: "MIN_DEPOSIT",
  });

  // Obteniendo total depositado en Stake
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "Staking",
    functionName: "totalSupply",
  });

  // Obteniendo total depositado en Liquid Unstake Pool
  const { data: totalDepositedPool } = useScaffoldReadContract({
    contractName: "LiquidUnstakePool",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Obteniendo tu saldo mpETH
  const { data: mpETHBalance } = useScaffoldReadContract({
    contractName: "Staking",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Obteniendo mpETH to ETH
  const { data: mpETHtoETH } = useScaffoldReadContract({
    contractName: "Staking",
    functionName: "convertToAssets",
    args: [parseEther("1")],
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="card bg-primary text-primaru-content">
          <div className="card-body">
            <h1>MetaPool Staking LST</h1>
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-2xl">Depósito Mínimo</div>
                <div className="text-3xl">{formatEther(minDeposit || BigInt(0))}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl">Total Depositado</div>
                <div className="text-3xl">{formatEther(totalSupply || BigInt(0))}</div>
              </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-2xl">tu saldo mpETH</div>
                <div className="text-3xl">{formatEther(mpETHBalance || BigInt(0))}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl">mpETH to ETH</div>
                <div className="text-3xl">{formatEther(mpETHtoETH || BigInt(0))}</div>
              </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-2xl">Total depositado Pool</div>
                <div className="text-3xl">{formatEther(totalDepositedPool || BigInt(0))}</div>
              </div>
            </div>

            <label>Monto depósito</label>
            <IntegerInput
              value={montoDeposito}
              onChange={updatedTxValue => {
                setMontoDeposito(updatedTxValue);
              }}
              placeholder="value (wei)"
            />
            <button
              className="btn w-full text-2xl"
              onClick={() => {
                stake();
              }}
            >
              Stake
            </button>
            <button
              className="btn w-full text-2xl"
              onClick={() => {
                stakeLiquidUnstakePool();
              }}
            >
              Stake Liquidity
            </button>

            {/* Retiro */}
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-2xl">Retiro Pendiente</div>
                <div className="text-3xl">{formatEther(pendingWithdraws?.[0] || BigInt(0))}</div>
              </div>
            </div>
            <label>Monto Retiro</label>
            <IntegerInput value={montoWithdraw} onChange={e => setMontoWithdraw(e)} placeholder="Amount" />
            <button className="btn w-full" onClick={() => withdrawLiquidityUnstake()}>
              Fast Unstake
            </button>
            <button className="btn w-full" onClick={() => requestDelayedUnstake()}>
              Solicitar Delayed Unstake
            </button>
            <button className="btn w-full" onClick={() => completeWithdraw()}>
              Finalizar Delayed Unstake
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
