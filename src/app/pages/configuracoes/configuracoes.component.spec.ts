import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ConfiguracoesComponent } from './configuracoes.component';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { StatusColorService } from '../../services/status-color.service';
import { ToastService } from '../../components/toast.service';

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let fixture: ComponentFixture<ConfiguracoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesComponent],
      providers: [
        {
          provide: ConfiguracoesService,
          useValue: {
            carregar: () => of({
              configuracoes: {
                auditoria_logs: true,
                exigir_assinatura_motorista: true,
                bloquear_veiculo_item_critico: true,
                exigir_foto_item_reprovado: true,
                notificar_atraso_critico_manutencao: true,
                permitir_manutencao_sem_checklist: false,
                bloquear_viagem_cnh_vencida: true,
                exigir_bafometro: false,
                alertas_criticos_webhook: false,
                sincronizar_telemetria_gps: true
              },
              coresStatus: {},
              podeEditar: true
            }),
            salvar: () => of({ configuracoes: {} }),
            salvarCores: () => of({ coresStatus: {} })
          }
        },
        {
          provide: StatusColorService,
          useValue: {
            obterGrupos: () => [],
            obterValoresDoGrupo: () => [],
            obterCor: () => 'secondary',
            definirPersonalizacoes: () => undefined,
            obterPersonalizacoes: () => ({}),
            salvarPersonalizacoes: () => of(undefined)
          }
        },
        {
          provide: ToastService,
          useValue: {
            sucesso: () => undefined,
            erro: () => undefined,
            informar: () => undefined
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
