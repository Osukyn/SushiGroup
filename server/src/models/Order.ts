import {OnlineUser, User} from "./User";
import {Delivery} from "./Delivery";
import crypto from 'crypto';
export class Order {
  items: OrderItem[];
  email: string;
  date: Date;
  status: OrderStatus = OrderStatus.EN_COURS;

  constructor(email: string) {
    this.items = [];
    this.email = email;
    this.date = new Date();
  }
}

export enum OrderStatus {
  EN_COURS = 'En cours',
  CONFIRMED = 'Confirmée',
}

export class OrderItem {
  code: string;
  qte: number;

  constructor(code: string, qte: number) {
    this.code = code;
    this.qte = qte;
  }
}

export class GroupOrder {
  id: string;
  host: User;
  users: User[];
  orders: Map<string, Order> = new Map<string, Order>();
  status: OrderStatus = OrderStatus.EN_COURS;
  deliveryInfos: Delivery;

  constructor(host: User, deliveryInfos: Delivery) {
    this.id = crypto.randomUUID();
    this.host = host;
    this.users = [];
    this.deliveryInfos = deliveryInfos;
    this.orders.set(host.email, new Order(host.email)); // Initialize host order
  }

  addUser(user: User) {
    this.users.push(user);
    this.orders.set(user.email, new Order(user.email)); // Initialize order for the new user
  }

  removeUser(user: User) {
    const index = this.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.orders.delete(user.email); // Remove order for the user
    }
  }

  getUserOrder(email: string): Order | undefined {
    return this.orders.get(email);
  }

  setUserOrder(email: string, order: Order) {
    this.orders.set(email, order);
  }

  getHostOrder(): Order | undefined {
    return this.orders.get(this.host.email);
  }

  setHostOrder(order: Order) {
    this.orders.set(this.host.email, order);
  }

  getHost(): User {
    return this.host;
  }

  getUsers(): User[] {
    return this.users;
  }

  getAllUsers(): User[] {
    return [this.host, ...this.users];
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  setStatus(status: OrderStatus) {
    this.status = status;
  }

  getItems(): OrderItem[] {
    let items: OrderItem[] = [];

    this.orders.forEach(order => {
      order.items.forEach(item => {
        const index = items.findIndex(i => i.code === item.code);
        if (index !== -1) {
          items[index].qte += item.qte;
        } else {
          items.push(item);
        }
      });
    });

    return items;
  }
}
