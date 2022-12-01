<template>

  <div class="figma-todo">

    <label class="label">Añadir nuevo video</label>


    <form @submit.prevent="agregarVideo">

      <div class="field is-grouped mb-5">
        <p class="control is-expanded">
          <input v-model="contenidoNuevo" class="input" type="text" placeholder="Añadir video" @input="handleInput">
        </p>
        <p class="control">
          <button class="button is-info" :disabled="!contenidoNuevo">
            Añadir
          </button>
        </p>
      </div>
    </form>

    <div class="card">
      <div class="card-content">
        <div class="cards-wrapper" id="card-div-wrapper">

          <div class="card" v-for="todo in todosVideos">

            <div class="col-md-3">
              <div class="card-body" value="ejemplo">

                <div class="wrappervideo">

                  <!--PRIMERA OPCION <iframe class=" frame" :src="'https://www.youtube.com/embed/' + todo.idvinculo + '?autoplay=0'"
                    frameborder="1" showinfo="0" controls="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe>-->

                </div>
                <div class="wrapper">
                  <img  class="row-pointer" @click="seleccionVideo(todo)"
                    :src="'' + todo.thumbnails + ''">
                  <button @click="eliminarVideo(todo.id)" class="button1">eliminar </button>
                  <label class="text1">{{todo.duration}}</label>
                </div>

              </div>
              <!-- O puedes comentar una gran cantidad de líneas. -->
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>


</template>

<script setup lang="ts">
/* Imports */

/*import { collection, getDocs } from 'firebase/firestore';*/
import { collection, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, inject, onMounted } from 'vue'
import { db } from '@/firebase'

const swal = inject('$swal')

/* Referencias firebase */

const todosVideosCollectionRef = collection(db, "videosfigma")

/* Todos */

const todosVideos = ref([

])

/* obtener Videos */

onMounted(async () => {

  //console.log('mounted')
  onSnapshot(todosVideosCollectionRef, (querySnapshot) => {
    const fbTodosVideosFigma = []
    querySnapshot.forEach((doc) => {
      const video = {
        id: doc.id,
        vinculo: doc.data().vinculo,
        idvinculo: doc.data().idvinculo,
        titulo: doc.data().titulo,
        descripcion: doc.data().descripcion,
        thumbnails: doc.data().thumbnails,
        duration: doc.data().duration

      }
      fbTodosVideosFigma.push(video)
    });
    todosVideos.value = fbTodosVideosFigma

  });

})

/* Agregar video youtube */

const contenidoNuevo = ref('')

const agregarVideo = () => {
  console.log('Agregando link youtube ' + contenidoNuevo.value)

  const youtubeEmbedTemplate = "https://www.youtube.com/embed/";
  const url = contenidoNuevo.value.split(
    /(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/
  );
  console.log("url", url);
  const YId =
    undefined !== url[2] ? url[2].split(/[^0-9a-z_/\\-]/i)[0] : url[0];
  console.log("YId", YId);
  if (YId === url[0]) {
    console.log("not a youtube link");
    swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'No es un link de youtube!'
    });

  } else {
    console.log("it's  a youtube video");

    const topOfQueue = youtubeEmbedTemplate.concat(YId);
    console.log("topOfQueue", topOfQueue);

    fetch(`https://www.googleapis.com/youtube/v3/videos?id=${YId}&key=AIzaSyCcexOShH5jjP-wEjp079Vpp3hOVEAg2iY&part=snippet,contentDetails,statistics,status`)
      .then(res => res.json())

      .then((data) => {
        console.log(data);
        console.log(data['items'][0]['snippet']['thumbnails']['high']['url']);
        console.log(data['items'][0]['contentDetails']['duration']);


        //Conversion de duración de api youtube
        var PT = data['items'][0]['contentDetails']['duration']
        var output = [];
        var durationInSec = 0;
        var matches = PT.match(/P(?:(\d*)Y)?(?:(\d*)M)?(?:(\d*)W)?(?:(\d*)D)?T(?:(\d*)H)?(?:(\d*)M)?(?:(\d*)S)?/i);
        var parts = [
          { // years
            pos: 1,
            multiplier: 86400 * 365
          },
          { // months
            pos: 2,
            multiplier: 86400 * 30
          },
          { // weeks
            pos: 3,
            multiplier: 604800
          },
          { // days
            pos: 4,
            multiplier: 86400
          },
          { // hours
            pos: 5,
            multiplier: 3600
          },
          { // minutes
            pos: 6,
            multiplier: 60
          },
          { // seconds
            pos: 7,
            multiplier: 1
          }
        ];

        for (var i = 0; i < parts.length; i++) {
          if (typeof matches[parts[i].pos] != 'undefined') {
            durationInSec += parseInt(matches[parts[i].pos]) * parts[i].multiplier;
          }
        }

        // Hours extraction
        if (durationInSec > 3599) {
          output.push(parseInt(durationInSec / 3600));
          durationInSec %= 3600;
        }
        // Minutes extraction with leading zero
        output.push(('0' + parseInt(durationInSec / 60)).slice(-2));
        // Seconds extraction with leading zero
        output.push(('0' + durationInSec % 60).slice(-2));

        //console.log(output.join(':'));
         // Finalización de Conversion de duración de api youtube


        addDoc(todosVideosCollectionRef, {
          vinculo: topOfQueue,
          idvinculo: YId,
          titulo: data['items'][0]['snippet']['title'],
          descripcion: data['items'][0]['snippet']['description'],
          thumbnails: data['items'][0]['snippet']['thumbnails']['high']['url'],
          duration:output.join(':')

        })
      });
    contenidoNuevo.value = ''
  }

}

/* Seleccion de video */

const seleccionVideo = (todo) => {
  console.log('Link seleccionado', todo.idvinculo)
  console.log('Link seleccionado', 'https://www.youtube.com/embed/' + todo.idvinculo + '?autoplay=0')
  var linkyoutube = 'https://www.youtube.com/embed/' + todo.idvinculo + '?autoplay=0'
  var elem = document.createElement("div");

  elem.innerHTML = '<div class="row">  <div class="column"><iframe class="frame" width="350" height="350" src="https://www.youtube.com/embed/' + todo.idvinculo + '" frameborder="1" showinfo="0" controls="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>  <div class="column"><strong>' + todo.titulo + '</strong></p>' + todo.descripcion + '</div></div>';

  swal({
    html: elem,
    confirmButtonText: "Salir",
    backdrop: "true",
    allowOutsideClick: "true"
  });
}

/* Eliminación de video */
const eliminarVideo = (id: string | undefined) => {
  console.log('Link a eliminar', id)

  swal.fire({
    title: 'Estas seguro?',
    text: "No podras reveritr el cambio!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, eliminalo!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteDoc(doc(todosVideosCollectionRef, id));
      swal.fire(
        'Video Eliminado!',
        'Tu enlace de video ha sido eliminado.',
        'success'
      )
    }
  })
}

</script>

<style>
@import 'bulma\css\bulma.min.css';

.figma- {
  /* Todos  width: 1200px; */
  width: 100%;
}

.cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 10px;
}

.cards-wrapper .card {
  margin: 10px;
  width: 30%;
}

.frame {
  width: 100%;
  /*border: 3px solid black;*/
}

.row-pointer {
  cursor: pointer;
}

.wrappervideo {
  position: relative
}

.button1 {
  position: absolute;
  top: 0;
  right: 0;
  display: block;
  width: 30px;
  height: 30px;
  font-size: 0;
  background-color: #e7360a;
}

.button1:before,
.button1:after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 20px;
  background-color: #0e0c0c;
  transform: rotate(45deg) translate(-50%, -50%);
  transform-origin: top left;
  content: '';
}

.button1:after {
  transform: rotate(-45deg) translate(-50%, -50%);
}

.text1 {
  position: absolute;
  bottom: 0;
  margin-right: 10px;
  margin-bottom: 5px;
  right: 0;
}
</style>