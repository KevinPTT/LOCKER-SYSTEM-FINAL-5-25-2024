import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockerHistoryComponent } from './locker-history.component';

describe('LockerHistoryComponent', () => {
  let component: LockerHistoryComponent;
  let fixture: ComponentFixture<LockerHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockerHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LockerHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
