import {Component, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {Router} from "@angular/router";
import {OrderService} from "./order.service";

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

  constructor(public auth: AuthService, private orderService: OrderService, private router: Router) {
    this.orderService.getMenuObservable();
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
}
