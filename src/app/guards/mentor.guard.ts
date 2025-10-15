// src/app/guards/mentor.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const mentorGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  console.log('🔒 MentorGuard verificando usuario:', user);

  // ✅ CORRECCIÓN: Verificar esMentor o rol
  const isMentor = user?.esMentor || user?.rol === 'Mentor' || user?.rol === 'Admin';

  console.log('✅ isMentor:', isMentor);

  if (!isMentor) {
    console.log('❌ No es mentor, redirigiendo a convertir-mentor');
    router.navigate(['/convertir-mentor']); // Redirigir a convertir-mentor
    return false;
  }



  return true;
};