import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MessageService } from 'primeng/api';

import { CategoriaStore } from './categoria.store';
import { CategoriaService } from '../services/categoria.service';
import { Categoria, CrearActualizarCategoria } from '../models/categoria.model';

describe('CategoriaStore', () => {
  let store: CategoriaStore;
  let categoriaService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let messageService: {
    add: ReturnType<typeof vi.fn>;
  };

  const categories: Categoria[] = [
    {
      id: 1,
      name: 'Hogar',
      description: 'Productos para el hogar',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Tecnología',
      description: 'Productos tecnológicos',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const categoryToCreate: CrearActualizarCategoria = {
    name: 'Deportes',
    description: 'Productos deportivos',
  };

  beforeEach(() => {
    categoriaService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    messageService = {
      add: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoriaStore,
        {
          provide: CategoriaService,
          useValue: categoriaService,
        },
        {
          provide: MessageService,
          useValue: messageService,
        },
      ],
    });

    store = TestBed.inject(CategoriaStore);
  });

  it('should load all categories successfully', () => {
    // Arrange
    categoriaService.getAll.mockReturnValue(of(categories));

    // Act
    store.loadAll();

    // Assert
    expect(store.categories()).toEqual(categories);
    expect(store.total()).toBe(2);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set error when loading categories fails', () => {
    // Arrange
    const error = new Error('Error al cargar categorías');

    categoriaService.getAll.mockReturnValue(throwError(() => error));

    // Act
    store.loadAll();

    // Assert
    expect(store.error()).toBe('Error al cargar categorías');
    expect(store.loading()).toBe(false);
  });

  it('should create a category successfully', () => {
    // Arrange
    const newCategory: Categoria = {
      id: 3,
      ...categoryToCreate,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    categoriaService.create.mockReturnValue(of(newCategory));

    // Act
    store.create(categoryToCreate);

    // Assert
    expect(store.categories()).toEqual([newCategory]);
    expect(store.total()).toBe(1);
    expect(store.success()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();

    expect(messageService.add).toHaveBeenCalledOnce();
  });

  it('should set error when creating a category fails', () => {
    // Arrange
    const error = new HttpErrorResponse({
      error: 'No se pudo crear la categoría',
      status: 400,
    });

    categoriaService.create.mockReturnValue(throwError(() => error));

    // Act
    store.create(categoryToCreate);

    // Assert
    expect(store.error()).toBe('No se pudo crear la categoría');
    expect(store.loading()).toBe(false);
    expect(store.success()).toBe(false);
  });

  it('should update a category successfully', () => {
    // Arrange
    const updatedCategory: Categoria = {
      id: 1,
      name: 'Hogar actualizado',
      description: 'Nueva descripción',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    categoriaService.getAll.mockReturnValue(of(categories));
    categoriaService.update.mockReturnValue(of(updatedCategory));

    store.loadAll();

    // Act
    store.update(1, {
      name: updatedCategory.name,
      description: updatedCategory.description,
    });

    // Assert
    expect(store.categories()).toEqual([updatedCategory, categories[1]]);

    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();

    expect(messageService.add).toHaveBeenCalledOnce();
  });

  it('should update the selected category when it is updated', () => {
    // Arrange
    const updatedCategory: Categoria = {
      id: 1,
      name: 'Hogar actualizado',
      description: 'Nueva descripción',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    categoriaService.update.mockReturnValue(of(updatedCategory));

    store.select(categories[0]);

    // Act
    store.update(1, {
      name: updatedCategory.name,
      description: updatedCategory.description,
    });

    // Assert
    expect(store.categoriaSelected()).toEqual(updatedCategory);
  });

  it('should set error when updating a category fails', () => {
    // Arrange
    const error = new HttpErrorResponse({
      error: 'No se pudo actualizar la categoría',
      status: 400,
    });

    categoriaService.update.mockReturnValue(throwError(() => error));

    // Act
    store.update(1, categoryToCreate);

    // Assert
    expect(store.error()).toBe('No se pudo actualizar la categoría');
    expect(store.loading()).toBe(false);
  });

  it('should delete a category successfully', () => {
    // Arrange
    categoriaService.getAll.mockReturnValue(of(categories));
    categoriaService.delete.mockReturnValue(of(undefined));

    store.loadAll();

    // Act
    store.delete(1);

    // Assert
    expect(store.categories()).toEqual([categories[1]]);
    expect(store.total()).toBe(1);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();

    expect(messageService.add).toHaveBeenCalledOnce();
  });

  it('should clear the selected category when it is deleted', () => {
    // Arrange
    categoriaService.delete.mockReturnValue(of(undefined));

    store.select(categories[0]);

    // Act
    store.delete(1);

    // Assert
    expect(store.categoriaSelected()).toBeNull();
  });

  it('should set error when deleting a category fails', () => {
    // Arrange
    const error = new HttpErrorResponse({
      error: 'No se pudo eliminar la categoría',
      status: 400,
    });

    categoriaService.delete.mockReturnValue(throwError(() => error));

    // Act
    store.delete(1);

    // Assert
    expect(store.error()).toBe('No se pudo eliminar la categoría');
    expect(store.loading()).toBe(false);
  });

  it('should select a category', () => {
    // Act
    store.select(categories[0]);

    // Assert
    expect(store.categoriaSelected()).toEqual(categories[0]);
  });

  it('should clear the selected category', () => {
    // Arrange
    store.select(categories[0]);

    // Act
    store.clearSelection();

    // Assert
    expect(store.categoriaSelected()).toBeNull();
  });
});
