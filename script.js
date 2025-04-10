document.addEventListener('DOMContentLoaded', function() {
    // Game symbols
    const symbols = ['🍎', '🍊', '🍇', '🍒', '🍋', '🍉'];
    const cards = document.querySelectorAll('.card');
    const prizeAmount = document.querySelector('.prize-amount');
    const resetBtn = document.getElementById('reset-btn');
    
    // Game state
    let revealedSymbols = [];
    let isGameComplete = false;
    
    // Initialize each card
    cards.forEach((card, index) => {
        const canvas = card.querySelector('.scratch-overlay');
        const symbol = card.querySelector('.symbol');
        const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let scratchedArea = 0;
    let totalArea = 0;
    let isRevealed = false;
    
    // Set canvas size
    function setCanvasSize() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            totalArea = canvas.width * canvas.height;
            initScratchCard();
    }
    
    // Initialize the scratch card
    function initScratchCard() {
        // Reset the scratch overlay
        scratchedArea = 0;
        isRevealed = false;
            canvas.style.display = 'block';
            canvas.style.opacity = '1';
            
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Fill the canvas with a semi-transparent white
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add scratch texture
        ctx.fillStyle = '#3498db';
            for (let i = 0; i < canvas.width; i += 20) {
                for (let j = 0; j < canvas.height; j += 20) {
                    ctx.fillRect(i, j, 10, 10);
                }
            }
        }
        
        function getCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            if (e.type.includes('touch')) {
                const touch = e.touches[0];
                return {
                    x: (touch.clientX - rect.left) * scaleX,
                    y: (touch.clientY - rect.top) * scaleY
                };
            } else {
                return {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY
                };
            }
        }
        
        function scratchAtPoint(x, y) {
            const scratchRadius = 25;
            
            // Create scratch effect
            ctx.beginPath();
            ctx.arc(x, y, scratchRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'transparent';
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fill();
            
            // Add scratch marks
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * scratchRadius;
                const tx = x + Math.cos(angle) * distance;
                const ty = y + Math.sin(angle) * distance;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(tx, ty);
                ctx.strokeStyle = 'transparent';
                ctx.lineWidth = 4;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.stroke();
            }
            
            // Update scratched area
            scratchedArea += Math.PI * scratchRadius * scratchRadius;
            const percentage = Math.min(100, Math.round((scratchedArea / totalArea) * 100));
            
            // Check if card is revealed
            if (percentage > 50 && !isRevealed) {
                isRevealed = true;
                canvas.style.transition = 'opacity 0.5s ease';
                canvas.style.opacity = '0';
                setTimeout(() => {
                    canvas.style.display = 'none';
                    checkGameCompletion();
                }, 500);
        }
    }
    
    function startDrawing(e) {
            if (isRevealed) return;
        e.preventDefault();
            e.stopPropagation();
        isDrawing = true;
            const coords = getCoordinates(e);
            lastX = coords.x;
            lastY = coords.y;
            scratchAtPoint(lastX, lastY);
    }
    
    function draw(e) {
            if (!isDrawing || isRevealed) return;
        e.preventDefault();
            e.stopPropagation();
            
            const coords = getCoordinates(e);
            const x = coords.x;
            const y = coords.y;
            
            // Draw circles along the path
            const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
            const steps = Math.ceil(distance / 3);
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const currentX = lastX + (x - lastX) * t;
                const currentY = lastY + (y - lastY) * t;
                scratchAtPoint(currentX, currentY);
            }
        
        lastX = x;
        lastY = y;
    }
    
        function stopDrawing(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            isDrawing = false;
        }
        
        // Prevent double-click from selecting text
        canvas.addEventListener('dblclick', function(e) {
        e.preventDefault();
            e.stopPropagation();
        });
        
        // Event listeners for scratching
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
        
        // Initialize on load
        setCanvasSize();
        
        // Handle window resize
        window.addEventListener('resize', setCanvasSize);
    });
    
    function checkGameCompletion() {
        if (isGameComplete) return;
        
        revealedSymbols = Array.from(cards)
            .filter(card => card.querySelector('.scratch-overlay').style.display === 'none')
            .map(card => card.querySelector('.symbol').textContent);
        
        if (revealedSymbols.length === 3) {
            isGameComplete = true;
            if (new Set(revealedSymbols).size === 1) {
                prizeAmount.textContent = '$5';
                prizeAmount.style.color = '#2ecc71';
            } else {
                prizeAmount.textContent = '$0';
                prizeAmount.style.color = '#e74c3c';
            }
        }
    }
    
    function resetGame() {
        // Reset game state
        isGameComplete = false;
        revealedSymbols = [];
        prizeAmount.textContent = '$0';
        prizeAmount.style.color = '#2ecc71';
        
        // Reset cards
        cards.forEach(card => {
            const canvas = card.querySelector('.scratch-overlay');
            const symbol = card.querySelector('.symbol');
            
            // Reset canvas
            canvas.style.display = 'block';
            canvas.style.opacity = '1';
            
            // Set random symbol
            symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            
            // Reinitialize scratch card
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add scratch texture
            ctx.fillStyle = '#3498db';
            for (let i = 0; i < canvas.width; i += 20) {
                for (let j = 0; j < canvas.height; j += 20) {
                    ctx.fillRect(i, j, 10, 10);
                }
            }
        });
    }
    
    // Reset button click event
    resetBtn.addEventListener('click', resetGame);
    
    // Initialize game
    resetGame();
}); 