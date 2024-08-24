import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArdexMainComponent } from './ardex-main.component';

describe('ArdexMainComponent', () => {
  let component: ArdexMainComponent;
  let fixture: ComponentFixture<ArdexMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArdexMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArdexMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
