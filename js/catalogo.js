document.addEventListener("DOMContentLoaded", () => {
    iniciarCatalogo();
});

let libros = [];

function iniciarCatalogo() {
    cargarLibros();
    prepararEventosFiltros();
}

function cargarLibros() {
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

            libros = convertirXmlALibros(xml);

            cargarGeneros(libros);
            mostrarLibros(libros);
        })
        .catch(() => {
            mostrarMensaje("no fue posible cargar los libros. revisa la ruta del archivo xml.");
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

function cargarGeneros(listaLibros) {
    const filtroGenero = document.querySelector("#filtroGenero");

    if (!filtroGenero) {
        return;
    }

    const generos = [...new Set(listaLibros.map((libro) => libro.genero))];

    generos.forEach((genero) => {
        const opcion = document.createElement("option");
        opcion.value = genero;
        opcion.textContent = genero;
        filtroGenero.appendChild(opcion);
    });
}

function prepararEventosFiltros() {
    const busqueda = document.querySelector("#busqueda");
    const filtroGenero = document.querySelector("#filtroGenero");
    const filtroEstado = document.querySelector("#filtroEstado");
    const btnLimpiar = document.querySelector("#btnLimpiar");

    if (busqueda) {
        busqueda.addEventListener("input", filtrarLibros);
    }

    if (filtroGenero) {
        filtroGenero.addEventListener("change", filtrarLibros);
    }

    if (filtroEstado) {
        filtroEstado.addEventListener("change", filtrarLibros);
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", limpiarFiltros);
    }
}

function filtrarLibros() {
    const textoBusqueda = document.querySelector("#busqueda").value.toLowerCase().trim();
    const generoSeleccionado = document.querySelector("#filtroGenero").value;
    const estadoSeleccionado = document.querySelector("#filtroEstado").value;

    const librosFiltrados = libros.filter((libro) => {
        const coincideTexto = libro.titulo.toLowerCase().includes(textoBusqueda)
            || libro.autor.toLowerCase().includes(textoBusqueda);

        const coincideGenero = generoSeleccionado === "" || libro.genero === generoSeleccionado;
        const coincideEstado = estadoSeleccionado === "" || libro.estado === estadoSeleccionado;

        return coincideTexto && coincideGenero && coincideEstado;
    });

    mostrarLibros(librosFiltrados);
}

function limpiarFiltros() {
    document.querySelector("#busqueda").value = "";
    document.querySelector("#filtroGenero").value = "";
    document.querySelector("#filtroEstado").value = "";

    mostrarLibros(libros);
}

function mostrarLibros(listaLibros) {
    const tablaLibros = document.querySelector("#tablaLibros");

    if (!tablaLibros) {
        return;
    }

    tablaLibros.innerHTML = "";

    if (listaLibros.length === 0) {
        tablaLibros.innerHTML = `
            <tr>
                <td colspan="6">No se encontraron libros con los filtros seleccionados.</td>
            </tr>
        `;

        mostrarMensaje("no se encontraron resultados.");
        return;
    }

    listaLibros.forEach((libro) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${libro.titulo}</td>
            <td>${libro.autor}</td>
            <td>${libro.genero}</td>
            <td>${libro.anio}</td>
            <td>
                <span class="${libro.estado === "Disponible" ? "estado-disponible" : "estado-prestado"}">
                    ${libro.estado}
                </span>
            </td>
            <td>
                <div class="acciones-tabla">
                    <a class="boton-tabla" href="detalle.html?id=${libro.id}">Ver detalle</a>
                    <button class="boton-tabla boton-favorito" type="button" data-id="${libro.id}">
                        Favorito
                    </button>
                </div>
            </td>
        `;

        tablaLibros.appendChild(fila);
    });

    prepararBotonesFavoritos();
    mostrarMensaje(`se encontraron ${listaLibros.length} libro(s).`);
}

function prepararBotonesFavoritos() {
    const botones = document.querySelectorAll(".boton-favorito");

    botones.forEach((boton) => {
        boton.addEventListener("click", () => {
            const idLibro = boton.dataset.id;
            guardarFavorito(idLibro);
        });
    });
}

function guardarFavorito(idLibro) {
    const favoritosGuardados = JSON.parse(localStorage.getItem("favoritosBiblioteca")) || [];

    if (!favoritosGuardados.includes(idLibro)) {
        favoritosGuardados.push(idLibro);
        localStorage.setItem("favoritosBiblioteca", JSON.stringify(favoritosGuardados));
        mostrarMensaje("libro agregado a favoritos.");
        return;
    }

    mostrarMensaje("este libro ya estaba en favoritos.");
}

function mostrarMensaje(texto) {
    const mensajeResultados = document.querySelector("#mensajeResultados");

    if (mensajeResultados) {
        mensajeResultados.textContent = texto;
    }
}