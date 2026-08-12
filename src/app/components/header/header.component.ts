import { Component, computed, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NotificationService, Notificacao, CategoriaNotificacao, CATEGORIAS_NOTIFICACAO } from '../../services/notification.service';
import { ToastService } from '../toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  usuarioLogado: ReturnType<AuthService['obterUsuarioLogado']>;
  emailUsuario = '';
  iniciaisUsuario = '';

  notificacoes = signal<Notificacao[]>([]);
  notificacoesAbertas = false;
  carregandoNotificacoes = signal(false);

  categorias = CATEGORIAS_NOTIFICACAO;
  categoriaSelecionada = signal<CategoriaNotificacao | 'Todas'>('Todas');

  notificacoesFiltradas = computed(() => {
    const categoria = this.categoriaSelecionada();
    const lista = this.notificacoes();
    return categoria === 'Todas' ? lista : lista.filter(n => n.categoria === categoria);
  });

  menuUsuarioAberto = false;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.usuarioLogado = this.authService.obterUsuarioLogado();
    this.emailUsuario = this.usuarioLogado?.email || '';
    this.iniciaisUsuario = this.calcularIniciais(this.usuarioLogado?.nome || this.emailUsuario);
  }

  get notificacoesNaoLidas(): number {
    return this.notificacoes().filter(n => !n.lida).length;
  }

  private calcularIniciais(nomeOuEmail: string): string {
    if (!nomeOuEmail) {
      return '';
    }

    const partes = nomeOuEmail.split('@')[0].trim().split(/\s+/);
    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  selecionarCategoria(categoria: CategoriaNotificacao | 'Todas'): void {
    this.categoriaSelecionada.set(categoria);
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.notificacoesAbertas = false;
      this.menuUsuarioAberto = false;
    }
  }

  carregarNotificacoes(): void {
    this.carregandoNotificacoes.set(true);
    this.notificationService.listar().subscribe({
      next: (notificacoes) => {
        this.notificacoes.set(notificacoes);
        this.carregandoNotificacoes.set(false);
      },
      error: () => {
        this.notificacoes.set([]);
        this.carregandoNotificacoes.set(false);
      }
    });
  }

  alternarNotificacoes(): void {
    this.notificacoesAbertas = !this.notificacoesAbertas;
    this.menuUsuarioAberto = false;
    if (this.notificacoesAbertas) {
      this.carregarNotificacoes();
    }
  }

  alternarMenuUsuario(): void {
    this.menuUsuarioAberto = !this.menuUsuarioAberto;
    this.notificacoesAbertas = false;
  }

  abrirSuporte(): void {
    this.menuUsuarioAberto = false;
    this.toastService.informar('Central de suporte em breve.', 'Em breve');
  }

  sair(): void {
    this.authService.encerrarSessao().subscribe({
      next: () => this.finalizarLogout(),
      error: () => this.finalizarLogout()
    });
  }

  private finalizarLogout(): void {
    this.authService.limparSessao();
    this.router.navigate(['/login']);
  }
}
