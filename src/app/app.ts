import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Projeto-Frotas-Frontend');
  toggleMobileSidebar(): void {
    try {
      const ev = new CustomEvent('toggle-mobile-sidebar');
      document.dispatchEvent(ev);
    } catch {}
  }
}
