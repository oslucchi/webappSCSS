import { ArdexRefillArticle } from "./ardex-refill-article";

export class ArdexRefillPallet {
    idPallet: number = 0;
	idShipment: number = 0;
	barcode: string = "";
	articles: ArdexRefillArticle[] = [];
}
