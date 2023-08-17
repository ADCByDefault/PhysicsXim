class LineEquation {
    /**
     *
     * @param {number} mx
     * @param {number} c
     */
    constructor(m, c) {
        this.m = m;
        this.c = c;
    }
    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvas
     */
    draw(ctx, canvas) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(0, this.c);
        ctx.lineTo(canvas.width, this.m * canvas.width + this.c);
        ctx.stroke();
        ctx.restore();
    }
}
class Position {
    /**
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Velocity {
    /**
     *
     * @param {number} module
     * @param {number} angle
     */
    constructor(module, angle) {
        this.module = module;
        this.angle = -angle % 360;
        this.angle = this.angle < 0 ? 360 + this.angle : this.angle;
        this.angle = angle == 90 ? 89.999999999 : this.angle;
        this.angle = angle == 270 ? 269.999999999 : this.angle;
    }
    /**@returns {number} */
    getSpeedX() {
        return this.module * Math.cos((this.angle / 180) * Math.PI);
    }
    /**@returns {number} */
    getSpeedY() {
        return this.module * Math.sin((this.angle / 180) * Math.PI);
    }
}
class Ball {
    /**
     *
     * @param {Position} position
     * @param {Velocity} velocity
     * @param {number} radius
     */
    constructor(position, velocity, radius) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
    }
    /**@param {CanvasRenderingContext2D} ctx  */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    /**@returns {LineEquation} */
    getEquation() {
        let pointA = this.position;
        let pointB = new Position(
            this.position.x + this.velocity.getSpeedX(),
            this.position.y + this.velocity.getSpeedY()
        );
        let mx = (pointB.y - pointA.y) / (pointB.x - pointA.x);
        let c = pointA.y - mx * pointA.x;
        return new LineEquation(mx, c);
    }
}

class Box {
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }
    /**@param {CanvasRenderingContext2D} ctx  */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.restore();
    }
}

/**@type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas");
/**@type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ball = new Ball(new Position(100, 100), new Velocity(10, 45), 5);

const box = new Box(new Position(200, 200), 100, 100);

function animate() {
    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.draw(ctx);
    box.draw(ctx);
    ball.getEquation().draw(ctx, canvas);
}

animate();
