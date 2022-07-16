import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DaoAddPage } from './dao-add.page';

const routes: Routes = [
  {
    path: '',
    component: DaoAddPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DaoAddPageRoutingModule {}
