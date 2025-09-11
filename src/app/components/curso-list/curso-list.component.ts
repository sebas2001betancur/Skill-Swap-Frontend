// Componente completo actualizado - src/app/components/curso-list/curso-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Curso } from '../../models/curso';
import { CursoService } from '../../services/curso.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-curso-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './curso-list.component.html',
  styleUrls: ['./curso-list.component.scss']
})
export class CursoListComponent implements OnInit, OnDestroy {
  
  // Array simple para los cursos
  public cursos: Curso[] = [];
  public isLoading = true;
  public error: string | null = null;

  // Subject para gestionar la desuscripción y evitar fugas de memoria
  private destroy$ = new Subject<void>();

  constructor(
    private cursoService: CursoService,
    public authService: AuthService,
    private router: Router // ← AGREGADO: Router para navegación
  ) { }

  ngOnInit(): void {
    console.log('[CursoListComponent] ngOnInit ejecutado. Iniciando carga de cursos...');
    this.loadCursos();
  }

  /**
   * Carga la lista de cursos desde el servicio
   */
  loadCursos(): void {
    this.isLoading = true;
    this.error = null;

    this.cursoService.getCursos().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.cursos = data || []; // ← MEJORADO: Fallback para datos nulos
        this.isLoading = false;
        console.log('¡Cursos cargados exitosamente!', this.cursos);
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los cursos. Por favor, inténtalo más tarde.';
        this.isLoading = false;
        console.error('Error al cargar los cursos:', err);
      }
    });
  }

  /**
   * Método para optimizar el tracking en ngFor
   */
  trackByCurso(index: number, curso: Curso): string | number {
    return curso.id || index;
  }

  /**
   * Verifica si el usuario actual es el propietario del curso
   */
  isOwner(curso: Curso): boolean {
    const currentUser = this.authService.currentUserValue;
    return !!(currentUser && curso.creadorId && currentUser.id === curso.creadorId);
  }

  /**
   * Navega a la página de edición del curso
   */
  onEdit(id: string): void { 
    if (!id) {
      console.error('ID del curso no válido');
      return;
    }
    
    console.log('Editando curso:', id);
    this.router.navigate(['/curso/edit', id]).catch(err => {
      console.error('Error en la navegación:', err);
    });
  }

  /**
   * Elimina un curso después de confirmación del usuario
   */
  onDelete(id: string): void {
    if (!id) {
      console.error('ID del curso no válido');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      this.isLoading = true; // ← MEJORADO: Mostrar loading durante eliminación
      
      this.cursoService.deleteCurso(id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          console.log('Curso eliminado exitosamente. Recargando lista...');
          this.loadCursos(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar el curso:', err);
          this.error = 'No se pudo eliminar el curso. Por favor, inténtalo más tarde.';
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Maneja la compra de un curso
   */
  onComprar(id: string): void { 
    if (!id) {
      console.error('ID del curso no válido');
      return;
    }
    
    console.log('Comprando curso:', id);
    // TODO: Implementar lógica de compra
    this.router.navigate(['/curso/comprar', id]).catch(err => {
      console.error('Error en la navegación:', err);
      alert('Funcionalidad de compra no implementada aún');
    });
  }

  /**
   * Maneja el intercambio de un curso
   */
  onIntercambiar(id: string): void { 
    if (!id) {
      console.error('ID del curso no válido');
      return;
    }
    
    console.log('Intercambiando curso:', id);
    // TODO: Implementar lógica de intercambio
    this.router.navigate(['/curso/intercambiar', id]).catch(err => {
      console.error('Error en la navegación:', err);
      alert('Funcionalidad de intercambio no implementada aún');
    });
  }

  /**
   * Recarga la lista de cursos manualmente
   */
  onRefresh(): void {
    console.log('Refrescando lista de cursos...');
    this.loadCursos();
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this.error = null;
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.destroy$.next();
    this.destroy$.complete();
    console.log('[CursoListComponent] Componente destruido y suscripciones canceladas');
  }
}