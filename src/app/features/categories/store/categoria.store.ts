import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Categoria, CrearActualizarCategoria } from '../models/categoria.model';
import { CategoriaService } from '../services/categoria.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class CategoriaStore {
  private destroyRef = inject(DestroyRef);

  private readonly categoriaService = inject(CategoriaService);
  private readonly messageService = inject(MessageService);

  //1. Estados privados solo el store debe tener acceso a el
  private readonly categoriasSignal = signal<Categoria[]>([]);
  private readonly categoriaSelectedSignal = signal<Categoria | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly successSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  //2. Selectores publicos
  readonly categories = this.categoriasSignal.asReadonly();
  readonly categoriaSelected = this.categoriaSelectedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly success = this.successSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly total = computed(() => this.categoriasSignal().length);

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.categoriaService
      .getAll()
      .pipe(
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.categoriasSignal.set(response);
        },
        error: (err) => {
          this.errorSignal.set(err.message || 'Error al cargar categorías');
        },
      });
  }

  create(categoria: CrearActualizarCategoria): void {
    this.loadingSignal.set(true);
    this.successSignal.set(false);
    this.errorSignal.set(null);

    this.categoriaService
      .create(categoria)
      .pipe(
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (newCategory) => {
          this.categoriasSignal.update((list) => [...list, newCategory]);
          this.successSignal.set(true);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Categoria ${newCategory.id} creada.`,
          });
        },
        error: (err: HttpErrorResponse) => {
          this.errorSignal.set(this.extractError(err, 'Error al cargar categorías'));
        },
      });
  }

  update(id: number, categoria: CrearActualizarCategoria): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.categoriaService
      .update(id, categoria)
      .pipe(
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.categoriasSignal.update((list) => list.map((c) => (c.id == id ? updated : c)));
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Categoria ${updated.id} actualizada.`,
          });
          // Si la categoría editada es la seleccionada, sincronizamos también la selección
          if (this.categoriaSelectedSignal()?.id === id) {
            this.categoriaSelectedSignal.set(updated);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.errorSignal.set(this.extractError(err, 'Error al cargar categorías'));
        },
      });
  }

  delete(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.categoriaService
      .delete(id)
      .pipe(
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.categoriasSignal.update((list) => list.filter((c) => c.id !== id));
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Categoria ${id} eliminada.`,
          });
          //Evitar dejar seleccionada una categoria si no existe{
          if (this.categoriaSelectedSignal()?.id === id) {
            this.categoriaSelectedSignal.set(null);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.errorSignal.set(this.extractError(err, 'Error al cargar categorías'));
        },
      });
  }

  select(categoria: Categoria): void {
    this.categoriaSelectedSignal.set(categoria);
  }

  clearSelection(): void {
    this.categoriaSelectedSignal.set(null);
  }

  private extractError(err: HttpErrorResponse, fallback: string): string {
    return err?.error ?? fallback;
  }
}
