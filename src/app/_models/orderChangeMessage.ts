import { Orders } from "./orders";

export class OrderChangeMessage {
    changedFields: string = "";
    order: Orders = new Orders;
}
