// src/app/pages/mis-tutorias/mis-tutorias.component.ts
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { TutoriaService } from '../../services/tutoria.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

// Models
import { EstadoTutoria, EstadoSolicitud, Tutoria } from '../../models/tutoria';
import { UserDto } from '../../models/auth';

@Component({
  selector: 'app-mis-tutorias',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './mis-tutorias.component.html',
  styleUrls: ['./mis-tutorias.component.scss']
})
export class MisTutoriasComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly tutoriaService = inject(TutoriaService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);



  tutorias: Tutoria[] = [];
  tutoriasProximas: Tutoria[] = [];
  tutoriasPasadas: Tutoria[] = [];
  isLoading = true;

  selectedTab = 0;

  // Mapa para contar solicitudes pendientes por tutoría
  solicitudesPendientesCount: Record<string, number> = {};

  currentUser: UserDto | null = null;

  private destroy$ = new Subject<void>();
  private autoRefreshInterval?: number;

  ngOnInit(): void {
     // Recargar automáticamente cada 2 minutos para mantener sincronizado con el backend
     this.autoRefreshInterval = window.setInterval(() => {
       if (!!this.authService.getCurrentUser()) {
         this.cargarTutorias();
       }
     }, 120000); // 2 minutos

    this.authService.authState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(authState => {
      console.log('Auth state changed:', authState);
      this.currentUser = authState.user;
      if (authState.isAuthenticated && authState.user) {
        console.log('Usuario autenticado:', authState.user);
        this.cargarTutorias();
      } else if (!authState.isLoading) {
        console.log('Usuario no autenticado, redirigiendo a login');
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  private cargarTutorias(): void {
    this.isLoading = true;
    console.log('Cargando tutorías...');
    console.log('Usuario actual al cargar tutorías:', this.currentUser);

     this.tutoriaService.getMisTutorias().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (tutorias) => {
        console.log('Tutorías recibidas:', tutorias);
        console.log('Número de tutorías:', tutorias.length);

        // Log detallado de cada tutoría
        tutorias.forEach((tutoria, index) => {
          console.log(`Tutoría ${index + 1}:`, {
            id: tutoria.id,
            titulo: tutoria.titulo,
            mentorId: tutoria.mentorId,
            mentorNombre: tutoria.mentorNombre
          });
        });

        this.tutorias = tutorias;
        this.clasificarTutorias();
        this.cargarSolicitudesPendientes();
        console.log('Tutorías próximas:', this.tutoriasProximas.length);
        console.log('Tutorías pasadas:', this.tutoriasPasadas.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar tutorías:', error);
        this.notificationService.showError('No se pudieron cargar tus tutorías');
        this.isLoading = false;
      }
    });
  }

  private clasificarTutorias(): void {
    const ahora = new Date();
    
    this.tutoriasProximas = this.tutorias.filter(tutoria => {
      const fechaTutoria = new Date(tutoria.fechaHora);
      return fechaTutoria >= ahora && tutoria.estado !== EstadoTutoria.Cancelada;
    });
    
    this.tutoriasPasadas = this.tutorias.filter(tutoria => {
      const fechaTutoria = new Date(tutoria.fechaHora);
      return fechaTutoria < ahora || tutoria.estado === EstadoTutoria.Finalizada || tutoria.estado === EstadoTutoria.Cancelada;
    });
  }

  private cargarSolicitudesPendientes(): void {
    // Cargar el conteo de solicitudes pendientes para cada tutoría
    this.tutorias.forEach(tutoria => {
      this.tutoriaService.getSolicitudesTutoria(tutoria.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (solicitudes) => {
          const pendientes = solicitudes.filter(s => s.estado === EstadoSolicitud.Pendiente).length;
          this.solicitudesPendientesCount[tutoria.id] = pendientes;
        },
        error: (error) => {
          console.error(`Error al cargar solicitudes para tutoría ${tutoria.id}:`, error);
          this.solicitudesPendientesCount[tutoria.id] = 0;
        }
      });
    });
  }

  crearNuevaTutoria(): void {
    this.router.navigate(['/crear-tutoria']);
  }

  verDetalles(tutoriaId: string): void {
    this.router.navigate(['/tutorias', tutoriaId]);
  }

  verSolicitudes(tutoriaId: string): void {
    this.router.navigate(['/tutorias', tutoriaId, 'solicitudes']);
  }

  cancelarTutoria(tutoriaId: string): void {
    // Buscar la tutoría en todas las listas disponibles
    const tutoria = this.tutorias.find(t => t.id === tutoriaId) ||
                    this.tutoriasProximas.find(t => t.id === tutoriaId) ||
                    this.tutoriasPasadas.find(t => t.id === tutoriaId);

    if (!tutoria) {
      this.notificationService.showError('Tutoría no encontrada');
      return;
    }

    // Verificar si la tutoría ya está completada, cancelada o finalizada (case-insensitive)
    const estadoLower = tutoria.estado?.toLowerCase();
    if (estadoLower === 'completa' || estadoLower === 'completada' ||
        estadoLower === 'cancelada' || estadoLower === 'finalizada') {
      this.notificationService.showError(`No puedes cancelar una tutoría que ya está ${tutoria.estado.toLowerCase()}`);
      return;
    }

    // Verificar si la tutoría ya pasó
    const fechaTutoria = new Date(tutoria.fechaHora);
    const ahora = new Date();
    if (fechaTutoria < ahora) {
      this.notificationService.showError('No puedes cancelar una tutoría que ya pasó');
      return;
    }

    // Obtener información de estudiantes aceptados
    this.tutoriaService.getSolicitudesTutoria(tutoriaId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (solicitudes) => {
        const estudiantesAceptados = solicitudes.filter(s => s.estado === EstadoSolicitud.Aceptada).length;

        const dialogRef = this.dialog.open(CancelarTutoriaDialogComponent, {
          width: '400px',
          data: {
            tutoriaId,
            estudiantesAceptados
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Verificar nuevamente el estado antes de cancelar (por si cambió)
            const tutoriaActual = this.tutorias.find(t => t.id === tutoriaId) ||
                                  this.tutoriasProximas.find(t => t.id === tutoriaId) ||
                                  this.tutoriasPasadas.find(t => t.id === tutoriaId);

            if (tutoriaActual) {
              const estadoLower = tutoriaActual.estado?.toLowerCase();
              if (estadoLower === 'completa' || estadoLower === 'completada' ||
                  estadoLower === 'cancelada' || estadoLower === 'finalizada') {
                this.notificationService.showError(`No se puede cancelar: la tutoría ya está ${tutoriaActual.estado.toLowerCase()}`);
                return;
              }
            }

            this.tutoriaService.cancelarTutoria(tutoriaId).pipe(
              takeUntil(this.destroy$)
            ).subscribe({
              next: () => {
                this.snackBar.open('Tutoría cancelada exitosamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarTutorias(); // Recargar tutorías
              },
              error: (error) => {
                console.error('Error al cancelar tutoría:', error);
                let errorMessage = 'No se pudo cancelar la tutoría';

                if (error.status === 400 && error.error?.message) {
                  errorMessage = error.error.message;
                  // Si el backend dice que no se puede cancelar, recargar la lista para actualizar el estado
                  if (error.error.message.includes('completada') || error.error.message.includes('cancelada')) {
                    console.log('Tutoría ya no se puede cancelar según el backend, recargando lista...');
                    this.cargarTutorias();
                  }
                } else if (error.status === 403) {
                  errorMessage = 'No tienes permisos para cancelar esta tutoría';
                } else if (error.status === 404) {
                  errorMessage = 'La tutoría ya no existe';
                  // Recargar la lista si la tutoría ya no existe
                  this.cargarTutorias();
                }

                this.notificationService.showError(errorMessage);
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener solicitudes:', error);
        this.notificationService.showError('No se pudo verificar los estudiantes inscritos');
      }
    });
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Disponible':
        return 'primary';
      case 'Completa':
        return 'accent';
      case 'Cancelada':
        return 'warn';
      case 'Finalizada':
        return 'basic';
      default:
        return 'basic';
    }
  }

  puedeCancelarTutoria(tutoria: Tutoria): boolean {
    // No se puede cancelar si ya está completada, cancelada o finalizada (case-insensitive)
    const estadoLower = tutoria.estado?.toLowerCase();
    if (estadoLower === 'completa' || estadoLower === 'completada' ||
        estadoLower === 'cancelada' || estadoLower === 'finalizada') {
      return false;
    }

    // No se puede cancelar si la tutoría ya pasó
    const fechaTutoria = new Date(tutoria.fechaHora);
    const ahora = new Date();
    if (fechaTutoria < ahora) {
      return false;
    }

    return true;
  }

  getTooltipCancelacion(tutoria: Tutoria): string {
    if (tutoria.estado === EstadoTutoria.Completa) {
      return 'No se puede cancelar una tutoría completada';
    }
    if (tutoria.estado === EstadoTutoria.Cancelada) {
      return 'Esta tutoría ya está cancelada';
    }
    if (tutoria.estado === EstadoTutoria.Finalizada) {
      return 'No se puede cancelar una tutoría finalizada';
    }

    const fechaTutoria = new Date(tutoria.fechaHora);
    const ahora = new Date();
    if (fechaTutoria < ahora) {
      return 'No se puede cancelar una tutoría que ya pasó';
    }

    return 'Esta tutoría no puede ser cancelada';
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case EstadoTutoria.Disponible:
        return 'event_available';
      case EstadoTutoria.Completa:
        return 'check_circle';
      case EstadoTutoria.Cancelada:
        return 'cancel';
      case EstadoTutoria.Finalizada:
        return 'done_all';
      default:
        return 'help';
    }
  }

  isCurrentUserMentor(tutoria: Tutoria): boolean {
    // Usar la propiedad currentUser del componente que se actualiza reactivamente
    const currentUser = this.currentUser;

    // Verificar que el usuario esté autenticado
    if (!currentUser || !currentUser.id) {
      return false;
    }

    // Verificar que la tutoría tenga mentorId
    if (!tutoria || !tutoria.mentorId) {
      return false;
    }

    // Comparar IDs como strings para evitar problemas de tipos
    const userId = String(currentUser.id).trim();
    const mentorId = String(tutoria.mentorId).trim();

    return userId === mentorId;
  }

  getModalidadIcon(modalidad: string): string {
    switch (modalidad.toLowerCase()) {
      case 'virtual':
        return 'videocam';
      case 'presencial':
        return 'location_on';
      case 'hibrida':
        return 'swap_horiz';
      default:
        return 'help';
    }
  }

  trackByTutoriaId(index: number, tutoria: Tutoria): string {
    return tutoria.id;
  }

  hayCuposDisponibles(tutoria: Tutoria): boolean {
    return tutoria.cuposDisponibles > 0;
  }

  getCuposDisponibles(tutoria: Tutoria): number {
    return tutoria.cuposDisponibles;
  }

  verCalificaciones(tutoria: Tutoria): void {
    this.router.navigate(['/tutorias', tutoria.id, 'calificaciones']);
  }
}

// Diálogo para cancelar tutoría
@Component({
  selector: 'app-cancelar-tutoria-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
   template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Cancelar Tutoría</h2>
      <mat-dialog-content>
        <p>¿Estás seguro de que deseas cancelar esta tutoría?</p>
        <p *ngIf="data.estudiantesAceptados > 0" class="warning">
          Esta acción notificará a los {{ data.estudiantesAceptados }} estudiantes que han aceptado participar.
        </p>
        <p *ngIf="data.estudiantesAceptados === 0" class="info">
          No hay estudiantes aceptados en esta tutoría.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">No, mantener</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Sí, cancelar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
    }
    .warning {
      color: #f44336;
      font-weight: 500;
      margin-top: 16px;
    }
    .info {
      color: #2196f3;
      font-weight: 500;
      margin-top: 16px;
    }
  `]
})
export class CancelarTutoriaDialogComponent {
  dialogRef = inject<MatDialogRef<CancelarTutoriaDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);


  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}