// curso-preview.component.ts - VERSIÓN COMPLETA CON DEBUG
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { CursoService } from '../../services/curso.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { CursoPreviewDto } from '../../models/CursoPreviewDto';

@Component({
  selector: 'app-curso-preview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './curso-preview.component.html',
  styleUrl: './curso-preview.component.scss'
})
export class CursoPreviewComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cursoService = inject(CursoService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  public curso = signal<CursoPreviewDto | null>(null);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    console.log('%c[PREVIEW] Componente iniciado', 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;');
    console.log('URL actual:', window.location.href);
    console.log('Params completos:', this.route.snapshot.params);
    console.log('ParamMap:', this.route.snapshot.paramMap);
    
    const cursoId = this.route.snapshot.paramMap.get('id');
    console.log('ID extraído:', cursoId);
    
    if (cursoId) {
      this.loadCursoPreview(cursoId);
    } else {
      console.error('%c[PREVIEW ERROR] No se encontró ID', 'background: #f44336; color: white; padding: 2px 5px;');
      this.error.set('No se encontró un ID de curso en la URL.');
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    console.log('[PREVIEW] Componente destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCursoPreview(id: string): void {
    console.log(`%c[PREVIEW] Cargando curso ID: ${id}`, 'background: #2196F3; color: white; padding: 2px 5px;');
    
    this.cursoService.getCursoPreview(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        console.log('[PREVIEW] Petición finalizada (finalize)');
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (data) => {
        console.log('%c[PREVIEW SUCCESS] Datos recibidos', 'background: #4CAF50; color: white; padding: 2px 5px;');
        console.table({
          'ID': data.id,
          'Nombre': data.nombre,
          'Creador': data.creadorNombre,
          'Precio': data.precio,
          'Categoría': data.categoria,
          'Nivel': data.nivel,
          'Duración': data.duracionHoras + 'h',
          'Artículos': data.numeroArticulos,
          'Lecciones': data.numeroLecciones
        });
        console.log('Puntos clave:', data.puntosClave);
        console.log('Curriculum:', data.curriculumPreview);
        console.log('ImageUrl:', data.imageUrl);
        this.curso.set(data);
      },
      error: (err) => {
        console.error('%c[PREVIEW ERROR]', 'background: #f44336; color: white; padding: 2px 5px;');
        console.error('Error completo:', err);
        console.error('Status code:', err.status);
        console.error('Status text:', err.statusText);
        console.error('Message:', err.message);
        console.error('Error body:', err.error);
        
        let errorMsg = 'No se pudo cargar el curso';
        
        if (err.status === 404) {
          errorMsg = 'Curso no encontrado';
        } else if (err.status === 0) {
          errorMsg = 'Sin conexión al servidor';
        } else if (err.status === 500) {
          errorMsg = 'Error del servidor';
        }
        
        this.error.set(errorMsg);
        this.notificationService?.showError(errorMsg);
      }
    });
  }

  // Métodos para acciones de usuario
  comprarCurso(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const curso = this.curso();
    if (!curso) return;

    // TODO: Implementar integración con sistema de pagos
    this.notificationService.showInfo('Funcionalidad de compra próximamente disponible');
  }

  proponerIntercambio(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const curso = this.curso();
    if (!curso) return;

    // Redirigir a la página de proponer intercambio
    this.router.navigate(['/cursos/intercambiar', curso.id]);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isOwner(): boolean {
    const curso = this.curso();
    const currentUser = this.authService.getCurrentUser();
    return !!(currentUser && curso && currentUser.id === curso.creadorId);
  }
}
