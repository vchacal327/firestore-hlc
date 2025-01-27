export interface Album {
    titulo: string;
    artista: string;
    anho: string;
    genero: string;
    pistas: Pista[];
}

export interface Pista {
    id: number;
    titulo: string;
    duracion: string;
}
