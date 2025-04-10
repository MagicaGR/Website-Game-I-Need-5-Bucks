// Wait for all content to load before starting
window.addEventListener('load', function() {
    // DOM elements - Game screens
    const introScreen = document.getElementById('intro-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const settingsScreen = document.getElementById('settings-screen');
    const startIntroBtn = document.getElementById('start-intro-btn');
    const restartBtn = document.getElementById('restart-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const difficultySelect = document.getElementById('difficulty');
    const soundToggle = document.getElementById('sound-toggle');
    const doubleJumpToggle = document.getElementById('double-jump-toggle');
    const dayNightToggle = document.getElementById('day-night-toggle');
    const achievement = document.getElementById('achievement');
    const achievementText = document.getElementById('achievement-text');
    
    // DOM elements - Game area
    const player = document.getElementById('player');
    const gameArea = document.querySelector('.game-area');
    const startBtn = document.getElementById('start-btn');
    const scoreElement = document.getElementById('score');
    const streakElement = document.getElementById('streak');
    const prizeElement = document.getElementById('prize');
    const finalScoreElement = document.getElementById('final-score');
    const finalStreakElement = document.getElementById('final-streak');
    const highScoreElement = document.getElementById('high-score');
    const milestonePopup = document.getElementById('milestone-popup');
    const milestoneText = document.getElementById('milestone-text');
    const powerupIndicator = document.getElementById('powerup-indicator');
    const powerupName = document.getElementById('powerup-name');
    const powerupTimer = document.getElementById('powerup-timer');
    const comboIndicator = document.getElementById('combo-indicator');
    const doubleJumpIndicator = document.querySelector('.double-jump-indicator');
    const characterOptions = document.querySelectorAll('.character-option');
    
    // Game state
    let isPlaying = false;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let streak = 0;
    let bestStreak = 0;
    let comboMultiplier = 1;
    let obstacleSpeed = 2; // seconds
    let obstacleInterval;
    let scoreInterval;
    let isJumping = false;
    let obstacles = []; // Track all obstacles
    let lastObstacleTime = 0;
    let activePowerup = null;
    let powerupTimeout;
    let soundEnabled = true;
    let doubleJumpEnabled = true;
    let canDoubleJump = false;
    let hasDoubleJumped = false;
    let difficulty = 'medium';
    let dayNightCycleEnabled = true;
    let isDayTime = true;
    let dayNightInterval;
    let characterColor = 'blue';
    let achievements = JSON.parse(localStorage.getItem('achievements')) || {};
    
    // Sound effects - create audio elements
    const sounds = {
        jump: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAAAAAAAAAP//AoD//wAAAAA='),
        powerup: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAAAAAAAAAP//f3///wAAAAA='),
        collision: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAAAAAAAAAP//f5D//wAAAAA='),
        win: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAAAAAAAAAP//f3///wAAAAA='),
        achievement: new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAAAAAAAAAP//f2P//wAAAAA=')
    };
    
    // Achievement definitions
    const achievementsList = {
        firstJump: {
            title: "First Jump",
            description: "Jump for the first time"
        },
        perfectLanding: {
            title: "Perfect Landing",
            description: "Get a streak of at least 10"
        },
        speedDemon: {
            title: "Speed Demon",
            description: "Collect a speed power-up"
        },
        invincible: {
            title: "Invincible",
            description: "Survive with a shield"
        },
        nightOwl: {
            title: "Night Owl",
            description: "Play during night time"
        },
        comboMaster: {
            title: "Combo Master",
            description: "Reach a 3x combo multiplier"
        },
        highFlyer: {
            title: "High Flyer",
            description: "Use double jump"
        },
        treasureHunter: {
            title: "Treasure Hunter",
            description: "Reach a high score of 30"
        }
    };
    
    // Update high score display
    highScoreElement.textContent = highScore;
    
    // Play sound if enabled
    function playSound(name) {
        if (soundEnabled && sounds[name]) {
            sounds[name].currentTime = 0;
            sounds[name].play().catch(e => console.log('Sound play error:', e));
        }
    }
    
    // Show achievement notification
    function showAchievement(id) {
        if (achievements[id]) return; // Already unlocked
        
        achievements[id] = true;
        localStorage.setItem('achievements', JSON.stringify(achievements));
        
        const achievementInfo = achievementsList[id];
        achievementText.textContent = achievementInfo.description;
        achievement.querySelector('.achievement-title').textContent = achievementInfo.title;
        
        achievement.classList.add('show');
        playSound('achievement');
        
        setTimeout(() => {
            achievement.classList.remove('show');
        }, 3000);
    }
    
    // Initialize game
    function init() {
        // Update high score display
        highScoreElement.textContent = highScore;
        
        // Hide intro screen on start button click
        startIntroBtn.addEventListener('click', () => {
            introScreen.classList.add('hidden');
        });
        
        // Restart button in game over screen
        restartBtn.addEventListener('click', () => {
            gameOverScreen.classList.add('hidden');
            startGame();
        });
        
        // Settings button
        settingsBtn.addEventListener('click', () => {
            settingsScreen.classList.remove('hidden');
        });
        
        // Close settings
        closeSettingsBtn.addEventListener('click', () => {
            settingsScreen.classList.add('hidden');
            // Apply settings
            difficulty = difficultySelect.value;
            soundEnabled = soundToggle.checked;
            doubleJumpEnabled = doubleJumpToggle.checked;
            dayNightCycleEnabled = dayNightToggle.checked;
            
            updateDifficulty();
            updateDayNightCycle();
            updateDoubleJumpIndicator();
        });
        
        // Character selection
        characterOptions.forEach(option => {
            option.addEventListener('click', () => {
                characterOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                characterColor = option.dataset.character;
                updateCharacterColor();
            });
        });
        
        // Reset game state
        resetGameState();
        
        // Add event listeners
        document.addEventListener('keydown', handleJump);
        gameArea.addEventListener('touchstart', handleJump);
        startBtn.addEventListener('click', startGame);
        
        // Start day/night cycle if enabled
        updateDayNightCycle();
    }
    
    // Reset game state
    function resetGameState() {
        score = 0;
        streak = 0;
        bestStreak = 0;
        comboMultiplier = 1;
        isPlaying = false;
        obstacleSpeed = getDifficultySpeed();
        scoreElement.textContent = '0';
        streakElement.textContent = '0x';
        prizeElement.textContent = '$0';
        canDoubleJump = false;
        hasDoubleJumped = false;
        
        // Clear ALL existing obstacles
        clearAllObstacles();
        
        // Update double jump indicator
        updateDoubleJumpIndicator();
    }
    
    // Update character color based on selection
    function updateCharacterColor() {
        const playerChar = player.querySelector('.player-character');
        playerChar.style.background = '';
        playerChar.classList.remove('character-blue', 'character-red', 'character-gold');
        
        switch(characterColor) {
            case 'red':
                playerChar.style.background = 'linear-gradient(135deg, var(--danger), #b5179e)';
                break;
            case 'gold':
                playerChar.style.background = 'linear-gradient(135deg, var(--gold), #fb8500)';
                break;
            default: // blue
                playerChar.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
                break;
        }
    }
    
    // Update day/night cycle
    function updateDayNightCycle() {
        if (dayNightInterval) {
            clearInterval(dayNightInterval);
        }
        
        if (dayNightCycleEnabled) {
            // Start with day time
            isDayTime = true;
            gameArea.classList.remove('night-mode');
            
            // Toggle day/night every 30 seconds
            dayNightInterval = setInterval(() => {
                isDayTime = !isDayTime;
                
                if (isDayTime) {
                    gameArea.classList.remove('night-mode');
                } else {
                    gameArea.classList.add('night-mode');
                    // Unlock night owl achievement
                    showAchievement('nightOwl');
                }
            }, 30000);
        } else {
            // Always day time if disabled
            isDayTime = true;
            gameArea.classList.remove('night-mode');
        }
    }
    
    // Update difficulty settings
    function updateDifficulty() {
        obstacleSpeed = getDifficultySpeed();
        if (isPlaying) {
            createObstacleInterval();
        }
    }
    
    // Update double jump indicator
    function updateDoubleJumpIndicator() {
        if (!doubleJumpEnabled) {
            doubleJumpIndicator.classList.add('hidden');
            return;
        }
        
        doubleJumpIndicator.classList.remove('hidden');
        
        const indicator = doubleJumpIndicator.querySelector('div');
        if (canDoubleJump && !hasDoubleJumped) {
            indicator.className = 'double-jump-available';
        } else {
            indicator.className = 'double-jump-used';
        }
    }
    
    // Get speed based on difficulty
    function getDifficultySpeed() {
        switch(difficulty) {
            case 'easy': return 2.3;
            case 'hard': return 1.7;
            default: return 2.0; // medium
        }
    }
    
    // Helper function to properly remove all obstacles
    function clearAllObstacles() {
        // Clear obstacle tracking array
        obstacles.forEach(obstacle => {
            if (obstacle.element && obstacle.element.parentElement) {
                obstacle.element.remove();
            }
            if (obstacle.interval) {
                clearInterval(obstacle.interval);
            }
        });
        
        // Reset array
        obstacles = [];
        
        // Direct DOM cleanup as a backup
        document.querySelectorAll('.obstacle, .powerup').forEach(obs => obs.remove());
        
        // Remove active powerup
        clearActivePowerup();
    }
    
    // Start the game
    function startGame() {
        if (isPlaying) return;
        
        // Reset game state for new game
        resetGameState();
        
        // Clear any leftovers before starting
        clearAllObstacles();
        
        isPlaying = true;
        startBtn.textContent = 'PLAYING...';
        startBtn.disabled = true;
        
        // Update character color
        updateCharacterColor();
        
        // Animate player at start
        player.classList.add('game-start');
        setTimeout(() => player.classList.remove('game-start'), 500);
        
        // Start creating obstacles
        createObstacleInterval();
        
        // Start score counter
        scoreInterval = setInterval(() => {
            if (isPlaying) {
                score++;
                scoreElement.textContent = score;
                
                // Show milestone popups
                if (score % 10 === 0) {
                    showMilestone(`${score} POINTS!`);
                    
                    // Increase difficulty gradually
                    obstacleSpeed = Math.max(getDifficultySpeed() - 0.5, obstacleSpeed - 0.1);
                    createObstacleInterval(); // Refresh interval with new speed
                }
                
                // Create dynamic background effects
                if (score % 5 === 0) {
                    createBackgroundEffect();
                }
                
                // Check for high score achievement
                if (score >= 30) {
                    showAchievement('treasureHunter');
                }
                
                // Occasionally spawn power-ups (after score of 10)
                if (score > 10 && score % 12 === 0 && Math.random() > 0.4) {
                    createPowerup();
                }
                
                // Win condition
                if (score >= 50) {
                    winGame();
                }
            }
        }, 1000);
    }
    
    // Show milestone popup
    function showMilestone(text) {
        milestoneText.textContent = text;
        milestonePopup.classList.remove('hidden');
        milestonePopup.classList.add('show');
        
        setTimeout(() => {
            milestonePopup.classList.remove('show');
            milestonePopup.classList.add('hidden');
        }, 1500);
    }
    
    // Show combo indicator
    function showCombo(multiplier) {
        comboIndicator.textContent = `COMBO x${multiplier}!`;
        comboIndicator.classList.remove('show');
        
        // Force reflow to restart animation
        void comboIndicator.offsetWidth;
        
        comboIndicator.classList.add('show');
    }
    
    // Create background effects
    function createBackgroundEffect() {
        const effect = document.createElement('div');
        effect.className = 'background-effect';
        effect.style.left = Math.random() * 100 + '%';
        effect.style.top = Math.random() * 100 + '%';
        effect.style.setProperty('--size', Math.random() * 100 + 50 + 'px');
        
        gameArea.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentElement) {
                effect.remove();
            }
        }, 3000);
    }
    
    // Create obstacles at intervals
    function createObstacleInterval() {
        // Clear any existing interval
        if (obstacleInterval) {
            clearInterval(obstacleInterval);
        }
        
        // Vary the interval based on speed
        const intervalTime = 1500 - ((getDifficultySpeed() - obstacleSpeed) * 500);
        
        // Set new interval
        obstacleInterval = setInterval(() => {
            // Avoid creating obstacles too close together
            const now = Date.now();
            if (now - lastObstacleTime < 800) return;
            lastObstacleTime = now;
            
            if (Math.random() > 0.3) { // 70% chance of regular obstacle
                createObstacle();
            } else { // 30% chance of special obstacle
                createSpecialObstacle();
            }
        }, intervalTime);
    }
    
    // Create a powerup
    function createPowerup() {
        if (!isPlaying) return;
        
        const powerupTypes = [
            { name: 'SHIELD', className: 'powerup-shield', duration: 5000 },
            { name: 'SPEED UP', className: 'powerup-speedup', duration: 7000 },
            { name: 'SLOW DOWN', className: 'powerup-slowdown', duration: 6000 }
        ];
        
        const powerupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        const powerup = document.createElement('div');
        powerup.className = `powerup ${powerupType.className}`;
        powerup.dataset.name = powerupType.name;
        powerup.dataset.duration = powerupType.duration;
        
        // Set animation duration based on current speed
        powerup.style.animationDuration = obstacleSpeed + 's';
        
        gameArea.appendChild(powerup);
        
        // Check for collection
        const checkCollision = setInterval(() => {
            if (!isPlaying) {
                clearInterval(checkCollision);
                return;
            }
            
            if (isColliding(player, powerup)) {
                clearInterval(checkCollision);
                collectPowerup(powerup, powerupType);
                powerup.remove();
                return;
            }
            
            // Remove once off-screen
            const powerupRect = powerup.getBoundingClientRect();
            if (powerupRect.right < 0) {
                if (powerup.parentElement) {
                    powerup.remove();
                }
                clearInterval(checkCollision);
            }
        }, 10);
        
        // Remove after animation completes
        setTimeout(() => {
            if (powerup.parentElement) {
                powerup.remove();
                clearInterval(checkCollision);
            }
        }, obstacleSpeed * 1000);
    }
    
    // Powerup collection
    function collectPowerup(powerupElement, powerupType) {
        // Play sound
        playSound('powerup');
        
        // Clear any existing powerup
        clearActivePowerup();
        
        // Set the new active powerup
        activePowerup = powerupType;
        
        // Show powerup indicator
        powerupIndicator.classList.remove('hidden');
        powerupName.textContent = powerupType.name;
        powerupName.style.color = window.getComputedStyle(powerupElement).backgroundColor;
        powerupTimer.style.width = '100%';
        powerupTimer.style.background = window.getComputedStyle(powerupElement).backgroundColor;
        
        // Apply powerup effects
        let duration = parseInt(powerupElement.dataset.duration);
        
        switch(powerupType.name) {
            case 'SHIELD':
                player.classList.add('shield-active');
                showAchievement('invincible');
                break;
            case 'SPEED UP':
                player.classList.add('speed-boost');
                const oldSpeed = obstacleSpeed;
                obstacleSpeed = Math.max(0.8, obstacleSpeed - 0.5);
                createObstacleInterval();
                showAchievement('speedDemon');
                
                // Restore normal speed after powerup ends
                powerupTimeout = setTimeout(() => {
                    obstacleSpeed = oldSpeed;
                    createObstacleInterval();
                    clearActivePowerup();
                }, duration);
                break;
            case 'SLOW DOWN':
                const currentSpeed = obstacleSpeed;
                obstacleSpeed += 0.5;
                createObstacleInterval();
                
                // Restore normal speed after powerup ends
                powerupTimeout = setTimeout(() => {
                    obstacleSpeed = currentSpeed;
                    createObstacleInterval();
                    clearActivePowerup();
                }, duration);
                break;
        }
        
        // Animate timer
        let startTime = Date.now();
        const timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remainingPercent = 100 - (elapsed / duration * 100);
            
            if (remainingPercent <= 0 || !isPlaying) {
                clearInterval(timerInterval);
                if (isPlaying && powerupType.name === 'SHIELD') {
                    clearActivePowerup();
                }
            } else {
                powerupTimer.style.width = `${remainingPercent}%`;
            }
        }, 50);
    }
    
    // Clear active powerup
    function clearActivePowerup() {
        if (powerupTimeout) {
            clearTimeout(powerupTimeout);
        }
        
        player.classList.remove('shield-active', 'speed-boost');
        activePowerup = null;
        powerupIndicator.classList.add('hidden');
    }
    
    // Create a single obstacle
    function createObstacle() {
        if (!isPlaying) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Set animation duration based on current speed
        obstacle.style.animationDuration = obstacleSpeed + 's';
        
        gameArea.appendChild(obstacle);
        
        // Create obstacle data object to track it
        const obstacleData = {
            element: obstacle,
            interval: null,
            passed: false
        };
        
        // Add to tracking array
        obstacles.push(obstacleData);
        
        // Check for collision
        obstacleData.interval = setInterval(() => {
            if (!isPlaying) {
                clearInterval(obstacleData.interval);
                return;
            }
            
            // Check if player hit obstacle
            if (isColliding(player, obstacle)) {
                clearInterval(obstacleData.interval);
                
                // If shield is active, destroy obstacle without damage
                if (activePowerup && activePowerup.name === 'SHIELD') {
                    showMilestone('PROTECTED!');
                    obstacle.remove();
                    const index = obstacles.indexOf(obstacleData);
                    if (index > -1) {
                        obstacles.splice(index, 1);
                    }
                    return;
                }
                
                endGame();
            }
            
            // Check if player passed obstacle successfully (for streak)
            const obstacleRect = obstacle.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (!obstacleData.passed && obstacleRect.right < playerRect.left) {
                obstacleData.passed = true;
                // Increment streak
                streak++;
                bestStreak = Math.max(bestStreak, streak);
                streakElement.textContent = streak + 'x';
                
                // Update combo multiplier (max 3x)
                if (streak > 0 && streak % 3 === 0) {
                    comboMultiplier = Math.min(3, 1 + Math.floor(streak / 3));
                    showCombo(comboMultiplier);
                    
                    if (comboMultiplier >= 3) {
                        showAchievement('comboMaster');
                    }
                }
                
                // Show milestone for big streaks
                if (streak % 5 === 0) {
                    showMilestone(`${streak}x STREAK!`);
                    
                    if (streak >= 10) {
                        showAchievement('perfectLanding');
                    }
                }
                
                // Enable double jump after passing an obstacle (if feature enabled)
                if (doubleJumpEnabled) {
                    canDoubleJump = true;
                    hasDoubleJumped = false;
                    updateDoubleJumpIndicator();
                }
            }
            
            // Remove check once obstacle has passed
            if (obstacleRect.right < playerRect.left) {
                clearInterval(obstacleData.interval);
            }
            
            // Remove obstacle when it's off-screen
            if (obstacleRect.right < 0) {
                if (obstacle.parentElement) {
                    obstacle.remove();
                }
                clearInterval(obstacleData.interval);
                // Remove from obstacles array
                const index = obstacles.indexOf(obstacleData);
                if (index > -1) {
                    obstacles.splice(index, 1);
                }
            }
        }, 10);
    }
    
    // Create special obstacle (taller, different appearance)
    function createSpecialObstacle() {
        if (!isPlaying) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle special-obstacle';
        
        // Set animation duration based on current speed
        obstacle.style.animationDuration = obstacleSpeed + 's';
        
        gameArea.appendChild(obstacle);
        
        // Create obstacle data object
        const obstacleData = {
            element: obstacle,
            interval: null,
            passed: false
        };
        
        // Add to tracking array
        obstacles.push(obstacleData);
        
        // Check for collision - same logic as regular obstacles
        obstacleData.interval = setInterval(() => {
            if (!isPlaying) {
                clearInterval(obstacleData.interval);
                return;
            }
            
            if (isColliding(player, obstacle)) {
                clearInterval(obstacleData.interval);
                
                // If shield is active, destroy obstacle without damage
                if (activePowerup && activePowerup.name === 'SHIELD') {
                    showMilestone('PROTECTED!');
                    obstacle.remove();
                    const index = obstacles.indexOf(obstacleData);
                    if (index > -1) {
                        obstacles.splice(index, 1);
                    }
                    return;
                }
                
                endGame();
            }
            
            // Check if player passed obstacle successfully (for streak)
            const obstacleRect = obstacle.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            if (!obstacleData.passed && obstacleRect.right < playerRect.left) {
                obstacleData.passed = true;
                // Increment streak
                streak++;
                bestStreak = Math.max(bestStreak, streak);
                streakElement.textContent = streak + 'x';
                
                // Update combo multiplier (max 3x)
                if (streak > 0 && streak % 3 === 0) {
                    comboMultiplier = Math.min(3, 1 + Math.floor(streak / 3));
                    showCombo(comboMultiplier);
                    
                    if (comboMultiplier >= 3) {
                        showAchievement('comboMaster');
                    }
                }
                
                // Show milestone for big streaks
                if (streak % 5 === 0) {
                    showMilestone(`${streak}x STREAK!`);
                    
                    if (streak >= 10) {
                        showAchievement('perfectLanding');
                    }
                }
                
                // Enable double jump after passing an obstacle (if feature enabled)
                if (doubleJumpEnabled) {
                    canDoubleJump = true;
                    hasDoubleJumped = false;
                    updateDoubleJumpIndicator();
                }
            }
            
            if (obstacleRect.right < playerRect.left) {
                clearInterval(obstacleData.interval);
            }
            
            if (obstacleRect.right < 0) {
                if (obstacle.parentElement) {
                    obstacle.remove();
                }
                clearInterval(obstacleData.interval);
                const index = obstacles.indexOf(obstacleData);
                if (index > -1) {
                    obstacles.splice(index, 1);
                }
            }
        }, 10);
    }
    
    // Handle jump action
    function handleJump(event) {
        // Only jump if game is playing
        if (!isPlaying) return;
        
        // Only jump on spacebar for keyboard events
        if (event.type === 'keydown' && event.code !== 'Space') return;
        
        // First jump
        if (!isJumping) {
            isJumping = true;
            player.classList.add('jump');
            
            // Unlock first jump achievement
            showAchievement('firstJump');
            
            // Play jump sound
            playSound('jump');
            
            // Create jump particles
            createParticles();
            
            // Remove jump class when animation completes
            setTimeout(() => {
                player.classList.remove('jump');
                isJumping = false;
            }, 500);
            
            return;
        }
        
        // Handle double jump if enabled and available
        if (doubleJumpEnabled && canDoubleJump && !hasDoubleJumped && isJumping) {
            // Second jump (double jump)
            hasDoubleJumped = true;
            canDoubleJump = false;
            updateDoubleJumpIndicator();
            
            // Extend jump height/duration
            player.style.animation = 'none';
            void player.offsetHeight; // Force reflow
            player.style.animation = 'jump 0.6s cubic-bezier(0.5, 0, 0.5, 1)';
            
            // Play jump sound again
            playSound('jump');
            
            // Create more particles
            createParticles();
            
            // Unlock double jump achievement
            showAchievement('highFlyer');
            
            // Clear animation style after double jump
            setTimeout(() => {
                player.style.animation = '';
            }, 600);
        }
    }
    
    // Create particle effect when jumping
    function createParticles() {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Position particles at player's feet
            const playerRect = player.getBoundingClientRect();
            const gameRect = gameArea.getBoundingClientRect();
            
            particle.style.left = (playerRect.left + playerRect.width/2 - gameRect.left) + 'px';
            particle.style.bottom = '20px'; // Same as player bottom
            
            // Random size for variety
            const size = 4 + Math.random() * 6;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random horizontal and vertical movement
            const tx = (Math.random() - 0.5) * 50;
            const ty = Math.random() * 20 + 20;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            gameArea.appendChild(particle);
            
            // Remove particle after animation ends
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, 800);
        }
    }
    
    // Check if two elements are colliding
    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        // Add a bit of forgiveness to make the game more playable
        return !(
            rect1.right < rect2.left + 5 || 
            rect1.left > rect2.right - 5 || 
            rect1.bottom < rect2.top + 5 || 
            rect1.top > rect2.bottom - 5
        );
    }
    
    // End the game
    function endGame() {
        isPlaying = false;
        clearInterval(obstacleInterval);
        clearInterval(scoreInterval);
        
        // Play collision sound
        playSound('collision');
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        // Update final score display in game over screen
        finalScoreElement.textContent = score;
        finalStreakElement.textContent = bestStreak;
        highScoreElement.textContent = highScore;
        
        // Visual feedback for game over
        player.classList.add('game-over');
        gameArea.classList.add('game-over');
        
        // Clear any powerups
        clearActivePowerup();
        
        setTimeout(() => {
            player.classList.remove('game-over');
            gameArea.classList.remove('game-over');
            
            // Show game over screen
            gameOverScreen.classList.remove('hidden');
            
            startBtn.textContent = 'PLAY AGAIN';
            startBtn.disabled = false;
            
            // Stop obstacle animations
            document.querySelectorAll('.obstacle, .powerup').forEach(obstacle => {
                obstacle.style.animationPlayState = 'paused';
            });
        }, 500);
    }
    
    // Win the game
    function winGame() {
        isPlaying = false;
        clearInterval(obstacleInterval);
        clearInterval(scoreInterval);
        
        // Play win sound
        playSound('win');
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        prizeElement.textContent = '$5';
        startBtn.textContent = 'YOU WIN! PLAY AGAIN';
        startBtn.disabled = false;
        
        // Player celebration animation
        player.classList.add('win-animation');
        
        // Show winning milestone
        showMilestone('YOU WIN $5!');
        
        // Create celebration particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                createWinParticle();
            }, i * 60);
        }
        
        // Remove player animation after delay
        setTimeout(() => {
            player.classList.remove('win-animation');
        }, 3000);
    }
    
    // Create special particle for win animation
    function createWinParticle() {
        if (!gameArea) return;
        
        const particle = document.createElement('div');
        particle.className = 'win-particle';
        
        // Random position in game area
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = 10 + Math.random() * 30;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random color
        const hue = Math.floor(Math.random() * 360);
        particle.style.backgroundColor = `hsla(${hue}, 100%, 65%, 0.8)`;
        particle.style.boxShadow = `0 0 15px hsla(${hue}, 100%, 65%, 0.8)`;
        
        gameArea.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentElement) {
                particle.remove();
            }
        }, 1500);
    }
    
    // Initialize the game
    init();
    
    // Add CSS styles programmatically for additional effects
    const style = document.createElement('style');
    style.textContent = `
        .game-start {
            animation: gameStart 0.5s ease-out;
        }
        
        @keyframes gameStart {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .game-over {
            animation: gameOver 0.5s ease-out;
        }
        
        @keyframes gameOver {
            0%, 20%, 40%, 60%, 80% { background-color: rgba(247, 37, 133, 0.5); }
            10%, 30%, 50%, 70%, 90% { background-color: inherit; }
        }
        
        .win-animation {
            animation: winPulse 0.5s ease-out infinite alternate;
        }
        
        @keyframes winPulse {
            0% { transform: scale(1); filter: hue-rotate(0deg); }
            100% { transform: scale(1.2); filter: hue-rotate(360deg); }
        }
        
        .special-obstacle {
            height: 60px;
            border-radius: 50% 50% 10px 10px;
            background: linear-gradient(135deg, #f72585, #7209b7);
        }
        
        .background-effect {
            position: absolute;
            width: var(--size, 80px);
            height: var(--size, 80px);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(76, 201, 240, 0.1) 0%, rgba(58, 12, 163, 0) 70%);
            pointer-events: none;
            opacity: 0;
            animation: bgEffect 3s ease-out forwards;
        }
        
        @keyframes bgEffect {
            0% { transform: scale(0); opacity: 0; }
            50% { opacity: 0.2; }
            100% { transform: scale(3); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}); 