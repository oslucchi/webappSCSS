import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../_services/api.service';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort }  from '@angular/material/sort';
import { MatTableDataSource }  from '@angular/material/table';
import { HttpResponse } from '@angular/common/http';
import { UserProfile } from '../../../_models/user-profile';
import { CookieService } from 'ngx-cookie-service';
import { Articles } from '../../../_models/articles';


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
  selector: 'app-ardex-articles',
  templateUrl: './ardex-articles.component.html',
  styleUrls: ['./ardex-articles.component.scss'],
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
export class ArdexArticleComponent implements OnInit {  
  private tempInputValue: string = ''; // To hold temporary edited value

  public profile: UserProfile = new UserProfile(new CookieService(new Document(), "")) ;

  private service: ApiService;
  private cookieService: CookieService;

  public articleList: Articles[] = [];
  public articleDS: MatTableDataSource<Articles> = new MatTableDataSource<Articles>(this.articleList);;
  public ALLOW_LETTERS = 1;
  public ALLOW_NUMBERS = 2;
  public ALLOW_NUMBER_SIGN = 4;
  public ALLOW_DECIMALS = 8;
  public ALLOW_ALL = 255

  private articlesDisplayedColumns: any[] = [
    { def: "idArticle", hide: false },
    { def: "refERP", hide: false },
    { def: "description", hide: false },
    { def: "GTIN", hide : false},
    { def: "length", hide: false },
    { def: "width", hide : false},
    { def: "height", hide: false },
    { def: "weight", hide: false },
  ];

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();
  @ViewChild(MatMenuTrigger, { static: true }) contextMenu: MatMenuTrigger | undefined;

  constructor(private apiService: ApiService,
              private cookieServ: CookieService,
              private dialog: MatDialog) 
  {
    this.service = apiService;
    this.cookieService = cookieServ;
    this.profile = new UserProfile(this.cookieService);
    this.articleDS = new MatTableDataSource<Articles>(this.articleList);
  }

  ngOnInit(): void {
    this.profile = new UserProfile(this.cookieService);
    this.profile.getProfile();
    this.getArticles();
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
  onKeydown(event: KeyboardEvent, index: number, attribute: keyof Articles): void {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault(); // Prevent default for Enter/Tab
      this.updateArticle(index, attribute); // Commit change
    } else if (event.key.length > 1 && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault(); // Ignore non-printable keys except Backspace and Delete
    }
  }

  // Commits changes to the article list based on the edited attribute
  updateArticle(index: number, attribute: keyof Articles): void {
    if (attribute && this.tempInputValue) {
      (this.articleList[index][attribute] as Articles[keyof Articles]) = this.tempInputValue;
      this.articleDS.data = [...this.articleList]; // Update table data source
      console.log(`Updated article[${index}].${attribute} to: ${this.tempInputValue}`);
    }
  }


  getArticlesDisplayedColumns(): string[] {
    return this.articlesDisplayedColumns
      .filter((cd) => !cd.hide)
      .map((cd) => cd.def);
  }

  getArticles() {
    this.articleList = new Array<Articles>();
    this.articleDS = new MatTableDataSource<Articles>(this.articleList);
    this.service
      .get("ardex/allArticles") 
      .subscribe((res: HttpResponse<any>) => {
          if (!(res.body.articles?.length < 1 || res.body.articles == undefined))
          {
            this.articleList = res.body.articles;
          }
          this.articleDS = new MatTableDataSource<Articles>(this.articleList);
          this.articleDS.sort = this.sort;
          console.log(this.articleDS);
      });
  }
}
