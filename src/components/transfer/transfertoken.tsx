"use client";
import { useState } from "react";
import abi from "@/abi/abi.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Contract, ethers } from "ethers";

const CONTRACT_ADDRESS = "0xe408C8dcfDfEaaF4A2a373bA6C6b828113733d90";

export const TokenTransfer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [transferDetails, setTransferDetails] = useState({
    from: '',
    to: '',
    tokenId: ''
  });
  console.log(transferDetails, "Transfer Details");

  const connectToContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new Contract(CONTRACT_ADDRESS, abi, signer);
    } catch {
      throw new Error("Failed to connect to contract");
    }
  };

  const handleTransfer = async () => {
    if (!transferDetails.from || !transferDetails.to || !transferDetails.tokenId) {
      setError("All fields are required");
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const contract = await connectToContract();
      console.log("Contract:", contract);
      const tx = await contract.transferFrom(
        transferDetails.from,
        transferDetails.to,
        transferDetails.tokenId
      );
      console.log("Transaction:", tx);
      await tx.wait();
      
      setSuccess(`Successfully transferred token #${transferDetails.tokenId} from ${transferDetails.from} to ${transferDetails.to}`);
      setTransferDetails({
        from: '',
        to: '',
        tokenId: ''
      });
    } catch (err) {
      console.error("Transfer error:", err);
      setError( "Failed to transfer token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mt-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5" />
          Transfer Token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Input
            placeholder="From Address (current owner)"
            value={transferDetails.from}
            onChange={(e) => setTransferDetails(prev => ({...prev, from: e.target.value}))}
          />
          
          <Input
            placeholder="To Address (new owner)"
            value={transferDetails.to}
            onChange={(e) => setTransferDetails(prev => ({...prev, to: e.target.value}))}
          />
          
          <Input
            type="number"
            placeholder="Token ID"
            value={transferDetails.tokenId}
            onChange={(e) => setTransferDetails(prev => ({...prev, tokenId: e.target.value}))}
          />
          
          <Button 
            onClick={handleTransfer}
            disabled={isLoading || !transferDetails.from || !transferDetails.to || !transferDetails.tokenId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Transfer Token"
            )}
          </Button>
        </div>
        
        <div className="text-sm text-gray-500 mt-2">
          <p>Note: You must be the owner of the token or be approved to transfer it.</p>
        </div>
      </CardContent>
    </Card>
  );
};
