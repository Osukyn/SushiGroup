import { Request, Response } from 'express';
import { FullUser } from '../models/User';
import mongoose from "mongoose";

export const register = async (req: Request, res: Response) => {
    console.log(req.params);
    console.log(req.body);
    try {

        const user = new FullUser(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

export const getUser = async (req: Request, res: Response) => {
    const email = req.query.email;
    console.log(email);
    try {
        mongoose.models.FullUser.findOne({email: email}).then((user) => {
            res.status(200).send(user);
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const isUserRegistered = async (req: Request, res: Response) => {
    const email = req.query.email;
    console.log(email);
    try {
        mongoose.models.FullUser.findOne({email: email}).then((user) => {
            res.status(200).send(user !== null);
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

// ... Ajoutez d'autres méthodes selon vos besoins ...
