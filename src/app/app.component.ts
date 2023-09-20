import {Component, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {Router} from "@angular/router";
import {OrderService} from "./order.service";
import {UserService} from "./user.service";
import {LoaderService} from "./loader.service";

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
  activeItemIndex = 0;
  title = 'Easy Sushi'

  readonly items = [
    {
      text: 'Accueil',
      icon: 'tuiIconHomeLarge',
      badge: 0,
      link: '/',
      disabled: false
    },
    {
      text: 'Commande',
      icon: 'tuiIconFileTextLarge',
      badge: 0,
      link: '/order',
      disabled: false
    },
    {
      text: 'Récent',
      icon: 'tuiIconClockLarge',
      badge: 0,
      link: '/recent',
      disabled: false
    },
    {
      text: 'Panier',
      icon: 'tuiIconShoppingCartLarge',
      badge: 0,
      link: '/cart',
      disabled: false
    },
    {
      text: 'Profil',
      icon: 'tuiIconUserLarge',
      badge: 0,
      link: '/profile',
      disabled: false
    }
  ];

  constructor(public auth: AuthService, private orderService: OrderService, private userService: UserService, private router: Router, public loaderService: LoaderService) {
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
    this.activeItemIndex = this.items.findIndex(item => item.link === window.location.pathname);
    console.log(this.activeItemIndex);
    if (this.activeItemIndex === -1 && window.location.pathname !== '/authentication-callback') {
      this.activeItemIndex = 0;
    } else if (window.location.pathname === '/authentication-callback') {
      this.activeItemIndex = 1;
    }
  }

  public onRouterOutletActivate(event : any) {
    this.title = event.title ? event.title : 'Easy Sushi';
  }
}
