"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Contract } from "zksync-ethers";
import { ethers } from "ethers";
import  NFT_ABI  from "@/abi/abi.json";
import { Settings, AlertCircle } from 'lucide-react';

export const Ownerabilities = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [prices, setPrices] = useState({
    publicMintPrice: '',
    allowlist01Price: ''
  });
  
  const [phases, setPhases] = useState({
    public: false,
    al01: false,
    al02: false
  });

  const [royaltyInfo, setRoyaltyInfo] = useState({
    recipient: '',
    fee: ''
  });

  const [burnClaimAddress, setBurnClaimAddress] = useState('');
  const [baseURI, setBaseURI] = useState('');
  const [allowlistAddresses, setAllowlistAddresses] = useState('');
  const [selectedAllowlist, setSelectedAllowlist] = useState('1'); 
  const message="error here";

  const connectToContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractAddress = "0x15bc1322d2C39b7c27351E077e6E31Fd9E3a9941";
      return new Contract(contractAddress, NFT_ABI, signer);
    } catch {
      throw new Error("Failed to connect to contract: " + message);
    }
  };

  const handleSetPricing = async () => {
    try {
      setIsLoading(true);
      const contract = await connectToContract();
      const tx = await contract.setPricing(
        ethers.parseEther(prices.publicMintPrice),
        ethers.parseEther(prices.allowlist01Price)
      );
      await tx.wait();
      setSuccess('Pricing updated successfully!');
    } catch {
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPhases = async () => {
    try {
      setIsLoading(true);
      const contract = await connectToContract();
      const tx = await contract.setMintPhases(
        phases.public,
        phases.al01,
        phases.al02
      );
      await tx.wait();
      setSuccess('Phases updated successfully!');
    } catch {
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetRoyalty = async () => {
    try {
      setIsLoading(true);
      const contract = await connectToContract();
      const tx = await contract.setRoyaltyInfo(
        royaltyInfo.recipient,
        royaltyInfo.fee
      );
      await tx.wait();
      setSuccess('Royalty info updated successfully!');
    } catch {
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBurnClaim = async () => {
    try {
      setIsLoading(true);
      const contract = await connectToContract();
      const tx = await contract.setBurnClaimContract(burnClaimAddress);
      await tx.wait();
      setSuccess('Burn claim contract updated successfully!');
    } catch {
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBaseURI = async () => {
    try {
      setIsLoading(true);
      const contract = await connectToContract();
      const tx = await contract.setBaseURI(baseURI);
      await tx.wait();
      setSuccess('Base URI updated successfully!');
    } catch {
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToAllowlist = async () => {
    try {
      setIsLoading(true);
      const contract = await connectToContract();
      const addresses = allowlistAddresses.split(',').map(addr => addr.trim());  
      const tx = await contract[selectedAllowlist === '1' ? 'addToAllowlist01' : 'addToAllowlist02'](addresses);
      await tx.wait();
  
      console.log("Transaction successful. Addresses added.");  
      setSuccess('Addresses added to allowlist successfully!');
    } catch  {
      setError(message);
      console.error("Error adding addresses:",message); 
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings />
        Owner Controls
      </h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Set Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Public Mint Price (ETH)"
              value={prices.publicMintPrice}
              onChange={(e) => setPrices(prev => ({...prev, publicMintPrice: e.target.value}))}
            />
            <Input
              type="number"
              placeholder="Allowlist 01 Price (ETH)"
              value={prices.allowlist01Price}
              onChange={(e) => setPrices(prev => ({...prev, allowlist01Price: e.target.value}))}
            />
            <Button 
              onClick={handleSetPricing}
              disabled={isLoading}
              className="w-full"
            >
              Update Pricing
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Set Mint Phases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={phases.public}
                  onChange={(e) => setPhases(prev => ({...prev, public: e.target.checked}))}
                />
                Public
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={phases.al01}
                  onChange={(e) => setPhases(prev => ({...prev, al01: e.target.checked}))}
                />
                AL01
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={phases.al02}
                  onChange={(e) => setPhases(prev => ({...prev, al02: e.target.checked}))}
                />
                AL02
              </label>
            </div>
            <Button 
              onClick={handleSetPhases}
              disabled={isLoading}
              className="w-full"
            >
              Update Phases
            </Button>
          </CardContent>
        </Card>

        {/* Royalty Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Set Royalty Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Recipient Address"
              value={royaltyInfo.recipient}
              onChange={(e) => setRoyaltyInfo(prev => ({...prev, recipient: e.target.value}))}
            />
            <Input
              type="number"
              placeholder="Fee (basis points)"
              value={royaltyInfo.fee}
              onChange={(e) => setRoyaltyInfo(prev => ({...prev, fee: e.target.value}))}
            />
            <Button 
              onClick={handleSetRoyalty}
              disabled={isLoading}
              className="w-full"
            >
              Update Royalty
            </Button>
          </CardContent>
        </Card>

        {/* Other Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Other Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Burn Claim Contract Address"
              value={burnClaimAddress}
              onChange={(e) => setBurnClaimAddress(e.target.value)}
            />
            <Button 
              onClick={handleSetBurnClaim}
              disabled={isLoading}
              className="w-full mb-4"
            >
              Set Burn Claim Contract
            </Button>

            <Input
              placeholder="Base URI"
              value={baseURI}
              onChange={(e) => setBaseURI(e.target.value)}
            />
            <Button 
              onClick={handleSetBaseURI}
              disabled={isLoading}
              className="w-full"
            >
              Set Base URI
            </Button>
          </CardContent>
        </Card>

        {/* Allowlist Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Manage Allowlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button
                variant={selectedAllowlist === '1' ? 'default' : 'outline'}
                onClick={() => setSelectedAllowlist('1')}
              >
                Allowlist 01
              </Button>
              <Button
                variant={selectedAllowlist === '2' ? 'default' : 'outline'}
                onClick={() => setSelectedAllowlist('2')}
              >
                Allowlist 02
              </Button>
            </div>
            <Input
              placeholder="Enter addresses (comma-separated)"
              value={allowlistAddresses}
              onChange={(e) => setAllowlistAddresses(e.target.value)}
            />
            <Button 
              onClick={handleAddToAllowlist}
              disabled={isLoading}
              className="w-full"
            >
              Add to Allowlist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ownerabilities;