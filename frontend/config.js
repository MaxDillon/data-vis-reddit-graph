export class Config extends EventTarget {
    constructor() {
        super();
        this.sliders = {};

        this.nodeSize = this.addSlider("#node-size");
        this.edgeSize = this.addSlider("#edge-size");

        this.nodeForce = this.addSlider("#node-force");
        this.edgeForce = this.addSlider("#edge-force");

        this.maxNodes = this.addSlider("#max-nodes");

        this.minSentiment = this.addSlider("#min-sentiment");
        this.maxSentiment = this.addSlider("#max-sentiment");

        this.minTime = this.addSlider("#min-time");
        this.maxTime = this.addSlider("#max-time");

        this.selected = null;
        const $resetSelect = document.querySelector("#reset-select");
        $resetSelect.addEventListener("click", () => this.clearSelcted());
    }

    addSlider(id) {
        const $slider = document.querySelector(id);
        if (!$slider) return;
        this.sliders[id] = parseFloat($slider.value);

        $slider.addEventListener("change", (e) => {
            this.sliders[id] = parseFloat(e.target.value);
            this.dispatchEvent(new CustomEvent("update", { config: this }));
            this.dispatchEvent(
                new CustomEvent(id, { detail: this.sliders[id] })
            );
        });

        const callback = () => this.sliders[id];
        callback.listen = (cb) =>
            this.addEventListener(id, (e) => cb(e.detail));
        return callback;
    }

    dispatch(event = "update") {
        this.dispatchEvent(new CustomEvent(event, { config: this }));
    }

    clearSelcted() {
        this.selected = null;
        this.dispatchEvent(new CustomEvent("selected", {}));
    }

    setSelected(value) {
        console.log(value);
        this.selected = value;
        this.dispatchEvent(new CustomEvent("selected", {}));
    }

    listenSelected(cb) {
        this.addEventListener("selected", () => cb(this.selected));
    }
}
