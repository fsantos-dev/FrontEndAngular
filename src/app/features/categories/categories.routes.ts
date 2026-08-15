// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { CategoriesListPage } from './pages/categories-list/categories-list.page';
import { CategoryFormPage } from './pages/category-form/category-form.page';


export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    component: CategoriesListPage,
  },
   {
    path: 'new',
    component: CategoryFormPage,
  },
];
