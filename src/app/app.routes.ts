// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { publicGuard } from './core/guards/public.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: 'categories', 
    canActivate: [authGuard],
    component: MainLayout,
    children: [
      {
        path:'',
        loadChildren : () => import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
      }
    ]
  },
    {
    path: '**',
    redirectTo: 'categories'
  }
  // ... otras rutas
];
