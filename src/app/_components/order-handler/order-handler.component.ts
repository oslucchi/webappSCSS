import { Component, OnInit, Input, Output, ElementRef } from "@angular/core";
import { Orders } from "../../_models/orders";
import { ApiService } from "../../_services/api.service";
import { OrderHandler } from "../../_models/order-handler";
import { OrderDetails } from "../../_models/order-details";
import { MatSelectChange } from "@angular/material/select";
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { UserProfileConstants, UserProfile } from "../../_models/user-profile";
import { EventEmitter } from "@angular/core";
import { StatusItem } from "../../_models/status-item";
import { ListItem } from "../../_models/list-item";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { AddShipmentComponent } from "../add-shipment/add-shipment.component";
import { OrderStatusChangeEmailComponent } from "../order-status-change-email/order-status-change-email.component";
import { PackagingDialogComponent } from "../packaging-dialog/packaging-dialog.component";
import { ChgPkgComponentComponent } from "../chg-pkg-component/chg-pkg-component.component";
import { ShipmentPickupComponent } from "../shipment-pickup-dialog/shipment-pickup.component";
import { ShipmentCloseComponent } from "../shipment-pickup-dialog/shipment-close.component";

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
  selector: "app-order-handler",
  templateUrl: "./order-handler.component.html",
  styleUrls: ["./order-handler.component.scss"],
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
export class OrderHandlerComponent implements OnInit {
  file: File | any = null;

  @Input() orderHandler: OrderHandler = new OrderHandler;
  @Input() orderList: Orders[] = [];
  @Input() orderDetails: OrderDetails[] = [];
  @Input() profile: UserProfile | any = null;
  @Input() orderValue: number = 0;
  @Input() status: StatusItem[] = [];

  @Output("getOrdersBasedOnFilters")
  getOrdersBasedOnFilters: EventEmitter<any> = new EventEmitter();
  @Output("resetOrderStatus") resetOrderStatus: EventEmitter<any> =
    new EventEmitter();

  private service: ApiService;
  
  public forwarder: ListItem[] = [
    { id: "CES", des: "CESPED", selected: false },
    { id: "TWS", des: "TWS - Collettame", selected: false },
    { id: "CLI", des: "Ritiro cliente", selected: false },
    { id: "GLS", des: "GLS - Collettame", selected: false },
    { id: "DIR", des: "Consegna diretta", selected: false },
  ];

  constructor(private apiService: ApiService, 
              private dialog: MatDialog) {
    this.service = apiService;
  }

  ngOnInit() {}

  printLabels() {
    var i: number;
    var copies: number;
    var notes: string;
    var shipTo: string;

    notes = this.orderHandler.customerDelivery.notes;
    shipTo =
      this.orderHandler.details.customerDescription +
      (notes != null && notes != "" ? "\n" + notes : "");

    switch (this.orderHandler.details.forwarder) {
      case "CES":
        copies = 2;
        break;
      default:
        copies = 1;
        break;
    }

    console.log(
      "Priting labels: " +
        "shipTo: " +
        shipTo +
        " - address: " +
        this.orderHandler.customerDelivery.address +
        " - zipCityProvince:" +
        this.orderHandler.customerDelivery.zipCode +
        " " +
        this.orderHandler.customerDelivery.city +
        " " +
        this.orderHandler.customerDelivery.province +
        " - forwarder: " +
        this.orderHandler.details.forwarder +
        " - orderRefERP: " +
        this.orderHandler.details.orderRef +
        " - numberOfItems: " +
        this.orderHandler.details.numberOfItems +
        " - copies: " +
        copies
    );

    this.service
      .post("orders/printLabel", {
        shipTo: shipTo,
        address: this.orderHandler.customerDelivery.address,
        zipCityProvince:
          this.orderHandler.customerDelivery.zipCode +
          " " +
          this.orderHandler.customerDelivery.city +
          " " +
          this.orderHandler.customerDelivery.province,
        forwarder: this.orderHandler.details.forwarder,
        orderRefERP: this.orderHandler.details.orderRef,
        numberOfItems: this.orderHandler.details.numberOfItems,
        copies: copies,
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
      });
  }

  handleClosure() {
    this.service
      .post("orders/fetchParcelsToClose", {
        forwarder: "GLS",
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;

        dialogConfig.data = {
          id: 1,
          title: "Chiusura spedizioni",
          message: "close",
          shipments: res.body.shipmentList,
          forwarder: "GLS",
        };

        dialogConfig.height = "400px";
        dialogConfig.width = "600px";

        this.dialog.open(ShipmentCloseComponent, dialogConfig);
      });
  }


  mailPickup() {
    this.service
      .post("orders/createShipments", {
        forwarder: "CES",
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;

        dialogConfig.data = {
          id: 1,
          title: "Gestione richiesta di pick a vettore",
          message: "pickup",
          shipments: res.body.shipmentList,
          forwarder: "CES",
        };

        dialogConfig.height = "800px";
        dialogConfig.width = "1600px";

        this.dialog.open(ShipmentPickupComponent, dialogConfig);
      });
  }

  onFileSelected(event: any) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.file = fileList[0];
    } else {
      this.file = null;
      window.alert("Empty list of files");
    }
  }

  uploadDDT() {
    let formData: FormData = new FormData();
    if (this.file != null) {
      formData.append("file", this.file.name);
      this.service
        .uploadToURL(
          "orders/uploadDDT/" + this.orderHandler.details.orderRef.replaceAll("%", "%25").replaceAll(" ", "%20"),
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

  changPackaging() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;

    dialogConfig.data = {
      id: 1,
      caption: "Modifica composizione packaging",
      order: this.orderHandler.details,
      shipments: this.orderHandler.shipments,
    };

    dialogConfig.height = "600px";
    dialogConfig.width = "1000px";

    const dialogRef = this.dialog.open(ChgPkgComponentComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      console.log("onClose event emitted");
      this.orderHandler.details.forwarderCost =
        dialogRef.componentInstance.shipCosts[0];
      this.orderHandler.details.clientCost =
        dialogRef.componentInstance.shipCosts[1];
      this.service
        .get("orders/allDetails/" + this.orderHandler.details.idOrder)
        .subscribe((res: HttpResponse<any>) => {
          this.orderHandler.shipments = res.body.orderShipments;
          this.orderHandler.details.numberOfItems =
            this.orderHandler.shipments.length;
        });
    });
  }

  addShipment() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;

    dialogConfig.data = {
      id: 1,
      caption: "Aggiunta spedizione a ordine",
      order: this.orderHandler.details,
      shipments: this.orderHandler.shipments,
    };

    dialogConfig.height = "600px";
    dialogConfig.width = "1000px";

    let dialogRef = this.dialog.open(AddShipmentComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onClose.subscribe(() => {
      console.log("onClose event emitted");
      this.orderHandler.details.forwarderCost =
        dialogRef.componentInstance.shipCosts[0];
      this.orderHandler.details.clientCost =
        dialogRef.componentInstance.shipCosts[1];
    });
    dialogRef.afterClosed().subscribe(() => {});
  }

  onOrderStatusChange(event: MatSelectChange) {
    var i: number;
    var y: number;
    var rejectMsg: string;

    rejectMsg = "";
    if (event.source.value == "CON" || event.source.value == "COE") {
      if (
        this.orderHandler.details.forwarder == null ||
        this.orderHandler.details.forwarder == ""
      ) {
        rejectMsg = "E' necessario specificare il trasportatore";
        this.orderHandler.statusPre = "SYS";
      }
    } else if (event.source.value == "PRE") {
      this.orderHandler.statusPre = "CON";
    } else if (event.source.value == "RDY") {
      if (
        this.orderHandler.details.transportDocNum == null ||
        this.orderHandler.details.transportDocNum == ""
      ) {
        rejectMsg = "Il campo DDT deve essere popolato";
        this.orderHandler.statusPre = "PRE";
      }

      if (
        this.orderHandler.details.forwarder == "CES" &&
        (this.orderHandler.shipments[0].length == 0 ||
          this.orderHandler.shipments[0].width == 0 ||
          this.orderHandler.shipments[0].height == 0 ||
          this.orderHandler.shipments[0].weight == 0 ||
          this.orderHandler.details.forwarderCost == 0 ||
          this.orderHandler.details.customerDeliveryProvince == null ||
          this.orderHandler.details.customerDeliveryProvince == "")
      ) {
        rejectMsg = "I dati della spedizione devono essere popolati";
        this.orderHandler.statusPre = "PRE";
      }

      if (
        (this.orderHandler.details.forwarder == "TWS" ||
          this.orderHandler.details.forwarder == "GLS") &&
        (this.orderHandler.details.numberOfItems == 0 ||
          this.orderHandler.details.customerDeliveryProvince == null ||
          this.orderHandler.details.customerDeliveryProvince == "")
      ) {
        rejectMsg =
          "Bisogna specificare il numero di colli spediti e la provincia di destinazione";
        this.orderHandler.statusPre = "PRE";
      }
    } else if (event.source.value == "SHI") {
      if (
        this.orderHandler.details.DTVName == null ||
        this.orderHandler.details.DTVName == ""
      ) {
        if (!confirm("Marcare come spedito l'ordine senza caricare il DDT?")) {
          rejectMsg = "Caricare il DDT";
          this.orderHandler.statusPre = "RDY";
        }
      }
    }

    if (rejectMsg != "") {
      window.alert(
        rejectMsg + " perche' l'ordine possa essere cambiato di stato"
      );
      this.orderHandler.details.status = this.orderHandler.statusPre;
      event.source.writeValue(this.orderHandler.details.status);
      return;
    }

    for (i = 0; i < this.orderList.length; i++) {
      if (this.orderList[i].idOrder == this.orderHandler.details.idOrder) {
        // this.orderList[i].status = event.source.value;
        switch (event.source.value) {
          case "SHI":
            this.orderList[i].shipmentDate = new Date();
            break;
        }
        break;
      }
    }

    this.service
      .update("orders/update/" + this.orderHandler.details.idOrder, {
        order: this.orderHandler.details,
        updateWhat: "status",
      })
      .subscribe(
        (res: HttpResponse<any>) => {
          console.log(res);
          this.orderHandler.details = res.body.order;
          this.resetOrderStatus.emit({ event: event.source.value });
          switch (event.source.value) {
            case "SYS":
              if (
                !this.profile.filters.filterOrders[
                  UserProfileConstants.FILTER_ORDER_INSERTED
                ]
              )
                this.getOrdersBasedOnFilters.emit();
              break;
            case "CON":
              this.sendStatusChangeConfirmationEmail();
              if (
                !this.profile.filters.filterOrders[
                  UserProfileConstants.FILTER_ORDER_CONFIRMED
                ]
              )
                this.getOrdersBasedOnFilters.emit();
              break;
            case "COE":
              if (
                !this.profile.filters.filterOrders[
                  UserProfileConstants.FILTER_ORDER_CONFIRMED_WITH_EXCEPTION
                ]
              )
                this.getOrdersBasedOnFilters.emit();
              break;
            case "ONH":
              if (
                !this.profile.filters.filterOrders[
                  UserProfileConstants.FILTER_ORDER_ONHOLD
                ]
              )
                this.getOrdersBasedOnFilters.emit();
              break;
            case "PRE":
              this.orderUpdatePackagingStatistics(
                "autoStart",
                0,
                this.orderHandler
              );
              // if (!this.profile.filters.filterWarehouse[UserProfileConstants.FILTER_WAREHOUSE_IN_PREPARATION])
              this.getOrdersBasedOnFilters.emit();
              break;
            case "RDY":
              this.orderUpdatePackagingStatistics(
                "autoEnd",
                0,
                this.orderHandler
              );
              this.sendStatusChangeConfirmationEmail();
              // if (!this.profile.filters.filterWarehouse[UserProfileConstants.FILTER_WHAREHOUSE_READY])
              this.getOrdersBasedOnFilters.emit();
              break;
            case "SHI":
              if (
                !this.profile.filters.filterShipment[
                  UserProfileConstants.FILTER_SHIPMENT_COMPLETED
                ]
              )
                this.getOrdersBasedOnFilters.emit();
              break;
            case "INV":
              if (
                !this.profile.filters.filterInvoice[
                  UserProfileConstants.FILTER_INVOICE_COMPLETED
                ]
              )
                this.getOrdersBasedOnFilters.emit();
              break;
          }
          event.source.writeValue(this.orderHandler.details.status);
          if (res.body.alertToClient != null && res.body.alertToClient != "") {
            window.alert(res.body.alertToClient);
          }
        },
        (err: HttpErrorResponse) => {
          var message: string = err.message;
          if (message.search("Packaging data missing for the order")) {
            const dialogConfig = new MatDialogConfig();

            dialogConfig.disableClose = false;
            dialogConfig.autoFocus = true;
            dialogConfig.hasBackdrop = true;

            dialogConfig.data = {
              title: "Aggiornamento packaging articolo",
              order: this.orderHandler.details,
              previousStatus: this.orderHandler.statusPre,
            };

            dialogConfig.height = "500px";
            dialogConfig.width = "1000px";

            let dialogRef = this.dialog.open(
              PackagingDialogComponent,
              dialogConfig
            );
            dialogRef.afterClosed().subscribe((result: string) => {
              if (result == "ERR") {
                this.orderHandler.details.status = this.orderHandler.statusPre;
              } else {
                this.resetOrderStatus.emit({
                  event: this.orderHandler.details.status,
                });
                this.getOrdersBasedOnFilters.emit();
              }
              event.source.writeValue(this.orderHandler.details.status);
            });
          }
        }
      );
  }

  sendStatusChangeConfirmationEmail() {
    console.log("Sending status email change to customer");
    this.service
      .post("orders/statusEmail", {
        order: this.orderHandler.details,
        customer: this.orderHandler.customer,
        customerDelivery: this.orderHandler.customerDelivery,
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        var alertMsg: string = res.body.resource;
        if (res.status == 200 && alertMsg != null) {
          window.alert(alertMsg);
        }
      });
  }

  orderUpdatePackagingStatistics(
    what: string,
    value: number,
    orderHandler: OrderHandler
  ) {
    this.service
      .update("statistics/packaging", {
        attributes: {
          idOrder: orderHandler.details.idOrder,
          what: what,
          value: value,
        },
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(res.body.pkgStats);
        if (
          res.body.pkgStats.autoEndTime != null &&
          res.body.pkgStats.autoEndTime != 0 &&
          res.body.pkgStats.autoStartTime != null &&
          res.body.pkgStats.autoStartTime != 0
        ) {
          var elapsed: number;
          elapsed =
            (res.body.pkgStats.autoEndTime - res.body.pkgStats.autoStartTime) /
            60000;
          orderHandler.details.assemblyTimeAuto = Math.floor(elapsed);
        } else if (res.body.pkgStats.manualTime > 0) {
          orderHandler.details.assemblyTime = res.body.pkgStats.manualTime;
        } else {
          orderHandler.details.assemblyTime = 0;
        }
      });
  }

  onOrderNoteChange(event: any) {
    console.log(this.orderHandler.note);
    if (this.orderHandler.note.idOrder == 0) {
      this.orderHandler.note.idOrder = this.orderHandler.details.idOrder;
    }
    this.service
      .update("orders/notes/update/" + this.orderHandler.details.idOrder, {
        orderNote: this.orderHandler.note,
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        this.orderHandler.note = res.body.orderNotes;
      });
  }

  onDeliveryAttributeChange(event: any) {
    var sourceId: string = "";
    var province: string = "";

    console.log(event);
    if (event.source != null) {
      sourceId = event.source._id;
    } else if (event.srcElement != null) {
      sourceId = event.srcElement.id;
      province = event.srcElement.value;
    }
    console.log(sourceId + " changed ");
    if (
      sourceId == "province" &&
      this.orderHandler.details.forwarder != "CLI"
    ) {
      this.service
        .post("orders/shipmentCost", {
          forwarder: this.orderHandler.details.forwarder,
          province: province,
          length: this.orderHandler.shipments[0].length,
          width: this.orderHandler.shipments[0].width,
          height: this.orderHandler.shipments[0].height,
          weight: this.orderHandler.shipments[0].weight,
        })
        .subscribe((res: HttpResponse<any>) => {
          console.log(res);
          this.orderHandler.details.forwarderCost = res.body.shipmentCost;
          this.orderHandler.shipments[0].forwarderCost = res.body.shipmentCost;
        });
    }

    this.service
      .get("deliveries/order/" + this.orderHandler.details.idOrder)
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        if (
          res.body.customerDelivery.province == null ||
          this.orderHandler.customerDelivery.province.trim().toUpperCase() !=
            res.body.customerDelivery.province.trim().toUpperCase()
        ) {
          this.orderHandler.customerDelivery.province =
            this.orderHandler.customerDelivery.province.trim().toUpperCase();
          this.service
            .update("deliveries/update", {
              customerDelivery: this.orderHandler.customerDelivery,
            })
            .subscribe((res: HttpResponse<any>) => {
              this.orderHandler.details.customerDeliveryProvince =
                this.orderHandler.customerDelivery.province;
              this.updateOrder("delivery");
              console.log(res);
            });
        }
      });
  }

  isLogisticMailConfigured() {
    if (
      this.orderHandler.customerDelivery.logisticCommEmail != null &&
      this.orderHandler.customerDelivery.logisticCommEmail != ""
    )
      return true;
    else return false;
  }

  onAttributeChange(event: any) {
    var sourceId: string = "";
    var value: any;
    var updateWhat: string = "";

    console.log("onAttributeChange() called");
    if (event == null) {
      console.log("Event is null, doing nothing");
      return;
    }
    if (event.source != null) {
      sourceId = event.source._id;
      value =
        sourceId.localeCompare("requestedAssemblyDate") == 0
          ? event.source.value._d
          : event.source.value;
    } else if (event.srcElement != null) {
      sourceId = event.srcElement.id;
      value = event.srcElement.value;
    }
    console.log(sourceId + " changed to: '" + value + "'");

    updateWhat = sourceId;
    switch (sourceId) {
      case "palletLength":
        this.orderHandler.shipments[0].length = parseInt(value);
        break;

      case "palletWidth":
        this.orderHandler.shipments[0].width = parseInt(value);
        break;

      case "palletHeigth":
        this.orderHandler.shipments[0].height = parseInt(value);
        break;

      case "palletWeigth":
        this.orderHandler.shipments[0].weight = parseInt(value);
        break;

      case "numberOfItems":
        this.orderHandler.details.numberOfItems = parseInt(value);
        break;

      case "forwarder":
        // if (value == "CLI" && !this.isLogisticMailConfigured()) {
        // Antonio required the email form to always show up on 20th May 2024
          if (value == "CLI") {
            console.log("It should show the email dialog");
            const dialogConfig = new MatDialogConfig();

            dialogConfig.disableClose = false;
            dialogConfig.autoFocus = true;
            dialogConfig.hasBackdrop = true;

            dialogConfig.data = {
            id: 1,
            caption: "Mail variazioni ordine",
            customer: this.orderHandler.customer,
            customerDelivery: this.orderHandler.customerDelivery,
          };

          dialogConfig.height = "400px";
          dialogConfig.width = "600px";

          let dialogRef = this.dialog.open(
            OrderStatusChangeEmailComponent,
            dialogConfig
          );
          const sub = dialogRef.componentInstance.onClose.subscribe(() => {
            console.log("onClose event emitted");
          });
          dialogRef.afterClosed().subscribe(() => {
            // unsubscribe onAdd
          });
        }
        this.orderHandler.details.forwarder = value;
        break;

      case "requestedAssemblyDate":
        this.orderHandler.details.requestedAssemblyDate = new Date(value);
        break;

      case "orderValue":
        this.orderHandler.details.orderValue = value;
        break;

      case "assemblyTime":
        this.orderUpdatePackagingStatistics(
          "manual",
          parseInt(value, 10),
          this.orderHandler
        );
        break;
    }
    this.updateOrder(updateWhat);
  }

  onShipmentAttributeChange(event: any) {
    var sourceId: string = "";
    var value: any;

    console.log(event);
    if (event.source != null) {
      sourceId = event.source._id;
      value = event.source.value;
    } else if (event.srcElement != null) {
      sourceId = event.srcElement.id;
      value = event.srcElement.value;
    }
    console.log(sourceId + " changed ");

    switch (sourceId) {
      case "length":
        this.orderHandler.shipments[0].length = parseInt(value);
        break;

      case "width":
        this.orderHandler.shipments[0].width = parseInt(value);
        break;

      case "height":
        this.orderHandler.shipments[0].height = parseInt(value);
        break;

      case "weight":
        this.orderHandler.shipments[0].weight = parseFloat(value);
        break;

      case "numberOfItems":
        this.orderHandler.details.numberOfItems = parseInt(value);
        break;
    }
    this.apiService
      .update("orders/shipment", {
        shipment: this.orderHandler.shipments[0],
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log("shipment updated: " + res);
        this.service
          .post("orders/shipmentCost", {
            forwarder: this.orderHandler.details.forwarder,
            province: this.orderHandler.details.customerDeliveryProvince,
            length: this.orderHandler.shipments[0].length,
            width: this.orderHandler.shipments[0].width,
            height: this.orderHandler.shipments[0].height,
            weight: this.orderHandler.shipments[0].weight,
          })
          .subscribe((res: HttpResponse<any>) => {
            console.log(res);
            this.orderHandler.shipments[0].forwarderCost =
              res.body.shipmentCost;
            this.orderHandler.details.forwarderCost = res.body.shipmentCost;
          });
      });
  }

  updateOrder(updateWhat: string) {
    this.service
      .update("orders/update/" + this.orderHandler.details.idOrder, {
        order: this.orderHandler.details,
        shipments: this.orderHandler.shipments,
        updateWhat: updateWhat,
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        res.body.order.requestedAssemblyDate = new Date(
          res.body.order.requestedAssemblyDate + 60000 * 120
        );
        res.body.order.effectiveAssemblyDate = new Date(
          res.body.order.effectiveAssemblyDate + 60000 * 120
        );
        res.body.order.shipmentDate = new Date(
          res.body.order.shipmentDate + 60000 * 120
        );
        res.body.order.invoiceDate = new Date(
          res.body.order.invoiceDate + 60000 * 120
        );
        var i: number;
        for (i = 0; i < this.orderList.length; i++) {
          if (this.orderList[i].idOrder == res.body.order.idOrder) {
            this.orderList[i] = res.body.order;
            break;
          }
        }
        this.orderHandler.details = res.body.order;
      });
  }

  attributeInSet(stringArray: string[], value: string) {
    var isIn: boolean;
    isIn = false;
    try {
      isIn = stringArray.includes(value);
    } catch (err: any) {
      console.log(err.message);
      var i: number;
      for (i = 0; i < stringArray.length; i++) {
        if (stringArray[i].localeCompare(value) == 0) {
          isIn = true;
          break;
        }
      }
    }
    return isIn;
  }

  evalDate(v: string) {
    this.orderHandler.details.requestedAssemblyDate = new Date(v);
  }

  parseDate(date: Date): Date {
    let d: Date = new Date;
    try {
      d = new Date(date);
    } finally {
      return d;
    }
  }
}
