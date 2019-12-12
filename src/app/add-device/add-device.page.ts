import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.page.html',
  styleUrls: ['./add-device.page.scss'],
})
export class AddDevicePage implements OnInit {
  room;
  deviceType;
  topic;
  deviceName;
  deviceImage;
  isSwitch;
  isText;
  isSensor;
  onEvent;
  offEvent;
  postfix;
  prefix;
  precision;

  isWidget: boolean = false;
  constructor(
    public modalCtrl: ModalController,
    public navParams: NavParams,
    private storage: Storage
  ) {
    this.room = navParams.get('roomData');
  }

  ngOnInit() {
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  typeChange(ev) {
    switch (this.deviceType) {
      case "text":
        this.deviceImage = "text"
        this.isSensor = false;
        this.isSwitch = false;


        break;
      case "switch":
        this.deviceImage = "switch"
        this.isText = false;
        this.isSensor = false;
        this.isSwitch = true;
        break;
      case "sensor":
        this.deviceImage = "eye"
        this.isText = false;
        this.isSensor = true;
        this.isSwitch = false;
        this.storage.get("widgets").then((val) => {
          if (val) {
            if (val.length > 3) {

              this.isText = false;
            } else {
  
              this.isText = true;
            }
          }else{
            this.isText = true;
          }

        })
        break;

      default:
        break;
    }
  }

  generateHexString(length) {
    var ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0, length);
  }

  addDevice() {
    let id = this.generateHexString(10);
    if (this.deviceName && this.deviceType && this.topic) {
      this.storage.get("rooms").then((val) => {
        val.forEach((element, i) => {
          if (element.id == this.room.id) {
            val[i].devices.push(
              {
                deviceName: this.deviceName,
                deviceType: this.deviceType,
                deviceTopic: this.topic,
                deviceImage: this.deviceImage,
                deviceId: id,
                onEvent: this.onEvent,
                offEvent: this.offEvent,
                prefix: this.prefix,
                postfix: this.postfix,
                precision: this.precision
              }
            )
          }
        });
        this.storage.set("rooms", val);
      });
      if (this.isWidget == true) {
        this.storage.get("widgets").then((val) => {
          if (val) {
            val.push({
              id:this.generateHexString(10),
              name: this.deviceName,
              value: this.topic,
              prefix: this.prefix,
              postfix: this.postfix,
              precision: this.precision
            })
            this.storage.set("widgets", val)
          } else {
            let widget = [{
              id:this.generateHexString(10),
              name: this.deviceName,
              value: this.topic,
              prefix: this.prefix,
              postfix: this.postfix,
              precision: this.precision
            }]
            this.storage.set("widgets", widget)
          }
        })
      }
      setTimeout(() => {
        this.dismiss()
      }, 100);
    } else {
      console.log("asda");

    }

  }

  setWidget() {

  }


}
