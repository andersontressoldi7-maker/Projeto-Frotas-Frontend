import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RelatoriosComponent } from './relatorios.component';
import { RelatoriosService } from '../../services/relatorios.service';
import { ToastService } from '../../components/toast.service';

describe('RelatoriosComponent', () => {
  let component: RelatoriosComponent;
  let fixture: ComponentFixture<RelatoriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosComponent],
      providers: [
        {
          provide: RelatoriosService,
          useValue: {
            consultar: () => of({ periodo: { dataInicio: '', dataFim: '' }, data: [] }),
            exportarCsv: () => of(new Blob())
          }
        },
        {
          provide: ToastService,
          useValue: { erro: () => undefined, avisar: () => undefined }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatoriosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show only the eight reports with available endpoints', () => {
    const itens = component.categorias.flatMap(categoria => categoria.itens);

    expect(itens).toHaveLength(8);
    expect(itens.map(item => item.endpoint)).toEqual([
      'manutencoes/custos-por-veiculo',
      'manutencoes/pecas-mais-trocadas',
      'checklists/taxa-conformidade',
      'checklists/itens-criticos-reprovados',
      'checklists/historico-por-operador',
      'veiculos/quilometragem',
      'veiculos/ranking-desgaste',
      'viagens/destinos-recorrentes'
    ]);
  });

  it('should render the generated report inside its category', () => {
    const item = component.categorias[0].itens[0];

    component.gerarRelatorio(item);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#manutencao .report-results')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.report-results')).toHaveLength(1);
  });
});
