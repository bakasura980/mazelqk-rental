import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RentersListPage } from './renters-list.page';

const routes: Routes = [
  {
    path: '',
    component: RentersListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RentersListPageRoutingModule {}
