import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { ApiService } from '../../_services/api.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { OrderDetails } from '../../_models/order-details';
import { Orders } from '../../_models/orders';

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
  selector: 'app-packaging-dialog',
  templateUrl: './packaging-dialog.component.html',
  styleUrls: ['./packaging-dialog.component.scss'],
  providers: [{
    provide: MAT_DATE_LOCALE,
    useValue: 'it'
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: MY_FORMATS
  }]
})

export class PackagingDialogComponent implements OnInit {
  private service: ApiService;
  public order: Orders;
  private previousStatus: string;
  public orderArticles: OrderDetails[] = [];
  public allOrderDetails: OrderDetails[] = [];
  public title: string;
  private success: string = "ERR";
  public dataSourceDetails: MatTableDataSource<OrderDetails> = new MatTableDataSource();
  private articlesDisplayedColumns: any[] = [
    { def: 'selected', hide: false }, 
    { def: 'refERP', hide: false }, 
    { def: 'description', hide: false }, 
    { def: 'length', hide: false }, 
    { def: 'width', hide: false },  
    { def: 'heigth', hide: false },
    { def: 'weigth', hide: false }
  ];

  constructor(private dialogRef: MatDialogRef<PackagingDialogComponent>,
              private apiService: ApiService,
              @Inject(MAT_DIALOG_DATA) data: any) 
  {
    dialogRef.disableClose = true;
    console.log(data);
    this.service = apiService;
    this.order = data.order;
    this.title = data.title;
    this.previousStatus = data.previousStatus;


    this.service
    .get('orders/details/' + this.order.idOrder)
    .subscribe(
      (res: HttpResponse<any>)=>{
        var articles: OrderDetails[] = this.allOrderDetails = res.body.orderDetails; 
        articles.forEach(element => {
        if ((element.articlePackageLength == 0) ||
            (element.articlePackageWidth == 0) ||
            (element.articlePackageHeight == 0) ||
            (element.articlePackageWeight == 0))
        {
          this.orderArticles.push(element);
        }
        this.dataSourceDetails = new MatTableDataSource<OrderDetails>(this.orderArticles);
      });
    });
  }

  ngOnInit() 
  {
  }

  getArticlesDisplayedColumns():string[]
  {
    var a: string[] = this.articlesDisplayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
    return a;
  }

  toggleAllArticlesSelection(event: any)
  {
    this.orderArticles.forEach((element, index) => {
      this.orderArticles[index].selected = event.checked;
    });
  }

  updatePackaging()
  {
    for(var i = 0; i < this.orderArticles.length; i++)
    {
      var element = this.orderArticles[i];
      if ((element.articlePackageHeight == 0) ||
          (element.articlePackageWidth == 0) ||
          (element.articlePackageHeight == 0) ||
          (element.articlePackageWeight == 0))
      {
        alert("Ci sono ancora valori a zero, impossibile aggiornare");
        return false;
      }
    }

    var y = 0;
    for(var i = 0; i < this.allOrderDetails.length && y < this.orderArticles.length; i++)
    {
      if (this.allOrderDetails[i].idOrderDetails == this.orderArticles[y].idOrderDetails)
      {
        this.allOrderDetails[i].articlePackageHeight = this.orderArticles[y].articlePackageHeight;
        this.allOrderDetails[i].articlePackageWidth = this.orderArticles[y].articlePackageWidth;
        this.allOrderDetails[i].articlePackageHeight = this.orderArticles[y].articlePackageHeight;
        this.allOrderDetails[i].articlePackageWeight = this.orderArticles[y].articlePackageWeight;
        y++;
      }
    }

    this.service
    .update(
      'orders/updatePackageData/' + this.order.idOrder,
      {
        "order": this.order,
        "orderDetails": this.allOrderDetails
      }
    )
    .subscribe(
      (res: HttpResponse<any>)=>{
        console.log(res);
        this.success = "OK";
        this.closeDialog();
        return true;
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        return false;
      }
    );
    return true;
  }

  closeDialog(){
    this.dialogRef.close(this.success);
  }
}