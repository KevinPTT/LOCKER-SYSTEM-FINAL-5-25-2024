import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeDetailsDialogComponent } from './time-details-dialog.component';

describe('TimeDetailsDialogComponent', () => {
  let component: TimeDetailsDialogComponent;
  let fixture: ComponentFixture<TimeDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeDetailsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
