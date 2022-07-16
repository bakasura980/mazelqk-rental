import { Injectable } from '@angular/core';

import { ethers, Wallet } from 'ethers';
import { BehaviorSubject } from 'rxjs';

let vaultAddress = '0x682f6a3409a6A64D94b3DE642E33D9970531ff95';
let insuranceAddress = '0x682f6a3409a6A64D94b3DE642E33D9970531ff95';

const vaultAbi = require('../../../../artifacts/contracts/Vault.sol/Vault.json');

var url = 'http://localhost:8545';

@Injectable()
export class EthersService {
  signer: any;

  customHttpProvider = new ethers.providers.JsonRpcProvider(url);

  public currentUser$ = new BehaviorSubject<any>('');

  constructor() {
    window['ethereum'].on('accountsChanged', (accounts) => {
      /* do what you want here */
      console.log('acc changed', accounts);
      this.currentUser$.next(accounts && accounts[0]);
      this.signer = this.customHttpProvider.getSigner();
    });

    window['ethereum'].on('chainChanged', (chainId) => {
      /* do what you want here */
      /* full refresh is recommended */
      console.log('chain changed');
    });

    this.customHttpProvider.getBlockNumber().then((result) => {
      console.log('Current block number: ' + result);
    });
  }

  async getCurrentUser() {
    const eth_accounts = await window['ethereum'].request({
      method: 'eth_accounts',
    });

    this.currentUser$.next(eth_accounts && eth_accounts[0]);
    this.signer = this.customHttpProvider.getSigner();
    return eth_accounts;
  }

  async connect() {
    const chainId = await window['ethereum'].request({ method: 'eth_chainId' });
    console.log('chainId', chainId);

    const eth_requestAccounts = await window['ethereum'].request({
      method: 'eth_requestAccounts',
    });
    this.currentUser$.next(eth_requestAccounts && eth_requestAccounts[0]);
    this.signer = this.customHttpProvider.getSigner();
  }

  getBalance(): Promise<string> {
    return this.signer.getBalance();
  }

  //   signMessage(message: any): Promise<string> {
  //     return this.wallet.signMessage(message);
  //   }

  async list(owners, percents, price, carPicture, collateral, insuranceShare) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.list(
      owners,
      percents,
      price,
      carPicture,
      collateral,
      insuranceShare,
      2 * 60 * 60 * 24, // 2 day for reviewing
      insuranceAddress
    );
    console.log(res);

    return res;
  }

  async rent(tokenId) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.rent(tokenId);
    console.log(res);

    return res;
  }

  async headBack(tokenId) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.headBack(tokenId);
    console.log(res);

    return res;
  }

  async extend(tokenId) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.extend(tokenId);
    console.log(res);

    return res;
  }

  async skipDay() {
    const day = 6666;
    await this.customHttpProvider.send('hardhat_mine', [
      '0x' + day.toString(16),
      '0x' + (+13).toString(16),
    ]);
  }
}
