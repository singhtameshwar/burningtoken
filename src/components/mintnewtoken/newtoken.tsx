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

export const NewToken = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [mintPhase, setMintPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const contractAddress = "0xe4717d092D8438AFD6F8ea8c58ab2c2453574B95";
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
      if (
        currentPhase === "publicMintActive" || 
        currentPhase === "allowlist01Active" || 
        currentPhase === "allowlist02Active"
      ) {
        tx = await contract.mintAfterBurn(mintAmount);
      } else {
        setError("Invalid mint phase");
        return;
      }
      
      await tx.wait();
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Minting failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Mint After Burn</CardTitle>
        <CardDescription>
          Current Active Phase: {mintPhase || 'Loading...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Input 
            type="number" 
            placeholder="Enter mint amount" 
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={Mintingtoken} 
          disabled={isLoading || !mintAmount}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Minting...
            </>
          ) : (
            "Mint After Burn"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default NewToken;