import React, { useState, useEffect } from "react";
import axios from "axios";
import { tokenList } from "../components/TokenList";
import BigNumber from "bignumber.js";
import { OptimalRate, SwapSide } from "paraswap-core";

const API_URL = "https://apiv5.paraswap.io";
const PARTNER_ADDRESS = "0xa5112a2C64505D4b5c83261CD52B7a2fAF48C05C";
const SLIPPAGE = 1; // 1%

const Networks = {
    MAINNET : 1,
    POLYGON : 137
  }

// const GetSwapTxInput = {
//     srcToken,
//     destToken,
//     srcAmount,
//     networkID,
//     slippage,
//     partner,
//     userAddress,
//     receiver
// }

const MinTokenData = {
    decimals: 0,
    symbol: "",
    address: ""
}

export async function getSwapTransaction(){
    // Get Source Token Details
    
    // Get Recieving Token Details

    // Calculate Source Amount

    // Build Price Route

    // Get Min Amount (Or Recieving Amount) based on Price Route

    // Build Transaction
}

getSwapTransaction();

//     srcAmount: "1",
//     srcToken: "MATIC",
//     destToken: "WBTC",
//     networkID: Networks.POLYGON,
//     userAddress: USER_ADDRESS

