import {EventEmitter, Injectable} from '@angular/core';
import {OrderItem} from "./model/order-item.model";
import {Categorie} from "./model/categorie.model";
import {InfosService} from "./infos.service";
import {BehaviorSubject, catchError, EMPTY, Observable, take, throwError} from "rxjs";
import {Order, OrderStatus} from "./model/order.model";
import {SocketService} from "./socket.service";
import {UserService} from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private currentOrder: Order | null = null;
    private _sushiList$ = new BehaviorSubject<Categorie[]>([]);
    private _gotSushiList = false;
    private _onlineOrders: Order[] = [];
    private orders: Order[] = [];
    private _orders$ = new BehaviorSubject<Order[]>([]); // Créer un BehaviorSubject pour les commandes
    private loaded = false;
    private loading: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private infosService: InfosService,
        private socketService: SocketService,
        private userService: UserService
    ) {
        // Écoute des mises à jour des commandes depuis les autres utilisateurs
        this.socketService.orderUpdates.subscribe(data => this.updateOrders(data));

        this.socketService.currentUserData.subscribe((data: any[]) => {
            let index = data.findIndex((user: any) => user.email === this.userService.userEmail);
            if (data.length > 0 && index !== -1) {
                if (data[index].order) {
                    this.currentOrder = new Order(data[index].email, data[index].order.items, data[index].order.date, data[index].order.status);
                }
                data.splice(index, 1);
                data.forEach((user: any) => this.updateOrders(user));
            } else if (index === -1) {
                data.forEach((user: any) => this.updateOrders(user));
            }

        });
    }

    // order.service.ts
    public ordersObservable(): Observable<Order[]> {
        return this._orders$.pipe(
            catchError(error => {
                console.error('Erreur lors de la récupération des commandes :', error);
                return EMPTY;
            })
        );
    }


    private updateOrders(data: any): void {
        if (!this.userService.isOnline(data)) this.userService.addOnlineUser(data);

        let existingOrder = this._onlineOrders.find(order => order.email === data.email);
        if (existingOrder) {
            Object.assign(existingOrder, data.order);
        } else if (data.order){
            this._onlineOrders.push(data.order);
        }

        this._orders$.next(this._onlineOrders);
    }


    public getOrder(email: string): Order {
        return this.currentOrder ?? (this.currentOrder = new Order(email));
    }

    public add(code: string): void {
        if (!this.currentOrder) this.getOrder(this.userService.userEmail);

        const item = this.currentOrder?.items.find(item => item.code === code);
        if (item) {
            item.qte++;
        } else {
            this.currentOrder?.addOrderItem(new OrderItem(code, 1));
        }

        this.socketService.sendOrderUpdate(this.currentOrder!);  // Assuming sendOrderUpdate accepts potentially null values
    }

    public getLocalOrder(): Order {
        return this.getOrder(this.userService.userEmail);
    }

    public getSushiList(): Categorie[] {
        return this._sushiList$.getValue();
    }

    public remove(code: string): void {
        const index = this.currentOrder?.items.findIndex(order => order.code === code);
        if (this.currentOrder && index !== undefined && index !== -1) {
            this.currentOrder.items[index].qte--;
            if (this.currentOrder.items[index].qte === 0) {
                this.currentOrder.items.splice(index, 1);
            }
        }
        // Notifier les autres utilisateurs de la mise à jour de la commande
        if (this.currentOrder) this.socketService.sendOrderUpdate(this.currentOrder);
    }

    public getQte(code: string): number {
        const index = this.currentOrder?.items.findIndex(order => order.code === code) ?? -1;
        return index !== -1 ? this.currentOrder?.items[index].qte ?? 0 : 0;
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

    public getCurrentUserOrder(email: string): Order {
        let order = this.orders.find(o => o.email === email);
        if (!order) {
            order = new Order(email);
            this.orders.push(order);
        }
        return order;
    }

    public getAllOrders(): Order[] {
        return this.orders;
    }

    public setCurrentOrder(order: Order): void {
        this.currentOrder = order;
    }

    public confirmOrder(): void {
        if (this.currentOrder) {
            this.currentOrder.status = OrderStatus.CONFIRMEE;
            this.socketService.sendOrderUpdate(this.currentOrder);
        }
    }

    public resumeOrder(): void {
        if (this.currentOrder) {
            this.currentOrder.status = OrderStatus.EN_COURS;
            this.socketService.sendOrderUpdate(this.currentOrder);
        }
    }

    public getCurrentOrder(): Order | null {
        return this.currentOrder;
    }

    public cancelOrder() {
        if (this.currentOrder) {
            this.currentOrder.items = [];
            this.currentOrder.status = OrderStatus.EN_COURS;
            this.socketService.sendOrderUpdate(this.currentOrder);
        }
    }

    public isLoaded(): boolean {
        return this.loaded;
    }

    setUp() {
        this.getMenuObservable().subscribe(() => {
            this.loaded = true;
            this.loading.emit();
        });
        return this.loading;
    }
}
