// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { CategoriesListPage } from './pages/categories-list/categories-list.page';


export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    component: CategoriesListPage,
  },
];
