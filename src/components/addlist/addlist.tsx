"use client";
import { useState } from "react";
import { publicClient } from "@/ui/config";
import abi from "@/abi/abi.json";

const CONTRACT_ADDRESS = "0x15bc1322d2C39b7c27351E077e6E31Fd9E3a9941";

export const ADDLISTITEMS = () => {

    const [allowlist01, setAllowlist01] = useState<string[] | null>(null);
    const [allowlist02, setAllowlist02] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchAllowlist01 = async () => {

        setIsLoading(true);
        setError(null);
        try {
            const result = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: abi,
                functionName: "getAllowlist01Addresses",
                account: "0x1C87B29DAcEae35025E814DD78E385EF2f8918A8",
            });

            setAllowlist01(result as string[]);
        } catch (err: any) {
            console.error("Contract call error:", err);
            setError(err.message || "Failed to fetch Allowlist01");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllowlist02 = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: abi,
                functionName: "getAllowlist02Addresses",
                account: "0x1C87B29DAcEae35025E814DD78E385EF2f8918A8",
            });

            setAllowlist02(result as string[]);
        } catch (err: any) {
            console.error("Contract call error:", err);
            setError(err.message || "Failed to fetch Allowlist02");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="text-center">
                <h1 className="mb-4 text-xl font-bold">Address List</h1>
                <button
                    onClick={fetchAllowlist01}
                    className="px-6 py-3 m-2 bg-blue-500 text-white rounded"
                >
                    Fetch AllowlistOne
                </button>
                <button
                    onClick={fetchAllowlist02}
                    className="px-6 py-3 m-2 bg-green-500 text-white rounded"
                >
                    Fetch AllowlistTwo
                </button>
                {isLoading && <p className="mt-4 text-gray-500">Loading...</p>}
                {error && <p className="mt-4 text-red-500">{error}</p>}
                {allowlist01 && (
                    <div className="mt-4 bg-gray-100 p-4 rounded shadow-md">
                        <h2 className="font-semibold mb-2">Allowlist01 Addresses:</h2>
                        <ul className="text-left">
                            {allowlist01.length > 0 ? (
                                allowlist01.map((address, index) => (
                                    <li key={index} className="text-sm text-gray-700">
                                        {address}
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-gray-500">No addresses found.</li>
                            )}
                        </ul>
                    </div>
                )}
                {allowlist02 && (
                    <div className="mt-4 bg-gray-100 p-4 rounded shadow-md">
                        <h2 className="font-semibold mb-2">Allowlist02 Addresses:</h2>
                        <ul className="text-left">
                            {allowlist02.length > 0 ? (
                                allowlist02.map((address, index) => (
                                    <li key={index} className="text-sm text-gray-700">
                                        {address}
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-gray-500">No addresses found.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ADDLISTITEMS;
