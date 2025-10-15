// src/app/pages/solicitudes-tutoria/solicitudes-tutoria.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { TutoriaService } from '../../services/tutoria.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

// Models
import { SolicitudTutoria } from '../../models/tutoria';

@Component({
  selector: 'app-solicitudes-tutoria',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './solicitudes-tutoria.component.html',
  styleUrls: ['./solicitudes-tutoria.component.scss']
})
export class SolicitudesTutoriaComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tutoriaService = inject(TutoriaService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  solicitudes: SolicitudTutoria[] = [];
  isLoading = true;
  tutoriaId = '';

  ngOnInit(): void {
    this.tutoriaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.tutoriaId) {
      this.cargarSolicitudes();
    } else {
      this.router.navigate(['/mis-tutorias']);
    }
  }

  private cargarSolicitudes(): void {
    this.isLoading = true;

    // Primero verificar que el usuario sea el mentor de esta tutoría
    this.tutoriaService.getTutoriaById(this.tutoriaId).subscribe({
      next: (tutoria) => {
        const currentUser = this.authService.getCurrentUser();
        const isMentor = currentUser && String(currentUser.id) === String(tutoria.mentorId);

        if (!isMentor) {
          this.notificationService.showError('No tienes permisos para ver las solicitudes de esta tutoría');
          this.router.navigate(['/mis-tutorias']);
          return;
        }

        // Si es el mentor, cargar las solicitudes
        this.tutoriaService.getSolicitudesTutoria(this.tutoriaId).subscribe({
          next: (solicitudes) => {
            this.solicitudes = solicitudes;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al cargar solicitudes:', error);
            this.notificationService.showError('No se pudieron cargar las solicitudes');
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar tutoría:', error);
        this.notificationService.showError('No se pudo verificar la tutoría');
        this.router.navigate(['/mis-tutorias']);
      }
    });
  }

   aceptarSolicitud(): void {
     // TODO: Implement accept solicitud
     this.notificationService.showInfo('Funcionalidad próximamente');
   }

   rechazarSolicitud(): void {
     // TODO: Implement reject solicitud
     this.notificationService.showInfo('Funcionalidad próximamente');
   }

  volver(): void {
    this.router.navigate(['/tutorias', this.tutoriaId]);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'accent';
      case 'Aceptada':
        return 'primary';
      case 'Rechazada':
        return 'warn';
      default:
        return 'accent';
    }
  }
} 