"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.OrderStatus = exports.Order = void 0;
class Order {
    constructor(email) {
        this.status = OrderStatus.EN_COURS;
        this.items = [];
        this.email = email;
        this.date = new Date();
    }
}
exports.Order = Order;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["EN_COURS"] = "En cours";
    OrderStatus["CONFIRMED"] = "Confirm\u00E9e";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
class OrderItem {
    constructor(code, qte) {
        this.code = code;
        this.qte = qte;
    }
}
exports.OrderItem = OrderItem;
