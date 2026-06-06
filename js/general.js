document.addEventListener("DOMContentLoaded", () => {
    marcarEnlaceActivo();
    colocarAnioActual();
});

function marcarEnlaceActivo() {
    const enlaces = document.querySelectorAll(".menu a");
    const rutaActual = window.location.pathname;

    enlaces.forEach((enlace) => {
        const rutaEnlace = enlace.getAttribute("href");

        if (rutaActual.includes(rutaEnlace.replace("../", ""))) {
            enlace.classList.add("activo");
        }

        if (rutaActual.endsWith("/") && rutaEnlace.includes("index.html")) {
            enlace.classList.add("activo");
        }
    });
}

function colocarAnioActual() {
    const elementoAnio = document.querySelector("#anioActual");

    if (elementoAnio) {
        elementoAnio.textContent = new Date().getFullYear();
    }
}