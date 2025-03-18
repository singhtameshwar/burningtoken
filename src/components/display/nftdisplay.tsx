"use client";
import { useState, useEffect } from "react";
import ABI from "@/abi/abi.json";
import Image from "next/image";
import { Contract } from "ethers";
import { ethers } from "ethers";

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // [key: string]: any;
}

export const NFTDISPLAY = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftData, setNftData] = useState<NFTMetadata | null>(null);
  const [latestTokenId, setLatestTokenId] = useState<string>("0");
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const contractAddress = "0x0892b05DefB2e44e2417F18b8dA7c0B1379EF913";
  const ABI_ADDRESS = ABI;

  const connectToMetaMask = async () => {
    setError(null);
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }
  
      // Request account access (always gets latest user-selected account)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }
  
      const currentAccount = accounts[0]; // Always take the latest approved account
  
      setAccountAddress(currentAccount);
      setIsConnected(true);
  
      // Remove existing listener to prevent multiple event bindings
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  
      // Define the event handler function
      function handleAccountsChanged(newAccounts: string[]) {
        if (newAccounts.length === 0) {
          setIsConnected(false);
          setAccountAddress("");
          setNftData(null);
        } else {
          setAccountAddress(newAccounts[0]);
          fetchLatestTokenData(newAccounts[0]);
        }
      }
  
      // Attach event listener
      window.ethereum.on('accountsChanged', handleAccountsChanged);
  
      return currentAccount;
    } catch{
      console.error("MetaMask connection error:",);
      setError("Failed to connect to MetaMask");
      setIsConnected(false);
      return null;
    }
  };
  
  // New disconnect function
  const disconnectWallet = () => {
    // Clear the connection state
    setIsConnected(false);
    setAccountAddress("");
    setNftData(null);
    setLatestTokenId("0");
    setError(null);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
    
    // Define the event handler function to maintain reference
    function handleAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccountAddress("");
        setNftData(null);
      } else {
        setAccountAddress(accounts[0]);
        fetchLatestTokenData(accounts[0]);
      }
    }
  };

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

  const getLatestMintedToken = async (address: string) => {
    try {
      const contract = await connectToContract();
      
      const balance = await contract.balanceOf(address);
      
      if (balance.toString() === "0") {
        throw new Error("Account doesn't own any tokens");
      }
      
      let foundToken = false;
      let latestId = "0";
      
      let maxTokenToCheck;
      try {
        const totalSupply = await contract.totalSupply();
        maxTokenToCheck = totalSupply.toString();
      } catch {
        maxTokenToCheck = "1000"; 
      }
      for (let i = parseInt(maxTokenToCheck); i > 0; i--) {
        try {
          const tokenIdToCheck = i.toString();
          const owner = await contract.ownerOf(tokenIdToCheck);
          
          if (owner.toLowerCase() === address.toLowerCase()) {
            latestId = tokenIdToCheck;
            foundToken = true;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!foundToken) {
        throw new Error("No tokens found for this account");
      }
      
      return latestId;
    } catch (err) {
      console.error("Error finding latest token:", err);
      throw err;
    }
  };

  const fetchNFTData = async (id: string, address: string) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = await connectToContract();

      const ownerOf = await contract.ownerOf(id);
      
      if (ownerOf.toLowerCase() !== address.toLowerCase()) {
        throw new Error(`Token #${id} is not owned by the connected wallet`);
      }
      
      const tokenURI = await contract.tokenURI(id);
      let metadata: NFTMetadata;
      
      if (tokenURI.startsWith("ipfs://")) {
        const ipfsGateway = "https://ipfs.io/ipfs/";
        const ipfsHash = tokenURI.replace("ipfs://", "");
        const response = await fetch(ipfsGateway + ipfsHash);
        metadata = await response.json();
      } else if (tokenURI.startsWith("data:application/json;base64,")) {
        const base64Data = tokenURI.replace("data:application/json;base64,", "");
        const decodedData = atob(base64Data);
        metadata = JSON.parse(decodedData);
      } else {
        const response = await fetch(tokenURI);
        metadata = await response.json();
      }
      
      setNftData(metadata);
    } catch (err) {
      console.error("Error fetching NFT data:", err);
      setError("Failed to fetch NFT data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestTokenData = async (address?: string) => {
    const walletAddress = address || accountAddress;
    
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const latestId = await getLatestMintedToken(walletAddress);
      setLatestTokenId(latestId);
      await fetchNFTData(latestId, walletAddress);
    } catch (err) {
      console.error("Error fetching latest token:", err);
      setError("Failed to fetch latest token");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            setAccountAddress(accounts[0]);
            setIsConnected(true);
            fetchLatestTokenData(accounts[0]);
          }
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    };
    
    checkConnection();
  }, []);

  const renderNFTData = () => {
    if (!nftData) return null;
    let imageUrl = nftData.image || "";
    if (imageUrl.startsWith("ipfs://")) {
      imageUrl = "https://ipfs.io/ipfs/" + imageUrl.replace("ipfs://", "");
    }

    return (
      <div className="mt-6 overflow-hidden bg-white rounded-lg shadow-lg">
        {imageUrl && (
          <div className="relative w-full h-64 overflow-hidden bg-gray-100">
            <Image 
              src={imageUrl} 
              alt={nftData.name || "NFT Image"} 
              className="object-contain w-full h-full"
              height={250}
              width={250}
            />
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">{nftData.name || "Unnamed NFT"}</h2>
          <p className="mt-3 text-gray-600">{nftData.description || "No description available"}</p>
          
          {nftData.attributes && nftData.attributes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Attributes</h3>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {nftData.attributes.map((attr, index) => (
                  <div key={index} className="flex flex-col p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-500">{attr.trait_type}</span>
                    <span className="text-lg font-semibold text-gray-800">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl px-4 py-12 mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800">NFT Viewer</h1>
          <p className="mt-2 text-gray-600">Connect your wallet to view your NFTs</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          {!isConnected ? (
            <div className="flex flex-col items-center">
              <button
                onClick={connectToMetaMask}
                className="px-6 py-3 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Connect MetaMask
              </button>
              <p className="mt-4 text-sm text-gray-500">Connect your wallet to view your NFTs</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between p-3 mb-6 overflow-hidden text-sm bg-gray-100 rounded-lg">
                <div>
                  <span className="text-gray-500">Connected wallet: </span>
                  <span className="font-mono text-gray-800">{`${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1 text-sm font-medium text-red-600 transition-colors bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Disconnect
                </button>
              </div>
              
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => fetchLatestTokenData()}
                  disabled={isLoading}
                  className="px-6 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
                >
                  {isLoading ? "Loading..." : "View Your NFT"}
                </button>
              </div>
              
              {latestTokenId !== "0" && (
                <div className="p-3 mb-6 text-sm bg-gray-100 rounded-lg">
                  <span className="font-medium text-gray-700">Latest token owned: </span>
                  <span className="font-mono text-gray-800">#{latestTokenId}</span>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="p-4 mt-6 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-600 animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading NFT data...</p>
            </div>
          )}
          
          {!isLoading && renderNFTData()}
        </div>
      </div>
    </div>
  );
};