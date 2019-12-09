import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddDevicePage } from './add-device.page';

const routes: Routes = [
  {
    path: '',
    component: AddDevicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddDevicePageRoutingModule {}
