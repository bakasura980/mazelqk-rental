import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public daoPages = [
    { title: 'All Cars', url: '/dao/list', icon: 'list' },
    { title: 'New Listing', url: '/dao/add', icon: 'add-circle' },
    {
      title: 'Car Evaluation',
      url: '/dao/eval',
      icon: 'car-sport',
    },
    {
      title: 'Protocol Earnings',
      url: '/dao/earn',
      icon: 'cash',
    },
  ];
  public ownersPages = [
    { title: 'Rewards', url: '/owners/rewards', icon: 'people' }, // claim
  ];
  public rentersPages = [
    { title: 'Profile', url: '/renters/profile', icon: 'person' }, // rent, return, extend
    { title: 'All Cars', url: '/renters/list', icon: 'car-sport' }, // all availiable cars
  ];
  constructor() {}
}
