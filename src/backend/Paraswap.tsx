import React, { useState, useEffect } from "react";
import axios from "axios";
import BigNumber from "bignumber.js";
import { OptimalRate, SwapSide } from "paraswap-core";


const API_URL = "https://apiv5.paraswap.io";
const PARTNER_ADDRESS = "0xa5112a2C64505D4b5c83261CD52B7a2fAF48C05C";
const SLIPPAGE = 1; // 1%

enum Networks {
  MAINNET = 1,
  POLYGON = 137
}

interface MinTokenData {
  decimals: number;
  symbol: string;
  address: string;
}

const tokens: Record<number, MinTokenData[]> = {
  [Networks.MAINNET]: [
    {
      decimals: 18,
      symbol: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    },
    {
      decimals: 6,
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    },
    {
      decimals: 18,
      symbol: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    }
  ],
  [Networks.POLYGON]: [
    {
      decimals: 18,
      symbol: "MATIC",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    },
    {
      decimals: 8,
      symbol: "WBTC",
      address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
    },
    {
      decimals: 18,
      symbol: "MANA",
      address: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
    },
    {
      decimals: 18,
      symbol: "SAND",
      address: "0xbbba073c31bf03b8acf7c28ef0738decf3695683",
    },
    {
      decimals: 6,
      symbol: "USDC",
      address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    },
  ]
};

function getToken(symbol: Symbol, networkID = Networks.MAINNET): MinTokenData {
  const token = tokens[networkID]?.find((t) => t.symbol === symbol);

  if (!token)
    throw new Error(`Token ${symbol} not available on network ${networkID}`);
  return token;
}

/**
 * @type ethereum address
 */
type Address = string;
/**
 * @type Token symbol
 */
type Symbol = string;
/**
 * @type number as string
 */
type NumberAsString = string;

interface TransactionParams {
  to: Address;
  from: Address;
  value: NumberAsString;
  data: string;
  gasPrice: NumberAsString;
  gas?: NumberAsString;
  chainId: number;
}

interface Swapper {
  getRate(params: {
    srcToken: Pick<MinTokenData, "address" | "decimals">;
    destToken: Pick<MinTokenData, "address" | "decimals">;
    srcAmount: NumberAsString;
    partner?: string;
  }): Promise<OptimalRate>;
  buildSwap(params: {
    srcToken: Pick<MinTokenData, "address" | "decimals">;
    destToken: Pick<MinTokenData, "address" | "decimals">;
    srcAmount: NumberAsString;
    minAmount: NumberAsString;
    priceRoute: OptimalRate;
    userAddress: Address;
    receiver?: Address;
    partner?: string;
  }): Promise<TransactionParams>;
}

function createSwapper(networkID: number, apiURL: string): Swapper {
  type PriceQueryParams = {
    srcToken: string;
    destToken: string;
    srcDecimals: string;
    destDecimals: string;
    amount: string;
    side: SwapSide;
    network: string;
  };

  const getRate: Swapper["getRate"] = async ({
    srcToken,
    destToken,
    srcAmount,
  }) => {
    const queryParams: PriceQueryParams = {
      srcToken: srcToken.address,
      destToken: destToken.address,
      srcDecimals: srcToken.decimals.toString(),
      destDecimals: destToken.decimals.toString(),
      amount: srcAmount,
      side: SwapSide.SELL,
      network: networkID.toString(),
    };

    const searchString = new URLSearchParams(queryParams);

    const pricesURL = `${apiURL}/prices/?${searchString}`;
    console.log("GET /price URL", pricesURL);

    const {
      data: { priceRoute }
    } = await axios.get<{ priceRoute: OptimalRate }>(pricesURL);

    return priceRoute;
  };

  interface BuildTxBody {
    srcToken: Address;
    destToken: Address;
    srcAmount: NumberAsString;
    destAmount: NumberAsString;
    priceRoute: OptimalRate;
    userAddress: Address;
    partner?: string;
    receiver?: Address;
    srcDecimals?: number;
    destDecimals?: number;
    partnerFeeBps?: string;
    partnerAddress?: string;
  }

  const buildSwap: Swapper["buildSwap"] = async ({
    srcToken,
    destToken,
    srcAmount,
    minAmount,
    priceRoute,
    userAddress,
    receiver,
    partner
  }) => {
    const txURL = `${apiURL}/transactions/${networkID}`;

    const txConfig: BuildTxBody = {
      priceRoute,
      srcToken: srcToken.address,
      srcDecimals: srcToken.decimals,
      destToken: destToken.address,
      destDecimals: destToken.decimals,
      srcAmount,
      destAmount: minAmount,
      userAddress,
      partner,
      receiver,
      partnerAddress: "0xa5112a2C64505D4b5c83261CD52B7a2fAF48C05C",
      partnerFeeBps: "200"
    };

    const { data } = await axios.post<TransactionParams>(txURL, txConfig);

    return data;
  };

  return { getRate, buildSwap };
}

interface GetSwapTxInput {
  srcToken: Symbol;
  destToken: Symbol;
  srcAmount: NumberAsString; // in srcToken denomination
  networkID: number;
  slippage?: number;
  partner?: string;
  userAddress: Address;
  receiver?: Address;
}

export async function getSwapTransaction({
  srcToken: srcTokenSymbol,
  destToken: destTokenSymbol,
  srcAmount: _srcAmount,
  networkID,
  slippage = SLIPPAGE,
  ...rest
}: GetSwapTxInput): Promise<TransactionParams> {
  try {
    const srcToken = getToken(srcTokenSymbol, networkID);
    const destToken = getToken(destTokenSymbol, networkID);

    const srcAmount = new BigNumber(_srcAmount)
      .times(10 ** srcToken.decimals)
      .toFixed(0);

    const ps = createSwapper(networkID, API_URL);

    const priceRoute = await ps.getRate({
      srcToken,
      destToken,
      srcAmount
    });

    const minAmount = new BigNumber(priceRoute.destAmount)
      .times(1 - slippage / 100)
      .toFixed(0);

    const transactionRequest = await ps.buildSwap({
      srcToken,
      destToken,
      srcAmount,
      minAmount,
      priceRoute,
      ...rest
    });

    console.log("TransactionRequest", transactionRequest);

    return transactionRequest;
  } catch (error) {
    console.error(error.response.data);
    throw new Error(error.response.data.error);
  }
}

// export const getExampleSwapTransaction = () =>
//   getSwapTransaction({
//     srcAmount: "1",
//     srcToken: "MATIC",
//     destToken: "WBTC",
//     networkID: Networks.POLYGON,
//     userAddress: USER_ADDRESS
//   });