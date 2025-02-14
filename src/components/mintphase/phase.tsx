"use client";
import { useEffect, useState } from "react";
import { publicClient } from "@/ui/config";
import abi from "@/abi/abi.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleIcon, RefreshCw } from "lucide-react";



const CONTRACT_ADDRESS = "0x15bc1322d2C39b7c27351E077e6E31Fd9E3a9941";
export const useContractRead = () => {
  const [data, setData] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxSupply, setMaxSupply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const fetchMaxSupply = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: "MAX_SUPPLY",
        account: "0x1C87B29DAcEae35025E814DD78E385EF2f8918A8"
      });
      setMaxSupply(result as string);
    } catch {
      setError("Failed to fetch max supply");
    } finally {
      setIsLoading(false);
    }
  }

  const fetchActivePhase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: "getActivePhase",
        account: "0x1C87B29DAcEae35025E814DD78E385EF2f8918A8"
      });
      setData(result as bigint);
    } catch {
      setError("Failed to fetch active phase");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaxSupply();
    fetchActivePhase();
  }, []);

  return { data, maxSupply, error, isLoading, fetchActivePhase };
};

export const PhaseDisplay = () => {
  const { data, maxSupply, error, isLoading, fetchActivePhase } = useContractRead();

  return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Max Supply</CardTitle>
              <CircleIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {maxSupply ? maxSupply.toString() : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total available tokens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
              <CircleIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  'Loading...'
                ) : error ? (
                  <span className="text-red-500">Error loading phase</span>
                ) : (
                  data?.toString() || 'N/A'
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Active minting phase
                </p>
                <button
                  onClick={fetchActivePhase}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground p-1"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div> 
    )}