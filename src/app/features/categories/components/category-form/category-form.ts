import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryFormInterface, CrearActualizarCategoria } from '../../models/categoria.model';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CategoriaStore } from '../../store/categoria.store';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm {
  readonly save = output<CrearActualizarCategoria>();
  readonly cancel = output<void>();
  readonly showCancel = input<boolean>(false);

  private readonly categoryStore = inject(CategoriaStore);
  private fb = inject(FormBuilder);
  readonly isEditMode = computed(() => this.categoryStore.categoriaSelected() !== null);

  loading = this.categoryStore.loading;
  success = this.categoryStore.success;
  selected = this.categoryStore.categoriaSelected;

  categoryForm: FormGroup<CategoryFormInterface> = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.nonNullable.control('', Validators.maxLength(500)),
  });

  constructor() {
    effect(() => {
      if (!this.loading() && this.success()) {
        this.clearForm();
      }
    });


    //Esto es mejor 
    effect(() => {
      const category = this.selected();
      if (category) {
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description || '',
        });
      } else {
        this.categoryForm.reset();
      }
    });

    //que esto
    // if(this.selected()){
    //   this.categoryForm.patchValue({
    //     name: this.selected()?.name,
    //     description: this.selected()?.description || ''
    //   })
    // }else{
    //   this.categoryForm.reset();
    // }
  }

  ngOnInit() {
    console.log('ENTRAMOS A EDITAR');
    if (this.selected()) {
      console.log('ENTRAMOS A EDITAR 2');
      this.categoryForm.patchValue({
        name: this.selected()?.name,
        description: this.selected()?.description || '',
      });
    } else {
      this.categoryForm.reset();
    }
  }

  protected get name() {
    return this.categoryForm.controls.name;
  }

  protected get description() {
    return (this, this.categoryForm.controls.description);
  }

  CreateCategory() {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.invalid) {
      return;
    }
    let category = this.categoryForm.getRawValue();
    this.save.emit(category);
  }

  clearForm() {
    this.categoryForm.reset();
  }

  onCancel(): void {
    this.categoryForm.reset();
    this.cancel.emit();
  }
}
