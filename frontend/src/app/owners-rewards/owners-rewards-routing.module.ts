import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OwnersRewardsPage } from './owners-rewards.page';

const routes: Routes = [
  {
    path: '',
    component: OwnersRewardsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OwnersRewardsPageRoutingModule {}
