document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const scoreEl = document.querySelector('.score');
    const currentColorEl = document.querySelector('.current-color');
    const targetZoneEl = document.querySelector('.target-zone');
    const colorStripEl = document.querySelector('.color-strip');
    const startBtn = document.querySelector('.start-btn');
    const prizeAmountEl = document.querySelector('.prize-amount');
    const gameAreaEl = document.querySelector('.game-area');
    
    console.log("Game initialized");
    console.log("Elements found:", {
        score: scoreEl, 
        currentColor: currentColorEl, 
        targetZone: targetZoneEl,
        colorStrip: colorStripEl,
        startBtn: startBtn,
        prizeAmount: prizeAmountEl,
        gameArea: gameAreaEl
    });
    
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
        console.log("startGame called");
        if (gameActive) {
            // If already running, reset the game
            resetGame();
            return;
        }
        
        // Reset game state
        score = 0;
        scoreEl.textContent = score;
        prizeAmountEl.textContent = '$0';
        gameActive = true;
        colorChangeSpeed = 1000;
        
        // Update button
        startBtn.textContent = 'RESET';
        
        // Set up target color
        targetColor = getRandomColor();
        targetZoneEl.style.backgroundColor = targetColor;
        targetZoneEl.classList.add('pulse');
        
        // Initialize the color strip
        initColorStrip();
        
        // Initialize the current color immediately
        updateCurrentColor();
        
        // Start color animation
        startColorAnimation();
        
        console.log("Game started with target color:", targetColor);
    }
    
    // Reset the game
    function resetGame() {
        console.log("Resetting game");
        
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
        console.log("Starting color animation");
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
        colorPosition = (colorPosition + 1) % colors.length;
        currentColor = colors[colorPosition];
        currentColorEl.style.backgroundColor = currentColor;
        console.log("Current color updated to:", currentColor);
    }
    
    // Handle tap/click on the game area
    function handleTap() {
        console.log("Tap detected, gameActive:", gameActive);
        if (!gameActive) return;
        
        console.log("Checking match:", currentColor, targetColor);
        if (currentColor === targetColor) {
            // Correct match
            score++;
            scoreEl.textContent = score;
            gameAreaEl.classList.add('success-flash');
            console.log("Match! New score:", score);
            
            // Increase difficulty
            colorChangeSpeed = Math.max(300, colorChangeSpeed - 50);
            console.log("Speed increased, new speed:", colorChangeSpeed);
            
            // Change target color
            targetColor = getRandomColor();
            targetZoneEl.style.backgroundColor = targetColor;
            console.log("New target color:", targetColor);
            
            // Check win condition
            if (score >= 25) {
                winGame();
            }
            
            // Remove flash after animation
            setTimeout(() => {
                gameAreaEl.classList.remove('success-flash');
            }, 500);
        } else {
            // Incorrect match
            console.log("No match!");
            gameAreaEl.classList.add('fail-flash');
            
            // Remove flash after animation
            setTimeout(() => {
                gameAreaEl.classList.remove('fail-flash');
            }, 500);
        }
    }
    
    // Win the game
    function winGame() {
        console.log("Game won!");
        gameActive = false;
        prizeAmountEl.textContent = '$5';
        targetZoneEl.classList.remove('pulse');
        
        // Cancel animation
        cancelAnimationFrame(animationFrame);
        
        // Add confetti
        createConfetti();
        
        // Reset button
        startBtn.textContent = 'PLAY AGAIN';
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
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    console.log("Start button event listener added");
    
    gameAreaEl.addEventListener('click', handleTap);
    console.log("Game area click event listener added");
    
    // Touch events for mobile
    gameAreaEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTap();
    });
    console.log("Touch event listener added");
    
    // Initialize color strip and current color on load
    initColorStrip();
    currentColorEl.style.backgroundColor = colors[0];
}); 