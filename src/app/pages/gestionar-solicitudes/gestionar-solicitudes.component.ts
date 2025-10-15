// src/app/pages/gestionar-solicitudes/gestionar-solicitudes.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { TutoriaService } from '../../services/tutoria.service';
import { SolicitudService } from '../../services/solicitud.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

// Models
import { SolicitudTutoria, Tutoria } from '../../models/tutoria';

// Components
import { ConfirmDialogComponent, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog.component';

interface SolicitudConTutoria extends SolicitudTutoria {
  tutoria?: Tutoria;
}

@Component({
  selector: 'app-gestionar-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './gestionar-solicitudes.component.html',
  styleUrls: ['./gestionar-solicitudes.component.scss']
})
export class GestionarSolicitudesComponent implements OnInit, OnDestroy {

  private readonly tutoriaService = inject(TutoriaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  solicitudesPendientes: SolicitudConTutoria[] = [];
  solicitudesAceptadas: SolicitudConTutoria[] = [];
  solicitudesRechazadas: SolicitudConTutoria[] = [];
  isLoading = true;
  private refreshInterval?: number;
  private readonly REFRESH_INTERVAL = 30000; // 30 segundos
  private solicitudesCountAnterior = 0;

  ngOnInit(): void {
    this.cargarSolicitudesMentor();
    this.iniciarAutoRefresh();
  }

  ngOnDestroy(): void {
    this.detenerAutoRefresh();
  }

  private cargarSolicitudesMentor(): void {
    this.isLoading = true;

    // Obtener todas las solicitudes recibidas por el mentor
    this.solicitudService.getMisSolicitudesRecibidas().subscribe({
      next: (solicitudes) => {
        console.log('Solicitudes recibidas del mentor:', solicitudes);

        // Necesitamos obtener información de las tutorías para cada solicitud
        if (solicitudes && solicitudes.length > 0) {
          this.enriquecerSolicitudesConTutorias(solicitudes);
        } else {
          // No hay solicitudes
          this.solicitudesPendientes = [];
          this.solicitudesAceptadas = [];
          this.solicitudesRechazadas = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar solicitudes recibidas:', error);
        this.notificationService.showError('Error al cargar las solicitudes');
        this.isLoading = false;
      }
    });
  }

  private enriquecerSolicitudesConTutorias(solicitudes: SolicitudTutoria[]): void {
    // Obtener todas las tutorías del mentor para mapear
    this.tutoriaService.getMisTutorias().subscribe({
      next: (tutorias) => {
        console.log('Tutorías del mentor para enriquecer solicitudes:', tutorias);

        // Crear mapa de tutorías por ID
        const tutoriasMap = new Map<string, Tutoria>();
        tutorias.forEach(tutoria => tutoriasMap.set(tutoria.id, tutoria));

        // Enriquecer cada solicitud con información de la tutoría
        const solicitudesEnriquecidas: SolicitudConTutoria[] = solicitudes.map(solicitud => {
          const tutoria = tutoriasMap.get(solicitud.tutoriaId);
          return {
            ...solicitud,
            tutoria: tutoria
          };
        });

        // Clasificar solicitudes por estado
        this.solicitudesPendientes = solicitudesEnriquecidas.filter(s => s.estado === 'Pendiente');
        this.solicitudesAceptadas = solicitudesEnriquecidas.filter(s => s.estado === 'Aceptada');
        this.solicitudesRechazadas = solicitudesEnriquecidas.filter(s => s.estado === 'Rechazada');

        console.log('Solicitudes clasificadas:', {
          pendientes: this.solicitudesPendientes.length,
          aceptadas: this.solicitudesAceptadas.length,
          rechazadas: this.solicitudesRechazadas.length
        });

        // Verificar si hay nuevas solicitudes pendientes
        const nuevasSolicitudesPendientes = this.solicitudesPendientes.length - this.solicitudesCountAnterior;
        if (nuevasSolicitudesPendientes > 0 && this.solicitudesCountAnterior > 0) {
          this.notificationService.showInfo(`¡Tienes ${nuevasSolicitudesPendientes} nueva(s) solicitud(es) pendiente(s)!`);
        }

        this.solicitudesCountAnterior = this.solicitudesPendientes.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar tutorías para enriquecer solicitudes:', error);
        // Clasificar solicitudes sin información de tutoría
        this.solicitudesPendientes = solicitudes.filter(s => s.estado === 'Pendiente');
        this.solicitudesAceptadas = solicitudes.filter(s => s.estado === 'Aceptada');
        this.solicitudesRechazadas = solicitudes.filter(s => s.estado === 'Rechazada');
        this.isLoading = false;
      }
    });
  }

  aceptarSolicitud(solicitud: SolicitudConTutoria): void {
    if (!solicitud.tutoria) return;

    const dialogData: ConfirmDialogData = {
      title: 'Aceptar Solicitud',
      message: `¿Estás seguro de que deseas aceptar la solicitud de ${solicitud.estudianteNombre} para la tutoría "${solicitud.tutoria?.titulo}"?`,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      type: 'info'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('GestionarSolicitudes: Aceptando solicitud', {
          solicitudId: solicitud.id,
          tutoriaId: solicitud.tutoria!.id,
          estudiante: solicitud.estudianteNombre
        });

        this.solicitudService.aceptarSolicitud(solicitud.id).subscribe({
          next: (solicitudActualizada) => {
            console.log('GestionarSolicitudes: Solicitud aceptada exitosamente:', solicitudActualizada);
            this.notificationService.showSuccess('Solicitud aceptada exitosamente');
            // Actualizar la solicitud en la lista
            this.actualizarSolicitudEnLista(solicitudActualizada);
          },
          error: (error) => {
            console.error('GestionarSolicitudes: Error al aceptar solicitud:', error);
            console.error('Detalles del error:', {
              status: error.status,
              statusText: error.statusText,
              url: error.url,
              error: error.error
            });

            let errorMessage = 'Error al aceptar la solicitud';
            if (error.status === 409) {
              errorMessage = 'Esta solicitud ya fue procesada por otro medio';
            } else if (error.status === 403) {
              errorMessage = 'No tienes permisos para aceptar esta solicitud';
            } else if (error.status === 404) {
              errorMessage = 'La solicitud ya no existe';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }

            this.notificationService.showError(errorMessage);
          }
        });
      }
    });
  }

  rechazarSolicitud(solicitud: SolicitudConTutoria): void {
    if (!solicitud.tutoria) return;

    const dialogData: ConfirmDialogData = {
      title: 'Rechazar Solicitud',
      message: `¿Estás seguro de que deseas rechazar la solicitud de ${solicitud.estudianteNombre} para la tutoría "${solicitud.tutoria?.titulo}"? Esta acción no se puede deshacer.`,
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('GestionarSolicitudes: Rechazando solicitud', {
          solicitudId: solicitud.id,
          tutoriaId: solicitud.tutoria!.id,
          estudiante: solicitud.estudianteNombre
        });

        this.solicitudService.rechazarSolicitud(solicitud.id, {}).subscribe({
          next: (solicitudActualizada) => {
            console.log('GestionarSolicitudes: Solicitud rechazada exitosamente:', solicitudActualizada);
            this.notificationService.showSuccess('Solicitud rechazada exitosamente');
            // Actualizar la solicitud en la lista
            this.actualizarSolicitudEnLista(solicitudActualizada);
          },
          error: (error) => {
            console.error('GestionarSolicitudes: Error al rechazar solicitud:', error);
            console.error('Detalles del error:', {
              status: error.status,
              statusText: error.statusText,
              url: error.url,
              error: error.error
            });

            let errorMessage = 'Error al rechazar la solicitud';
            if (error.status === 409) {
              errorMessage = 'Esta solicitud ya fue procesada por otro medio';
            } else if (error.status === 403) {
              errorMessage = 'No tienes permisos para rechazar esta solicitud';
            } else if (error.status === 404) {
              errorMessage = 'La solicitud ya no existe';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }

            this.notificationService.showError(errorMessage);
          }
        });
      }
    });
  }

  private actualizarSolicitudEnLista(solicitudActualizada: SolicitudTutoria): void {
    console.log('GestionarSolicitudes: Actualizando solicitud en lista:', solicitudActualizada);

    // Encontrar la solicitud original para mantener la referencia a la tutoría
    const solicitudOriginal = this.solicitudesPendientes.find(s => s.id === solicitudActualizada.id) ||
                             this.solicitudesAceptadas.find(s => s.id === solicitudActualizada.id) ||
                             this.solicitudesRechazadas.find(s => s.id === solicitudActualizada.id);

    if (!solicitudOriginal) {
      console.warn('GestionarSolicitudes: No se encontró la solicitud original para actualizar');
      return;
    }

    // Remover de todas las listas
    this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== solicitudActualizada.id);
    this.solicitudesAceptadas = this.solicitudesAceptadas.filter(s => s.id !== solicitudActualizada.id);
    this.solicitudesRechazadas = this.solicitudesRechazadas.filter(s => s.id !== solicitudActualizada.id);

    // Crear objeto actualizado manteniendo la referencia a la tutoría
    const solicitudConTutoria: SolicitudConTutoria = {
      ...solicitudActualizada,
      tutoria: solicitudOriginal.tutoria,
      estudianteNombre: solicitudOriginal.estudianteNombre,
      mensaje: solicitudOriginal.mensaje
    };

    // Agregar a la lista correspondiente según el nuevo estado
    if (solicitudActualizada.estado === 'Aceptada') {
      this.solicitudesAceptadas.push(solicitudConTutoria);
      console.log('GestionarSolicitudes: Solicitud movida a aceptadas');
    } else if (solicitudActualizada.estado === 'Rechazada') {
      this.solicitudesRechazadas.push(solicitudConTutoria);
      console.log('GestionarSolicitudes: Solicitud movida a rechazadas');
    } else {
      console.warn('GestionarSolicitudes: Estado desconocido:', solicitudActualizada.estado);
    }

    console.log('GestionarSolicitudes: Listas actualizadas - Pendientes:', this.solicitudesPendientes.length,
                'Aceptadas:', this.solicitudesAceptadas.length, 'Rechazadas:', this.solicitudesRechazadas.length);
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

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refrescar(): void {
    this.cargarSolicitudesMentor();
  }

  // Método de diagnóstico para debugging
  diagnosticar(): void {
    console.log('=== DIAGNÓSTICO DE SOLICITUDES ===');
    console.log('Usuario actual:', this.authService.getCurrentUser());
    console.log('Estado de carga:', this.isLoading);
    console.log('Solicitudes pendientes:', this.solicitudesPendientes.length);
    console.log('Solicitudes aceptadas:', this.solicitudesAceptadas.length);
    console.log('Solicitudes rechazadas:', this.solicitudesRechazadas.length);

    // Probar conexión con el backend
    this.solicitudService.getMisSolicitudesRecibidas().subscribe({
      next: (solicitudes) => {
        console.log('✅ Backend responde correctamente. Solicitudes:', solicitudes);
      },
      error: (error) => {
        console.error('❌ Error de conexión con backend:', error);
      }
    });
  }

  private iniciarAutoRefresh(): void {
    this.refreshInterval = window.setInterval(() => {
      console.log('GestionarSolicitudes: Auto-refreshing solicitudes...');
      this.cargarSolicitudesMentor();
    }, this.REFRESH_INTERVAL);
  }

  private detenerAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }


}