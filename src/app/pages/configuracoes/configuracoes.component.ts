import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

interface CampoConfig {
  label: string;
  tipo: 'text' | 'number' | 'select' | 'switch';
  placeholder?: string;
  options?: string[];
  value?: boolean;
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
  imports: [CommonModule, SidebarComponent],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent {
  title = 'Configurações Globais';
  subtitle = 'Gerencie as diretrizes de funcionamento e integrações da plataforma';

  configuracoes: GrupoConfig[] = [
    {
      id: 'config-gerais',
      titulo: 'Gerais do Sistema',
      icon: 'bi-gear text-secondary',
      campos: [
        { label: 'Nome da Organização', tipo: 'text', placeholder: 'FrotaCheck Transportes LTDA' },
        { label: 'Fuso Horário Principal', tipo: 'select', options: ['Brasília (GMT-3)', 'Lisboa (GMT+1)', 'Amazonas (GMT-4)'] },
        { label: 'Idioma Padrão', tipo: 'select', options: ['Português (Brasil)', 'Português (Portugal)', 'English'] },
        { label: 'Ativar modo de auditoria em logs', tipo: 'switch', value: true }
      ]
    },
    {
      id: 'config-checklists',
      titulo: 'Módulo: Checklists',
      icon: 'bi-card-checklist text-success',
      campos: [
        { label: 'Obrigar assinatura do motorista ao finalizar', tipo: 'switch', value: true },
        { label: 'Bloquear veículo automaticamente se houver item crítico reprovado', tipo: 'switch', value: true },
        { label: 'Validade padrão do checklist (horas)', tipo: 'number', placeholder: '24' },
        { label: 'Obrigar envio de foto para itens reprovados', tipo: 'switch', value: true },
        { label: 'Tempo de tolerância para vistoria em atraso (minutos)', tipo: 'number', placeholder: '30' }
      ]
    },
    {
      id: 'config-manutencoes',
      titulo: 'Módulo: Manutenções',
      icon: 'bi-wrench text-danger',
      campos: [
        { label: 'Notificar gestor quando uma manutenção atingir atraso crítico', tipo: 'switch', value: true },
        { label: 'Alerta de troca de óleo padrão (KM)', tipo: 'number', placeholder: '10000' },
        { label: 'Permitir abertura de manutenção sem checklist vinculado', tipo: 'switch', value: false },
        { label: 'Alerta preventivo de rodízio de pneus (KM)', tipo: 'number', placeholder: '20000' }
      ]
    },
    {
      id: 'config-motoristas',
      titulo: 'Módulo: Motoristas & CNH',
      icon: 'bi-people text-warning',
      campos: [
        { label: 'Bloquear viagens para motoristas com CNH vencida', tipo: 'switch', value: true },
        { label: 'Dias de antecedência para alertar CNH vincenda', tipo: 'number', placeholder: '30' },
        { label: 'Exigir teste de bafômetro antes de iniciar rota', tipo: 'switch', value: false }
      ]
    },
    {
      id: 'config-integracoes',
      titulo: 'Integrações & Webhooks',
      icon: 'bi-cloud-check text-primary',
      campos: [
        { label: 'Disparar alertas críticos para canal do Telegram/Slack', tipo: 'switch', value: false },
        { label: 'URL do Webhook Corporativo', tipo: 'text', placeholder: 'https://api.suaempresa.com/v1/frotas' },
        { label: 'Sincronizar dados de telemetria GPS automaticamente', tipo: 'switch', value: true }
      ]
    }
  ];
}