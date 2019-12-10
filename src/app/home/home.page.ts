import { Component, Injectable, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HttpClient } from '@angular/common/http';
import { Paho } from 'ng2-mqtt/mqttws31';
import { Storage } from '@ionic/storage';
import { ModalController } from '@ionic/angular';
import { AddRoomPage } from '../add-room/add-room.page';
import { RoomPage } from '../room/room.page';

@Injectable()
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mqtt;
  reconnectTimeout = 2000;
  host = "3.123.138.65"
  port = 9001;
  public client: Paho.MQTT.Client;

  temperatureOutside;
  descriptions;
  temperatureIndoor:any;
  humidityIndoor;
  weatherImg;

  scenes;
  rooms =[];
  isEmpty: boolean;
  scenesSlideOpts = {
    slidesPerView: 4,
    spaceBetween: 0,
    speed: 400
  };
  roomsSlideOpts = {
    slidesPerView: 2,
    spaceBetween: 0,
    speed: 400,
  };
  constructor(
    private geolocation: Geolocation,
    public httpClient: HttpClient,
    private storage: Storage,
    public modalCtrl: ModalController
  ) {
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
    this.MQTT().connect({ onSuccess: this.onConnected.bind(this), onFailure: this.onFail.bind(this) });
    this.temperatureIndoor = "~";
    this.temperatureOutside ="~";
    this.weatherImg = "/assets/sun.svg"
  }

  ngOnInit(){
    this.getWeather();
    this.getRooms();
  }


  getWeather(){
    this.geolocation.getCurrentPosition().then((data) => {
      let url = "http://api.weatherstack.com/current?access_key=3ff6d77fb5981d97702375812e7ab5b9&query=" + data.coords.latitude + "," + data.coords.longitude
      this.httpClient.get(url).subscribe((resa) => {
        console.log(resa);
        
        this.temperatureOutside = resa["current"].temperature;
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
        this.weatherImg = "https://weatherstack.com/site_images/weather_icon_"+iconClass+".svg"
      });
    });    

  }

  getRooms(){
    this.storage.length().then((res) => {
      if (res > 0) {
        this.isEmpty = true;
        this.storage.get("rooms").then((val) => {
          this.rooms = val;
        });
      }else{
        this.isEmpty = false;
      }
    });
  }

  MQTT() {
    this.client = new Paho.MQTT.Client(this.host, this.port, "homeKit" + Math.floor(Math.random() * 9000) + 1000);
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    return this.client;
  }

  onConnectionLost(responseObject) {
    console.log("Connection lost, trying reconnect");
    if (this.client.isConnected() == false) {
      this.MQTT().connect({ onSuccess: this.onConnected.bind(this), onFailure: this.onFail.bind(this) });

    }
  }

  onConnected() {
    console.log("Connected as " + this.client["clientId"] + " to " + this.host);
    this.client.subscribe("ofis/sicaklik", 0);
    this.client.subscribe("ofis/nem", 0);
  }

  onFail() {
    if (this.client.isConnected() == false) {
      this.MQTT().connect({ onSuccess: this.onConnected.bind(this), onFailure: this.onFail.bind(this) });
    }
  }

  onMessageArrived(message) {
    switch (message.destinationName) {
      case "ofis/sicaklik":
        this.temperatureIndoor = message.payloadString;
        this.temperatureIndoor = parseFloat(this.temperatureIndoor).toFixed(1);
        break;
      case "ofis/nem":
        this.humidityIndoor = message.payloadString;
        this.humidityIndoor = parseFloat(this.humidityIndoor).toFixed(1);
        
        break;

      default:
        break;
    }
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
    console.log();
    const modal = await this.modalCtrl.create({
      component: RoomPage,
      componentProps: {
        'roomData':this.rooms.find(element => element.id === id)
      },
      mode:"ios"
    });
    modal.onDidDismiss().then(()=>{
    this.getRooms();      
    })
    return await modal.present();
  }
}
