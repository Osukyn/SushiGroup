import { Injectable } from '@angular/core';
import {OrderItem} from "./model/order-item.model";
import {Categorie} from "./model/categorie.model";
import {InfosService} from "./infos.service";
import {BehaviorSubject, catchError, Observable, take, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private _order: OrderItem[] = [];
  private _sushiList$ = new BehaviorSubject<Categorie[]>([]);
  private _gotSushiList = false;

  constructor(private infosService: InfosService) {}

  public getOrder(): OrderItem[] {
    return this._order;
  }

  public getSushiList(): Categorie[] {
    return this._sushiList$.getValue();
  }

  public add(code: string): void {
    const index = this._order.findIndex(order => order.code === code);
    if (index === -1) {
      this._order.push(new OrderItem(code, 1));
    } else {
      this._order[index].qte++;
    }
  }

  public remove(code: string): void {
    const index = this._order.findIndex(order => order.code === code);
    if (index !== -1) {
      this._order[index].qte--;
      if (this._order[index].qte === 0) {
        this._order.splice(index, 1);
      }
    }
  }

  public getQte(code: string): number {
    const index = this._order.findIndex(order => order.code === code);
    return index !== -1 ? this._order[index].qte : 0;
  }

  public gotSushiList(): boolean {
    return this._gotSushiList;
  }

  public getMenuObservable(): Observable<Categorie[]> {
    if (!this._gotSushiList) {
      this.infosService.getMenu()
        .pipe(
          take(1),
          catchError(error => {
            console.error('Error fetching sushi list:', error);
            return throwError(error);
          })
        )
        .subscribe(data => {
          this._sushiList$.next(data);
          this._gotSushiList = true;
        });
    }
    return this._sushiList$.asObservable();
  }
}
