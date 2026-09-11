import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { CategoriaService } from './categoria.service';
import { APP_CONFIG } from '../../../core/config/app.config';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoriaService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CategoriaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should get all categories', () => {
    // Arrange
    const categories = [
      {
        id: 1,
        name: 'Hogar',
        description: 'Productos para el hogar',
        isActive: true,
      },
    ];

    // Act
    service.getAll().subscribe((result) => {
      // Assert
      expect(result).toEqual(categories);
    });

    const request = httpTesting.expectOne(`${APP_CONFIG.apiUrl}/categories`);

    expect(request.request.method).toBe('GET');

    request.flush(categories);
  });

  it('should get a category by id', () => {
    // Arrange
    const id = 1;

    const category = {
      id: 1,
      name: 'Hogar',
      description: 'Productos para el hogar',
      isActive: true,
    };

    // Act
    service.getById(id).subscribe((result) => {
      // Assert
      expect(result).toEqual(category);
    });

    const request = httpTesting.expectOne(`${APP_CONFIG.apiUrl}/categories/${id}`);

    expect(request.request.method).toBe('GET');

    request.flush(category);
  });

  it('should create a category', () => {
    // Arrange
    const categoryToCreate = {
      name: 'Tecnología',
      description: 'Productos tecnológicos',
      isActive: true,
    };

    const createdCategory = {
      id: 2,
      ...categoryToCreate,
    };

    // Act
    service.create(categoryToCreate).subscribe((result) => {
      // Assert
      expect(result).toEqual(createdCategory);
    });

    const request = httpTesting.expectOne(`${APP_CONFIG.apiUrl}/categories`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(categoryToCreate);

    request.flush(createdCategory);
  });

  it('should update a category', () => {
    // Arrange
    const id = 1;

    const categoryToUpdate = {
      name: 'Hogar actualizado',
      description: 'Descripción actualizada',
      isActive: true,
    };

    const updatedCategory = {
      id,
      ...categoryToUpdate,
    };

    // Act
    service.update(id, categoryToUpdate).subscribe((result) => {
      // Assert
      expect(result).toEqual(updatedCategory);
    });

    const request = httpTesting.expectOne(`${APP_CONFIG.apiUrl}/categories/${id}`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(categoryToUpdate);

    request.flush(updatedCategory);
  });

  it('should delete a category', () => {
    // Arrange
    const id = 1;

    // Act
    service.delete(id).subscribe();

    const request = httpTesting.expectOne(`${APP_CONFIG.apiUrl}/categories/${id}`);

    // Assert
    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });
});
