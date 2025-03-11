import {BURNTOKEN} from "@/components/burntoken/burntoken";
import { MintingToken } from "@/components/mintingtoken/minttoken";
import { PhaseDisplay } from "@/components/mintphase/phase";
import { BURNCLAIMCONTRACT } from "@/components/claimcontract/claimcontract";
import { NewToken } from "@/components/mintnewtoken/newtoken";
import  {TokenTransfer} from "@/components/transfer/transfertoken";

export default function Home() {
  return (
    <>  
      <PhaseDisplay/>
      <MintingToken/>
      <BURNCLAIMCONTRACT/>
      <BURNTOKEN/>
      <NewToken/>
      <TokenTransfer/>
    </>
  );
}