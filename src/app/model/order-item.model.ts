export class OrderItem {
  code: string;
  qte: number;
  constructor(code: string, qte: number) {
    this.code = code;
    this.qte = qte;
  }
}

export interface RuptureItem {
  produit: string;
  idMagasin: number;
}
