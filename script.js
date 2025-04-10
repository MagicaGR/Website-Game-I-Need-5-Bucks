// Ensure script runs after DOM is fully loaded
window.onload = function() {
    console.log('Window loaded, initializing game...');
    
    // Safely get DOM elements with error handling
    function getElement(selector, fallback = null) {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`Element not found: ${selector}`);
            return fallback;
        }
        return element;
    }
    
    function getElementById(id, fallback = null) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with ID not found: ${id}`);
            return fallback;
        }
        return element;
    }
    
    // Game elements
    const player = getElement('.player');
    const gameArea = getElement('.game-area');
    const ground = getElement('.ground');
    const startButton = getElementById('start-button');
    const scoreDisplay = getElementById('score');
    const prizeDisplay = getElementById('prize');
    
    // Log elements to verify they're found
    console.log('Player element:', player);
    console.log('Game area element:', gameArea);
    console.log('Start button element:', startButton);
    console.log('Score display:', scoreDisplay);
    console.log('Prize display:', prizeDisplay);
    
    // Check if all required elements exist
    if (!player || !gameArea || !ground || !startButton || !scoreDisplay || !prizeDisplay) {
        console.error('Missing required game elements. Game cannot start.');
        return; // Exit early if elements are missing
    }
    
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
        
        if (scoreDisplay) scoreDisplay.textContent = '0';
        if (prizeDisplay) prizeDisplay.textContent = '$0';
        if (startButton) startButton.textContent = 'STOP';
        
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
                if (scoreDisplay) scoreDisplay.textContent = score;
                
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
        if (!isGameRunning || !gameArea) return;
        
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
            if (!player || !obstacle.parentElement) {
                clearInterval(checkCollision);
                return;
            }
            
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
        if (!player || 
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
            if (player) {
                player.classList.remove('jumping');
                isJumping = false;
            }
        }, 500);
    }
    
    // Create particle effects for jump
    function createJumpParticles() {
        if (!player || !ground || !gameArea) return;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random color from player or ground
            try {
                const colors = [
                    getComputedStyle(player).backgroundColor,
                    getComputedStyle(ground).backgroundColor
                ];
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            } catch (e) {
                console.error('Error setting particle color:', e);
                particle.style.backgroundColor = '#fff';
            }
            
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
        try {
            const rect1 = element1.getBoundingClientRect();
            const rect2 = element2.getBoundingClientRect();
            
            return !(
                rect1.right < rect2.left + 10 || 
                rect1.left > rect2.right - 10 || 
                rect1.bottom < rect2.top + 10 || 
                rect1.top > rect2.bottom - 10
            );
        } catch (e) {
            console.error('Error checking collision:', e);
            return false;
        }
    }
    
    // Get the horizontal position of an obstacle relative to the game area
    function getObstaclePosition(obstacle) {
        try {
            if (!gameArea) return 0;
            const gameAreaRect = gameArea.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();
            return gameAreaRect.right - obstacleRect.right;
        } catch (e) {
            console.error('Error getting obstacle position:', e);
            return 0;
        }
    }
    
    // End the game
    function endGame() {
        isGameRunning = false;
        clearInterval(obstacleTimer);
        clearInterval(scoreTimer);
        if (startButton) startButton.textContent = 'START';
        
        // Stop all obstacle animations
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            try {
                const currentPos = window.getComputedStyle(obstacle).right;
                obstacle.style.right = currentPos;
                obstacle.style.animation = 'none';
            } catch (e) {
                console.error('Error stopping obstacle animation:', e);
            }
        });
    }
    
    // Win the game
    function winGame() {
        endGame();
        if (prizeDisplay) prizeDisplay.textContent = '$5';
        
        // Create celebration particles
        if (!gameArea) return;
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                if (!gameArea) return;
                
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
    
    // Add event listeners
    console.log('Adding event listeners');
    document.addEventListener('keydown', jump);
    if (gameArea) gameArea.addEventListener('touchstart', jump);
    if (startButton) {
        startButton.addEventListener('click', toggleGame);
        console.log('Start button listener added');
    } else {
        console.error('Start button not found!');
    }
}; 