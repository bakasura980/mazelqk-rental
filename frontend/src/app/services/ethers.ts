import { Injectable } from '@angular/core';

import { ethers, Wallet } from 'ethers';
import { BehaviorSubject } from 'rxjs';
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

  //   sendTransaction(transaction) {
  //     return this.wallet.sendTransaction(transaction);
  //   }
}
