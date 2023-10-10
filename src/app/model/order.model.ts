import {OrderItem} from "./order-item.model";

export class Order {
  items: OrderItem[];
  email: string;
  private date: Date;
  status: OrderStatus;
    constructor(email: string, items?: OrderItem[], date?: Date, status?: OrderStatus) {
        this.items = items || [];
        this.email = email;
        this.date = date || new Date();
        this.status = status || OrderStatus.EN_COURS;
    }
    static fromRawObject(raw: any): Order {
        const order = new Order(raw.email, raw.items, new Date(raw.date), raw.status);
        return order;
    }
    addOrderItem(item: OrderItem) {
        this.items.push(item);
    }
    getItems() {
        return this.items;
    }
    getTotal() {
        let total = 0;
        for (const item of this.items) {
            total += item.qte;
        }
        return total;
    }
    getEmail() {
        return this.email;
    }
    getDate() {
        return this.date;
    }
    getStatus() {
        return this.status;
    }
}

export enum OrderStatus {
  EN_COURS = 'En cours',
  CONFIRMEE = 'Confirmée',
}
