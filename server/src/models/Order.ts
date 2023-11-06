import {FullUser, OnlineUser, User} from "./User";
import {Delivery} from "./Delivery";
import crypto from 'crypto';
import mongoose, {Schema} from "mongoose";
export class Order {
  items: OrderItem[];
  email: string;
  date: Date;
  status: OrderStatus = OrderStatus.EN_COURS;
  observations: string = '';

  constructor(email: string) {
    this.items = [];
    this.email = email;
    this.date = new Date();
  }
}

export enum OrderStatus {
  EN_COURS = 'En cours',
  CONFIRMED = 'Confirmée',
  SENT = 'Envoyée',
}

export class OrderItem {
  code: string;
  qte: number;

  constructor(code: string, qte: number) {
    this.code = code;
    this.qte = qte;
  }
}

export class OrderItemForm {
  qte: number;
  pdt: string;

  constructor(qte: number, pdt: string) {
    this.qte = qte;
    this.pdt = pdt;
  }

  static fromOrderItem(orderItem: OrderItem): OrderItemForm {
    return new OrderItemForm(orderItem.qte, orderItem.code);
  }
}

export class GroupOrder {
  id: string;
  host: User;
  users: User[];
  orders: Map<string, Order> = new Map<string, Order>();
  status: OrderStatus = OrderStatus.EN_COURS;
  deliveryInfos: any;
  creneau: any;
  date: string;
  remise: number;

  constructor(host: User, deliveryInfos: Delivery, creneau: any, date: string, remise: number) {
    this.id = crypto.randomUUID();
    this.host = host;
    this.users = [];
    this.deliveryInfos = deliveryInfos;
    this.creneau = creneau;
    this.date = date;
    this.remise = remise;
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
    console.log('set user order:', this.orders);

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

  getItems(): OrderItemForm[] {
    let items: OrderItemForm[] = [];

    this.orders.forEach(order => {
      order.items.forEach(item => {
        const index = items.findIndex(i => i.pdt === item.code);
        if (index !== -1) {
          items[index].qte += item.qte;
        } else {
          items.push(OrderItemForm.fromOrderItem(item));
        }
      });
    });

    return items;
  }

  toJSON(): any {
    return {
      id: this.id,
      host: this.host,
      users: this.users,
      orders: Object.fromEntries(this.orders),
      status: this.status,
      deliveryInfos: this.deliveryInfos,
      creneau: this.creneau,
      date: this.date,
      remise: this.remise,
    };
  }

  toPersistentObject(): any {
    return {
      id: this.id,
      host: this.host,
      users: this.users,
      orders: [...this.orders.values()],
      status: this.status,
      deliveryInfos: this.deliveryInfos,
      creneau: this.creneau,
      date: this.date,
      remise: this.remise,
    };
  }
}

const groupSchema = new mongoose.Schema({
  id: String,
  host: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    profilePicture: String,
    deliveriesInfos: [{
      name: String,
      restaurant: Number,
      sousLieux: String,
      address: String,
      address2: String
    }]
  },  // Référence à FullUser
  users: [{
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    profilePicture: String,
    deliveriesInfos: [{
      name: String,
      restaurant: Number,
      sousLieux: String,
      address: String,
      address2: String
    }]
  }],  // Liste de références à FullUser
  orders: [{
    items: [{
      code: String,
      qte: Number
    }],
    email: String,
    date: Date,
    status: String,
    observations: String,
  }],
  status: String,
  deliveryInfos: {
    name: String,
    restaurant: Number,
    sousLieux: String,
    address: String,
    address2: String
  },
  creneau: {
    nbCommandes: Number,
    bloque: Boolean,
    possible: Boolean,
    id: Number,
    idMagasin: Number,
    libelle: String,
    nbCommandesMax: Number,
    service: String,
    exceptionnel: Boolean,
    cc: Boolean
  },
  date: String,
  remise: Number,
});

export const Group = mongoose.model('Group', groupSchema);
