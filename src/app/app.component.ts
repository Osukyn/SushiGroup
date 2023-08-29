import { Component } from '@angular/core';

interface Item {
  text: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  activeItemIndex = 1;

  readonly items = [
    {
      text: 'Commande',
      icon: 'tuiIconFileTextLarge',
      badge: 0,
    },
    {
      text: 'Récent',
      icon: 'tuiIconClockLarge',
      badge: 0,
    },
    {
      text: 'Panier',
      icon: 'tuiIconShoppingCartLarge',
      badge: 0,
    },
    {
      text: 'Profil',
      icon: 'tuiIconUserLarge',
      badge: 0,
    }
  ];
  title = 'SushiGroup';
}
