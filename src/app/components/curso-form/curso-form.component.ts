// curso-form.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Services
import { CursoService, CreateCursoPayload } from '../../services/curso.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-curso-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './curso-form.component.html',
  styleUrls: ['./curso-form.component.scss']
})
export class CursoFormComponent implements OnInit, OnDestroy {
  
  private readonly fb = inject(FormBuilder);
  private readonly cursoService = inject(CursoService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  cursoForm!: FormGroup;
  
  isEditMode = signal(false);
  isSubmitting = signal(false);
  isUploadingImage = signal(false);
  error = signal<string | null>(null);

  // Imagen de portada
  selectedFile: File | null = null;
  imagePreview: SafeUrl | string = '';
  uploadedImageUrl = '';

  // Galería de imágenes
  selectedGalleryFiles: File[] = [];
  galleryPreviews: (SafeUrl | string)[] = [];
  uploadedGalleryUrls: string[] = [];

  // Video de presentación
  selectedVideoPreview: File | null = null;
  videoPreview: SafeUrl | string = '';
  uploadedVideoPreviewUrl = '';

  // Videos adicionales
  selectedAdditionalVideos: File[] = [];
  additionalVideoPreviews: (SafeUrl | string)[] = [];
  uploadedAdditionalVideoUrls: string[] = [];

  maxFileSize = 5 * 1024 * 1024; // 5MB para imágenes
  maxVideoSize = 250 * 1024 * 1024; // 250MB para videos
  allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];

  categorias = ['Programación', 'Diseño', 'Marketing', 'Negocios', 'Música', 'Idiomas', 'Desarrollo Personal', 'Salud y Fitness', 'Fotografía', 'Otro'];
  niveles = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];

  puntosClave: string[] = [];
  nuevoPunto = '';

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.cursoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(900)]],
      descripcionLarga: ['', [Validators.minLength(100), Validators.maxLength(2000)]],
      categoria: ['', Validators.required],
      nivel: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracionHoras: [5, [Validators.min(1)]],
      numeroArticulos: [12, [Validators.min(0)]],
      numeroLecciones: [20, [Validators.min(1)]]
    });
  }

  agregarPuntoClave(): void {
    const punto = this.nuevoPunto.trim();
    if (punto && this.puntosClave.length < 10) {
      this.puntosClave.push(punto);
      this.nuevoPunto = '';
    }
  }

  eliminarPuntoClave(index: number): void {
    this.puntosClave.splice(index, 1);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!this.allowedImageTypes.includes(file.type)) {
      this.notificationService.showError('Solo se permiten imágenes (JPG, PNG, WebP, GIF)');
      input.value = '';
      return;
    }

    if (file.size > this.maxFileSize) {
      this.notificationService.showError('La imagen no debe superar 5MB');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.generateImagePreview(file);
  }

  onGalleryFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    for (const file of Array.from(input.files)) {

      if (!this.allowedImageTypes.includes(file.type)) {
        this.notificationService.showError(`Archivo ${file.name} no es una imagen válida`);
        continue;
      }

      if (file.size > this.maxFileSize) {
        this.notificationService.showError(`Archivo ${file.name} excede el límite de 5MB`);
        continue;
      }

      this.selectedGalleryFiles.push(file);
      this.generateGalleryPreview(file);
    }
  }

  onVideoPreviewSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!this.allowedVideoTypes.includes(file.type)) {
      this.notificationService.showError('Solo se permiten videos (MP4, MOV, AVI, WebM)');
      input.value = '';
      return;
    }

    if (file.size > this.maxVideoSize) {
      this.notificationService.showError('El video no debe superar 250MB');
      input.value = '';
      return;
    }

    this.selectedVideoPreview = file;
    this.generateVideoPreview(file);
  }

  onAdditionalVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    for (const file of Array.from(input.files)) {

      if (!this.allowedVideoTypes.includes(file.type)) {
        this.notificationService.showError(`Archivo ${file.name} no es un video válido`);
        continue;
      }

      if (file.size > this.maxVideoSize) {
        this.notificationService.showError(`Archivo ${file.name} excede el límite de 250MB`);
        continue;
      }

      this.selectedAdditionalVideos.push(file);
      this.generateAdditionalVideoPreview(file);
    }
  }

  private generateImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.imagePreview = e.target.result as string;
      }
    };
    reader.onerror = () => {
      this.notificationService.showError('Error al leer el archivo');
      this.removeImage();
    };
    reader.readAsDataURL(file);
  }

  private generateGalleryPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.galleryPreviews.push(e.target.result as string);
      }
    };
    reader.onerror = () => {
      this.notificationService.showError('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
  }

  private generateVideoPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.videoPreview = e.target.result as string;
      }
    };
    reader.onerror = () => {
      this.notificationService.showError('Error al leer el archivo');
      this.removeVideoPreview();
    };
    reader.readAsDataURL(file);
  }

  private generateAdditionalVideoPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.additionalVideoPreviews.push(e.target.result as string);
      }
    };
    reader.onerror = () => {
      this.notificationService.showError('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = '';
    this.uploadedImageUrl = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  removeGalleryImage(index: number): void {
    this.selectedGalleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
    this.uploadedGalleryUrls.splice(index, 1);
  }

  removeVideoPreview(): void {
    this.selectedVideoPreview = null;
    this.videoPreview = '';
    this.uploadedVideoPreviewUrl = '';
    const fileInput = document.getElementById('videoPreviewInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  removeAdditionalVideo(index: number): void {
    this.selectedAdditionalVideos.splice(index, 1);
    this.additionalVideoPreviews.splice(index, 1);
    this.uploadedAdditionalVideoUrls.splice(index, 1);
  }

  triggerFileInput(): void {
    document.getElementById('fileInput')?.click();
  }

  triggerGalleryFileInput(): void {
    document.getElementById('galleryFileInput')?.click();
  }

  triggerVideoPreviewInput(): void {
    document.getElementById('videoPreviewInput')?.click();
  }

  triggerAdditionalVideoInput(): void {
    document.getElementById('additionalVideoInput')?.click();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async onSubmit(): Promise<void> {
    if (this.cursoForm.invalid) {
      this.markFormGroupTouched(this.cursoForm);
      this.notificationService.showWarning('Completa todos los campos');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.notificationService.showError('Debes iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }

    if (this.puntosClave.length < 3) {
      this.notificationService.showError('Agrega al menos 3 puntos clave');
      return;
    }

    await this.createCurso();
  }

  private async createCurso(): Promise<void> {
    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      if (this.selectedFile) {
        this.isUploadingImage.set(true);
        await this.uploadImage(this.selectedFile);
        this.isUploadingImage.set(false);
      }

      if (this.selectedGalleryFiles.length > 0) {
        this.isUploadingImage.set(true);
        await this.uploadGalleryImages(this.selectedGalleryFiles);
        this.isUploadingImage.set(false);
      }

      if (this.selectedVideoPreview) {
        this.isUploadingImage.set(true);
        await this.uploadVideoPreview(this.selectedVideoPreview);
        this.isUploadingImage.set(false);
      }

      if (this.selectedAdditionalVideos.length > 0) {
        this.isUploadingImage.set(true);
        await this.uploadAdditionalVideos(this.selectedAdditionalVideos);
        this.isUploadingImage.set(false);
      }

      const cursoData = this.buildCreatePayload();

      this.cursoService.createCurso(cursoData).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false))
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('¡Curso creado exitosamente!');
          this.router.navigate(['/cursos']);
        },
        error: (error) => {
          this.handleSubmitError(error);
        }
      });
    } catch (e: unknown) {
      this.isSubmitting.set(false);
      this.isUploadingImage.set(false);
      const errorMessage = e instanceof Error ? e.message : 'Error al procesar';
      this.notificationService.showError(errorMessage);
    }
  }

  private async uploadImage(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.cursoService.uploadImage(formData).toPromise();
    if (!response?.url) throw new Error('Respuesta inválida del servidor');
    this.uploadedImageUrl = response.url;
  }

  private async uploadGalleryImages(files: File[]): Promise<void> {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await this.cursoService.uploadImage(formData).toPromise();
      if (!response?.url) throw new Error('Respuesta inválida del servidor');
      this.uploadedGalleryUrls.push(response.url);
    }
  }

  private async uploadVideoPreview(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.cursoService.uploadVideo(formData).toPromise();
    if (!response?.url) throw new Error('Respuesta inválida del servidor');
    this.uploadedVideoPreviewUrl = response.url;
  }

  private async uploadAdditionalVideos(files: File[]): Promise<void> {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await this.cursoService.uploadVideo(formData).toPromise();
      if (!response?.url) throw new Error('Respuesta inválida del servidor');
      this.uploadedAdditionalVideoUrls.push(response.url);
    }
  }

private buildCreatePayload(): CreateCursoPayload {
  const formValue = this.cursoForm.value;
  return {
    nombre: formValue.nombre.trim(),
    descripcion: formValue.descripcion.trim(),
    descripcionLarga: formValue.descripcionLarga?.trim() || formValue.descripcion.trim(),
    categoria: formValue.categoria,
    nivel: formValue.nivel,
    precio: Number(formValue.precio) || 0,
    imagenPrincipal: this.uploadedImageUrl || undefined,  // ← CAMBIAR aquí
    imagenesGaleria: this.uploadedGalleryUrls.length > 0 ? this.uploadedGalleryUrls : undefined,
    videoPreviewUrl: this.uploadedVideoPreviewUrl || undefined,
    videosAdicionales: this.uploadedAdditionalVideoUrls.length > 0 ? this.uploadedAdditionalVideoUrls : undefined,
    puntosClave: this.puntosClave,
    duracionHoras: formValue.duracionHoras || 5,
    numeroArticulos: formValue.numeroArticulos || 12,
    numeroLecciones: formValue.numeroLecciones || 20
  };
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  showError(fieldName: string): boolean {
    const field = this.cursoForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cursoForm.get(fieldName);
    if (!field?.errors) return '';
    const errors = field.errors;
    if (errors['required']) return 'Campo obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Mínimo ${errors['min'].min}`;
    return 'Campo inválido';
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    let errorMessage = 'No se pudo crear el curso';
    if (error.status === 0) errorMessage = 'Sin conexión al servidor';
    else if (error.status === 401) {
      errorMessage = 'Sesión expirada';
      this.router.navigate(['/login']);
    }
    else if (error.status >= 500) errorMessage = 'Error del servidor';
    this.error.set(errorMessage);
    this.notificationService.showError(errorMessage);
  }

  onCancel(): void {
    this.router.navigate(['/cursos']);
  }
}