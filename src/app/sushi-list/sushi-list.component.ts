import {ChangeDetectionStrategy, Component, HostListener, OnInit} from '@angular/core';
import {Categorie} from "../model/categorie.model";
import {tuiIconMinus, tuiIconPlus} from "@taiga-ui/icons";
import {OrderService} from "../order.service";
import {ViewportScroller} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";
import {Router} from "@angular/router";
import {LoaderService} from "../loader.service";
import {take} from "rxjs";
import {tuiLoaderOptionsProvider} from "@taiga-ui/core";

@Component({
  selector: 'app-sushi-list',
  templateUrl: './sushi-list.component.html',
  styleUrls: ['./sushi-list.component.css'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({opacity: 0}),
        animate(100, style({opacity: 1}))
      ])
    ])
  ],
})
export class SushiListComponent implements OnInit {
  public indexes: number[] = [];
  public sushiList: Categorie[] = [];
  public lastOrder: Categorie | null = null;
  protected readonly tuiIconPlus = tuiIconPlus;
  protected readonly tuiIconMinus = tuiIconMinus;
  public activeCategory: string = '';
  isProgrammaticScroll = false;
  timeoutId: any;
  title = 'Commande';
  skeletonVisible = false;
  private displayedItemsLimit: number = 1;
  private sushiListTemp: Categorie[] = [];
  creneauxResult: any;
  loader = true;

  constructor(public orderService: OrderService) {
  }

  ngOnInit() {
    const productContainer = document.getElementById('product-container');
    if (productContainer) {
      productContainer.addEventListener('scroll', ($event: Event) => {
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
      });
    }

    this.orderService.getMenuObservable().subscribe(data => {
      if (data.length > 0) {
        this.loader = false;
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
        this.orderService.getLastOrder().subscribe(lastOrder => {
          if (lastOrder && lastOrder.order && lastOrder.order.items && lastOrder.order.items.length > 0) {
            this.lastOrder = {
              code: 'RÉCENTS',
              complement: false,
              produits: [
                ...lastOrder.order.items
              ]
            };
          }
        });
      }
    });
  }

  scrollToCategory(code: string, $event: MouseEvent) {
    let element = document.getElementById(code);
    const productContainer = document.getElementById('product-container');
    if (element && productContainer) {
      productContainer.scrollTo({top: element.offsetTop, behavior: 'smooth'});
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

  isProductAvailable(code: string): boolean {
    return this.orderService.getRuptures().some(rupture => rupture.produit === code);
  }

  get getItemsFromSushiList(): any[] {
    const temp = new Array<any>();
    this.sushiList.forEach(category => {
      temp.push(...category.produits);
    });
    return temp.filter(item => this.lastOrder?.produits.some((item2: any) => item2.code === item.code)) || [];
  }

  get sushilistWithlastOrder(): any[] {
    if (!this.lastOrder) return this.sushiList;
    return [this.lastOrder, ...this.sushiList];
  }

  protected readonly Math = Math;
}
