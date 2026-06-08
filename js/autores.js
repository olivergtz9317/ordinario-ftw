document.addEventListener("DOMContentLoaded", () => {
    iniciarAutores();
});

let autores = [];

function iniciarAutores() {
    cargarAutores();
    prepararEventosAutores();
}

function cargarAutores() {
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

            autores = agruparAutores(libros);

            mostrarAutores(autores);
        })
        .catch(() => {
            mostrarMensajeAutores("no fue posible cargar la información de autores.");
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
            estado: obtenerTexto(nodo, "estado")
        };
    });
}

function obtenerTexto(nodo, etiqueta) {
    const elemento = nodo.querySelector(etiqueta);
    return elemento ? elemento.textContent.trim() : "";
}

function agruparAutores(libros) {
    const mapaAutores = {};

    libros.forEach((libro) => {
        if (!mapaAutores[libro.autor]) {
            mapaAutores[libro.autor] = {
                nombre: libro.autor,
                generos: [],
                obras: []
            };
        }

        mapaAutores[libro.autor].obras.push({
            id: libro.id,
            titulo: libro.titulo,
            genero: libro.genero,
            anio: libro.anio,
            estado: libro.estado
        });

        if (!mapaAutores[libro.autor].generos.includes(libro.genero)) {
            mapaAutores[libro.autor].generos.push(libro.genero);
        }
    });

    return Object.values(mapaAutores);
}

function prepararEventosAutores() {
    const busquedaAutor = document.querySelector("#busquedaAutor");
    const btnLimpiarAutores = document.querySelector("#btnLimpiarAutores");

    if (busquedaAutor) {
        busquedaAutor.addEventListener("input", filtrarAutores);
    }

    if (btnLimpiarAutores) {
        btnLimpiarAutores.addEventListener("click", limpiarBusquedaAutores);
    }
}

function filtrarAutores() {
    const textoBusqueda = document.querySelector("#busquedaAutor").value.toLowerCase().trim();

    const autoresFiltrados = autores.filter((autor) => {
        const coincideNombre = autor.nombre.toLowerCase().includes(textoBusqueda);

        const coincideGenero = autor.generos.some((genero) => {
            return genero.toLowerCase().includes(textoBusqueda);
        });

        const coincideObra = autor.obras.some((obra) => {
            return obra.titulo.toLowerCase().includes(textoBusqueda);
        });

        return coincideNombre || coincideGenero || coincideObra;
    });

    mostrarAutores(autoresFiltrados);
}

function limpiarBusquedaAutores() {
    const busquedaAutor = document.querySelector("#busquedaAutor");

    if (busquedaAutor) {
        busquedaAutor.value = "";
    }

    mostrarAutores(autores);
}

function mostrarAutores(listaAutores) {
    const contenedor = document.querySelector("#contenedorAutores");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (listaAutores.length === 0) {
        mostrarMensajeAutores("no se encontraron autores con la búsqueda escrita.");
        return;
    }

    listaAutores.forEach((autor) => {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta", "tarjeta-autor");

        tarjeta.innerHTML = `
            <h2>${autor.nombre}</h2>
            <p class="resumen-autor">
                Autor con ${autor.obras.length} obra(s) registrada(s) en la biblioteca digital.
            </p>

            <div class="etiquetas-generos">
                ${crearEtiquetasGeneros(autor.generos)}
            </div>

            <h3>Obras registradas</h3>
            <ul class="lista-obras">
                ${crearListaObras(autor.obras)}
            </ul>
        `;

        contenedor.appendChild(tarjeta);
    });

    mostrarMensajeAutores(`se encontraron ${listaAutores.length} autor(es).`);
}

function crearEtiquetasGeneros(generos) {
    return generos.map((genero) => {
        return `<span class="etiqueta-genero">${genero}</span>`;
    }).join("");
}

function crearListaObras(obras) {
    return obras.map((obra) => {
        return `
            <li>
                <a href="detalle.html?id=${obra.id}">
                    ${obra.titulo}
                </a>
                <br>
                <small>${obra.genero} · ${obra.anio} · ${obra.estado}</small>
            </li>
        `;
    }).join("");
}

function mostrarMensajeAutores(texto) {
    const mensajeAutores = document.querySelector("#mensajeAutores");

    if (mensajeAutores) {
        mensajeAutores.textContent = texto;
    }
}