import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartOptions } from 'chart.js';
import { EthersService } from '../services/ethers';
@Component({
  selector: 'app-renters-profile',
  templateUrl: './renters-profile.page.html',
  styleUrls: ['./renters-profile.page.scss'],
})
export class RentersProfilePage implements OnInit {
  public folder: string;
  public balance: any;
  public currentAccount: boolean = false;

  public cars = [
    {
      name: 'Dream Honda',
      image:
        './assets/img/291873292_789011192285696_7434305738919711337_n.jpeg',
    },
  ];

  // Pie
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabels = [['Used'], ['Days Left']];
  public pieChartDatasets = [
    {
      data: [2, 8],
    },
  ];
  public pieChartLegend = true;
  public pieChartPlugins = [];

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

  async rent(days: any) {}
}
