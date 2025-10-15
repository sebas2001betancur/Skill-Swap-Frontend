// src/app/pages/buscar-tutorias/buscar-tutorias.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

// Services
import { TutoriaService } from '../../services/tutoria.service';
import { NotificationService } from '../../services/notification.service';
import { BuscarTutoriasQuery, ModalidadTutoria, NivelTutoria, Tutoria } from '../../models/tutoria';

@Component({
  selector: 'app-buscar-tutorias',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
  ],
  templateUrl: './buscar-tutorias.component.html',
  styleUrls: ['./buscar-tutorias.component.scss']
})
export class BuscarTutoriasComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly tutoriaService = inject(TutoriaService);
  private readonly notificationService = inject(NotificationService);

  searchForm!: FormGroup;

  tutorias: Tutoria[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 8; // Cambiar a 8 para mejor diseño
  currentPage = 0;

  // Opciones para filtros
  materiasDisponibles: string[] = [
    'Programación Orientada a Objetos',
    'Estructuras de Datos',
    'Bases de Datos',
    'Desarrollo Web',
    'Algoritmos',
    'Redes de Computadores',
    'Ingeniería de Software',
    'Arquitectura de Software',
    'Inteligencia Artificial',
    'Sistemas Operativos',
    'Matemáticas Discretas',
    'Cálculo',
    'Física',
    'Estadística',
    'Matemáticas',
    'Química',
    'Biología',
    'Historia',
    'Geografía',
    'Literatura',
    'Inglés',
    'Diseño',
    'Música',
    'Arte'
  ];
  niveles = Object.values(NivelTutoria);
  modalidades = Object.values(ModalidadTutoria);

  ngOnInit(): void {
    this.initializeForm();
    this.loadTutorias(); // Cargar tutorías inicialmente
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      busqueda: [''],
      materia: [''],
      nivel: [''],
      modalidad: [''],
      fecha: ['']
    });
  }

  onSearch(): void {
    console.log('🔍 Iniciando búsqueda con filtros:', this.searchForm.value);
    this.currentPage = 0;
    this.loadTutorias();
  }

  onClearFilters(): void {
    console.log('🧹 Limpiando filtros');
    this.searchForm.reset();
    this.currentPage = 0;
    this.loadTutorias();
  }

  onPageChange(event: PageEvent): void {
    console.log('📄 Cambio de página:', event);
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTutorias();
  }

  hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return !!(formValue.busqueda || formValue.materia || formValue.nivel || formValue.modalidad || formValue.fecha);
  }

  getActiveFiltersSummary(): string {
    const formValue = this.searchForm.value;
    const filters: string[] = [];

    if (formValue.busqueda) filters.push(`"${formValue.busqueda}"`);
    if (formValue.materia) filters.push(`Materia: ${formValue.materia}`);
    if (formValue.nivel) filters.push(`Nivel: ${formValue.nivel}`);
    if (formValue.modalidad) filters.push(`Modalidad: ${formValue.modalidad}`);
    if (formValue.fecha) filters.push(`Fecha: ${new Date(formValue.fecha).toLocaleDateString()}`);

    return filters.join(', ');
  }

  getActiveFiltersCount(): number {
    const formValue = this.searchForm.value;
    let count = 0;

    if (formValue.busqueda) count++;
    if (formValue.materia) count++;
    if (formValue.nivel) count++;
    if (formValue.modalidad) count++;
    if (formValue.fecha) count++;

    return count;
  }

  getActiveFiltersList(): string[] {
    const formValue = this.searchForm.value;
    const filters: string[] = [];

    if (formValue.busqueda) filters.push(`"${formValue.busqueda}"`);
    if (formValue.materia) filters.push(`Materia: ${formValue.materia}`);
    if (formValue.nivel) filters.push(`Nivel: ${formValue.nivel}`);
    if (formValue.modalidad) filters.push(`Modalidad: ${formValue.modalidad}`);
    if (formValue.fecha) filters.push(`Fecha: ${new Date(formValue.fecha).toLocaleDateString()}`);

    return filters;
  }

  private loadTutorias(): void {
    console.log('📡 Cargando tutorías...');
    this.isLoading = true;

    const query: BuscarTutoriasQuery = {
      ...this.searchForm.value,
      pagina: this.currentPage + 1, // Backend usa 1-based
      tamanoPagina: this.pageSize
    };

    // Limpiar valores vacíos
    Object.keys(query).forEach(key => {
      if (query[key as keyof BuscarTutoriasQuery] === '' || query[key as keyof BuscarTutoriasQuery] === null) {
        delete query[key as keyof BuscarTutoriasQuery];
      }
    });

    console.log('📤 Query de búsqueda:', query);

    this.tutoriaService.buscarTutorias(query).subscribe({
      next: (result) => {
        console.log('✅ Resultado de búsqueda:', result);
        this.tutorias = result.tutorias || [];
        this.totalItems = result.total || 0;
        this.isLoading = false;

        if (this.tutorias.length === 0) {
          this.notificationService.showInfo('No se encontraron tutorías con los filtros seleccionados');
        }
      },
      error: (error) => {
        console.error('❌ Error al buscar tutorías:', error);
        
        // Mostrar mensaje de error más amigable
        if (error.status === 500) {
          this.notificationService.showError('Error en el servidor. Por favor, intenta más tarde.');
        } else if (error.status === 404) {
          this.notificationService.showError('Endpoint no encontrado. Verifica la configuración del servidor.');
        } else {
          this.notificationService.showError('Error al cargar las tutorías');
        }
        
        this.tutorias = [];
        this.totalItems = 0;
        this.isLoading = false;
      }
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'disponible': return 'text-green-600';
      case 'llena':
      case 'completa': return 'text-yellow-600';
      case 'completada':
      case 'finalizada': return 'text-blue-600';
      case 'cancelada': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getModalidadIcon(modalidad: string): string {
    switch (modalidad?.toLowerCase()) {
      case 'virtual': return 'videocam';
      case 'presencial': return 'location_on';
      case 'hibrida':
      case 'híbrida': return 'swap_horiz';
      default: return 'help';
    }
  }

  formatFecha(fecha: string | Date): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
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

  trackByTutoriaId(index: number, tutoria: Tutoria): string {
    return tutoria.id;
  }

  getEstadoIcon(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return 'event_available';
      case 'completa':
      case 'llena':
        return 'event_busy';
      case 'cancelada':
        return 'cancel';
      case 'finalizada':
      case 'completada':
        return 'check_circle';
      case 'encurso':
        return 'schedule';
      default:
        return 'help';
    }
  }
}