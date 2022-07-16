import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
}
