import { Injectable } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';

@Injectable()
export class ControllerService {
  mqtt;
  reconnectTimeout = 2000;
  host = "3.123.138.65"
  port = 9001;
  mac;
  mod;
  out_msg;
  message;
  public client: Paho.MQTT.Client;
  mqttCounter = 0;

  constructor() { }



  MQTT() {
    this.mqttCounter++;
    this.client = new Paho.MQTT.Client(this.host, this.port, "smach" + Math.floor(Math.random() * 9000) + 1000);
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
    console.log("Connected after lost");

  }

  onFail() {
    if (this.client.isConnected() == false) {
      this.MQTT().connect({ onSuccess: this.onConnected.bind(this), onFailure: this.onFail.bind(this) });
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