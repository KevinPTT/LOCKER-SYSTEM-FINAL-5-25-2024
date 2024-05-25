import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockerPopupDetailsComponent } from './locker-popup-details.component';

describe('LockerPopupDetailsComponent', () => {
  let component: LockerPopupDetailsComponent;
  let fixture: ComponentFixture<LockerPopupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LockerPopupDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LockerPopupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
