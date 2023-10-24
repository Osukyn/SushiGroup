import { Component } from '@angular/core';
import {OrderService} from "../order.service";
import {OrderItem} from "../model/order-item.model";
import {Order, OrderStatus} from "../model/order.model";
import {BehaviorSubject, map, Observable} from "rxjs";

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {
  title = 'Historique';
  orders: any[] = [];
  _orders$ = new BehaviorSubject<any[]>([]); // Créer un BehaviorSubject pour les commandes

  constructor(public orderService: OrderService) {
    this.orderService.getOrdersHistory().subscribe(orders => {
      console.log('orders history', orders);
      this.orders = orders;
      this._orders$.next(this.orders);
    });
  }

  getOrders(): Observable<any[]> {
    return this._orders$.pipe(
      map(orders => orders.sort((a, b) => new Date(b.order.date).getTime() - new Date(a.order.date).getTime()))
    );
  }

  private findProductByCode(code: string) {
    return this.orderService.getSushiList()
      .flatMap(categorie => categorie.produits)
      .find(produit => produit.code === code) || null;
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

  public getTotalForProductWithRemise(orderItem: OrderItem, order: any): number {
    return order.remise ? Math.round((this.getTotalForProduct(orderItem) * (1 - order.remise / 100)) * 100) / 100 : this.getTotalForProduct(orderItem);
  }

  public getTotalForOrderWithRemise(order: any): number {
    return (order.remise ? Math.round((this.getTotalForOrder(order.order) * (1 - order.remise / 100)) * 100) / 100 : this.getTotalForOrder(order.order)) + this.getDeliveryCostByOrder(order);
  }

  public getDeliveryCost(order: any): number {
    return Number.parseFloat((0.99 / order.orderNumber).toFixed(2));
  }

  public getDeliveryHostCost(order: any): number {
    return (0.99 - this.getDeliveryCost(order) * order.orderNumber) + this.getDeliveryCost(order);
  }

  public getDeliveryCostByOrder(order: any): number {
    return order.isHost ? this.getDeliveryHostCost(order) : this.getDeliveryCost(order);
  }
}
