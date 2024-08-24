import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../_services/api.service';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort }  from '@angular/material/sort';
import { MatTableDataSource }  from '@angular/material/table';
import { ArdexRefillShipment } from '../../../_models/ardex-refill-shipment';
import { HttpResponse } from '@angular/common/http';
import { ArdexRefillPallet } from '../../../_models/ardex-refill-pallet';
import { ArdexRefillArticle } from '../../../_models/ardex-refill-article';
import { UserProfile } from '../../../_models/user-profile';
import { User } from '../../../_models/user';
import { CookieService } from 'ngx-cookie-service';


export const MY_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MM YYYY",
    dateA11yLabel: "DD/MM/YYYY",
    monthYearA11yLabel: "MM YYYY",
  },
};

@Component({
  selector: 'app-ardex-receiving',
  templateUrl: './ardex-receiving.component.html',
  styleUrls: ['./ardex-receiving.component.scss'],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: "it",
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS,
    },
  ],
})
export class ArdexReceivingComponent implements OnInit {  
  public shipmentsList: ArdexRefillShipment[] = [];
  public palletList: ArdexRefillPallet[] = [];
  public articleList: ArdexRefillArticle[] = [];
  public articleDS: MatTableDataSource<ArdexRefillArticle> = new MatTableDataSource<ArdexRefillArticle>(this.articleList);;
  public shipmentDS: MatTableDataSource<ArdexRefillShipment> = new MatTableDataSource<ArdexRefillShipment>(this.shipmentsList);;
  public palletDS: MatTableDataSource<ArdexRefillPallet> = new MatTableDataSource<ArdexRefillPallet>(this.palletList);
  public profile: UserProfile;
  public menuEntries : string[] = ["", "Print shipment"];
  public shipment: ArdexRefillShipment | undefined;
  public contextMenuPosition = { x: '0px', y: '0px' };

  private service: ApiService;
  private cookieService: CookieService;
  private shipmentStatusFilter: string = "";
  private STATUS_CODE: string[] = ["RCD", "PLN", "INC"];

  private shipmentsDisplayedColumns: any[] = [
    { def: "rowIndex", hide: true },
    { def: "idShipment", hide: false },
    { def: "date", hide : false},
    { def: "numOfPallets", hide: false },
    { def: "status", hide: false },
  ];

  private palletsDisplayedColumns: any[] = [
    { def: "idPallet", hide: false },
    { def: "barcode", hide : false},
  ];

  private articlesDisplayedColumns: any[] = [
    { def: "ardexArticleId", hide: false },
    { def: "numOfItems", hide : false},
    { def: "weight", hide: false },
    { def: "batch", hide : false},
    { def: "expiryDate", hide: false },
  ];

  @ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
  @ViewChild(MatMenuTrigger, { static: true }) contextMenu: MatMenuTrigger | undefined;

  constructor(private apiService: ApiService,
              private cookieServ: CookieService,
              private dialog: MatDialog) 
  {
    this.service = apiService;
    this.cookieService = cookieServ;
    this.shipmentDS = new MatTableDataSource<ArdexRefillShipment>();
    this.profile = new UserProfile(this.cookieService);
    this.profile.filters.filterArdex[0] = true;
    this.profile.filters.filterArdex[1] = true;
    this.profile.filters.filterArdex[2] = true;
  }

  ngOnInit(): void {
    this.getShipments();
  }

  getShipmentDisplayedColumns(): string[] {
    return this.shipmentsDisplayedColumns
      .filter((cd) => !cd.hide)
      .map((cd) => cd.def);
  }
  getPalletDisplayedColumns(): string[] {
    return this.palletsDisplayedColumns
      .filter((cd) => !cd.hide)
      .map((cd) => cd.def);
  }
  getArticleDisplayedColumns(): string[] {
    return this.articlesDisplayedColumns
      .filter((cd) => !cd.hide)
      .map((cd) => cd.def);
  }

  getShipments() {
    this.shipmentStatusFilter = "";
    var sep = "";
    for(var i = 0; i < 3; i++)
    {
      if (this.profile.filters.filterArdex[i])
      {
        this.shipmentStatusFilter += sep + "'" + this.STATUS_CODE[i] + "'";
        sep = ",";
      }
    }

    this.shipmentsList = new Array<ArdexRefillShipment>(); 
    this.palletList = new Array<ArdexRefillPallet>();
    this.articleList = new Array<ArdexRefillArticle>();
    this.shipmentDS = new MatTableDataSource<ArdexRefillShipment>(this.shipmentsList);
    this.palletDS =  new MatTableDataSource<ArdexRefillPallet>(this.palletList);
    this.articleDS = new MatTableDataSource<ArdexRefillArticle>(this.articleList);
    if (this.shipmentStatusFilter.length > 0)
    {
      this.service
        .post("ardex/shipmentsByStatus", {
          statusSet: this.shipmentStatusFilter,
        }) 
        .subscribe((res: HttpResponse<any>) => {
            if (!(res.body.shipments.length < 1 || res.body.shipments == undefined))
            {
              this.shipmentsList = res.body.shipments;
              this.palletList = this.shipmentsList[0].pallets;
              this.articleList = this.palletList[0].articles;
            }
            this.shipmentDS = new MatTableDataSource<ArdexRefillShipment>(this.shipmentsList);
            this.palletDS =  new MatTableDataSource<ArdexRefillPallet>(this.palletList);
            this.articleDS = new MatTableDataSource<ArdexRefillArticle>(this.articleList);
        }
      );
    }
  }

  listPallets(row: any) {
    this.palletList = row.pallets;    
    this.palletDS =  new MatTableDataSource<ArdexRefillPallet>(this.palletList);
  }

  listArticles(row: any) {
    this.articleList = row.articles;    
    this.articleDS =  new MatTableDataSource<ArdexRefillArticle>(this.articleList);
  }

  changeProfileFilters(event: MatCheckboxChange) 
  {
    console.log(
      "Event called on '" +
        event.source.id +
        "' with status '" +
        event.checked +
        "'"
    );

    switch (event.source.id) 
    {
      case "chkRCD":
        this.profile.filters.filterArdex[0] = event.checked;
        break;
      case "chkPLN":
        this.profile.filters.filterArdex[1] = event.checked;
        break;
      case "chkINC":
        this.profile.filters.filterArdex[2] = event.checked;
        break;
    }
    this.getShipments();
  }

  onContextMenu(event: MouseEvent, shipment: ArdexRefillShipment) {
    event.preventDefault();
    // var shipment = this.shipmentsList[rowIndex];
    this.shipment = shipment;
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu!.menuData = { 'shipment' : this.shipment };
    this.contextMenu!.menu!.focusFirstItem('mouse');
    this.contextMenu!.openMenu();
  }

  changeShipmentStatus(shipment: ArdexRefillShipment | undefined){
    if (shipment === undefined)
      return;
    var oldStatus = shipment.status;
    shipment.status = (shipment.status == "PLN" ? "INC" : shipment.status == "INC" ? "RCD" : "PLN");

    if(confirm("Confermi cambio di stato della spedizione a '" + shipment.status + "'?" )) {
      this.service
        .update("ardex/updateShipment", {
          updateWhat: "status",
          statusSet: this.shipmentStatusFilter,
          shipment: shipment
        }) 
        .subscribe((res: HttpResponse<any>) => {
            if (!(res.body.shipments.length < 1 || res.body.shipments == undefined))
            {
              this.shipmentsList = res.body.shipments;
              this.palletList = this.shipmentsList[0].pallets;
              this.articleList = this.palletList[0].articles;
            }
            this.shipmentDS = new MatTableDataSource<ArdexRefillShipment>(this.shipmentsList);
            this.palletDS =  new MatTableDataSource<ArdexRefillPallet>(this.palletList);
            this.articleDS = new MatTableDataSource<ArdexRefillArticle>(this.articleList);
        }
      );
    }
    else
    {
      shipment.status = oldStatus;
    }
  }

  printoutShipment(shipment: ArdexRefillShipment | undefined){
    alert("printout shipment " + shipment!.idShipment);
  }
}

export interface MenuParm {
  shipment: ArdexRefillShipment;
  newStatus: string;
}