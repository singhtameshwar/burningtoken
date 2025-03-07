"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { publicClient } from '@/ui/config';
import ABI from "@/abi/abi.json";
import { Contract } from "ethers";
import { ethers } from "ethers";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";


export const MintingToken = () => {
  const [mintPhase, setMintPhase] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<bigint>(BigInt(0));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const contractAddress = "0xe4717d092D8438AFD6F8ea8c58ab2c2453574B95";
  const ABI_ADDRESS = ABI;
  const accountAddress = "0x52465e7f3d46EB69Dc5D9533B3F14465094fD632";

  const connectToContract = async (): Promise<Contract> => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new Contract(contractAddress, ABI_ADDRESS, signer);
    } catch (err) {
      console.error("Connection error:", err);
      throw new Error("Failed to connect to contract");
    }
  };

  const fetchActivePhase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: ABI_ADDRESS,
        functionName: "getActivePhase",
        account: accountAddress,
      });
      setMintPhase(result as string);
    } catch (err) {
      console.error("Phase fetch error:", err);
      setError("Failed to fetch active phase");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePhase();
  }, []);

  const getPhaseDisplay = (phase: string): string => {
    const phaseNames: { [key: string]: string } = {
      publicMintActive: "Public Mint",
      allowlist01Active: "Allowlist 1",
      allowlist02Active: "Allowlist 2",
    };
    return phaseNames[phase] || "Unknown Phase";
  };

  const fetchMintPrice = async (currentPhase: string): Promise<void> => {
    if (!currentPhase) {
      console.log("No phase available yet, skipping price fetch");
      return;
    }

    setError(null);
    try {
      const phaseFunctionMap: { [key: string]: string } = {
        publicMintActive: "getPublicMintPrice",
        allowlist01Active: "getAllowlist01Price",
        allowlist02Active: "getAllowlist02Price"
      };

      const functionName = phaseFunctionMap[currentPhase];

      if (!functionName) {
        setError(`Unknown mint phase: ${currentPhase}`);
        return;
      }

      const functionExists = ABI_ADDRESS.some(
        (item) => item.type === "function" && item.name === functionName
      );

      if (!functionExists) {
        console.error(`Function ${functionName} not found in ABI`);
        setError(`Contract doesn't support ${functionName}`);
        return;
      }

      const price = await publicClient.readContract({
        address: contractAddress,
        abi: ABI_ADDRESS,
        functionName: functionName,
        account: accountAddress
      });

      if (typeof price !== "bigint") {
        console.error(`Invalid price data type: ${typeof price}`, price);
        setError("Invalid price format returned from contract");
        return;
      }
      console.log(`Price for ${currentPhase}:`, price.toString());
      setCurrentPrice(price);
    } catch (err) {
      console.error("Price fetch error:", err);
      setError("Failed to fetch price");
    }
  };

  useEffect(() => {
    if (mintPhase) {
      console.log("Phase changed to:", mintPhase, "- fetching price");
      fetchMintPrice(mintPhase);
    }
  }, [mintPhase]);


  const mintToken = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await connectToContract();
      if (!mintPhase) throw new Error("Mint phase not set");
      const totalPrice = currentPrice; // Ensure this is in wei
  
      let tx;
      if (mintPhase === "publicMintActive") {
        tx = await contract.publicMint({ value: totalPrice });
      } else if (mintPhase === "allowlist01Active") {
        tx = await contract.allowlist01Mint({ value: totalPrice });
      } else if (mintPhase === "allowlist02Active") {
        tx = await contract.allowlist02Mint({ value: totalPrice });
      } else {
        throw new Error("Invalid mint phase");
      }
  
      console.log("Transaction submitted:", tx.hash);
      await tx.wait();
      console.log("Transaction complete");
      setError(null);
    } catch (err) {
      console.error("Minting error:", err);
      setError(`Minting failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };
  

  const formatPrice = (price: bigint): string => {
    if (price === BigInt(0)) return "Free";
    try {
      return `${ethers.formatEther(price)} ETH`;
    } catch (err) {
      console.error("Error formatting price:", err);
      return "Unknown";
    }
  };

  return (
    <Card className="w-full mt-5 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Token Minting</CardTitle>
        <CardDescription>
          Current Phase: {getPhaseDisplay(mintPhase)}
          <br />
          Price per token: {formatPrice(currentPrice)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">Mint 1 token for {formatPrice(currentPrice)}</div>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      </CardContent>
      <CardFooter>
        <Button onClick={mintToken} disabled={isLoading} className="w-full">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Minting...</> : "Mint Token"}
        </Button>
      </CardFooter>
    </Card>
  );
};