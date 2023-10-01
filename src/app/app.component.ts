import {Component, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {Router} from "@angular/router";
import {OrderService} from "./order.service";
import {UserService} from "./user.service";
import {LoaderService} from "./loader.service";
import {Location} from "@angular/common";

interface Item {
  text: string;
  icon: string;
  badge?: number;
  link: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = null;

  readonly items = [
    {
      text: 'Accueil',
      icon: 'tuiIconHomeLarge',
      badge: 0,
      link: '/'
    },
    {
      text: 'Commande',
      icon: 'tuiIconFileTextLarge',
      badge: 0,
      link: '/order'
    },
    {
      text: 'Récent',
      icon: 'tuiIconClockLarge',
      badge: 0,
      link: '/recent'
    },
    {
      text: 'Panier',
      icon: 'tuiIconShoppingCartLarge',
      badge: 0,
      link: '/cart'
    },
    {
      text: 'Profil',
      icon: 'tuiIconUserLarge',
      badge: 0,
      link: '/profile'
    }
  ];

  constructor(public auth: AuthService, private orderService: OrderService, private userService: UserService, public router: Router, public loaderService: LoaderService, public location: Location) {
    this.loaderService.show();
    this.orderService.getMenuObservable();
    this.userService.setUp().subscribe(() => {
      this.userService.isUserConnected().subscribe(value => {
        if (!value) {
          this.router.navigate(['/register']).finally(() => this.loaderService.hide());
        } else {
          if (this.router.url === '/register') this.router.navigate(['/']).finally(() => this.loaderService.hide());
        }
      });
    });
  }

  ngOnInit() {
    console.log(window.location.pathname);
  }

  public onRouterOutletActivate(event : any) {
    this.title = event.title ? event.title : null;
  }
}
