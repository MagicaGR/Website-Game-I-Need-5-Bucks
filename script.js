window.onload = function() {
    try {
        console.log("Window loaded");
        
        // Elements
        const scoreEl = document.querySelector('.score');
        const currentColorEl = document.querySelector('.current-color');
        const targetZoneEl = document.querySelector('.target-zone');
        const colorStripEl = document.querySelector('.color-strip');
        const startBtn = document.querySelector('.start-btn');
        const prizeAmountEl = document.querySelector('.prize-amount');
        const gameAreaEl = document.querySelector('.game-area');
        
        // Log if any elements are missing
        if (!scoreEl) console.error("Score element not found");
        if (!currentColorEl) console.error("Current color element not found");
        if (!targetZoneEl) console.error("Target zone element not found");
        if (!colorStripEl) console.error("Color strip element not found");
        if (!startBtn) console.error("Start button element not found");
        if (!prizeAmountEl) console.error("Prize amount element not found");
        if (!gameAreaEl) console.error("Game area element not found");
        
        // Game variables
        let score = 0;
        let targetColor = null;
        let currentColor = null;
        let gameActive = false;
        let colorChangeSpeed = 1000; // ms
        let animationFrame = null;
        let colorPosition = 0;
        let colors = [
            '#f94144', '#f3722c', '#f8961e', '#f9c74f', 
            '#90be6d', '#43aa8b', '#577590', '#4361ee'
        ];
        
        // Initialize color strip
        function initColorStrip() {
            if (!colorStripEl) return;
            
            colorStripEl.innerHTML = '';
            colors.forEach(color => {
                const segment = document.createElement('div');
                segment.className = 'color-segment';
                segment.style.backgroundColor = color;
                colorStripEl.appendChild(segment);
            });
        }
        
        // Generate a random color from our palette
        function getRandomColor() {
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        // Start the game
        function startGame() {
            if (gameActive) {
                // If already running, reset the game
                resetGame();
                return;
            }
            
            // Reset game state
            score = 0;
            if (scoreEl) scoreEl.textContent = score;
            if (prizeAmountEl) prizeAmountEl.textContent = '$0';
            gameActive = true;
            colorChangeSpeed = 1000;
            
            // Update button
            if (startBtn) startBtn.textContent = 'RESET';
            
            // Set up target color
            targetColor = getRandomColor();
            if (targetZoneEl) {
                targetZoneEl.style.backgroundColor = targetColor;
                targetZoneEl.classList.add('pulse');
            }
            
            // Initialize the color strip
            initColorStrip();
            
            // Initialize the current color immediately
            updateCurrentColor();
            
            // Start color animation
            startColorAnimation();
        }
        
        // Reset the game
        function resetGame() {
            // Cancel animation if running
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            // Reset game state and start again
            gameActive = false;
            startGame();
        }
        
        // Start color animation
        function startColorAnimation() {
            let startTime = null;
            let lastColorChange = 0;
            
            // Animation function
            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                
                // Time to change color
                if (elapsed - lastColorChange >= colorChangeSpeed) {
                    lastColorChange = elapsed;
                    updateCurrentColor();
                }
                
                if (gameActive) {
                    animationFrame = requestAnimationFrame(animate);
                }
            }
            
            // Start the animation
            animationFrame = requestAnimationFrame(animate);
        }
        
        // Update the current color
        function updateCurrentColor() {
            if (!currentColorEl) return;
            
            colorPosition = (colorPosition + 1) % colors.length;
            currentColor = colors[colorPosition];
            currentColorEl.style.backgroundColor = currentColor;
        }
        
        // Handle tap/click on the game area
        function handleTap() {
            if (!gameActive) return;
            
            if (currentColor === targetColor) {
                // Correct match
                score++;
                if (scoreEl) scoreEl.textContent = score;
                if (gameAreaEl) gameAreaEl.classList.add('success-flash');
                
                // Increase difficulty
                colorChangeSpeed = Math.max(300, colorChangeSpeed - 50);
                
                // Change target color
                targetColor = getRandomColor();
                if (targetZoneEl) targetZoneEl.style.backgroundColor = targetColor;
                
                // Check win condition
                if (score >= 25) {
                    winGame();
                }
                
                // Remove flash after animation
                setTimeout(() => {
                    if (gameAreaEl) gameAreaEl.classList.remove('success-flash');
                }, 500);
            } else {
                // Incorrect match
                if (gameAreaEl) gameAreaEl.classList.add('fail-flash');
                
                // Remove flash after animation
                setTimeout(() => {
                    if (gameAreaEl) gameAreaEl.classList.remove('fail-flash');
                }, 500);
            }
        }
        
        // Win the game
        function winGame() {
            gameActive = false;
            if (prizeAmountEl) prizeAmountEl.textContent = '$5';
            if (targetZoneEl) targetZoneEl.classList.remove('pulse');
            
            // Cancel animation
            cancelAnimationFrame(animationFrame);
            
            // Add confetti
            createConfetti();
            
            // Reset button
            if (startBtn) startBtn.textContent = 'PLAY AGAIN';
        }
        
        // Create confetti effect
        function createConfetti() {
            for (let i = 0; i < 100; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    
                    // Random color
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    // Random position
                    confetti.style.left = Math.random() * 100 + 'vw';
                    
                    // Random size
                    const size = Math.random() * 8 + 5;
                    confetti.style.width = size + 'px';
                    confetti.style.height = size + 'px';
                    
                    // Random rotation
                    confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
                    
                    // Random animation duration
                    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
                    
                    document.body.appendChild(confetti);
                    
                    // Remove after animation completes
                    setTimeout(() => {
                        confetti.remove();
                    }, 3000);
                }, i * 20);
            }
        }
        
        // Initialize
        initColorStrip();
        if (currentColorEl) currentColorEl.style.backgroundColor = colors[0];
        
        // Add event listeners
        if (startBtn) {
            console.log("Adding click event to start button");
            startBtn.addEventListener('click', startGame);
        }
        
        if (gameAreaEl) {
            console.log("Adding click event to game area");
            gameAreaEl.addEventListener('click', handleTap);
            
            // Touch events for mobile
            gameAreaEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleTap();
            });
        }
    } catch (error) {
        console.error("An error occurred during initialization:", error);
    }
}; 