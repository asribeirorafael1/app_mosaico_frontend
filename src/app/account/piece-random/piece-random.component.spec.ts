import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceRandomComponent } from './piece-random.component';

describe('PieceRandomComponent', () => {
  let component: PieceRandomComponent;
  let fixture: ComponentFixture<PieceRandomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PieceRandomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceRandomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
