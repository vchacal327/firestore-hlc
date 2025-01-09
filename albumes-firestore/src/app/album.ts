export interface Album {
    id: number;
    titulo: string;
    artista: string;
    anho: number;
    genero: string;
    portada: string;
    pistas: Pista[];
}

export interface Pista {
    id: number;
    titulo: string;
    duracion: string;
}
