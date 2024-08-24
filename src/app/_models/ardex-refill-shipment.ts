import { ArdexRefillPallet } from "./ardex-refill-pallet";

export class ArdexRefillShipment {
    idShipment: number = 0;
	date: Date = new Date();
	numOfPallets: number = 0;
	status: string = "";
	pallets: ArdexRefillPallet[] = [];
}
