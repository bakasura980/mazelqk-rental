// Compound
const Comptroller = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";
const cEtherAddress = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";
const cWBTCAddress = "0xccF4429DB6322D5C611ee964527D42E5d685DD6a";
const cUSDCAddress = "0x39AA39c021dfbaE8faC545936693aC917d5E7563";
const cDaiAddress = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
const compTokenAddress = "0xc00e94Cb662C3520282E6f5717214004A7f26888";

// tokens
const LINKAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const ethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDTAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const wBTCAddress = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const OGNAddress = "0x8207c1ffc5b6804f6024322ccf34f29c3541ae26";
const SPELLToken = "0x090185f2135308bad17527004364ebcc2d37e5f6";
const SNXToken = "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f";

// Aave
const AavePoolAddress = "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9";
const AaveOracleAddress = "0xA50ba011c48153De246E5192C8f9258A2ba79Ca9";
const AaveIncentivesController = "0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5";
const AaveProviderAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const wethGatewayAddress = "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04";
const aaveDataProviderAddress = "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d";

// Uniswap
const UniswapV2Router02Address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const aETH = "0x030ba81f1c18d280636f32af80b9aad02cf0854e";
const aUSDC = "0xf63b34710400cad3e044cffdcab00a0f32e33ecf";
const AaveToken = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";
const stkAaveToken = "0x4da27a545c0c5B758a6BA100e3a049001de870f5";
const UniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const UniswapV3SwapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const UniswapV3FeeTier100 = "100"; // 0.01%
const UniswapV3FeeTier500 = "500"; // 0.05%
const UniswapV3FeeTier3000 = "3000"; // 0.3%
const UniswapV3FeeTier10000 = "10000"; // 1%

// Chainlink
const ChainlinkPriceFeedBtcUsd = "0xf4030086522a5beea4988f8ca5b36dbc97bee88c";
const ChainlinkPriceFeedEthUsd = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419";
const ChainlinkPriceFeedUsdcUsd = "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6";
const ChainlinkPriceFeedUsdcEth = "0x986b5e1e1755e3c2440e960477f25201b0a8bbd4";
const ChainlinkPriceFeedDaiUsd = "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9";
const ChainlinkFeedRegistry = "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";
const ChainlinkETHAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ChainlinkBTCAddress = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const ChainlinkUSDAddress = "0x0000000000000000000000000000000000000348";

// Curve
const CRVToken = "0xD533a949740bb3306d119CC777fa900bA034cd52";
const MIMPoolAddress = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
const MIMTokens = [
  { name: "MIM", address: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B" },
  { name: "3Crv", address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490" },
];
const sUSDPoolAddress = "0xFCBa3E75865d2d561BE8D220616520c171F12851";
const sUSDTokenAddress = "0xC25a3A3b969415c80451098fa907EC722572917F";
const sUSDTokens = [
  { name: "DAI", address: daiAddress },
  { name: "USDC", address: USDCAddress },
  { name: "USDT", address: USDTAddress },
  { name: "sUSD", address: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51" },
];
const depositZap3Pool = "0xA79828DF1850E8a3A3064576f380D90aECDD3359";
const wUSTPoolAddress = "0xCEAF7747579696A2F0bb206a14210e3c9e6fB269";
const wUSTTokens = [
  { name: "UST", address: "0xCEAF7747579696A2F0bb206a14210e3c9e6fB269" },
  { name: "3Crv", address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490" },
];

// Convex
const boosterAddress = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
const sUSDConvexLPAddress = "0x11D200ef1409cecA8D6d23e6496550f707772F11";
const sUSDtokenId = 4;
const MIMConvexLPAddress = "0xabB54222c2b77158CC975a2b715a3d703c256F05";
const MIMtokenId = 40;
const WUSTConvexLPAddress = "0x2d2006135e682984a8a2eB74F5C87c2251cC71E9";
const WUSTtokenId = 59;
const CVXToken = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";

const maxUint =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const LendingProvider = {
  0: "Compound",
  1: "Aave",
};

export {
  USDCAddress,
  USDTAddress,
  LINKAddress,
  AavePoolAddress,
  AaveOracleAddress,
  AaveToken,
  stkAaveToken,
  AaveProviderAddress,
  AaveIncentivesController,
  aETH,
  aUSDC,
  Comptroller,
  cEtherAddress,
  cWBTCAddress,
  cUSDCAddress,
  cDaiAddress,
  compTokenAddress,
  daiAddress,
  ethAddress,
  wBTCAddress,
  OGNAddress,
  SPELLToken,
  SNXToken,
  wethGatewayAddress,
  aaveDataProviderAddress,
  UniswapV2Router02Address,
  UniswapV2FactoryAddress,
  UniswapV3FactoryAddress,
  UniswapV3SwapRouterAddress,
  UniswapV3FeeTier100,
  UniswapV3FeeTier500,
  UniswapV3FeeTier3000,
  UniswapV3FeeTier10000,
  ChainlinkPriceFeedBtcUsd,
  ChainlinkPriceFeedEthUsd,
  ChainlinkPriceFeedUsdcUsd,
  ChainlinkPriceFeedUsdcEth,
  ChainlinkPriceFeedDaiUsd,
  ChainlinkFeedRegistry,
  ChainlinkETHAddress,
  ChainlinkBTCAddress,
  ChainlinkUSDAddress,
  LendingProvider,
  CRVToken,
  MIMPoolAddress,
  sUSDPoolAddress,
  sUSDTokenAddress,
  depositZap3Pool,
  wUSTPoolAddress,
  MIMTokens,
  sUSDTokens,
  wUSTTokens,
  boosterAddress,
  sUSDtokenId,
  sUSDConvexLPAddress,
  MIMConvexLPAddress,
  MIMtokenId,
  WUSTConvexLPAddress,
  WUSTtokenId,
  CVXToken,
  maxUint,
};
