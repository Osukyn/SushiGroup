import {User} from "./User";
import {Delivery} from "./Delivery";

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
  host: User;
  users: User[];
  status: OrderStatus = OrderStatus.EN_COURS;
  deliveryInfos: Delivery;

  constructor(host: User, deliveryInfos: Delivery) {
    this.host = host;
    this.users = [];
    this.deliveryInfos = deliveryInfos;
  }

  addUser(user: User) {
    this.users.push(user);
  }

  removeUser(user: User) {
    const index = this.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  getUserOrder(user: User): Order | undefined {
    const index = this.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      return this.users[index].order;
    }
  }

  setUserOrder(user: User, order: Order) {
    const index = this.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.users[index].order = order;
    }
  }

  getHostOrder(): Order | undefined {
    return this.host.order;
  }

  setHostOrder(order: Order) {
    this.host.order = order;
  }

  getHost(): User {
    return this.host;
  }

  getUsers(): User[] {
    return this.users;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  setStatus(status: OrderStatus) {
    this.status = status;
  }

  getItems(): OrderItem[] {
    let items: OrderItem[] = [];
    if (this.host.order) {
      items = this.host.order.items;
    }
    this.users.forEach(user => {
      if (user.order) {
        user.order.items.forEach(item => {
          const index = items.findIndex(i => i.code === item.code);
          if (index !== -1) {
            items[index].qte += item.qte;
          } else {
            items.push(item);
          }
        });
      }
    });
    return items;
  }
}
