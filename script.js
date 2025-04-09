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
        
        // Reset canvas display
        scratchOverlay.style.display = 'block';
        scratchOverlay.style.opacity = '1';
        
        // Clear the canvas
        ctx.clearRect(0, 0, scratchOverlay.width, scratchOverlay.height);
        
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
        
        // Draw initial circle
        drawCircle(lastX, lastY);
    }
    
    function drawCircle(x, y) {
        const radius = 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'transparent';
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill();
        
        // Add some texture to make it look more like scratching
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const tx = x + Math.cos(angle) * distance;
            const ty = y + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = 'transparent';
            ctx.lineWidth = 2;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.stroke();
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const coords = getCoordinates(e);
        const x = coords.x;
        const y = coords.y;
        
        // Draw circles along the path
        const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
        const steps = Math.ceil(distance / 5);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const currentX = lastX + (x - lastX) * t;
            const currentY = lastY + (y - lastY) * t;
            drawCircle(currentX, currentY);
        }
        
        // Calculate scratched area
        scratchedArea += Math.PI * 15 * 15 * steps;
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
    resetBtn.addEventListener('click', function() {
        initScratchCard();
    });
    
    // Initialize on load
    setCanvasSize();
    
    // Handle window resize
    window.addEventListener('resize', setCanvasSize);
}); 