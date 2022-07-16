import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ethers } from 'ethers';
import { EthersService } from '../services/ethers';
@Component({
  selector: 'app-dao-add',
  templateUrl: './dao-add.page.html',
  styleUrls: ['./dao-add.page.scss'],
})
export class DaoAddPage implements OnInit {
  public folder: string;
  public balance: any;
  public currentAccount: boolean = false;
  public owners: any = [];
  public ownersValue: any = [];
  public price: any = 5;
  public carPicture: any = '';

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
  }

  async connect() {
    this.eth.connect();
    this.balance = await this.eth.getBalance();
  }

  removeOwner(i) {
    this.owners.splice(i, 1);
    this.ownersValue.splice(i, 1);
  }

  addOwner() {
    this.owners.push({ address: '', value: 5 });
    this.ownersValue.push(5);
  }

  async addCar() {
    const res = await this.eth.list(
      this.owners.map((o: any) => o.address),
      this.owners.map((o: any) =>
        ethers.utils.parseEther((o.value * 10).toString())
      ),
      ethers.utils.parseEther(this.price.toString()),
      this.carPicture,
      ethers.utils.parseEther((this.price / 10).toString()),
      ethers.utils.parseEther((this.price / 100).toString())
    );
    console.log('res', res);
  }
}
