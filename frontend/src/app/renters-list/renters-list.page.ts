import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EthersService } from '../services/ethers';
@Component({
  selector: 'app-renters-list',
  templateUrl: './renters-list.page.html',
  styleUrls: ['./renters-list.page.scss'],
})
export class RentersListPage implements OnInit {
  public folder: string;
  public balance: any;
  public currentAccount: boolean = false;

  public cars: any = [];

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
    for (let index = 0; index < cars.length; index++) {
      const car = cars[index];
      car.index = index;
      if (car.status === 3) {
      }
    }
    console.log('cars', cars);
    this.cars = cars;
  }

  async connect() {
    this.eth.connect();
    this.balance = await this.eth.getBalance();
  }

  async rent(carId: any) {
    console.log('carId', carId);
    const res = await this.eth.rent(carId);
    console.log('res', res);
  }
}
