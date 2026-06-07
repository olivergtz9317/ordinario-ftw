document.addEventListener("DOMContentLoaded", () => {
    cargarFavoritos();

    const btnLimpiarFavoritos = document.querySelector("#btnLimpiarFavoritos");

    if (btnLimpiarFavoritos) {
        btnLimpiarFavoritos.addEventListener("click", limpiarFavoritos);
    }
});

function cargarFavoritos() {
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
            const libros = convertirXmlALibros(xml);
            const favoritos = obtenerFavoritosGuardados();
            const librosFavoritos = libros.filter((libro) => favoritos.includes(libro.id));

            mostrarFavoritos(librosFavoritos);
        })
        .catch(() => {
            mostrarMensajeFavoritos("no fue posible cargar los favoritos.");
        });
}

function convertirXmlALibros(xml) {
    const nodosLibro = Array.from(xml.querySelectorAll("libro"));

    return nodosLibro.map((nodo) => {
        return {
            id: nodo.getAttribute("id"),
            titulo: obtenerTexto(nodo, "titulo"),
            autor: obtenerTexto(nodo, "autor"),
            genero: obtenerTexto(nodo, "genero"),
            anio: obtenerTexto(nodo, "anio"),
            estado: obtenerTexto(nodo, "estado"),
            paginas: obtenerTexto(nodo, "paginas"),
            descripcion: obtenerTexto(nodo, "descripcion")
        };
    });
}

function obtenerTexto(nodo, etiqueta) {
    const elemento = nodo.querySelector(etiqueta);
    return elemento ? elemento.textContent.trim() : "";
}

function obtenerFavoritosGuardados() {
    return JSON.parse(localStorage.getItem("favoritosBiblioteca")) || [];
}

function mostrarFavoritos(librosFavoritos) {
    const contenedor = document.querySelector("#contenedorFavoritos");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (librosFavoritos.length === 0) {
        mostrarMensajeFavoritos("no tienes libros guardados como favoritos.");
        return;
    }

    librosFavoritos.forEach((libro) => {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta", "tarjeta-favorito");

        tarjeta.innerHTML = `
            <span class="etiqueta-genero">${libro.genero}</span>
            <h2>${libro.titulo}</h2>
            <p><strong>Autor:</strong> ${libro.autor}</p>
            <p><strong>Estado:</strong> ${libro.estado}</p>
            <p>${libro.descripcion}</p>

            <div class="acciones-favorito">
                <a class="boton" href="detalle.html?id=${libro.id}">Ver detalle</a>
                <button class="boton boton-eliminar" type="button" data-id="${libro.id}">
                    Quitar
                </button>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });

    prepararBotonesEliminar();
    mostrarMensajeFavoritos(`tienes ${librosFavoritos.length} libro(s) en favoritos.`);
}

function prepararBotonesEliminar() {
    const botonesEliminar = document.querySelectorAll(".boton-eliminar");

    botonesEliminar.forEach((boton) => {
        boton.addEventListener("click", () => {
            eliminarFavorito(boton.dataset.id);
        });
    });
}

function eliminarFavorito(idLibro) {
    const favoritos = obtenerFavoritosGuardados();
    const favoritosActualizados = favoritos.filter((id) => id !== idLibro);

    localStorage.setItem("favoritosBiblioteca", JSON.stringify(favoritosActualizados));
    cargarFavoritos();
}

function limpiarFavoritos() {
    localStorage.removeItem("favoritosBiblioteca");
    cargarFavoritos();
}

function mostrarMensajeFavoritos(texto) {
    const mensaje = document.querySelector("#mensajeFavoritos");

    if (mensaje) {
        mensaje.textContent = texto;
    }
}