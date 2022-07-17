import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ethers } from 'ethers';
import { EthersService } from '../services/ethers';
@Component({
  selector: 'app-dao-earn',
  templateUrl: './dao-earn.page.html',
  styleUrls: ['./dao-earn.page.scss'],
})
export class DaoEarnPage implements OnInit {
  public folder: string;
  public balance: any;
  public currentAccount: boolean = false;
  public b: any = 0;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        data: [12, 17, 19, 33, 44, 55, 58],
        label: 'Series A',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(255,128,0,0.4)',
      },
    ],
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: false,
  };
  public lineChartLegend = true;

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

    this.bal();
  }

  async connect() {
    this.eth.connect();
    this.balance = await this.eth.getBalance();
  }
  async bal() {
    this.b = ethers.utils.formatEther(await this.eth.vaultBal());
  }
}
