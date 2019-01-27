import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MibandComponent } from './miband.component';

describe('MibandComponent', () => {
  let component: MibandComponent;
  let fixture: ComponentFixture<MibandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MibandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MibandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});