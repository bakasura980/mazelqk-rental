import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DaoEvalPage } from './dao-eval.page';

const routes: Routes = [
  {
    path: '',
    component: DaoEvalPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DaoEvalPageRoutingModule {}
