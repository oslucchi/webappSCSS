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
  selector: 'app-shipment-pickup',
  templateUrl: './shipment-pickup.component.html',
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


export class ShipmentPickupComponent implements OnInit {
  @Input() shipment: any; // Bind data dynamically
  private shipmentsDisplayedColumns: any[] = [
    { def: 'selected', hide: false }, 
    { def: 'customer', hide: false }, 
    { def: 'address', hide: false }, 
    { def: 'province', hide: false }, 
    { def: 'ddt',  hide: false }, 
    { def: 'totalInsuranceCost',  hide: false },
    { def: 'elements', hide: false }
  ];

  public forwarders: any[] = [
    { id: "CES", des: "CESPED", selected: false },
    { id: "TWS", des: "TWS - Collettame", selected: false },
    { id: "GLS", des: "GLS - Collettame", selected: false }
  ];

  public forwarderVar: string;

  public timeRanges: any[] = [
    { id: "09_12", des: "9-12", disabled: true, selected: false },
    { id: "13_16", des: "13-16", disabled: true, selected: false },
    { id: "09_12_13_16", des: "tutto il giorno", disabled: true, selected: false }
  ];

  public timeRangeVar: string = "";

  public checkAll: boolean = false;
  public dataSourceRow: MatTableDataSource<ShipmentRow>;
  public dataSourceShipments: MatTableDataSource<Shipments>;
  public title: string;
  public forwarder: string;
  public pickupDateVar: Date = new Date();
  public shipments: Shipments[] = [];
  public showHideShipment: boolean[] = [];

  private service: ApiService;

  private shipmentList: ShipmentRow[] = [];
  private shipmentRow: ShipmentRow = new ShipmentRow();
  public shipmentSelection:boolean = false;
  public data: any;

  constructor(private dialogRef: MatDialogRef<ShipmentPickupComponent>,
              private apiService: ApiService,
              private mb:MessageBox,
              @Inject(MAT_DIALOG_DATA) data: any) 
  {
    var counter: number = 0;
    this.data = data;
    console.log(this.data.shipments);
    this.dataSourceShipments = this.shipments = this.data.shipments;
    this.shipmentList = [];
    this.showHideShipment = [];
    this.shipments.forEach(element => {
      this.showHideShipment.push(false);
      element.elements.forEach(item => {
        this.shipmentRow = new ShipmentRow();
        this.shipmentRow.customer = element.customerDescription;
        this.shipmentRow.address = element.customerAddress;
        this.shipmentRow.province = element.customerState;
        this.shipmentRow.length = item.length;
        this.shipmentRow.width = item.width;
        this.shipmentRow.heigth = item.height;
        this.shipmentRow.weigth = item.weight;
        this.shipmentRow.insurance = item.insuranceMessage;
        this.shipmentRow.ddt = element.shipmentDocumentNo;
        this.shipmentRow.note = item.note;
        this.shipmentList.push(this.shipmentRow);
      });
    });
    this.dataSourceRow = new MatTableDataSource<ShipmentRow>(this.shipmentList);
    this.title = this.data.title;
    this.forwarderVar = this.forwarder = this.data.forwarder;
    this.service = this.apiService;
    this.shipmentSelection = false;
  }

  ngOnInit() 
  {
    this.onDateChange();
  }

  getShipmentsDisplayedColumns():string[]
  {
    var a: string[] = this.shipmentsDisplayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
    return a;
  }

  changeCheckStatus($event: any)
  {
    console.log(this.checkAll);
    this.shipmentList.forEach(element => { 
      element.selected = this.checkAll;
    });
  }

  sendEmail()
  {
    console.log(this.pickupDateVar);
    this.shipmentList.forEach((element, index) => {
      if (element.selected)
        this.shipments[index].selected = true;
    })
    this.service
      .post(
        'orders/submitShipmentPickupRequest',
        {
          "forwarder": this.forwarderVar,
          "pickupDate": this.pickupDateVar,
          "shipmentList" : this.shipments,
          "timeRange" : (this.timeRangeVar == null ? "09_12_13_16" : this.timeRangeVar)
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
      'orders/createShipments',
      {
        'forwarder' : this.forwarderVar
      }
    )
    .subscribe(
      (res: HttpResponse<any>)=>{  
        console.log(res);
        this.shipments = res.body.shipmentList;
        this.dataSourceShipments = new MatTableDataSource<Shipments>(this.shipments);
        this.shipmentList = [];
        this.showHideShipment = [];
        this.shipments.forEach(element => {
          this.showHideShipment.push(false);
          element.elements.forEach(item => {
            this.shipmentRow = new ShipmentRow();
            this.shipmentRow.customer = element.customerDescription;
            this.shipmentRow.address = element.customerAddress;
            this.shipmentRow.province = element.customerState;
            this.shipmentRow.length = item.length;
            this.shipmentRow.width = item.width;
            this.shipmentRow.heigth = item.height;
            this.shipmentRow.weigth = item.weight;
            this.shipmentRow.insurance = item.insuranceMessage;
            this.shipmentRow.ddt = element.shipmentDocumentNo;
            this.shipmentRow.note = item.note;
            this.shipmentList.push(this.shipmentRow);
          });
        });
        this.dataSourceRow = new MatTableDataSource<ShipmentRow>(this.shipmentList);
      }
    );
  }

  changeShipmentVisibility(index: number)
  {
    this.showHideShipment.forEach((element, currentIdx) => {
      this.showHideShipment[currentIdx] = (index == currentIdx ? !element : false);
    });
  }

  onDateChange()
  {
    if (this.pickupDateVar == null)
    {
      this.timeRanges.forEach(item=> {
        item.disabled = true;
      });
      return;
    }
    var request: Date;
    request = new Date(this.pickupDateVar);
    var requestedPick = request.getFullYear() * 10000 + 
                        (request.getMonth() + 1) * 100 + 
                        request.getDate(); 
    var todayDate = new Date();
    var today = todayDate.getFullYear() * 10000 + 
                (todayDate.getMonth() + 1) * 100  + 
                todayDate.getDate();

    if (requestedPick > today)
    {
      this.timeRanges.forEach(item=> {
        item.disabled = false;
      });
      return;
    }
    else if (requestedPick < today)
    {
      let dialog = this.mb.show('ATTENZIONE','Impossibile pianificare un ritiro per date precedenti a oggi');

      dialog.dialogResult$.subscribe(result=>{
        console.log("Button pressed: ", Button[result])
      });      
    this.timeRanges.forEach(item=> {
        item.disabled = true;
      });
      return;
    }
    else
    {
      if (todayDate.getHours() < 13)
      {
        this.timeRanges.forEach(item=> {
          if ((item.id == "09_12") || (item.id == "09_12_13_16"))
          {
            item.disabled = true;
          }
          else
          {
            item.disabled = false;
          }
        });
        return;
      }
      else
      {
        this.timeRanges.forEach(item=> {
          item.disabled = true;
        });
        let dialog = this.mb.show('ATTENZIONE','Non è più possibile prenotare un ritiro per oggi');

        dialog.dialogResult$.subscribe(result=>{
          console.log("Button pressed: ", Button[result])
        });      
      }
    }
  }

  toggleShipmentSelection(index: number)
  {
    this.shipmentSelection = false;
  }

  toggleAllShipmentsSelection()
  {
    this.shipments.forEach((element, index) => {
      if (this.shipments[index].pickupRequestNo == null)
        this.shipments[index].selected = !this.shipmentSelection;
    });
  }
}