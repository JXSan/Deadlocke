import React, { useState, useEffect } from "react";
import { RiSettings3Fill } from "react-icons/ri";
import { AiOutlineDown } from "react-icons/ai";
import Modal from "react-modal";
import { useMoralis, useNativeBalance, useMoralisWeb3Api } from "react-moralis";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokenList } from "./TokenList";
import {getSwapTransaction} from "../backend/Paraswap"
import BigNumber from "bignumber.js";

const { ethers } = require("ethers");


Modal.setAppElement(document.getElementById("root"));

const networks = {
  mainnet: 1,
  "0x1": 1,
  polygon: 137,
  "0x89": 137,
  ropsten: 3,
};

const style = {
  wrapper: `w-screen flex items-center justify-center mt-14 font-mono `,
  content: `bg-gradient-radial from-orange-500 to-orange-200 w-[40rem] rounded-2xl p-4 drop-shadow-2xl`,
  formHeader: `px-2 my-6 flex items-center justify-between text-black text-2xl`,
  transferPropContainer: `bg-orange-200 my-3 text-black rounded-2xl p-6 text-3xl flex-initial justify-between`,
  transferPropInput: `bg-transparent placeholder:text-black[-15%] outline-none mb-4 w-full text-md`,
  currencySelector: `flex `,
  currencySelectorContent: `space-x-2 bg-orange-300 h-min drop-shadow-lg flex items-center hover:bg-orange-300 rounded-md font-normal text-base cursor-pointer p-2`,
  currencySelectorIcon: ` shrink-0 flex items-center`,
  currencySelectorTicker: ``,
  currencySelectorArrow: `text-lg`,
  confirmButton: `bg-orange-500 my-2 rounded-2xl py-4 px-8 text-xl font-semibold flex items-center justify-center cursor-pointer hover:bg-orange-400 `,
  selectATokenButton: `bg-zinc-300 my-2 py-4 px-8 text-xl font-semibold flex items-center justify-center cursor-pointer border border-zinc-600 hover:border-zinc-500`,
  connectWalletButton: `bg-red-100 my-2 rounded-2xl py-4 px-8 text-xl font-semibold flex items-center justify-center cursor-pointer border hover:bg-red-200 hover:border hover:border-red text-red-400`,
  modalWrapper: `p-2`,
  modalContent: ``,
  modalHeader: `flex justify-between items-center mb-2 text-xl text-black`,
  modalInputContainer: `bg-orange-300 md:text-xl sm:text-xs rounded-2xl py-3 border border-black`,
  modalInput: `focus:outline-none bg-orange-300 ml-4 w-[90%] text-black`,
  modalTokenContainer: `mt-4 flex-wrap flex items-center`,
  modalTokenButton: `pr-6 bg-orange-300 hover:bg-orange-400 text-black p-2 rounded-lg my-2 flex items-center`,
  modalTokenButtonContainer: `mr-2`,
  modalTokenIcon: `mr-2 h-[20px] w-[20px]`,
};

const customStyles = {
  content: {
    top: "25%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    width: "30%",
    borderRadius: "1rem",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgb(236,214,189)",
  },
};

toast.configure();
const SwapPanel = () => {
  const { Moralis, account, chainId, isAuthenticated } = useMoralis();
  const Web3Api = useMoralisWeb3Api();
  const { data: balance } = useNativeBalance(account);
  const [currentTokenBalance, setCurrentTokenBalance] = useState();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [sourceModalIsOpen, setSourceIsOpen] = React.useState(false);
  const [currentChainId, setCurrentChainId] = useState("");
  const [maxBalance, setMaxBalance] = useState(false);
  const [sourceToken, setSourceToken] = useState({
    token: "Select a token",
    image: "",
    address: "",
    decimals: "",
  });
  const [destToken, setDestToken] = useState({
    token: "Select a token",
    image: "",
    address: "",
    decimals: "",
  });
  const [userTokens, setUserTokens] = useState();
  const [gasCost, setGasCost] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [destAmount, setDestAmount] = useState("");
  const [destEstimatedValue, setdestEstimatedValue] = useState("0.0");
  const [srcEstimatedValue, setsrcEstimatedValue] = useState("0.0");
  const [sourceAmount, setSourceAmount] = useState("");
  const API_URL = "https://apiv5.paraswap.io"; // Add the .env file
  const txURL = `${API_URL}/transactions/${networks[chainId]}`;

  const transactionFailed = () => {
    toast.error("User rejected transaction.", { autoClose: 2000 });
  };

  const fetchTokenBalances = async () => {
    if(chainId != null){
      const options = {chain: chainId}
      const balances = await Web3Api.account.getTokenBalances(options);
      setUserTokens(balances);
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSourceLoading, setSourceIsLoading] = useState(false);
  const handleKeyUp = (e) =>
    setTimeout(function () {
      setSourceAmount(e.target.value);
    }, 5000);

  useEffect(() => {
    if (
      destToken.address != "" &&
      sourceToken.address != "" &&
      sourceAmount != ""
    ) {
      getRate();
    }
    else if (sourceAmount == ""){
      setDestAmount("");
      setGasCost("");
      setdestEstimatedValue("0.0");
      setsrcEstimatedValue("0.0");

    }

    if(!chainId) return null;
    setCurrentChainId(chainId);

    fetchTokenBalances();


  }, [sourceAmount, destToken, tokenList, sourceToken, chainId]);

  function useTotalBalance() {
    if(sourceToken.address == "") return null;
    userTokens.filter((item) => {
      if(item.token_address === sourceToken.address){
        setSourceAmount(parseFloat(Moralis.Units.FromWei(item.balance)).toFixed(9));
      }
      else if(sourceToken.token === "MATIC"){
        if(chainId === "0x89") {
          setSourceAmount(parseFloat(Moralis.Units.FromWei(balance.balance)).toFixed(9));
        }
      }
      else if (sourceToken.token === "ETH"){
        if(chainId === "0x1"){
          setSourceAmount(parseFloat(Moralis.Units.FromWei(balance.balance)).toFixed(9));
        }
      }
    })

  }

  function openModal() {
    setIsOpen(true);
  }

  function selectToken(source, data){
    if(source == "source"){
      setSourceToken({
        token: data.name,
        image: data.image,
        address: data.address,
        decimals: data.decimals,
      });
      const test = userTokens.filter((item) => item.token_address === data.address);
      if(data.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
        const value = parseFloat(ethers.utils.formatEther(balance.balance)).toFixed(6);
        setCurrentTokenBalance(value + " " + data.name);
        setMaxBalance(true);
      }
      else if(test.length > 0){
        const value = parseFloat(ethers.utils.formatEther(test[0].balance)).toFixed(6);
        setCurrentTokenBalance(value + " " + test[0].symbol);
        setMaxBalance(true);
      }
      else {setCurrentTokenBalance(""); setMaxBalance(false);}
    } else if (source == "destination"){
      setDestToken({
        token: data.name,
        image: data.image,
        address: data.address,
        decimals: data.decimals,
      });
    }
    closeModal();
  }

  function openSourceModal() {
    setSourceIsOpen(true);
  }

  const handleChange = (e) => {
    setSourceAmount(e.target.value);
  };

  function afterOpenModal() {}

  function closeModal() {
    setIsOpen(false);
    setSourceIsOpen(false);
  }

  async function calculateSwap() {
    if (sourceAmount == "") {
      toast.error("Please enter source token value.");
      return;
    }

    const priceRoute = await getRate();

    const builSwap = {
      srcToken: sourceToken.address,
      destToken: destToken.address,
      srcAmount: priceRoute.srcAmount,
      destAmount: new BigNumber(priceRoute.destAmount)
      .times(1 - 1 / 100)
      .toFixed(0),
      //slippage: "200",
      priceRoute: priceRoute,
      userAddress: account,
      partnerFeeBps: "200",
      partnerAddress: "0xa5112a2C64505D4b5c83261CD52B7a2fAF48C05C", 
      partner: "Deadlocke",
      network: networks[chainId]
    };

    try {
      const txData = await axios.post(txURL, builSwap);
      if (txData) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const params = txData.data;
        txData.data["gas"] = ethers.utils.hexlify(parseInt(txData.data["gas"]));
        txData.data["gasPrice"] = ethers.utils.hexlify(
          parseInt(txData.data["gasPrice"])
        );
        txData.data["value"] = ethers.BigNumber.from(txData.data["value"]).toHexString();

        const result = await window.ethereum
          .request({ method: "eth_sendTransaction", params: [params] })
          .then((transaction) => {
            if(chainId === "0x89")
              toast.success(<div><a target="_blank" href={`https://polygonscan.com/tx/${transaction}`}>Click To View Transaction</a> </div>);
            else if (chainId === "0x1")
            toast.success(<div><a target="_blank" href={`https://etherscan.com/tx/${transaction}`}>Click To View Transaction</a> </div>);
          })
          .catch((error) => {
            transactionFailed();
          });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  }

  async function getRate() {
    setIsLoading(true);
    try {
      const queryParams = {
        srcToken: sourceToken.address,
        srcDecimals: sourceToken.decimals,
        destToken: destToken.address,
        destDecimals: destToken.decimals,
        amount: Moralis.Units.Token(sourceAmount, sourceToken.decimals), // Get this value from the UI and use the BigNuber or ethers.util to get the correct value (ex: 1000000000000000000)
        side: "SELL",
        network: networks[chainId],
      };


      const searchString = new URLSearchParams(queryParams);
      const pricesURL = `${API_URL}/prices/?${searchString}`;
      const priceRoute = await axios.get(pricesURL).then((data) => {
        setDestAmount(
          parseFloat(
            Moralis.Units.FromWei(data.data.priceRoute.destAmount, destToken.decimals)
          ).toFixed(9)
        );
        setdestEstimatedValue(
          parseFloat(data.data.priceRoute.destUSD).toFixed(2)
        );
        setsrcEstimatedValue(
          parseFloat(data.data.priceRoute.srcUSD).toFixed(2)
        );
        return data.data.priceRoute;
      });
      setSourceIsLoading(false);
      setIsLoading(false);
      setGasCost(priceRoute.gasCostUSD);
      return priceRoute;
    } catch (error) {
      console.error(error.response.data.error);
    }
  }



  return (
    <div className={style.wrapper}>
      { isAuthenticated ? <>
      <div className={style.content}>
        <div className={style.formHeader}>
          <div>DeadSwap</div>
          <div>
            <RiSettings3Fill />
          </div>
        </div>
        {/* Source Input */}
        <div className={style.transferPropContainer}>
        {isSourceLoading ? (
            <div className="p-2 mb-4">
              <svg
                role="status"
                className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          ) : (
          <input
            id="sourceTokenInput"
            onKeyUp={handleKeyUp}
            type="number"
            step="0.1"
            min="0"
            max="5"
            className={style.transferPropInput}
            placeholder="0.0"
            pattern="^[0-9][.,]?[0-9]$"
            onChange={(e) => handleChange(e, "amount")}
            value={sourceAmount}
          />)}
          <div className="flex space-x-2">
            <div onClick={openSourceModal} className={style.currencySelector}>
              <div className={style.currencySelectorContent}>
                <div className={style.currencySelectorIcon}>
                  {sourceToken.image != "" && 
                  <img src={sourceToken.image} height={20} width={20} />
                  }
                </div>
                <div className={style.currencySelectorTicker}>{sourceToken.token}</div>
                <AiOutlineDown className={style.currencySelectorArrow} />
              </div>
            </div>
            {maxBalance != false && 
            <div className="mt-[-3px]">
              <button
                onClick={useTotalBalance}
                className="bg-orange-300 hover:bg-orange-500 to-orange-500 p-2 rounded-md text-base"
              >
                MAX
              </button>
            </div>
            }
          </div>
          <p className="text-base mt-4 text-gray-900 font-medium text-opacity-75 mb-[-15px]">
            Balance: {currentTokenBalance}
          </p>
          <p className="text-sm mt-4 text-gray-500 text-opacity-75 mb-[-15px]">
            Estimated Value: ${srcEstimatedValue}
          </p>
        </div>
        {/* <SourceInput srcUSD={srcEstimatedValue} /> */}
        <div className={style.transferPropContainer}>
          {isLoading ? (
            <div className="p-2 mb-4">
              <svg
                role="status"
                className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          ) : (
            <input
              type="text"
              className={style.transferPropInput}
              placeholder={destAmount}
              pattern="^[0-9]*[.,]?[0-9]*$"
              onChange={(e) => handleChange(e, "amount")}
              value={destAmount}
              disabled="true"
            />
          )}
          <div onClick={openModal} className={style.currencySelector}>
            <div className={style.currencySelectorContent}>
              <div className={style.currencySelectorIcon}>
                {destToken.image != "" && 
                  <img src={destToken.image} height={20} width={20} />
                  }
              </div>
              <div className={style.currencySelectorTicker}>
                {destToken.token}
              </div>
              <AiOutlineDown className={style.currencySelectorArrow} />
            </div>
          </div>
          {destEstimatedValue != "0.0" && (
            <div>
            <p className="text-sm mt-4 text-gray-500 text-opacity-75 mb-[-15px]">
              Estimated Value: ${destEstimatedValue}
            </p>
            <p className="text-sm mt-4 text-gray-500 text-opacity-75 mb-[-15px]">Estimated Gas Value: ${gasCost}</p>
            </div>
          )}
        </div>
        {true ? (
          <div onClick={() => calculateSwap()} className={style.confirmButton}>
            {" "}
            Swap Token{" "}
          </div>
        ) : (
          <div
            //onClick={() => connectWallet()}
            className={style.connectWalletButton}
          >
            {" "}
            Connect Wallet{" "}
          </div>
        )}
      </div>
      {/* Source Input Modal */}
      <Modal
        isOpen={sourceModalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className={style.modalWrapper}>
          <div className={style.modalHeader}>
            <p>Select source token</p>
            <p className="cursor-pointer" onClick={closeModal}>X</p>
          </div>
          <div className={style.modalInputContainer}>
            <input
              className={style.modalInput}
              type="text"
              placeholder="Search name or paste address"
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
            />
          </div>
          <div className={style.modalTokenContainer}>
            {chainId != null && tokenList[chainId].filter((val) => {
              if(searchTerm == "") return val;
              else if (val.name.toLowerCase().includes(searchTerm.toLowerCase())) return val;
            }).map((data, key) => {
              return (
                <div key={key} className={style.modalTokenButtonContainer}>
                  <button
                    onClick={() => {
                      selectToken("source", data);
                    }}
                    className={style.modalTokenButton}
                    type="button"
                  >
                    <img
                      className={style.modalTokenIcon}
                      src={data.image}
                      height={20}
                      width={20}
                    />
                    <p>{data.name}</p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
      {/* Destination Input Modal */}
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className={style.modalWrapper}>
          <div className={style.modalHeader}>
            <p>Select a token</p>
            <p>X</p>
          </div>
          <div className={style.modalInputContainer}>
            <input
              className={style.modalInput}
              type="text"
              placeholder="Search name or paste address"
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
            />
          </div>
          <div className={style.modalTokenContainer}>
            {chainId != null && tokenList[chainId].filter((val) => {
              if(searchTerm == "") return val;
              else if (val.name.toLowerCase().includes(searchTerm.toLowerCase())) return val;
            }).map((data, key) => {
              return (
                <div key={key} className={style.modalTokenButtonContainer}>
                  <button
                    onClick={() => {
                      selectToken("destination", data);
                    }}
                    className={style.modalTokenButton}
                    type="button"
                  >
                    <img
                      className={style.modalTokenIcon}
                      src={data.image}
                      height={20}
                      width={20}
                    />
                    <p>{data.name}</p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
      </> : null}
    </div>
  );
};

export default SwapPanel;
