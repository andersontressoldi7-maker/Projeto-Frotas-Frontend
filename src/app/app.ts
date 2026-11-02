import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ToastsComponent } from './components/toasts.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { StatusColorService } from './services/status-color.service';
import { TourComponent } from './components/tour/tour.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent, DialogComponent, TourComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Projeto-Frotas-Frontend');

  constructor(router: Router, statusColorService: StatusColorService) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        statusColorService.carregarDoServidor().subscribe({
          error: erro => console.error('Não foi possível carregar as cores de status.', erro)
        });
      });
  }
}
