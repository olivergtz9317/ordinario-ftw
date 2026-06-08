document.addEventListener("DOMContentLoaded", () => {
    iniciarEstadisticas();
});

let librosEstadisticas = [];

function iniciarEstadisticas() {
    cargarDatosEstadisticas();
    prepararEventosEstadisticas();
}

function cargarDatosEstadisticas() {
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

            librosEstadisticas = convertirXmlALibros(xml);

            cargarGenerosEstadisticas(librosEstadisticas);
            mostrarEstadisticas(librosEstadisticas);
        })
        .catch(() => {
            mostrarMensajeEstadisticas("no fue posible cargar las estadísticas.");
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

function cargarGenerosEstadisticas(libros) {
    const filtroGenero = document.querySelector("#filtroEstadisticaGenero");

    if (!filtroGenero) {
        return;
    }

    const generos = [...new Set(libros.map((libro) => libro.genero))];

    generos.forEach((genero) => {
        const opcion = document.createElement("option");
        opcion.value = genero;
        opcion.textContent = genero;
        filtroGenero.appendChild(opcion);
    });
}

function prepararEventosEstadisticas() {
    const filtroGenero = document.querySelector("#filtroEstadisticaGenero");
    const btnLimpiar = document.querySelector("#btnLimpiarEstadisticas");

    if (filtroGenero) {
        filtroGenero.addEventListener("change", filtrarEstadisticas);
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", limpiarFiltroEstadisticas);
    }
}

function filtrarEstadisticas() {
    const generoSeleccionado = document.querySelector("#filtroEstadisticaGenero").value;

    const librosFiltrados = generoSeleccionado === ""
        ? librosEstadisticas
        : librosEstadisticas.filter((libro) => libro.genero === generoSeleccionado);

    mostrarEstadisticas(librosFiltrados);
}

function limpiarFiltroEstadisticas() {
    const filtroGenero = document.querySelector("#filtroEstadisticaGenero");

    if (filtroGenero) {
        filtroGenero.value = "";
    }

    mostrarEstadisticas(librosEstadisticas);
}

function mostrarEstadisticas(libros) {
    mostrarResumen(libros);
    mostrarTablaGeneros(libros);
    mostrarTablaAnios(libros);
    mostrarMensajeEstadisticas(`estadísticas generadas con ${libros.length} libro(s).`);
}

function mostrarResumen(libros) {
    const totalLibros = document.querySelector("#totalLibros");
    const totalGeneros = document.querySelector("#totalGeneros");
    const totalDisponibles = document.querySelector("#totalDisponibles");

    const generos = [...new Set(libros.map((libro) => libro.genero))];
    const disponibles = libros.filter((libro) => libro.estado === "Disponible");

    if (totalLibros) {
        totalLibros.textContent = libros.length;
    }

    if (totalGeneros) {
        totalGeneros.textContent = generos.length;
    }

    if (totalDisponibles) {
        totalDisponibles.textContent = disponibles.length;
    }
}

function mostrarTablaGeneros(libros) {
    const tabla = document.querySelector("#tablaEstadisticas");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    if (libros.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4">No hay datos para mostrar.</td>
            </tr>
        `;
        return;
    }

    const datosGeneros = {};

    libros.forEach((libro) => {
        if (!datosGeneros[libro.genero]) {
            datosGeneros[libro.genero] = {
                total: 0,
                disponibles: 0,
                prestados: 0
            };
        }

        datosGeneros[libro.genero].total++;

        if (libro.estado === "Disponible") {
            datosGeneros[libro.genero].disponibles++;
        } else {
            datosGeneros[libro.genero].prestados++;
        }
    });

    Object.keys(datosGeneros).forEach((genero) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${genero}</td>
            <td>${datosGeneros[genero].total}</td>
            <td>${datosGeneros[genero].disponibles}</td>
            <td>${datosGeneros[genero].prestados}</td>
        `;

        tabla.appendChild(fila);
    });
}

function mostrarTablaAnios(libros) {
    const tabla = document.querySelector("#tablaAnios");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    if (libros.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="2">No hay datos para mostrar.</td>
            </tr>
        `;
        return;
    }

    const datosAnios = {};

    libros.forEach((libro) => {
        if (!datosAnios[libro.anio]) {
            datosAnios[libro.anio] = 0;
        }

        datosAnios[libro.anio]++;
    });

    Object.keys(datosAnios)
        .sort()
        .forEach((anio) => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${anio}</td>
                <td>${datosAnios[anio]}</td>
            `;

            tabla.appendChild(fila);
        });
}

function mostrarMensajeEstadisticas(texto) {
    const mensaje = document.querySelector("#mensajeEstadisticas");

    if (mensaje) {
        mensaje.textContent = texto;
    }
}