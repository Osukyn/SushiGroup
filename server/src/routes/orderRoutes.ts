import express from "express";
import * as orderController from "../controllers/orderController";

const router = express.Router();

router.get('/getOrdersHistory', orderController.getOrdersHistory);
router.get('/getLastOrder', orderController.getLastOrder);

export default router;
