import {Injectable, Injector} from '@angular/core';
import {Order} from "./model/order.model";
import {io} from "socket.io-client";
import {Subject} from "rxjs";
import {OrderService} from "./order.service";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  public orderUpdates = new Subject<any>();
  public currentUserData = new Subject<any>()

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('orderUpdated', (data: any) => {
      console.log('Order updated by user:', data);
      this.orderUpdates.next(data);
    });
  }

  public setUser(email: string, name: string, picture: string) {
    this.socket.emit('setUser', { email, name, picture });
  }

  sendOrderUpdate(order: Order) {
    this.socket.emit('updateOrder', order);
  }

  public setData() {
    this.socket.emit('getOnlineUsers');

    this.socket.on('onlineUsers', (data: any) => {
      console.log('Online users:', data);
      this.currentUserData.next(data);
    });
  }
}
