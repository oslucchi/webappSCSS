import { BrowserModule } from "@angular/platform-browser";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./_components/login/login.component";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { OrdersComponent } from "./_components/orders/orders.component";
import { MatTableModule } from "@angular/material/table";

import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CookieService } from "ngx-cookie-service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { OrderHandlerComponent } from "./_components/order-handler/order-handler.component";
import { MessageBoxDialog } from "./_components/msg-box/msg-box.component";
import { MessageBox } from "./_components/msg-box/msg-box.provider";
import { AddShipmentComponent } from "./_components/add-shipment/add-shipment.component";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MatInputNumericDirective } from "./_directives/mat-input-numeric.directive";
import { OrderStatusChangeEmailComponent } from "./_components/order-status-change-email/order-status-change-email.component";
import { ChatComponent } from "./_components/chat/chat.component";
import { DatePipe, registerLocaleData } from "@angular/common";
import { AutoRefreshComponent } from "./_components/auto-refresh/auto-refresh.component";
import { InventoryComponent } from "./_components/inventory/inventory.component";
import { PackagingDialogComponent } from "./_components/packaging-dialog/packaging-dialog.component";
import { TwoDigitDecimalNumberDirective } from "./two-digit-decimal-number.directive";
import { ChgPkgComponentComponent } from "./_components/chg-pkg-component/chg-pkg-component.component";
import { ShipmentSearchComponent } from "./_components/shipment-search/shipment-search.component";
import { AdminFunctionsComponent } from "./_components/admin-functions/setup/admin-functions.component";
import { ImportStockComponent } from "./_components/admin-functions/import-stock/import-stock.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ShipmentTrackingComponent } from './_components/shipment-tracking/shipment-tracking.component';
import { ShipmentDetailsViewerComponent } from './_components/shipment-details-viewer/shipment-details-viewer.component';
import { ArdexMainComponent } from './_components/ardex/ardex-main/ardex-main.component';
import { ArdexReceivingComponent } from "./_components/ardex/ardex-receiving/ardex-receiving.component";
import { SpacedCurrencyPipe } from "./_pipes/spaced-currency";
import { ArdexArticleComponent } from "./_components/ardex/ardex-articles/ardex-articles.component";
import { NgIncludeDirective } from "./_directives/ngInclude";
import { ShipmentCloseComponent } from "./_components/shipment-pickup-dialog/shipment-close.component";
import { ShipmentPickupComponent } from "./_components/shipment-pickup-dialog/shipment-pickup.component";
import { ArdexStockComponent } from "./_components/ardex/ardex-stock/ardex-stock.component";
import localeIt from '@angular/common/locales/it';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeIt);

@NgModule({ 
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatMomentDateModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSortModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule, 
        MatLabel, 
        MatInput,
        HttpClientModule
    ], 
    declarations: [
        AppComponent,
        LoginComponent,
        OrdersComponent,
        OrderHandlerComponent,
        InventoryComponent,
        MessageBoxDialog,
        ShipmentCloseComponent,
        ShipmentPickupComponent,
        PackagingDialogComponent,
        AddShipmentComponent,
        MatInputNumericDirective,
        OrderStatusChangeEmailComponent,
        ChatComponent,
        AutoRefreshComponent,
        TwoDigitDecimalNumberDirective,
        ChgPkgComponentComponent,
        ShipmentSearchComponent,
        AdminFunctionsComponent,
        ImportStockComponent,
        ShipmentTrackingComponent,
        ShipmentDetailsViewerComponent,
        ArdexMainComponent,
        ArdexReceivingComponent,
        ArdexStockComponent,
        ArdexArticleComponent,
        SpacedCurrencyPipe,
        NgIncludeDirective
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], 
    providers: [
        CookieService, 
        MatMomentDateModule, 
        DatePipe, 
        MessageBox,
        { provide: LOCALE_ID, useValue: 'it' },
        provideHttpClient(withInterceptorsFromDi())
    ]
 })
export class AppModule {}
