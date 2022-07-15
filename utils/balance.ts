import { BigNumber } from "ethers";
import * as utils from ".";

export const getRawBalance = async (ethers: any, address: string) => {
  const prov = ethers.provider;
  const balance = await prov.getBalance(address);

  return ethers.BigNumber.from(balance);
};

export const getETH = (ethers: any, balance: any) => {
  return ethers.utils.formatEther(ethers.BigNumber.from(balance).toString());
};

export const getParsedIntETH = (ethers: any, balance: any) => {
  return parseInt(getETH(ethers, balance));
};

export const getFixedETH = (ethers: any, balance: any, fixed: number) => {
  return +(+getETH(ethers, balance)).toFixed(fixed);
};

export const getToken = (ethers: any, balance: any, decimal: number) => {
  return ethers.utils.formatUnits(
    ethers.BigNumber.from(balance).toString(),
    decimal
  );
};

export const swapTokens = async (
  uniswapRouter: any,
  signer: any,
  tokenAddress: string,
  tokenAmount: BigNumber = BigNumber.from("1")
) => {
  const deadline = (new Date(Date.now()).getTime() / 1000).toFixed(0) + 60 * 20;

  const uniTx = await uniswapRouter
    .connect(signer)
    .swapETHForExactTokens(
      tokenAmount,
      [utils.ethAddress, tokenAddress],
      signer.address,
      deadline,
      { value: "1000000000000000000000" }
    );
  await uniTx.wait();
};
