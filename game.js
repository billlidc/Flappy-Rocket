/*
 * Filename: game.js
 * Description: A web-based "Flappy Rocket" game where players control a rocket navigating through asteroid fields or space debris, collecting fuel cells along the way.
 * Author(s): Bill L.
 * Timestamp: 10/15/24
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let rocket, obstacles, fuelCells, gameOver, started;

const gravity = 0.55;
const thrust = -10;
const maxFallSpeed = 10;
const obstacleWidth = 50;
const obstacleGap = 150;
const obstacleSpeed = 2;
const spawnInterval = 2000; // milliseconds
const fuelCellWidth = 40;
const fuelCellHeight = 20;
const fuelCellSpawnInterval = 3000; // milliseconds

const rocketImage = new Image();
rocketImage.src = 'images/rocket.png';

const fuelImage = new Image();
fuelImage.src = 'images/fuel.png';  // Replace with the actual path to the fuel cell image


// Initialize the game state
function init() {
    rocket = {
        x: 50,
        y: canvasHeight / 2,
        width: 40,
        height: 40,
        dy: 0,
        fuel: 100 // Initial fuel level
    };
    obstacles = [];
    fuelCells = [];
    gameOver = false;
    started = false;  // Game starts when the first interaction occurs
    lastObstacleX = canvasWidth;

    // Hide the game over screen
    gameOverScreen.style.display = 'none';
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
    if (started) {
        rocket.dy += gravity;
        rocket.dy = Math.min(rocket.dy, maxFallSpeed);
        rocket.y += rocket.dy;
    }

    // Decrease fuel over time
    if (started) {
        rocket.fuel -= 0.1;
    }

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

// Create a new obstacle with random height (only when the game has started)
function createObstacle() {
    if (started) {
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

// Update the position of obstacles (only if game has started)
function updateObstacles() {
    if (started) {
        obstacles.forEach(obstacle => {
            obstacle.x -= obstacleSpeed;
        });
        if (obstacles.length && obstacles[0].x < -obstacleWidth) {
            obstacles.shift();
        }
    }
}

// Create a new fuel cell at a random position (only when the game has started)
function createFuelCell() {
    if (started) {
        const fuelCell = {
            x: canvasWidth,
            y: Math.floor(Math.random() * (canvasHeight - fuelCellHeight))
        };
        fuelCells.push(fuelCell);
    }
}

// Draw fuel cells on the canvas
function drawFuelCells() {
    // ctx.fillStyle = 'yellow';
    // fuelCells.forEach(fuelCell => {
    //     ctx.fillRect(fuelCell.x, fuelCell.y, fuelCellSize, fuelCellSize);
    // });
    fuelCells.forEach(fuelCell => {
        ctx.drawImage(fuelImage, fuelCell.x, fuelCell.y, fuelCellWidth, fuelCellHeight);
    });
}

// Update the position of fuel cells (only if game has started)
function updateFuelCells() {
    if (started) {
        fuelCells.forEach(fuelCell => {
            fuelCell.x -= obstacleSpeed;
        });
        if (fuelCells.length && fuelCells[0].x < -fuelCellWidth) {
            fuelCells.shift();
        }
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
            gameOver = true;
        }
    });
}

// Check for collisions between the rocket and fuel cells
function checkFuelCellCollision() {
    fuelCells.forEach((fuelCell, index) => {
        if (
            rocket.x < fuelCell.x + fuelCellWidth &&
            rocket.x + rocket.width > fuelCell.x &&
            rocket.y < fuelCell.y + fuelCellHeight &&
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
        // Show the game over screen instead of an alert
        gameOverScreen.style.display = 'block';
    }
}

// Add event listeners for both keyboard and touch input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        rocket.dy = thrust;
        started = true;  // Start the game on the first space press
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (!gameOver) {
        rocket.dy = thrust;
        started = true;  // Start the game on the first touch
    }
});

// Restart the game when the restart button is clicked
restartButton.addEventListener('click', () => {
    init();
    gameLoop(); // Restart the game loop after reinitializing
});

// Start the game
init();
setInterval(createObstacle, spawnInterval);
setInterval(createFuelCell, fuelCellSpawnInterval);
gameLoop();
