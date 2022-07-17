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
    console.log('cars', cars);
    this.cars = cars;

    for (let index = 0; index < cars.length; index++) {
      const car = cars[index];
      car.index = index;
      if (car.status === 3) {
      }
    }
  }

  async connect() {
    this.eth.connect();
    this.balance = await this.eth.getBalance();
  }
  async eval(car) {
    await this.eth.eval(car.index, 90);
  }
  async repair(car) {
    await this.eth.repair(car.index);
  }
}
