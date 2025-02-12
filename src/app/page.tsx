"use client";
import { useEffect, useState } from "react";
import { publicClient } from "@/ui/config";
import abi from "@/abi/abi.json";

const CONTRACT_ADDRESS = "0x5DAb9D1D8990B169D04BcF8dd30cC8CdD9b820D8";

export const useContractRead = () => {
  const [data, setData] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return { data, error, isLoading, fetchActivePhase };

};

export const PhaseDisplay = () => {
  const { data, error, isLoading, fetchActivePhase } = useContractRead();

  return (
    <div className="p-4 text-center">
      {isLoading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {data && <p className="text-green-600 font-semibold">Active Phase: {data.toString()}</p>}

      <button
        onClick={fetchActivePhase}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={isLoading}
      >
        Refresh Phase
      </button>
    </div>
  );
};

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <PhaseDisplay />
    </div>
  );
};

export default Home;
