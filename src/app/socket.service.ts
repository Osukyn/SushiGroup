import {EventEmitter, Injectable, Injector} from '@angular/core';
import {Order} from "./model/order.model";
import {io} from "socket.io-client";
import {Subject} from "rxjs";
import {OrderService} from "./order.service";
import {UserService} from "./user.service";
import {environment} from "../environments/environment";
import {Group} from "./model/group.model";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: any;
  public orderUpdates = new Subject<any>();
  groupsUpdate = new Subject<any[]>();
  groupCreated = new EventEmitter<Group>();

  constructor() {
    this.socket = io(environment.baseUrl + environment.socketPort);

    this.setGroupsUpdates();
  }

  public setUser(email: string, name: string | undefined, picture: string | undefined, event: EventEmitter<any> | undefined) {
    console.log('Setting user:', email);
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
    });
  }

  public createGroup(data: any) {
    this.socket.emit('createGroup', data);
    this.socket.once('groupCreated', (group: any) => {
      this.groupCreated.emit(group);
    });
  }

  public getGroups() {
    this.socket.emit('getGroups');
    this.socket.once('groups', (data: any) => {
      console.log('Groups:', data);
      this.groupsUpdate.next(data);
    });
  }

  public setGroupUpdates(groupId: any) {
    this.socket.on(`groupUpdate/${groupId}`, (data: any) => {
      console.log('Order updated by user:', data);
      this.orderUpdates.next(data);
    });
  }

  public unsubscribeGroupUpdates(groupId: any) {
    this.socket.off(`groupUpdate/${groupId}`);
  }

  public setGroupsUpdates() {
    this.socket.on('groupsUpdate', (data: any) => {
      console.log('Group update:', data);
      this.groupsUpdate.next(data);
    });
  }

  public joinGroup(id: string) {
    this.socket.emit('joinGroup', id);
  }

  public getSocket(): any {
    return this.socket;
  }
}
