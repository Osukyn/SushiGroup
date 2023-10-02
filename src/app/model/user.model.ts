import {Order} from "./order.model";

export interface User {
  name: string,
  email: string,
  phone: string,
  profilePicture: string,
  deliveriesInfos: [any]
}
