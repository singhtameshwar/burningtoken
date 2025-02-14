import {BURNTOKEN }from "@/components/burntoken/burntoken";
import { MintingToken } from "@/components/mintingtoken/minttoken";
import { PhaseDisplay } from "@/components/mintphase/phase";
import { BURNCLAIMCONTRACT } from "@/components/claimcontract/claimcontract";
export const Home = () => {
  return (
      <>  
        <PhaseDisplay/>
         <MintingToken />
         <BURNCLAIMCONTRACT/>
         <BURNTOKEN/>
      </>
      )}
      export default Home;
    