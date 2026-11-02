import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { StatusColorService, CORES_DISPONIVEIS, TokenCor } from '../../services/status-color.service';
import { ConfiguracoesService, ValoresConfiguracao } from '../../services/configuracoes.service';
import { ToastService } from '../../components/toast.service';
import { extrairMensagemErro } from '../../utils';

interface CampoConfig {
  chave: string;
  label: string;
  tipo: 'text' | 'number' | 'select' | 'switch';
  placeholder?: string;
  options?: string[];
}

interface GrupoConfig {
  id: string;
  titulo: string;
  icon: string;
  campos: CampoConfig[];
}

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit {
  constructor(
    private statusColorService: StatusColorService,
    private configuracoesService: ConfiguracoesService,
    private toastService: ToastService
  ) {}

  titulo = 'Configurações da Empresa';
  subtitulo = 'Gerencie as diretrizes de funcionamento e integrações da empresa ativa';
  coresDisponiveis = CORES_DISPONIVEIS;
  carregando = false;
  salvando = false;
  salvandoCores = false;
  podeEditar = false;
  errosValidacao: Record<string, string> = {};

  private readonly configuracoesNumericas = [
    'validade_checklist_horas',
    'tolerancia_vistoria_minutos',
    'alerta_troca_oleo_km',
    'alerta_rodizio_pneus_km',
    'alerta_cnh_vincenda_dias'
  ];

  valoresConfiguracao: ValoresConfiguracao = {
    nome_organizacao: null,
    fuso_horario: 'Brasília (GMT-3)',
    idioma_padrao: 'Português (Brasil)',
    auditoria_logs: true,
    exigir_assinatura_motorista: true,
    bloquear_veiculo_item_critico: true,
    validade_checklist_horas: 24,
    exigir_foto_item_reprovado: true,
    tolerancia_vistoria_minutos: 30,
    notificar_atraso_critico_manutencao: true,
    alerta_troca_oleo_km: 10000,
    permitir_manutencao_sem_checklist: false,
    alerta_rodizio_pneus_km: 20000,
    bloquear_viagem_cnh_vencida: true,
    alerta_cnh_vincenda_dias: 30,
    exigir_bafometro: false,
    alertas_criticos_webhook: false,
    url_webhook: null,
    sincronizar_telemetria_gps: true
  };

  nomesGruposCores: Record<string, string> = {
    prioridadeManutencao: 'Prioridade de Manutenção',
    statusManutencao: 'Status de Manutenção',
    statusVeiculo: 'Status de Veículo',
    statusChecklist: 'Status de Checklist',
    statusViagem: 'Status de Viagem',
    statusGenerico: 'Status Genérico (Ativo/Inativo)',
    tipoAbastecimento: 'Tipo de Abastecimento'
  };

  configuracoes: GrupoConfig[] = [
    {
      id: 'config-gerais',
      titulo: 'Gerais do Sistema',
      icon: 'bi-gear text-secondary',
      campos: [
        { chave: 'nome_organizacao', label: 'Nome da Organização', tipo: 'text', placeholder: 'FrotaCheck Transportes LTDA' },
        { chave: 'fuso_horario', label: 'Fuso Horário Principal', tipo: 'select', options: ['Brasília (GMT-3)', 'Lisboa (GMT+1)', 'Amazonas (GMT-4)'] },
        { chave: 'idioma_padrao', label: 'Idioma Padrão', tipo: 'select', options: ['Português (Brasil)', 'Português (Portugal)', 'English'] },
        { chave: 'auditoria_logs', label: 'Ativar modo de auditoria em logs', tipo: 'switch' }
      ]
    },
    {
      id: 'config-checklists',
      titulo: 'Módulo: Checklists',
      icon: 'bi-card-checklist text-success',
      campos: [
        { chave: 'exigir_assinatura_motorista', label: 'Obrigar assinatura do motorista ao finalizar', tipo: 'switch' },
        { chave: 'bloquear_veiculo_item_critico', label: 'Bloquear veículo automaticamente se houver item crítico reprovado', tipo: 'switch' },
        { chave: 'validade_checklist_horas', label: 'Validade padrão do checklist (horas)', tipo: 'number', placeholder: '24' },
        { chave: 'exigir_foto_item_reprovado', label: 'Obrigar envio de foto para itens reprovados', tipo: 'switch' },
        { chave: 'tolerancia_vistoria_minutos', label: 'Tempo de tolerância para vistoria em atraso (minutos)', tipo: 'number', placeholder: '30' }
      ]
    },
    {
      id: 'config-manutencoes',
      titulo: 'Módulo: Manutenções',
      icon: 'bi-wrench text-danger',
      campos: [
        { chave: 'notificar_atraso_critico_manutencao', label: 'Notificar gestor quando uma manutenção atingir atraso crítico', tipo: 'switch' },
        { chave: 'alerta_troca_oleo_km', label: 'Alerta de troca de óleo padrão (KM)', tipo: 'number', placeholder: '10000' },
        { chave: 'permitir_manutencao_sem_checklist', label: 'Permitir abertura de manutenção sem checklist vinculado', tipo: 'switch' },
        { chave: 'alerta_rodizio_pneus_km', label: 'Alerta preventivo de rodízio de pneus (KM)', tipo: 'number', placeholder: '20000' }
      ]
    },
    {
      id: 'config-motoristas',
      titulo: 'Módulo: Motoristas & CNH',
      icon: 'bi-people text-warning',
      campos: [
        { chave: 'bloquear_viagem_cnh_vencida', label: 'Bloquear viagens para motoristas com CNH vencida', tipo: 'switch' },
        { chave: 'alerta_cnh_vincenda_dias', label: 'Dias de antecedência para alertar CNH vincenda', tipo: 'number', placeholder: '30' },
        { chave: 'exigir_bafometro', label: 'Exigir teste de bafômetro antes de iniciar rota', tipo: 'switch' }
      ]
    },
    {
      id: 'config-integracoes',
      titulo: 'Integrações & Webhooks',
      icon: 'bi-cloud-check text-primary',
      campos: [
        { chave: 'alertas_criticos_webhook', label: 'Disparar alertas críticos para canal do Telegram/Slack', tipo: 'switch' },
        { chave: 'url_webhook', label: 'URL do Webhook Corporativo', tipo: 'text', placeholder: 'https://api.suaempresa.com/v1/frotas' },
        { chave: 'sincronizar_telemetria_gps', label: 'Sincronizar dados de telemetria GPS automaticamente', tipo: 'switch' }
      ]
    }
  ];

  ngOnInit(): void {
    this.carregarConfiguracoes();
  }

  get gruposCores(): string[] {
    return this.statusColorService.obterGrupos();
  }

  nomeGrupo(grupo: string): string {
    return this.nomesGruposCores[grupo] || grupo;
  }

  valoresDoGrupo(grupo: string): string[] {
    return this.statusColorService.obterValoresDoGrupo(grupo);
  }

  corAtual(grupo: string, valor: string): TokenCor {
    return this.statusColorService.obterCor(grupo, valor);
  }

  ehConclusaoForcada(grupo: string, valor: string): boolean {
    return /conclu|finaliz/i.test(valor);
  }

  selecionarCor(grupo: string, valor: string, token: TokenCor): void {
    if (this.ehConclusaoForcada(grupo, valor) || !this.podeEditar || this.salvandoCores) {
      return;
    }

    const cores = this.statusColorService.obterPersonalizacoes();
    cores[grupo] = { ...cores[grupo], [valor]: token };
    this.salvandoCores = true;
    this.statusColorService.salvarPersonalizacoes(cores).subscribe({
      next: () => {
        this.salvandoCores = false;
        this.toastService.sucesso(`Cor de "${valor}" atualizada.`, 'Sucesso');
      },
      error: erro => {
        this.salvandoCores = false;
        this.toastService.erro(extrairMensagemErro(erro, 'Não foi possível salvar a cor.'), 'Erro');
      }
    });
  }

  restaurarPadraoGrupo(grupo: string): void {
    if (!this.podeEditar || this.salvandoCores) {
      return;
    }

    const cores = this.statusColorService.obterPersonalizacoes();
    delete cores[grupo];
    this.salvandoCores = true;
    this.statusColorService.salvarPersonalizacoes(cores).subscribe({
      next: () => {
        this.salvandoCores = false;
        this.toastService.informar(`Cores de "${this.nomeGrupo(grupo)}" restauradas ao padrão.`, 'Restaurado');
      },
      error: erro => {
        this.salvandoCores = false;
        this.toastService.erro(extrairMensagemErro(erro, 'Não foi possível restaurar as cores.'), 'Erro');
      }
    });
  }

  salvarConfiguracoes(): void {
    if (!this.podeEditar || this.salvando || this.carregando) {
      return;
    }

    if (!this.validarConfiguracoes()) {
      this.toastService.avisar('Corrija os campos destacados antes de salvar.', 'Validação');
      return;
    }

    this.salvando = true;
    this.configuracoesService.salvar(this.valoresConfiguracao).subscribe({
      next: resposta => {
        this.valoresConfiguracao = resposta.configuracoes;
        this.salvando = false;
        this.toastService.sucesso('Configurações salvas com sucesso.', 'Sucesso');
      },
      error: erro => {
        this.salvando = false;
        this.toastService.erro(extrairMensagemErro(erro, 'Não foi possível salvar as configurações.'), 'Erro');
      }
    });
  }

  atualizarValor(chave: string, valor: string | number | boolean | null): void {
    const campo = this.configuracoes.flatMap(grupo => grupo.campos)
      .find(item => item.chave === chave);
    const valorAtualizado = campo?.tipo === 'number' && valor !== null && valor !== ''
      ? Number(valor)
      : valor;

    this.valoresConfiguracao[chave] = valorAtualizado;
    delete this.errosValidacao[chave];
  }

  mensagemErro(chave: string): string | null {
    return this.errosValidacao[chave] ?? null;
  }

  private validarConfiguracoes(): boolean {
    this.errosValidacao = {};

    for (const chave of this.configuracoesNumericas) {
      const valor = this.valoresConfiguracao[chave];
      if (valor === null || valor === '') {
        continue;
      }

      const numero = Number(valor);
      if (!Number.isInteger(numero) || numero < 0) {
        this.errosValidacao[chave] = 'Informe um número inteiro maior ou igual a zero.';
      }
    }

    const urlWebhook = this.valoresConfiguracao['url_webhook'];
    if (typeof urlWebhook === 'string' && urlWebhook.trim()) {
      try {
        const url = new URL(urlWebhook.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          this.errosValidacao['url_webhook'] = 'Informe uma URL iniciada por http:// ou https://.';
        }
      } catch {
        this.errosValidacao['url_webhook'] = 'Informe uma URL válida.';
      }
    }

    return Object.keys(this.errosValidacao).length === 0;
  }

  private carregarConfiguracoes(): void {
    this.carregando = true;
    this.configuracoesService.carregar().subscribe({
      next: resposta => {
        this.valoresConfiguracao = resposta.configuracoes;
        this.podeEditar = resposta.podeEditar;
        this.statusColorService.definirPersonalizacoes(resposta.coresStatus ?? {});
        this.carregando = false;
      },
      error: erro => {
        this.carregando = false;
        this.toastService.erro(extrairMensagemErro(erro, 'Não foi possível carregar as configurações.'), 'Erro');
      }
    });
  }
}
