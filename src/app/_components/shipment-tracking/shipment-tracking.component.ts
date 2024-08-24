import { Component, OnInit } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OrderTracking } from '../../_models/order-tracking';
import { ApiService } from '../../_services/api.service';
import { MessageBox } from '../msg-box/msg-box.provider';
import { HttpResponse } from '@angular/common/http';
import { Button, Buttons } from '../msg-box/msg-box.common';
import { ShipmentDetailsViewerComponent } from '../shipment-details-viewer/shipment-details-viewer.component';

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
  selector: 'app-shipment-tracking',
  templateUrl: './shipment-tracking.component.html',
  styleUrls: ['./shipment-tracking.component.scss'],
  providers: [{
    provide: MAT_DATE_LOCALE,
    useValue: 'it'
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: MY_FORMATS
  }]
})
export class ShipmentTrackingComponent implements OnInit {
  public dataSource: MatTableDataSource<OrderTracking>;
  private service: ApiService;

  private ordersDisplayedColumns: any[] = [
    { def: 'shipmentDate',  hide: false }, 
    { def: 'forwarder', hide: false }, 
    { def: 'status', hide: false }, 
    { def: 'orderRef', hide: false },
    { def: 'customer', hide: false }, 
    { def: 'city', hide: false }, 
    { def: 'province', hide: false }, 
     { def: 'forwarderResponse', hide: true},
   ];


  constructor(private apiService: ApiService,
                private mb: MessageBox,
                private dialog: MatDialog) 
  {
    console.log("OrderTracking component constructor");  
    this.service = apiService; 
    this.dataSource = new MatTableDataSource<OrderTracking>();
  }

  getOrdersDisplayedColumns():string[] 
  {
    return this.ordersDisplayedColumns.filter(cd=>!cd.hide).map(cd=>cd.def);
  }

  ngOnInit()
  {
    console.log('Searching orders...');    var i: number;
    var y: number;
    this.dataSource = new MatTableDataSource<OrderTracking>(new Array<OrderTracking>());

    this.service
      .get(
        'orders/ordersPending'
      )
      .subscribe(
          (res: HttpResponse<any>)=> {
            console.log("received " + res.body.pendingList.length + " records");
            if (res.body.pendingList.length > 0)
            {
              console.log(res.body.pendingList);
              this.dataSource = new MatTableDataSource<OrderTracking>(res.body.pendingList);
            }
            else
            {
              let dialog = this.mb.show('Non ci sono spedizioni in stato pending', 'ATTENZIONE', Buttons.Ok);

              dialog.dialogResult$.subscribe(result=>{
                console.log("Button pressed: ", Button[result])
              });            
            }
          }
       );
  }

  viewShipmentDetails(row: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;

    dialogConfig.data = {
      id: 1,
      caption: "Dettagli spedizione",
      forwarder: row.forwarder,
      details: row.forwarderResponse
    };

    dialogConfig.height = "600px";
    dialogConfig.width = "1400px";

    const dialogRef = this.dialog.open(ShipmentDetailsViewerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      console.log("onClose event emitted");
    });
  }
}
