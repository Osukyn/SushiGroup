import {Request, Response} from 'express';
import {FullUser} from '../models/User';
import mongoose from "mongoose";
import {findGroupByUserEmail, getOnlineUserByEmail, getSocketByUserEmail} from "./socketController";

export const register = async (req: Request, res: Response) => {
  console.log(req.params);
  console.log(req.body);
  try {
    const user = new FullUser(req.body);
    await user.save();
    getSocketByUserEmail(user.email)?.emit('userUpdate', user);
    const onlineUser = getOnlineUserByEmail(user.email);
    if (onlineUser) onlineUser.fullUser = user;
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getUser = async (req: Request, res: Response) => {
  const email = req.query.email;
  console.log('getUser', email);
  try {
    mongoose.models.FullUser.findOne({email: email}).then((user) => {
      getSocketByUserEmail(user.email)?.emit('userUpdate', user);
      const onlineUser = getOnlineUserByEmail(user.email);
      if (onlineUser) onlineUser.fullUser = user;
      res.status(200).send(user);
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

export const isUserRegistered = async (req: Request, res: Response) => {
  const email = req.query.email;
  try {
    mongoose.models.FullUser.findOne({email: email}).then((user) => {
      res.status(200).send(user !== null);
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

export const isUserInGroup = async (req: Request, res: Response) => {
  const email = req.query.email;
  if (typeof email === 'string') res.status(200).send(findGroupByUserEmail(email) !== undefined);
  else res.status(400).send('Missing email');
}

