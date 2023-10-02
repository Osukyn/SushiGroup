import {ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {UserService} from "../user.service";
import {LoaderService} from "../loader.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProfileComponent {
  profile: any;
  title = 'Profil';
  loaded = false;
  constructor(public userService: UserService, public auth: AuthService, private loaderService: LoaderService) {
    this.loaderService.show();
    if (!this.userService.loaded) this.userService.loadingObservable().subscribe(() => {
      console.log(this.userService.user);
      this.profile = this.userService.user;
      this.loaderService.hide();
      this.loaded = true;
    });
    else {
      this.profile = this.userService.user;
      this.loaderService.hide();
      this.loaded = true;
    }

  }

  logout(): void {
    // @ts-ignore
    this.auth.logout({ returnTo: window.location.origin });
  }

  get profilePicture(): string {
    if (!this.profile) return '';
    return this.profile.profilePicture;
  }

  get name(): string {
    if (!this.profile) return '';
    return this.profile.name;
  }

  get email(): string {
    if (!this.profile) return '';
    return this.profile.email;
  }

  get phone(): string {
    if (!this.profile) return '';
    return this.profile.phone;
  }
}
