import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChecklistWizardComponent } from './checklist-wizard.component';

describe('ChecklistWizardComponent', () => {
  let component: ChecklistWizardComponent;
  let fixture: ComponentFixture<ChecklistWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistWizardComponent],
      providers: [{ provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistWizardComponent);
    component = fixture.componentInstance;
  });

  it('deve exigir itens no retorno quando o checklist for completo', () => {
    component.formulario.modelo = '1';
    component.faseAtual = 'retorno';

    expect(component.eModeloCompleto()).toBeTrue();
    expect(component.validarPasso()).toBeFalse();

    component.formulario.kmRetorno = '125500';
    component.itensChecklist.forEach(item => item.valor = 'Bom');

    expect(component.validarPasso()).toBeTrue();
  });

  it('não deve exigir itens no retorno quando o checklist for somente saída', () => {
    component.formulario.modelo = '2';
    component.faseAtual = 'retorno';
    component.formulario.kmRetorno = '125500';
    component.itensChecklist.forEach(item => item.valor = '');

    expect(component.eModeloSimples()).toBeTrue();
    expect(component.validarPasso()).toBeTrue();
  });
});
