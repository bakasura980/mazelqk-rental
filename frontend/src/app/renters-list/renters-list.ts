import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RentersListPageRoutingModule } from './renters-list-routing.module';

import { RentersListPage } from './renters-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RentersListPageRoutingModule,
  ],
  declarations: [RentersListPage],
})
export class RentersListPageModule {}
