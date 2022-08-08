class Jeode {

    #HAS_APPEARANCE_2D;
    #HAS_APPEARANCE_3D;

    #element;
    #running;
    #time;
    #nextEntity;
    #entities;
    #freedEntities;
    #entityBehavior;
    #entityData;
    #controllers;
    #layers;

    get element() { return this.#element; }
    get width() { return this.#element.clientWidth; }
    get height() { return this.#element.clientHeight; }
    get running() { return this.#running; }
    get time() { return this.#time; }

    constructor() {
        this.#HAS_APPEARANCE_2D = Jeode.behavior(Jeode.attributes.APPEARANCE_2D);
        this.#HAS_APPEARANCE_3D = Jeode.behavior(Jeode.attributes.APPEARANCE_3D);
        this.#element = document.createElement("div");
        this.#element.className = "jeode-game";
        this.#element.style = "position: absolute; left:0; top:0; width:100%; height:100%";
        this.#running = false;
        this.#time = 0;
        this.#nextEntity = 1;
        this.#entities = [];
        this.#freedEntities = [];
        this.#entityBehavior = [];
        this.#entityData = [];
        this.#controllers = [];
        this.#layers = [];
    }

    createEntity() {
        const entity = this.#freedEntities.length ? this.#freedEntities.pop() : this.#nextEntity++;
        this.#entities.push(entity);
        this.#entityData[entity] = [];
        this.#entityBehavior[entity] = Jeode.behavior();
        return this.getEntity(entity);
    }

    getEntity(entity) {
        return new Jeode.Entity(this, entity);
    }

    *queryEntities(behavior) {
        for (const entity of this.#entities.filter(entity => Jeode.behavior.fits(this.#entityBehavior[entity], behavior)))
            yield new Jeode.Entity(this, entity);
    }

    destroyEntity(entity) {
        this.#entities.splice(this.#entities.indexOf(entity), 1);
        this.#entityBehavior[entity] = undefined;
        this.#entityData[entity] = undefined;
        this.#freedEntities.unshift(entity);
    }

    getAttribute(entity, attribute) {
        return Jeode.behavior.has(this.#entityBehavior[entity], attribute) ? this.#entityData[entity][attribute] : undefined;
    }

    setAttribute(entity, attribute, data) {
        this.#entityData[entity][attribute] = data;
        Jeode.behavior.set(this.#entityBehavior[entity], attribute, true);
    }

    removeAttribute(entity, attribute) {
        Jeode.behavior.set(this.#entityBehavior[entity], attribute, false);
        this.#entityData[entity][attribute] = undefined;
    }

    attachController(controller) {
        this.#controllers.push(controller);
    }

    getController(type) {
        return this.#controllers.find(controller => controller.constructor === type);
    }

    detachController(type) {
        this.#controllers.splice(this.#controllers.findIndex(controller => controller.constructor === type), 1);
    }

    #addLayer(layer, is3D) {  // TODO: support for 3D with three.js
        if (typeof layer !== "number" || (layer | 0) !== layer) throw new TypeError("'layer' must be an integer (highest layer is frontmost).");
        let element = null, ctx = null;
        if (this.#running) {
            element = document.createElement("canvas");
            ctx = element.getContext("2d");
            element.className = "jeode-game-layer";
            element.style = `position: absolute; left: 0; top: 0; z-index: ${layer}`;
            this.#element.appendChild(element);
        }
        this.#layers[layer] = {element, ctx, is3D};
    }

    run() {
        this.#running = true;
        this.#layers.forEach(layer => {
            layer.element = document.createElement("canvas");
            layer.ctx = layer.element.getContext("2d");
        });
        if (this.start) this.start();
        for (let controller of this.#controllers) if (controller.start) controller.start();
        let lastTime, dt;
        const frameCallback = (time) => {
            this.#time = time * 0.001;
            dt = lastTime === undefined ? 0 : this.#time - lastTime;
            lastTime = this.#time;
            for (let controller of this.#controllers) if (controller.update) controller.update(dt);
            if (this.update) this.update(dt);
            this.#layers.forEach(layer => {
                if (layer.element.width !== this.width || layer.element.height !== this.height) {
                    layer.element.width = this.width;
                    layer.element.height = this.height;
                }
                if (!layer.is3D) layer.ctx.clearRect(0, 0, this.width, this.height);
            });
            let appearance;
            for (let entity of this.queryEntities(this.#HAS_APPEARANCE_2D)) {
                appearance = entity.get(Jeode.attributes.APPEARANCE_2D);
                if (!this.#layers[appearance.layer]) this.#addLayer(appearance.layer, false);
                appearance.render(this.#layers[appearance.layer].ctx, dt);
            }
            for (let entity of this.queryEntities(this.#HAS_APPEARANCE_3D)) {
                appearance = entity.get(Jeode.attributes.APPEARANCE_3D);
                if (!this.#layers[appearance.layer]) this.#addLayer(appearance.layer, true);
                appearance.render(this.#layers[appearance.layer].ctx, dt);
            }
            if (this.#running) window.requestAnimationFrame(frameCallback);
            else {
                for (let controller of this.#controllers) if (controller.end) controller.end();
                if (this.end) this.end();
                this.#layers.forEach(layer => {
                    if (layer.element) layer.element.remove();
                });
                this.#layers = [];
                this.#running = false;
            }
        };
        window.requestAnimationFrame(frameCallback);
    }

}


Jeode.Entity = class {

    #game;
    #id;

    get game() { return this.#game; }
    get id() { return this.#id; }

    constructor(game, id) {
        this.#game = game;
        this.#id = id;
    }

    destroy() { this.#game.destroyEntity(this.#id); }
    get(attribute) { return this.#game.getAttribute(this.#id, attribute); }
    set(attribute, data) { this.#game.setAttribute(this.#id, attribute, data); }
    remove(attribute) { this.#game.removeAttribute(this.#id, attribute); }

};


Jeode.attribute = () => Jeode.attribute.count++;
Jeode.attribute.count = 0;

Jeode.attributes = {
    POSITION: Jeode.attribute(),
    VELOCITY: Jeode.attribute(),
    GRAVITY: Jeode.attribute(),
    MASS: Jeode.attribute(),
    APPEARANCE_2D: Jeode.attribute(),
    APPEARANCE_3D: Jeode.attribute(),
    ACTION_MOUSE_MOVE: Jeode.attribute(),
    ACTION_MOUSE_DOWN: Jeode.attribute(),
    ACTION_MOUSE_UP: Jeode.attribute(),
    HEALTH: Jeode.attribute(),
};


Jeode.behavior = (...attributes) => {
    const behavior = new Int32Array((Jeode.attribute.count >>> 5) + 1);
    for (let id of attributes) {
        if (id < 0 || id >= Jeode.attribute.count) throw RangeError(`Attribute ID ${id} out of range 0 <= x < ${Jeode.attribute.count}.`);
        behavior[id >>> 5] |= 1 << id;
    }
    return behavior;
};

Jeode.behavior.set = (behavior, attribute, value) => value ? (behavior[attribute >>> 5] |= 1 << attribute) : (behavior[attribute >>> 5] &= ~(1 << attribute));

Jeode.behavior.has = (behavior, attribute) => !!(behavior[attribute >>> 5] & (1 << attribute));

Jeode.behavior.fits = (behavior, desired) => {
    for (let i = 0; i < desired.length; i++)
        if ((behavior[i] & desired[i]) != desired[i]) return false;
    return true;
};

Jeode.behaviour = Jeode.behavior;  // Alias with alternate spelling


Jeode.Controller = class {

    #game;
    #active;

    get game() { return this.#game; }
    get active() { return this.#active; }
    set active(value) { return this.#active = value; }

    constructor(game) {
        this.#game = game;
        this.#active = true;
    }

};


Jeode.controllers = {

    Physics: class extends Jeode.Controller {

        #HAS_MOVEMENT;

        constructor(game) {
            super(game);
            this.#HAS_MOVEMENT = Jeode.behavior(Jeode.attributes.POSITION, Jeode.attributes.VELOCITY);
        }

        start() {
            
        }

        update(dt) {
            let position, velocity;
            for (let entity of this.game.queryEntities(this.#HAS_MOVEMENT)) {
                position = entity.get(Jeode.attributes.POSITION);
                velocity = entity.get(Jeode.attributes.VELOCITY);
                position.x += velocity.x * dt;
                position.y += velocity.y * dt;
            }
        }

        end() {
            
        }

    }

};