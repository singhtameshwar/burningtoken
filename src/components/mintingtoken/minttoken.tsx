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

  const contractAddress = "0x15bc1322d2C39b7c27351E077e6E31Fd9E3a9941";
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
        account: "0x1C87B29DAcEae35025E814DD78E385EF2f8918A8"
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
      
      const currentPhase = mintPhase;
      
      let tx;
      if (currentPhase === "publicMintActive") {
        tx = await contract.publicMint(mintAmount, { value: ethers.parseEther("0.01") });
      } else if (currentPhase === "allowlist01Active") {
        tx = await contract.allowlist01Mint(mintAmount);
      } else if (currentPhase === "allowlist02Active") {
        tx = await contract.allowlist02Mint(mintAmount);
      } else {
        setError("Invalid mint phase");
        return;
      }
      await tx.wait();
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