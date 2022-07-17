import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EthersService } from '../services/ethers';
@Component({
  selector: 'app-dao-list',
  templateUrl: './dao-list.page.html',
  styleUrls: ['./dao-list.page.scss'],
})
export class DaoListPage implements OnInit {
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
    }
  }

  async connect() {
    this.eth.connect();
    this.balance = await this.eth.getBalance();
  }
}
