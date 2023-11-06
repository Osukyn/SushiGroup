import { Component } from '@angular/core';
import {Order, OrderStatus} from "../model/order.model";
import {OrderService} from "../order.service";
import {OrderItem} from "../model/order-item.model";
import {User} from "../model/user.model";
import {UserService} from "../user.service";
import {Router} from "@angular/router";
import {Group} from "../model/group.model";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-group-order-passed',
  templateUrl: './group-order-passed.component.html',
  styleUrls: ['./group-order-passed.component.css']
})
export class GroupOrderPassedComponent {
  title = 'Récapitulatif';
  group: Group | undefined;
  order: Order;
  observationsForm: FormControl | null = null;

  constructor(public orderService: OrderService, public userService: UserService, private router: Router) {
    this.group = structuredClone(orderService.getGroup());
    const order = this.findOrder(userService.userEmail);
    if (order) {
      this.order = order;
    } else {
      this.order = new Order(userService.userEmail);
    }
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

  public getTotalForProductWithRemise(order: OrderItem): number {
    return this.orderService.remise ? Math.round((this.getTotalForProduct(order) * (1 - this.orderService.remise.pourcentage / 100)) * 100) / 100 : this.getTotalForProduct(order);
  }

  public getTotalForOrderWithRemise(order: Order): number {
    return (this.orderService.remise ? Math.round((this.getTotalForOrder(order) * (1 - this.orderService.remise.pourcentage / 100)) * 100) / 100 : this.getTotalForOrder(order)) + this.getDeliveryCostByOrder(order);
  }


  public getName(code: string): string {
    const foundProduct = this.findProductByCode(code);
    return foundProduct ? foundProduct.nom.replace('<small>', '').replace('</small>', '') : '';
  }

  getLocalUser(): User | undefined {
    return this.userService.user;
  }

  exit() {
    this.orderService.exitGroup();
    this.router.navigate(['/']);
  }

  findOrder(email: string): Order | undefined {
    if (this.group) return Object.values(this.group.orders).find((order: Order) => order.email === email);
    return undefined;
  }

  getOrders(): Order[] {
    if (this.group) return Object.values(this.group.orders);
    return [];
  }

  public getDeliveryCost(): number {
    return Number.parseFloat((0.99 / this.getOrders().length).toFixed(2));
  }

  public getDeliveryHostCost(): number {
    return (0.99 - this.getDeliveryCost() * this.getOrders().length) + this.getDeliveryCost();
  }

  isHost(): boolean {
    if (!this.group) return false;
    return this.group?.host.email === this.userService.userEmail;
  }

  public getDeliveryCostByOrder(order: any): number {
    return this.group?.host.email === this.userService.userEmail ? this.getDeliveryHostCost() : this.getDeliveryCost();
  }

  getObservationsByOrder(): FormControl {
    if (!this.observationsForm) this.observationsForm = new FormControl(this.order.observations);
    return this.observationsForm;
  }
}
