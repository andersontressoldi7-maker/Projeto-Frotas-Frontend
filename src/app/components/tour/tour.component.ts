import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TOUR_STEPS, TourStep } from './tour.steps';

interface Rect { top: number; left: number; width: number; height: number }

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.scss'
})
export class TourComponent implements OnInit, OnDestroy {
  readonly steps = TOUR_STEPS;
  index = 0;
  active = false;
  targetRect: Rect | null = null;
  cardTop = 0;
  cardLeft = 0;

  private userId: number | null = null;
  private routeSubscription?: Subscription;
  private observer?: MutationObserver;
  private frame = 0;
  private pendingStart = 0;

  constructor(private router: Router, private auth: AuthService) {}

  get step(): TourStep { return this.steps[this.index]; }

  ngOnInit(): void {
    this.routeSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.onNavigation());
    this.onNavigation();
    this.observer = new MutationObserver(records => {
      if (records.some(record => !(record.target as Element).closest?.('.tour-layer'))) {
        this.schedulePosition();
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    document.addEventListener('scroll', this.onDocumentScroll, true);
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    clearTimeout(this.pendingStart);
    document.removeEventListener('scroll', this.onDocumentScroll, true);
  }

  private onNavigation(): void {
    const user = this.auth.obterUsuarioLogado();
    if (!user?.id) {
      this.active = false;
      this.userId = null;
      return;
    }
    if (this.active && this.userId !== user.id) this.active = false;
    if (!this.active && this.router.url.split('?')[0] === '/dashboard' && !this.isDone(user.id)) {
      this.userId = user.id;
      clearTimeout(this.pendingStart);
      this.pendingStart = window.setTimeout(() => {
        if (this.router.url.split('?')[0] === '/dashboard' && this.auth.obterUsuarioLogado()?.id === user.id) {
          this.active = true;
          this.index = 0;
          this.showStep();
        }
      }, 150);
    } else if (this.active) {
      this.schedulePosition();
    }
  }

  async next(): Promise<void> {
    if (this.index === this.steps.length - 1) {
      this.exit();
      return;
    }
    this.index++;
    await this.showStep();
  }

  async previous(): Promise<void> {
    if (this.index === 0) return;
    this.index--;
    await this.showStep();
  }

  exit(): void {
    if (this.userId !== null) {
      try { localStorage.setItem(this.storageKey(this.userId), 'true'); } catch {}
    }
    this.active = false;
    this.targetRect = null;
    cancelAnimationFrame(this.frame);
  }

  private async showStep(): Promise<void> {
    this.targetRect = null;
    const route = this.step.route;
    if (this.router.url.split('?')[0] !== route) {
      await this.router.navigateByUrl(route);
    }
    this.schedulePosition();
  }

  private schedulePosition(): void {
    if (!this.active) return;
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.position());
  }

  private position(): void {
    if (!this.active) return;
    const element = this.router.url.split('?')[0] === this.step.route
      ? document.querySelector<HTMLElement>(this.step.target) : null;
    if (!element) {
      this.targetRect = null;
      this.cardLeft = Math.max(16, window.innerWidth - 376);
      this.cardTop = Math.max(16, window.innerHeight - 250);
      return;
    }
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) {
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    const rect = element.getBoundingClientRect();
    const pad = 6;
    this.targetRect = {
      top: Math.max(0, rect.top - pad),
      left: Math.max(0, rect.left - pad),
      width: Math.min(window.innerWidth - Math.max(0, rect.left - pad), rect.width + pad * 2),
      height: Math.min(window.innerHeight - Math.max(0, rect.top - pad), rect.height + pad * 2)
    };
    const cardWidth = Math.min(344, window.innerWidth - 32);
    this.cardLeft = Math.min(Math.max(16, rect.left), window.innerWidth - cardWidth - 16);
    this.cardTop = rect.bottom + 16 + 220 <= window.innerHeight
      ? rect.bottom + 16 : Math.max(16, rect.top - 232);
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void { this.schedulePosition(); }

  private onDocumentScroll = (): void => this.schedulePosition();

  private storageKey(id: number): string { return `frotacheck:tour:v1:user:${id}`; }

  private isDone(id: number): boolean {
    try { return localStorage.getItem(this.storageKey(id)) === 'true'; } catch { return false; }
  }
}
