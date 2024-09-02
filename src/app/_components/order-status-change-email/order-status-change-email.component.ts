import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CustomerDelivery } from '../../_models/customer-delivery';
import { ApiService } from '../../_services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventEmitter } from '@angular/core';
import { HttpClient, HttpHandler, HttpResponse } from '@angular/common/http';
import { Customers } from '../../_models/customers';

@Component({
  selector: 'app-order-status-change-email',
  templateUrl: './order-status-change-email.component.html',
  styleUrls: ['./order-status-change-email.component.scss']
})
export class OrderStatusChangeEmailComponent implements OnInit {
  @ViewChild('logisticCommEmail', { static: true }) inputLogisticCommEmail:ElementRef = new ElementRef(null);
  @ViewChild('multiSiteGenericEmail', { static: true }) inputMultiSiteGenericEmail:ElementRef = new ElementRef(null);
  
  private EMAIL_REGEXP = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

  public customerDelivery:CustomerDelivery = new CustomerDelivery();
  public customer: Customers = new Customers();
  public caption: string;
  public multiSiteGenericEmail: string = "";

  private apiService: ApiService | undefined;  
  
  public onClose = new EventEmitter();


  constructor(private dialogRef: MatDialogRef<OrderStatusChangeEmailComponent>,
              @Inject(MAT_DIALOG_DATA) data: any) 
  {
    this.caption = data.caption;
    this.customerDelivery = data.customerDelivery;
    this.customer = data.customer;

    this.dialogRef!.backdropClick().subscribe(() => { this.closeForm(); });
  }

  ngOnInit() 
  {
  }

  saveCustomerDelivery()
  {
    if (!this.EMAIL_REGEXP.test(this.customerDelivery.logisticCommEmail))
    {
      window.alert("la mail inserita non e' formalmente corrette");
      this.customerDelivery.logisticCommEmail = "";
      setTimeout(() => this.inputLogisticCommEmail.nativeElement.focus())
      return;
    }
    this.apiService!
      .update(
        "customerDelivery/update/" + this.customerDelivery.idCustomerDelivery,
        {
          "customerDelivery" : this.customerDelivery
        }
      )
      .subscribe((res: HttpResponse<any>)=>{ 
        console.log("mail for logistic communications changed to " + this.customerDelivery.logisticCommEmail);
      });
  }

  saveCustomer()
  {
    if (!this.EMAIL_REGEXP.test(this.customer.logisticCommEmail))
    {
      window.alert("la mail inserita non e' formalmente corrette");
      this.customer.logisticCommEmail = "";
      setTimeout(() => this.inputMultiSiteGenericEmail.nativeElement.focus())
      return;
    }
    this.apiService!
      .update(
        "customers/update/" + this.customer.idCustomers,
        {
          "customer" : this.customer
        }
      )
      .subscribe((res: HttpResponse<any>)=>{ 
        console.log("generic mail for logistic communications changed to " + this.customer.logisticCommEmail);
      });
  }

  closeForm()
  {
    this.onClose.emit();
    this.dialogRef!.close();
  }
}
