import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Album, Pista } from '../album';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';
import { AlertController, IonButton } from '@ionic/angular/standalone';
import { LoadingController, ToastController } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  isNew: boolean = false;

  id: string = "";

  document: any = {
    id: "",
    data: {} as Album
  };

  constructor(private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private imagePicker: ImagePicker) { }

  ngOnInit() {

    // Para que el id no sea null:
    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    if (idRecibido != null) {
      this.id = idRecibido;
    } else {
      this.id = "";
    }

    // Obtenemos el parámetro de la ruta
    const paramRecibido = this.activatedRoute.snapshot.paramMap.get('id');

    if (paramRecibido === 'nuevo') {
      // MODO: NUEVO
      this.isNew = true;
      // Inicializa campos vacíos
      this.document.id = '';
      this.document.data = {
        titulo: '',
        artista: '',
        anho: '',
        genero: '',
        portada: '',
        pistas: []
      };

    } else {
      // MODO: EDICIÓN
      this.isNew = false;
      this.id = paramRecibido || '';

      // Cargar datos desde Firestore con el ID
      if (this.id) {
        this.firestoreService.consultarPorId('albumes', this.id)
          .subscribe((resultado: any) => {
            if (resultado.payload.data()) {
              this.document.id = resultado.payload.id;
              this.document.data = resultado.payload.data() as Album;
              console.log("Álbum cargado:", this.document.data);
              // Asegurar que tenga array de pistas
              if (!this.document.data.pistas) {
                this.document.data.pistas = [];
              }
            }
          });
      }
    }
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
  async clicBotonBorrar() {
    if (!this.isNew) {

      const alert = await this.alertController.create({
        header: '¿Eliminar álbum?',
        message: 'No podrás recuperarlo más tarde.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Eliminar',
            handler: () => this.firestoreService.borrar('albumes', this.document.id).then(() => {
              console.log('Álbum borrado de Firestore');
              // Actualizar la lista
              this.router.navigate(['/home']);
            })
          }
        ]
      });
      await alert.present();
    }
  }

  clicBotonModificar() {
    if (this.isNew) {
      this.firestoreService.insertar('albumes', this.document.data).then(() => {
        console.log('Álbum creado en Firestore');
        this.router.navigate(['/home']);
      });

    } else {
      this.firestoreService.actualizar("albumes", this.document.id, this.document.data).then(() => {

        console.log('Álbum modificado correctamente');
        this.router.navigate(['/home']);
      });
    }
  }

  imagenSelec: string = '';
  async seleccionarImagen() {
    // Comprobar si la aplicación tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        // Si no tiene permisos, solicitarlos
        if (result == false) {
          this.imagePicker.requestReadPermission();
        }
        else {
          // Abrir selector de imágenes
          this.imagePicker.getPictures({
            maximumImagesCount: 1,
            outputType: 1
          }).then(
            (results) => {
              if (results.length > 0) {
                this.imagenSelec = 'data:image/jpeg;base64,' + results[0];
                console.log("Imagen que se ha seleccionado (en Base64): " + this.imagenSelec);
              }
            },
            (err) => {
              console.log(err)
            }
          );
        }
      }, (err) => {
        console.log(err);
      });
  }

  async subirImagen() {
    // Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...'
    });
    // Mensaje de finalización de subida de la imagen
    const toast = await this.toastController.create({
      message: 'Imagen subida correctamente',
      duration: 3000
    });

    // Carpeta del Storage donde se almacenará la imagen
    let nombreCarpeta = "imagenes-victorchacon";

    // Mostrar mensaje de espera
    loading.present();
    // Asignar el nombre de la imagen en función de la hora actual para
    // evitar duplicidades de nombres
    let nombreImagen = `${new Date().getTime()}`;
    // Llamar al método que sube la imagen al Storage
    this.firestoreService.subirImagenBase64(nombreCarpeta, nombreImagen, this.imagenSelec)
      .then(snapshot => {
        snapshot.ref.getDownloadURL()
          .then(downloadURL => {
            console.log('URL de descarga: ' + downloadURL);
            this.document.data.portada = downloadURL;
            // Mostrar mensaje de finalización
            toast.present();
            // Ocultar mensaje de espera
            loading.dismiss();
          })
      })
  }

  async eliminarArchivo(fileUrl:string) {
    const toast = await this.toastController.create({
      message: 'Imagen eliminada correctamente',
      duration: 3000
    });
    this.firestoreService.eliminarArchivoPorURL(fileUrl)
    .then(() => {
      toast.present();
    }, (err) => {
      console.log(err);
    });
  }
}
