class TestGame extends Jeode {

    constructor() {
        super();

        this.attachController(new Jeode.controllers.Physics(this));

        const background = this.createEntity();
        background.set(Jeode.attributes.APPEARANCE_2D, {layer: 0, render: (ctx, dt) => {
            ctx.fillStyle = "#eee";
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = 100;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            const above = new Path2D(), below = new Path2D();
            let x = (50 * this.time) % 600 - 600, cy = 0.5 * this.height;
            ctx.moveTo(x, cy - 100);
            above.moveTo(x, cy - 400);
            below.moveTo(x, cy + 200);
            while (x <= this.width) {
                ctx.bezierCurveTo(x + 150, cy - 100, x + 150, cy + 100, x + 300, cy + 100);
                ctx.bezierCurveTo(x + 450, cy + 100, x + 450, cy - 100, x + 600, cy - 100);
                above.bezierCurveTo(x + 150, cy - 400, x + 150, cy - 200, x + 300, cy - 200);
                above.bezierCurveTo(x + 450, cy - 200, x + 450, cy - 400, x + 600, cy - 400);
                below.bezierCurveTo(x + 150, cy + 200, x + 150, cy + 400, x + 300, cy + 400);
                below.bezierCurveTo(x + 450, cy + 400, x + 450, cy + 200, x + 600, cy + 200);
                x += 600;
            }
            ctx.stroke();
            ctx.strokeStyle = "#ddd";
            ctx.stroke(above);
            ctx.stroke(below);
        }});

        const renderSmiley = (smiley, color) => (ctx, dt) => {
            const position = smiley.get(Jeode.attributes.POSITION);
            ctx.fillStyle = color;
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
        };
        const bounceSmiley = (smiley) => (dt) => {
            const position = smiley.get(Jeode.attributes.POSITION);
            const velocity = smiley.get(Jeode.attributes.VELOCITY);
            const newX = position.x + velocity.x * dt, newY = position.y + velocity.y * dt;
            if (newX + 20 > this.width) {
                position.x = position.x + 20 > this.width ? this.width - 20 : position.x + 2 * (this.width - 20 - position.x);
                velocity.x = -Math.abs(velocity.x);
            } else if (newX - 20 < 0) {
                position.x = position.x - 20 < 0 ? 20 : position.x + 2 * (20 - position.x);
                velocity.x = Math.abs(velocity.x);
            }
            if (newY + 20 > this.height) {
                position.y = position.y + 20 > this.height ? this.height - 20 : position.y + 2 * (this.height - 20 - position.y);
                velocity.y = -Math.abs(velocity.y);
            } else if (newY - 20 < 0) {
                position.y = position.y - 20 < 0 ? 20 : position.y + 2 * (20 - position.y);
                velocity.y = Math.abs(velocity.y);
            }
        };

        const smiley1 = this.createEntity();
        smiley1.set(Jeode.attributes.POSITION, {x: 200, y: 200});
        smiley1.set(Jeode.attributes.VELOCITY, {x: 75, y: 50});
        smiley1.set(Jeode.attributes.APPEARANCE_2D, {layer: 1, render: renderSmiley(smiley1, "powderblue")});
        smiley1.set(Jeode.attributes.SCRIPT, bounceSmiley(smiley1));
        const smiley2 = this.createEntity();
        smiley2.set(Jeode.attributes.POSITION, {x: 100, y: 300});
        smiley2.set(Jeode.attributes.VELOCITY, {x: 140, y: 40});
        smiley2.set(Jeode.attributes.APPEARANCE_2D, {layer: 1, render: renderSmiley(smiley2, "lightgreen")});
        smiley2.set(Jeode.attributes.SCRIPT, bounceSmiley(smiley2));
        const smiley3 = this.createEntity();
        smiley3.set(Jeode.attributes.POSITION, {x: 300, y: 100});
        smiley3.set(Jeode.attributes.VELOCITY, {x: 60, y: 110});
        smiley3.set(Jeode.attributes.APPEARANCE_2D, {layer: 1, render: renderSmiley(smiley3, "khaki")});
        smiley3.set(Jeode.attributes.SCRIPT, bounceSmiley(smiley3));
    }

}

window.addEventListener("load", event => {
    const testGame = new TestGame();
    document.body.appendChild(testGame.element);
    testGame.run();
});