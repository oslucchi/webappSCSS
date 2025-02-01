export class ShipmentItem {
     tableName: string = "";
     id: number = 0;
     idShipment: number = 0;
     ifsHandlingUnitId: number = 0;
     realWeigth: number = 0;
     volumeWeigth: number = 0;
     length: number = 0;
     width: number = 0;
     height: number = 0;
     weight: number = 0;
     parcelNo: string = "";
     partNo: string = "";
     forwarderLabelData: string = "";
     lastServiceResponseRetrieved: string = "";
     lengthConvFact: number = 0;
     weigthConvFact: number = 0;
     insuranceRequired: boolean = false;
     value: number = 0;
     insuranceMessage: string = "";
     note: string = "";
     selected: boolean = false;
};

export class Shipments {
    tableName: string = "";
    id: number = 0;
    weigthConvFact: number = 0;
    shipmentNo: string = "";
    idCustomer: number = 0;
    customerRef: string = "";
    idCustomerAddress: number = 0;
    customerAddressRef: string = "";
    shipmentDocumentNo: string = "";
    customerEmail: string = "";
    realWeigth: number = 0;
    shipmentValue: number = 0;
    volumeWeigth: number = 0;
    forwarder: string = "";
    forwarderShipmentRef: string = "";
    shipmentLabels: string = "";
    customerDescription: string = "";
    customerAddress: string = "";
    customerCity: string = "";
    customerZIP: string = "";
    customerState: string = "";
    labelsUploadUrl: string = "";
    ifsDocumentNo: string = "";
    parcelTrackingUrl: string = "";
    pickupRequestNo: string = "";
	consigned: boolean = false;
    elements: ShipmentItem[] = [];
    selected: boolean = false;
}
