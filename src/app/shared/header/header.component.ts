import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isMobileMenuOpen = false;

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  needsRefresh(): boolean {
    return this.authService.needsRefresh();
  }

  onRefreshUser() {
    if (this.needsRefresh()) {
      this.notificationService.showInfo('Actualizando información del usuario...');

      this.authService.forceUserRefresh().subscribe({
        next: () => {
          this.notificationService.showSuccess('Usuario actualizado correctamente');
        },
        error: () => {
          this.notificationService.showError('Error al actualizar usuario. Intenta iniciar sesión nuevamente.');
        }
      });
    } else {
      this.notificationService.showInfo('El usuario ya está actualizado');
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
