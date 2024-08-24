export class OrderShipments {
    idOrderShipment: number = 0;
    idOrder: number = 0;
	idOrderDetails: number = 0;	  
	length: number = 0;
	width: number = 0;
	height: number = 0;
	weight: number = 0;
	note: string = "";
	volumetricWeight: number = 0;
	internalReference: string = "";
	forwarderLabelData: string = "";
	forwarderReference: string = "";
	forwarderCost: number = 0;
	clientCost: number = 0;
	articleDescription: string = "";
	selected: boolean = false;
}