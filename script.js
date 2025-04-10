document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-btn');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const prizeAmount = document.querySelector('.prize-amount');
    
    let score = 0;
    let timeLeft = 30;
    let gameInterval;
    let isGameRunning = false;
    let selectedTiles = [];
    let matchedPairs = 0;
    
    // Sound effects
    const sounds = {
        select: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
        match: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-success-alert-2039.mp3'),
        win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
        wrong: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'),
        tick: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-clock-tick-1059.mp3')
    };
    
    // Prepare numbers for the game (pairs of 1-8)
    function prepareNumbers() {
        const numbers = [];
        for (let i = 1; i <= 8; i++) {
            numbers.push(i, i); // Add each number twice to create pairs
        }
        return shuffleArray(numbers);
    }
    
    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Initialize the game board
    function initializeBoard() {
        gameBoard.innerHTML = '';
        const numbers = prepareNumbers();
        
        for (let i = 0; i < 16; i++) {
            const tile = document.createElement('div');
            tile.className = 'number-tile';
            tile.dataset.number = numbers[i];
            
            // Create front and back sides for the tile
            const tileFront = document.createElement('div');
            tileFront.className = 'tile-front';
            tileFront.textContent = '?';
            
            const tileBack = document.createElement('div');
            tileBack.className = 'tile-back';
            tileBack.textContent = numbers[i];
            
            tile.appendChild(tileFront);
            tile.appendChild(tileBack);
            
            tile.addEventListener('click', () => handleTileClick(tile));
            gameBoard.appendChild(tile);
        }
    }
    
    // Handle tile click
    function handleTileClick(tile) {
        if (!isGameRunning || tile.classList.contains('flipped') || 
            tile.classList.contains('matched') || selectedTiles.length >= 2) return;
        
        sounds.select.currentTime = 0;
        sounds.select.play();
        
        // Flip the tile
        tile.classList.add('flipped');
        selectedTiles.push(tile);
        
        if (selectedTiles.length === 2) {
            checkMatch();
        }
    }
    
    // Check if selected tiles match
    function checkMatch() {
        const [tile1, tile2] = selectedTiles;
        const number1 = tile1.dataset.number;
        const number2 = tile2.dataset.number;
        
        if (number1 === number2) {
            // Match found
            setTimeout(() => {
                sounds.match.currentTime = 0;
                sounds.match.play();
                
                tile1.classList.add('matched');
                tile2.classList.add('matched');
                
                score += 10;
                scoreDisplay.textContent = score;
                matchedPairs++;
                
                // Check if all pairs are matched
                if (matchedPairs === 8) {
                    winGame();
                }
                
                selectedTiles = [];
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                sounds.wrong.currentTime = 0;
                sounds.wrong.play();
                
                tile1.classList.remove('flipped');
                tile2.classList.remove('flipped');
                selectedTiles = [];
            }, 1000);
        }
    }
    
    // Start the game
    function startGame() {
        if (isGameRunning) return;
        
        score = 0;
        timeLeft = 30;
        isGameRunning = true;
        selectedTiles = [];
        matchedPairs = 0;
        
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timeLeft;
        prizeAmount.textContent = '$0';
        
        startBtn.textContent = 'Restart';
        initializeBoard();
        
        // Update timer display
        updateTimerVisual();
        
        gameInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            // Play tick sound when time is low
            if (timeLeft <= 5 && timeLeft > 0) {
                sounds.tick.currentTime = 0;
                sounds.tick.play();
            }
            
            // Update visual timer
            updateTimerVisual();
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }
    
    // Update visual timer
    function updateTimerVisual() {
        // Remove previous classes
        document.body.classList.remove('time-low', 'time-critical');
        
        // Add warning classes based on time left
        if (timeLeft <= 10 && timeLeft > 5) {
            document.body.classList.add('time-low');
        } else if (timeLeft <= 5) {
            document.body.classList.add('time-critical');
        }
    }
    
    // End the game
    function endGame() {
        clearInterval(gameInterval);
        isGameRunning = false;
        
        // Show all unmatched tiles
        document.querySelectorAll('.number-tile:not(.matched)').forEach(tile => {
            tile.classList.add('flipped');
        });
        
        if (matchedPairs === 8) {
            prizeAmount.textContent = '$5';
        } else {
            startBtn.disabled = false;
        }
    }
    
    // Win the game
    function winGame() {
        clearInterval(gameInterval);
        isGameRunning = false;
        
        sounds.win.currentTime = 0;
        sounds.win.play();
        
        prizeAmount.textContent = '$5';
        
        // Add confetti effect
        addConfetti();
        
        setTimeout(() => {
            alert('Congratulations! You won $5!');
        }, 500);
    }
    
    // Add confetti effect
    function addConfetti() {
        for (let i = 0; i < 150; i++) {
            createConfetti();
        }
    }
    
    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.backgroundColor = randomColor;
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.opacity = Math.random();
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
}); 