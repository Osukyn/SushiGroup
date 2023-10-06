import {EventEmitter, Injectable} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {SocketService} from "./socket.service";
import {User} from "./model/user.model";
import {Order} from "./model/order.model";
import {map, Observable, Subject, take} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: User | undefined;
  private _onlineUsers: any[] = [];
  private loading: EventEmitter<void> = new EventEmitter<void>();
  loaded = false;

  constructor(private authService: AuthService, private socketService: SocketService, private http: HttpClient) {
    this.loading.subscribe(() => {
      this.loaded = true;
    });

    this.socketService.getSocket().on('userUpdate', (data: any) => {
      console.log('User updated:', data);
      this._user = data;
    });
  }

  get user(): any {
    return this._user;
  }

  get userName(): string {
    return this._user?.name || '';
  }

  get userEmail(): string {
    return this._user?.email || '';
  }

  get userPicture(): string {
    return this._user?.profilePicture || '';
  }

  getOnlineUsers(): User[] {
    return this._onlineUsers;
  }

  isOnline(user: User): boolean {
    return this._onlineUsers.some(u => u.email === user.email);
  }

  getUser(email: string): User | null {
    const foundUser = this._onlineUsers.find(u => u.email === email);
    return foundUser || (email === this.userEmail ? {
      email: this.userEmail,
      name: this.userName,
      profilePicture: this.userPicture,
    } : null);
  }

  isUserConnected(): Observable<boolean> {
    console.log('isUserConnected' + this.userEmail);
    return this.http.get<boolean>(environment.baseUrl + environment.restPort + '/api/isUserRegistered?email=' + this.userEmail);
  }

  loadingObservable(): EventEmitter<void> {
    return this.loading;
  }

  public setUp() {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (!user) return;
      console.log('User:', user);
      if (user.email)
      this.socketService.setUser(user.email, user.name, user.picture , this.loading);
    });

    return this.loading;
  }

  isUserInGroup(email: string): Observable<boolean> {
    return this.http.get<boolean>(environment.baseUrl + environment.restPort + '/api/isUserInGroup?email=' + email);
  }

}
