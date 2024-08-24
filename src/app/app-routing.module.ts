import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./_components/login/login.component";
import { OrdersComponent } from "./_components/orders/orders.component";
import { ShipmentSearchComponent } from "./_components/shipment-search/shipment-search.component";
import { AdminFunctionsComponent } from "./_components/admin-functions/setup/admin-functions.component";
import { ImportStockComponent } from "./_components/admin-functions/import-stock/import-stock.component";
import { ShipmentTrackingComponent } from "./_components/shipment-tracking/shipment-tracking.component";
import { ArdexMainComponent } from "./_components/ardex/ardex-main/ardex-main.component";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";

const routes: Routes = [
  { path: "orders", component: OrdersComponent },
  { path: "login", component: LoginComponent },
  { path: "shipmentSearch", component: ShipmentSearchComponent },
  { path: "admin", component: AdminFunctionsComponent },
  { path: "importStock", component: ImportStockComponent },
  { path: "shipmentsPending", component: ShipmentTrackingComponent },
  { path: "ardexFunctions", component: ArdexMainComponent},
  { path: "", redirectTo: "orders", pathMatch: "full" },
  { path: "**", redirectTo: "orders", pathMatch: "prefix" }
];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {useHash: false, onSameUrlNavigation: 'reload'}), CommonModule
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
