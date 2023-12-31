import {EventEmitter, Injectable} from '@angular/core';
import {OrderItem, RuptureItem} from "./model/order-item.model";
import {Categorie} from "./model/categorie.model";
import {InfosService} from "./infos.service";
import {BehaviorSubject, catchError, EMPTY, Observable, take, throwError} from "rxjs";
import {Order, OrderStatus} from "./model/order.model";
import {SocketService} from "./socket.service";
import {UserService} from "./user.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {Group} from "./model/group.model";
import {User} from "./model/user.model";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private currentOrder: Order | null = null;
  private _sushiList$ = new BehaviorSubject<Categorie[]>([]);
  private _lastOrder$ = new BehaviorSubject<any>([]);
  private _gotSushiList = false;
  private _gotLastOrder = false;
  private _onlineOrders: Order[] = [];
  private orders: Order[] = [];
  private _orders$ = new BehaviorSubject<Order[]>([]); // Créer un BehaviorSubject pour les commandes
  private loaded = false;
  private loading: EventEmitter<void> = new EventEmitter<void>();
  apiURL = environment.baseUrl + environment.restPort;
  private address: string = '';
  private group: Group | undefined;
  private groupSetEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public remise: any;
  public ruptures: RuptureItem[] = [];

  constructor(
    private infosService: InfosService,
    private socketService: SocketService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router
  ) {
    // Écoute des mises à jour des commandes depuis les autres utilisateurs
    this.socketService.orderUpdates.subscribe(data => {
      if (this.group?.status !== OrderStatus.SENT) {
        this.updateOrders(data);
        this.group = data;
        if (this.group?.status === OrderStatus.SENT) {
          this.router.navigate(['/orderPlaced']);
        }
      }
    });
    this.socketService.groupCreated.subscribe(group => this.setGroup(group));
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
    // L'adresse e-mail est maintenant la clé pour accéder à la commande dans 'orders'.

    // Nouvelles commandes en ligne après mise à jour
    const updatedOrders: any[] = [];

    Object.entries(data.orders).forEach(([email, orderData]) => {
      let existingOrder = this._onlineOrders.find(order => order.email === email);

      console.log('Update orders for email:', email, orderData);

      if (existingOrder) {
        // Mettre à jour l'ordre existant
        Object.assign(existingOrder, orderData);
        updatedOrders.push(existingOrder);
      } else {
        // Ajouter le nouvel ordre
        updatedOrders.push(orderData);
      }

      if (email === this.userService.userEmail) {
        // Vous pouvez choisir d'instancier un nouvel objet Order ou simplement de mettre à jour les champs.
        if (this.currentOrder) {
          Object.assign(this.currentOrder, orderData);
        } else {
          this.currentOrder = new Order(email, (orderData as any).items, (orderData as any).date, (orderData as any).status);
        }
      }
    });

    // Attribuer la liste mise à jour à _onlineOrders
    this._onlineOrders = updatedOrders;

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
    if (this.currentOrder?.status === OrderStatus.CONFIRMEE) this.currentOrder.status = OrderStatus.EN_COURS;
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
    if (this.currentOrder?.status === OrderStatus.CONFIRMEE) this.currentOrder.status = OrderStatus.EN_COURS;
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

  public getLastOrder(): Observable<any> {
    if (!this._gotLastOrder) {
      this.infosService.getLastOrder(this.userService.userEmail)
        .pipe(
          take(1),
          catchError(error => {
            console.error('Error fetching last order:', error);
            return throwError(error);
          })
        )
        .subscribe(data => {
          this._lastOrder$.next(data);
          this._gotLastOrder = true;
        });
    }
    return this._lastOrder$.asObservable();
  }

  public getCurrentUserOrder(email: string): Order {
    let order = this.orders.find(o => o.email === email);
    if (!order) {
      order = new Order(email);
      this.orders.push(order);
    }
    return order;
  }

  public getOrders(): Order[] {
    if (!this.group) return [];
    return Object.values(this.group.orders);
  }

  public setCurrentOrder(order: Order): void {
    this.currentOrder = Order.fromRawObject(order);
  }

  public confirmOrder(): void {
    if (this.currentOrder) {
      this.currentOrder.status = OrderStatus.CONFIRMEE;
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

  public getRestaurantList(): Observable<any> {
    return this.http.get(this.apiURL + '/api/lieux');
  }

  public getHoraires(id: string, date: string): Observable<any> {
    return this.http.get(this.apiURL + '/api/horaires?id=' + id + '&date=' + date);
  }

  public setRestaurantAddress(address: any): void {
    this.address = address;
  }

  public getRestaurantAddress(): any {
    return this.address;
  }

  public createGroup(deliveriesInfos: any, creneau: any, date: string): Observable<any> {
    return new Observable<any>(observer => {
      this.getHoraires(deliveriesInfos.restaurant, date || '').subscribe(horaires => {
        if (horaires.resultat === 'ok') {
          this.remise = horaires.remises['#GENERALE#'];
          const data = {deliveriesInfos, creneau, date, remise: this.remise?.pourcentage || 0};
          this.socketService.createGroup(data).subscribe(
            (group: Group) => {
              observer.next(group);
            }
          );
        }
      });
    });
  }

  public getRemise(): Observable<any> {
    return new Observable<any>(observer => {
      this.getHoraires(this.getGroup()?.deliveryInfos.restaurant, this.getGroup()?.date || '').subscribe(horaires => {
        if (horaires.resultat === 'ok') {
          this.remise = horaires.remises['#GENERALE#'];
          this.ruptures = horaires.ruptures;
          console.log(this.remise);
          observer.next(this.remise);
        }
      });
    });
  }

  public setGroup(group: any): void {
    this.group = group;
    this.socketService.setGroupUpdates(group.id);
    this.updateOrders(group);
    if (group.orders[this.userService.userEmail]) this.setCurrentOrder(group.orders[this.userService.userEmail]);
    this.groupSetEvent.emit(true);
  }

  deleteGroup(): void {
    this.socketService.unsubscribeGroupUpdates(this.group?.id);
    this.group = undefined;
    this.currentOrder = null;
    this.groupSetEvent.emit(false);
  }

  public getOnlineUsers() {
    if (!this.group) return [];
    return [this.group.host, ...this.group.users];
  }

  getUser(email: string): User | null {
    //console.log('Get user:', this.getOnlineUsers());
    const foundUser = this.getOnlineUsers().find(u => u.email === email);
    return foundUser || null;
  }

  public exitGroup(): void {
    if (!this.group) return;
    this.socketService.leaveGroup(this.userService.userEmail);
    this.deleteGroup();
  }

  getGroup() {
    return this.group;
  }

  public getUserGroup(): Observable<any> {
    return this.http.get(this.apiURL + '/api/getUserGroup?email=' + this.userService.userEmail);
  }

  public isHost(): boolean {
    return this.group?.host.email === this.userService.userEmail;
  }

  public isUserHost(email: string): boolean {
    return this.group?.host.email === email;
  }

  kickUser(user: User) {
    this.socketService.kickUser(user);
  }

  public order(): void {
    if (this.group) {
      this.socketService.order(this.userService.userEmail);
    }
  }

  getRuptures(): RuptureItem[] {
    return this.ruptures;
  }

  public getOrdersHistory(): Observable<any> {
    return this.http.get(this.apiURL + '/api/getOrdersHistory?email=' + this.userService.userEmail);
  }

  setObservation(observation: string): void {
    if (this.currentOrder) {
      this.currentOrder.observations = observation;
    }
  }
}
