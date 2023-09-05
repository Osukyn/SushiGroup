import {Component, Inject} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  profile: any;
  constructor(public auth: AuthService) {
    auth.user$.subscribe(user => {
      this.profile = user;
      console.log(user);
      });
  }

  logout(): void {
    // @ts-ignore
    this.auth.logout({ returnTo: window.location.origin });
  }
}
