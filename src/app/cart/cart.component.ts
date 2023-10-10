import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from '../order.service';
import {OrderItem} from "../model/order-item.model";
import {Order, OrderStatus} from "../model/order.model";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {UserService} from "../user.service";
import {User} from "../model/user.model";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {TUI_PROMPT, TuiPromptData} from "@taiga-ui/kit";

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
    orders: Order[] = [];
    private subscription: Subscription | undefined;  // Pour garder une référence à la souscription
    public loaded = false;
    private _orders$ = new BehaviorSubject<Order[]>([]); // Créer un BehaviorSubject pour les commandes
    private dialog: any;
    title = 'Panier';
    open = false;

    constructor(
        public orderService: OrderService,
        public userService: UserService,
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
        private ref: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.subscription = this.orderService.ordersObservable().subscribe(orders => {
            console.log('orders', orders);
            this.orders = orders.filter(order => order.items.length !== 0 && order.email !== this.userService.userEmail);
            this._orders$.next(this.orders);
            this.loaded = true;
        });
    }

    getOrders(): Observable<Order[]> {
        return this._orders$;
    }

    private findProductByCode(code: string) {
        return this.orderService.getSushiList()
            .flatMap(categorie => categorie.produits)
            .find(produit => produit.code === code) || null;
    }


    // cart.component.ts
    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }


    public getName(code: string): string {
        const foundProduct = this.findProductByCode(code);
        return foundProduct ? foundProduct.nom.replace('<small>', '').replace('</small>', '') : '';
    }

    public getTotalForProduct(order: OrderItem): number {
        const product = this.findProductByCode(order.code);
        return product ? order.qte * product.prix : 0;
    }

    public getTotalForOrder(order: Order): number {
        if (order)
            return order.items.reduce((acc, orderItem) => acc + this.getTotalForProduct(orderItem), 0);
        else return 0;
    }

    public getTotalCost(): number {
        return this.orders.reduce((acc, order) => acc + this.getTotalForOrder(order), 0) + this.getTotalForOrder(this.orderService.getLocalOrder());
    }

    public getTotalForProductWithRemise(order: OrderItem): number {
        return this.orderService.remise ? Math.round((this.getTotalForProduct(order) * (1 - this.orderService.remise.pourcentage / 100)) * 100) / 100 : this.getTotalForProduct(order);
    }

    public getTotalForOrderWithRemise(order: Order): number {
        return this.orderService.remise ? Math.round((this.getTotalForOrder(order) * (1 - this.orderService.remise.pourcentage / 100)) * 100) / 100 : this.getTotalForOrder(order);
    }

    public getTotalCostWithRemise(): number {
        return this.orderService.remise ? Math.round((this.getTotalCost() * (1 - this.orderService.remise.pourcentage / 100)) * 100) / 100 : this.getTotalCost();
    }


    getLocalUser(): User | null {
        return this.orderService.getUser(this.userService.userEmail);
    }

    protected readonly OrderStatus = OrderStatus;

    confirmOrder() {
        this.orderService.confirmOrder();
    }

    resumeOrder() {
        this.orderService.resumeOrder();
    }

    cancelOrder() {
        this.orderService.cancelOrder();
    }

    onClick(): void {
        //this.cancelOrder();
        const data: TuiPromptData = {
            content:
                'Êtes-vous sûr de vouloir annuler votre commande ?',
            yes: 'Oui',
            no: 'Non',
        };

        this.dialog = this.dialogs
            .open<boolean>(TUI_PROMPT, {
                label: 'Attention !',
                size: 's',
                data,
            }).subscribe((ans) => {
                if (ans) {
                    this.cancelOrder();
                    this.alerts.open('Votre commande a été annulée.', {status: 'success', hasCloseButton: false, hasIcon: false}).subscribe();
                }
            });
    }

    order() {
        this.open = true;
        /*const ordersNotConfirmed = this.orderService.getOrders().filter(order => order.status === OrderStatus.EN_COURS);
        if (ordersNotConfirmed.length === 0) {

        } else {

        }*/
    }

    closeDialog(observer: any): void {
        observer.complete();
    }

    getUnconfirmedUsers() {
        const ordersNotConfirmed = this.orderService.getOrders().filter(order => order.status === OrderStatus.EN_COURS);
        console.log(ordersNotConfirmed);
        return this.orderService.getOnlineUsers().filter(user => ordersNotConfirmed.find(order => order.email === user.email));
    }
}
