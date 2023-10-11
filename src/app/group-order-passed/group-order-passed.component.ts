import { Component } from '@angular/core';
import {Order, OrderStatus} from "../model/order.model";
import {OrderService} from "../order.service";
import {OrderItem} from "../model/order-item.model";
import {User} from "../model/user.model";
import {UserService} from "../user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-group-order-passed',
  templateUrl: './group-order-passed.component.html',
  styleUrls: ['./group-order-passed.component.css']
})
export class GroupOrderPassedComponent {
  title = 'Récapitulatif';
  orders: any;
  constructor(public orderService: OrderService, public userService: UserService, private router: Router) {
    this.orders = orderService.getOrders();
  }

  protected readonly OrderStatus = OrderStatus;

  public getTotalForProduct(order: OrderItem): number {
    const product = this.findProductByCode(order.code);
    return product ? order.qte * product.prix : 0;
  }

  private findProductByCode(code: string) {
    return this.orderService.getSushiList()
      .flatMap(categorie => categorie.produits)
      .find(produit => produit.code === code) || null;
  }

  public getTotalForOrder(order: Order): number {
    if (order)
      return order.items.reduce((acc, orderItem) => acc + this.getTotalForProduct(orderItem), 0);
    else return 0;
  }

  public getTotalCost(): number {
    return this.orders.reduce((acc: number, order: Order) => acc + this.getTotalForOrder(order), 0) + this.getTotalForOrder(this.orderService.getLocalOrder());
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

  public getName(code: string): string {
    const foundProduct = this.findProductByCode(code);
    return foundProduct ? foundProduct.nom.replace('<small>', '').replace('</small>', '') : '';
  }

  getLocalUser(): User | null {
    return this.orderService.getUser(this.userService.userEmail);
  }

  exit() {
    this.orderService.exitGroup();
    this.router.navigate(['/']);
  }
}
