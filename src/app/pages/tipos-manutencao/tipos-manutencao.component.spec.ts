import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposManutencaoComponent } from './tipos-manutencao.component';

describe('TiposManutencaoComponent', () => {
  let component: TiposManutencaoComponent;
  let fixture: ComponentFixture<TiposManutencaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposManutencaoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TiposManutencaoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
