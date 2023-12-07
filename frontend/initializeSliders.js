export function initializeSliders(config) {
    const $slider1 = document.querySelector("#slider1");
    config.setNodeSize($slider1.value);
    $slider1.addEventListener("change", (e) => {
        config.setNodeSize(e.target.value);
    });

    const $slider2 = document.querySelector("#slider2");
    config.setEdgeSize($slider2.value);
    $slider2.addEventListener("change", (e) => {
        config.setEdgeSize(e.target.value);
    });
}
