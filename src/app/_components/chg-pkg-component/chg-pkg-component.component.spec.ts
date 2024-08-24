import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChgPkgComponentComponent } from './chg-pkg-component.component';

describe('ChgPkgComponentComponent', () => {
  let component: ChgPkgComponentComponent;
  let fixture: ComponentFixture<ChgPkgComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChgPkgComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChgPkgComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
