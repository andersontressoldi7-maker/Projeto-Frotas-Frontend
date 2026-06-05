import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = 'light';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        this.setTheme('light');
      }
    }
  }

  isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  toggleTheme(): void {
    const targetTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(targetTheme);
  }

  private setTheme(theme: string): void {
    this.currentTheme = theme;
    
    if (this.isBrowser) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
  }
}