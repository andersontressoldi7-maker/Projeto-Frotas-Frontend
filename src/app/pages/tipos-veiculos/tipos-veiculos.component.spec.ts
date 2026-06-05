import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposVeiculosComponent } from './tipos-veiculos.component';

describe('TiposVeiculosComponent', () => {
  let component: TiposVeiculosComponent;
  let fixture: ComponentFixture<TiposVeiculosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposVeiculosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TiposVeiculosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
