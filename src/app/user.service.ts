import {EventEmitter, Injectable} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {SocketService} from "./socket.service";
import {User} from "./model/user.model";
import {Order} from "./model/order.model";
import {Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _user: any;
    private _onlineUsers: any[] = [];
    private loading: EventEmitter<void> = new EventEmitter<void>();

    constructor(private authService: AuthService, private socketService: SocketService) {

    }

    get user(): any {
        return this._user;
    }

    get userId(): string {
        return this._user.sub;
    }

    get userName(): string {
        return this._user.name;
    }

    get userEmail(): string {
        return this._user.email;
    }

    get userPicture(): string {
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

    public setUp() {
        this.authService.user$.subscribe(user => {
            this._user = user;
            this.socketService.setUser(this.userEmail, this.userName, this.userPicture, this.loading);
        });
        return this.loading;
    }
}
