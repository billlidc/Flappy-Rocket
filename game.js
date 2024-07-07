/*
 * Filename: game.js
 * Description: A web-based "Flappy Rocket" game where players control a rocket navigating through asteroid fields or space debris, collecting fuel cells along the way.
 * Author: Bill L.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let rocket, obstacles, fuelCells, gameOver;

const gravity = 0.8;
const thrust = -10;
const maxFallSpeed = 10;
const obstacleWidth = 50;
const obstacleGap = 150;
const obstacleSpeed = 2;
const spawnInterval = 2000; // milliseconds
const fuelCellSize = 20;
const fuelCellSpawnInterval = 3000; // milliseconds

// Initialize the game state
function init() {
    rocket = {
        x: 50,
        y: canvasHeight / 2,
        width: 30,
        height: 30,
        dy: 0
    };
    obstacles = [];
    fuelCells = [];
    gameOver = false;
    lastObstacleX = canvasWidth;
}

// Draw the rocket on the canvas
function drawRocket() {
    ctx.fillStyle = 'red';
    ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height);
}

// Update the rocket's position based on gravity and thrust
function updateRocket() {
    rocket.dy += gravity;
    rocket.dy = Math.min(rocket.dy, maxFallSpeed);
    rocket.y += rocket.dy;

    // Prevent the rocket from going out of bounds
    if (rocket.y + rocket.height > canvasHeight) {
        rocket.y = canvasHeight - rocket.height;
        rocket.dy = 0;
    }

    if (rocket.y < 0) {
        rocket.y = 0;
        rocket.dy = 0;
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
            // Add points or fuel logic here
        }
    });
}

// Main game loop
function gameLoop() {
    clearCanvas();
    if (!gameOver) {
        updateRocket();
        updateObstacles();
        updateFuelCells();
        drawRocket();
        drawObstacles();
        drawFuelCells();
        checkCollision();
        checkFuelCellCollision();
        requestAnimationFrame(gameLoop);
    } else {
        // Display game over message and restart the game
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvasWidth / 2 - 75, canvasHeight / 2);
        setTimeout(() => {
            alert('Game Over');
            init();
            gameLoop();
        }, 1000); // Wait 1 second before showing the alert
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
