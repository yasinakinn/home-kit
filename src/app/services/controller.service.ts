import { Injectable } from '@angular/core';
import { Paho } from 'ng2-mqtt/index';

@Injectable()
export class ControllerService {
  reconnectTimeout = 2000;
  host = "test.mosquitto.org"
  port = 1883;
  mac;
  mod;
  out_msg;
  message;
  client;
  mqttCounter = 0;
  constructor() {
    this.mqttCounter++;

    this.client = new Paho.MQTT.Client(this.host, this.port, "randomName" + Math.floor(Math.random() * 9000) + 1000);

    console.log(12);
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
   }


  onConnectionLost(responseObject) {
    console.log("Connection lost, trying reconnect");
    if (this.client.isConnected() == false) {
      this.client.connect({ onSuccess: this.onConnected.bind(this), onFailure: this.onFail.bind(this) });

    }
  }

  onConnected() {
    if (this.mqttCounter > 0) {
      console.log("Connected after lost");      
    }else{
      console.log("Connected first time");
    }
    return 0;
  }

  onFail() {
    if (this.client.isConnected() == false) {
      this.client.connect({ onSuccess: this.onConnected.bind(this), onFailure: this.onFail.bind(this) });
    }
  }

  onMessageArrived(message) {
    return message
  }

  async sendMessage(msg,topic) {

    var message = new Paho.MQTT.Message(msg);
    message.destinationName = topic;
    this.client.send(message);
  }



}