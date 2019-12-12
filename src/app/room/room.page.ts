import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, AlertController } from '@ionic/angular';
import { AddDevicePage } from '../add-device/add-device.page';
import { Storage } from '@ionic/storage';
import { ControllerService } from '../services/controller.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {
  temperatureOutside;
  descriptions;
  humidityOutside;
  weatherImg;

  room;
  devices;
  isDevicesEmpty: boolean;
  text;

  constructor(
    private geolocation: Geolocation,
    public httpClient: HttpClient,
    public navParams: NavParams,
    private storage: Storage,
    public modalCtrl: ModalController,
    public controller: ControllerService,
    public alertController: AlertController
  ) {
    this.room = navParams.get('roomData');
    this.humidityOutside = "~";
    this.temperatureOutside = "~";
    this.weatherImg = "/assets/sun.svg"

    this.devices = this.room.devices;
    if (this.devices.length == 0) {
      this.isDevicesEmpty = false;
    } else {
      this.isDevicesEmpty = true;

    }

  }

  ngOnInit() {
    this.getWeather();
    this.getDevices();

  }

  getWeather() {
    this.geolocation.getCurrentPosition().then((data) => {
      let url = "http://api.weatherstack.com/current?access_key=3ff6d77fb5981d97702375812e7ab5b9&query=" + data.coords.latitude + "," + data.coords.longitude
      this.httpClient.get(url).subscribe((resa) => {
        console.log(resa);

        this.temperatureOutside = resa["current"].temperature;
        this.humidityOutside = resa["current"].humidity;
        this.descriptions = resa["current"].weather_descriptions[0];
        let iconClass;
        switch (this.descriptions) {

          case 'Partly Cloudy':
            iconClass = 'partly_cloudy';
            break;

          case 'Haze':
          case 'Overcast':
            iconClass = 'full_clouds';
            break;

          case 'Clear':
            iconClass = 'night';
            break;

          case 'Patchy Light Drizzle':
            iconClass = 'sun_rain_clouds';
            break;

          case 'Sunny':
            iconClass = 'full_sun';
            break;

          case 'Patchy Rain Possible':
            iconClass = 'cloud_slight_rain';
            break;

          case 'Light Rain':
          case 'Light Rain, Mist':
            iconClass = 'cloud_slight_rain';
            break;

          case 'Moderate Or Heavy Rain Shower':
            iconClass = 'rainy';
            break;

          case 'Thunder':
            iconClass = 'thunder';
            break;

          default:
            iconClass = 'full_clouds';
            break;

          // some may be missing 

        };
        this.weatherImg = "https://weatherstack.com/site_images/weather_icon_" + iconClass + ".svg"
      });
    });

  }

  getDevices() {
    this.storage.get("rooms").then((val) => {
      this.room = val.find(element => element.id === this.room.id);
      this.devices = this.room.devices;
      this.devices.forEach(element => {
        switch (element.deviceType) {
          case "text":
            this.controller.client.subscribe(element.deviceTopic, 1)
            this.controller.client.onMessageArrived = this.textMessageArrived.bind(this);
            break;
          case "switch":
            this.controller.client.subscribe(element.deviceTopic, 1)
            break;
          case "sensor":
            this.controller.client.subscribe(element.deviceTopic, 1)
            this.controller.client.onMessageArrived = this.textMessageArrived.bind(this);
            this.text = element.precision;
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

  textMessageArrived(message) {
    if (document.getElementById(message.destinationName + "0")) {
      document.getElementById(message.destinationName + "0").innerHTML = message.payloadString;
    }
    if (document.getElementById(message.destinationName + "1")) {
      let element = this.devices.find(element => element.deviceTopic === message.destinationName && element.deviceType == "sensor")
      let prefix = '';
      let postfix = '';
      let precision = 2;
      if (element.prefix) prefix = element.prefix; 
      if (element.postfix) postfix = element.postfix; 
      if (element.precision) precision = element.precision; 
      document.getElementById(message.destinationName + "1").innerHTML = prefix +  parseFloat(message.payloadString).toFixed(precision) + postfix;
 
    }


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

  toggleChange(bool, device) {
    switch (bool) {
      case true:
        this.controller.sendMessage(device.onEvent, device.deviceTopic);
        break;
      case false:
        this.controller.sendMessage(device.offEvent, device.deviceTopic);
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
            role: "delete",
            handler: () => {
              this.room.devices.forEach((element, i) => {
                if (element.deviceId == device.deviceId) {
                  this.room.devices.splice(i, 1);
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
            role: "ok",
            handler: (data) => {
              device.deviceName = data.deviceName;
              device.deviceTopic = data.deviceTopic;
              this.room.devices.forEach((element, i) => {
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
            role: "delete",
            handler: () => {
              this.room.devices.forEach((element, i) => {
                if (element.deviceId == device.deviceId) {
                  this.room.devices.splice(i, 1);
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
            role: 'ok',
            handler: (data) => {
              device.deviceName = data.deviceName;
              device.deviceTopic = data.deviceTopic;
              device.onEvent = data.onEvent;
              device.offEvent = data.offEvent
              this.room.devices.forEach((element, i) => {
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
      case "sensor":
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
            name: 'prefix',
            type: 'text',
            value: device.prefix,
            placeholder: 'Insert new prefix'
          },
          {
            name: 'postfix',
            type: 'text',
            value: device.postfix,
            placeholder: 'Insert new postfix'
          }, {
            name: 'precision',
            type: 'text',
            value: device.precision,
            placeholder: 'Insert new precision'
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
            role: "delete",
            handler: () => {
              this.room.devices.forEach((element, i) => {
                if (element.deviceId == device.deviceId) {
                  this.room.devices.splice(i, 1);
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
            role: "ok",
            handler: (data) => {
              device.deviceName = data.deviceName;
              device.deviceTopic = data.deviceTopic;
              device.prefix = data.prefix;
              device.postfix = data.postfix;
              device.precision = data.precision;
              this.room.devices.forEach((element, i) => {
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
              this.storage.get("widgets").then((val)=>{
                val.forEach((element,i) => {
                  if (element.value == device.deviceTopic) {
                    element.name = data.deviceName;
                    element.value = data.deviceTopic;
                    element.prefix = data.prefix;
                    element.postfix = data.postfix;
                    element.precision = data.precision;
                    val[i] = element;
                  } 
                });
                this.storage.set("widgets",val);
              })
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
      mode: "ios"
    });

    alert.onDidDismiss().then((e) => {
      if (e.role == "ok" || e.role == "delete") {
        this.getDevices();
      }
    })
    await alert.present();
  }

  async delete() {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete the room ?',
      mode:"ios",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.storage.get("rooms").then((val)=>{
              val.forEach((element,i) => {
                if (element.id == this.room.id) {
                  val.splice(i, 1 );
                }
              });
              this.storage.set("rooms",val);
            })
            this.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

}
