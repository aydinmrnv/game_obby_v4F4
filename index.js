const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const startSound = document.getElementById("startSound");
const deathSound = document.getElementById("deathSound");

let gameRunning = false;
let invincible = false; // Flag for invincibility
let invincibleTimer = 0; // Timer to count down the invincibility duration
let flashTimer = 0; // Timer for flashing effect
const smiley = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speed: 5 };
const enemies = [];
const carrots = [];
const poops = [];
const powerUps = []; // Array to store blue power-ups
const initialCarrotCount = 10;
let poopTimer = 0;
let score = 0;

function randomPosition(max) {
  return Math.random() * (max - 50) + 25;
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawEnemy(x, y, radius, isFlashing) {
  // Flashing effect: alternate between red and blue
  const enemyColor = isFlashing ? (flashTimer % 30 < 15 ? "blue" : "red") : "red";
  drawCircle(x, y, radius, enemyColor);
  
  // Teeth
  const toothSize = radius / 5;
  const teethCount = 6;
  const angleStep = (Math.PI * 2) / teethCount;

  for (let i = 0; i < teethCount; i++) {
    const angle = i * angleStep;
    const toothX = x + Math.cos(angle) * radius * 0.9;
    const toothY = y + Math.sin(angle) * radius * 0.9;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(toothX, toothY);
    ctx.lineTo(
      x + Math.cos(angle + angleStep / 2) * radius * 0.8,
      y + Math.sin(angle + angleStep / 2) * radius * 0.8
    );
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

function drawPowerUp(x, y, radius) {
  drawCircle(x, y, radius, "blue");
}

function isCollision(x1, y1, r1, x2, y2, r2) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return dist < r1 + r2;
}

function displayScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
}

function generateCarrots(count) {
  for (let i = 0; i < count; i++) {
    carrots.push({
      x: randomPosition(canvas.width),
      y: randomPosition(canvas.height),
      radius: 10,
    });
  }
}

function spawnNewMonster() {
  const newMonster = {
    x: randomPosition(canvas.width),
    y: randomPosition(canvas.height),
    radius: 25,
    speed: 2 + (score / 10) * 0.5,
    poopTimer: 0, 
  };
  enemies.push(newMonster);
}

function spawnPowerUp() {
  const newPowerUp = {
    x: randomPosition(canvas.width),
    y: randomPosition(canvas.height),
    radius: 15,
  };
  powerUps.push(newPowerUp);
}

function moveEnemy(enemy) {
  const angle = Math.atan2(smiley.y - enemy.y, smiley.x - enemy.x);
  if (invincible) {
    // Move the monster away from the player
    enemy.x -= enemy.speed * Math.cos(angle);
    enemy.y -= enemy.speed * Math.sin(angle);
  } else {
    // Default behavior: move towards the player
    enemy.x += enemy.speed * Math.cos(angle);
    enemy.y += enemy.speed * Math.sin(angle);
  }
}

function dropPoopFromMonster(enemy) {
  enemy.poopTimer++;
  if (enemy.poopTimer >= 100) {
    poops.push({ x: enemy.x, y: enemy.y, radius: 10 });
    enemy.poopTimer = 0;
  }
}

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw smiley (player)
  drawCircle(smiley.x, smiley.y, smiley.radius, invincible ? "lightgreen" : "green");

  // Draw carrots
  carrots.forEach((carrot, index) => {
    drawCircle(carrot.x, carrot.y, carrot.radius, "orange");

    if (isCollision(smiley.x, smiley.y, smiley.radius, carrot.x, carrot.y, carrot.radius)) {
      carrots.splice(index, 1);
      score++;

      // Spawn a new enemy for every 10 points
      if (score % 10 === 0) {
        spawnNewMonster();
        if (score % 10 === 0) {
          spawnPowerUp(); // Spawn power-up every 10 carrots
        }
      }
    }
  });

  // Check if all carrots are collected
  if (carrots.length === 0) {
    generateCarrots(initialCarrotCount);
  }

  // Draw poops
  poops.forEach((poop, index) => {
    drawCircle(poop.x, poop.y, poop.radius, "brown");

    if (isCollision(smiley.x, smiley.y, smiley.radius, poop.x, poop.y, poop.radius)) {
      poops.splice(index, 1);
      score -= 5; // Subtract 5 points when hitting a poop
    }
  });

  // Draw power-ups and check for collision with the player
  powerUps.forEach((powerUp, index) => {
    drawPowerUp(powerUp.x, powerUp.y, powerUp.radius);

    if (isCollision(smiley.x, smiley.y, smiley.radius, powerUp.x, powerUp.y, powerUp.radius)) {
      powerUps.splice(index, 1);
      invincible = true; // Activate invincibility
      invincibleTimer = 45; // Set timer for 5 seconds (300 frames at 60fps)
    }
  });

  // Draw enemies and move them
  enemies.forEach((enemy, index) => {
    flashTimer++;
    drawEnemy(enemy.x, enemy.y, enemy.radius, invincible); // Pass flashing effect during invincibility
    moveEnemy(enemy);
    dropPoopFromMonster(enemy);

    // Check if collision with enemy occurs and handle invincibility
    if (isCollision(smiley.x, smiley.y, smiley.radius, enemy.x, enemy.y, enemy.radius)) {
      if (invincible) {
        enemies.splice(index, 1); // Destroy monster if player is invincible
      } else {
        deathSound.play();
        stopMusic();  // Stop the background music
        gameRunning = false;
        alert("Game Over! Your score: " + score);
        location.reload();
      }
    }
  });

  // Check for win condition: if invincible and all monsters are dead
  if (invincible && enemies.length === 0) {
    alert("You Win! All monsters are dead!");
    gameRunning = false;
    stopMusic();
    location.reload();
  }

  // Display score
  displayScore();

  // Update invincibility timer
  if (invincible) {
    invincibleTimer--;
    if (invincibleTimer <= 0) {
      invincible = false; // Deactivate invincibility
    }
  }

  requestAnimationFrame(updateGame);
}

// Track mouse movement
canvas.addEventListener("mousemove", (event) => {
  smiley.x = event.clientX;
  smiley.y = event.clientY;
});

// Start game
startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  startSound.loop = true;
  startSound.play();
  gameRunning = true;
  generateCarrots(initialCarrotCount);
  spawnNewMonster();  // Initial monster spawn
  updateGame();
});

function stopMusic() {
  startSound.pause();
  startSound.currentTime = 0;
}
