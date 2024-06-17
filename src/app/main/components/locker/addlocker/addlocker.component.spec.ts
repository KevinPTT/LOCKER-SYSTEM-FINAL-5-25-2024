import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLockerComponent } from './addlocker.component';

describe('AddLockerComponent', () => {
  let component: AddLockerComponent;
  let fixture: ComponentFixture<AddLockerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLockerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddLockerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
