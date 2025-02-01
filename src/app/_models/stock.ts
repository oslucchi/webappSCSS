export class Stock {
    idStock: number = 0;
    idLocation: number = 0;
    idArticle: number = 0;
    quantity: string = "";
    batch: string = "";
    expiryDate: Date = new Date();
    articleCode: string = "";
    articleDescription: string = "";
    eancode: string = "";
    x: string = "";
    y: string = "";
    z: string = "";
    wh: string = "";

    // virtual fields
    qtyToPick: number = 0;
    location: string = "";
    selected: boolean = false;
};