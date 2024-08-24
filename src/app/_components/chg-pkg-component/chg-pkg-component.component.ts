
import { Component, OnInit, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OrderShipments } from '../../_models/order-shipments';
import { Orders } from '../../_models/orders';
import { HttpResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { OrderDetails } from '../../_models/order-details';
import { ApiService } from '../../_services/api.service';


@Component({
  selector: 'app-chg-pkg-component',
  templateUrl: './chg-pkg-component.component.html',
  styleUrls: ['./chg-pkg-component.component.scss']
})

export class ChgPkgComponentComponent implements OnInit {
  public shipment = new OrderShipments;
  public dataSourceShipments: MatTableDataSource<OrderShipments>;
  public order: Orders;
  public caption: string;
  public shipments: OrderShipments[];
  public shipmentsDist: OrderShipments[];
  public shipCosts: number[] = [0, 0];
  public groupedShipment: OrderShipments = new OrderShipments;
  public orderDetails: OrderDetails[] = [];
  public articleFilter: string = "";
  public weight: number;

  private apiService: ApiService;  
  private dialogRef: MatDialogRef<ChgPkgComponentComponent>;
  public shipmentSelection:boolean = false;

  private shipmentsDisplayedColumns: any[] = [
    { def: 'selected', hide: false }, 
    { def: 'articleDescription', hide: false }, 
    { def: 'length', hide: false }, 
    { def: 'width', hide: false }, 
    { def: 'height', hide: false },  
    { def: 'weight', hide: false }
  ];

  public onClose = new EventEmitter();


  constructor(private dialog: MatDialogRef<ChgPkgComponentComponent>,
              private service: ApiService,
              @Inject(MAT_DIALOG_DATA) data: any) 
  {
    this.dialogRef = dialog;
    this.apiService = service;
    this.caption = data.caption;
    this.order = data.order;
    this.shipments = data.shipments;
    this.shipmentsDist = [];
    this.shipments.forEach(val => this.shipmentsDist.push(Object.assign({}, val)));

    this.dataSourceShipments = new MatTableDataSource<OrderShipments>(this.shipments);

    this.dialogRef.backdropClick().subscribe(() => { this.closeForm(); });
    this.shipment.idOrder = data.order.idOrder;

    this.weight = 0;
  }

  ngOnInit() 
  {
    this.groupedShipment = new OrderShipments();
  }

  getShipmentDisplayedColumns():string[]
  {
    var a: string[] = this.shipmentsDisplayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
    return a;
  }

  closeForm()
  {
    this.onClose.emit();
    this.dialogRef.close();
  }

  toggleShipmentSelection(index: number)
  {
    var multip = -1;
    this.shipmentSelection = false;
    if (!this.shipments[index].selected)
    {
      multip = 1;
    }

    this.weight += this.shipments[index].weight * multip;
    this.groupedShipment!.weight = this.weight;
  }

  toggleAllShipmentsSelection()
  {
    this.weight = 0;
    this.shipments.forEach((element, index) => {
      this.shipments[index].selected = !this.shipmentSelection;
      if (this.shipments[index].selected)
      {
        this.weight += element.weight;
      }
  
    });
    this.groupedShipment!.weight = this.weight;
  }

  // grouItems(articleDescriptionIn: string, lengthIn: number, widthIn: number, heightIn: number, weightIn: number)
  groupItems()
  {
    var shipmentsUngrouped: OrderShipments[];
    var shipmentsDistTemp: OrderShipments[];

    shipmentsUngrouped = [];
    shipmentsDistTemp = [];
    this.shipmentsDist.forEach(val => shipmentsDistTemp!.push(Object.assign({}, val)));

    this.shipments.forEach((element, index) => {
        index = shipmentsDistTemp!.findIndex(e => e.idOrderShipment === element.idOrderShipment);
        if (element.selected)
        {
           shipmentsDistTemp.splice(index, 1);
        }
      }
    )
    if (shipmentsDistTemp.length > this.shipmentsDist.length - 2)
    {
      return;
    }
    this.groupedShipment!.idOrder = this.order.idOrder;
    this.groupedShipment!.idOrderDetails = -1;
    
    if (this.groupedShipment !== undefined)
    {
      shipmentsDistTemp.push(this.groupedShipment);
    }
    this.shipments = shipmentsDistTemp;
    this.shipmentsDist = [];
    this.shipments.forEach(val => this.shipmentsDist.push(Object.assign({}, val)));
    this.groupedShipment = new OrderShipments();
    this.articleFilter = "";
    this.shipmentSelection = false;
    this.weight = 0;
  }

  closeDialog(){
    this.dialogRef.close();
  }

  saveShipments()
  {
    this.service
    .post(
      'orders/updateShipments',
      {
        'order' : this.order,
        'shipments' : this.shipments
      }
    )
    .subscribe(
      (res: HttpResponse<any>)=>{  
        console.log(res);
        this.shipments = res.body.shipments;
        this.order = res.body.order;
        this.shipmentsDist = [];
        this.shipments.forEach(val => this.shipmentsDist.push(Object.assign({}, val))); 
        this.articleFilter = "";
        this.shipmentSelection = false;
        this.groupedShipment = new OrderShipments();     
      });
  }

  revertFromDetails()
  {
    this.service
    .get('orders/allDetails/' + this.order.idOrder)
    .subscribe(
      (res: HttpResponse<any>)=>{  
        console.log(res);
        this.orderDetails = res.body.orderDetails;
        this.shipments = [];
        this.orderDetails.forEach((element, index) => {
          for(let i = 0; i < element.quantity; i++)
          {
            this.shipment = new OrderShipments();
            this.shipment.idOrder = element.idOrder;
            this.shipment.articleDescription = (element.articleRefERP + '-' + element.articleDescription).substring(0,64);
            this.shipment.height = element.articlePackageHeight;
            this.shipment.width = element.articlePackageWidth;
            this.shipment.length = element.articlePackageLength;
            this.shipment.weight = element.articlePackageWeight;
            this.shipment.idOrderDetails = element.idOrderDetails;
            this.shipments.push(this.shipment);
          }
        })
        this.saveShipments();
      }
    );
  }

  onFilterChange(event: any): void {
    var searchValue: string = event.target.value;

    if (searchValue == "")
    {
      this.shipments = this.shipmentsDist;
    }
    else
    {
      this.shipments = this.shipmentsDist.filter((obj) => {
        return obj.articleDescription.toLowerCase().includes(searchValue.toLowerCase());
      });
    }
    this.shipments.forEach((e, i) => {
      e.selected = false;
    });
    this.groupedShipment!.weight = 0;
  }
}