import { Component, Injectable, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HttpClient } from '@angular/common/http';
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

  temperatureOutside;
  descriptions;
  humidityOutside;
  weatherImg;

  scenes;
  rooms =[];
  devicesLength;
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
    if (window.screen.width <= 360) {
      this.scenesSlideOpts = {
        slidesPerView: 2,
        spaceBetween: 0,
        speed: 400
      };
      this.roomsSlideOpts = {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 400,
      };
    }

    this.humidityOutside = "~";
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
