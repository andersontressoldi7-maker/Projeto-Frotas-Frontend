import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManutencoesComponent } from './manutencoes.component';

describe('ManutencoesComponent', () => {
  let component: ManutencoesComponent;
  let fixture: ComponentFixture<ManutencoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManutencoesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManutencoesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
