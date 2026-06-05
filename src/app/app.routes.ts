import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChecklistsComponent } from './pages/checklists/checklists.component';
import { ModelosComponent } from './pages/modelos/modelos.component';
import { ItensComponent } from './pages/itens/itens.component';
import { VeiculosComponent } from './pages/veiculos/veiculos.component';
import { TiposVeiculosComponent } from './pages/tipos-veiculos/tipos-veiculos.component';
import { MotoristasComponent } from './pages/motoristas/motoristas.component';
import { EmpresasComponent } from './pages/empresas/empresas.component';
import { ViagensComponent } from './pages/viagens/viagens.component';
import { ManutencoesComponent } from './pages/manutencoes/manutencoes.component';
import { TiposManutencaoComponent } from './pages/tipos-manutencao/tipos-manutencao.component';
import { AlertasComponent } from './pages/alertas/alertas.component';
import { PermissoesComponent } from './pages/permissoes/permissoes.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'checklists', component: ChecklistsComponent },
  { path: 'modelos', component: ModelosComponent },
  { path: 'itens', component: ItensComponent },
  { path: 'veiculos', component: VeiculosComponent },
  { path: 'tipos-veiculos', component: TiposVeiculosComponent },
  { path: 'motoristas', component: MotoristasComponent },
  { path: 'empresas', component: EmpresasComponent },
  { path: 'viagens', component: ViagensComponent },
  { path: 'manutencoes', component: ManutencoesComponent },
  { path: 'tipos-manutencao', component: TiposManutencaoComponent },
  { path: 'alertas', component: AlertasComponent },
  { path: 'permissoes', component: PermissoesComponent },
  { path: 'relatorios', component: RelatoriosComponent },
  { path: 'configuracoes', component: ConfiguracoesComponent }
];