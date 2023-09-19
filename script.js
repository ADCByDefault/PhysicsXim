/**@type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas");
/**@type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 1;
canvas.height = window.innerHeight - 1;
const toDraw = new Array();
const toUpdate = new Array();
const collisions = new Array();

class Vector {
    /**@type {CanvasRenderingContext2D} */
    static ctx = null;
    /**
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    duplicate() {
        return new Vector(this.x, this.y);
    }
    getMagnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    getUnitVector() {
        return this.multiply(1 / this.getMagnitude());
    }
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    draw(dx, dy) {
        dx = dx ? dx : 0;
        dy = dy ? dy : 0;
        /**@type {CanvasRenderingContext2D} */
        let ctx = Vector.ctx;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + this.x, dy + this.y);
        ctx.stroke();
    }
    drawAsPoint(dx, dy) {
        dx = dx ? dx : 0;
        dy = dy ? dy : 0;
        /**@type {CanvasRenderingContext2D} */
        let ctx = Vector.ctx;
        ctx.beginPath();
        ctx.arc(dx + this.x, dy + this.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}
Vector.ctx = ctx;
class Collision {
    /**
     *
     * @param {boolean} collision
     * @param {Vector} collisionPoint
     */
    constructor(object1, object2, collision, collisionPoint, relativeVelocity) {
        this.object1 = object1;
        this.object2 = object2;
        this.collision = collision;
        this.collisionPoint = collisionPoint;
        this.relativeVelocity = relativeVelocity;
        this.elasticity = 1;
    }
}
class Ball {
    static balls = new Array();
    static acceleration = new Vector(0, 0.1);
    /**@type {CanvasRenderingContext2D} */
    static ctx = null;
    constructor(position, velocity, radius, options) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.mass = options.mass ? options.mass : 1;
        this.options = options;
        toDraw.push(this);
        toUpdate.push(this);
    }
    update() {
        this.velocity = this.velocity.add(Ball.acceleration);
        this.position = this.position.add(this.velocity);
    }
    draw() {
        /**
         * @type {CanvasRenderingContext2D}
         */
        let ctx = Ball.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.options.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    //solve collsion by impulse
    solveCollision(collision) {
        let elasticity = collision.elasticity;
        let collisionPoint = collision.collisionPoint;
        let relativeVelocity = collision.relativeVelocity;
        let collisionNormal = this.position
            .subtract(collisionPoint)
            .getUnitVector();
        let relativeVelocityAlongNormal = relativeVelocity.dot(collisionNormal);
        let impulseScalar =
            (-(1 + elasticity) * relativeVelocityAlongNormal) /
            (this.getInverseMass() + collision.object2.getInverseMass());
        let impulse = collisionNormal.multiply(impulseScalar);
        this.velocity = this.velocity.add(
            impulse.multiply(this.getInverseMass())
        );
    }
    getInverseMass() {
        return 1 / this.mass;
    }
}
Ball.ctx = ctx;
class Line {
    static ctx = null;
    constructor(start, end, options) {
        this.start = start;
        this.end = end;
        this.options = options;
        this.velocity = new Vector(0, 0);
        toDraw.push(this);
        collisions.push(this);
    }
    getInverseMass() {
        let m = this.options.mass ? this.options.mass : Infinity;
        return 1 / m;
    }
    draw() {
        /**
         * @type {CanvasRenderingContext2D}
         */
        let ctx = Line.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = this.options.color;
        ctx.lineWidth = this.options.width;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
    getLength() {
        return this.start.subtract(this.end).getMagnitude();
    }
    getNearestPoint(point) {
        let lineVector = this.end.subtract(this.start);
        let pointVector = point.subtract(this.start);
        let lineVectorMagnitude = lineVector.getMagnitude();
        let lineVectorUnit = lineVector.getUnitVector();
        let dotProduct =
            pointVector.x * lineVectorUnit.x + pointVector.y * lineVectorUnit.y;
        let nearestPointVector = lineVectorUnit.multiply(dotProduct);
        let nearestPoint = nearestPointVector.add(this.start);
        if (dotProduct / lineVectorMagnitude < 0) {
            return this.start;
        }
        if (dotProduct / lineVectorMagnitude > 1) {
            return this.end;
        }
        return nearestPoint;
    }
    getCollision(ball) {
        let collision = new Collision(ball, this, false, null, null);
        collision.relativeVelocity = ball.velocity.subtract(this.velocity);
        let nearestPoint = this.getNearestPoint(ball.position);
        let distance = nearestPoint.subtract(ball.position).getMagnitude();
        collision.collisionPoint = nearestPoint;
        if (distance < ball.radius) {
            collision.collision = true;
        }
        return collision;
    }
}
Line.ctx = ctx;
const ballOptions = {
    color: "red",
    mass: 1,
};
const lineOptions = {
    color: "red",
    mass: Infinity,
    width: 1,
};
new Line(new Vector(50, 90), new Vector(600, 200), lineOptions);
new Line(new Vector(600, 200), new Vector(600, 400), lineOptions);
new Line(new Vector(50, 290), new Vector(600, 400), lineOptions);
new Line(new Vector(50, 90), new Vector(50, 290), lineOptions);

let b = new Ball(new Vector(200, 200), new Vector(0, 0), 30, ballOptions);

let req;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toDraw.forEach((e) => {
        e.draw();
    });
    collisions.forEach((e) => {
        let collision = e.getCollision(b);
        drawPoint(collision.collisionPoint);
        drawLine(b.position, collision.collisionPoint);
        if (collision.collision) {
            b.solveCollision(collision);
        }
        b.options.color = collision.collision ? "green" : "red";
    });
    toUpdate.forEach((e) => {
        e.update();
    });
    req = window.requestAnimationFrame(animate);
}
req = window.requestAnimationFrame(animate);

window.addEventListener("mousemove", (e) => {
    b.position = new Vector(e.clientX, e.clientY);
});

function drawLine(vec1, vec2) {
    ctx.beginPath();
    ctx.moveTo(vec1.x, vec1.y);
    ctx.lineTo(vec2.x, vec2.y);
    ctx.stroke();
}

function drawPoint(vec) {
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, 2, 0, 2 * Math.PI);
    ctx.fill();
}
