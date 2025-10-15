// src/app/pages/mis-solicitudes/mis-solicitudes.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services
import { SolicitudService } from '../../services/solicitud.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

// Models
import { SolicitudTutoria } from '../../models/tutoria';


@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './mis-solicitudes.component.html',
  styleUrls: ['./mis-solicitudes.component.scss']
})
export class MisSolicitudesComponent implements OnInit {

  private readonly solicitudService = inject(SolicitudService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  solicitudesEnviadas: SolicitudTutoria[] = [];
  solicitudesRecibidas: SolicitudTutoria[] = [];
  isLoading = false;
  selectedTab = 0;
  esMentor = false;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.esMentor = user?.esMentor || false;
    console.log('👤 Usuario actual:', user);
    console.log('🎓 ¿Es mentor?:', this.esMentor);
    console.log('🔐 Estado de autenticación:', {
      isAuthenticated: !!this.authService.getCurrentUser(),
      user: this.authService.getCurrentUser()
    });

    this.loadSolicitudes();
  }

  private loadSolicitudes(): void {
    console.log('🔄 Iniciando carga de solicitudes...');
    this.isLoading = true;

    // Cargar solicitudes enviadas (como estudiante) - SIEMPRE
    console.log('📤 Llamando a getMisSolicitudesEnviadas...');
    this.solicitudService.getMisSolicitudesEnviadas().subscribe({
      next: (solicitudes: SolicitudTutoria[]) => {
        console.log('✅ Solicitudes enviadas cargadas:', solicitudes.length);
        console.log('📋 Detalles de solicitudes enviadas:', solicitudes);
        this.solicitudesEnviadas = solicitudes;

        // Cargar solicitudes recibidas (como mentor) - TAMBIÉN SIEMPRE para testing
        console.log('👨‍🏫 Cargando solicitudes recibidas (testing)...');
        console.log('📥 Llamando a getMisSolicitudesRecibidas...');
        this.solicitudService.getMisSolicitudesRecibidas().subscribe({
          next: (solicitudesRecibidas: SolicitudTutoria[]) => {
            console.log('✅ Solicitudes recibidas cargadas:', solicitudesRecibidas.length);
            console.log('📋 Detalles de solicitudes recibidas:', solicitudesRecibidas);
            this.solicitudesRecibidas = solicitudesRecibidas;
            this.isLoading = false;
          },
           error: (error: unknown) => {
             console.error('❌ Error al cargar solicitudes recibidas:', error);
             console.error('🔍 Detalles del error:', error);
             this.notificationService.showError('Error al cargar solicitudes recibidas');
             this.isLoading = false;
           }
        });
      },
      error: (error: unknown) => {
        console.error('❌ Error al cargar solicitudes enviadas:', error);
        console.error('🔍 Detalles del error:', error);
        this.notificationService.showError('Error al cargar solicitudes enviadas');
        this.isLoading = false;
      }
    });
  }

  aceptarSolicitud(solicitud: SolicitudTutoria): void {
    if (solicitud.estado !== 'Pendiente') {
      this.notificationService.showWarning('Esta solicitud ya fue procesada');
      return;
    }

    // Mostrar confirmación
    const confirmacion = confirm(
      `¿Estás seguro de aceptar la solicitud de ${solicitud.estudianteNombre}?\n\nEsto reducirá los cupos disponibles de la tutoría.`
    );

    if (!confirmacion) {
      return;
    }

    console.log('✅ Aceptando solicitud:', solicitud.id);

    this.solicitudService.aceptarSolicitud(solicitud.id).subscribe({
      next: (solicitudActualizada: SolicitudTutoria) => {
        console.log('✅ Solicitud aceptada:', solicitudActualizada);

        // Actualizar la solicitud en la lista
        const index = this.solicitudesRecibidas.findIndex(s => s.id === solicitud.id);
        if (index !== -1) {
          this.solicitudesRecibidas[index] = solicitudActualizada;
        }

        this.notificationService.showSuccess(
          `Solicitud de ${solicitud.estudianteNombre} aceptada exitosamente`
        );
      },
       error: (error: unknown) => {
         console.error('❌ Error al aceptar solicitud:', error);

         let errorMessage = 'Error al aceptar la solicitud';
         if (error && typeof error === 'object' && 'error' in error && error.error && typeof error.error === 'object' && 'message' in error.error) {
           errorMessage = (error.error as { message: string }).message;
         } else if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 400) {
           errorMessage = 'No se puede aceptar la solicitud. Puede que no haya cupos disponibles.';
         } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: string }).message === 'string') {
           errorMessage = (error as { message: string }).message;
         }
        
        this.notificationService.showError(errorMessage);
      }
    });
  }

  rechazarSolicitud(solicitud: SolicitudTutoria): void {
    if (solicitud.estado !== 'Pendiente') {
      this.notificationService.showWarning('Esta solicitud ya fue procesada');
      return;
    }

    // Pedir razón opcional
    const razon = prompt(
      `¿Por qué rechazas la solicitud de ${solicitud.estudianteNombre}?\n\n(Opcional, pero ayuda al estudiante a entender)`,
      ''
    );

    // Si cancela el prompt, no hacer nada
    if (razon === null) {
      return;
    }

    console.log('🚫 Rechazando solicitud:', solicitud.id, 'Razón:', razon);

    const request = razon ? { razonRechazo: razon } : {};
    
    this.solicitudService.rechazarSolicitud(solicitud.id, request).subscribe({
      next: (solicitudActualizada: SolicitudTutoria) => {
        console.log('✅ Solicitud rechazada:', solicitudActualizada);

        // Actualizar la solicitud en la lista
        const index = this.solicitudesRecibidas.findIndex(s => s.id === solicitud.id);
        if (index !== -1) {
          this.solicitudesRecibidas[index] = solicitudActualizada;
        }

        this.notificationService.showSuccess(
          `Solicitud de ${solicitud.estudianteNombre} rechazada`
        );
      },
       error: (error: unknown) => {
         console.error('❌ Error al rechazar solicitud:', error);

         let errorMessage = 'Error al rechazar la solicitud';
         if (error && typeof error === 'object' && 'error' in error && error.error && typeof error.error === 'object' && 'message' in error.error) {
           errorMessage = (error.error as { message: string }).message;
         } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: string }).message === 'string') {
           errorMessage = (error as { message: string }).message;
         }
        
        this.notificationService.showError(errorMessage);
      }
    });
  }

  verDetallesTutoria(tutoriaId: string): void {
    this.router.navigate(['/tutorias', tutoriaId]);
  }

  getEstadoColor(estado: string): 'primary' | 'accent' | 'warn' {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'accent';
      case 'aceptada':
      case 'aceptado':
        return 'primary';
      case 'rechazada':
      case 'rechazado':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'schedule';
      case 'aceptada':
      case 'aceptado':
        return 'check_circle';
      case 'rechazada':
      case 'rechazado':
        return 'cancel';
      default:
        return 'help';
    }
  }

  formatearFecha(fecha: string | Date): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  }

  // Función de diagnóstico para debugging
  diagnosticar(): void {
    console.log('🔍 === DIAGNÓSTICO DE SOLICITUDES ===');
    console.log('👤 Usuario actual:', this.authService.getCurrentUser());
    console.log('🔐 Token disponible:', this.authService.getToken() ? 'Sí' : 'No');
    console.log('🎓 ¿Es mentor?:', this.esMentor);
    console.log('📤 Solicitudes enviadas:', this.solicitudesEnviadas.length);
    console.log('📥 Solicitudes recibidas:', this.solicitudesRecibidas.length);

    // Probar endpoints directamente
    console.log('🧪 Probando endpoints...');

    this.solicitudService.getMisSolicitudesEnviadas().subscribe({
      next: (data) => console.log('✅ Endpoint enviadas OK:', data),
      error: (err) => console.error('❌ Endpoint enviadas ERROR:', err)
    });

    if (this.esMentor) {
      this.solicitudService.getMisSolicitudesRecibidas().subscribe({
        next: (data) => console.log('✅ Endpoint recibidas OK:', data),
        error: (err) => console.error('❌ Endpoint recibidas ERROR:', err)
      });
    }
  }
}