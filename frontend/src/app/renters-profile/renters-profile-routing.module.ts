import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RentersProfilePage } from './renters-profile.page';

const routes: Routes = [
  {
    path: '',
    component: RentersProfilePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RentersProfilePageRoutingModule {}
