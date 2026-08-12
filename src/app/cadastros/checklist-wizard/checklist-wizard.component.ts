import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastService } from '../../components/toast.service';
import { RascunhoService } from '../../services/rascunho.service';
import { VeiculosService } from '../../services/veiculos.service';
import { ModelosService } from '../../services/modelos.service';
import { MotoristasService } from '../../services/motoristas.service';
import { ChecklistService } from '../../services/checklist.service';

@Component({
  selector: 'app-checklist-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './checklist-wizard.component.html',
  styleUrls: ['./checklist-wizard.component.scss']
})
export class ChecklistWizardComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-checklist-wizard';

  faseAtual: 'saida' | 'retorno' = 'saida';
  passoAtual = 1;
  checklistIdAtual: number | null = null;
  checklistCarregado: any = null;

  formulario = {
    modelo: '',
    veiculo: '',
    motorista: '',
    kmAtual: '',
    observacaoSaida: '',
    kmRetorno: '',
    observacaoRetorno: ''
  };

  veiculos: any[] = [];
  modelos: any[] = [];
  motoristas: any[] = [];

  itensChecklistSaida: any[] = [];
  itensChecklistRetorno: any[] = [];

  itemAberto: any = null;
  observacaoItem: string = '';
  abaAtiva: 'preenchimento' | 'tempo' = 'preenchimento';

  tempoPreenchimento = {
    aberturaSaida: '07:10',
    encerramentoSaida: '07:24',
    aberturaRetorno: '18:40',
    encerramentoRetorno: '18:58',
    tempoSaidaMinutos: 14,
    tempoRetornoMinutos: 18,
    tempoTotalMinutos: 32
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private rascunhoService: RascunhoService,
    private veiculosService: VeiculosService,
    private modelosService: ModelosService,
    private motoristasService: MotoristasService,
    private checklistService: ChecklistService
  ) {}

  ngOnInit(): void {
    this.veiculosService.listar().subscribe({
      next: (dados) => this.veiculos = dados,
      error: () => this.toastService.erro('Não foi possível carregar os veículos.', 'Erro')
    });

    this.modelosService.listar().subscribe({
      next: (dados) => this.modelos = dados.filter(modelo => modelo.ativo),
      error: () => this.toastService.erro('Não foi possível carregar os modelos.', 'Erro')
    });

    this.motoristasService.listar().subscribe({
      next: (dados) => this.motoristas = dados,
      error: () => this.toastService.erro('Não foi possível carregar os motoristas.', 'Erro')
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.carregarParaFinalizar(Number(params['id']));
        return;
      }

      const rascunho = this.rascunhoService.obter<typeof this.formulario>(this.chaveRascunho);
      if (rascunho) {
        this.formulario = { ...this.formulario, ...rascunho };
        this.rascunhoService.limpar(this.chaveRascunho);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['retornoCampo'] && params['retornoId']) {
        (this.formulario as any)[params['retornoCampo']] = params['retornoId'];
      }
    });
  }

  private carregarParaFinalizar(id: number): void {
    this.checklistService.obter(id).subscribe({
      next: (checklist) => {
        this.checklistIdAtual = id;
        this.checklistCarregado = checklist;
        this.faseAtual = 'retorno';
        this.formulario.modelo = String(checklist.modelo_id);
        this.formulario.veiculo = String(checklist.veiculo_id);
        this.formulario.kmAtual = checklist.km_saida;

        this.itensChecklistRetorno = (checklist.modelo?.itens || []).map((item: any) => this.mapearItemModelo(item));
      },
      error: () => this.toastService.erro('Não foi possível carregar o checklist.', 'Erro')
    });
  }

  private mapearItemModelo(item: any): any {
    return {
      id: item.id,
      nome: item.nome,
      tipo: item.tipo === 'avaliacao' ? 'pills' : 'texto',
      valor: '',
      obrigatoriaFoto: item.obrigatorio_foto,
      temFoto: false,
      observacao: '',
      respostas: item.tipo === 'avaliacao' ? ['Bom', 'Regular', 'Ruim'] : []
    };
  }

  aoSelecionarModelo(): void {
    const modeloSelecionado = this.modelos.find(m => m.id.toString() === this.formulario.modelo);
    this.itensChecklistSaida = (modeloSelecionado?.itens || []).map((item: any) => this.mapearItemModelo(item));
  }

  irParaCadastro(tipo: 'veiculo' | 'modelo', modo: 'novo' | 'editar', event?: Event): void {
    event?.preventDefault();

    const rota = tipo === 'veiculo' ? '/veiculos' : '/modelos';
    const idAtual = tipo === 'veiculo' ? this.formulario.veiculo : this.formulario.modelo;

    if (modo === 'editar' && !idAtual) {
      this.toastService.avisar(`Selecione um ${tipo === 'veiculo' ? 'veículo' : 'modelo'} antes de editar.`, 'Atenção');
      return;
    }

    this.rascunhoService.salvar(this.chaveRascunho, this.formulario);

    const destino = modo === 'novo' ? `${rota}/novo` : `${rota}/${idAtual}/editar`;
    this.router.navigate([destino], { queryParams: { retorno: this.router.url.split('?')[0], campo: tipo } });
  }

  mudarFase(fase: 'saida' | 'retorno'): void {
    this.faseAtual = fase;
    this.passoAtual = 1;
  }

  eModeloCompleto(): boolean {
    const modeloSelecionado = this.modelos.find(m => m.id.toString() === this.formulario.modelo);
    return modeloSelecionado?.tipo === 'Completo';
  }

  eModeloSimples(): boolean {
    const modeloSelecionado = this.modelos.find(m => m.id.toString() === this.formulario.modelo);
    return modeloSelecionado?.tipo === 'Simples';
  }

  formatarTempo(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}min`;
  }

  proximoPasso(): void {
    if (this.validarPasso()) {
      this.passoAtual++;
    }
  }

  passoAnterior(): void {
    if (this.passoAtual > 1) {
      this.passoAtual--;
    }
  }

  validarPasso(): boolean {
    if (this.faseAtual === 'saida') {
      if (this.passoAtual === 1) {
        return this.formulario.modelo !== '' && this.formulario.veiculo !== '' && this.formulario.kmAtual !== '';
      }
      if (this.passoAtual === 2) {
        return this.itensChecklistSaida.every(item => item.valor !== '' || item.tipo === 'texto');
      }
    } else if (this.faseAtual === 'retorno') {
      if (this.eModeloCompleto()) {
        return this.formulario.kmRetorno !== '' && this.itensChecklistRetorno.every(item => item.valor !== '' || item.tipo === 'texto');
      }
      return this.formulario.kmRetorno !== '';
    }
    return true;
  }

  selecionarResposta(item: any, resposta: string): void {
    item.valor = resposta;
  }

  abrirFotoItem(item: any): void {
    this.itemAberto = item;
    const input = document.getElementById('foto-input') as HTMLInputElement;
    input?.click();
  }

  aoSelecionarFoto(evento: any): void {
    if (this.itemAberto && evento.target.files.length > 0) {
      this.itemAberto.temFoto = true;
    }
  }

  abrirObservacaoItem(item: any): void {
    this.itemAberto = item;
    this.observacaoItem = item.observacao || '';
  }

  salvarObservacao(): void {
    if (this.itemAberto) {
      this.itemAberto.observacao = this.observacaoItem;
      this.itemAberto = null;
    }
  }

  private montarRespostas(itens: any[]): any[] {
    return itens.map(item => ({
      item_id: item.id,
      valor: item.valor || null,
      foto: item.temFoto ? 'anexo.jpg' : null,
      observacao: item.observacao || null
    }));
  }

  finalizarSaida(): void {
    const payload = {
      modelo_id: Number(this.formulario.modelo),
      veiculo_id: Number(this.formulario.veiculo),
      motorista_id: this.formulario.motorista ? Number(this.formulario.motorista) : null,
      km_saida: Number(this.formulario.kmAtual),
      observacao_saida: this.formulario.observacaoSaida || null,
      respostas: this.montarRespostas(this.itensChecklistSaida)
    };

    this.checklistService.criar(payload).subscribe({
      next: () => {
        this.toastService.sucesso('Checklist iniciado com sucesso.', 'Sucesso');
        this.router.navigate(['/checklists']);
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o checklist.', 'Erro')
    });
  }

  finalizarRetorno(): void {
    if (this.checklistIdAtual === null) {
      return;
    }

    const payload = {
      km_retorno: Number(this.formulario.kmRetorno),
      observacao_retorno: this.formulario.observacaoRetorno || null,
      respostas: this.montarRespostas(this.itensChecklistRetorno)
    };

    this.checklistService.finalizarRetorno(this.checklistIdAtual, payload).subscribe({
      next: () => {
        this.toastService.sucesso('Checklist finalizado com sucesso.', 'Sucesso');
        this.router.navigate(['/checklists']);
      },
      error: (erro) => this.toastService.erro(erro?.error?.message || 'Não foi possível finalizar o checklist.', 'Erro')
    });
  }

  cancelar(): void {
    this.router.navigate(['/checklists']);
  }
}
