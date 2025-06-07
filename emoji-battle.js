// Elements
const modeSelect = document.getElementById("mode-select");
const gameArea = document.getElementById("game-area");
const resultArea = document.getElementById("game-result");

const chooseHrithikBtn = document.getElementById("choose-hrithik");
const chooseSahibaBtn = document.getElementById("choose-sahiba");

const playerCharElem = document.getElementById("player-char");
const opponentCharElem = document.getElementById("opponent-char");
const turnIndicator = document.getElementById("current-turn");

const emojiInput = document.getElementById("emoji-input");
const submitEmojiBtn = document.getElementById("submit-emoji");

const feedback = document.getElementById("feedback");
const resultMessage = document.getElementById("result-message");

const restartBtn = document.getElementById("restart-btn");
const backBtn = document.getElementById("back-btn");

const playerScoreLabel = document.getElementById("player-score-label");
const computerScoreLabel = document.getElementById("computer-score-label");
const playerScoreElem = document.getElementById("player-score");
const computerScoreElem = document.getElementById("computer-score");

const clearScoresBtn = document.getElementById("clear-scores-btn");

const bgMusic = document.getElementById("bg-music");
const clickSound = document.getElementById("click-sound");
const toggleMusicBtn = document.getElementById("toggle-music");
const toggleSoundBtn = document.getElementById("toggle-sound");
const volumeControl = document.getElementById("volume-control");

const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");

let playerChar = "";
let opponentChar = "";
let currentTurn = "";
let usedEmojis = new Set();
let gameOver = false;

let playerScore = 0;
let computerScore = 0;

let musicOn = true;
let soundOn = true;

// Load scores from localStorage if available
function loadScores() {
  playerScore = parseInt(localStorage.getItem("playerScore")) || 0;
  computerScore = parseInt(localStorage.getItem("computerScore")) || 0;
  updateScoreboard();
}

// Save scores to localStorage
function saveScores() {
  localStorage.setItem("playerScore", playerScore);
  localStorage.setItem("computerScore", computerScore);
}

// Utility: get opposite character
function getOpponent(char) {
  return char === "Hrithik" ? "Sahiba" : "Hrithik";
}

// Update scoreboard display
function updateScoreboard() {
  playerScoreLabel.textContent = playerChar;
  computerScoreLabel.textContent = opponentChar;
  playerScoreElem.textContent = playerScore;
  computerScoreElem.textContent = computerScore;
}

// Strict emoji validation function
function isValidEmoji(input) {
  const cleaned = input.normalize("NFC").replace(/[\uFE0F\u200D]/g, "");
  const emojiOnlyRegex = /^\p{Emoji}+$/u;
  const asciiLettersDigits = /[a-zA-Z0-9]/;
  if (asciiLettersDigits.test(input)) return false;
  if (!emojiOnlyRegex.test(cleaned)) return false;
  return true;
}

// Computer picks a random emoji not used before
function computerPickEmoji() {
  const emojiRanges = [
    [0x1f600, 0x1f64f], // Emoticons
    [0x1f300, 0x1f5ff], // Misc Symbols and Pictographs
    [0x1f680, 0x1f6ff], // Transport and Map Symbols
    [0x2600, 0x26ff], // Misc symbols
    [0x2700, 0x27bf], // Dingbats
  ];

  let emoji = "";
  let attempts = 0;
  while (attempts < 1000) {
    const range = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];
    const codePoint =
      Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    emoji = String.fromCodePoint(codePoint);
    if (!usedEmojis.has(emoji) && isValidEmoji(emoji)) break;
    attempts++;
  }
  if (usedEmojis.has(emoji) || !isValidEmoji(emoji)) {
    emoji = "❌";
  }
  return emoji;
}

// Start game with chosen character
function startGame(chosenChar) {
  playerChar = chosenChar;
  opponentChar = getOpponent(chosenChar);
  currentTurn = playerChar;
  usedEmojis.clear();
  gameOver = false;

  loadScores();
  updateScoreboard();

  modeSelect.classList.add("hidden");
  resultArea.classList.add("hidden");
  gameArea.classList.remove("hidden");

  playerCharElem.textContent = playerChar;
  opponentCharElem.textContent = opponentChar;
  turnIndicator.textContent = currentTurn;

  emojiInput.value = "";
  feedback.textContent = "";
  emojiInput.focus();
}

// Switch turn
function switchTurn() {
  currentTurn = currentTurn === playerChar ? opponentChar : playerChar;
  turnIndicator.textContent = currentTurn;
}

// Handle player's turn input
function playerTurn() {
  const emoji = emojiInput.value.trim();
  if (!emoji) {
    feedback.textContent = "Please enter an emoji!";
    return false;
  }
  if (!isValidEmoji(emoji)) {
    feedback.textContent = "Please enter a valid emoji!";
    return false;
  }
  if (usedEmojis.has(emoji)) {
    endGame(`${currentTurn} repeated an emoji and lost!`);
    updateScoresAfterLoss(currentTurn);
    saveScores();
    return false;
  }
  usedEmojis.add(emoji);
  feedback.textContent = "";
  emojiInput.value = "";
  return true;
}

// Update scores after loss
function updateScoresAfterLoss(loser) {
  if (loser === playerChar) {
    computerScore++;
  } else {
    playerScore++;
  }
  updateScoreboard();
}

// Handle computer's turn
function computerTurn() {
  setTimeout(() => {
    let emoji = computerPickEmoji();

    // 10% chance computer repeats a used emoji (for fairness)
    const makeMistake = Math.random() < 0.1;
    if (makeMistake && usedEmojis.size > 0) {
      const usedArray = Array.from(usedEmojis);
      emoji = usedArray[Math.floor(Math.random() * usedArray.length)];
    }
    if (usedEmojis.has(emoji) || emoji === "❌" || !isValidEmoji(emoji)) {
      endGame(`${currentTurn} (Computer) repeated an emoji and lost!`);
      updateScoresAfterLoss(currentTurn);
      saveScores();
      return;
    }

    usedEmojis.add(emoji);
    feedback.textContent = `${currentTurn} (Computer) played: ${emoji} — Your turn!`;
    switchTurn();
    emojiInput.focus();
  }, 700);
}

// End game
function endGame(message) {
  gameOver = true;
  feedback.textContent = "";
  resultMessage.textContent = message;
  gameArea.classList.add("hidden");
  resultArea.classList.remove("hidden");
}

// Play click sound
function playClick() {
  if (soundOn) {
    clickSound.volume = volumeControl.value;
    clickSound.currentTime = 0;
    clickSound.play();
  }
}

// Play background music
function startMusic() {
  if (musicOn) {
    bgMusic.volume = volumeControl.value;
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}

// Toggle music
toggleMusicBtn.addEventListener("click", () => {
  musicOn = !musicOn;
  toggleMusicBtn.textContent = musicOn ? "🎵 ON" : "🎵 OFF";
  startMusic();
});

// Toggle all sounds
toggleSoundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  toggleSoundBtn.textContent = soundOn ? "🔊 ON" : "🔊 OFF";
  if (!soundOn) bgMusic.pause();
  else startMusic();
});

// Volume control change
volumeControl.addEventListener("input", () => {
  bgMusic.volume = volumeControl.value;
  clickSound.volume = volumeControl.value;
});

// Add click sound to all buttons
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", playClick);
});

// Start music on user interaction (required by some browsers)
window.addEventListener(
  "click",
  () => {
    if (musicOn && bgMusic.paused) startMusic();
  },
  { once: true }
);

// Event listeners for character selection
chooseHrithikBtn.addEventListener("click", () => startGame("Hrithik"));
chooseSahibaBtn.addEventListener("click", () => startGame("Sahiba"));

// Event listener for submit emoji button
submitEmojiBtn.addEventListener("click", () => {
  if (gameOver) return;
  if (currentTurn !== playerChar) {
    feedback.textContent = "Wait for your turn!";
    return;
  }
  if (playerTurn()) {
    if (gameOver) return;
    switchTurn();
    computerTurn();
  }
});

// Pressing Enter key submits emoji
emojiInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    submitEmojiBtn.click();
  }
});

// Restart game button
restartBtn.addEventListener("click", () => {
  startGame(playerChar);
});

// Back to mode select button
backBtn.addEventListener("click", () => {
  gameOver = false;
  usedEmojis.clear();
  gameArea.classList.add("hidden");
  resultArea.classList.add("hidden");
  modeSelect.classList.remove("hidden");
});

// Clear scores button
clearScoresBtn.addEventListener("click", () => {
  playerScore = 0;
  computerScore = 0;
  saveScores();
  updateScoreboard();
  feedback.textContent = "Scores cleared!";
});

// Settings panel toggle
settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
});
const heartsContainer = document.getElementById("hearts-container");

class Heart {
  constructor() {
    this.el = document.createElement("div");
    this.el.className = "heart";
    this.el.textContent = "❤️";

    this.size = Math.random() * 20 + 15;
    this.el.style.setProperty("--heart-size", `${this.size}px`);
    this.opacity = Math.random() * 0.5 + 0.4;
    this.el.style.setProperty("--heart-opacity", this.opacity);

    // Start at random position inside viewport
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.el.style.left = `${this.x}px`;
    this.el.style.top = `${this.y}px`;

    // Random velocity vector (pixels per frame)
    // Direction random in all directions, speed random from 0.3 to 1
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 1.7 + 0.3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    heartsContainer.appendChild(this.el);

    this.life = 0; // frames lived
    this.maxLife = 600 + Math.random() * 300; // roughly 10-15 seconds at 60fps
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;

    // Fade out towards end of life
    if (this.life > this.maxLife * 0.7) {
      const fadeProgress =
        (this.life - this.maxLife * 0.7) / (this.maxLife * 0.3);
      this.el.style.opacity = this.opacity * (1 - fadeProgress);
    }

    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;

    // If out of screen or life over, reset
    if (
      this.x < -50 ||
      this.x > window.innerWidth + 50 ||
      this.y < -50 ||
      this.y > window.innerHeight + 50 ||
      this.life > this.maxLife
    ) {
      this.reset();
    }
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.el.style.opacity = this.opacity;
    this.life = 0;

    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 0.7 + 0.3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }
}

const hearts = [];
const maxHearts = 100;

for (let i = 0; i < maxHearts; i++) {
  hearts.push(new Heart());
}

function animateHearts() {
  hearts.forEach((h) => h.update());
  requestAnimationFrame(animateHearts);
}

animateHearts();
