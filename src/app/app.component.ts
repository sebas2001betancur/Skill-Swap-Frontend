// src/app/app.component.ts

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'skillswap';
  
  // Observables
  currentUser$: Observable<any>;
  
  // Estado del componente
  mobileMenuOpen = false;
  userMenuOpen = false;
  currentYear = new Date().getFullYear();
  
  // Subject para manejar suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Cerrar menús al cambiar de ruta
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closeMobileMenu();
      this.closeUserMenu();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Alterna el estado del menú móvil
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.closeUserMenu(); // Cerrar menú de usuario si está abierto
    }
  }

  /**
   * Cierra el menú móvil
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  /**
   * Alterna el estado del menú de usuario
   */
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.closeMobileMenu(); // Cerrar menú móvil si está abierto
    }
  }

  /**
   * Cierra el menú de usuario
   */
  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  /**
   * Obtiene las iniciales del nombre del usuario
   */
  getUserInitials(nombre: string): string {
    if (!nombre) return 'U';
    
    const words = nombre.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Cierra sesión del usuario
   */
  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.closeMobileMenu();
    this.router.navigate(['/login']).catch(err => {
      console.error('Error al navegar:', err);
    });
  }

  /**
   * Cierra menús al hacer clic fuera de ellos
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Cerrar menú de usuario si se hace clic fuera
    if (this.userMenuOpen && !target.closest('.relative')) {
      this.closeUserMenu();
    }
    
    // Cerrar menú móvil si se hace clic fuera
    if (this.mobileMenuOpen && !target.closest('nav')) {
      this.closeMobileMenu();
    }
  }

  /**
   * Cierra menús al presionar Escape
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMobileMenu();
    this.closeUserMenu();
  }
}