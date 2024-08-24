import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentDetailsViewerComponent } from './shipment-details-viewer.component';

describe('ShipmentDetailsViewerComponent', () => {
  let component: ShipmentDetailsViewerComponent;
  let fixture: ComponentFixture<ShipmentDetailsViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentDetailsViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentDetailsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
