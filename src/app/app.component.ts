import { Component, Inject } from "@angular/core";
import { StorageService } from "./_services/storage.service";
import { DOCUMENT } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  public title: string;
  public imgPath: string;
  public menuIcon: string;

  constructor(
    private storage: StorageService,
    private router: Router,
    @Inject(DOCUMENT) private document: any
  ) {
    this.imgPath = storage.baseHref + "assets/img/logoWedi.png";
    this.menuIcon = storage.baseHref + "assets/img/menu.png";
    this.title = "OrderMngr";
  }

  ngOnInit(): void {
    let bases = this.document.getElementsByTagName("base");

    if (bases.length > 0) {
      bases[0].setAttribute("href", this.storage.baseHref);
    }
  }

  admin() {
    console.log("called admin");
    this.router.navigate(["/admin"], { skipLocationChange : true });
  }

  importStock() {
    console.log("called shipmentSearch");
    this.router.navigate(["/importStock"], { skipLocationChange : true });
  }

  shipmentSearch() {
    console.log("called shipmentSearch");
    this.router.navigate(["/shipmentSearch"], { skipLocationChange : true });
  }

  orders() {
    console.log("called orders");
    this.router.navigate(["/orders"], { skipLocationChange : true });
  }

  shipmentsPending() {
    console.log("called orders");
    this.router.navigate(["/shipmentsPending"], { skipLocationChange : true });
  }

  ardexFunctions() {
    console.log("called ardexFunctions");
    this.router.navigate(["/ardexFunctions"], { skipLocationChange : true });
  }

  setup() {
    console.log("called setup");
  }

}
