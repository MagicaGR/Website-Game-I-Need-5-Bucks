document.addEventListener('DOMContentLoaded', function() {
    const scratchOverlay = document.getElementById('scratch-overlay');
    const resetBtn = document.getElementById('reset-btn');
    const prizeAmount = document.getElementById('prize-amount');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    // Possible prize amounts
    const prizes = ['$1', '$2', '$5', '$10', '$20', '$50', '$100'];
    
    // Initialize variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let scratchedArea = 0;
    let totalArea = 0;
    let isRevealed = false;
    
    // Create canvas context for scratching
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function setCanvasSize() {
        canvas.width = scratchOverlay.offsetWidth;
        canvas.height = scratchOverlay.offsetHeight;
        totalArea = canvas.width * canvas.height;
    }
    
    // Initialize the scratch card
    function initScratchCard() {
        // Reset the scratch overlay
        scratchOverlay.style.background = '#3498db';
        scratchOverlay.style.clipPath = 'none';
        scratchOverlay.style.display = 'block';
        scratchOverlay.style.opacity = '1';
        scratchedArea = 0;
        isRevealed = false;
        updateProgress(0);
        
        // Set canvas size
        setCanvasSize();
        
        // Fill the canvas with a color
        ctx.fillStyle = '#3498db';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some text or pattern to make it look like a scratch card
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#2980b9';
        ctx.textAlign = 'center';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillText('SCRATCH!', 40 + i * 40, 40 + j * 40);
            }
        }
        
        // Convert canvas to image and set as background
        const dataURL = canvas.toDataURL();
        scratchOverlay.style.backgroundImage = `url(${dataURL})`;
        
        // Set a random prize
        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
        prizeAmount.textContent = randomPrize;
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
        isDrawing = true;
        const rect = scratchOverlay.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    }
    
    function startDrawingTouch(e) {
        isDrawing = true;
        const touch = e.touches[0];
        const rect = scratchOverlay.getBoundingClientRect();
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
        e.preventDefault();
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = scratchOverlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const radius = 15;
        
        // Add to the clip path
        const currentClipPath = scratchOverlay.style.clipPath || '';
        const newCircle = `circle(${radius}px at ${x}px ${y}px)`;
        
        if (currentClipPath === '') {
            scratchOverlay.style.clipPath = `${newCircle}`;
        } else if (!currentClipPath.includes('none')) {
            scratchOverlay.style.clipPath = `${currentClipPath}, ${newCircle}`;
        } else {
            scratchOverlay.style.clipPath = newCircle;
        }
        
        // Calculate scratched area
        scratchedArea += Math.PI * radius * radius;
        const percentage = Math.min(100, Math.round((scratchedArea / totalArea) * 100));
        updateProgress(percentage);
        
        lastX = x;
        lastY = y;
    }
    
    function drawTouch(e) {
        if (!isDrawing) return;
        
        const touch = e.touches[0];
        const rect = scratchOverlay.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const radius = 15;
        
        // Add to the clip path
        const currentClipPath = scratchOverlay.style.clipPath || '';
        const newCircle = `circle(${radius}px at ${x}px ${y}px)`;
        
        if (currentClipPath === '') {
            scratchOverlay.style.clipPath = `${newCircle}`;
        } else if (!currentClipPath.includes('none')) {
            scratchOverlay.style.clipPath = `${currentClipPath}, ${newCircle}`;
        } else {
            scratchOverlay.style.clipPath = newCircle;
        }
        
        // Calculate scratched area
        scratchedArea += Math.PI * radius * radius;
        const percentage = Math.min(100, Math.round((scratchedArea / totalArea) * 100));
        updateProgress(percentage);
        
        lastX = x;
        lastY = y;
        e.preventDefault();
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    // Event listeners for scratching
    scratchOverlay.addEventListener('mousedown', startDrawing);
    scratchOverlay.addEventListener('mousemove', draw);
    scratchOverlay.addEventListener('mouseup', stopDrawing);
    scratchOverlay.addEventListener('mouseleave', stopDrawing);
    
    // Touch events for mobile
    scratchOverlay.addEventListener('touchstart', startDrawingTouch);
    scratchOverlay.addEventListener('touchmove', drawTouch);
    scratchOverlay.addEventListener('touchend', stopDrawing);
    
    // Reset button click event
    resetBtn.addEventListener('click', initScratchCard);
    
    // Initialize on load
    initScratchCard();
    
    // Handle window resize
    window.addEventListener('resize', setCanvasSize);
}); 