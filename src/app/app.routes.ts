// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '', 
    component: MainLayout,
    children: [
      {
        path:'categories',
        loadChildren : () => import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
      }
    ]
  },
  // ... otras rutas
];
