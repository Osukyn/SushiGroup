export class Order {
  code: string;
  qte: number;
  constructor(code: string, qte: number) {
    this.code = code;
    this.qte = qte;
  }
}
