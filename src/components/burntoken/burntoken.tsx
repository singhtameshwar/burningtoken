"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contract } from "zksync-ethers";
import { ethers } from "ethers";
import  NFT_ABI  from "@/abi/abi.json";
import { Flame } from "lucide-react";

export const BURNTOKEN = () => {
  const [tokensToBurn, setTokensToBurn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [burnedAmount, setBurnedAmount] = useState<string | null>(null);
  const connectToContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractAddress = "0x15bc1322d2C39b7c27351E077e6E31Fd9E3a9941";
      return new Contract(contractAddress, NFT_ABI, signer);
    } catch{
      throw new Error("Failed to connect to contract");
    }
  };

  const handleBurn = async () => {
    try {
        setIsLoading(true);
        const contract = await connectToContract();
        const tx = await contract.burnAndClaim(tokensToBurn);
        await tx.wait();
        setBurnedAmount(tokensToBurn);
        if (tokensToBurn) {
            setTokensToBurn(burnedAmount as string);
        }
      } catch {
        setError("Failed to burn tokens");
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="grid gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Burn Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Burn
                </label>
                <input
                  type="number"
                  value={tokensToBurn}
                  onChange={(e) => setTokensToBurn(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter amount"
                  min="0"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleBurn}
                disabled={isLoading || !tokensToBurn}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    Burn Tokens
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Warning: This action cannot be undone. Burned tokens are permanently removed from circulation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BURNTOKEN;