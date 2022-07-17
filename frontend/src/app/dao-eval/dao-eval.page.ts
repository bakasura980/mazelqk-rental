import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EthersService } from '../services/ethers';
@Component({
  selector: 'app-dao-eval',
  templateUrl: './dao-eval.page.html',
  styleUrls: ['./dao-eval.page.scss'],
})
export class DaoEvalPage implements OnInit {
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
