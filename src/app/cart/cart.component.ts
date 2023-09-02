import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import {AuthService, User} from "@auth0/auth0-angular";
import {OrderItem} from "../model/order-item.model";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  public currentUser: any;
  public orderList: OrderItem[][] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => this.currentUser = user);
    this.orderList.push(this.orderService.getOrder());
  }

  public getTotalCost(): number | undefined {
    return this.orderService.getOrder().reduce((acc, order) => acc + this.getTotalForProduct(order), 0);
  }

  public getName(code: string): string {
    const foundProduct = this.findProductByCode(code);
    return foundProduct ? foundProduct.nom.replace('<small>', '').replace('</small>', '') : '';
  }

  public getTotalForProduct(order: OrderItem): number {
    const product = this.findProductByCode(order.code);
    return product ? order.qte * product.prix : 0;
  }

  public getSubTotal(): number {
    return this.orderService.getOrder().reduce((acc, order) => acc + this.getTotalForProduct(order), 0);
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
}
