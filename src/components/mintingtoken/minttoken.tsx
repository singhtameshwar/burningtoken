"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { publicClient } from '@/ui/config';
import ABI from "@/abi/abi.json";
import { Contract } from "zksync-ethers";
import { ethers } from "ethers";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export const MintingToken = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [mintPhase, setMintPhase] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const contractAddress ="0x7C5AFE2283E1bcB4d8B859D23b11bBc3DcA02aA5";
  const ABI_ADDRESS = ABI;
  const connectToContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new Contract(contractAddress, ABI_ADDRESS, signer);
    } catch {
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
        account: "0x308991965ABb8B148Acb1ce0cd8f8AAFc4c19f88"
      });
      setMintPhase(result as string);
    } catch {
      setError("Failed to fetch active phase");
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    fetchActivePhase();
  }, []);

  const getPhaseDisplay = (phase: string) => {
    switch (phase) {
      case "publicMintActive":
        return "Public Mint";
      case "allowlist01Active":
        return "Allowlist 1";
      case "allowlist02Active":
        return "Allowlist 2";
      default:
        return "Unknown Phase";
    }
  };

  const Mintingtoken = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!mintAmount || isNaN(Number(mintAmount))) {
        setError("Invalid mint amount");
        return;
      }
      const contract = await connectToContract();
      console.log(contract,"hey cont");
      
      const currentPhase = mintPhase;
      console.log(currentPhase,"hey phase");
      
      let tx;
      if (currentPhase === "publicMintActive") {
        tx = await contract.publicMint(mintAmount);
        console.log(tx,"hey public ")
      } else if (currentPhase === "allowlist01Active") {
        tx = await contract.allowlist01Mint(mintAmount);
        console.log(tx,"aloow");
      } else if (currentPhase === "allowlist02Active") {
        tx = await contract.allowlist02Mint(mintAmount);
        console.log(tx,"hey allowlist2 ");
      } else {
        setError("Invalid mint phase");
        return;
      }
      
      await tx.wait();
      console.log(tx,"hey tx");
      setError(null);
    } catch {
      setError("Minting failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mt-5 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Token Minting</CardTitle>
        <CardDescription>
          Current Phase: {getPhaseDisplay(mintPhase)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="mintAmount" className="text-sm font-medium text-gray-700">
            Mint Amount
          </label>
          <Input
            id="mintAmount"
            type="number"
            placeholder="Enter amount to mint"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="w-full"
            min="1"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={Mintingtoken} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Minting...
            </>
          ) : (
            "Mint Tokens"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MintingToken;