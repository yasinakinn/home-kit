import { Component, Injectable, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController, AlertController } from '@ionic/angular';
import { AddRoomPage } from '../add-room/add-room.page';
import { RoomPage } from '../room/room.page';
import { ControllerService } from '../services/controller.service';

@Injectable()
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isWidgetEmpty;
  widgets = [];
  widgetValue:any="~";

  scenes;
  rooms =[];
  devicesLength;
  isEmpty: boolean;
  scenesSlideOpts = {
    slidesPerView: 2,
    spaceBetween: 0,
    speed: 400
  };
  roomsSlideOpts = {
    slidesPerView: 2,
    spaceBetween: 0,
    speed: 400,
  };
  constructor(
    private storage: Storage,
    public modalCtrl: ModalController,
    public controller: ControllerService,
    public alertCtrl:AlertController
  ) {
    this.isWidgetEmpty = true;
    this.scenes = [
      {
        icon: "home",
        title: "Home"
      },
      {
        icon: "airplane",
        title: "Away"
      },
      {
        icon: "moon",
        title: "Night"
      },
      {
        icon: "alarm",
        title: "Get Up"
      },
    ];
    if (window.screen.width <= 360) {
      this.roomsSlideOpts = {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 400,
      };
    }
  }

  ngOnInit(){
    this.controller.MQTT().connect({ onSuccess: this.getWidgets.bind(this), onFailure: this.controller.onFail.bind(this) })
    this.getRooms();
  }

getWidgets(){
  this.storage.get("widgets").then((val)=>{
    if (val && val.length > 0) {
      this.isWidgetEmpty = false;
      this.widgets = val;
      console.log(this.widgets);
      
      this.widgets.forEach(element => {
        this.controller.client.subscribe(element.value,0)
        this.controller.client.onMessageArrived = this.widgetMessageArrived.bind(this);
      });
    }else{
      this.isWidgetEmpty = true;
    }
  })
}

widgetMessageArrived(message){
  let element = this.widgets.find(element => element.value === message.destinationName)
  let prefix = '';
  let postfix = '';
  let precision = 2;
  if (element.prefix) prefix = element.prefix; 
  if (element.postfix) postfix = element.postfix; 
  if (element.precision) precision = element.precision; 
  document.getElementById(message.destinationName).innerHTML = prefix +  parseFloat(message.payloadString).toFixed(precision) + postfix;
}

  getRooms(){
    if (window.screen.width <= 360) {
      this.roomsSlideOpts = {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 400,
      };
    }
    if (window.screen.width >= 768) {
      this.scenesSlideOpts = {
        slidesPerView: 4,
        spaceBetween: 0,
        speed: 400
      };
    }
    this.storage.get("rooms").then((res) => {
      if (res.length > 0 && res) {
        this.isEmpty = true;
        this.rooms = res;
        if (this.rooms.length == 1) {
          this.roomsSlideOpts = {
            slidesPerView: 1,
            spaceBetween: 0,
            speed: 400,
          };
        }
      }else{
        this.isEmpty = false;
      }
    });
  }


  async addRooms() {
    const modal = await this.modalCtrl.create({
      component: AddRoomPage,
      mode:"ios"
    });
    modal.onDidDismiss().then(()=>{
    this.getRooms();      
    })
    return await modal.present();
  }

  async openRoom(id) {
    const modal = await this.modalCtrl.create({
      component: RoomPage,
      componentProps: {
        'roomData':this.rooms.find(element => element.id === id)
      },
      mode:"ios"
    });
    modal.onDidDismiss().then(()=>{
      this.getWidgets();
    this.getRooms();      
    })
    return await modal.present();
  }

  async presentAlertConfirm(widget) {
    console.log(widget);
    
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Do you want to delete this widget?',
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
            this.widgets.forEach((element,i) => {
              if (element.id == widget.id) {
                this.widgets.splice(i, 1 );
              }
            });
            console.log(this.widgets);
            this.storage.set("widgets", this.widgets);
          }
        }
      ]
    });
    alert.onDidDismiss().then(()=>{
      this.getWidgets();    
    })
    await alert.present();
  }

}
