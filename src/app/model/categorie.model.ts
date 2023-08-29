import {Produit} from "./produit.model";

export interface Categorie {
    code: string;
    complement: boolean;
    produits: Produit[];
}
