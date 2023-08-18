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
    /**
     *
     * @param {number} x
     * @returns {number}
     */
    getYByX(x) {
        return this.m * x + this.c;
    }
    /**
     *
     * @param {Position} pointA
     * @param {Position} pointB
     * @returns {LineEquation}
     */
    static getEquationByPoints(pointA, pointB) {
        pointA = { ...pointA };
        pointB = { ...pointB };
        if (pointA.x == pointB.x) pointA.x += 0.00000001;
        let m = (pointB.y - pointA.y) / (pointB.x - pointA.x);
        let c = pointA.y - m * pointA.x;
        return new LineEquation(m, c);
    }
    /**
     *
     * @param {LineEquation} lineB
     * @param {LineEquation} lineA
     * @returns {boolean}
     */
    static IsParallel(lineA, lineB) {
        return lineA.m === lineB.m;
    }
    /**
     *
     * @param {LineEquation} lineA
     * @param {LineEquation} lineB
     * @returns {Position}
     */
    static getIntersectionPoint(lineA, lineB) {
        if (LineEquation.IsParallel(lineA, lineB)) return null;
        let x = (lineB.c - lineA.c) / (lineA.m - lineB.m);
        let y = lineA.getYByX(x);
        x = parseInt(x.toFixed(0));
        y = parseInt(y.toFixed(0));
        return new Position(x, y);
    }
    static getLineIntersectionAngle(lineA, lineB) {
        if (!lineA || !lineB) return null;
        let angle = Math.atan((lineA.m - lineB.m) / (1 + lineA.m * lineB.m));
        return parseInt(((angle * 180) / Math.PI).toFixed(0));
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
    /**@param {CanvasRenderingContext2D} ctx  */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    /**
     *
     * @param {Position} pointA
     * @param {Position} pointB
     * @returns
     */
    static getDistance(pointA, pointB) {
        return Math.sqrt(
            Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
        );
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
        this.angle = angle % 360;
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
    draw(ctx, position) {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        ctx.lineTo(
            position.x + this.getSpeedX(),
            position.y + this.getSpeedY()
        );
        ctx.stroke();
        ctx.restore();
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
        return LineEquation.getEquationByPoints(pointA, pointB);
    }
    /**@param {Position} position  */
    setPosition(position) {
        this.position = position;
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
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
    /**@returns {Position[]} */
    getBoundaries() {
        return [
            this.position,
            new Position(
                this.position.x + this.width,
                this.position.y + this.height
            ),
        ];
    }
    /**@returns {LineEquation[]} */
    getBoundariesEquations() {
        let top = LineEquation.getEquationByPoints(
            ...this.getTopBoundaryPoints()
        );
        let right = LineEquation.getEquationByPoints(
            ...this.getRightBoundaryPoints()
        );
        let bottom = LineEquation.getEquationByPoints(
            ...this.getBottomBoundaryPoints()
        );
        let left = LineEquation.getEquationByPoints(
            ...this.getleftBoundaryPoints()
        );
        return [top, right, bottom, left];
    }
    /**@returns {Position[]} */
    getleftBoundaryPoints() {
        let PointA = this.position;
        let PointB = new Position(
            this.position.x,
            this.position.y + this.height
        );
        return [PointA, PointB];
    }
    /**@returns {Position[]} */
    getRightBoundaryPoints() {
        let PointA = new Position(
            this.position.x + this.width,
            this.position.y
        );
        let PointB = new Position(
            this.position.x + this.width,
            this.position.y + this.height
        );
        return [PointA, PointB];
    }
    /**@returns {Position[]} */
    getTopBoundaryPoints() {
        let PointA = this.position;
        let PointB = new Position(
            this.position.x + this.width,
            this.position.y
        );
        return [PointA, PointB];
    }
    /**@returns {Position[]} */
    getBottomBoundaryPoints() {
        let PointA = new Position(
            this.position.x,
            this.position.y + this.height
        );
        let PointB = new Position(
            this.position.x + this.width,
            this.position.y + this.height
        );
        return [PointA, PointB];
    }
    /**
     *
     * @param {Ball} ball
     * @returns {Object}
     */
    getLinearIntersectionPointWithBall(ball) {
        let line = ball.getEquation();
        let intersection = null;
        let intersectionLine = null;
        let Distance = null;
        let boundaries = this.getBoundaries();
        this.getBoundariesEquations().forEach((eq, i) => {
            let point = LineEquation.getIntersectionPoint(line, eq);
            if (point == null) return;
            {
                if (point.x < boundaries[0].x || point.x > boundaries[1].x) {
                    return;
                }
                if (point.y < boundaries[0].y || point.y > boundaries[1].y) {
                    return;
                }
            }
            if (
                intersection == null ||
                Position.getDistance(ball.position, point) <
                    Position.getDistance(ball.position, intersection)
            ) {
                intersectionLine = eq;
                intersection = point;
                Distance = Position.getDistance(ball.position, point);
            }
        });
        return {
            intersection: intersection,
            intersectionLine: intersectionLine,
            Distance: Distance,
        };
    }
}

/**@type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas");
/**@type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ball = new Ball(new Position(300, 150), new Velocity(10, 150), 5);
const box = new Box(new Position(200, 200), 100, 100);

window.addEventListener("mousemove", (event) => {});

function animate() {
    // window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.draw(ctx);
    box.draw(ctx);
    let intersection = box.getLinearIntersectionPointWithBall(ball);
    ball.getEquation().draw(ctx, canvas);
    intersection.intersectionLine?.draw(ctx, canvas);
    let neweq;
    if (ball.position.y < intersection.intersection.y) {
        neweq = new Velocity(
            ball.velocity.module + 100,
            -LineEquation.getLineIntersectionAngle(
                ball.getEquation(),
                intersection.intersectionLine
            ) + 180
        );
        console.log("ciao");
        neweq.draw(ctx, intersection.intersection);
    }
    let v = new Velocity(
        ball.velocity.module,
        -LineEquation.getLineIntersectionAngle(
            ball.getEquation(),
            intersection.intersectionLine
        )
    );
    ball.position.x += ball.velocity.getSpeedX();
    ball.position.y += ball.velocity.getSpeedY();
    if (
        Position.getDistance(ball.position, intersection.intersection) <
        ball.radius
    ) {
        ball.velocity = v;
    }
    v.draw(ctx, intersection.intersection);
}

animate();
