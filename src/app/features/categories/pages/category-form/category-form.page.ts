import { Component, inject } from "@angular/core";
import { CardModule } from "primeng/card";
import { CategoryForm } from "../../components/category-form/category-form";
import { CrearActualizarCategoria } from "../../models/categoria.model";
import { CategoriaStore } from "../../store/categoria.store";

@Component({
    selector : 'app-category-form-page',
    standalone: true,
    imports:[CardModule, CategoryForm],
    templateUrl: './category-form.page.html',
    styleUrl : './category-form.page.scss'
})
export class CategoryFormPage{

    private categoryStore = inject(CategoriaStore);

    constructor(){
        this.categoryStore.clearSelection();
    }
    createCategory(category: CrearActualizarCategoria){
        this.categoryStore.create(category);
    }

}