// confirm-dialog.component.ts - Componente completo
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog" [class]="'confirm-dialog--' + (data.type || 'info')">
      <div class="dialog-icon">
        <mat-icon *ngIf="data.type === 'danger'">warning</mat-icon>
        <mat-icon *ngIf="data.type === 'warning'">error_outline</mat-icon>
        <mat-icon *ngIf="data.type === 'info' || !data.type">info</mat-icon>
      </div>
      
      <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      
      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-btn">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.type === 'danger' ? 'warn' : 'primary'"
          (click)="onConfirm()"
          class="confirm-btn">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 1.5rem;
      text-align: center;
      min-width: 350px;
      
      .dialog-icon {
        margin-bottom: 1.5rem;
        
        mat-icon {
          font-size: 4rem;
          width: 4rem;
          height: 4rem;
        }
      }
      
      &--danger .dialog-icon mat-icon {
        color: #ef4444;
      }
      
      &--warning .dialog-icon mat-icon {
        color: #f59e0b;
      }
      
      &--info .dialog-icon mat-icon {
        color: #3b82f6;
      }
      
      .dialog-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #1e293b;
      }
      
      .dialog-content {
        margin: 1.5rem 0;
        color: #64748b;
        line-height: 1.6;
        font-size: 1rem;
        
        p {
          margin: 0;
        }
      }
      
      .dialog-actions {
        justify-content: center;
        gap: 1rem;
        padding: 1rem 0 0 0;
        
        button {
          min-width: 120px;
          padding: 0.5rem 1.5rem;
          font-weight: 500;
        }
        
        .cancel-btn {
          color: #64748b;
          
          &:hover {
            background-color: #f1f5f9;
          }
        }
        
        .confirm-btn {
          &.mat-warn {
            background-color: #ef4444;
            
            &:hover {
              background-color: #dc2626;
            }
          }
        }
      }
    }
    
    @media (max-width: 480px) {
      .confirm-dialog {
        min-width: unset;
        padding: 1rem;
        
        .dialog-icon mat-icon {
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
        }
        
        .dialog-title {
          font-size: 1.25rem;
        }
        
        .dialog-content {
          font-size: 0.95rem;
        }
        
        .dialog-actions {
          flex-direction: column;
          
          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  
  constructor() {
    const data = this.data;

    // Establecer valores por defecto
    this.data = {
      title: data.title || 'Confirmar acción',
      message: data.message || '¿Estás seguro de que deseas continuar?',
      confirmText: data.confirmText || 'Confirmar',
      cancelText: data.cancelText || 'Cancelar',
      type: data.type || 'info'
    };
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}