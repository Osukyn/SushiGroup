import {Request, Response} from "express";
import mongoose from "mongoose";

// Fonction utilitaire pour obtenir les commandes de l'utilisateur
const getUserOrders = async (email: string) => {
  const groups = await mongoose.models.Group.find();
  return groups.filter(group => group.orders.some((order: any) => order.email === email))
    .map(group => ({
      order: group.orders.find((order: any) => order.email === email),
      remise: group.remise,
      isHost: group.host.email === email,
      orderNumber: group.orders.length,
    }));
};

export const getOrdersHistory = async (req: Request, res: Response) => {
  try {
    const userOrders = await getUserOrders(req.query.email as string);
    res.status(200).send(userOrders);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getLastOrder = async (req: Request, res: Response) => {
  try {
    const userOrders = await getUserOrders(req.query.email as string);
    res.status(200).send(userOrders[userOrders.length - 1]);
  } catch (error) {
    res.status(500).send(error);
  }
};
