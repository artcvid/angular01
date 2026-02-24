import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon, PokemonList } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})

export class PokemonDataService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = 'https://pokeapi.co/api/v2';

    getPokemonList(limit: number = 20, offset: number = 0): Observable<PokemonList> {
        return this.http.get<PokemonList>(
            `${this.API_URL}/pokemon?limit=${limit}&offset=${offset}`
        );
    }

    getPokemonById(id: number): Observable<Pokemon> {
        return this.http.get<Pokemon>(`${this.API_URL}/pokemon/${id}`);
    }

    getPokemonByName(name: string): Observable<Pokemon> {
        return this.http.get<Pokemon>(`${this.API_URL}/pokemon/${name.toLowerCase()}`);
    }
}