// src/app/pages/perfil/perfil.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDto } from '../../models/auth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  currentUser: UserDto | null = null;
  isMentor = false;
  isMentorProfileComplete = false;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Cargar perfil actualizado desde backend
    this.authService.loadUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isMentor = this.currentUser?.esMentor || this.currentUser?.rol === 'Mentor';
        this.isMentorProfileComplete = this.authService.isMentorProfileComplete();

        console.log('Perfil cargado desde backend:', {
          user: this.currentUser,
          isMentor: this.isMentor,
          profileComplete: this.isMentorProfileComplete
        });
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        // Fallback a datos locales
        this.currentUser = this.authService.getCurrentUser();
        this.isMentor = this.currentUser?.esMentor || this.currentUser?.rol === 'Mentor';
        this.isMentorProfileComplete = this.authService.isMentorProfileComplete();
      }
    });
  }

  get hasMaterias(): boolean {
    return !!(this.currentUser?.materiasQueDomina?.length);
  }

  convertirseEnMentor(): void {
    this.router.navigate(['/convertir-mentor']);
  }

  editarPerfil(): void {
    // TODO: Implementar edición de perfil
    console.log('Editar perfil');
  }

  crearCurso(): void {
    this.router.navigate(['/curso/nuevo']);
  }

crearTutoria(): void {
  this.router.navigate(['/crear-tutoria']);
}

  // src/app/pages/perfil/perfil.component.ts
editarPerfilMentor(): void {
  this.router.navigate(['/editar-perfil-mentor']);
}
}

