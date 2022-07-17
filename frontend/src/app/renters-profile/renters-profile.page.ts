import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartOptions } from 'chart.js';
import { ethers } from 'ethers';
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

  public cars = [];

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

    const cars = await this.eth.getAll();
    console.log('cars', cars);
    this.cars = cars;

    const currentBLock = await this.eth.blockStamp();

    for (let index = 0; index < cars.length; index++) {
      const car = cars[index];
      car.index = index;
      if (car.status === 1) {
        console.log(car.start.toString());
        console.log(car.end.sub(currentBLock).toString());
      }

      this.pieChartDatasets = [
        {
          data: [currentBLock - +car.start, +car.end - currentBLock],
        },
      ];
    }
  }

  async connect() {
    this.eth.connect();
    this.balance = await this.eth.getBalance();
  }

  async headBack(carId: any) {
    const res = await this.eth.headBack(carId);
    console.log('res', res);
  }

  async extend(carId: any) {
    const res = await this.eth.extend(carId);
    console.log('res', res);
  }
}
