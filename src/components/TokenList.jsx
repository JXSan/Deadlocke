import ethLogo from "../assets/eth.png";
import axsLogo from "../assets/axs-logo.png"
import daiLogo from "../assets/dai-logo.png"
import manaLogo from "../assets/mana-logo.png"
import maticLogo from "../assets/matic-logo.png"
import sandboxLogo from "../assets/sandbox-logo.png"
import usdcLogo from "../assets/usdc-logo.png"

const polygonList = [
  {
    name: "MANA",
    image: manaLogo,
    address: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
    decimals: 18,
  },
  {
    name: "MATIC",
    image: maticLogo,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
  },
  {
    name: "USDC",
    image: usdcLogo,
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    decimals: 6,
  },
  {
    name: "SAND",
    image: sandboxLogo,
    address: "0xbbba073c31bf03b8acf7c28ef0738decf3695683",
    decimals: 18,
  },
  {
    name: "DAI",
    image: daiLogo,
    address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    decimals: 18,
  },
];

const ethereumList = [
  {
    name: "USDC",
    image: usdcLogo,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  {
    name: "ETH",
    image: ethLogo,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
  },
  {
    name: "WRLD",
    image: "",
    address: "0xd5d86fc8d5c0ea1ac1ac5dfab6e529c9967a45e9",
    decimals: 18,
  },
  {
    name: "AXS",
    image: axsLogo,
    address: "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
    decimals: 18,
  },
  {
    name: "SAND",
    image: sandboxLogo,
    address: "0x3845badade8e6dff049820680d1f14bd3903a5d0",
    decimals: 18,
  },
  {
    name: "MANA",
    image: manaLogo,
    address: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
    decimals: 18,
  },
  {
    name: "GOLDZ",
    image: "",
    address: "0x7be647634a942e73f8492d15ae492d867ce5245c",
    decimals: 18,
  },
  {
    name: "DAI",
    image: daiLogo,
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    decimals: 18,
  },
];

export const tokenList = {"0x1":ethereumList, "0x89":polygonList}
