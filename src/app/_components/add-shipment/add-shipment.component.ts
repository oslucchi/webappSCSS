import { Component, OnInit, Inject, Output } from '@angular/core';
import { ApiService } from '../../_services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OrderShipments } from '../../_models/order-shipments';
import { Orders } from '../../_models/orders';
import { HttpResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-shipment',
  templateUrl: './add-shipment.component.html',
  styleUrls: ['./add-shipment.component.scss']
})

export class AddShipmentComponent implements OnInit {
  public shipment = new OrderShipments;
  public dataSourceShipments: MatTableDataSource<OrderShipments>;
  public order: Orders;
  public caption: string;
  public shipments: OrderShipments[];
  public shipCosts: number[] = [0, 0];

  private apiService: ApiService;  
  private dialogRef: MatDialogRef<AddShipmentComponent>;

  private shipmentsDisplayedColumns: any[] = [
    { def: 'length', hide: false }, 
    { def: 'width', hide: false }, 
    { def: 'height', hide: false },  
    { def: 'weight', hide: false },
    { def: 'forwarderCost', hide: false },
    { def: 'clientCost', hide: false },
    { def: 'note', hide: false }
  ];

  public onClose = new EventEmitter();


  constructor(private dialog: MatDialogRef<AddShipmentComponent>,
              private service: ApiService,
              @Inject(MAT_DIALOG_DATA) data: any) 
  {
    this.dialogRef = dialog;
    this.apiService = service;
    this.caption = data.caption;
    this.order = data.order;
    this.shipments = data.shipments;
    this.dataSourceShipments = new MatTableDataSource<OrderShipments>(this.shipments);

    this.dialogRef.backdropClick().subscribe(() => { this.closeForm(); });
    this.shipment.idOrder = data.order.idOrder;
  }

  ngOnInit() 
  {
  }

  getShipmentDisplayedColumns():string[]
  {
    var a: string[] = this.shipmentsDisplayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
    return a;
  }

  newShipment()
  {
    this.shipment = new OrderShipments;
    this.shipment.idOrder = this.order.idOrder;
  }

  saveShipment()
  {
    if (this.shipment.idOrderShipment != 0)
    {
      this.apiService
        .update(
          "orders/shipment",
          {
            "shipment" : this.shipment
          }
        )
        .subscribe((res: HttpResponse<any>)=>{ 
          console.log("Shipment " + this.shipment.idOrderShipment + " changed");
          this.shipment = new OrderShipments();
        });
    }
    else
    {
      const shipmentsTemp = this.dataSourceShipments.data; 
      this.shipment.idOrder = this.order.idOrder;
      this.apiService
        .post(
          "orders/addShipment",
          {
            "shipment" : this.shipment
          }
        )
        .subscribe((res: HttpResponse<any>)=>{ 
          console.log("Shipment " + this.shipment.idOrderShipment + " added");
          this.shipment = res.body.shipment;
          shipmentsTemp.push(this.shipment);
          this.dataSourceShipments.data = shipmentsTemp;
          this.shipment = new OrderShipments();
        });
      }
  }

  editShipment(shipment: OrderShipments)
  {
    this.shipment = shipment;
  }

  calculateShipmentCosts()
  {
    if ((this.shipment.length == 0) ||
        (this.shipment.height == 0) ||
        (this.shipment.width == 0) ||
        (this.shipment.weight == 0) ||
        (this.shipment.length == null) ||
        (this.shipment.width == null) ||
        (this.shipment.height == null) ||
        (this.shipment.weight == null))
    {
      return;
    }

    switch(this.order.forwarder)
    {
      case "DIR":
        break;
      case "CES":
        break;
      case "TWS":
        break;
      case "CLI":
        return; 
      case "GLS":
        return; 
      }

    this.apiService
    .post(
      "orders/shipmentCost",
      {
        "forwarder" : this.order.forwarder, 
        "province" : this.order.customerDeliveryProvince,
        "city" : this.order.customerDeliveryCity,
        "zipCode": this.order.customerDeliveryZipCode,
        "length" : this.shipment.length,
        "width" : this.shipment.width,
        "height" : this.shipment.height,
        "weight" : this.shipment.weight
      }
    )
    .subscribe(
      (res: HttpResponse<any>)=>{  
        console.log(res);
        this.shipment.forwarderCost = res.body.shipmentCostDetails.cost;
      }
    );
  }

  shipmentCostCalculate(shipments: OrderShipments[])
  {
    shipments.forEach(element => {
      this.shipCosts[0] += element.forwarderCost  
      this.shipCosts[1] += element.clientCost  
    });
  }

  closeForm()
  {
    this.shipmentCostCalculate(this.shipments);
    
    this.onClose.emit();
    this.dialogRef.close();
  }
}