const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Tomamos el tamaño actual del canvas en CSS
const canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;

// Ajustar el tamaño real del canvas para la animación
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Función para generar color aleatorio
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class Circle {
    constructor(x, y, radius, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = getRandomColor();
        this.color = this.originalColor;
        this.text = text;
        this.speed = speed;
        this.dx = Math.random() < 0.5 ? speed : -speed;
        this.dy = Math.random() < 0.5 ? speed : -speed;

        this.collisionFrames = 0; // Mantener rojo tras colisión
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();

        // Texto dentro del círculo
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
    }

    update(context) {
        this.draw(context);

        // Rebote en bordes del canvas
        if ((this.posX + this.radius) > canvasWidth || (this.posX - this.radius) < 0) this.dx = -this.dx;
        if ((this.posY + this.radius) > canvasHeight || (this.posY - this.radius) < 0) this.dy = -this.dy;

        this.posX += this.dx;
        this.posY += this.dy;

        // Mantener rojo si colisionó recientemente
        if (this.collisionFrames > 0) {
            this.color = "red";
            this.collisionFrames--;
        } else {
            this.color = this.originalColor;
        }
    }

    collide(frames = 10) {
        this.collisionFrames = frames;
    }

    invertDirection() {
        this.dx = -this.dx;
        this.dy = -this.dy;
    }
}

// Configuración: N círculos
const N = 10;
const circles = [];

// Crear N círculos con posiciones y radios aleatorios dentro del canvas
for (let i = 0; i < N; i++) {
    const radius = Math.floor(Math.random() * 40 + 30);
    const x = Math.random() * (canvasWidth - 2 * radius) + radius;
    const y = Math.random() * (canvasHeight - 2 * radius) + radius;
    const speed = Math.random() * 3 + 2;
    circles.push(new Circle(x, y, radius, `${i+1}`, speed));
}

// Detectar colisión entre dos círculos
function checkCollision(c1, c2) {
    const dx = c2.posX - c1.posX;
    const dy = c2.posY - c1.posY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    return distance <= (c1.radius + c2.radius);
}

// Rebote entre dos círculos al colisionar
function resolveCollision(c1, c2) {
    const dx = c2.posX - c1.posX;
    const dy = c2.posY - c1.posY;
    const distance = Math.sqrt(dx*dx + dy*dy);

    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const p = 2 * ((c1.dx * nx + c1.dy * ny) - (c2.dx * nx + c2.dy * ny)) / 2;

    c1.dx -= p * nx;
    c1.dy -= p * ny;
    c2.dx += p * nx;
    c2.dy += p * ny;

    c1.invertDirection();
    c2.invertDirection();
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Actualizar todos los círculos
    circles.forEach(circle => circle.update(ctx));

    // Verificar colisiones entre todos los círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (checkCollision(circles[i], circles[j])) {
                resolveCollision(circles[i], circles[j]);
                circles[i].collide(15);
                circles[j].collide(15);
            }
        }
    }
}

// Iniciar animación
animate();