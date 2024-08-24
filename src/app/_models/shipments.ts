export class ShipmentItem {
    idArticle: number = 0;
    description: string = "";
    note: string = "";
    length: number = 0;
    width: number = 0;
    height: number = 0;
    volume: number = 0;
    weight: number = 0;
    barCode: string = "";
    insurance: string = "";
    insuranceCost: number = 0;
};

export class Shipments {
        
    idOrder: number = 0;
    customer: string = "";
    address: string = "";
    city: string = "";
    province: string = "";
    zipCode: string = "";
    ddt: string = "";
    ddtDate: Date = new Date();
    note: string = "";
    insuranceMessage: string = "";
    totalInsuranceCost: number = 0;
    totalWeigth: number = 0;
    volumetricWeigth: number = 0;
    orderValue: number = 0;
    orderReference: string = "";
    numOfItems: number = 0;
    customerMail: string = "";
    pickupReuqestNo: string = "";
    elements: ShipmentItem[] = [];
    selected: boolean = false;
}
