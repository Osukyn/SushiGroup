export class Order {
    items: OrderItem[];
    email: string;
    date: Date;
    status: OrderStatus = OrderStatus.EN_COURS;
    constructor(email: string) {
        this.items = [];
        this.email = email;
        this.date = new Date();
    }
}

export enum OrderStatus {
    EN_COURS = 'En cours',
    CONFIRMED = 'Confirmée',
}

export class OrderItem {
    code: string;
    qte: number;
    constructor(code: string, qte: number) {
        this.code = code;
        this.qte = qte;
    }
}
