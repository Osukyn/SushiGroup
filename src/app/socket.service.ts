import {EventEmitter, Injectable} from '@angular/core';
import {Order} from "./model/order.model";
import {io, Socket} from "socket.io-client";
import {Observable, Subject} from "rxjs";
import {environment} from "../environments/environment";
import {Group} from "./model/group.model";
import {User} from "./model/user.model";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: Socket;
  public orderUpdates = new Subject<any>();
  groupsUpdate = new Subject<any[]>();
  groupCreated = new EventEmitter<Group>();
  groupDeleted = new EventEmitter<void>();
  groupKick = new EventEmitter<string>();
  needsUpdate = false;

  constructor() {
    this.socket = io(environment.baseUrl + environment.socketPort);
    this.socket.on('connect', () => {
      console.log("recovered?", this.socket.recovered);
      if (this.needsUpdate) {
        this.needsUpdate = false;
        window.location.reload();
      }
    });
    this.socket.on('disconnect', (reason: string) => {
      console.warn('Disconnected:', reason);
      this.needsUpdate = true;
    });
    this.socket.on('connect_error', (error: any) => {
      console.log('Connection Error');
      this.needsUpdate = true;
    });
    
    this.setGroupsUpdates();
  }

  public setUser(email: string, firstName: string | undefined, lastName: string | undefined, picture: string | undefined, event: EventEmitter<any> | undefined) {
    console.log('Setting user:', email);
    this.socket.emit('setUser', { email, firstName, lastName, picture });
    this.socket.once('userSet', (data: any) => this.setData(event));
  }

  sendOrderUpdate(order: Order) {
    this.socket.emit('updateOrder', order);
  }

  public setData(event?: EventEmitter<any> | undefined) {
    this.socket.emit('getOnlineUsers');

    this.socket.once('onlineUsers', (data: any) => {
      console.log('Online users:', data);
      event?.emit();
    });
  }

  public createGroup(data: any): Observable<any> {
    this.socket.emit('createGroup', data);
    return new Observable((observer) => {
      this.socket.once('groupCreated', (group: any) => {
        this.groupCreated.emit(group);
        observer.next(group);
      });
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
    this.socket.on(`groupUpdate/${groupId}`, (data: any) => this.orderUpdates.next(data));
    this.socket.once(`groupDeletion/${groupId}`, (data: any) => this.groupDeleted.emit());
    this.socket.on(`groupKick/${groupId}`, (data: any) => this.groupKick.emit(data));
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

  public leaveGroup(email: string) {
    this.socket.emit('exitGroup', email);
  }

  public getSocket(): any {
    return this.socket;
  }

  public order(email: string) {
    this.socket.emit('order', { email });
  }

  kickUser(user: User) {
    this.socket.emit('kickUser', user);
  }
}
