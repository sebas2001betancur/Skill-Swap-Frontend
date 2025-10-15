// app.component.ts - Lógica mejorada
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, AuthState } from './services/auth.service';

interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  public?: boolean; // Visible sin autenticación
  requiredRole?: string[]; // Roles que pueden verlo
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  authState$!: Observable<AuthState>;
  mobileMenuOpen = false;
  userMenuOpen = false;
  currentYear = new Date().getFullYear();

  // Navegación pública
  publicNavigation: NavigationItem[] = [
    { label: 'Inicio', route: '/', icon: 'home', public: true },
    { label: 'Explorar Cursos', route: '/cursos', icon: 'book', public: true },
    { label: 'Buscar Tutorías', route: '/buscar-tutorias', icon: 'users', public: true },
    { label: 'Cómo Funciona', route: '/como-funciona', icon: 'info', public: true }
  ];

  // Navegación privada (usuario autenticado)
  privateNavigation: NavigationItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
    { label: 'Mis Cursos', route: '/mis-cursos', icon: 'book-open' },
    { label: 'Mis Tutorías', route: '/mis-tutorias', icon: 'calendar' },
    { label: 'Mis Solicitudes', route: '/mis-solicitudes', icon: 'inbox' }
  ];

  // Navegación para mentores
  mentorNavigation: NavigationItem[] = [
    { label: 'Crear Curso', route: '/curso/nuevo', icon: 'plus-circle', requiredRole: ['Mentor', 'Admin'] },
    { label: 'Crear Tutoría', route: '/crear-tutoria', icon: 'calendar-plus', requiredRole: ['Mentor', 'Admin'] },
    { label: 'Gestionar Solicitudes', route: '/mentor/solicitudes', icon: 'clipboard-check', requiredRole: ['Mentor', 'Admin'] }
  ];

  // Navegación admin
  adminNavigation: NavigationItem[] = [
    { label: 'Panel Admin', route: '/admin', icon: 'shield', requiredRole: ['Admin'] },
    { label: 'Gestionar Materias', route: '/admin/materias', icon: 'book-plus', requiredRole: ['Admin'] }
  ];

  constructor() {
    this.authState$ = this.authService.authState$;
  }



  // Cerrar menús al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && !target.closest('.user-menu-button')) {
      this.userMenuOpen = false;
    }
  }

  // Helpers
  isUserAuthenticated(authState: AuthState): boolean {
    return authState?.isAuthenticated || false;
  }

  getCurrentUser(authState: AuthState) {
    return authState?.user || null;
  }

  getUserInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  hasRole(authState: AuthState, roles: string[]): boolean {
    const userRole = authState?.user?.rol;
    return userRole ? roles.includes(userRole) : false;
  }

  isAdmin(authState: AuthState): boolean {
    return authState?.user?.rol === 'Admin';
  }

  // Navegación filtrada por rol
  getVisibleNavigation(authState: AuthState, items: NavigationItem[]): NavigationItem[] {
    return items.filter(item => {
      if (!item.requiredRole) return true;
      return this.hasRole(authState, item.requiredRole);
    });
  }

  // Acciones
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  // Obtener icono SVG
  getIcon(iconName: string): string {
    const icons: Record<string, string> = {
      'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      'users': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'plus-circle': 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
      'layout-dashboard': 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z',
      // Agregar más iconos según necesites
    };
    return icons[iconName] || '';
  }

  // src/app/app.component.ts
isMentor(authState: AuthState): boolean {
  const user = authState?.user;

  // Log para debugging
  console.log('🔍 Verificando si es mentor:', {
    user: user,
    esMentor: user?.esMentor,
    rol: user?.rol
  });

  // ✅ CORRECCIÓN: Verificar esMentor o rol
  const result = user?.esMentor || user?.rol === 'Mentor' || user?.rol === 'Admin';

  console.log('✅ isMentor resultado:', result);

  return result;
}
}