import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Orders } from '../../_models/orders';
import { SearchFilters } from '../../_models/search-filter';
import { ApiService } from '../../_services/api.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageBox } from '../msg-box/msg-box.provider';
import { Buttons } from '../msg-box/msg-box.common';
import { Button } from '../msg-box/msg-box.common';
import { saveAs } from 'file-saver';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

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
  selector: 'app-shipment-search',
  templateUrl: './shipment-search.component.html',
  styleUrls: ['./shipment-search.component.scss'],
  providers: [{
    provide: MAT_DATE_LOCALE,
    useValue: 'it'
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: MY_FORMATS
  }]
})


export class ShipmentSearchComponent implements OnInit {
  public searchFilter: SearchFilters = new SearchFilters();
  public dataSource: MatTableDataSource<Orders>;
  public orderList: Orders[] = [];
  public empty: string = " ";

  private service: ApiService;
  private cookieService: CookieService;


  private ordersDisplayedColumns: any[] = [
    { def: 'customerRefERP',  hide: false }, 
    { def: 'customerDescription', hide: false }, 
    { def: 'customerDeliveryProvince', hide: true }, 
    { def: 'orderRef', hide: false }, 
    { def: 'status', hide: false }, 
    { def: 'forwarder', hide: false }, 
    { def: 'effectiveAssemblyDate', hide: false }, 
    { def: 'shipmentDate', hide: false }, 
    { def: 'sourceIssue', hide: true },
    { def: 'empty', hide: true },
    { def: 'compositionBoards', hide: true },
    { def: 'compositionTrays', hide: true },
    { def: 'compositionDesign', hide: true },
    { def: 'compositionAccessories', hide: true },
    { def: 'empty1', hide: false },
    { def: 'OC', hide: false },
    { def: 'CC', hide: false },
    { def: 'DTV', hide: false }
   ];


  constructor(private apiService: ApiService,
               private cookieServ: CookieService,
               private mb: MessageBox) 
  {
    console.log("ShipmentSearchComponent constructor");  
    this.service = apiService; 
    this.cookieService = cookieServ;
    this.dataSource = new MatTableDataSource<Orders>();
  }

  getOrdersDisplayedColumns():string[] 
  {
    return this.ordersDisplayedColumns.filter(cd=>!cd.hide).map(cd=>cd.def);
  }

  ngOnInit() {
    this.searchFilter = new SearchFilters();
  }

  searchOrders()
  {
    console.log('Searching orders...');    var i: number;
    var y: number;
    this.dataSource = new MatTableDataSource<Orders>(new Array<Orders>());

    this.service
      .post(
        'histdata/getByFilters',
        {
          "filters": this.searchFilter
        }
      )
      .subscribe(
          (res: HttpResponse<any>)=> {
            if (res.body.orderList.length > 0)
            {
              this.orderList = res.body.orderList;
              this.dataSource = new MatTableDataSource<Orders>(this.orderList);
            }
            else
            {
              let dialog = this.mb.show('I criteri impostati non hanno prodotto risultati', 'ATTENZIONE', Buttons.Ok);

              dialog.dialogResult$.subscribe(result=>{
                console.log("Button pressed: ", Button[result])
              });      
                      
            }
          }
       );
  }

  openDocument(what: String, orderRef: String)
  {
    var returnedDoc: any;
    console.log("requested " + what + " on " + orderRef);
    this.service
      .downloadFromURL(
        'histdata/getDocument',
        {
          "docType": what,
          "orderRef": orderRef
        },
        "blob"
      )
      .subscribe((res: HttpResponse<any>) => {
        console.log(res.headers.keys());
        var objectUrl: any;
        var contentType: string | null = res.headers.get("Content-Type");
        if (contentType === null)
        {
          contentType = "application/pdf";
        }
        
        var blob = new Blob([res.body], {
          type: contentType,
        });
        if (res.headers.get("Content-Type") == "application/pdf")
        {
          objectUrl = URL.createObjectURL(blob);
          window.open(objectUrl);
        }
        else
        {
          var contentDisposition= res.headers.get("content-disposition");
          if (contentDisposition === null)
            contentDisposition = "";
          var fileName = contentDisposition.substring(contentDisposition.search("filename=") + 9);
          saveAs(blob, fileName);
        }
      });
  }

  listOrderDetails()
  {

  }
}
