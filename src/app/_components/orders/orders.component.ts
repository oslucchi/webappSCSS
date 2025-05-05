import { Component, OnInit, ViewChild } from "@angular/core";
import { ApiService } from "../../_services/api.service";
import { HttpResponse } from "@angular/common/http";
import { Orders } from "../../_models/orders";
import { OrderDetails } from "../../_models/order-details";
import { MatTableDataSource } from "@angular/material/table";
import { CookieService } from "ngx-cookie-service";
import { UserProfile, UserProfileConstants } from "../../_models/user-profile";
import { MatCheckboxChange } from "@angular/material/checkbox";
import {
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatSort } from "@angular/material/sort";
import { OrderHandler } from "../../_models/order-handler";
import { OrderShipments } from "../../_models/order-shipments";
import { Articles } from "../../_models/articles";
import { StatusItem } from "../../_models/status-item";
import { SearchFilters } from "../../_models/search-filter";
import { OrderChangeMessage } from "../../_models/orderChangeMessage";

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
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
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

export class OrdersComponent implements OnInit {
  public bogusDataSource: MatTableDataSource<Orders>;
  public dataSource: MatTableDataSource<Orders> = new MatTableDataSource();
  public dataSourceDetails: MatTableDataSource<OrderDetails> = new MatTableDataSource();
  public dataSourceShipments: MatTableDataSource<OrderShipments> = new MatTableDataSource();
  public orderHandler: OrderHandler = new OrderHandler();
  public profile: UserProfile = new UserProfile(new CookieService(new Document(), "")) ;
  public orderValue: number = 0;
  public invoiceValue: number = 0;
  public empty: string = " ";
  public orderList: Orders[] = [];
  public orderDetails: OrderDetails[] = [];

  private service: ApiService;
  private cookieService: CookieService;

  public status: StatusItem[] = [
    { id: "CAN", des: "Cancellato", selected: false, disabled: true },
    { id: "SYS", des: "Inserito a sistema", selected: false, disabled: true },
    { id: "ONH", des: "Sospeso", selected: false, disabled: true },
    { id: "CON", des: "Confermato", selected: false, disabled: true },
    { id: "COE", des: "Confermato con eccezione", selected: false, disabled: true },
    { id: "PRE", des: "In preparazione", selected: false, disabled: true },
    { id: "RDY", des: "Pronto", selected: false, disabled: true },
    { id: "SHI", des: "Spedito", selected: false, disabled: true },
    { id: "INV", des: "Fatturato", selected: false, disabled: true },
  ];

  public additionalSearchFilter: SearchFilters = new SearchFilters();

  private ordersDisplayedColumns: any[] = [
    { def: "status", hide: false },
    { def: "forwarder", hide: false },
    { def: "orderRef", hide: false },
    { def: "customerRefERP", hide: false },
    { def: "customerDescription", hide: false },
    { def: "customerDeliveryProvince", hide: true },
    { def: "requestedAssemblyDate", hide: false },
    { def: "shipmentDate", hide: false },
    { def: "forwarderCost", hide: false },
    { def: "clientCost", hide: false },
    { def: "sourceIssue", hide: false },
    { def: "empty", hide: true },
    { def: "compositionBoards", hide: false },
    { def: "compositionTrays", hide: false },
    { def: "compositionDesign", hide: false },
    { def: "compositionAccessories", hide: false },
    { def: "empty1", hide: false },
  ];
  private detailsDisplayedColumns: any[] = [
    { def: "articleRefERP", hide: false },
    { def: "articleDescription", hide: false },
    { def: "articleSourceIssue", hide: false },
    { def: "quantity", hide: false },
    { def: "piecesFromSqm", hide: false },
    { def: "articleUnityOfMeasure", hide: false },
  ];

  public timerSet: number = 1;
  public timerReset: boolean = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort = new MatSort();

  constructor(
    private apiService: ApiService,
    private cookieServ: CookieService
  ) {
    console.log("orders constructor");
    this.service = apiService;
    this.cookieService = cookieServ;
    this.bogusDataSource = new MatTableDataSource<Orders>();
  }

  updateOrdersDisplayedColumns(): void {
    let defsToHide: string[] = [];
    let defsToShow: string[] = [];

    if (this.profile.filters.filterInvoice[0]) 
    {
      defsToHide.push(
        "sourceIssue",
        "requestedAssemblyDate",
        "compositionBoards",
        "compositionTrays",
        "compositionDesign",
        "compositionAccessories"
      );
      defsToShow.push(
        "shipmentDate",
        "forwarderCost",
        "clientCost"
      );
    } 
    else if (this.profile.filters.filterShipment[0]) 
    {
      defsToShow.push(
        "shipmentDate",
        "forwarderCost",
        "clientCost"
      );
      defsToHide.push(
        "sourceIssue",
        "requestedAssemblyDate"
      );
    } 
    else 
    {
      defsToHide.push(
        "shipmentDate",
      );
      defsToShow.push(
        "sourceIssue",
        "requestedAssemblyDate"
      );
    }
    console.log("Will show ", defsToShow);
    console.log("Will hide ", defsToHide);
    this.ordersDisplayedColumns.forEach((x) => {
      if (defsToShow.includes(x.def)) {
        x.hide = false;
      }
      if (defsToHide.includes(x.def)) {
        x.hide = true;
      }
    });
  }

  getDetailsDisplayedColumns(): string[] {
    return this.detailsDisplayedColumns
      .filter((cd) => !cd.hide)
      .map((cd) => cd.def);
  }

  getOrdersDisplayedColumns(): string[] {
    return this.ordersDisplayedColumns
      .filter((cd) => !cd.hide)
      .map((cd) => cd.def);
  }

  ngOnInit() {
    var i: number;
    var y: number;
    this.profile = new UserProfile(this.cookieService);

    this.profile.getProfile();
    console.log(
      "userProfile:" +
        "\n\tfilterOrders: " +
        this.profile.filters.filterOrders +
        "\n\tfilterWarehouse: " +
        this.profile.filters.filterOrders +
        "\n\tfilterShipment:" +
        this.profile.filters.filterShipment
    );
    this.getOrdersBasedOnFilters(false);
    this.updateOrdersDisplayedColumns();
  }

  getOrderDetails() {
    var i: number;
    var y: number;

    i = 0;
    this.orderList.forEach((item) => {
      item.shipmentDate = new Date(item.shipmentDate!);
      item.requestedAssemblyDate = new Date(item.requestedAssemblyDate!);
      item.effectiveAssemblyDate = new Date(item.effectiveAssemblyDate!);
      if (item.compositionBoards < 0 || i == 0) {
        this.service
          .get("orders/allDetails/" + item.idOrder)
          .subscribe((res: HttpResponse<any>) => {
            if (i == 0) {
              this.dataSourceDetails = new MatTableDataSource<OrderDetails>(
                res.body.orderDetails
              );
              this.orderHandler = new OrderHandler();
              this.orderHandler.details = item;
              this.orderHandler.note = res.body.orderNotes;
              console.log("----> Shipments:");
              console.log(res.body.orderShipments);
              this.orderHandler.shipments = (res.body.orderShipments.length == 0 ? [] : res.body.orderShipments);
              this.orderHandler.customerDelivery = res.body.customerDelivery;
              this.orderHandler.statusPre = this.orderHandler.details.status;
              this.orderHandler.customer = res.body.customer;
              this.statusTransitionEval(item.status);
              if (this.orderHandler.details.orderValue == 0) {
                this.orderValue = 0;
                res.body.orderDetails.forEach((item: OrderDetails) => {
                  this.orderValue +=
                    res.body.orderArticles.find(
                      (x: Articles) => x.idArticle === item.idArticle
                    ).buyPrice *
                    item.quantity *
                    item.articleRateOfConversion;
                });
                this.orderValue = Math.floor(this.orderValue);
              } else {
                this.orderValue = Math.floor(
                  this.orderHandler.details.orderValue
                );
              }
            }
            this.orderDetails = res.body.orderDetails;

            if (
              item.compositionAccessories == 0 &&
              item.compositionBoards == 0 &&
              item.compositionDesign == 0 &&
              item.compositionTrays == 0
            ) {
              for (y = 0; y < this.orderDetails.length; y++) {
                switch (this.orderDetails[y].articleCategory) {
                  case "A":
                  case "TG":
                    item.compositionAccessories++;
                    break;
                  case "BS":
                    item.compositionBoards +=
                      this.orderDetails[y].quantity /
                      this.orderDetails[y].articleRateOfConversion;
                    break;
                  case "D":
                    item.compositionDesign++;
                    break;
                  case "T":
                    item.compositionTrays++;
                    break;
                }
                if (this.orderDetails[y].sourceIssue) {
                  if (item.sourceIssue == null) {
                    item.sourceIssue = "";
                  }

                  if (item.sourceIssue.indexOf("X") < 0) {
                    item.sourceIssue += "X";
                  }
                }
              }
              this.service
                .update("orders/update/" + item.idOrder, {
                  order: item,
                  shipments: res.body.orderShipments,
                })
                .subscribe((res: HttpResponse<any>) => {
                  console.log(res);
                });
            }
            i++;
          });
      }
    });
  }

  orderListComparer(otherArray: Orders[]) {
    return function (current: Orders) {
      return (
        otherArray.filter(function (other) {
          return other.idOrder == current.idOrder;
        }).length == 0
      );
    };
  }

  orderInArray(order: Orders, array: Orders[]) {
    return array.some(function (item) {
      return order.idOrder === item.idOrder;
    });
  }

  getOrdersBasedOnFilters(fromRefresh: boolean) {
    var i: number;
    var y: number;
    this.dataSource = new MatTableDataSource<Orders>(new Array<Orders>());
    this.dataSourceDetails = new MatTableDataSource<OrderDetails>(
      new Array<OrderDetails>()
    );
    this.orderHandler = new OrderHandler();
    this.orderHandler.shipments = [];
    this.orderValue = 0;

    this.setFilters();
    this.applyFilters();
    if (this.profile.getStatusWhereString() == "") {
      console.log("No filter selected, returning empty objects");
      return;
    }
    this.service
      .post("orders/byStatus", {
        statusSet: this.profile.getStatusWhereString(),
      })
      .subscribe((res: HttpResponse<any>) => {
        console.log(`Fetched orders in status (${this.profile.getStatusWhereString()})`);
        console.log(`returned a list of ${res.body.orderList.length} items`);
        
        if (fromRefresh) {
          var removeFromList = this.orderList.filter(
            this.orderListComparer(res.body.orderList)
          );
          var addToList = res.body.orderList.filter(
            this.orderListComparer(this.orderList)
          );
          if (removeFromList.length != 0 || addToList.length != 0) {
            var mergedOrderList: Orders[] = [];
            this.orderList.forEach((element) => {
              if (!this.orderInArray(element, removeFromList)) {
                mergedOrderList.push(element);
              }
            });
            this.orderList = mergedOrderList.concat(addToList);
            this.orderList.forEach(order => {
              order.forwarderCost = order.forwarderCost ?? 0;
              order.clientCost = order.clientCost ?? 0;
            });
            this.timerReset = true;
            this.dataSource = new MatTableDataSource<Orders>(this.orderList);
            this.dataSource.sort = this.sort;
          }
        } 
        else {
          // this.orderList = res.body.orderList;
          this.orderList = res.body.orderList.map((o: any) => {
            const order = new Orders();
            Object.assign(order, o);
            // If the server missed the fields completely, still default:
            order.forwarderCost = order.forwarderCost ?? 0;
            order.clientCost = order.clientCost ?? 0;
            return order;
          });
          
          this.dataSource = new MatTableDataSource<Orders>(this.orderList);
          this.dataSource.sort = this.sort;
          this.setFilters();
          // if (!this.profile.filters.filterInvoice[0])
          //  this.getOrderDetails();
          console.log(`getOrdersBasedOnFilters for order ${JSON.stringify(this.orderList)}`);
          this.listOrderDetails(this.orderList[0]);
          this.applyFilters();
        }
        this.invoiceValue = 0;
        for (y = 0; y < this.orderList.length; y++) {
          var consider: boolean = true;
          if (this.additionalSearchFilter.fromDate) {
            consider =
              consider &&
              (this.orderList[y].status == "INV"
                ? this.orderList[y].invoiceDate! >=
                  this.additionalSearchFilter.fromDate
                : this.orderList[y].shipmentDate! >=
                  this.additionalSearchFilter.fromDate);
          }
          if (this.additionalSearchFilter.toDate) {
            consider =
              consider &&
              (this.orderList[y].status == "INV"
                ? this.orderList[y].invoiceDate! <=
                  this.additionalSearchFilter.toDate
                : this.orderList[y].shipmentDate! <=
                  this.additionalSearchFilter.toDate);
          }
          if (this.orderList[y].status != "INV" || consider)
            this.invoiceValue += this.orderList[y].invoiceValue;
        }
      });
  }

  changeProfileFilters(event: MatCheckboxChange) {
    console.log(
      "Event called on '" +
        event.source.id +
        "' with status '" +
        event.checked +
        "'"
    );
    this.invoiceValue = 0;
    switch (event.source.id) {
      case "SYS":
        this.profile.filters.filterOrders[0] = event.checked;
        if (!event.checked) this.profile.filters.filterOrders[4] = false;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "ONH":
        this.profile.filters.filterOrders[1] = event.checked;
        if (!event.checked) this.profile.filters.filterOrders[4] = false;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "CON":
        this.profile.filters.filterOrders[2] = event.checked;
        if (!event.checked) this.profile.filters.filterOrders[4] = false;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "COE":
        this.profile.filters.filterOrders[3] = event.checked;
        if (!event.checked) this.profile.filters.filterOrders[4] = false;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "ORA":
        this.profile.filters.filterOrders[0] = event.checked;
        this.profile.filters.filterOrders[1] = event.checked;
        this.profile.filters.filterOrders[2] = event.checked;
        this.profile.filters.filterOrders[3] = event.checked;
        this.profile.filters.filterOrders[4] = event.checked;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "PRE":
        this.profile.filters.filterWarehouse[0] = event.checked;
        if (!event.checked) this.profile.filters.filterWarehouse[2] = false;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "RDY":
        this.profile.filters.filterWarehouse[1] = event.checked;
        if (!event.checked) this.profile.filters.filterWarehouse[2] = false;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "SHI":
        this.profile.filters.filterShipment[0] = event.checked;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "WHA":
        this.profile.filters.filterWarehouse[0] = event.checked;
        this.profile.filters.filterWarehouse[1] = event.checked;
        this.profile.filters.filterWarehouse[2] = event.checked;
        this.profile.filters.filterInvoice[0] = false;
        break;
      case "INV":
        this.profile.filters.filterOrders[0] = false;
        this.profile.filters.filterOrders[1] = false;
        this.profile.filters.filterOrders[2] = false;
        this.profile.filters.filterOrders[3] = false;
        this.profile.filters.filterOrders[4] = false;
        this.profile.filters.filterWarehouse[0] = false;
        this.profile.filters.filterWarehouse[1] = false;
        this.profile.filters.filterWarehouse[2] = false;
        this.profile.filters.filterInvoice[0] = event.checked;
        break;
    }
    this.profile.setProfile();
    this.getOrdersBasedOnFilters(false);
    this.updateOrdersDisplayedColumns();
  }

  statusTransitionEval(status: string) {
    this.status.find((x) => x.id == "CAN")!.disabled = true;
    this.status.find((x) => x.id == "ONH")!.disabled = true;
    this.status.find((x) => x.id == "PRE")!.disabled = true;
    this.status.find((x) => x.id == "SYS")!.disabled = true;
    this.status.find((x) => x.id == "CON")!.disabled = true;
    this.status.find((x) => x.id == "COE")!.disabled = true;
    this.status.find((x) => x.id == "RDY")!.disabled = true;
    this.status.find((x) => x.id == "SHI")!.disabled = true;
    this.status.find((x) => x.id == "INV")!.disabled = true;

    switch (status) {
      case "SYS":
        this.status.find((x) => x.id == "ONH")!.disabled = false;
        this.status.find((x) => x.id == "CON")!.disabled = false;
        this.status.find((x) => x.id == "COE")!.disabled = false;
        break;

      case "ONH":
        this.status.find((x) => x.id == "CAN")!.disabled = false;
        this.status.find((x) => x.id == "SYS")!.disabled = false;
        this.status.find((x) => x.id == "CON")!.disabled = false;
        this.status.find((x) => x.id == "COE")!.disabled = false;
        break;

      case "CON":
      case "COE":
        this.status.find((x) => x.id == "ONH")!.disabled = false;
        this.status.find((x) => x.id == "PRE")!.disabled = false;
        if (status == "COE") {
          this.status.find((x) => x.id == "CON")!.disabled = false;
        }
        break;

      case "PRE":
        this.status.find((x) => x.id == "RDY")!.disabled = false;
        break;

      case "RDY":
        this.status.find((x) => x.id == "SHI")!.disabled = false;
        break;

      case "SHI":
        this.status.find((x) => x.id == "INV")!.disabled = false;
        break;
    }
  }

  resetOrderStatus($event: any) {
    this.statusTransitionEval($event.event);
  }

  listOrderDetails(order: Orders) {
    var i: number;
    if (
      this.orderHandler != null &&
      order.idOrder == this.orderHandler.details.idOrder
    ) {
      return;
    }

    this.orderValue = 0;
    this.service
      .get("orders/allDetails/" + order.idOrder)
      .subscribe((res: HttpResponse<any>) => {
        if (this.orderHandler == null) {
          this.orderHandler = new OrderHandler();
        }
        console.log(`Fetched all details`);
        console.log(`details  ${JSON.stringify(res.body.orderDetails)}`);
        console.log(`shipments  ${JSON.stringify(res.body.orderShipments)}`);
        console.log(`notes  ${JSON.stringify(res.body.orderNotes)}`);

        if (!this.orderHandler || this.orderHandler.details.idOrder != order.idOrder) {
          this.orderHandler.details = order;
          this.orderHandler.details.shipmentDate = new Date(order.shipmentDate!);
          this.orderHandler.details.requestedAssemblyDate = new Date(
            order.requestedAssemblyDate!
          );
          this.orderHandler.details.effectiveAssemblyDate = new Date(
            order.effectiveAssemblyDate!
          );
        }
        this.orderDetails = res.body.orderDetails;
        this.dataSourceDetails = new MatTableDataSource<OrderDetails>(
          this.orderDetails
        );
        this.orderHandler.note = res.body.orderNotes;
        this.orderHandler.shipments = res.body.orderShipments;
        this.orderHandler.customerDelivery = res.body.customerDelivery;
        this.orderHandler.statusPre = this.orderHandler.details.status;
        this.orderHandler.customer = res.body.customer;
        this.statusTransitionEval(order.status);
        if (this.orderHandler.details.orderValue == 0) {
          this.orderValue = 0;
          res.body.orderDetails.forEach((item: OrderDetails) => {
            this.orderValue +=
              res.body.orderArticles.find((x: Articles) => x.idArticle === item.idArticle)
                .buyPrice *
              item.quantity *
              item.articleRateOfConversion;
          });
          this.orderValue = Math.floor(this.orderValue);
        } else {
          this.orderValue = Math.floor(this.orderHandler.details.orderValue);
        }
        console.log("OrderHandler is:")
        console.log(this.orderHandler);
        return;
      });
    // this.dataSourceDetails = null;
    // this.orderHandler = new OrderHandler;
  }

  setFilters() {
    var showRecord: boolean;

    if (this.profile.filters.filterInvoice[0]) {
      // If filtered on INV ..
      this.invoiceValue = 0;
    }
    this.dataSource.filterPredicate = (data, filter) => {
      // return (this.profile.filters.filterInvoice[0] || this.profile.filters.filterShipment[0] ?
      //               (this.additionalSearchFilter.fromDate != null ? data.shipmentDate >= this.additionalSearchFilter.fromDate : true) &&
      //               (this.additionalSearchFilter.toDate != null ? data.shipmentDate <= this.additionalSearchFilter.toDate : true)
      //           :
      //               (this.additionalSearchFilter.fromDate != null ? data.requestedAssemblyDate >= this.additionalSearchFilter.fromDate : true) &&
      //               (this.additionalSearchFilter.toDate != null ? data.requestedAssemblyDate <= this.additionalSearchFilter.toDate : true)) &&
      //         (this.additionalSearchFilter.order.trim() != "" ? data.orderRef.includes("IM0" + this.additionalSearchFilter.order) : true) &&
      //         (this.additionalSearchFilter.customer.trim() != "" ? data.customerRefERP.includes("I" + this.additionalSearchFilter.customer) : true);
      showRecord = true;
      if (
        this.additionalSearchFilter.customer &&
        this.additionalSearchFilter.customer != ""
      ) {
        showRecord =
          showRecord &&
          data.customerDescription
            .toUpperCase()
            .includes(this.additionalSearchFilter.customer.toUpperCase());
      }
      if (
        this.additionalSearchFilter.order &&
        this.additionalSearchFilter.order != ""
      ) {
        showRecord =
          showRecord &&
          data.orderRef.includes(this.additionalSearchFilter.order);
      }
      if (this.additionalSearchFilter.fromDate) {
        if (this.status[8].selected) {
          showRecord =
            showRecord &&
            data.invoiceDate! >= this.additionalSearchFilter.fromDate;
        } else {
          showRecord =
            showRecord &&
            data.shipmentDate! >= this.additionalSearchFilter.fromDate;
        }
      }
      if (this.additionalSearchFilter.toDate) {
        if (this.status[8].selected) {
          showRecord =
            showRecord &&
            data.invoiceDate! <= this.additionalSearchFilter.toDate;
        } else {
          showRecord =
            showRecord &&
            data.shipmentDate! <= this.additionalSearchFilter.toDate;
        }
      }
      if (this.profile.filters.filterInvoice[0] && showRecord) {
        this.invoiceValue += data.invoiceValue;
      }

      return showRecord;
    };
  }

  applyFilters() {
    this.dataSource.filter = "" + Math.random();
  }

  cancelFilters() {
    this.additionalSearchFilter = new SearchFilters();
    this.dataSource.filter = "" + Math.random();
  }

  changeOnlyIfDisplayed(event: any)
  {
    console.log("Change order event captured from server");

    let changeMsg: OrderChangeMessage = JSON.parse(event); 
    let fieldsToChange: string[] = changeMsg.changedFields.split(", ");
    console.log(changeMsg);

    console.log("Received a request to change attributes " + fieldsToChange +
                " for order '" + changeMsg.order.orderRef + "'");


    this.dataSource.data.every((order: Orders) => {
      console.log("Considering order '" + order.orderRef + "'")
      if (changeMsg.order.orderRef === order.orderRef) {
        fieldsToChange.every((field: String) => {
          console.log("changing order in orderList to new value '" + changeMsg.order[field as keyof Orders] + "'");
          Orders.updateOrderField(order, field as keyof Orders, changeMsg.order[field as keyof Orders]);
        });
      }
    });
    if (this.orderHandler.details.orderRef === changeMsg.order.orderRef) {
        fieldsToChange.every((field: string) => {
          console.log("changing orderHandler attribute '" + field + "' in orderList to the value '" + changeMsg.order[field as keyof Orders] + "'");
          Orders.updateOrderField(this.orderHandler.details, field as keyof Orders, changeMsg.order[field as keyof Orders]);
        });
    }
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
}
