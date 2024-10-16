/*
 * Filename: game.js
 * Description: A web-based "Flappy Rocket" game where players control a rocket navigating through asteroid fields or space debris, collecting fuel cells along the way.
 * Author(s): Bill L.
 * Timestamp: 10/15/24
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let rocket, obstacles, fuelCells, gameOver;

const gravity = 0.65;
const thrust = -10;
const maxFallSpeed = 10;
const obstacleWidth = 50;
const obstacleGap = 150;
const obstacleSpeed = 2;
const spawnInterval = 2000; // milliseconds
const fuelCellSize = 20;
const fuelCellSpawnInterval = 3000; // milliseconds

const rocketImage = new Image();
rocketImage.src = 'images/rocket.png';

// Initialize the game state
function init() {
    rocket = {
        x: 50,
        y: canvasHeight / 2,
        width: 50,
        height: 50,
        dy: 0,
        fuel: 100 // Initial fuel level
    };
    obstacles = [];
    fuelCells = [];
    gameOver = false;
    lastObstacleX = canvasWidth;
}

// Create stars for the animated background
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 1 // Different speed for each star
    });
}

// Function to draw stars
function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Update the position of stars for animation
function updateStars() {
    stars.forEach(star => {
        star.x -= star.speed; // Move the star leftward
        if (star.x < 0) {
            star.x = canvasWidth; // Respawn star on the right
            star.y = Math.random() * canvasHeight;
        }
    });
}

// Draw the rocket on the canvas
function drawRocket() {
    // ctx.fillStyle = 'red';
    // ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height);
    ctx.drawImage(rocketImage, rocket.x, rocket.y, rocket.width, rocket.height);
}

// Update the rocket's status
function updateRocket() {
    rocket.dy += gravity;
    rocket.dy = Math.min(rocket.dy, maxFallSpeed);
    rocket.y += rocket.dy;

    // Decrease fuel over time
    rocket.fuel -= 0.1;
    if (rocket.fuel <= 0) {
        rocket.fuel = 0;
        gameOver = true;
    }

    // Check for collision with the floor
    if (rocket.y + rocket.height > canvasHeight) {
        rocket.y = canvasHeight - rocket.height;
        rocket.dy = 0;
        gameOver = true;
    }

    // Check for collision with the ceiling
    if (rocket.y < 0) {
        rocket.y = 0;
        rocket.dy = 0;
        gameOver = true;
    }
}

// Clear the canvas for redrawing
function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Create a new obstacle with random height
function createObstacle() {
    const minHeight = 50;
    const maxHeight = canvasHeight - obstacleGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const obstacle = {
        x: lastObstacleX + Math.random() * 200 + 300, // Randomize horizontal distance
        topHeight: height,
        bottomY: height + obstacleGap
    };
    lastObstacleX = obstacle.x;
    obstacles.push(obstacle);
}

// Draw obstacles on the canvas
function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        // Draw top obstacle
        ctx.fillRect(obstacle.x, 0, obstacleWidth, obstacle.topHeight);
        // Draw bottom obstacle
        ctx.fillRect(obstacle.x, obstacle.bottomY, obstacleWidth, canvasHeight - obstacle.bottomY);
    });
}

// Update the position of obstacles
function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
    });
    if (obstacles.length && obstacles[0].x < -obstacleWidth) {
        obstacles.shift();
    }
}

// Check for collisions between the rocket and obstacles
function checkCollision() {
    obstacles.forEach(obstacle => {
        if (
            rocket.x < obstacle.x + obstacleWidth &&
            rocket.x + rocket.width > obstacle.x &&
            (rocket.y < obstacle.topHeight || rocket.y + rocket.height > obstacle.bottomY)
        ) {
            // Collision detected, trigger game over
            gameOver = true;
        }
    });
}

// Create a new fuel cell at a random position
function createFuelCell() {
    const fuelCell = {
        x: canvasWidth,
        y: Math.floor(Math.random() * (canvasHeight - fuelCellSize))
    };
    fuelCells.push(fuelCell);
}

// Draw fuel cells on the canvas
function drawFuelCells() {
    ctx.fillStyle = 'yellow';
    fuelCells.forEach(fuelCell => {
        ctx.fillRect(fuelCell.x, fuelCell.y, fuelCellSize, fuelCellSize);
    });
}

// Update the position of fuel cells
function updateFuelCells() {
    fuelCells.forEach(fuelCell => {
        fuelCell.x -= obstacleSpeed;
    });
    if (fuelCells.length && fuelCells[0].x < -fuelCellSize) {
        fuelCells.shift();
    }
}

// Check for collisions between the rocket and fuel cells
function checkFuelCellCollision() {
    fuelCells.forEach((fuelCell, index) => {
        if (
            rocket.x < fuelCell.x + fuelCellSize &&
            rocket.x + rocket.width > fuelCell.x &&
            rocket.y < fuelCell.y + fuelCellSize &&
            rocket.y + rocket.height > fuelCell.y
        ) {
            // Fuel cell collected
            fuelCells.splice(index, 1);
            rocket.fuel = Math.min(rocket.fuel + 20, 100); // Increase fuel, max 100
        }
    });
}

// Draw the fuel bar
function drawFuelBar() {
    const barWidth = 100;
    const barHeight = 10;
    const barX = canvasWidth - barWidth - 20;
    const barY = 20;

    // Draw background bar
    ctx.fillStyle = 'gray';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Draw fuel level
    const fuelWidth = (rocket.fuel / 100) * barWidth;
    ctx.fillStyle = 'yellow';
    ctx.fillRect(barX, barY, fuelWidth, barHeight);
}

// Main game loop
function gameLoop() {
    clearCanvas();
    if (!gameOver) {
        updateStars();  // Update star positions
        drawStars();    // Draw the animated stars
        updateRocket();
        updateObstacles();
        updateFuelCells();
        drawRocket();
        drawObstacles();
        drawFuelCells();
        drawFuelBar(); // Draw the fuel bar
        checkCollision();
        checkFuelCellCollision();
        requestAnimationFrame(gameLoop);
    } else {
        // Show the alert immediately when the game is over
        alert('Game Over');
        init();
        gameLoop(); // Restart the game loop after initializing
    }
}

// Add event listener for spacebar to apply thrust
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        rocket.dy = thrust;
    }
});

// Start the game
init();
setInterval(createObstacle, spawnInterval);
setInterval(createFuelCell, fuelCellSpawnInterval);
gameLoop();
