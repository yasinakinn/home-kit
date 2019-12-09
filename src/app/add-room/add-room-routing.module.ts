import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddRoomPage } from './add-room.page';

const routes: Routes = [
  {
    path: '',
    component: AddRoomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddRoomPageRoutingModule {}
