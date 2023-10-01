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
  groupsUpdate = new Subject<any[]>();

  constructor() {
    this.socket = io(environment.baseUrl + environment.socketPort);

    this.socket.on('orderUpdated', (data: any) => {
      console.log('Order updated by user:', data);
      this.orderUpdates.next(data);
    });
    this.setGroupUpdates();
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

  public createGroup(data: any) {
    this.socket.emit('createGroup', data);
  }

  public getGroups() {
    this.socket.emit('getGroups');
    this.socket.once('groups', (data: any) => {
      console.log('Groups:', data);
      this.groupsUpdate.next(data);
    });
  }

  public setGroupUpdates() {
    this.socket.on('groupsUpdate', (data: any) => {
      console.log('Group update:', data);
      this.groupsUpdate.next(data);
    });
  }

  public joinGroup(id: string) {
    this.socket.emit('joinGroup', id);
  }
}
