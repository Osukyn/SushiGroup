import {Order} from "./order.model";

export interface User {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    profilePicture: string,
    deliveriesInfos: [any]
}
