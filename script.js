document.addEventListener('DOMContentLoaded', function() {
    const scratchOverlay = document.getElementById('scratch-overlay');
    const resetBtn = document.getElementById('reset-btn');
    const prizeAmount = document.getElementById('prize-amount');
    
    // Possible prize amounts
    const prizes = ['$1', '$2', '$5', '$10', '$20', '$50', '$100'];
    
    // Initialize the scratch card
    initScratchCard();
    
    // Set up the scratch functionality
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Create canvas context for scratching
    const canvas = document.createElement('canvas');
    canvas.width = scratchOverlay.offsetWidth;
    canvas.height = scratchOverlay.offsetHeight;
    const ctx = canvas.getContext('2d');
    
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
    
    function initScratchCard() {
        // Reset the scratch overlay
        scratchOverlay.style.background = '#3498db';
        scratchOverlay.style.clipPath = 'none';
        
        // Set a random prize
        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
        prizeAmount.textContent = randomPrize;
    }
    
    function startDrawing(e) {
        isDrawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
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
        
        // Create a scratched effect using clip-path
        const x = e.offsetX;
        const y = e.offsetY;
        const radius = 20;
        
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
        
        lastX = x;
        lastY = y;
    }
    
    function drawTouch(e) {
        if (!isDrawing) return;
        
        const touch = e.touches[0];
        const rect = scratchOverlay.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const radius = 20;
        
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
        
        lastX = x;
        lastY = y;
        e.preventDefault();
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
}); 