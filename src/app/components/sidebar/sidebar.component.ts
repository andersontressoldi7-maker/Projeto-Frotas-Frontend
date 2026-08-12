import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface ItemMenuFilho {
  label: string;
  route: string;
  icon: string;
}

interface ItemMenu {
  icon: string;
  label: string;
  route?: string;
  children?: ItemMenuFilho[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  recolhida = false;
  abertoMobile = false;
  grupoExpandido: string | null = null;

  itensMenu: ItemMenu[] = [
    { icon: 'bi-grid', label: 'Dashboard', route: '/dashboard' },
    {
      icon: 'bi-card-checklist', label: 'Checklist', children: [
        { icon: 'bi-clipboard-check', label: 'Preenchimentos', route: '/checklists' },
        { icon: 'bi-folder', label: 'Modelos', route: '/modelos' },
        { icon: 'bi-list-check', label: 'Itens', route: '/itens' }
      ]
    },
    {
      icon: 'bi-truck', label: 'Veículos', children: [
        { icon: 'bi-list-ul', label: 'Listagem', route: '/veiculos' },
        { icon: 'bi-tags', label: 'Tipos', route: '/tipos-veiculos' },
        { icon: 'bi-people', label: 'Motoristas', route: '/motoristas' }
      ]
    },
    {
      icon: 'bi-geo-alt', label: 'Viagens', children: [
        { icon: 'bi-list-ul', label: 'Listagem', route: '/viagens' }
      ]
    },
    {
      icon: 'bi-wrench', label: 'Manutenções', children: [
        { icon: 'bi-list-ul', label: 'Listagem', route: '/manutencoes' },
        { icon: 'bi-sliders', label: 'Tipos', route: '/tipos-manutencao' }
      ]
    },
    {
      icon: 'bi-shield-lock', label: 'Permissões', children: [
        { icon: 'bi-person', label: 'Usuários', route: '/permissoes' },
        { icon: 'bi-shield-check', label: 'Perfis e Permissões', route: '/permissoes' }
      ]
    },
    { icon: 'bi-fuel-pump', label: 'Abastecimentos', route: '/abastecimentos' },
    { icon: 'bi-wallet2', label: 'Tipos de Despesas', route: '/tipos-despesas' },
    { icon: 'bi-building', label: 'Empresas', route: '/empresas' },
    { icon: 'bi-bell', label: 'Alertas e Notificações', route: '/alertas' },
    { icon: 'bi-bar-chart', label: 'Relatórios', route: '/relatorios' },
    { icon: 'bi-gear', label: 'Configurações', route: '/configuracoes' }
  ];

  constructor(private router: Router) {}

  @HostListener('window:keydown', ['$event'])
  aoTeclaPressionada(event: KeyboardEvent): void {
  }

  ngOnInit(): void {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        this.recolhida = true;
      }
    } catch {}

    const wrapper = document.querySelector('.dashboard-wrapper');
    const header = document.querySelector('.header-dashboard');
    if (this.recolhida) {
      wrapper?.classList.add('collapsed');
      header?.classList.add('collapsed');
    } else {
      wrapper?.classList.remove('collapsed');
      header?.classList.remove('collapsed');
    }

    this.expandirGrupoDaRotaAtual(this.router.url);
    this.router.events.pipe(filter(evento => evento instanceof NavigationEnd)).subscribe(evento => {
      this.expandirGrupoDaRotaAtual((evento as NavigationEnd).urlAfterRedirects);
    });
  }

  private expandirGrupoDaRotaAtual(url: string): void {
    const grupo = this.itensMenu.find(item => item.children?.some(filho => url.startsWith(filho.route)));
    if (grupo) {
      this.grupoExpandido = grupo.label;
    }
  }

  toggleGrupo(label: string): void {
    this.grupoExpandido = this.grupoExpandido === label ? null : label;
  }

  grupoAtivo(item: ItemMenu): boolean {
    return !!item.children?.some(filho => this.router.url.startsWith(filho.route));
  }

  navegarParaGrupo(item: ItemMenu): void {
    if (this.recolhida && item.children?.length) {
      this.router.navigate([item.children[0].route]);
      this.fecharMobile();
    } else {
      this.toggleGrupo(item.label);
    }
  }

  alternarSidebar(): void {
    this.recolhida = !this.recolhida;
    try {
      localStorage.setItem('sidebarCollapsed', this.recolhida ? 'true' : 'false');
    } catch {}
    const wrapper = document.querySelector('.dashboard-wrapper');
    const header = document.querySelector('.header-dashboard');
    
    if (this.recolhida) {
      wrapper?.classList.add('collapsed');
      header?.classList.add('collapsed');
    } else {
      wrapper?.classList.remove('collapsed');
      header?.classList.remove('collapsed');
    }
  }

  alternarMobile(): void {
    this.abertoMobile = !this.abertoMobile;
    if (this.abertoMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  abrirMobile(): void {
    this.abertoMobile = true;
    document.body.style.overflow = 'hidden';
  }

  fecharMobile(): void {
    this.abertoMobile = false;
    document.body.style.overflow = '';
  }
}