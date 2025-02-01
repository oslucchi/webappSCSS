import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArdexStockComponent } from './ardex-stock.component';

describe('ArdexStockComponent', () => {
  let component: ArdexStockComponent;
  let fixture: ComponentFixture<ArdexStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArdexStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArdexStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
