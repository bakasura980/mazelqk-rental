import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OwnersRewardsPageRoutingModule } from './owners-rewards-routing.module';

import { OwnersRewardsPage } from './owners-rewards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OwnersRewardsPageRoutingModule,
  ],
  declarations: [OwnersRewardsPage],
})
export class OwnersRewardsPageModule {}
