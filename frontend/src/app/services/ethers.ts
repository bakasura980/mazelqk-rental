import { Injectable } from '@angular/core';

import { ethers, Wallet } from 'ethers';
import { BehaviorSubject } from 'rxjs';

let vaultAddress = '0x682f6a3409a6A64D94b3DE642E33D9970531ff95';
let ownershipTokenAddress = '0x682f6a3409a6A64D94b3DE642E33D9970531ff95';
let insuranceAddress = '0x682f6a3409a6A64D94b3DE642E33D9970531ff95';

const vaultAbi = require('../../../../artifacts/contracts/Vault.sol/Vault.json');
const interestTokenAbi = require('../../../../artifacts/contracts/tokens/InterestToken.sol/InterestToken.json');
const ownershipTokenAbi = require('../../../../artifacts/contracts/tokens/OwnershipToken.sol/OwnershipToken.json');

var url = 'http://localhost:8545';
// var url = 'http://3db4-84-21-205-98.ngrok.io';

@Injectable()
export class EthersService {
  signer: any;

  customHttpProvider = new ethers.providers.Web3Provider(
    <any>window['ethereum'],
    'any'
  );

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

  async blockStamp() {
    const block = await this.customHttpProvider.getBlockNumber();
    return (await this.customHttpProvider.getBlock(block)).timestamp;
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

  async vaultBal() {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    const interestAddress = await contract.interestToken();
    const intToken = new ethers.Contract(
      interestAddress,
      interestTokenAbi.abi,
      this.signer
    );

    return await intToken.balanceOf(vaultAddress);
  }
  async list(owners, percents, price, carPicture, collateral, insuranceShare) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    // console.log(this.signer);
    let res = await contract.list(
      owners,
      percents,
      price,
      carPicture,
      collateral,
      insuranceShare,
      2 * 60 * 60 * 24, // 2 day for reviewing
      owners[0]
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

    let res = await contract.rent(tokenId, {
      value: ethers.utils.parseEther('20'),
      gasLimit: 30000000,
    });
    console.log(res);

    return res;
  }

  async headBack(tokenId) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );
    console.log('tokenId', tokenId);

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

    let res = await contract.extend(tokenId, {
      value: ethers.utils.parseEther('10'),
    });
    console.log(res);

    return res;
  }

  async getAll() {
    const asd = [];

    let counter = 0;
    do {
      const car = await this.carData(counter);
      const car1 = await this.carLease(counter);
      if (
        car.ownershipContract != '0x0000000000000000000000000000000000000000'
      ) {
        asd.push({ ...car, ...car1 });
        counter++;
      } else {
        break;
      }
    } while (true);

    return asd;
  }

  async carData(tokenId) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.carData(tokenId);
    console.log(res);

    return res;
  }
  async carLease(tokenId) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.carLease(tokenId);
    console.log(res);

    return res;
  }

  async eval(carId, status) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.damageReport(carId, status);
    console.log(res);

    return res;
  }
  async repair(carId) {
    const contract = new ethers.Contract(
      vaultAddress,
      vaultAbi.abi,
      this.signer
    );

    let res = await contract.repair(carId);
    console.log(res);

    return res;
  }

  async claimable(address, userAddress) {
    const contract = new ethers.Contract(
      address,
      ownershipTokenAbi.abi,
      this.signer
    );

    let res = await contract.claimable(userAddress);
    console.log(res);

    return res;
  }

  async skipDay() {
    const day = 6666;
    const asdProvider = new ethers.providers.JsonRpcProvider(url);

    await asdProvider.send('hardhat_mine', [
      '0x' + day.toString(16),
      '0x' + (+13).toString(16),
    ]);
  }
}
