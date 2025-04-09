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
        scratchOverlay.width = scratchOverlay.offsetWidth;
        scratchOverlay.height = scratchOverlay.offsetHeight;
        totalArea = scratchOverlay.width * scratchOverlay.height;
    }
    
    // Initialize the scratch card
    function initScratchCard() {
        // Reset the scratch overlay
        scratchedArea = 0;
        isRevealed = false;
        updateProgress(0);
        
        // Set canvas size
        setCanvasSize();
        
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
    
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const rect = scratchOverlay.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    }
    
    function startDrawingTouch(e) {
        e.preventDefault();
        isDrawing = true;
        const touch = e.touches[0];
        const rect = scratchOverlay.getBoundingClientRect();
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const rect = scratchOverlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const radius = 15;
        
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
    
    function drawTouch(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = scratchOverlay.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const radius = 15;
        
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
    scratchOverlay.addEventListener('touchstart', startDrawingTouch, { passive: false });
    scratchOverlay.addEventListener('touchmove', drawTouch, { passive: false });
    scratchOverlay.addEventListener('touchend', stopDrawing, { passive: false });
    
    // Reset button click event
    resetBtn.addEventListener('click', initScratchCard);
    
    // Initialize on load
    initScratchCard();
    
    // Handle window resize
    window.addEventListener('resize', setCanvasSize);
}); 