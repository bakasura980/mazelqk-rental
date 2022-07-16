import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DaoEvalPageRoutingModule } from './dao-eval-routing.module';

import { DaoEvalPage } from './dao-eval.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DaoEvalPageRoutingModule],
  declarations: [DaoEvalPage],
})
export class DaoEvalPageModule {}
