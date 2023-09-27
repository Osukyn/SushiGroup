import {User} from "./user.model";
import {Order, OrderStatus} from "./order.model";
import {OrderItem} from "./order-item.model";

export class Group {
  host: User;
  users: User[];
  status: OrderStatus = OrderStatus.EN_COURS;
  deliveryInfos: any;

  constructor(host: User, deliveryInfos: any) {
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
    return undefined;
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
