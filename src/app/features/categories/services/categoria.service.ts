import { inject, Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Categoria, CrearActualizarCategoria } from "../models/categoria.model";
import { APP_CONFIG } from "../../../core/config/app.config";


@Injectable({ providedIn: 'root'})
export class CategoriaService {

    private readonly http = inject(HttpClient);

    getAll(): Observable<Categoria[]>{
        return this.http.get<Categoria[]>(`${APP_CONFIG.apiUrl}/categories`);
    }

    getById(id:Number): Observable<Categoria>{
        return this.http.get<Categoria>(`${APP_CONFIG.apiUrl}/${id}`);
    }

    create(categoria: CrearActualizarCategoria): Observable<Categoria>{
        return this.http.post<Categoria>(`${APP_CONFIG.apiUrl}/categories`, categoria);
    }

    update(categoria: CrearActualizarCategoria): Observable<Categoria>{
        return this.http.put<Categoria>(`${APP_CONFIG.apiUrl}/categories`, categoria);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${APP_CONFIG.apiUrl}/${id}`)
    }
}