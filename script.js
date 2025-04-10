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
    
    // Initialize game
    function init() {
        // Reset game state
        score = 0;
        isPlaying = false;
        obstacleSpeed = 2;
        scoreElement.textContent = '0';
        prizeElement.textContent = '$0';
        
        // Remove any existing obstacles
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        
        // Add event listeners
        document.addEventListener('keydown', handleJump);
        gameArea.addEventListener('touchstart', handleJump);
        startBtn.addEventListener('click', startGame);
    }
    
    // Start the game
    function startGame() {
        if (isPlaying) return;
        
        isPlaying = true;
        startBtn.textContent = 'PLAYING...';
        startBtn.disabled = true;
        
        // Start creating obstacles
        createObstacleInterval();
        
        // Start score counter
        scoreInterval = setInterval(() => {
            if (isPlaying) {
                score++;
                scoreElement.textContent = score;
                
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
    
    // Create obstacles at intervals
    function createObstacleInterval() {
        // Clear any existing interval
        if (obstacleInterval) {
            clearInterval(obstacleInterval);
        }
        
        // Set new interval
        obstacleInterval = setInterval(createObstacle, 1500);
    }
    
    // Create a single obstacle
    function createObstacle() {
        if (!isPlaying) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Set animation duration based on current speed
        obstacle.style.animationDuration = obstacleSpeed + 's';
        
        gameArea.appendChild(obstacle);
        
        // Check for collision
        const collisionCheck = setInterval(() => {
            if (!isPlaying) {
                clearInterval(collisionCheck);
                return;
            }
            
            if (isColliding(player, obstacle)) {
                clearInterval(collisionCheck);
                endGame();
            }
            
            // Remove check once obstacle has passed
            const obstacleRect = obstacle.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (obstacleRect.right < playerRect.left) {
                clearInterval(collisionCheck);
            }
            
            // Remove obstacle when it's off-screen
            if (obstacleRect.right < 0) {
                if (obstacle.parentElement) {
                    obstacle.remove();
                }
                clearInterval(collisionCheck);
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
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Position particles at player's feet
            const playerRect = player.getBoundingClientRect();
            const gameRect = gameArea.getBoundingClientRect();
            
            particle.style.left = (playerRect.left + playerRect.width/2 - gameRect.left) + 'px';
            particle.style.bottom = '20px'; // Same as player bottom
            
            // Random horizontal and vertical movement
            const tx = (Math.random() - 0.5) * 30;
            const ty = Math.random() * 10 + 10;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            gameArea.appendChild(particle);
            
            // Remove particle after animation ends
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, 500);
        }
    }
    
    // Check if two elements are colliding
    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        return !(
            rect1.right < rect2.left || 
            rect1.left > rect2.right || 
            rect1.bottom < rect2.top || 
            rect1.top > rect2.bottom
        );
    }
    
    // End the game
    function endGame() {
        isPlaying = false;
        clearInterval(obstacleInterval);
        clearInterval(scoreInterval);
        
        startBtn.textContent = 'PLAY AGAIN';
        startBtn.disabled = false;
        
        // Stop obstacle animations
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            const currentPos = window.getComputedStyle(obstacle).right;
            obstacle.style.animationPlayState = 'paused';
        });
    }
    
    // Win the game
    function winGame() {
        isPlaying = false;
        clearInterval(obstacleInterval);
        clearInterval(scoreInterval);
        
        prizeElement.textContent = '$5';
        startBtn.textContent = 'YOU WIN! PLAY AGAIN';
        startBtn.disabled = false;
        
        // Create celebration particles
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.backgroundColor = 'gold';
                
                // Random position in game area
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                
                // Random movement
                const tx = (Math.random() - 0.5) * 40;
                const ty = (Math.random() - 0.5) * 40;
                particle.style.setProperty('--tx', tx + 'px');
                particle.style.setProperty('--ty', ty + 'px');
                
                gameArea.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentElement) {
                        particle.remove();
                    }
                }, 500);
            }, i * 50);
        }
    }
    
    // Initialize the game
    init();
}); 