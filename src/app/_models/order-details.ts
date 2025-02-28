export class OrderDetails {
    idOrderDetails: number = 0;
    idOrder: number = 0;
    idArticle: number = 0;
    quantity: number = 0;
    cost: number = 0;
    sourceIssue: number = 0;
    piecesFromSqm: number = 0;
    articleRefERP: string = "";
    articleCategory: string = "";
    articleDescription: string = "";
    articleUnityOfMeasure: string = "";
    articleRateOfConversion: number = 0;
    articlePackageLength: number = 0;
	articlePackageWidth: number = 0;
	articlePackageHeight: number = 0;
	articlePackageWeight: number = 0;
    adr: string = "";
    atGroundFloor: boolean = true;
	idLocation: number = 0;
	quantityInStock: number = 0;
	rack: string = "";
	expiryDate: Date = new Date();
	batch: string = "";
    selected: boolean = false;
}
