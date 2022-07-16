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

  public cars = [
    {
      name: 'Dream Honda',
      image:
        './assets/img/291873292_789011192285696_7434305738919711337_n.jpeg',
    },
    {
      name: 'Dream Honda',
      image: './assets/img/188185245_783643235671334_344285917940311577_n.jpeg',
    },
    {
      name: 'Dream Honda',
      image:
        './assets/img/219000452_513050559969863_8064805744904538233_n.jpeg',
    },
  ];

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
