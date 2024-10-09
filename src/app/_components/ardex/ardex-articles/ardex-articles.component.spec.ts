import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArdexReceivingComponent } from './ardex-receiving.component';

describe('ArdexReceivingComponent', () => {
  let component: ArdexReceivingComponent;
  let fixture: ComponentFixture<ArdexReceivingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArdexReceivingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArdexReceivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
