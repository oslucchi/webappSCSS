import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { UserProfile } from '../../../_models/user-profile';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from '../../../_services/api.service';
import { Stock } from '../../../_models/stock';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';

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
  selector: 'app-ardex-stock',
  templateUrl: './ardex-stock.component.html',
  styleUrl: './ardex-stock.component.scss',
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


export class ArdexStockComponent implements OnInit {  
  private tempInputValue: string = ''; // To hold temporary edited value

  public profile: UserProfile = new UserProfile(new CookieService(new Document(), "")) ;

  private service: ApiService;
  private cookieService: CookieService;
  private cdr: ChangeDetectorRef;

  public stockList: Stock[] = [];
  public stockDS: MatTableDataSource<Stock> = new MatTableDataSource<Stock>(this.stockList);;
  public ALLOW_LETTERS = 1;
  public ALLOW_NUMBERS = 2;
  public ALLOW_NUMBER_SIGN = 4;
  public ALLOW_DECIMALS = 8;
  public ALLOW_ALL = 255

  private stockDisplayedColumns: any[] = [
    { def: "idStock", hide: true },
    { def: "location", hide: false },
    { def: "articleCode", hide: false },
    { def: "articleDescription", hide: false },
    { def: "eanCode", hide: false },
    { def: "batch", hide: false },
    { def: "expiryDate", hide: false },
    { def: "quantity", hide: false }
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatMenuTrigger, { static: true }) contextMenu: MatMenuTrigger | undefined;

  constructor(private apiService: ApiService,
              private cookieServ: CookieService,
              private dialog: MatDialog,
              private cdrHook: ChangeDetectorRef) 
  {
    this.service = apiService;
    this.cookieService = cookieServ;
    this.profile = new UserProfile(this.cookieService);
    this.stockDS = new MatTableDataSource<Stock>(this.stockList);
    this.cdr = cdrHook;
  }

  ngOnInit(): void {
    this.profile = new UserProfile(this.cookieService);
    this.profile.getProfile();
    this.getStock();
  }

  // Handles input events to temporarily store text
  handleInput(event: Event): void {
    const target = event.target as HTMLElement;
    this.tempInputValue = target.innerText;
  }

  combineFlags(...flags: number[]): number {
    var retVal: number = flags.reduce((acc, flag) => acc | flag, 0)
    console.log(retVal) ;
    return retVal;
  }

  isCharAllowed(event: KeyboardEvent, setAllowed: number): void {
    const charCode = event.key.charCodeAt(0);
    var validate = false;

    if (setAllowed == this.ALLOW_ALL)
      return;

    if (setAllowed & this.ALLOW_LETTERS)
    {
      console.log("check code " + charCode + " versus letters --> " + 
                      ((charCode >= 65 && charCode <= 90) || 
                       (charCode >= 97 && charCode <= 122)));
      validate = validate || 
                 ((charCode >= 65 && charCode <= 90) || 
                  (charCode >= 97 && charCode <= 122)); 
    }

    if (setAllowed & this.ALLOW_NUMBERS)
    {
      console.log("check code " + charCode + " versus numbers --> " + (charCode >= 48 && charCode <= 57));
      validate = validate || (charCode >= 48 && charCode <= 57);
    }

    if (setAllowed & this.ALLOW_NUMBER_SIGN)
    {
      console.log("check code " + charCode + " versus sign --> " + 
                 ((charCode === 43) || 
                  (charCode === 45)));
      validate = validate || 
                 ((charCode === 43) || 
                  (charCode === 45)); 
    }

    if (setAllowed & this.ALLOW_DECIMALS)
    {
      console.log("check code " + charCode + " versus decimal --> " + (charCode === 46));
      validate = validate || (charCode === 46) 
    }    
    console.log("va;lidate is " + validate);
    if (!validate)
      event.preventDefault();
  }

  // Handles Enter/Tab keys to save edits and ignore other non-printable keys
  onKeydown(event: KeyboardEvent, index: number, attribute: keyof Stock): void {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault(); // Prevent default for Enter/Tab
      // this.updateArticle(index, attribute); // Commit change
    } else if (event.key.length > 1 && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault(); // Ignore non-printable keys except Backspace and Delete
    }
  }

  // Commits changes to the article list based on the edited attribute
  updateStock(index: number, attribute: keyof Stock): void {
    if (attribute && this.tempInputValue) {
      (this.stockList[index][attribute] as Stock[keyof Stock]) = this.tempInputValue;
      this.stockDS.data = [...this.stockList]; // Update table data source
      console.log(`Updated stock[${index}].${attribute} to: ${this.tempInputValue}`);
    }
  }


  getStockDisplayedColumns(): string[] {
    return this.stockDisplayedColumns
      .filter((cd) => !cd.hide)
      .map((cd) => cd.def);
  }

  getStock() {
    this.stockList = new Array<Stock>();
    this.stockDS = new MatTableDataSource<Stock>(this.stockList);
    this.service
      .get("locations/getStocklist") 
      .subscribe((res: HttpResponse<any>) => {
          if (!(res.body.stockList?.length < 1 || res.body.stockList == undefined))
          {
            this.stockList = res.body.stockList;
          }
          this.stockDS = new MatTableDataSource<Stock>(this.stockList);
          this.stockDS.sort = this.sort;
          console.log(this.stockDS);
          this.cdr.detectChanges();
      });
  }
}