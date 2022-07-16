import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RentersProfilePageRoutingModule } from './renters-profile-routing.module';

import { RentersProfilePage } from './renters-profile.page';

import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RentersProfilePageRoutingModule,
    NgChartsModule,
  ],
  declarations: [RentersProfilePage],
})
export class RentersProfilePageModule {}
