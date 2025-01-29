import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Album, Pista } from '../album';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

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

  constructor(private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService, private router: Router) { }

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
  
  // Pista temporal antes de agregarse al álbum
  nuevaPista: Pista = {
    id: 0,
    titulo: '',
    duracion: ''
  };

  // Contador para asignar ID único a cada pista localmente
  pistaCounter: number = 1;

  // ID del álbum seleccionado (para editar o borrar)
  idAlbumSelec: any;

  // Al hacer clic en “Agregar pista” en el formulario
  agregarPista() {
    // Crear una copia de nuevaPista asignando un ID incremental
    const pistaAInsertar: Pista = {
      id: this.pistaCounter,
      titulo: this.nuevaPista.titulo,
      duracion: this.nuevaPista.duracion
    };

    // Agregar al array de pistas del álbum
    this.document.data.pistas.push(pistaAInsertar);

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
    this.document.data.pistas.splice(indice, 1);
  }

  // Borrar un álbum seleccionado
  clicBotonBorrar() {

    // Añadir confirmación
    if (confirm('¿Eliminar el álbum?')) {

      this.firestoreService.borrar('albumes', this.document.id).then(() => {
        console.log('Álbum borrado de Firestore');
        // Actualizar la lista
        this.router.navigate(['/home']);
      });
    }
  }

  clicBotonModificar() {
    this.firestoreService.actualizar("albumes", this.document.id, this.document.data).then(() => {

      console.log('Álbum modificado correctamente');
      this.router.navigate(['/home']);
    })
  }
}


