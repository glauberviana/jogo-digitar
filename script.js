// ===== CONFIGURAÇÕES =====
const GAME_CONFIG = {
    easy: { 
        timeLimit: 120, 
        initialLives: 5, 
        multiplier: 1,
        wordGoal: 15
    },
    medium: { 
        timeLimit: 100, 
        initialLives: 4, 
        multiplier: 1.5,
        wordGoal: 20
    },
    hard: { 
        timeLimit: 80, 
        initialLives: 3, 
        multiplier: 2,
        wordGoal: 25
    }
};

const WORD_LISTS = {
    easy: ["gato", "sol", "lua", "pão", "rua", "via", "par", "sim", "não", "cor", "flor", "tudo", "casa", "mesa", "carro"],
    medium: ["python", "javascript", "computador", "teclado", "mouse", "escola", "livro", "caneta", "professora", "amigo", "diversão", "tecnologia", "internet", "programa", "desenvolvimento"],
    hard: ["programação", "inteligência", "criatividade", "estratégia", "desenvolvimento", "conhecimento", "responsabilidade", "dedicação", "persistência", "excelência", "algoritmo", "estrutura", "otimização"]
};

const SCORE_BASE = 10;
const HINT_PENALTY = 0;

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
let timerInterval = null;

// ===== FUNÇÕES PRINCIPAIS =====

/**
 * Inicia um novo jogo com a dificuldade selecionada
 * @param {string} difficulty - 'easy', 'medium' ou 'hard'
 */
function startGame(difficulty) {
    if (!difficulty || !GAME_CONFIG[difficulty]) {
        console.error('Dificuldade inválida:', difficulty);
        return;
    }

    currentDifficulty = difficulty;
    score = 0;
    wordsCorrect = 0;
    totalAttempts = 0;
    lives = GAME_CONFIG[difficulty].initialLives;
    timeRemaining = GAME_CONFIG[difficulty].timeLimit;
    gameActive = true;
    hintUsed = false;
    startTime = Date.now();

    // Limpar timer anterior se existir
    if (timerInterval) clearInterval(timerInterval);

    // Atualizar UI
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

/**
 * Gera uma nova palavra aleatória do nível atual
 */
function generateNewWord() {
    const words = WORD_LISTS[currentDifficulty];
    if (!words || words.length === 0) {
        console.error('Lista de palavras vazia para:', currentDifficulty);
        return;
    }

    currentWord = words[Math.floor(Math.random() * words.length)];
    const display = document.getElementById('wordDisplay');
    display.textContent = currentWord;
    display.className = 'word-display';
    
    document.getElementById('wordInput').value = '';
    document.getElementById('hintText').classList.remove('show');
    document.getElementById('hintBtn').disabled = false;
    hintUsed = false;
}

/**
 * Processa o input do usuário
 * @param {KeyboardEvent} e - Evento do teclado
 */
function handleInput(e) {
    if (!gameActive) return;
    if (e.key !== 'Enter') return;

    const userInput = e.target.value.trim();

    // Validar entrada vazia
    if (!userInput) {
        e.target.focus();
        return;
    }

    totalAttempts++;
    const isCorrect = userInput.toLowerCase() === currentWord.toLowerCase();

    if (isCorrect) {
        score += Math.round(SCORE_BASE * GAME_CONFIG[currentDifficulty].multiplier);
        wordsCorrect++;
        showSuccess();
        
        // Verificar se atingiu a meta de palavras
        if (wordsCorrect >= GAME_CONFIG[currentDifficulty].wordGoal) {
            endGame(true); // true = vitória
            return;
        }
        
        generateNewWord();
    } else {
        lives--;
        showError();
        
        if (lives <= 0) {
            endGame(false); // false = derrota
            return;
        }
    }

    updateUI();
    e.target.value = '';
    e.target.focus();
}

/**
 * Mostra animação de sucesso
 */
function showSuccess() {
    const display = document.getElementById('wordDisplay');
    display.classList.add('correct');
    setTimeout(() => display.classList.remove('correct'), 500);
}

/**
 * Mostra animação de erro
 */
function showError() {
    const display = document.getElementById('wordDisplay');
    display.classList.add('incorrect');
    setTimeout(() => display.classList.remove('incorrect'), 500);
}

/**
 * Mostra dica da palavra atual (primeira metade + pontos)
 */
function showHint() {
    if (hintUsed) return;
    hintUsed = true;
    document.getElementById('hintBtn').disabled = true;

    const word = currentWord;
    const hintLength = Math.ceil(word.length / 2);
    const hint = word.substring(0, hintLength) + '_'.repeat(word.length - hintLength);

    const hintEl = document.getElementById('hintText');
    hintEl.textContent = `💡 Dica: ${hint}`;
    hintEl.classList.add('show');
}

/**
 * Atualiza a interface com dados do jogo
 */
function updateUI() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('wordsCorrect').textContent = wordsCorrect;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, lives));
    document.getElementById('wordCount').textContent = totalAttempts;
    
    // Calcular precisão
    const accuracy = totalAttempts > 0 
        ? Math.round((wordsCorrect / totalAttempts) * 100) 
        : 0;
    document.getElementById('accuracy').textContent = accuracy;

    // Atualizar barra de progresso com meta dinâmica
    const wordGoal = GAME_CONFIG[currentDifficulty].wordGoal;
    const progress = (wordsCorrect / wordGoal) * 100;
    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
    
    // Atualizar display de tempo
    document.getElementById('timeDisplay').textContent = formatTime(timeRemaining);
}

/**
 * Atualiza o display de dificuldade
 */
function updateDifficultyDisplay() {
    const diffNames = { 
        easy: '⭐ Fácil', 
        medium: '⭐⭐ Médio', 
        hard: '⭐⭐⭐ Difícil' 
    };
    document.getElementById('difficulty').textContent = diffNames[currentDifficulty];
}

/**
 * Inicia o cronômetro do jogo
 */
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(timerInterval);
            return;
        }

        timeRemaining--;
        document.getElementById('timeDisplay').textContent = formatTime(timeRemaining);

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame(false); // Fim de tempo = derrota
        }
    }, 1000);
}

/**
 * Formata segundos para MM:SS
 * @param {number} seconds - Total de segundos
 * @returns {string} Tempo formatado
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Finaliza o jogo e mostra tela de resultado
 * @param {boolean} victory - true se vitória, false se derrota
 */
function endGame(victory = false) {
    gameActive = false;
    if (timerInterval) clearInterval(timerInterval);

    document.getElementById('gameContainer').classList.remove('active');
    document.getElementById('overlay').classList.add('active');
    document.getElementById('gameOverScreen').classList.add('active');

    const accuracy = totalAttempts > 0 
        ? Math.round((wordsCorrect / totalAttempts) * 100) 
        : 0;
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);

    // Atualizar tela de resultado
    const gameOverScreen = document.getElementById('gameOverScreen');
    const titleEl = gameOverScreen.querySelector('h2');
    
    if (victory) {
        titleEl.textContent = '🎉 Você Venceu!';
        titleEl.style.color = '#4CAF50';
    } else {
        titleEl.textContent = '😢 Fim de Jogo';
        titleEl.style.color = '#f44336';
    }

    document.getElementById('finalScore').textContent = Math.floor(score);
    document.getElementById('finalWordsCorrect').textContent = wordsCorrect;
    document.getElementById('finalAccuracy').textContent = accuracy;
    document.getElementById('finalTime').textContent = formatTime(elapsedTime);
}

/**
 * Reinicia o jogo voltando ao menu
 */
function goToMenu() {
    gameActive = false;
    if (timerInterval) clearInterval(timerInterval);
    
    document.getElementById('menuScreen').style.display = 'block';
    document.getElementById('gameContainer').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('wordInput').value = '';
}

// ===== EVENT LISTENERS =====
document.getElementById('wordInput').addEventListener('keypress', handleInput);

// Inicializa com menu visível
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menuScreen').style.display = 'block';
    document.getElementById('gameContainer').classList.remove('active');
});