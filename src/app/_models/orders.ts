export class Orders {
  idOrder: number = 0;
  status: string = "";
  idCustomer: number = 0;
  idCustomerDelivery: number = 0;
  customerOrderRef: string = "";
  requestedAssemblyDate: Date = new Date();
  effectiveAssemblyDate: Date  = new Date();
  shipmentDate: Date  = new Date();
  invoiceDate: Date  = new Date();
  orderRef: string = "";
  transportDocNum: string = "";
  forwarder: string = "";
  forwarderCost: number = 0;
  clientCost: number = 0;
  assemblyTimeAuto: number = 0;
  assemblyTime: number = 0;
  packageCost: number = 0;
  insuranceCost: number = 0;
  trackingRefrence: string = "";
  compositionBoards: number = 0;
  compositionTrays: number = 0;
  compositionDesign: number = 0;
  compositionAccessories: number = 0;
  orderValue: number = 0;
  confirmationEmail: string = "";
  invoiceValue: number = 0;
  DTVName: string = "";
  DTVDate: Date  = new Date();
  numberOfItems: number = 0;
  shipmentNo: number = 0;
  sourceIssue: string = "";
  customerRefERP: string = "";
  customerDescription: string = "";
  customerDeliveryProvince: string = "";
  pickupReuqestNo: string = "";
  selected: boolean = false;

  static updateOrderField<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
    obj[key] = value;
  }
}
