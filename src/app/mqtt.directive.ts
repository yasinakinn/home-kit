import { Directive } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';

@Directive({
  selector: '[appMqtt]'
})
export class MqttDirective {
  mqtt;
  reconnectTimeout = 2000;
  host = "3.123.138.65"
  port = 9001;
  public client: Paho.MQTT.Client;
  constructor() { }
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

    }
  }
}
