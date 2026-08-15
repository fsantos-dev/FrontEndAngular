import { FormControl } from "@angular/forms";

export interface Categoria {
    id: number;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
}


export interface CrearActualizarCategoria {
    name: string;
    description?: string | null;
}

export interface CategoryFormInterface {
  name: FormControl<string>;
  description: FormControl<string>;
}

