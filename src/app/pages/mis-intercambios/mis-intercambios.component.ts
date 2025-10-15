import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest } from 'rxjs';

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
import { IntercambioService } from '../../services/intercambio.service';
import { NotificationService } from '../../services/notification.service';
import { IntercambioDetallado } from '../../models/Intercambio';

// Components
import { ConfirmDialogComponent, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mis-intercambios',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './mis-intercambios.component.html',
  styleUrl: './mis-intercambios.component.scss'
})
export class MisIntercambiosComponent implements OnInit {

  private readonly intercambioService = inject(IntercambioService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  propuestasRecibidas: IntercambioDetallado[] = [];
  propuestasEnviadas: IntercambioDetallado[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadPropuestas();
  }

  private loadPropuestas(): void {
    this.isLoading = true;

    combineLatest([
      this.intercambioService.getPropuestasRecibidas(),
      this.intercambioService.getPropuestasEnviadas()
    ]).subscribe({
      next: ([recibidas, enviadas]) => {
        this.propuestasRecibidas = recibidas as IntercambioDetallado[];
        this.propuestasEnviadas = enviadas as IntercambioDetallado[];
        this.isLoading = false;
        console.log('Propuestas cargadas:', { recibidas: this.propuestasRecibidas.length, enviadas: this.propuestasEnviadas.length });
      },
      error: (error) => {
        console.error('Error cargando propuestas:', error);
        this.notificationService.showError('Error al cargar las propuestas de intercambio');
        this.isLoading = false;
      }
    });
  }

  onAceptar(id: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Aceptar Intercambio',
      message: '¿Estás seguro de que deseas aceptar esta propuesta de intercambio? Una vez aceptada, se completará la transacción.',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      type: 'info'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.intercambioService.aceptarPropuesta(id).subscribe({
          next: () => {
            this.notificationService.showSuccess('¡Intercambio aceptado exitosamente!');
            this.loadPropuestas(); // Recargar listas
          },
          error: (error) => {
            console.error('Error aceptando propuesta:', error);
            this.notificationService.showError('Error al aceptar el intercambio');
          }
        });
      }
    });
  }

  onRechazar(id: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Rechazar Propuesta',
      message: '¿Estás seguro de que deseas rechazar esta propuesta de intercambio? Esta acción no se puede deshacer.',
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.intercambioService.rechazarPropuesta(id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Propuesta rechazada');
            this.loadPropuestas(); // Recargar listas
          },
          error: (error) => {
            console.error('Error rechazando propuesta:', error);
            this.notificationService.showError('Error al rechazar la propuesta');
          }
        });
      }
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'accent';
      case 'ACEPTADO':
        return 'primary';
      case 'RECHAZADO':
        return 'warn';
      default:
        return 'accent';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'schedule';
      case 'ACEPTADO':
        return 'check_circle';
      case 'RECHAZADO':
        return 'cancel';
      default:
        return 'help';
    }
  }

  formatFecha(fecha: string | Date): string {
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
    this.loadPropuestas();
  }
}
