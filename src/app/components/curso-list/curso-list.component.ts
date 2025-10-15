// curso-list.component.ts - Versión mejorada
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, catchError, finalize, of } from 'rxjs';
import { Curso } from '../../models/curso';
import { CursoService } from '../../services/curso.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginPromptModalComponent } from '../login-prompt-modal/login-prompt-modal.component';
import { CursoCardPublicComponent } from '../curso-card-public/curso-card-public.component';
import { CursoCardPrivateComponent } from '../curso-card-private/curso-card-private.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';



// Enum para estados de la UI
enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

@Component({
  selector: 'app-curso-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    CursoCardPublicComponent,
    CursoCardPrivateComponent
  ],
  templateUrl: './curso-list.component.html',
  styleUrls: ['./curso-list.component.scss']
})
export class CursoListComponent implements OnInit, OnDestroy {
  
  // ==================== Dependency Injection (Moderno) ====================
  private readonly cursoService = inject(CursoService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  
  // ==================== Signals (Angular 16+) ====================
  cursos = signal<Curso[]>([]);
  loadingState = signal<LoadingState>(LoadingState.IDLE);
  errorMessage = signal<string | null>(null);
  
  // Computed signals
  isLoading = computed(() => this.loadingState() === LoadingState.LOADING);
  hasError = computed(() => this.loadingState() === LoadingState.ERROR);
  isEmpty = computed(() => this.cursos().length === 0 && !this.isLoading());
  cursosCount = computed(() => this.cursos().length);
  
  // Observable para el estado de autenticación
  authState$ = this.authService.authState$;
  
  // Subject para cleanup
  private readonly destroy$ = new Subject<void>();

  // ==================== Lifecycle Hooks ====================
  ngOnInit(): void {
    this.loadCursos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== Data Loading ====================
  loadCursos(): void {
    this.loadingState.set(LoadingState.LOADING);
    this.errorMessage.set(null);

    this.cursoService.getCursos().pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        console.error('[CursoList] Error al cargar cursos:', error);
        this.handleLoadError(error);
        return of([]); // Retorna array vacío en caso de error
      }),
      finalize(() => {
        // Se ejecuta siempre, haya error o no
        if (this.loadingState() === LoadingState.LOADING) {
          this.loadingState.set(LoadingState.SUCCESS);
        }
      })
    ).subscribe({
      next: (cursos) => {
        this.cursos.set(cursos || []);
        this.showSuccessMessage(`${cursos.length} cursos cargados`);
      }
    });
  }

  private handleLoadError(error: HttpErrorResponse): void {
    this.loadingState.set(LoadingState.ERROR);
    
    const errorMsg = this.getErrorMessage(error);
    this.errorMessage.set(errorMsg);
    
    this.showErrorMessage(errorMsg);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error?.status === 0) {
      return 'No se pudo conectar al servidor. Verifica tu conexión.';
    }
    if (error?.status === 401) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }
    if (error?.status >= 500) {
      return 'Error del servidor. Inténtalo más tarde.';
    }
    return error?.message || 'Error desconocido al cargar los cursos.';
  }

  // ==================== User Actions ====================
  onEdit(id: string): void {
    const validation = this.validateCursoAction(id, 'editar');
    if (!validation.valid) {
      this.handleValidationError(validation.message!);
      return;
    }

    this.router.navigate(['/curso/edit', id]);
  }

  onDelete(id: string): void {
    const validation = this.validateCursoAction(id, 'eliminar');
    if (!validation.valid) {
      this.handleValidationError(validation.message!);
      return;
    }

    this.confirmDelete(id);
  }

  onComprar(id: string): void {
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin(`/curso/${id}`);
      return;
    }

    const curso = this.findCurso(id);
    if (!curso) return;

    if (this.isOwner(curso)) {
      this.showWarningMessage('No puedes comprar tu propio curso');
      return;
    }

    this.router.navigate(['/curso/comprar', id]);
  }

  onIntercambiar(id: string): void {
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin(`/curso/intercambiar/${id}`);
      return;
    }

    const curso = this.findCurso(id);
    if (!curso) return;

    if (this.isOwner(curso)) {
      this.showWarningMessage('No puedes intercambiar tu propio curso');
      return;
    }

    this.router.navigate(['/curso/intercambiar', id]);
  }

  onRefresh(): void {
    this.loadCursos();
  }

  onExchange(cursoId: string): void {
    // Navega a la página para proponer el intercambio
    this.router.navigate(['/cursos/intercambiar', cursoId]);
  }

  openLoginPrompt(): void {
    this.dialog.open(LoginPromptModalComponent, {
      width: '450px',
      panelClass: 'login-prompt-dialog',
      disableClose: false,
      autoFocus: true
    });
  }

  // ==================== Validations ====================
  private validateCursoAction(id: string, action: string): { valid: boolean; message?: string } {
    if (!id) {
      return { valid: false, message: 'ID del curso no válido' };
    }

    if (!this.authService.isAuthenticated()) {
      return { valid: false, message: 'Debes iniciar sesión para continuar' };
    }

    const curso = this.findCurso(id);
    if (!curso) {
      return { valid: false, message: 'Curso no encontrado' };
    }

    if (!this.isOwner(curso)) {
      return { valid: false, message: `No tienes permisos para ${action} este curso` };
    }

    return { valid: true };
  }

  private handleValidationError(message: string): void {
    if (message.includes('iniciar sesión')) {
      this.redirectToLogin();
    } else {
      this.showErrorMessage(message);
    }
  }

  // ==================== Delete Confirmation ====================
  private confirmDelete(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.executeDeletion(id);
      }
    });
  }

  private executeDeletion(id: string): void {
    this.loadingState.set(LoadingState.LOADING);

    this.cursoService.deleteCurso(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingState.set(LoadingState.SUCCESS))
    ).subscribe({
      next: () => {
        // Actualización optimista del estado
        this.cursos.update(cursos => cursos.filter(c => c.id !== id));
        this.showSuccessMessage('Curso eliminado exitosamente');
      },
      error: (error) => {
        console.error('[CursoList] Error al eliminar curso:', error);
        this.showErrorMessage('No se pudo eliminar el curso. Inténtalo nuevamente.');
        // Recargar la lista en caso de error
        this.loadCursos();
      }
    });
  }

  // ==================== Helper Methods ====================
  isOwner(curso: Curso): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!(currentUser && curso.creadorId && currentUser.id === curso.creadorId);
  }

  private findCurso(id: string): Curso | undefined {
    return this.cursos().find(c => c.id === id);
  }

  private redirectToLogin(returnUrl?: string): void {
    const queryParams = returnUrl ? { returnUrl } : {};
    this.router.navigate(['/login'], { queryParams });
  }

  trackByCurso(index: number, curso: Curso): string | number {
    return curso.id || index;
  }

  // ==================== Notifications ====================
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  private showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }
}