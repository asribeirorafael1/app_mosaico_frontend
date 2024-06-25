import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddMosaicComponent } from './modal-add-mosaic.component';

describe('ModalAddMosaicComponent', () => {
  let component: ModalAddMosaicComponent;
  let fixture: ComponentFixture<ModalAddMosaicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAddMosaicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddMosaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
