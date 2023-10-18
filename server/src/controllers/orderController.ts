import {Request, Response} from "express";
import mongoose from "mongoose";

export const getOrdersHistory = async (req: Request, res: Response) => {
  const email = req.query.email;
  try {
    mongoose.models.Group.find().then((groups) => {
      const userOrders = groups.filter((group) => group.orders.some((order: any) => order.email === email)).map((group) => {
        return {
          order: group.orders.find((order: any) => order.email === email),
          remise: group.remise,
        };
      });
      console.log('userOrders:', userOrders);
      res.status(200).send(userOrders);
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
