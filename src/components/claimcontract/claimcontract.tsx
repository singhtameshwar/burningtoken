"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleIcon, Plus } from "lucide-react";
import { Contract } from "zksync-ethers";
import { ethers } from "ethers";
import NFT_ABI from "@/abi/abi.json";

export const BURNCLAIMCONTRACT = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [claimAddress, setClaimAddress] = useState("");
    const [addedContracts, setAddedContracts] = useState<string[]>([]);

    const connectToContract = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractAddress = "0x7C5AFE2283E1bcB4d8B859D23b11bBc3DcA02aA5";
            return new Contract(contractAddress, NFT_ABI, signer);
        } catch{
            throw new Error("Failed to connect to contract");
        }
    };

    const handleAddContractAddress = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setIsLoading(true);
            const contract = await connectToContract();
            const tx = await contract.setBurnClaimContract(claimAddress);
            await tx.wait();
            setAddedContracts([...addedContracts, claimAddress]);
            setClaimAddress("");
        } catch {
            setError("Failed to add contract address");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="grid gap-6">
                {/* Contract Status Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Added Contracts</CardTitle>
                        <CircleIcon className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {addedContracts.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total recipient contracts added
                        </p>
                    </CardContent>
                </Card>

                {/* Add Contract Interface */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-purple-500" />
                            Add Recipient Contract
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contract Address
                                </label>
                                <input
                                    type="text"
                                    value={claimAddress}
                                    onChange={(e) => setClaimAddress(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter contract address"
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleAddContractAddress}
                                disabled={isLoading || !claimAddress}
                                className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Add Contract
                                    </>
                                )}
                            </button>

                            {addedContracts.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Contracts:</h4>
                                    <div className="space-y-2">
                                        {addedContracts.slice(-3).map((address, index) => (
                                            <div key={index} className="text-sm bg-gray-50 p-2 rounded-md break-all">
                                                {address}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BURNCLAIMCONTRACT;