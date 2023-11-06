import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from '../order.service';
import {OrderItem} from "../model/order-item.model";
import {Order, OrderStatus} from "../model/order.model";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {UserService} from "../user.service";
import {User} from "../model/user.model";
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {TUI_PROMPT, TuiPromptData} from "@taiga-ui/kit";
import {Router} from "@angular/router";
import {FormControl} from "@angular/forms";

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
  title = 'Panier';
  open = false;
  observationsForm: FormControl = new FormControl('');
  observationsForms: Map<string, FormControl> = new Map<string, FormControl>();

  constructor(
    public orderService: OrderService,
    public userService: UserService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.subscription = this.orderService.ordersObservable().subscribe(orders => {
      console.log('orders', orders);
      this.orders = orders.filter(order => order.items.length !== 0 && order.email !== this.userService.userEmail);
      this._orders$.next(this.orders);
      this.loaded = true;
    });
    if (this.orderService.getCurrentOrder()) {
      this.observationsForm.setValue(this.orderService.getCurrentOrder()?.observations);
    }
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
    return (this.orderService.remise ? Math.round((this.getTotalForOrder(order) * (1 - this.orderService.remise.pourcentage / 100)) * 100) / 100 : this.getTotalForOrder(order)) + (this.orderService.isUserHost(order.email) ? this.getDeliveryHostCost() : this.getDeliveryCost());
  }

  public getTotalCostWithRemise(): number {
    return this.orderService.remise ? Math.round((this.getTotalCost() * (1 - this.orderService.remise.pourcentage / 100)) * 100) / 100 : this.getTotalCost();
  }

  public getDeliveryCost(): number {
    return Number.parseFloat((0.99 / this.getAllOrders().length).toFixed(2));
  }

  public getDeliveryHostCost(): number {
    return (0.99 - this.getDeliveryCost() * this.getAllOrders().length) + this.getDeliveryCost();
  }

  getLocalUser(): User | null {
    return this.orderService.getUser(this.userService.userEmail);
  }

  protected readonly OrderStatus = OrderStatus;

  confirmOrder() {
    this.orderService.setObservation(this.observationsForm.value);
    this.orderService.confirmOrder();
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
          this.alerts.open('Votre commande a été annulée.', {
            status: 'success',
            hasCloseButton: false,
            hasIcon: false
          }).subscribe();
        }
      });
  }

  orderClick(): void {
    if (this.getUnconfirmedUsers().length === 0) {
      //this.orderService.order();
      this.order();
      this.alerts.open('Votre commande a été envoyée.', {
        status: 'success',
        hasCloseButton: false,
        hasIcon: false
      }).subscribe();
    } else {
      this.open = true;
    }
  }

  get openConfirmDialog(): boolean {
    if (this.open && this.getUnconfirmedUsers().length === 0) {
      this.open = false;
    }
    return this.open && this.getUnconfirmedUsers().length > 0;
  }

  set openConfirmDialog(value: boolean) {
    this.open = value;
  }

  confirmDialog(observer: any): void {
    observer.complete();
  }

  closeDialog(observer: any): void {
    observer.complete();
  }

  kickUser(user: User) {
    const data: TuiPromptData = {
      content:
        `Êtes-vous sûr de vouloir exclure ${user.firstName} ${user.lastName} du groupe ?`,
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
          this.orderService.kickUser(user);
          this.alerts.open(`${user.firstName} ${user.lastName} a été exclu(e) du groupe.`, {
            status: 'success',
            hasCloseButton: false,
            hasIcon: false
          }).subscribe();
        }
      });
  }

  getUnconfirmedUsers() {
    const ordersNotConfirmed = this.orderService.getOrders().filter(order => order.status === OrderStatus.EN_COURS && order.email !== this.userService.userEmail);
    return this.orderService.getOnlineUsers().filter(user => ordersNotConfirmed.find(order => order.email === user.email));
  }

  getAllOrders() {
    return [...this.orders, this.orderService.getLocalOrder()];
  }


  order() {
    this.orderService.order();
    this.router.navigate(['/orderPlaced']);
  }

  getObservationsByOrder(order: Order): FormControl {
    if (this.observationsForms.has(order.email)) {
      this.observationsForms.get(order.email)?.setValue(order.observations ?? '');
      return this.observationsForms.get(order.email) as FormControl;
    } else {
      this.observationsForms.set(order.email, new FormControl(order.observations ?? ''));
      return this.observationsForms.get(order.email) as FormControl;
    }
  }
}
