import {Component, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";

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

  constructor(public auth: AuthService) {
  }

  ngOnInit() {

  }
}
