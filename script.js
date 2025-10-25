// --- SELEÇÃO DOS ELEMENTOS DO DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const wordInputElement = document.getElementById('wordInput');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const gameContainer = document.getElementById('game-container');

// --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const wordList = ["rapido", "terra", "vento", "fogo", "agua", "magia", "forca", "escudo", "luz", "sombra", "jogo", "vida"];
let player, obstacles, score, lives, gameSpeed, gameOver, lastScoreThreshold;

// --- CLASSES DO JOGO ---

// Classe para o Personagem (atualmente visual, sem muita lógica)
class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Classe para os Obstáculos
class Obstacle {
    constructor(word) {
        this.x = canvas.width;
        this.y = canvas.height - 50; // Altura do chão
        this.width = 40;
        this.height = 50;
        this.color = '#CD5C5C'; // IndianRed
        this.word = word;
    }

    draw() {
        // Desenha o obstáculo
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Desenha a palavra acima
        ctx.fillStyle = 'white';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.word, this.x + this.width / 2, this.y - 15);
    }

    update() {
        this.x -= gameSpeed;
    }
}


// --- FUNÇÕES DE ÁUDIO (PLACEHOLDERS) ---
function playSuccessSound() {
    console.log("Efeito sonoro: Sucesso!");
    // Futuramente, adicione aqui o código para tocar um som de sucesso.
}

function playCollisionSound() {
    console.log("Efeito sonoro: Colisão!");
    // Futuramente, adicione aqui o código para tocar um som de colisão.
}


// --- FUNÇÕES PRINCIPAIS DO JOGO ---

function startGame() {
    // Inicializa/Reseta as variáveis do jogo
    player = new Player(100, canvas.height - 50, 40, 50, '#FDB813'); // Amarelo-laranja
    obstacles = [];
    score = 0;
    lives = 3;
    // A MUDANÇA ESTÁ AQUI!
    gameSpeed = 2.5; // Estava 3. Um valor menor deixa o jogo mais lento.
    gameOver = false;
    lastScoreThreshold = 0;

    // Configura a UI
    updateUI();
    gameOverScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    wordInputElement.value = '';
    wordInputElement.focus();

    // Gera o primeiro obstáculo e inicia o loop
    generateObstacle();
    gameLoop();
}

function gameLoop() {
    if (gameOver) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o jogador
    player.draw();

    // Atualiza e desenha os obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.update();
        obs.draw();

        // Checagem de colisão
        if (obs.x < player.x + player.width) {
            handleCollision(i); // Passa o índice do obstáculo
            break; // Sai do loop para evitar múltiplas colisões no mesmo frame
        }
    }

    // Continua o loop na próxima animação
    requestAnimationFrame(gameLoop);
}

function handleCollision(obstacleIndex) {
    playCollisionSound();
    lives--;
    updateUI();

    // Remove o obstáculo com o qual colidiu
    obstacles.splice(obstacleIndex, 1);
    
    if (lives <= 0) {
        endGame();
    } else {
        // Gera um novo obstáculo para não deixar a tela vazia
        generateObstacle();
    }
}


function generateObstacle() {
    // Impede que obstáculos se sobreponham
    const lastObstacle = obstacles[obstacles.length - 1];
    if (!lastObstacle || (canvas.width - lastObstacle.x) > 300) { // Distância mínima entre obstáculos
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        obstacles.push(new Obstacle(randomWord));
    }
    // Agenda a próxima tentativa de geração
    setTimeout(generateObstacle, Math.random() * 2000 + 1500); // Entre 1.5 e 3.5 segundos
}


function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = '❤️'.repeat(lives);
}

function endGame() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameContainer.style.display = 'none';
    gameOverScreen.style.display = 'block';
}


// --- CONTROLE DE INPUT ---

wordInputElement.addEventListener('input', (e) => {
    const typedWord = e.target.value.trim().toLowerCase();
    
    // Se não houver obstáculos, não faça nada
    if (obstacles.length === 0) return;

    const targetWord = obstacles[0].word;
    
    if (typedWord === targetWord) {
        playSuccessSound();
        
        // Remove o obstáculo eliminado
        obstacles.shift();
        
        // Limpa o campo de input
        e.target.value = '';
        
        // Atualiza a pontuação
        score += 10;

        // Aumenta a dificuldade
        if (score >= lastScoreThreshold + 100) {
            gameSpeed += 0.5;
            lastScoreThreshold += 100;
            console.log("Velocidade aumentada para: ", gameSpeed);
        }

        updateUI();
    }
});


// --- EVENT LISTENERS ---
restartButton.addEventListener('click', startGame);

// --- INICIAR O JOGO ---
startGame();