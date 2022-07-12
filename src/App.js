import React, {useEffect, useState} from "react";
import Header from "./components/Header";
import SwapPanel from "./components/SwapPanel"
import { useMoralis } from "react-moralis";
import { toast } from "react-toastify";

const style = {
  appHeader: `bg-gradient-radial from-orange-200 to-gray-300 h-screen darkmmode`,
}
toast.configure();

const App = ({isServerInfo}) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, chainId, isWeb3EnableLoading } = useMoralis();
  const [isValidChain, setIsValidChain] = useState(false);
  // const InvalidChain = () => {
  //   toast.error("Invalid Chain.", { autoClose: 2000 });
  // };
  const checkChain = () => {
    if (chainId === "0x1" || chainId === "0x89") {setIsValidChain(true);}
    else setIsValidChain(false);
  }

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading){
      enableWeb3({ provider: connectorId });
    }
    checkChain();
  }, [isAuthenticated, isWeb3Enabled, chainId]);

  return (
    <div className={style.appHeader}>
      {!isValidChain && 
        <div className="p-10 text-2xl bg-yellow-300 items-center flex justify-center">
          <p>Deadlocke currently supports Ethereum and Polygon blockchain only. Please switch your network to use the application.</p>
        </div>
      }
      {isValidChain && 
      <>
        <Header />
        <SwapPanel /> 
      </>
      }
    </div>
  );
};

export default App;
