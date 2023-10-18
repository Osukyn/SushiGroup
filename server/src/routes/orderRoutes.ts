import express from "express";
import * as orderController from "../controllers/orderController";

const router = express.Router();

router.get('/getOrdersHistory', orderController.getOrdersHistory);

export default router;
