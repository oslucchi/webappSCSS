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

  public profile: UserProfile = new UserProfile(new CookieService(new Document(), "")) ;

  private service: ApiService;
  private cookieService: CookieService;

  public articleList: Articles[] = [];
  public articleDS: MatTableDataSource<Articles> = new MatTableDataSource<Articles>(this.articleList);;


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
