const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const startSound = document.getElementById("startSound");
const deathSound = document.getElementById("deathSound");

const powerUpSound = new Audio("powerup.mp3");
const monsterKillSound = new Audio("monsterkill.mp3");
const carrotSound = new Audio("carrot.mp3");

let gameRunning = false;
let invincible = false;
let invincibleTimer = 0;

const smiley = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speed: 5 };
const enemies = [];
const carrots = [];
const poops = [];
const powerUps = [];
const initialCarrotCount = 10;

let poopTimer = 0;
let score = 0;
let flashTimer = 0;

let monsterSpawnThreshold = Math.floor(Math.random() * 16) + 2; // Randomly set threshold between 2 and 17

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

function spawnPowerUps(count) {
  for (let i = 0; i < count; i++) {
    const newPowerUp = {
      x: randomPosition(canvas.width),
      y: randomPosition(canvas.height),
      radius: 15,
    };
    powerUps.push(newPowerUp);
  }
}

function moveEnemy(enemy) {
  const angle = Math.atan2(smiley.y - enemy.y, smiley.x - enemy.x);
  if (invincible) {
    enemy.x -= enemy.speed * 2 * Math.cos(angle); // Move away faster
    enemy.y -= enemy.speed * 2 * Math.sin(angle);
  } else {
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

  drawCircle(smiley.x, smiley.y, smiley.radius, invincible ? "lightgreen" : "green");

  carrots.forEach((carrot, index) => {
    drawCircle(carrot.x, carrot.y, carrot.radius, "orange");

    if (isCollision(smiley.x, smiley.y, smiley.radius, carrot.x, carrot.y, carrot.radius)) {
      carrots.splice(index, 1);
      score++;
      carrotSound.play();

      if (score % monsterSpawnThreshold === 0) {
        spawnNewMonster();
        monsterSpawnThreshold = Math.floor(Math.random() * 16) + 2; // Reset threshold
        spawnPowerUps(2); // Spawn two power-ups every monster spawn
      }
    }
  });

  if (carrots.length === 0) {
    generateCarrots(initialCarrotCount);
  }

  poops.forEach((poop, index) => {
    drawCircle(poop.x, poop.y, poop.radius, "brown");

    if (isCollision(smiley.x, smiley.y, smiley.radius, poop.x, poop.y, poop.radius)) {
      poops.splice(index, 1);
      score -= 5;
    }
  });

  powerUps.forEach((powerUp, index) => {
    drawCircle(powerUp.x, powerUp.y, powerUp.radius, "blue");

    if (isCollision(smiley.x, smiley.y, smiley.radius, powerUp.x, powerUp.y, powerUp.radius)) {
      powerUps.splice(index, 1);
      powerUpSound.play();
      invincible = true;
      invincibleTimer = 90; // Power-up lasts 1.5 seconds
    }
  });

  enemies.forEach((enemy, index) => {
    drawCircle(enemy.x, enemy.y, enemy.radius, invincible ? "lightblue" : "red");
    moveEnemy(enemy);
    dropPoopFromMonster(enemy);

    if (isCollision(smiley.x, smiley.y, smiley.radius, enemy.x, enemy.y, enemy.radius)) {
      if (invincible) {
        enemies.splice(index, 1);
        score += 5;
        monsterKillSound.play();
        invincible = false; // End invincibility after one kill
      } else {
        deathSound.play();
        gameRunning = false;
        alert(`Game Over! Your score: ${score}`);
        location.reload();
      }
    }
  });

  if (invincibleTimer > 0) {
    invincibleTimer--;
    if (invincibleTimer === 0) {
      invincible = false; // Deactivate invincibility
    }
  }

  if (score < -1) {
    gameRunning = false;
    alert(`You Lose! Your score: ${score}`);
    location.reload();
  }

  if (enemies.length === 0 && score >= 0) {
    alert("You Win! All monsters are dead!");
    gameRunning = false;
    location.reload();
  }

  displayScore();

  requestAnimationFrame(updateGame);
}

canvas.addEventListener("mousemove", (event) => {
  smiley.x = event.clientX;
  smiley.y = event.clientY;
});

startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  startSound.loop = true;
  startSound.play();
  gameRunning = true;
  generateCarrots(initialCarrotCount);
  spawnNewMonster();
  updateGame();
});

