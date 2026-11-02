import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { IaCadastroComponent } from '../../components/ia-cadastro/ia-cadastro.component';
import { ToastService } from '../../components/toast.service';
import { RascunhoService } from '../../services/rascunho.service';
import { VeiculosService } from '../../services/veiculos.service';
import { ModelosService } from '../../services/modelos.service';
import { MotoristasService } from '../../services/motoristas.service';
import { ChecklistService } from '../../services/checklist.service';
import { ConfiguracoesService } from '../../services/configuracoes.service';
import { environment } from '../../../environments/environment';
import { extrairMensagemErro } from '../../utils';

@Component({
  selector: 'app-checklist-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, IaCadastroComponent],
  templateUrl: './checklist-wizard.component.html',
  styleUrls: ['./checklist-wizard.component.scss']
})
export class ChecklistWizardComponent implements OnInit {
  private readonly chaveRascunho = 'rascunho-checklist-wizard';

  faseAtual: 'saida' | 'retorno' = 'saida';
  passoAtual = 1;
  checklistIdAtual: number | null = null;
  checklistCarregado: any = null;
  modoEdicao = false;
  carregandoChecklist = false;
  falhaAoCarregarChecklist = false;
  salvando = false;
  carregandoConfiguracoes = true;
  exigirAssinaturaMotorista = true;
  assinaturaMotorista = '';
  assinaturaEmEdicao = false;
  private canvasAssinatura?: HTMLCanvasElement;

  @ViewChild('assinaturaCanvas')
  set assinaturaCanvasRef(referencia: ElementRef<HTMLCanvasElement> | undefined) {
    this.canvasAssinatura = referencia?.nativeElement;
    this.renderizarAssinaturaSalva();
  }

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
  itemParaFoto: any = null;
  observacaoItem: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private rascunhoService: RascunhoService,
    private veiculosService: VeiculosService,
    private modelosService: ModelosService,
    private motoristasService: MotoristasService,
    private checklistService: ChecklistService,
    private configuracoesService: ConfiguracoesService
  ) {}

  ngOnInit(): void {
    this.configuracoesService.carregar().subscribe({
      next: resposta => {
        const configuracao = resposta.configuracoes['exigir_assinatura_motorista'];
        this.exigirAssinaturaMotorista = !(
          configuracao === false || configuracao === 0 || configuracao === '0'
        );
        this.carregandoConfiguracoes = false;
      },
      error: erro => {
        this.carregandoConfiguracoes = false;
        this.toastService.erro(
          `Não foi possível carregar as configurações do checklist: ${extrairMensagemErro(erro)}`,
          'Erro'
        );
      }
    });

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
        this.modoEdicao = true;
        this.faseAtual = 'saida';
        this.carregandoChecklist = true;
        this.falhaAoCarregarChecklist = false;
        this.carregarParaFinalizar(Number(params['id']));
        return;
      }

      this.modoEdicao = false;
      this.faseAtual = 'saida';
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
        this.formulario.modelo = String(checklist.modelo_id);
        this.formulario.veiculo = String(checklist.veiculo_id);
        this.formulario.motorista = checklist.motorista_id ? String(checklist.motorista_id) : '';
        this.formulario.kmAtual = checklist.km_saida;
        this.formulario.observacaoSaida = checklist.observacao_saida || '';
        this.formulario.kmRetorno = checklist.km_retorno === null ? '' : String(checklist.km_retorno);
        this.formulario.observacaoRetorno = checklist.observacao_retorno || '';
        this.assinaturaMotorista = checklist.assinatura_motorista || '';
        this.renderizarAssinaturaSalva();
        this.itensChecklistSaida = this.mapearItensDaFase(checklist, 'saida');
        this.itensChecklistRetorno = this.mapearItensDaFase(checklist, 'retorno');
        this.carregandoChecklist = false;
      },
      error: () => {
        this.carregandoChecklist = false;
        this.falhaAoCarregarChecklist = true;
        this.toastService.erro('Não foi possível carregar o checklist.', 'Erro');
      }
    });
  }

  private mapearItensDaFase(checklist: any, fase: 'saida' | 'retorno'): any[] {
    const respostas = (checklist.respostas || []).filter((resposta: any) => resposta.fase === fase);
    const itensDoModelo = checklist.modelo?.itens || [];
    const itensRespondidos = respostas
      .map((resposta: any) => resposta.item)
      .filter((item: any) => item && !itensDoModelo.some((itemModelo: any) => itemModelo.id === item.id));
    const itens = [...itensDoModelo, ...itensRespondidos];

    return itens.map((item: any) => {
      const resposta = respostas.find((registro: any) => registro.item_id === item.id);
      const itemMapeado = this.mapearItemModelo(item);

      return {
        ...itemMapeado,
        valor: resposta?.valor || '',
        temFoto: Boolean(resposta?.foto),
        foto: resposta?.foto || null,
        observacao: resposta?.observacao || ''
      };
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
      respostas: item.tipo === 'avaliacao' ? (item.categoria?.opcoes || []) : []
    };
  }

  aoSelecionarModelo(): void {
    this.itensChecklistSaida = [];

    if (!this.formulario.modelo) {
      return;
    }

    this.modelosService.obter(Number(this.formulario.modelo)).subscribe({
      next: (modelo) => this.itensChecklistSaida = (modelo?.itens || []).map((item: any) => this.mapearItemModelo(item)),
      error: () => this.toastService.erro('Não foi possível carregar os itens do modelo.', 'Erro')
    });
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
    return (modeloSelecionado || this.checklistCarregado?.modelo)?.tipo === 'Completo';
  }

  eModeloSimples(): boolean {
    const modeloSelecionado = this.modelos.find(m => m.id.toString() === this.formulario.modelo);
    return (modeloSelecionado || this.checklistCarregado?.modelo)?.tipo === 'Simples';
  }

  get tituloAtual(): string {
    if (this.faseAtual === 'saida') {
      return this.modoEdicao ? 'Editar Vistoria (Abertura)' : 'Nova Vistoria (Saída)';
    }

    return this.retornoConcluido ? 'Editar Vistoria (Fechamento)' : 'Finalizar Vistoria (Retorno)';
  }

  get retornoConcluido(): boolean {
    return this.checklistCarregado?.status === 'Concluído';
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
    if (this.carregandoConfiguracoes) {
      return false;
    }

    if (this.faseAtual === 'saida') {
      if (this.passoAtual === 1) {
        return this.formulario.modelo !== '' &&
          this.formulario.veiculo !== '' &&
          this.validarQuilometragem(this.formulario.kmAtual);
      }
      if (this.passoAtual === 2) {
        return this.itensChecklistSaida.every(item =>
          (item.valor !== '' || item.tipo === 'texto') &&
          (!item.obrigatoriaFoto || Boolean(item.foto))
        );
      }
    } else if (this.faseAtual === 'retorno') {
      if (this.eModeloCompleto()) {
        return this.validarQuilometragem(this.formulario.kmRetorno) &&
          Number(this.formulario.kmRetorno) >= Number(this.formulario.kmAtual) &&
          this.itensChecklistRetorno.every(item =>
            (item.valor !== '' || item.tipo === 'texto') &&
            (!item.obrigatoriaFoto || Boolean(item.foto))
          ) &&
          (!this.exigirAssinaturaMotorista || Boolean(this.assinaturaMotorista));
      }
      return this.validarQuilometragem(this.formulario.kmRetorno) &&
        Number(this.formulario.kmRetorno) >= Number(this.formulario.kmAtual) &&
        (!this.exigirAssinaturaMotorista || Boolean(this.assinaturaMotorista));
    }
    return false;
  }

  private validarQuilometragem(valor: string | number): boolean {
    const quilometragem = Number(valor);
    return valor !== '' && Number.isFinite(quilometragem) && quilometragem >= 0;
  }

  selecionarResposta(item: any, resposta: string): void {
    item.valor = resposta;
  }

  abrirFotoItem(item: any): void {
    this.itemParaFoto = item;
    const input = document.getElementById('foto-input') as HTMLInputElement;
    input?.click();
  }

  aoSelecionarFoto(evento: any): void {
    const arquivo = evento.target.files?.[0] as File | undefined;
    if (!this.itemParaFoto || !arquivo) {
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === 'string') {
        this.itemParaFoto.foto = leitor.result;
        this.itemParaFoto.temFoto = true;
      }
    };
    leitor.onerror = () => this.toastService.erro('Não foi possível ler a foto selecionada.', 'Erro');
    leitor.readAsDataURL(arquivo);
    evento.target.value = '';
  }

  iniciarAssinatura(evento: PointerEvent): void {
    const canvas = evento.currentTarget as HTMLCanvasElement;
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      this.toastService.erro('Não foi possível iniciar a área de assinatura.', 'Erro');
      return;
    }

    if (this.assinaturaMotorista && !this.assinaturaEmEdicao) {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      this.assinaturaMotorista = '';
    }

    canvas.setPointerCapture(evento.pointerId);
    const ponto = this.obterPontoCanvas(evento, canvas);
    contexto.beginPath();
    contexto.moveTo(ponto.x, ponto.y);
    contexto.lineWidth = 2;
    contexto.lineCap = 'round';
    contexto.strokeStyle = '#212529';
    this.assinaturaEmEdicao = true;
  }

  desenharAssinatura(evento: PointerEvent): void {
    if (!this.assinaturaEmEdicao) {
      return;
    }

    const canvas = evento.currentTarget as HTMLCanvasElement;
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      return;
    }

    const ponto = this.obterPontoCanvas(evento, canvas);
    contexto.lineTo(ponto.x, ponto.y);
    contexto.stroke();
  }

  concluirAssinatura(evento: PointerEvent): void {
    if (!this.assinaturaEmEdicao) {
      return;
    }

    const canvas = evento.currentTarget as HTMLCanvasElement;
    this.assinaturaEmEdicao = false;
    this.assinaturaMotorista = canvas.toDataURL('image/png');
  }

  private renderizarAssinaturaSalva(): void {
    const assinatura = this.assinaturaMotorista;
    const canvas = this.canvasAssinatura;
    const contexto = canvas?.getContext('2d');

    if (!assinatura || !canvas || !contexto || !assinatura.startsWith('data:image/')) {
      return;
    }

    const imagem = new Image();
    imagem.onload = () => {
      if (this.assinaturaMotorista !== assinatura || this.canvasAssinatura !== canvas) {
        return;
      }

      contexto.clearRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    };
    imagem.onerror = () => this.toastService.erro('Não foi possível exibir a assinatura salva.', 'Erro');
    imagem.src = assinatura;
  }

  limparAssinatura(canvas: HTMLCanvasElement): void {
    const contexto = canvas.getContext('2d');
    contexto?.clearRect(0, 0, canvas.width, canvas.height);
    this.assinaturaMotorista = '';
  }

  private obterPontoCanvas(evento: PointerEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const limites = canvas.getBoundingClientRect();
    return {
      x: (evento.clientX - limites.left) * canvas.width / limites.width,
      y: (evento.clientY - limites.top) * canvas.height / limites.height
    };
  }

  obterUrlFoto(foto: string): string {
    if (/^(data:image\/|https?:\/\/)/i.test(foto)) {
      return foto;
    }

    const baseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    const caminho = foto.split('/').map(parte => encodeURIComponent(parte)).join('/');
    return `${baseUrl}/storage/${caminho}`;
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
      foto: item.foto || null,
      observacao: item.observacao || null
    }));
  }

  finalizarSaida(): void {
    if (this.salvando || !this.validarPasso()) {
      return;
    }

    const payload = {
      modelo_id: Number(this.formulario.modelo),
      veiculo_id: Number(this.formulario.veiculo),
      motorista_id: this.formulario.motorista ? Number(this.formulario.motorista) : null,
      km_saida: Number(this.formulario.kmAtual),
      observacao_saida: this.formulario.observacaoSaida || null,
      respostas: this.montarRespostas(this.itensChecklistSaida)
    };

    this.salvando = true;
    if (this.modoEdicao && this.checklistIdAtual !== null) {
      this.checklistService.atualizar(this.checklistIdAtual, { ...payload, fase: 'saida' }).subscribe({
        next: () => {
          this.toastService.sucesso('Abertura atualizada com sucesso.', 'Sucesso');
          this.router.navigate(['/checklists']);
        },
        error: (erro) => {
          this.salvando = false;
          this.toastService.erro(erro?.error?.message || 'Não foi possível atualizar a abertura.', 'Erro');
        }
      });
      return;
    }

    this.checklistService.criar(payload).subscribe({
      next: () => {
        this.toastService.sucesso('Checklist iniciado com sucesso.', 'Sucesso');
        this.router.navigate(['/checklists']);
      },
      error: (erro) => {
        this.salvando = false;
        this.toastService.erro(erro?.error?.message || 'Não foi possível salvar o checklist.', 'Erro');
      }
    });
  }

  finalizarRetorno(): void {
    if (this.salvando || this.checklistIdAtual === null || !this.validarPasso()) {
      return;
    }

    const payload = {
      km_retorno: Number(this.formulario.kmRetorno),
      observacao_retorno: this.formulario.observacaoRetorno || null,
      respostas: this.montarRespostas(this.itensChecklistRetorno),
      assinatura_motorista: this.assinaturaMotorista || null
    };

    const salvamento = this.retornoConcluido
      ? this.checklistService.atualizar(this.checklistIdAtual, { ...payload, fase: 'retorno' })
      : this.checklistService.finalizarRetorno(this.checklistIdAtual, payload);

    this.salvando = true;
    salvamento.subscribe({
      next: () => {
        this.toastService.sucesso(
          this.retornoConcluido ? 'Fechamento atualizado com sucesso.' : 'Checklist finalizado com sucesso.',
          'Sucesso'
        );
        this.router.navigate(['/checklists']);
      },
      error: (erro) => {
        this.salvando = false;
        this.toastService.erro(erro?.error?.message || 'Não foi possível finalizar o checklist.', 'Erro');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/checklists']);
  }
}
