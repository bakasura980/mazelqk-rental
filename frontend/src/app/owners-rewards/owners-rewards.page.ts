import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ethers } from 'ethers';
import { EthersService } from '../services/ethers';
@Component({
  selector: 'app-owners-rewards',
  templateUrl: './owners-rewards.page.html',
  styleUrls: ['./owners-rewards.page.scss'],
})
export class OwnersRewardsPage implements OnInit {
  public folder: string;
  public balance: any;
  public currentAccount: boolean = false;
  public cars: any = [];
  public users: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private eth: EthersService
  ) {}

  async ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');

    this.eth.currentUser$.subscribe((user: any) => {
      this.currentAccount = user;
    });
    await this.eth.getCurrentUser();
    this.balance = await this.eth.getBalance();

    const cars = await this.eth.getAll();
    console.log('cars', cars);
    this.cars = cars;

    const users: any = [
      {
        address: '0x4c973FF964802EB2e3591Df8B90E7696c397731a',
        balance: 0,
        img: 'https://avatarfiles.alphacoders.com/152/152686.jpg',
      },
      {
        address: '0x30584B0Ad3e1ee3b5e91D35bEF70f51290733361',
        balance: 0,
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvOF_V2y8_TW4xAWnImz8_CHEdJ3UMxNgWl89Zah9P9hLDwQB_KQL2jh5dBnPVDy2bHm4&usqp=CAU',
      },
      {
        address: '0xBc0be7Be754aA5FF00FdDbF8db6919a0073e0Fe8',
        balance: 0,
        img: 'https://avatarfiles.alphacoders.com/152/152391.jpg',
      },
    ];
    for (let index = 0; index < cars.length; index++) {
      const car = cars[index];
      car.index = index;

      for (let j = 0; j < users.length; j++) {
        users[j].balance += +(await this.eth.claimable(
          car.ownershipContract,
          users[j].address
        ));
      }
    }

    for (let j = 0; j < users.length; j++) {
      users[j].balance = ethers.utils.formatEther(users[j].balance.toString());
    }
    this.users = users;
    console.log('users', users);
  }

  async connect() {
    this.eth.connect();
    this.balance = await this.eth.getBalance();
  }
  async claimable(address: any) {
    const asd = await this.eth.claimable(
      address,
      '0x4c973FF964802EB2e3591Df8B90E7696c397731a'
    );

    console.log('asd', asd);
  }
  async claimRewards() {
    // this.eth.claimRewards();
    // this.balance = await this.eth.getBalance();
  }
}
