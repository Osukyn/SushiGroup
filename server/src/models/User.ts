import {Order} from "./Order";
import mongoose from 'mongoose';

export class User {
    id: string;
    email: string;
    name: string;
    picture: string;
    order: Order | undefined;

    constructor(id: string, email: string, name: string, picture: string) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.picture = picture;
    }

    setOrder(order: Order) {
        this.order = order;
    }

    getOrder(): Order {
        return <Order>this.order;
    }
}

const userSchema = new mongoose.Schema({
    name: String,
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
});

export const FullUser = mongoose.model('FullUser', userSchema);