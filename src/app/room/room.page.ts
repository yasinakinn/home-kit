import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { AddDevicePage } from '../add-device/add-device.page';
import { Storage } from '@ionic/storage';
import { MqttDirective } from '../mqtt.directive';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {
  room;
  devices;
  isDevicesEmpty: boolean;
  constructor(
    public navParams: NavParams,
    private storage: Storage,
    public modalCtrl: ModalController,
    public mqtt:MqttDirective
  ) {
    this.room = navParams.get('roomData');

    this.devices = this.room.devices;
    console.log(this.room);
    if (this.devices.length == 0) {
      this.isDevicesEmpty = false;
    } else {
      this.isDevicesEmpty = true;

    }

  }

  ngOnInit() {

  }

  getDevices() {
    this.storage.get("rooms").then((val) => {
      this.room = val.find(element => element.id === this.room.id);
      this.devices = this.room.devices

    })

  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  async addDevices() {
    const modal = await this.modalCtrl.create({
      component: AddDevicePage,
      componentProps: {
        'roomData': this.room
      },
      mode: "ios"
    });
    modal.onDidDismiss().then(() => {
      this.getDevices();
    })
    return await modal.present();
  }

  toggleChange(bool){
    console.log(bool);
    
  }

}
