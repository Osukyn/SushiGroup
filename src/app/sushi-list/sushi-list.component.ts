import {ChangeDetectionStrategy, Component, HostListener, OnInit} from '@angular/core';
import {Categorie} from "../model/categorie.model";
import {tuiIconMinus, tuiIconPlus} from "@taiga-ui/icons";
import {OrderService} from "../order.service";
import {ViewportScroller} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {Router} from "@angular/router";

@Component({
  selector: 'app-sushi-list',
  templateUrl: './sushi-list.component.html',
  styleUrls: ['./sushi-list.component.css'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(100, style({opacity: 1}))
      ])
    ])
  ]
})
export class SushiListComponent implements OnInit {
  public indexes: number[] = [];
  public sushiList: Categorie[] = [];
  protected readonly tuiIconPlus = tuiIconPlus;
  protected readonly tuiIconMinus = tuiIconMinus;
  public activeCategory: string = '';
  isProgrammaticScroll = false;
  timeoutId: any;
  title = 'Commande';
  skeletonVisible = false;
  private displayedItemsLimit: number = 1;
  private sushiListTemp: Categorie[] = [];

  @HostListener('window:scroll', ['$event']) onScrollEvent($event: Event) {
    if (!this.isProgrammaticScroll) {
      const elements: HTMLElement[] = Array.from(document.querySelectorAll('.cat-container'));

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();

        // Vérifiez si l'élément est complètement à l'extérieur du viewport
        const isOutsideViewport = (
          rect.bottom < this.getRem(6) ||
          rect.top > this.getRem(7) ||
          rect.left > document.documentElement.clientLeft ||
          rect.right < 0
        );

        if (!isOutsideViewport && this.activeCategory !== element.id) {
          this.activeCategory = element.id;
          let hElement = document.getElementById('categories-container');

          setTimeout(() => {
            if (hElement) {
              let target = document.getElementsByClassName('cat-active')[0];
              if (target) {
                hElement.scrollTo({left: (target as HTMLElement).offsetLeft - this.getRem(3), behavior: 'smooth'});
              }
            }
          });
          return;
        }
      }
    }
  }

  constructor(public orderService: OrderService, private router: Router) {
    if (!orderService.getRestaurantAddress()) this.router.navigate(['/']);
  }

  ngOnInit() {
    if (this.orderService.gotSushiList()) {
      this.indexes = Array(this.orderService.getSushiList().length).fill(0);
      this.sushiList = this.orderService.getSushiList().slice(0, this.displayedItemsLimit);
      this.activeCategory = this.sushiList[0].code;

      const fullList = this.orderService.getSushiList();
      const interval = setInterval(() => {
        if (this.sushiList.length < fullList.length) {
          this.sushiList = [...this.sushiList, ...fullList.slice(this.sushiList.length, this.sushiList.length + this.displayedItemsLimit)];
        } else {
          clearInterval(interval);
        }
      }, 50); // Ajoutez 'displayedItemsLimit' éléments chaque seconde

    } else {
      this.orderService.getMenuObservable().subscribe(data => {
        this.indexes = Array(data.length).fill(0);
        this.sushiList = data.slice(0, this.displayedItemsLimit);
        this.activeCategory = this.sushiList[0].code;

        const fullList = data;
        const interval = setInterval(() => {
          if (this.sushiList.length < fullList.length) {
            this.sushiList = [...this.sushiList, ...fullList.slice(this.sushiList.length, this.sushiList.length + this.displayedItemsLimit)];
          } else {
            clearInterval(interval);
          }
        }, 50); // Ajoutez 'displayedItemsLimit' éléments chaque seconde
      });
    }

  }

  scrollToCategory(code: string, $event: MouseEvent) {
    let element = document.getElementById(code);

    if (element) {
      window.scrollTo({top: element.offsetTop - this.getRem(5), behavior: 'smooth'});
    }
    this.activeCategory = code;
    element = document.getElementById('categories-container');
    if (element) {
      let target = ($event.target as HTMLElement).tagName === 'SPAN' ? ($event.target as HTMLElement).parentElement : $event.target as HTMLElement;
      if (target) {
        element.scrollTo({left: target.offsetLeft - this.getRem(3), behavior: 'smooth'});
        this.isProgrammaticScroll = true;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          this.isProgrammaticScroll = false;
        }, 750);
      }
    }
  }

  getRem(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

}
