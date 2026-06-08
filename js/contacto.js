document.addEventListener("DOMContentLoaded", () => {
    iniciarFormularioContacto();
});

let correosValidos = [];

function iniciarFormularioContacto() {
    cargarUsuariosValidos();
    prepararFormulario();
    prepararRangoPrioridad();
}

function cargarUsuariosValidos() {
    fetch("../data/usuarios.xml")
        .then((respuesta) => {
            if (!respuesta.ok) {
                throw new Error("no se pudo cargar el archivo xml de usuarios");
            }

            return respuesta.text();
        })
        .then((textoXml) => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(textoXml, "application/xml");

            correosValidos = Array.from(xml.querySelectorAll("usuario")).map((usuario) => {
                return obtenerTexto(usuario, "correo").toLowerCase();
            });
        })
        .catch(() => {
            mostrarMensajeFormulario("no fue posible cargar usuarios.xml para validar correos.", false);
        });
}

function obtenerTexto(nodo, etiqueta) {
    const elemento = nodo.querySelector(etiqueta);
    return elemento ? elemento.textContent.trim() : "";
}

function prepararFormulario() {
    const formulario = document.querySelector("#formularioContacto");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        validarFormulario(formulario);
    });
}

function prepararRangoPrioridad() {
    const prioridad = document.querySelector("#prioridad");
    const valorPrioridad = document.querySelector("#valorPrioridad");

    if (!prioridad || !valorPrioridad) {
        return;
    }

    prioridad.addEventListener("input", () => {
        valorPrioridad.textContent = prioridad.value;
    });
}

function validarFormulario(formulario) {
    limpiarErrores();

    const nombre = document.querySelector("#nombre");
    const correo = document.querySelector("#correo");
    const tipoMensaje = document.querySelector("#tipoMensaje");
    const mensaje = document.querySelector("#mensaje");
    const confirmacion = document.querySelector("#confirmacion");

    let formularioValido = true;

    if (nombre.value.trim().length < 3) {
        marcarError(nombre);
        formularioValido = false;
    }

    if (!correo.value.includes("@") || !correo.value.includes(".")) {
        marcarError(correo);
        formularioValido = false;
    }

    if (!correosValidos.includes(correo.value.trim().toLowerCase())) {
        marcarError(correo);
        formularioValido = false;
    }

    if (tipoMensaje.value === "") {
        marcarError(tipoMensaje);
        formularioValido = false;
    }

    if (mensaje.value.trim().length < 10) {
        marcarError(mensaje);
        formularioValido = false;
    }

    if (!confirmacion.checked) {
        formularioValido = false;
    }

    if (!formularioValido) {
        mostrarMensajeFormulario(
            "revisa los campos marcados. el correo debe existir en usuarios.xml.",
            false
        );
        return;
    }

    mostrarMensajeFormulario("mensaje enviado correctamente. los datos fueron validados contra xml.", true);
    formulario.reset();

    const valorPrioridad = document.querySelector("#valorPrioridad");

    if (valorPrioridad) {
        valorPrioridad.textContent = "3";
    }
}

function marcarError(elemento) {
    const campo = elemento.closest(".campo");

    if (campo) {
        campo.classList.add("campo-error");
    }
}

function limpiarErrores() {
    const campos = document.querySelectorAll(".campo");

    campos.forEach((campo) => {
        campo.classList.remove("campo-error");
    });
}

function mostrarMensajeFormulario(texto, esExito) {
    const mensajeFormulario = document.querySelector("#mensajeFormulario");

    if (!mensajeFormulario) {
        return;
    }

    mensajeFormulario.hidden = false;
    mensajeFormulario.textContent = texto;

    mensajeFormulario.classList.remove("mensaje-error", "mensaje-exito");

    if (esExito) {
        mensajeFormulario.classList.add("mensaje-exito");
    } else {
        mensajeFormulario.classList.add("mensaje-error");
    }
}