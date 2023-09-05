import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Categorie} from "../model/categorie.model";
import {tuiIconMinus, tuiIconPlus} from "@taiga-ui/icons";
import {OrderService} from "../order.service";
import {ViewportScroller} from "@angular/common";

@Component({
    selector: 'app-sushi-list',
    templateUrl: './sushi-list.component.html',
    styleUrls: ['./sushi-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SushiListComponent implements OnInit {
    public indexes: number[] = [];
    public sushiList: Categorie[] = [];
    protected readonly tuiIconPlus = tuiIconPlus;
    protected readonly tuiIconMinus = tuiIconMinus;
    public activeCategory: string = '';
    isProgrammaticScroll = false;
    timeoutId: any;

    constructor(public orderService: OrderService, private viewportScroller: ViewportScroller) {
    }

    ngOnInit() {
        this.orderService.getMenuObservable().subscribe(data => {
            this.indexes = Array(data.length).fill(0);
            this.sushiList = data;
            this.activeCategory = this.sushiList[0].code;
        });
        document.onscroll = ($event: Event) => {
            this.onScroll($event);
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

    onScroll($event: Event) {
        if (!this.isProgrammaticScroll) this.checkNextElementInView();
    }

    checkNextElementInView() {
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
