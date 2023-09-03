import {Order} from "./order.model";

export interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    order: Order | undefined;
}
