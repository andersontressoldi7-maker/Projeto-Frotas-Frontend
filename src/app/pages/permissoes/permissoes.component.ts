import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'Admin' | 'Customizado';
}

interface TelaPermissao {
  modulo: string;
  ver: boolean;
  editar: boolean;
  excluir: boolean;
}

@Component({
  selector: 'app-permissoes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './permissoes.component.html',
  styleUrls: ['./permissoes.component.scss']
})
export class PermissoesComponent {
  title = 'Permissões';
  subtitle = 'Defina os perfis de acesso e privilégios de cada usuário';

  usuarios: Usuario[] = [
    { id: 1, nome: 'Anderson Tressoldi', email: 'andersontressoldi7@gmail.com', perfil: 'Admin' },
    { id: 2, nome: 'Gustavo Testador', email: 'gustavo@frotacheck.com', perfil: 'Customizado' },
    { id: 3, nome: 'Mauricio Dev', email: 'mauricio@frotacheck.com', perfil: 'Customizado' }
  ];

  usuarioSelecionado: Usuario | null = null;

  telasPermissoes: TelaPermissao[] = [
    { modulo: 'Dashboard', ver: true, editar: false, excluir: false },
    { modulo: 'Checklists', ver: true, editar: true, excluir: false },
    { modulo: 'Modelos de Checklist', ver: true, editar: true, excluir: true },
    { modulo: 'Veículos', ver: true, editar: true, excluir: false },
    { modulo: 'Motoristas', ver: true, editar: false, excluir: false },
    { modulo: 'Manutenções', ver: true, editar: true, excluir: false }
  ];

  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    if (usuario.perfil === 'Admin') {
      this.forcarPermissoesTotais();
    }
  }

  alterarPerfil(perfil: 'Admin' | 'Customizado'): void {
    if (this.usuarioSelecionado) {
      this.usuarioSelecionado.perfil = perfil;
      if (perfil === 'Admin') {
        this.forcarPermissoesTotais();
      }
    }
  }

  private forcarPermissoesTotais(): void {
    this.telasPermissoes = this.telasPermissoes.map(tela => ({
      modulo: tela.modulo,
      ver: true,
      editar: true,
      excluir: true
    }));
  }

  salvarPermissoes(): void {
    
    this.usuarioSelecionado = null;
  }
}