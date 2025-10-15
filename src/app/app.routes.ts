import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CursoListComponent } from './components/curso-list/curso-list.component';
import { CursoFormComponent } from './components/curso-form/curso-form.component';
import { CursoPreviewComponent } from './pages/curso-preview/curso-preview.component';
import { ProponerIntercambioComponent } from './pages/proponer-intercambio/proponer-intercambio.component';
import { ComprarCursoComponent } from './pages/comprar-curso/comprar-curso.component';
// import { SubscribeComponent } from './pages/subscribe/subscribe.component';
import { authGuard } from './guards/auth.guard';
import { ConvertirMentorComponent } from './pages/convertir-mentor/convertir-mentor.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { mentorGuard } from './guards/mentor.guard';

export const routes: Routes = [
  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // { path: 'subscribe', component: SubscribeComponent, canActivate: [authGuard] },
  
  // Cursos - ORDEN IMPORTANTE
   { path: 'cursos/preview/:id', component: CursoPreviewComponent },
   { path: 'cursos/intercambiar/:id', component: ProponerIntercambioComponent, canActivate: [authGuard] },
   { path: 'curso/nuevo', component: CursoFormComponent, canActivate: [authGuard, mentorGuard] },
   { path: 'curso/editar/:id', component: CursoFormComponent, canActivate: [authGuard] },
   { path: 'curso/comprar/:id', component: ComprarCursoComponent, canActivate: [authGuard] },
   { path: 'cursos', component: CursoListComponent },
  
  // Perfil
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'convertir-mentor', component: ConvertirMentorComponent, canActivate: [authGuard] },
  
  // Mentor
  {
    path: 'editar-perfil-mentor',
    loadComponent: () => import('./pages/editar-perfil-mentor/editar-perfil-mentor.component')
      .then(m => m.EditarPerfilMentorComponent),
    canActivate: [authGuard]
  },
  
  // ✅ TUTORÍAS - CORREGIDO
   {
     path: 'crear-tutoria',
     loadComponent: () => import('./components/crear-tutoria/crear-tutoria.component')
       .then(m => m.CrearTutoriaComponent),
     canActivate: [authGuard] // Quitar mentorGuard, verificar dentro del componente
   },
  {
    path: 'buscar-tutorias',
    loadComponent: () => import('./pages/buscar-tutorias/buscar-tutorias.component')
      .then(m => m.BuscarTutoriasComponent),
    canActivate: [authGuard]
  },
   {
     path: 'tutorias/:id',
     loadComponent: () => import('./pages/detalle-tutoria/detalle-tutoria.component')
       .then(m => m.DetalleTutoriaComponent),
     canActivate: [authGuard],
     children: [
       {
         path: 'solicitudes',
         loadComponent: () => import('./pages/solicitudes-tutoria/solicitudes-tutoria.component')
           .then(m => m.SolicitudesTutoriaComponent),
         canActivate: [authGuard]
       },
       {
         path: 'calificaciones',
         loadComponent: () => import('./pages/calificaciones-tutoria/calificaciones-tutoria.component')
           .then(m => m.CalificacionesTutoriaComponent),
         canActivate: [authGuard]
       }
     ]
   },
  {
    path: 'solicitar-tutoria/:id',
    loadComponent: () => import('./pages/solicitar-tutoria/solicitar-tutoria.component')
      .then(m => m.SolicitarTutoriaComponent),
    canActivate: [authGuard]
  },
   {
     path: 'mis-tutorias',
     loadComponent: () => import('./pages/mis-tutorias/mis-tutorias.component')
       .then(m => m.MisTutoriasComponent),
     canActivate: [authGuard, mentorGuard]
   },
   {
     path: 'gestionar-solicitudes',
     loadComponent: () => import('./pages/gestionar-solicitudes/gestionar-solicitudes.component')
       .then(m => m.GestionarSolicitudesComponent),
     canActivate: [authGuard, mentorGuard]
   },
   {
     path: 'perfil-mentor/:id',
     loadComponent: () => import('./pages/perfil-publico-mentor/perfil-publico-mentor.component')
       .then(m => m.PerfilPublicoMentorComponent),
     canActivate: [authGuard]
   },
   {
     path: 'mis-solicitudes',
     loadComponent: () => import('./pages/mis-solicitudes/mis-solicitudes.component')
       .then(m => m.MisSolicitudesComponent),
     canActivate: [authGuard]
   },
   {
     path: 'mis-intercambios',
     loadComponent: () => import('./pages/mis-intercambios/mis-intercambios.component')
       .then(m => m.MisIntercambiosComponent),
     canActivate: [authGuard]
   },
   {
     path: 'mis-cursos-comprados',
     loadComponent: () => import('./pages/mis-cursos-comprados/mis-cursos-comprados.component')
       .then(m => m.MisCursosCompradosComponent),
     canActivate: [authGuard]
   },

  // Redirects
  { path: '', redirectTo: '/cursos', pathMatch: 'full' },
  { path: '**', redirectTo: '/cursos' }
];