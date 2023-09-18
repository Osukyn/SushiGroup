import {EventEmitter, Injectable} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {SocketService} from "./socket.service";
import {User} from "./model/user.model";
import {Order} from "./model/order.model";
import {map, Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: any;
  private _onlineUsers: any[] = [];
  private loading: EventEmitter<void> = new EventEmitter<void>();
  private _fullUser: any;
  loaded = false;

  constructor(private authService: AuthService, private socketService: SocketService, private http: HttpClient) {
    this.loading.subscribe(() => {
      this.loaded = true;
    });
  }

  get user(): any {
    if (!this._user) return null;
    return this._user;
  }

  get userId(): string {
    if (!this._user) return '';
    return this._user.sub;
  }

  get userName(): string {
    if (!this._user) return '';
    return this._user.name;
  }

  get userEmail(): string {
    if (!this._user) return '';
    return this._user.email;
  }

  get userPicture(): string {
    if (!this._user) return '';
    return this._user.picture;
  }

  getOnlineUsers(): any[] {
    return this._onlineUsers;
  }

  addOnlineUser(user: any): void {
    this._onlineUsers.push(user);
  }

  removeOnlineUser(user: any): void {
    const index = this._onlineUsers.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this._onlineUsers.splice(index, 1);
    }
  }

  isOnline(user: User): boolean {
    return this._onlineUsers.findIndex(u => u.email === user.email) !== -1;
  }

  getUser(email: string): User | null {
    const index = this._onlineUsers.findIndex(u => u.email === email);
    if (index !== -1) {
      return this._onlineUsers[index];
    } else {
      if (email === this.userEmail) {
        return {
          id: this.userId,
          email: this.userEmail,
          name: this.userName,
          picture: this.userPicture,
          order: new Order(this.userEmail, [])
        };
      } else {
        return null;
      }
    }
  }

  get fullUser(): any {
    return this._fullUser;
  }

  getFullUser(): Observable<any> {
    if (!this.userEmail) {
      const subject = new Subject<any>();
      setTimeout(() => {
        subject.next(null);
        subject.complete();
      });
      return subject.asObservable();
    }
    if (this._fullUser) return new Observable<any>(observer => {
      observer.next(this._fullUser);
      observer.complete();
    });
    return this.http.get(environment.baseUrl + environment.restPort + '/api/user?email=' + this.userEmail).pipe(
      map((user: any) => {
        console.log(user);
        this._fullUser = user;
        return user;
      })
    );
  }

  setFullUser(fullUser: any): void {
    this._fullUser = fullUser;
  }

  isUserConnected(): Observable<boolean> {
    return this.http.get<boolean>(environment.baseUrl + environment.restPort + '/api/isUserRegistered?email=' + this.userEmail);
  }

  loadingObservable(): EventEmitter<void> {
    return this.loading;
  }


  public setUp() {
    this.authService.user$.subscribe(user => {
      if (!user) return;
      this._user = user;
      this.getFullUser().subscribe(fullUser => {
        this._fullUser = fullUser;
        this.socketService.setUser(this.userEmail, this.userName, this.userPicture, this.loading);
      });
    });
    return this.loading;
  }
}
