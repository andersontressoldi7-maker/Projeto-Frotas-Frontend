import { Component, computed, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NotificationService, Notificacao, CategoriaNotificacao, CATEGORIAS_NOTIFICACAO } from '../../services/notification.service';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  emailUsuario = 'andersontressoldi7@gmail.com';
  iniciaisUsuario = 'AN';

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
    private toastService: ToastService
  ) {}

  get notificacoesNaoLidas(): number {
    return this.notificacoes().filter(n => !n.lida).length;
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
        this.notificacoes.set([
          { id: 1, titulo: 'Manutenção em atraso', mensagem: 'Óleo Baixo — veículo abc-1234 está com manutenção atrasada há 14 dias.', data: '22/05/2026', lida: false, categoria: 'Manutenção' },
          { id: 2, titulo: 'CNH vencida', mensagem: 'Motorista fred está com a CNH vencida há 16 dias.', data: '20/05/2026', lida: false, categoria: 'Documento' },
          { id: 3, titulo: 'Checklist com inconformidade', mensagem: 'Checklist #2 do veículo XYZ-5678 foi finalizado com 1 item pendente.', data: '09/07/2026', lida: true, categoria: 'Checklist' },
          { id: 4, titulo: 'Viagem em andamento', mensagem: 'Viagem SP → JC segue em andamento.', data: '21/05/2026', lida: true, categoria: 'Viagem' }
        ]);
        this.carregandoNotificacoes.set(false);
      }
    });
  }

  toggleNotificacoes(): void {
    this.notificacoesAbertas = !this.notificacoesAbertas;
    this.menuUsuarioAberto = false;
    if (this.notificacoesAbertas && this.notificacoes().length === 0) {
      this.carregarNotificacoes();
    }
  }

  toggleMenuUsuario(): void {
    this.menuUsuarioAberto = !this.menuUsuarioAberto;
    this.notificacoesAbertas = false;
  }

  abrirSuporte(): void {
    this.menuUsuarioAberto = false;
    this.toastService.info('Central de suporte em breve.', 'Em breve');
  }

  logout(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch {}
    this.router.navigate(['/login']);
  }
}
