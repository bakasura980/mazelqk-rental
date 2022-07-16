import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DaoAddPageRoutingModule } from './dao-add-routing.module';

import { DaoAddPage } from './dao-add.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DaoAddPageRoutingModule],
  declarations: [DaoAddPage],
})
export class DaoAddPageModule {}
