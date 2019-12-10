import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, AlertController } from '@ionic/angular';
import { AddDevicePage } from '../add-device/add-device.page';
import { Storage } from '@ionic/storage';
import { ControllerService } from '../services/controller.service';
@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {
  room;
  devices;
  isDevicesEmpty: boolean;
  text;
  constructor(
    public navParams: NavParams,
    private storage: Storage,
    public modalCtrl: ModalController,
    public controller:ControllerService,
    public alertController: AlertController
  ) {
    this.room = navParams.get('roomData');

    this.devices = this.room.devices;
    if (this.devices.length == 0) {
      this.isDevicesEmpty = false;
    } else {
      this.isDevicesEmpty = true;

    }

  }

  ngOnInit() {
    this.controller.MQTT().connect({ onSuccess: this.onConnected.bind(this)});

  }

  onConnected(){
    console.log("connected aq");
    this.getDevices();
  }

  getDevices() {
    this.storage.get("rooms").then((val) => {
      this.room = val.find(element => element.id === this.room.id);
      this.devices = this.room.devices;
      this.devices.forEach(element => {
        switch (element.deviceType) {
          case "text":
            this.controller.client.subscribe(element.deviceTopic,0)
            this.controller.client.onMessageArrived = this.textMessageArrived.bind(this);
            break;
            case "switch":
                this.controller.client.subscribe(element.deviceTopic,0)
              break;
        
          default:
            break;
        }
      });
      if (this.devices.length == 0) {
        this.isDevicesEmpty = false;
      } else {
        this.isDevicesEmpty = true;
  
      }
    })
  }

  textMessageArrived(message){
    this.text = message.payloadString;
    if (isNaN(this.text) == false) {
      
    this.text = parseFloat(this.text).toFixed(1);
    }
    document.getElementById(message.destinationName).innerHTML = this.text;
    
  }


  dismiss() {
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

  toggleChange(bool,device){
    switch (bool) {
      case true:
          this.controller.sendMessage(device.onEvent,device.deviceTopic);
        break;
        case false:
            this.controller.sendMessage(device.offEvent,device.deviceTopic);
          break;
    
      default:
        break;
    }
    
  }

  async presentAlertPrompt(device) {
    let inputs = [];
    let buttons = [];
    switch (device.deviceType) {
      case "text":
        inputs = [
          {
            name: 'deviceName',
            type: 'text',
            value: device.deviceName,
            placeholder: 'Insert new name'
          },
          {
            name: 'deviceTopic',
            type: 'text',
            value: device.deviceTopic,
            placeholder: 'Insert new topic'
          }
        ];
        buttons = [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          },
          {
            text: 'Delete',
            cssClass: 'danger',
            handler: () => {
              this.room.devices.forEach((element,i) => {
                if (element.deviceId == device.deviceId) {
                  this.room.devices.splice(i, 1 );
                }
              });
              this.storage.get("rooms").then((val) => {
                val.forEach((element, i) => {
                  if (element.id == this.room.id) {
                    val[i] = this.room
                  }
                });
                this.storage.set("rooms", val);
              });  
            }
          },
          {
            text: 'Ok',
            handler: (data) => {
              device.deviceName = data.deviceName;
              device.deviceTopic = data.deviceTopic;
              this.room.devices.forEach((element,i) => {
                if (element.deviceId == device.deviceId) {
                  element = device;
                }
              });
              this.storage.get("rooms").then((val) => {
                val.forEach((element, i) => {
                  if (element.id == this.room.id) {
                    val[i] = this.room
                  }
                });
                this.storage.set("rooms", val);
              });  
            }
          }
        ]
        break;
        case "switch":
            inputs = [
              {
                name: 'deviceName',
                type: 'text',
                value: device.deviceName,
                placeholder: 'Insert new name'
              },
              {
                name: 'deviceTopic',
                type: 'text',
                value: device.deviceTopic,
                placeholder: 'Insert new topic'
              },
              {
                name: 'onEvent',
                type: 'text',
                value: device.onEvent,
                placeholder: 'Insert new on event'
              },
              {
                name: 'offEvent',
                type: 'text',
                value: device.offEvent,
                placeholder: 'Insert new off event'
              }
            ];
            buttons =[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  console.log('Confirm Cancel');
                }
              },
              {
                text: 'Delete',
                cssClass: 'danger',
                handler: () => {
                  this.room.devices.forEach((element,i) => {
                    if (element.deviceId == device.deviceId) {
                      this.room.devices.splice(i, 1 );
                    }
                  });
                  this.storage.get("rooms").then((val) => {
                    val.forEach((element, i) => {
                      if (element.id == this.room.id) {
                        val[i] = this.room
                      }
                    });
                    this.storage.set("rooms", val);
                  });  
                }
              },
              {
                text: 'Ok',
                handler: (data) => {
                  device.deviceName = data.deviceName;
                  device.deviceTopic = data.deviceTopic;
                  device.onEvent = data.onEvent;
                  device.offEvent = data.offEvent
                  this.room.devices.forEach((element,i) => {
                    if (element.deviceId == device.deviceId) {
                      element = device;
                    }
                  });
                  this.storage.get("rooms").then((val) => {
                    val.forEach((element, i) => {
                      if (element.id == this.room.id) {
                        val[i] = this.room
                      }
                    });
                    this.storage.set("rooms", val);
                  });  
                }
              }
            ]
            
            break;
    
      default:
        break;
    }
    const alert = await this.alertController.create({
      header: 'Edit Device',
      inputs: inputs,
      buttons: buttons,
      mode:"ios"
    });

    alert.onDidDismiss().then(()=>{
      this.getDevices();
      
    })
    await alert.present();
  }

}
