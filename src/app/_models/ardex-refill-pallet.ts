import { ArdexRefillArticle } from "./ardex-refill-article";

export class ArdexRefillPallet {
    idPallet: number = 0;
	idShipment: number = 0;
	barcode: string = "";
	weight: number = 0;
	articles: ArdexRefillArticle[] = [];
	checked: boolean = false;
	stocked: boolean = false;
}
