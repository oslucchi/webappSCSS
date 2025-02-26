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
import { StorageService } from '../../../_services/storage.service';


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
  file: File | any = null;
  public shipmentsList: ArdexRefillShipment[] = [];
  public palletList: ArdexRefillPallet[] = [];
  public articleList: ArdexRefillArticle[] = [];
  public articleDS: MatTableDataSource<ArdexRefillArticle> = new MatTableDataSource<ArdexRefillArticle>(this.articleList);;
  public shipmentDS: MatTableDataSource<ArdexRefillShipment> = new MatTableDataSource<ArdexRefillShipment>(this.shipmentsList);;
  public palletDS: MatTableDataSource<ArdexRefillPallet> = new MatTableDataSource<ArdexRefillPallet>(this.palletList);
  public menuEntries : string[] = ["", "Print shipment"];
  public shipment: ArdexRefillShipment | undefined;
  public pallet: ArdexRefillPallet | undefined;
  public contextMenuPosition = { x: '0px', y: '0px' };
  public currentShipmentId: number = 0;
  public currentPalletId: number = 0;
  public profile: UserProfile = new UserProfile(new CookieService(new Document(), "")) ;
  public checkmarkPath: string = "";

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
    { def: "checked", hide: false},
  ];

  private palletsDisplayedColumns: any[] = [
    { def: "idPallet", hide: false },
    { def: "barcode", hide : false},
    { def: "weight", hide : false},
    { def: "checked", hide: false},
    { def: "stocked", hide: false}
  ];

  private articlesDisplayedColumns: any[] = [
    { def: "ardexArticleId", hide: false },
    { def: "description", hide: false },
    { def: "numOfItems", hide : false},
    { def: "weight", hide: false },
    { def: "batch", hide : false},
    { def: "expiryDate", hide: false },
    { def: "checked", hide: false},
    { def: "stocked", hide: false}
  ];

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatMenuTrigger, { static: true }) contextMenu: MatMenuTrigger | undefined;

  constructor(private apiService: ApiService,
              private cookieServ: CookieService,
              private dialog: MatDialog,
              private storage: StorageService) 
  {
    this.service = apiService;
    this.cookieService = cookieServ;
    this.shipmentDS = new MatTableDataSource<ArdexRefillShipment>();
    this.profile = new UserProfile(this.cookieService);
    this.checkmarkPath = "assets/img/checkmark.png";
  }

  ngOnInit(): void {
    this.profile = new UserProfile(this.cookieService);
    this.profile.getProfile();
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
              this.currentShipmentId = this.shipmentsList[0].idShipment;
              this.palletList = this.shipmentsList[0].pallets;
              this.currentPalletId = this.palletList[0].idPallet;
              this.articleList = this.palletList[0].articles;
            }
            this.shipmentDS = new MatTableDataSource<ArdexRefillShipment>(this.shipmentsList);
            this.palletDS =  new MatTableDataSource<ArdexRefillPallet>(this.palletList);
            this.articleDS = new MatTableDataSource<ArdexRefillArticle>(this.articleList);
            this.shipmentDS.sort = this.sort;
            this.palletDS.sort = this.sort;
            this.articleDS.sort = this.sort;

        }
      );
    }
  }

  listPallets(row: any) {
    this.shipment = row;
    this.currentShipmentId = row.idShipment;
    this.currentPalletId = 0;
    this.palletList = row.pallets;
    this.palletDS =  new MatTableDataSource<ArdexRefillPallet>(this.palletList);
    this.currentPalletId = this.palletList[0].idPallet;
    this.articleList = this.palletList[0].articles;    
    this.articleDS =  new MatTableDataSource<ArdexRefillArticle>(this.articleList);
    this.palletDS.sort = this.sort;
    this.articleDS.sort = this.sort;
}

  listArticles(row: any) {
    this.pallet = row;
    this.currentPalletId = row.idPallet;
    this.articleList = row.articles;    
    this.articleDS =  new MatTableDataSource<ArdexRefillArticle>(this.articleList);
    this.articleDS.sort = this.sort;
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
    this.profile.setProfile();
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
/*
  uploaRefillMessage() {
    let formData: FormData = new FormData();
    if (this.file != null) {
      formData.append("file", this.file.name);
      this.service
        .uploadToURL(
          "ardex/uploadRefillMessage",
          formData
        )
        .subscribe((res: HttpResponse<any>) => {
          if (res.body.DTVName != null) {
            this.orderHandler.details.DTVName = res.body.DTVName;
            this.orderHandler.details.DTVDate = res.body.DTVDate;
          }
          if (res.body.DBError != null && res.body.DBError != "") {
            window.alert(
              "Cariacamento completato con errore " + res.body.DBError
            );
          } else {
            window.alert("Caricamento completato");
            this.file = null;
          }
          console.log(res);
        });
    } else {
      window.alert("Empty list of files");
    }
  }
  */
}

export interface MenuParm {
  shipment: ArdexRefillShipment;
  newStatus: string;
}