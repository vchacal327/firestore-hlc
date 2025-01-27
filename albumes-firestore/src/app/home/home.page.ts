import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Album, Pista } from '../album';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // Álbum que estamos “editando” en el formulario
  albumEditando: Album;

  // Pista temporal antes de agregarse al álbum
  nuevaPista: Pista = {
    id: 0,
    titulo: '',
    duracion: ''
  };

  // Contador para asignar ID único a cada pista localmente
  pistaCounter: number = 1;

  // Lista de álbumes que se obtienen de Firestore
  arrayColeccionAlbumes: any[] = [{
    id: '',
    data: {} as Album
  }];

  // ID del álbum seleccionado (para editar o borrar)
  idAlbumSelec: any;

  constructor(private firestoreService: FirestoreService, private router: Router) {
    // Crear un álbum vacío con un arreglo de pistas
    this.albumEditando = {
      titulo: ' ',
      artista: ' ',
      anho: ' ',
      genero: ' ',
      pistas: []
    };

    this.obtenerListaAlbumes();
  }

  // Método para obtener la lista de álbumes de Firestore
  obtenerListaAlbumes() {
    this.firestoreService.consultar('albumes').subscribe((resultadoConsultaAlbumes) => {
      this.arrayColeccionAlbumes = [];
      resultadoConsultaAlbumes.forEach((registro: any) => {
        this.arrayColeccionAlbumes.push({
          id: registro.payload.doc.id,
          data: registro.payload.doc.data()
        });
      });
    });
  }

  // Al hacer clic en “Agregar pista” en el formulario
  agregarPista() {
    // Crear una copia de nuevaPista asignando un ID incremental
    const pistaAInsertar: Pista = {
      id: this.pistaCounter,
      titulo: this.nuevaPista.titulo,
      duracion: this.nuevaPista.duracion
    };

    // Agregar al array de pistas del álbum
    this.albumEditando.pistas.push(pistaAInsertar);

    // Incrementar contador para la siguiente pista
    this.pistaCounter++;

    // Limpiar el formulario de pista
    this.nuevaPista = {
      id: 0,
      titulo: '',
      duracion: ''
    };
  }

  // Elimina una pista por índice dentro del array
  eliminarPista(indice: number) {
    this.albumEditando.pistas.splice(indice, 1);
  }

  // Método para insertar un nuevo álbum (con sus pistas) en Firestore
  clicBotonInsertar() {

    // Insertar en la colección "albumes" de Firestore
    this.firestoreService.insertar('albumes', this.albumEditando).then(() => {
      console.log('¡Álbum creado correctamente en Firestore!');
      // Limpiar el formulario
      this.albumEditando = {
        titulo: '',
        artista: '',
        anho: '',
        genero: '',
        pistas: []
      };
      // Resetear el contador
      this.pistaCounter = 1;
    }, (error) => {
      console.error(error);
    });
  }

  // Seleccionar un álbum desde la lista para editar (o ver detalles)
  selecAlbum(albumSelec: any) {
    console.log('Álbum seleccionado:', albumSelec);
    this.idAlbumSelec = albumSelec.id;

    // Rellenar los campos con la info del álbum seleccionado
    this.albumEditando.titulo = albumSelec.data.titulo;
    this.albumEditando.artista = albumSelec.data.artista;
    this.albumEditando.anho = albumSelec.data.anho;
    this.albumEditando.genero = albumSelec.data.genero;
    this.albumEditando.pistas = albumSelec.data.pistas || [];

    this.router.navigate(['/detalle', this.idAlbumSelec]);
  }
}
