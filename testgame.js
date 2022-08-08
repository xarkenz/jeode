class TestGame extends Jeode {

    constructor() {
        super();

        this.attachController(new Jeode.controllers.Physics(this));

        const background = this.createEntity();
        background.set(Jeode.attributes.APPEARANCE_2D, {layer: 0, render: (ctx, dt) => {
            ctx.fillStyle = "#ddd";
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.strokeStyle = "#bbb";
            ctx.lineWidth = 200;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            let x = (50 * this.time) % 600 - 600, cy = 0.5 * this.height;
            ctx.moveTo(x, cy - 100);
            while (x <= this.width) {
                ctx.bezierCurveTo(x + 150, cy - 100, x + 150, cy + 100, x + 300, cy + 100);
                ctx.bezierCurveTo(x + 450, cy + 100, x + 450, cy - 100, x + 600, cy - 100);
                x += 600;
            }
            ctx.stroke();
        }});

        const testEntity = this.createEntity();
        testEntity.set(Jeode.attributes.POSITION, {x: 50, y: 50});
        testEntity.set(Jeode.attributes.VELOCITY, {x: 75, y: 50});
        testEntity.set(Jeode.attributes.APPEARANCE_2D, {layer: 1, render: (ctx, dt) => {
            const position = testEntity.get(Jeode.attributes.POSITION);
            ctx.fillStyle = "powderblue";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.ellipse(position.x, position.y, 20, 20, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(position.x, position.y, 13, 13, 0, 0.25 * Math.PI, 0.75 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(position.x - 6, position.y - 6, 2, 2, 0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(position.x + 6, position.y - 6, 2, 2, 0, 0, 2 * Math.PI);
            ctx.stroke();
        }});
    }

}

window.addEventListener("load", event => {
    const testGame = new TestGame();
    document.body.appendChild(testGame.element);
    testGame.run();
});