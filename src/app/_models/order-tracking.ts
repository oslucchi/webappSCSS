export class OrderTracking {
	idOrderShipment: number = 0;
	idOrder: number = 0;
	status: string = "";
	forwarderResponse: string = "";
	queryURL: string = "";
	shipmentNo: string = "";	
	shipmentDate: Date = new Date();
	customer: string = "";
	city: string = "";
	province: string = "";
	forwarder: string = "";
	orderRef: string = "";
	selected: boolean = false;
}
