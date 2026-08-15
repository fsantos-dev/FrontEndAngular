import { Component, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CategoriaStore } from '../../store/categoria.store';
import { DatePipe } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CategoryForm } from '../../components/category-form/category-form';
import { Categoria, CrearActualizarCategoria } from '../../models/categoria.model';
@Component({
  selector: 'app-categories-list-page',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DatePipe,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    CategoryForm,
  ],
  templateUrl: './categories-list.page.html',
  styleUrl: './categories-list.page.scss',
})
export class CategoriesListPage {
  private categoriaStore = inject(CategoriaStore);
  private confirmationService = inject(ConfirmationService);

  categories = this.categoriaStore.categories;
  loading = this.categoriaStore.loading;
  categorySelected = this.categoriaStore.categoriaSelected;

  showDialog = signal<boolean>(false);

  ngOnInit(): void {
    this.categoriaStore.loadAll();
  }

  newCategoryDialog() {
    this.categoriaStore.clearSelection();
    this.showDialog.set(true);
  }

  editCategoryDialog(category: Categoria){
    this.categoriaStore.select(category);
    this.showDialog.set(true);
  }

  saveCategory(category: CrearActualizarCategoria) {
    const selected = this.categorySelected();
    selected
      ? this.categoriaStore.update(selected.id, category)
      : this.categoriaStore.create(category);
      this.showDialog.set(false);
  }

  onCancel() {
    this.showDialog.set(false);
    this.categoriaStore.clearSelection();
  }

  deleteCategory(id: number){
    this.confirmationService.confirm({
      header:'Confirmar eliminación',
      message: `¿Estás seguro que deseas eliminar la categoria ${id}? Esta accion no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: ()=> {
        this.categoriaStore.delete(id);
      }
    });
  }
}
