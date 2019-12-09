import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.page.html',
  styleUrls: ['./add-room.page.scss'],
})
export class AddRoomPage implements OnInit {

  roomType;
  roomName;
  roomId;
  roomImage;
  constructor(
    public modalCtrl: ModalController,
    private storage: Storage
  ) { }

  ngOnInit() {
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  typeChange() {
    switch (this.roomType) {
      case "office":
        this.roomImage = "/assets/img/bed.svg";
        break;
      case "bed":
        this.roomImage = "/assets/img/bed.svg";
        break;
      case "kitchen":
        this.roomImage = "/assets/img/bed.svg";
        break;
      case "living":
        this.roomImage = "/assets/img/bed.svg";
        break;
      case "child":
        this.roomImage = "/assets/img/bed.svg";
        break;
      default:
        break;
    }
  }

  addRoom() {
    if (this.roomName && this.roomType) {
      this.roomId = this.generateHexString(10);
      let json = [];
      json.push({
        id: this.roomId,
        name: this.roomName,
        type: this.roomType,
        image: this.roomImage,
        devices:[]
      });
      console.log(json, this.roomId);
  
      this.storage.length().then((res) => {
        if (res > 0) {
          this.storage.get("rooms").then((val) => {
            if (val == null) {
              this.storage.set("rooms", json);
            } else {
              val.forEach(element => {
                json.push(element)
              });
              this.storage.set("rooms", json);
  
            }
          });
        } else {
          this.storage.set("rooms", json);
        }
      });
      setTimeout(() => {
        this.dismiss()
      }, 100);
    }else{
      console.log("asda");
      
    }

  }

  generateHexString(length) {
    var ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0, length);
  }

}
