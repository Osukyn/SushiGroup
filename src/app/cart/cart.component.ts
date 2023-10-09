import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from '../order.service';
import {OrderItem} from "../model/order-item.model";
import {Order, OrderStatus} from "../model/order.model";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {UserService} from "../user.service";
import {User} from "../model/user.model";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";

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
      this.orders = orders.filter(order => order.items.length !== 0);
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
    const total = product ? order.qte * product.prix : 0;
    return this.orderService.remise ? total * (1 - this.orderService.remise.pourcentage / 100) : total;
  }

  public getTotalForOrder(order: Order): number {
    if (order)
      return order.items.reduce((acc, orderItem) => acc + this.getTotalForProduct(orderItem), 0);
    else return 0;
  }

  public getTotalCost(): number {
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
    /*const data: TuiPromptData = {
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
    });*/
  }
}
