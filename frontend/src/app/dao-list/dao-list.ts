import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DaoListPageRoutingModule } from './dao-list-routing.module';

import { DaoListPage } from './dao-list.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DaoListPageRoutingModule],
  declarations: [DaoListPage],
})
export class DaoListPageModule {}
