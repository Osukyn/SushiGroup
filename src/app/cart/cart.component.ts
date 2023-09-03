import {Component, OnDestroy, OnInit} from '@angular/core';
import { OrderService } from '../order.service';
import {AuthService, User} from "@auth0/auth0-angular";
import {OrderItem} from "../model/order-item.model";
import {Order, OrderStatus} from "../model/order.model";
import {reduce, Subscription} from "rxjs";
import {UserService} from "../user.service";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  public currentUser: any;
  orders: Order[] = [];
  private subscription: Subscription | undefined;  // Pour garder une référence à la souscription

  constructor(
    public orderService: OrderService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.subscription = this.orderService.ordersObservable().subscribe(orders => {
      this.orders = orders;
      let index = this.orders.findIndex(order => order.items.length === 0);
      if (index !== -1) {
        this.orders.splice(index, 1);
      }
    });
  }

  ngOnDestroy(): void {  // Pour nettoyer lors de la destruction du composant
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    return order.items.reduce((acc, orderItem) => acc + this.getTotalForProduct(orderItem), 0);
  }

  public getTotalCost(): number {
    // Puisque nous avons plusieurs commandes maintenant, sommez tous leurs coûts
    return this.orders.reduce((acc, order) => acc + this.getTotalForOrder(order), 0) + this.getTotalForOrder(this.orderService.getLocalOrder());
  }

  private findProductByCode(code: string) {
    for (let categorie of this.orderService.getSushiList()) {
      for (let produit of categorie.produits) {
        if (produit.code === code) {
          return produit;
        }
      }
    }
    return null;
  }

  getLocalUser(): User | null {
    return this.userService.getUser(this.userService.userEmail);
  }

  protected readonly OrderStatus = OrderStatus;
}
