document.addEventListener("DOMContentLoaded", () => {
    cargarDetalleLibro();
});

function cargarDetalleLibro() {
    const parametros = new URLSearchParams(window.location.search);
    const idLibro = parametros.get("id");

    if (!idLibro) {
        mostrarErrorDetalle("no se recibió ningún libro. vuelve al catálogo y selecciona una opción.");
        return;
    }

    fetch("../data/libros.xml")
        .then((respuesta) => {
            if (!respuesta.ok) {
                throw new Error("no se pudo cargar el archivo xml");
            }

            return respuesta.text();
        })
        .then((textoXml) => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(textoXml, "application/xml");
            const libro = buscarLibroPorId(xml, idLibro);

            if (!libro) {
                mostrarErrorDetalle("no se encontró el libro solicitado.");
                return;
            }

            mostrarDetalle(libro);
        })
        .catch(() => {
            mostrarErrorDetalle("ocurrió un error al cargar la información del libro.");
        });
}

function buscarLibroPorId(xml, idLibro) {
    const nodosLibro = Array.from(xml.querySelectorAll("libro"));

    const nodoEncontrado = nodosLibro.find((nodo) => {
        return nodo.getAttribute("id") === idLibro;
    });

    if (!nodoEncontrado) {
        return null;
    }

    return {
        id: nodoEncontrado.getAttribute("id"),
        titulo: obtenerTexto(nodoEncontrado, "titulo"),
        autor: obtenerTexto(nodoEncontrado, "autor"),
        genero: obtenerTexto(nodoEncontrado, "genero"),
        anio: obtenerTexto(nodoEncontrado, "anio"),
        estado: obtenerTexto(nodoEncontrado, "estado"),
        paginas: obtenerTexto(nodoEncontrado, "paginas"),
        descripcion: obtenerTexto(nodoEncontrado, "descripcion")
    };
}

function obtenerTexto(nodo, etiqueta) {
    const elemento = nodo.querySelector(etiqueta);
    return elemento ? elemento.textContent.trim() : "";
}

function mostrarDetalle(libro) {
    const contenedor = document.querySelector("#contenedorDetalle");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="detalle-encabezado">
            <div>
                <h2>${libro.titulo}</h2>
                <p>Escrito por ${libro.autor}</p>
            </div>

            <span class="etiqueta-genero">${libro.genero}</span>
        </div>

        <div class="detalle-datos">
            <div class="dato-libro">
                <strong>Año de publicación</strong>
                <span>${libro.anio}</span>
            </div>

            <div class="dato-libro">
                <strong>Estado</strong>
                <span>${libro.estado}</span>
            </div>

            <div class="dato-libro">
                <strong>Número de páginas</strong>
                <span>${libro.paginas}</span>
            </div>

            <div class="dato-libro">
                <strong>Identificador</strong>
                <span>${libro.id}</span>
            </div>
        </div>

        <section class="descripcion-libro" aria-labelledby="tituloDescripcion">
            <h3 id="tituloDescripcion">Descripción</h3>
            <p>${libro.descripcion}</p>
        </section>

        <div class="botonera">
            <a class="boton" href="catalogo.html">Volver al catálogo</a>
            <button class="boton boton-secundario" type="button" id="btnFavorito">
                Agregar a favoritos
            </button>
        </div>

        <p class="aviso" id="mensajeDetalle" hidden></p>
    `;

    const btnFavorito = document.querySelector("#btnFavorito");

    btnFavorito.addEventListener("click", () => {
        guardarFavorito(libro.id);
    });
}

function guardarFavorito(idLibro) {
    const favoritosGuardados = JSON.parse(localStorage.getItem("favoritosBiblioteca")) || [];
    const mensajeDetalle = document.querySelector("#mensajeDetalle");

    if (!favoritosGuardados.includes(idLibro)) {
        favoritosGuardados.push(idLibro);
        localStorage.setItem("favoritosBiblioteca", JSON.stringify(favoritosGuardados));
        mostrarMensajeDetalle(mensajeDetalle, "libro agregado a favoritos.");
        return;
    }

    mostrarMensajeDetalle(mensajeDetalle, "este libro ya estaba guardado en favoritos.");
}

function mostrarMensajeDetalle(elemento, texto) {
    if (!elemento) {
        return;
    }

    elemento.hidden = false;
    elemento.textContent = texto;
}

function mostrarErrorDetalle(mensaje) {
    const contenedor = document.querySelector("#contenedorDetalle");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <p class="aviso">${mensaje}</p>
        <div class="botonera">
            <a class="boton" href="catalogo.html">Volver al catálogo</a>
        </div>
    `;
}