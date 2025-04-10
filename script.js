// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game...');
    
    // Game elements
    const player = document.querySelector('.player');
    const gameArea = document.querySelector('.game-area');
    const ground = document.querySelector('.ground');
    const startButton = document.getElementById('start-button');
    const scoreDisplay = document.getElementById('score');
    const prizeDisplay = document.getElementById('prize');
    
    // Log elements to verify they're found
    console.log('Player element:', player);
    console.log('Game area element:', gameArea);
    console.log('Start button element:', startButton);
    
    // Game variables
    let isGameRunning = false;
    let score = 0;
    let speed = 1.5; // Initial obstacle speed in seconds
    let obstacleTimer;
    let scoreTimer;
    let isJumping = false;
    
    // Obstacle types and their frequencies (higher = more common)
    const obstacleTypes = [
        { class: 'obstacle', frequency: 5 },          // Standard obstacle
        { class: 'obstacle tall-obstacle', frequency: 2 },  // Tall obstacle
        { class: 'obstacle short-obstacle', frequency: 3 },  // Short obstacle
        { class: 'obstacle wide-obstacle', frequency: 2 }   // Wide obstacle
    ];
    
    // Initialize game area
    function init() {
        console.log('Initializing game and adding event listeners');
        // Add event listeners
        document.addEventListener('keydown', jump);
        gameArea.addEventListener('touchstart', jump);
        
        // Make sure start button exists before adding listener
        if (startButton) {
            startButton.addEventListener('click', toggleGame);
            console.log('Start button listener added');
        } else {
            console.error('Start button not found!');
        }
    }
    
    // Toggle game state
    function toggleGame() {
        console.log('Toggle game called, current state:', isGameRunning);
        if (isGameRunning) {
            endGame();
        } else {
            startGame();
        }
    }
    
    // Start the game
    function startGame() {
        console.log('Starting game');
        isGameRunning = true;
        score = 0;
        speed = 1.5;
        scoreDisplay.textContent = '0';
        prizeDisplay.textContent = '$0';
        startButton.textContent = 'STOP';
        
        // Clear any existing obstacles
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            obstacle.remove();
        });
        
        // Start creating obstacles
        obstacleTimer = setInterval(createObstacle, getRandomTime(1200, 2500));
        
        // Start score counter
        scoreTimer = setInterval(() => {
            if (isGameRunning) {
                score++;
                scoreDisplay.textContent = score;
                
                // Increase speed as score increases
                if (score % 10 === 0) {
                    speed = Math.max(0.7, speed - 0.1);
                }
                
                // Win condition
                if (score >= 50) {
                    winGame();
                }
            }
        }, 1000);
    }
    
    // Create a new obstacle
    function createObstacle() {
        if (!isGameRunning) return;
        
        // Select obstacle type based on frequency
        const obstacleType = getWeightedRandomObstacle();
        
        const obstacle = document.createElement('div');
        obstacle.className = obstacleType.class;
        
        // Set animation duration based on current speed
        obstacle.style.animationDuration = speed + 's';
        
        gameArea.appendChild(obstacle);
        
        // Remove obstacle after animation completes
        setTimeout(() => {
            if (obstacle.parentElement) {
                obstacle.remove();
            }
        }, speed * 1000);
        
        // Check for collisions
        const checkCollision = setInterval(() => {
            if (isColliding(player, obstacle)) {
                clearInterval(checkCollision);
                endGame();
            }
            
            // If obstacle has passed the player without collision, clear the interval
            if (getObstaclePosition(obstacle) > player.offsetLeft + player.offsetWidth) {
                clearInterval(checkCollision);
            }
        }, 10);
        
        // Adjust obstacle timing based on current speed
        clearInterval(obstacleTimer);
        obstacleTimer = setInterval(createObstacle, getRandomTime(1000 * speed, 2000 * speed));
    }
    
    // Handle jump action
    function jump(event) {
        // Only allow jump on space key, touchstart, or click events
        if (
            (event.type === 'keydown' && event.code !== 'Space') || 
            !isGameRunning || 
            isJumping
        ) {
            return;
        }
        
        isJumping = true;
        player.classList.add('jumping');
        
        // Create particle effects
        createJumpParticles();
        
        // Remove jumping class after animation completes
        setTimeout(() => {
            player.classList.remove('jumping');
            isJumping = false;
        }, 500);
    }
    
    // Create particle effects for jump
    function createJumpParticles() {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random color from player or ground
            const colors = [
                getComputedStyle(player).backgroundColor,
                getComputedStyle(ground).backgroundColor
            ];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Position at player's feet
            particle.style.left = (player.offsetLeft + player.offsetWidth / 2) + 'px';
            particle.style.bottom = ground.offsetHeight + 'px';
            
            // Random horizontal movement
            const tx = (Math.random() - 0.5) * 50;
            particle.style.setProperty('--tx', tx + 'px');
            
            gameArea.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, 1000);
        }
    }
    
    // Check if two elements are colliding
    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        return !(
            rect1.right < rect2.left + 10 || 
            rect1.left > rect2.right - 10 || 
            rect1.bottom < rect2.top + 10 || 
            rect1.top > rect2.bottom - 10
        );
    }
    
    // Get the horizontal position of an obstacle relative to the game area
    function getObstaclePosition(obstacle) {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        return gameAreaRect.right - obstacleRect.right;
    }
    
    // End the game
    function endGame() {
        isGameRunning = false;
        clearInterval(obstacleTimer);
        clearInterval(scoreTimer);
        startButton.textContent = 'START';
        
        // Stop all obstacle animations
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            const currentPos = window.getComputedStyle(obstacle).right;
            obstacle.style.right = currentPos;
            obstacle.style.animation = 'none';
        });
    }
    
    // Win the game
    function winGame() {
        endGame();
        prizeDisplay.textContent = '$5';
        
        // Create celebration particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Gold color for win
                particle.style.backgroundColor = 'gold';
                
                // Random position at top of game area
                particle.style.left = Math.random() * gameArea.offsetWidth + 'px';
                particle.style.top = '0';
                
                // Random horizontal movement
                const tx = (Math.random() - 0.5) * 100;
                particle.style.setProperty('--tx', tx + 'px');
                
                gameArea.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentElement) {
                        particle.remove();
                    }
                }, 1000);
            }, i * 50);
        }
    }
    
    // Helper function to get random time between min and max
    function getRandomTime(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    // Helper function to get random obstacle type based on frequency
    function getWeightedRandomObstacle() {
        // Calculate total frequency
        const totalFrequency = obstacleTypes.reduce((sum, type) => sum + type.frequency, 0);
        
        // Get random value within total frequency range
        const random = Math.random() * totalFrequency;
        
        // Find the obstacle type for the random value
        let cumulativeFrequency = 0;
        for (let i = 0; i < obstacleTypes.length; i++) {
            cumulativeFrequency += obstacleTypes[i].frequency;
            if (random < cumulativeFrequency) {
                return obstacleTypes[i];
            }
        }
        
        // Fallback to first obstacle type
        return obstacleTypes[0];
    }
    
    // Initialize the game
    init();
}); 