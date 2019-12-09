import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRoomPageRoutingModule } from './add-room-routing.module';

import { AddRoomPage } from './add-room.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddRoomPageRoutingModule
  ],
  declarations: [AddRoomPage]
})
export class AddRoomPageModule {}
