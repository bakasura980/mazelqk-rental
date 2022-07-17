import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DaoEarnPageRoutingModule } from './dao-earn-routing.module';

import { DaoEarnPage } from './dao-earn.page';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DaoEarnPageRoutingModule,
    NgChartsModule,
  ],
  declarations: [DaoEarnPage],
})
export class DaoEarnPageModule {}
