import { useState,useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { publicClient } from '@/ui/config'
import ABI from "@/abi/abi.json"
import { Contract } from "zksync-ethers";
import { ethers } from "ethers";

export const MintingToken = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [mintPhase, setMintPhase] = useState("");
  console.log(mintPhase,"hello duke");
  const [data, setData] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const contractAddress = "0x15bc1322d2C39b7c27351E077e6E31Fd9E3a9941";
  const ABI_ADDRESS = ABI;

  // Connect to the contract
  const connectToContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new Contract(contractAddress, ABI_ADDRESS, signer);
    } catch (error) {
      throw new Error("Failed to connect to contract");
    }
  };
  console.log(connectToContract,"heycontract");

  const fetchActivePhase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await publicClient.readContract({
        address:contractAddress,
        abi: ABI_ADDRESS,
        functionName: "getActivePhase",
        account: "0x1C87B29DAcEae35025E814DD78E385EF2f8918A8"
      });
      setMintPhase(result  as string );
    } catch (err: any) {
      console.error("Contract call error:", err);
      setError(err.message || "Failed to fetch active phase");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePhase();
  }, []);


  // Minting function based on the phase
  const Mintingtoken = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!mintAmount || isNaN(Number(mintAmount))) {
        setError("Invalid mint amount");
        return;
      }

      const contract = await connectToContract();
      console.log(contract,"hey");
      
      // Get the current phase
      const currentPhase =mintPhase;
      
      let tx;
      if (currentPhase === "publicMintActive") {
        tx = await contract.publicMint(mintAmount, { value: ethers.parseEther("0.01") }); // Adjust price accordingly
      } else if (currentPhase === "allowlist01Active") {
        tx = await contract.allowlist01Mint(mintAmount);
      } else if (currentPhase === "allowlist02Active") {
        tx = await contract.allowlist02Mint(mintAmount);
      } else {
        setError("Invalid mint phase");
        return;
      }

      await tx.wait();
      console.log("Minting successful!");
    } catch (err: any) {
      console.error("Contract call error:", err);
      setError(err.message || "Minting failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Input
        type="number"
        placeholder="Enter Mint Amount"
        value={mintAmount}
        onChange={(e) => setMintAmount(e.target.value)}
        className="px-4 py-2 border rounded-md"
      />
      <Button onClick={Mintingtoken} disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-md">
        {isLoading ? "Minting..." : "Mint"}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};
