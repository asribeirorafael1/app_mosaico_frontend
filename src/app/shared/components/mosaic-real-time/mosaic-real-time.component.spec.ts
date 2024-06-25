import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MosaicRealTimeComponent } from './mosaic-real-time.component';

describe('MosaicRealTimeComponent', () => {
  let component: MosaicRealTimeComponent;
  let fixture: ComponentFixture<MosaicRealTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MosaicRealTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MosaicRealTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
