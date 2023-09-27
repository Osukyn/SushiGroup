import {EventEmitter, Injectable, Injector} from '@angular/core';
import {Order} from "./model/order.model";
import {io} from "socket.io-client";
import {Subject} from "rxjs";
import {OrderService} from "./order.service";
import {UserService} from "./user.service";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  public orderUpdates = new Subject<any>();
  public currentUserData = new Subject<any>();
  public groups = new Subject<any>();

  constructor() {
    this.socket = io(environment.baseUrl + environment.socketPort);

    this.socket.on('orderUpdated', (data: any) => {
      console.log('Order updated by user:', data);
      this.orderUpdates.next(data);
    });
  }

  public setUser(email: string, name: string, picture: string, event: EventEmitter<any> | undefined) {
    this.socket.emit('setUser', { email, name, picture });
    this.socket.on('userSet', (data: any) => this.setData(event));
  }

  sendOrderUpdate(order: Order) {
    this.socket.emit('updateOrder', order);
  }

  public setData(event?: EventEmitter<any> | undefined) {
    this.socket.emit('getOnlineUsers');

    this.socket.on('onlineUsers', (data: any) => {
      console.log('Online users:', data);
      event?.emit();
      this.currentUserData.next(data);
    });
  }

  public createGroup(user: any) {
    this.socket.emit('createGroup', user);
  }

  public getGroups() {
    this.socket.emit('getGroups');
  }

  public setGroupUpdates() {
    this.socket.on('groupCreated', (data: any) => {
      console.log('Group created:', data);
      this.groups.next(data);
    });
  }

  public getGroupUpdates() {
    return this.groups.asObservable();
  }
}
