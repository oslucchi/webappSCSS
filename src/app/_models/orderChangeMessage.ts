import { Orders } from "./orders";

export class OrderChangeMessage {
    sender: string = "";
	text: string = "";
    changedFields: string = "";
    order: Orders = new Orders;
}
