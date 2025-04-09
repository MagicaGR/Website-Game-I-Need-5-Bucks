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
    let scratchPoints = [];
    
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
        scratchPoints = [];
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
        scratchPoints.push({ x: lastX, y: lastY });
    }
    
    function startDrawingTouch(e) {
        e.preventDefault();
        isDrawing = true;
        const touch = e.touches[0];
        const rect = scratchOverlay.getBoundingClientRect();
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
        scratchPoints.push({ x: lastX, y: lastY });
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const rect = scratchOverlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const radius = 15;
        
        // Add point to scratch path
        scratchPoints.push({ x, y });
        
        // Create a new canvas for the scratch effect
        const scratchCanvas = document.createElement('canvas');
        scratchCanvas.width = canvas.width;
        scratchCanvas.height = canvas.height;
        const scratchCtx = scratchCanvas.getContext('2d');
        
        // Draw the scratch path
        scratchCtx.beginPath();
        scratchCtx.moveTo(scratchPoints[0].x, scratchPoints[0].y);
        for (let i = 1; i < scratchPoints.length; i++) {
            scratchCtx.lineTo(scratchPoints[i].x, scratchPoints[i].y);
        }
        scratchCtx.strokeStyle = 'transparent';
        scratchCtx.lineWidth = radius * 2;
        scratchCtx.lineCap = 'round';
        scratchCtx.lineJoin = 'round';
        scratchCtx.stroke();
        
        // Create a mask from the scratch path
        const mask = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
        
        // Apply the mask to the overlay
        const overlayCtx = scratchOverlay.getContext('2d');
        overlayCtx.globalCompositeOperation = 'destination-out';
        overlayCtx.drawImage(scratchCanvas, 0, 0);
        
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
        
        // Add point to scratch path
        scratchPoints.push({ x, y });
        
        // Create a new canvas for the scratch effect
        const scratchCanvas = document.createElement('canvas');
        scratchCanvas.width = canvas.width;
        scratchCanvas.height = canvas.height;
        const scratchCtx = scratchCanvas.getContext('2d');
        
        // Draw the scratch path
        scratchCtx.beginPath();
        scratchCtx.moveTo(scratchPoints[0].x, scratchPoints[0].y);
        for (let i = 1; i < scratchPoints.length; i++) {
            scratchCtx.lineTo(scratchPoints[i].x, scratchPoints[i].y);
        }
        scratchCtx.strokeStyle = 'transparent';
        scratchCtx.lineWidth = radius * 2;
        scratchCtx.lineCap = 'round';
        scratchCtx.lineJoin = 'round';
        scratchCtx.stroke();
        
        // Create a mask from the scratch path
        const mask = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
        
        // Apply the mask to the overlay
        const overlayCtx = scratchOverlay.getContext('2d');
        overlayCtx.globalCompositeOperation = 'destination-out';
        overlayCtx.drawImage(scratchCanvas, 0, 0);
        
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