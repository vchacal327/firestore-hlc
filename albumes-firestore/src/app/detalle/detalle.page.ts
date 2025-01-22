import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Album } from '../album';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  id: string = "";

  document: any = {
    id: "",
    data: {} as Album
  };

  constructor(private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService) { }

  ngOnInit() {
    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    if (idRecibido != null) {
      this.id = idRecibido;
    } else {
      this.id = "";
    }

    this.firestoreService.consultarPorId("albumes", this.id).subscribe((resultado: any) => {

      if (resultado.payload.data() != null) {
        this.document.id = resultado.payload.id;
        this.document.data = resultado.payload.data();

        console.log(this.document.data.titulo);
      } else {
        this.document.data = {} as Album;
      }
    });
  }

  // Borrar un álbum seleccionado
  clicBotonBorrar() {
    if (this.idAlbumSelec) {
      this.firestoreService.borrar('albumes', this.idAlbumSelec).then(() => {
        console.log('Álbum borrado de Firestore');
        // Actualizar la lista
        this.obtenerListaAlbumes();
        // Limpiar el formulario
        this.albumEditando = {
          titulo: '',
          artista: '',
          anho: '',
          genero: '',
          portada: '',
          pistas: []
        };
      });
    }
  }

  clicBotonModificar() {
    this.firestoreService.actualizar("albumes", this.idAlbumSelec, this.albumEditando).then(() => {
      // Actualizar la lista completa
      this.obtenerListaAlbumes();
      // Limpiar datos de pantalla
      this.albumEditando = {} as Album;
    })
  }
}


