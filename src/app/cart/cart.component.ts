import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from '../order.service';
import {AuthService} from "@auth0/auth0-angular";
import {OrderItem} from "../model/order-item.model";
import {Order, OrderStatus} from "../model/order.model";
import {BehaviorSubject, Observable, reduce, Subscription, switchMap} from "rxjs";
import {UserService} from "../user.service";
import {User} from "../model/user.model";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {TUI_PROMPT, TuiPromptData} from "@taiga-ui/kit";

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit, OnDestroy {
    orders: Order[] = [];
    private subscription: Subscription | undefined;  // Pour garder une référence à la souscription
    public loaded = false;
    private _orders$ = new BehaviorSubject<Order[]>([]); // Créer un BehaviorSubject pour les commandes
    private dialog: any;

    constructor(
        public orderService: OrderService,
        public userService: UserService,
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    ) {
    }

    ngOnInit(): void {
        this.subscription = this.orderService.ordersObservable().subscribe(orders => {
            this.orders = orders.filter(order => order.items.length !== 0);
            this._orders$.next(this.orders);
            this.loaded = true;
        });

        this.orderService.getRestaurantList().subscribe(restaurants => {
            console.log(restaurants[3]);
            this.orderService.getHoraires(restaurants[0].id, "06%2F09%2F2023").subscribe(horaires => {
                console.log(horaires);
            });
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
        // Puisque nous avons plusieurs commandes maintenant, sommez tous leurs coûts
        return this.orders.reduce((acc, order) => acc + this.getTotalForOrder(order), 0) + this.getTotalForOrder(this.orderService.getLocalOrder());
    }

    getLocalUser(): User | null {
        return this.userService.getUser(this.userService.userEmail);
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
        this.cancelOrder();
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
                this.alerts.open('Votre commande a été annulée.', { status: 'success', hasCloseButton: false, hasIcon: false }).subscribe();
            }
        });
    }
}
