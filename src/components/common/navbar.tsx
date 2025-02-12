"use client";
import { CustomConnectButton } from "./connect";

export function Navbar() {
  return (
    <nav className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">HELLO BRO:</h1>
        <CustomConnectButton />
      </div>
    </nav>
  );
}
export default Navbar;