import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


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
  selector: 'app-shipment-details-viewer',
  templateUrl: './shipment-details-viewer.component.html',
  styleUrls: ['./shipment-details-viewer.component.scss'],
  providers: [{
    provide: MAT_DATE_LOCALE,
    useValue: 'it'
  },
  {
    provide: MAT_DATE_FORMATS,
    useValue: MY_FORMATS
  }]
})



export class ShipmentDetailsViewerComponent implements OnInit {
  public shipment: ShipmentDetailsFromForwarder = new ShipmentDetailsFromForwarder();
  private forwarder:string;
  private details: string;

  private displayedColumns: any[] = [
    { def: 'selected', hide: false }, 
    { def: 'refERP', hide: false }, 
    { def: 'description', hide: false }, 
    { def: 'length', hide: false }, 
    { def: 'width', hide: false },  
    { def: 'heigth', hide: false },
    { def: 'weigth', hide: false }
  ];
  constructor(private dialogRef: MatDialogRef<ShipmentDetailsViewerComponent>,
              @Inject(MAT_DIALOG_DATA) data: any) 
  { 
    this.forwarder = data.forwarder;
    this.details = data.details;
  }

  getDisplayedColumns():string[]
  {
    var a: string[] = this.displayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
    return a;
  }
            
  convertGLSResponse() {
    var dateFromXML: string | null = "";
    var timeFromXML: string | null = "";
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.details, "text/xml");

    this.shipment = new ShipmentDetailsFromForwarder();
    this.shipment.trackingEvents = [];
    this.shipment.shipmentDate = xmlDoc.querySelector("DataPartenza")!.textContent;
    this.shipment.shipmentNo = xmlDoc.querySelector("NumSped")!.textContent;
    this.shipment.status = xmlDoc.querySelector("StatoSpedizione")!.textContent;
    this.shipment.customer = xmlDoc.querySelector("Destinatario")!.textContent;
    this.shipment.address = xmlDoc.querySelector("IndirizzoDestinazione")!.textContent + " - " + 
                            xmlDoc.querySelector("CapDestinatario")!.textContent + " " +
                            xmlDoc.querySelector("CittaDestinazione")!.textContent;
    this.shipment.numOfItems = Number(xmlDoc.querySelector("NumeroColli")!.textContent);
    this.shipment.forwarder = 'GLS';
    this.shipment.DTVName = xmlDoc.querySelector("Bda")!.textContent;
    this.shipment.forwarderContacts = xmlDoc.querySelector("TelefonoSedeDestinazione")!.textContent;

    var element = xmlDoc.querySelector("TRACKING");
    var dataNodes = element!.getElementsByTagName("Data");
    var timeNodes = element!.getElementsByTagName("Ora");
    var statusNodes = element!.getElementsByTagName("Stato");
    var notesNodes = element!.getElementsByTagName("Note");
    for (var i = 0; i < dataNodes.length; i++)
    {
      dateFromXML = dataNodes[i].textContent;
      dateFromXML = "20" + dateFromXML!.substring(6,8) + "-" +
                    dateFromXML!.substring(3,5) + "-" +
                    dateFromXML!.substring(0,2);
      timeFromXML = timeNodes[i].textContent;
      if ((timeFromXML != "") && (timeFromXML != null))
      {
        dateFromXML += "T" + timeFromXML + ":00"
      }
      else
      {
        dateFromXML += "T" + "00:00:00"
      }
      var trackItem = new  ShipmentTrackingDetailsFromForwarder();
      trackItem.eventDate = new Date(dateFromXML + ".000Z");
      trackItem.eventDescription =statusNodes[i].textContent;
      trackItem.eventNote = notesNodes[i].textContent;
      this.shipment.trackingEvents.push(trackItem);
    } 
  }

  ngOnInit() {
    if (this.forwarder == 'GLS')
    {
      this.convertGLSResponse(); 
    }
  }
}

export class ShipmentTrackingDetailsFromForwarder {
  eventDate: Date = new Date();
  eventDescription: string | null = "";
  eventNote: string | null = "";
}

export class ShipmentDetailsFromForwarder {
  shipmentDate: string | null = "";
  shipmentNo: string | null = "";
  status: string | null = "";
  customer: string | null = "";
  address: string | null = "";
  numOfItems: number = 0;
  forwarder: string | null = "";
  DTVName: string| null = "";
  forwarderContacts: string | null = "";
  trackingEvents: ShipmentTrackingDetailsFromForwarder[] = [];
}