"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, email, name, picture) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.picture = picture;
    }
    setOrder(order) {
        this.order = order;
    }
    getOrder() {
        return this.order;
    }
}
exports.User = User;
