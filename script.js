// Wait for all content to load before starting
window.addEventListener('load', function() {
    // Get DOM elements
    const player = document.getElementById('player');
    const gameArea = document.querySelector('.game-area');
    const startBtn = document.getElementById('start-btn');
    const scoreElement = document.getElementById('score');
    const prizeElement = document.getElementById('prize');
    
    // Game state
    let isPlaying = false;
    let score = 0;
    let obstacleSpeed = 2; // seconds
    let obstacleInterval;
    let scoreInterval;
    let isJumping = false;
    let obstacles = []; // Track all obstacles
    
    // Initialize game
    function init() {
        // Reset game state
        score = 0;
        isPlaying = false;
        obstacleSpeed = 2;
        scoreElement.textContent = '0';
        prizeElement.textContent = '$0';
        
        // Clear ALL existing obstacles - fix for the "play again" issue
        clearAllObstacles();
        
        // Add event listeners
        document.addEventListener('keydown', handleJump);
        gameArea.addEventListener('touchstart', handleJump);
        startBtn.addEventListener('click', startGame);
    }
    
    // Helper function to properly remove all obstacles
    function clearAllObstacles() {
        // Clear obstacle tracking array
        obstacles.forEach(obstacle => {
            if (obstacle.element && obstacle.element.parentElement) {
                obstacle.element.remove();
            }
            if (obstacle.interval) {
                clearInterval(obstacle.interval);
            }
        });
        
        // Reset array
        obstacles = [];
        
        // Direct DOM cleanup as a backup
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    }
    
    // Start the game
    function startGame() {
        if (isPlaying) return;
        
        // Clear any leftovers before starting
        clearAllObstacles();
        
        isPlaying = true;
        startBtn.textContent = 'PLAYING...';
        startBtn.disabled = true;
        
        // Animate player at start
        player.classList.add('game-start');
        setTimeout(() => player.classList.remove('game-start'), 500);
        
        // Start creating obstacles
        createObstacleInterval();
        
        // Start score counter
        scoreInterval = setInterval(() => {
            if (isPlaying) {
                score++;
                scoreElement.textContent = score;
                
                // Create dynamic background effects
                if (score % 5 === 0) {
                    createBackgroundEffect();
                }
                
                // Increase difficulty
                if (score % 10 === 0 && score > 0) {
                    obstacleSpeed = Math.max(1, obstacleSpeed - 0.2);
                    createObstacleInterval(); // Refresh interval with new speed
                }
                
                // Win condition
                if (score >= 50) {
                    winGame();
                }
            }
        }, 1000);
    }
    
    // Create background effects
    function createBackgroundEffect() {
        const effect = document.createElement('div');
        effect.className = 'background-effect';
        effect.style.left = Math.random() * 100 + '%';
        effect.style.top = Math.random() * 100 + '%';
        effect.style.setProperty('--size', Math.random() * 100 + 50 + 'px');
        
        gameArea.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentElement) {
                effect.remove();
            }
        }, 3000);
    }
    
    // Create obstacles at intervals
    function createObstacleInterval() {
        // Clear any existing interval
        if (obstacleInterval) {
            clearInterval(obstacleInterval);
        }
        
        // Vary the interval based on speed
        const intervalTime = 1500 - (2 - obstacleSpeed) * 300;
        
        // Set new interval
        obstacleInterval = setInterval(() => {
            if (Math.random() > 0.3) { // 70% chance of regular obstacle
                createObstacle();
            } else { // 30% chance of special obstacle
                createSpecialObstacle();
            }
        }, intervalTime);
    }
    
    // Create a single obstacle
    function createObstacle() {
        if (!isPlaying) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Set animation duration based on current speed
        obstacle.style.animationDuration = obstacleSpeed + 's';
        
        gameArea.appendChild(obstacle);
        
        // Create obstacle data object to track it
        const obstacleData = {
            element: obstacle,
            interval: null
        };
        
        // Add to tracking array
        obstacles.push(obstacleData);
        
        // Check for collision
        obstacleData.interval = setInterval(() => {
            if (!isPlaying) {
                clearInterval(obstacleData.interval);
                return;
            }
            
            if (isColliding(player, obstacle)) {
                clearInterval(obstacleData.interval);
                endGame();
            }
            
            // Remove check once obstacle has passed
            const obstacleRect = obstacle.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (obstacleRect.right < playerRect.left) {
                clearInterval(obstacleData.interval);
            }
            
            // Remove obstacle when it's off-screen
            if (obstacleRect.right < 0) {
                if (obstacle.parentElement) {
                    obstacle.remove();
                }
                clearInterval(obstacleData.interval);
                // Remove from obstacles array
                const index = obstacles.indexOf(obstacleData);
                if (index > -1) {
                    obstacles.splice(index, 1);
                }
            }
        }, 10);
    }
    
    // Create special obstacle (taller, different appearance)
    function createSpecialObstacle() {
        if (!isPlaying) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle special-obstacle';
        
        // Set animation duration based on current speed
        obstacle.style.animationDuration = obstacleSpeed + 's';
        
        gameArea.appendChild(obstacle);
        
        // Create obstacle data object
        const obstacleData = {
            element: obstacle,
            interval: null
        };
        
        // Add to tracking array
        obstacles.push(obstacleData);
        
        // Check for collision - same logic as regular obstacles
        obstacleData.interval = setInterval(() => {
            if (!isPlaying) {
                clearInterval(obstacleData.interval);
                return;
            }
            
            if (isColliding(player, obstacle)) {
                clearInterval(obstacleData.interval);
                endGame();
            }
            
            const obstacleRect = obstacle.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (obstacleRect.right < playerRect.left) {
                clearInterval(obstacleData.interval);
            }
            
            if (obstacleRect.right < 0) {
                if (obstacle.parentElement) {
                    obstacle.remove();
                }
                clearInterval(obstacleData.interval);
                const index = obstacles.indexOf(obstacleData);
                if (index > -1) {
                    obstacles.splice(index, 1);
                }
            }
        }, 10);
    }
    
    // Handle jump action
    function handleJump(event) {
        // Only jump if game is playing and not already jumping
        if (!isPlaying || isJumping) return;
        
        // Only jump on spacebar for keyboard events
        if (event.type === 'keydown' && event.code !== 'Space') return;
        
        isJumping = true;
        player.classList.add('jump');
        
        // Create jump particles
        createParticles();
        
        // Remove jump class when animation completes
        setTimeout(() => {
            player.classList.remove('jump');
            isJumping = false;
        }, 500);
    }
    
    // Create particle effect when jumping
    function createParticles() {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Position particles at player's feet
            const playerRect = player.getBoundingClientRect();
            const gameRect = gameArea.getBoundingClientRect();
            
            particle.style.left = (playerRect.left + playerRect.width/2 - gameRect.left) + 'px';
            particle.style.bottom = '20px'; // Same as player bottom
            
            // Random size for variety
            const size = 4 + Math.random() * 6;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random horizontal and vertical movement
            const tx = (Math.random() - 0.5) * 50;
            const ty = Math.random() * 20 + 20;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            gameArea.appendChild(particle);
            
            // Remove particle after animation ends
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, 800);
        }
    }
    
    // Check if two elements are colliding
    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        // Add a bit of forgiveness to make the game more playable
        return !(
            rect1.right < rect2.left + 5 || 
            rect1.left > rect2.right - 5 || 
            rect1.bottom < rect2.top + 5 || 
            rect1.top > rect2.bottom - 5
        );
    }
    
    // End the game
    function endGame() {
        isPlaying = false;
        clearInterval(obstacleInterval);
        clearInterval(scoreInterval);
        
        // Visual feedback for game over
        player.classList.add('game-over');
        gameArea.classList.add('game-over');
        
        setTimeout(() => {
            player.classList.remove('game-over');
            gameArea.classList.remove('game-over');
            
            startBtn.textContent = 'PLAY AGAIN';
            startBtn.disabled = false;
            
            // Stop obstacle animations
            document.querySelectorAll('.obstacle').forEach(obstacle => {
                obstacle.style.animationPlayState = 'paused';
            });
        }, 500);
    }
    
    // Win the game
    function winGame() {
        isPlaying = false;
        clearInterval(obstacleInterval);
        clearInterval(scoreInterval);
        
        prizeElement.textContent = '$5';
        startBtn.textContent = 'YOU WIN! PLAY AGAIN';
        startBtn.disabled = false;
        
        // Player celebration animation
        player.classList.add('win-animation');
        
        // Create celebration particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                createWinParticle();
            }, i * 60);
        }
        
        // Remove player animation after delay
        setTimeout(() => {
            player.classList.remove('win-animation');
        }, 3000);
    }
    
    // Create special particle for win animation
    function createWinParticle() {
        if (!gameArea) return;
        
        const particle = document.createElement('div');
        particle.className = 'win-particle';
        
        // Random position in game area
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = 10 + Math.random() * 30;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random color
        const hue = Math.floor(Math.random() * 360);
        particle.style.backgroundColor = `hsla(${hue}, 100%, 65%, 0.8)`;
        particle.style.boxShadow = `0 0 15px hsla(${hue}, 100%, 65%, 0.8)`;
        
        gameArea.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentElement) {
                particle.remove();
            }
        }, 1500);
    }
    
    // Initialize the game
    init();
    
    // Add CSS styles programmatically for additional effects
    const style = document.createElement('style');
    style.textContent = `
        .game-start {
            animation: gameStart 0.5s ease-out;
        }
        
        @keyframes gameStart {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .game-over {
            animation: gameOver 0.5s ease-out;
        }
        
        @keyframes gameOver {
            0%, 20%, 40%, 60%, 80% { background-color: rgba(247, 37, 133, 0.5); }
            10%, 30%, 50%, 70%, 90% { background-color: inherit; }
        }
        
        .win-animation {
            animation: winPulse 0.5s ease-out infinite alternate;
        }
        
        @keyframes winPulse {
            0% { transform: scale(1); filter: hue-rotate(0deg); }
            100% { transform: scale(1.2); filter: hue-rotate(360deg); }
        }
        
        .special-obstacle {
            height: 60px;
            border-radius: 50% 50% 10px 10px;
            background: linear-gradient(135deg, #f72585, #7209b7);
        }
        
        .background-effect {
            position: absolute;
            width: var(--size, 80px);
            height: var(--size, 80px);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(76, 201, 240, 0.1) 0%, rgba(58, 12, 163, 0) 70%);
            pointer-events: none;
            opacity: 0;
            animation: bgEffect 3s ease-out forwards;
        }
        
        @keyframes bgEffect {
            0% { transform: scale(0); opacity: 0; }
            50% { opacity: 0.2; }
            100% { transform: scale(3); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}); 