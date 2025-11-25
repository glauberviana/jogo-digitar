// ===== CONFIGURAÇÕES =====
const wordLists = {
    easy: ["gato", "sol", "lua", "pão", "rua", "via", "par", "sim", "não", "cor", "flor", "tudo"],
    medium: ["python", "javascript", "computador", "teclado", "mouse", "escola", "livro", "caneta", "professora", "amigo", "diversão", "tecnologia"],
    hard: ["programação", "inteligência", "criatividade", "estratégia", "desenvolvimento", "conhecimento", "responsabilidade", "dedicação", "persistência", "excelência"]
};

const levelConfig = {
    easy: { timeLimit: 120, initialLives: 5, baseSpeed: 60 },
    medium: { timeLimit: 100, initialLives: 4, baseSpeed: 40 },
    hard: { timeLimit: 80, initialLives: 3, baseSpeed: 30 }
};

// ===== VARIÁVEIS GLOBAIS =====
let currentDifficulty = 'medium';
let currentWord = '';
let score = 0;
let wordsCorrect = 0;
let totalAttempts = 0;
let lives = 3;
let gameActive = false;
let timeRemaining = 0;
let startTime = 0;
let hintUsed = false;

// ===== FUNÇÕES PRINCIPAIS =====

function startGame(difficulty) {
    currentDifficulty = difficulty;
    score = 0;
    wordsCorrect = 0;
    totalAttempts = 0;
    lives = levelConfig[difficulty].initialLives;
    timeRemaining = levelConfig[difficulty].timeLimit;
    gameActive = true;
    hintUsed = false;
    startTime = Date.now();

    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameContainer').classList.add('active');
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');

    updateDifficultyDisplay();
    generateNewWord();
    updateUI();
    document.getElementById('wordInput').focus();
    startTimer();
}

function generateNewWord() {
    const words = wordLists[currentDifficulty];
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('wordDisplay').textContent = currentWord;
    document.getElementById('wordDisplay').className = 'word-display';
    document.getElementById('wordInput').value = '';
    document.getElementById('hintText').classList.remove('show');
    document.getElementById('hintBtn').disabled = false;
    hintUsed = false;
}

function handleInput(e) {
    if (!gameActive || e.key !== 'Enter') return;

    const userInput = e.target.value.trim().toLowerCase();
    totalAttempts++;

    if (userInput === currentWord.toLowerCase()) {
        score += 10 * (currentDifficulty === 'easy' ? 1 : currentDifficulty === 'medium' ? 1.5 : 2);
        wordsCorrect++;
        showSuccess();
        generateNewWord();
    } else {
        lives--;
        showError();
        if (lives <= 0) {
            endGame();
            return;
        }
    }

    updateUI();
    e.target.value = '';
}

function showSuccess() {
    const display = document.getElementById('wordDisplay');
    display.classList.add('correct');
    setTimeout(() => display.classList.remove('correct'), 500);
}

function showError() {
    const display = document.getElementById('wordDisplay');
    display.classList.add('incorrect');
    setTimeout(() => display.classList.remove('incorrect'), 500);
}

function showHint() {
    if (hintUsed) return;
    hintUsed = true;
    document.getElementById('hintBtn').disabled = true;

    const word = currentWord;
    const hintLength = Math.ceil(word.length / 2);
    const hint = word.substring(0, hintLength) + '...';

    const hintEl = document.getElementById('hintText');
    hintEl.textContent = `💡 Dica: ${hint}`;
    hintEl.classList.add('show');
}

function updateUI() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('wordsCorrect').textContent = wordsCorrect;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, lives));
    document.getElementById('wordCount').textContent = totalAttempts;

    const accuracy = totalAttempts > 0 ? Math.round((wordsCorrect / totalAttempts) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy;

    const progress = (wordsCorrect / 20) * 100;
    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
}

function updateDifficultyDisplay() {
    const diffNames = { easy: '⭐ Fácil', medium: '⭐⭐ Médio', hard: '⭐⭐⭐ Difícil' };
    document.getElementById('difficulty').textContent = diffNames[currentDifficulty];
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(timerInterval);
            return;
        }

        timeRemaining--;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameActive = false;
    document.getElementById('gameContainer').classList.remove('active');
    document.getElementById('overlay').classList.add('active');
    document.getElementById('gameOverScreen').classList.add('active');

    const accuracy = totalAttempts > 0 ? Math.round((wordsCorrect / totalAttempts) * 100) : 0;
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);

    document.getElementById('finalScore').textContent = Math.floor(score);
    document.getElementById('finalWordsCorrect').textContent = wordsCorrect;
    document.getElementById('finalAccuracy').textContent = accuracy;
    document.getElementById('finalTime').textContent = elapsedTime;
}

// ===== EVENT LISTENERS =====
document.getElementById('wordInput').addEventListener('keypress', handleInput);

// Inicia com menu visível
document.getElementById('menuScreen').style.display = 'block';