let monsterSpawnThreshold = Math.floor(Math.random() * 16) + 2; // Randomly set threshold between 2 and 17

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCircle(smiley.x, smiley.y, smiley.radius, invincible ? "lightgreen" : "green");

  // Carrots
  carrots.forEach((carrot, index) => {
    drawCircle(carrot.x, carrot.y, carrot.radius, "orange");

    if (isCollision(smiley.x, smiley.y, smiley.radius, carrot.x, carrot.y, carrot.radius)) {
      carrots.splice(index, 1);
      score++;
      carrotSound.play();

      // Check if score reaches the monster spawn threshold
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

  // Poops
  poops.forEach((poop, index) => {
    drawCircle(poop.x, poop.y, poop.radius, "brown");

    if (isCollision(smiley.x, smiley.y, smiley.radius, poop.x, poop.y, poop.radius)) {
      poops.splice(index, 1);
      score -= 5;
    }
  });

  // Power-ups
  powerUps.forEach((powerUp, index) => {
    drawCircle(powerUp.x, powerUp.y, powerUp.radius, "blue");

    if (isCollision(smiley.x, smiley.y, smiley.radius, powerUp.x, powerUp.y, powerUp.radius)) {
      powerUps.splice(index, 1);
      powerUpSound.play(); // Play power-up sound
      invincible = true;
      invincibleTimer = 90; // Power-up lasts 1.5 seconds (90 frames at 60 fps)
    }
  });

  // Enemies
  enemies.forEach((enemy, index) => {
    drawCircle(enemy.x, enemy.y, enemy.radius, invincible ? "lightblue" : "red");
    moveEnemy(enemy);
    dropPoopFromMonster(enemy);

    if (isCollision(smiley.x, smiley.y, smiley.radius, enemy.x, enemy.y, enemy.radius)) {
      if (invincible) {
        enemies.splice(index, 1); // Remove the monster
        score += 5; // Add 5 points
        monsterKillSound.play(); // Play monster kill sound
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
