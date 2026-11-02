export interface TourStep {
  route: string;
  target: string;
  title: string;
  description: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    route: '/dashboard',
    target: '[data-tour="dashboard-totals"]',
    title: 'Visão geral da frota',
    description: 'Acompanhe aqui os principais números de veículos, viagens, checklists e manutenções.'
  },
  {
    route: '/dashboard',
    target: '[data-tour="notifications"]',
    title: 'Notificações',
    description: 'Os avisos importantes ficam aqui, organizados por categoria. Você pode abrir o sino para explorar.'
  },
  {
    route: '/veiculos',
    target: '[data-tour="primary-action"]',
    title: 'Cadastro de veículos',
    description: 'Cadastre um veículo e consulte a frota nesta tela. O botão destacado abre o formulário.'
  },
  {
    route: '/viagens',
    target: '[data-tour="primary-action"]',
    title: 'Viagens',
    description: 'Registre viagens e acompanhe o andamento de cada rota.'
  },
  {
    route: '/motoristas',
    target: '[data-tour="primary-action"]',
    title: 'Motoristas',
    description: 'Cadastre os motoristas que participam da operação da frota.'
  },
  {
    route: '/checklists',
    target: '[data-tour="primary-action"]',
    title: 'Checklists',
    description: 'Faça novos preenchimentos e acompanhe as inspeções dos veículos.'
  },
  {
    route: '/manutencoes',
    target: '[data-tour="primary-action"]',
    title: 'Manutenções',
    description: 'Registre serviços e acompanhe pendências e atrasos.'
  },
  {
    route: '/alertas',
    target: '[data-tour="alert-categories"]',
    title: 'Alertas',
    description: 'Consulte os avisos por seção para identificar o que precisa de atenção.'
  }
];
