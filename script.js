document.addEventListener('DOMContentLoaded', function() {
    const scratchOverlay = document.getElementById('scratch-overlay');
    const resetBtn = document.getElementById('reset-btn');
    const prizeAmount = document.getElementById('prize-amount');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    // Initialize variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let scratchedArea = 0;
    let totalArea = 0;
    let isRevealed = false;
    
    // Get canvas context
    const ctx = scratchOverlay.getContext('2d');
    
    // Set canvas size
    function setCanvasSize() {
        const rect = scratchOverlay.getBoundingClientRect();
        scratchOverlay.width = rect.width;
        scratchOverlay.height = rect.height;
        totalArea = scratchOverlay.width * scratchOverlay.height;
        initScratchCard(); // Reinitialize when size changes
    }
    
    // Initialize the scratch card
    function initScratchCard() {
        // Reset the scratch overlay
        scratchedArea = 0;
        isRevealed = false;
        updateProgress(0);
        
        // Fill the canvas with a color
        ctx.fillStyle = '#3498db';
        ctx.fillRect(0, 0, scratchOverlay.width, scratchOverlay.height);
        
        // Add some text or pattern to make it look like a scratch card
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#2980b9';
        ctx.textAlign = 'center';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillText('SCRATCH!', 40 + i * 40, 40 + j * 40);
            }
        }
        
        // Always set prize to $5
        prizeAmount.textContent = '$5';
    }
    
    function updateProgress(percentage) {
        progressBar.style.width = `${percentage}%`;
        if (percentage < 30) {
            progressText.textContent = "Keep scratching! You're almost there!";
        } else if (percentage < 60) {
            progressText.textContent = "Great job! Keep going!";
        } else if (percentage < 90) {
            progressText.textContent = "Almost there! Just a bit more!";
        } else {
            progressText.textContent = "Congratulations! You've revealed your prize!";
            if (!isRevealed) {
                isRevealed = true;
                // Add some celebration effects
                scratchOverlay.style.transition = 'opacity 0.5s ease';
                scratchOverlay.style.opacity = '0';
                setTimeout(() => {
                    scratchOverlay.style.display = 'none';
                }, 500);
            }
        }
    }
    
    function getCoordinates(e) {
        const rect = scratchOverlay.getBoundingClientRect();
        const scaleX = scratchOverlay.width / rect.width;
        const scaleY = scratchOverlay.height / rect.height;
        
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
    
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const coords = getCoordinates(e);
        lastX = coords.x;
        lastY = coords.y;
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const coords = getCoordinates(e);
        const x = coords.x;
        const y = coords.y;
        const radius = 20; // Increased radius for better visibility
        
        // Draw the scratch path
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'transparent';
        ctx.lineWidth = radius * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'destination-out';
        ctx.stroke();
        
        // Calculate scratched area
        scratchedArea += Math.PI * radius * radius;
        const percentage = Math.min(100, Math.round((scratchedArea / totalArea) * 100));
        updateProgress(percentage);
        
        lastX = x;
        lastY = y;
    }
    
    function stopDrawing(e) {
        if (e) e.preventDefault();
        isDrawing = false;
    }
    
    // Event listeners for scratching
    scratchOverlay.addEventListener('mousedown', startDrawing, { passive: false });
    scratchOverlay.addEventListener('mousemove', draw, { passive: false });
    scratchOverlay.addEventListener('mouseup', stopDrawing, { passive: false });
    scratchOverlay.addEventListener('mouseleave', stopDrawing, { passive: false });
    
    // Touch events for mobile
    scratchOverlay.addEventListener('touchstart', startDrawing, { passive: false });
    scratchOverlay.addEventListener('touchmove', draw, { passive: false });
    scratchOverlay.addEventListener('touchend', stopDrawing, { passive: false });
    
    // Reset button click event
    resetBtn.addEventListener('click', initScratchCard);
    
    // Initialize on load
    setCanvasSize();
    
    // Handle window resize
    window.addEventListener('resize', setCanvasSize);
}); 