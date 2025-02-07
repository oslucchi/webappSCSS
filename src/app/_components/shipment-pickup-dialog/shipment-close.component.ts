
import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Shipments } from '../../_models/shipments';
import { ShipmentRow } from '../../_models/shipmentRow';
import { ApiService } from '../../_services/api.service';
import { HttpResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS, 
         MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import * as moment from 'moment';
import { ɵAnimationGroupPlayer } from '@angular/animations';
import { MessageBox } from '../msg-box/msg-box.provider';
import { Button, Buttons } from '../msg-box/msg-box.common';

// import { request } from 'http';

export const MY_FORMATS = {
  parse: {
      dateInput: 'DD/MM/YYYY',
  },
  display: {
      dateInput: 'DD/MM/YYYY',
      monthYearLabel: 'MM YYYY',
      dateA11yLabel: 'DD/MM/YYYY',
      monthYearA11yLabel: 'MM YYYY',
  },
};

@Component({
  selector: 'app-shipment-close',
  templateUrl: './shipment-close.component.html',
  styleUrls: ['./shipment-actions.component.scss'],
  providers: [{
    provide: MAT_DATE_LOCALE,
    useValue: 'it'
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: MY_FORMATS
  }]
})



export class ShipmentCloseComponent implements OnInit {
  @Input() shipment: any; // Bind data dynamically

  private shipmentsDisplayedColumns: any[] = [
    { def: 'selected', hide: false }, 
    { def: 'customer', hide: false }, 
    { def: 'shipmentNo', hide: false }, 
  ];

  public forwarders: any[] = [
    { id: "GLS", des: "GLS - Collettame", selected: false },
    { id: "CES", des: "Rhenus, pallettizzato", selected: false }
  ];

  public forwarderVar: string;

  public checkAll: boolean = false;
  public title: string;
  public forwarder: string;
  public shipments: Shipments[] = [];
  public shipmentSelection: boolean = false;

  private service: ApiService;
  public data: any;

  constructor(private dialogRef: MatDialogRef<ShipmentCloseComponent>,
              private apiService: ApiService,
              private mb:MessageBox,
              @Inject(MAT_DIALOG_DATA) data: any) 
  {
    var counter: number = 0;
    console.log("close componet spawned");
    this.data = data;
    console.log(this.data.shipments);
    this.shipments = this.data.shipments;

    this.title = this.data.title;
    this.forwarderVar = this.forwarder = this.data.forwarder;
    this.service = this.apiService;
  }

  ngOnInit() 
  {
    this.onForwarderChange("GLS");
  }

  getShipmentsDisplayedColumns():string[]
  {
    var a: string[] = this.shipmentsDisplayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
    return a;
  }

  changeCheckStatus($event: any)
  {
    console.log(this.checkAll);
    this.shipments.forEach(element => { 
      element.selected = this.checkAll;
    });
  }

  closeParcels()
  {
    this.shipments.forEach((element, index) => {
      if (element.selected)
        this.shipments[index].selected = true;
    })
    this.service
      .post(
        'orders/closeParcels',
        {
          "forwarder": this.forwarderVar,
          "shipmentList" : this.shipments,
        }
      )
      .subscribe(
          (res: HttpResponse<any>)=>{
            console.log(res);
            window.alert("Messaggio spedito");
            this.dialogRef.close();
          }
      );
  }

  closeDialog(){
      this.dialogRef.close();
  }

  onForwarderChange(event:any)
  {
    console.log("get shipments for forwarder: '" + event + "'");
    this.service
    .post(
      'orders/fetchParcelsToClose',
      {
        'forwarder' : this.forwarderVar
      }
    )
    .subscribe(
      (res: HttpResponse<any>)=>{  
        console.log(res);
        this.shipments = res.body.shipmentList;
      }
    );
  }

  toggleShipmentSelection(index: number)
  {
    this.shipmentSelection = false;
  }

  toggleAllShipmentsSelection()
  {
    this.shipments.forEach((element, index) => {
        console.log("Shipment " + element.shipmentNo + " is " + this.shipments[index].selected + ". Set it to " + !this.shipmentSelection);
        this.shipments[index].selected = this.shipmentSelection;
    });
  }
}