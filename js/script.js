document.addEventListener("DOMContentLoaded", function () {
    const postsContainer = document.getElementById("noticias-section");
    const postForm = document.getElementById("post-form");
    const nuevaNoticiaBtn = document.getElementById("nueva-noticia");
    const editContainer = document.getElementById("posts-container");

    let postId = 1; // Contador para los IDs de los posts.

    function mostrarPost(post) {
        const postContainer = document.createElement("section");
        postContainer.classList.add("noticias-section");
        postContainer.id = "post-" + postId;
    
        const postElement = document.createElement("div");
        postElement.classList.add("post");
    
        const readView = document.createElement("div");
        readView.classList.add("read-view");
        readView.innerHTML = `
        <div class="card" id="posts-container">
            <div class="img imagen-post">
                <img src="${post.imagen}" alt="">
            </div>
            <div class="content">
                <h2 class="post_titulo">${post.titulo}</h2>
                <p>${post.contenido}</p>
                <div class="audio">
                <audio controls>
                 <source src="${post.audio}" type="audio/mp3">
                 Tu navegador no soporta la reproducción de audio.
              </audio></div>
              <button class="edit-btn">Editar</button>
              <button class="delete-btn">Eliminar</button>
              <button class="see-more-btn">Ver más</button>
            </div>
        </div>
      `;
        postElement.appendChild(readView);
    
        const editView = document.createElement("div");
        editView.classList.add("edit-view");
        editView.style.display = "none";
        editView.innerHTML = `
        <h4 class="third-text">EDITAR NOTICIA</h4>
                <div class="input-box2">
                    <input type="text" id="titulo-${postId}" name="titulo" class="input2 edit-titulo" value="${post.titulo}">
                    <label for="">Nombre de la noticia</label>
                </div>
                <div class="input-box2">
                <textarea name="contenido" id="contenido-${postId}" cols="30" rows="10" class="input2 edit-contenido">${post.contenido}</textarea>
                <label for="">Contenido de la noticia</label>
            </div>
          <input type="file" class="edit-imagen" id="contenedor-btn-file"><br>
          <input type="file" class="edit-audio" id="contenedor-btn-file"><br>
          <button class="save-btn">Guardar</button>
          <button class="cancele-btn">Cancelar</button>
      `;
        postElement.appendChild(editView);
    
        postContainer.appendChild(postElement);
        postsContainer.appendChild(postContainer);
    
        postId++;
    
        postForm.classList.remove('show');
        nuevaNoticiaBtn.textContent = "Nueva Noticia";

        // Agregar un listener de eventos al botón de editar para cargar los datos en el formulario de edición
        const editBtn = postElement.querySelector(".edit-btn");
        editBtn.addEventListener("click", function () {
            const editView = this.closest(".post").querySelector(".edit-view");
            const titulo = this.closest(".post").querySelector(".post_titulo").textContent;
            const contenido = this.closest(".post").querySelector("p").textContent;
            editView.querySelector(".edit-titulo").value = titulo;
            editView.querySelector(".edit-contenido").value = contenido;
            editView.style.display = "block";
            this.closest(".post").querySelector(".read-view").style.display = "none";
        });

        // Agregar un listener de eventos al botón de cancelar en el formulario de edición
        const cancelBtn = editView.querySelector(".cancele-btn");
        cancelBtn.addEventListener("click", function () {
            const editView = this.closest(".edit-view");
            editView.style.display = "none";
            editView.closest(".post").querySelector(".read-view").style.display = "block";
        });
    }

    function guardarPosts() {
        const posts = document.querySelectorAll('.noticias-section');
        const postsArray = Array.from(posts).map(post => {
            const titulo = post.querySelector('.post_titulo').textContent;
            const contenido = post.querySelector('p').textContent;
            const imagen = post.querySelector('.imagen-post img').src;
            const audioSrc = post.querySelector('audio source').src;
            return { titulo, contenido, imagen, audio: audioSrc };
        });
        localStorage.setItem('posts', JSON.stringify(postsArray));
    }

    function cargarPosts() {
        const postsString = localStorage.getItem('posts');
        if (postsString) {
            const postsArray = JSON.parse(postsString);
            if (Array.isArray(postsArray)) {
                postsArray.forEach(post => {
                    if (post) {
                        const postId = post.titulo; // Asume que el título del post es único y se puede usar como ID
                        const imagenBase64 = localStorage.getItem(`imagenPost-${postId}`); // Recupera la imagen usando el postId
                        const postWithImage = { ...post, imagen: imagenBase64 };
                        mostrarPost(postWithImage);
                    } else {
                        console.error('Se encontró un elemento nulo en el array de posts.');
                    }
                });
            } else {
                console.error('Los datos almacenados en localStorage no son un array.');
            }
        }
    }

    function convertirImagenABase64(file, postId) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve({ postId, imagenBase64: event.target.result });
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    function guardarImagenEnLocalStorage(postId, imagenBase64) {
        // Guardar la imagen (ya sea nueva o actualizada) en el localStorage
        localStorage.setItem(`imagenPost-${postId}`, imagenBase64);
    }

    nuevaNoticiaBtn.addEventListener("click", function () {
        if (postForm.classList.contains('show')) {
            postForm.classList.remove('show');
            this.textContent = "Nueva Noticia";
            this.classList.remove('cancel-btn');
        } else {
            postForm.classList.add('show');
            this.textContent = "Cancelar";
            this.classList.add('cancel-btn');
        }
    });

    postForm.addEventListener("submit", function (event) {
        event.preventDefault();
    
        const titulo = document.getElementById("titulo").value;
        const contenido = document.getElementById("contenido").value;
        const inputImagen = document.getElementById("inputImagen").files[0];
        const inputAudio = document.getElementById("inputAudio").files[0];
        let imagenURL = "";
        let audioURL = "";
    
        if (inputImagen) {
            // Convertir la imagen a Base64 y guardar la URL en el localStorage
            convertirImagenABase64(inputImagen, titulo) // Pasar el título como identificador
                .then(({ postId, imagenBase64 }) => {
                    imagenURL = imagenBase64;
                    guardarImagenEnLocalStorage(postId, imagenURL);
                    // Crear el post y mostrarlo inmediatamente
                    const post = {
                        titulo: titulo,
                        contenido: contenido,
                        imagen: imagenURL, // Asegúrate de que imagenURL es la imagen en Base64
                        audio: audioURL,
                    };
                    mostrarPost(post);
                    guardarPosts(); // Guardar los posts después de agregar uno nuevo
                })
                .catch(error => {
                    console.error('Error al convertir la imagen a Base64:', error);
                });
        } else {
            // Utiliza la URL de la imagen guardada en el localStorage si no se proporciona una nueva
            imagenURL = localStorage.getItem('imagenPost') || "";
            // Crear el post y mostrarlo inmediatamente
            const post = {
                titulo: titulo,
                contenido: contenido,
                imagen: imagenURL,
                audio: audioURL,
            };
            mostrarPost(post);
            guardarPosts(); // Guardar los posts después de agregar uno nuevo
        }
    
        if (inputAudio) {
            audioURL = URL.createObjectURL(inputAudio);
        }
    });

    postsContainer.addEventListener("click", function (event) {
        const target = event.target;
        if (target.classList.contains("delete-btn")) {
            const post = target.closest(".noticias-section");
            const postId = post.id.split('-')[1]; // Asume que el ID del post es "post-1", "post-2", etc.
    
            post.remove();
            guardarPosts(); // Guardar los posts después de eliminar uno
    
            // Eliminar la imagen específica del post del localStorage
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            const postIndex = posts.findIndex(post => post.titulo === postId);
            if (postIndex !== -1) {
                posts.splice(postIndex, 1);
                localStorage.setItem('posts', JSON.stringify(posts));
            }
        }
    });
    
    postsContainer.addEventListener("click", function (event) {
        const target = event.target;
        if (target.classList.contains("see-more-btn")) {
            const post = target.closest(".noticias-section");
            const readView = post.querySelector(".read-view");
            const titulo = readView.querySelector(".post_titulo").textContent;
            const contenido = readView.querySelector("p").textContent;
            const imagen = readView.querySelector(".imagen-post img").src; // Asegúrate de seleccionar la imagen correctamente
            const audioSrc = readView.querySelector("audio source").src;
    
            Swal.fire({
                title: titulo,
                html: `<p>${contenido}</p><img src="${imagen}" alt="Imagen del post" class="imagen-post"><audio controls><source src="${audioSrc}" type="audio/mp3">Tu navegador no soporta la reproducción de audio.</audio>`
            });
        }
    });
    
    postsContainer.addEventListener("click", function (event) {
        const target = event.target;
        if (target.classList.contains("edit-btn")) {
            const post = target.closest(".noticias-section");
            const readView = post.querySelector(".read-view");
            const editView = post.querySelector(".edit-view");
            readView.style.display = "none";
            editView.style.display = "block";
        }
    });
    
    postsContainer.addEventListener("click", function (event) {
        const target = event.target;
        if (target.classList.contains("save-btn")) {
            const post = target.closest(".noticias-section");
            const postId = post.id.split('-')[1]; // Asume que el ID del post es "post-1", "post-2", etc.
            const readView = post.querySelector(".read-view");
            const editView = post.querySelector(".edit-view");
    
            const newTitulo = editView.querySelector(".edit-titulo").value;
            const newContenido = editView.querySelector(".edit-contenido").value;
            const newImagen = editView.querySelector(".edit-imagen").files[0];
            let newImagenURL = "";
    
            // Si se selecciona una nueva imagen, convertirla a Base64 y actualizar en el localStorage
            if (newImagen) {
                convertirImagenABase64(newImagen, postId) // Pasar el postId como identificador
                    .then(({ postId, imagenBase64 }) => {
                        newImagenURL = imagenBase64;
                        guardarImagenEnLocalStorage(postId, newImagenURL); // Actualizar la imagen en el localStorage
                        readView.querySelector(".imagen-post img").src = newImagenURL; // Actualizar la imagen en el DOM
                    })
                    .catch(error => {
                        console.error('Error al convertir la imagen a Base64:', error);
                    });
            } else {
                // Si no se selecciona una nueva imagen, mantener la imagen existente
                const existingImagenBase64 = localStorage.getItem(`imagenPost-${postId}`);
                if (existingImagenBase64) {
                    newImagenURL = existingImagenBase64;
                    readView.querySelector(".imagen-post img").src = newImagenURL; // Mantener la imagen existente en el DOM
                }
            }
    
            // Actualizar el título y el contenido del post en el DOM
            readView.querySelector(".post_titulo").textContent = newTitulo;
            readView.querySelector("p").textContent = newContenido;
    
            // Ocultar la vista de edición y mostrar la vista de lectura
            readView.style.display = "block";
            editView.style.display = "none";
    
            // Actualizar el post en el localStorage
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            const postIndex = posts.findIndex(post => post.titulo === postId);
            if (postIndex !== -1) {
                posts[postIndex] = { titulo: newTitulo, contenido: newContenido, imagen: newImagenURL };
                localStorage.setItem('posts', JSON.stringify(posts));
            }
        }
    });
    cargarPosts(); // Cargar los posts al inicio
});
