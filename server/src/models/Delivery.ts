export class Delivery {
    idRestaurant: number;
    address: string;
    address2: string;
    constructor(idRestaurant: number, address: string, address2: string) {
        this.idRestaurant = idRestaurant;
        this.address = address;
        this.address2 = address2;
    }
}