// notification.service.ts - Servicio centralizado para notificaciones
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

export interface NotificationConfig {
  duration?: number;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  action?: string;
}

@Injectable({
  providedIn: 'root' 

})
export class NotificationService {
  
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // Configuraciones por defecto
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  };

  // ==================== Snackbar Methods ====================
  
  /**
   * Muestra una notificación de éxito
   */
  showSuccess(message: string, config?: NotificationConfig): void {
    this.show(message, 'snackbar-success', config);
  }

  /**
   * Muestra una notificación de error
   */
  showError(message: string, config?: NotificationConfig): void {
    this.show(message, 'snackbar-error', {
      ...config,
      duration: config?.duration || 5000
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string, config?: NotificationConfig): void {
    this.show(message, 'snackbar-warning', {
      ...config,
      duration: config?.duration || 4000
    });
  }

  /**
   * Muestra una notificación informativa
   */
  showInfo(message: string, config?: NotificationConfig): void {
    this.show(message, 'snackbar-info', config);
  }

  /**
   * Método genérico para mostrar notificaciones
   */
  private show(message: string, panelClass: string, config?: NotificationConfig): void {
    const snackBarConfig: MatSnackBarConfig = {
      ...this.defaultConfig,
      ...config,
      panelClass: [panelClass]
    };

    this.snackBar.open(
      message,
      config?.action || 'Cerrar',
      snackBarConfig
    );
  }

  // ==================== Dialog Methods ====================

  /**
   * Muestra un diálogo de confirmación genérico
   */
  confirm(data: ConfirmDialogData, config?: MatDialogConfig): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: false,
      autoFocus: true,
      ...config,
      data
    });

    return dialogRef.afterClosed();
  }

  /**
   * Muestra un diálogo de confirmación de eliminación
   */
  confirmDelete(itemName = 'este elemento'): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar ${itemName}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
  }

  /**
   * Muestra un diálogo de confirmación de acción
   */
  confirmAction(action: string, description?: string): Observable<boolean> {
    return this.confirm({
      title: `Confirmar ${action}`,
      message: description || `¿Estás seguro de que deseas ${action.toLowerCase()}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'warning'
    });
  }

  /**
   * Cierra todas las notificaciones activas
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }
}

// ==================== Uso en componentes ====================
/*
EJEMPLO DE USO:

import { NotificationService } from './services/notification.service';

export class MiComponente {
  private notificationService = inject(NotificationService);

  // Éxito
  onSave(): void {
    this.service.save().subscribe({
      next: () => {
        this.notificationService.showSuccess('Guardado exitosamente');
      }
    });
  }

  // Error
  onError(): void {
    this.notificationService.showError('Ocurrió un error al procesar la solicitud');
  }

  // Confirmación de eliminación
  onDelete(id: string): void {
    this.notificationService.confirmDelete('este curso').subscribe(confirmed => {
      if (confirmed) {
        this.executeDelete(id);
      }
    });
  }

  // Confirmación personalizada
  onCustomAction(): void {
    this.notificationService.confirm({
      title: 'Publicar curso',
      message: '¿Estás seguro de que deseas publicar este curso? Será visible para todos los usuarios.',
      confirmText: 'Publicar',
      cancelText: 'Cancelar',
      type: 'info'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.publishCourse();
      }
    });
  }
}
*/