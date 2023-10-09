import {User} from "./user.model";
import {Order, OrderStatus} from "./order.model";
import {OrderItem} from "./order-item.model";

export interface Group {
  id: string;
  host: User;
  users: User[];
  status: OrderStatus;
  orders: Map<string, Order>;
  deliveryInfos: any;
  creneau: any;
}
