import {Order} from "./Order";
import mongoose from 'mongoose';

export class OnlineUser {
  socketId: string;
  fullUser: User;

  constructor(id: string, user: User) {
    this.socketId = id;
    this.fullUser = user;
  }
}

export interface User {
  name: string,
  email: string,
  phone: string,
  profilePicture: string,
  deliveriesInfos: [{
    name: string,
    restaurant: number,
    sousLieux: string,
    address: string,
    address2: string
  }] | []
}

const userSchema = new mongoose.Schema<User>({
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
