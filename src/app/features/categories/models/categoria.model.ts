export interface Categoria {
    id: number;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
}


export interface CrarActualizarCategoria {
    name: string;
    description?: string | null;
}

