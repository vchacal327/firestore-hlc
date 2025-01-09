import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Album } from '../album';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  albumEditando: Album; 

  constructor(private firestoreService: FirestoreService) {
    // Crear un albúm vacío
    this.albumEditando = {} as Album;
    this.obtenerListaAlbumes();
  }

  clicBotonInsertar() {
    this.firestoreService.insertar("albumes", this.albumEditando).then(() => {
      console.log('Álbum creado correctamente!');
      this.albumEditando= {} as Album;
    }, (error) => {
      console.error(error);
    });
  }

  arrayColeccionAlbumes: any = [{
    id: "",
    data: {} as Album
   }];

  obtenerListaAlbumes(){
    this.firestoreService.consultar("albumes").subscribe((resultadoConsultaAlbumes) => {
      this.arrayColeccionAlbumes = [];
      resultadoConsultaAlbumes.forEach((datosTarea: any) => {
        this.arrayColeccionAlbumes.push({
          id: datosTarea.payload.doc.id,
          data: datosTarea.payload.doc.data()
        });
      })
    });
  }

  idAlbumSelec: any;

  selecTarea(albumSelec: any) {
    console.log("Tarea seleccionada: ");
    console.log(albumSelec);
    this.idAlbumSelec = albumSelec.id;
    this.albumEditando.titulo = albumSelec.data.titulo;
    this.albumEditando.artista = albumSelec.data.artista;
  }

  clicBotonBorrar() {
    this.firestoreService.borrar("tareas", this.idAlbumSelec).then(() => {
      // Actualizar la lista completa
      this.obtenerListaAlbumes();
      // Limpiar datos de pantalla
      this.albumEditando = {} as Album;
    })
  }

}