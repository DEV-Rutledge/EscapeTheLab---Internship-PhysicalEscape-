class MoneyTimer {
    constructor() {
        this.totalSeconds = 2400; // 40 minutes
        this.currentSeconds = this.totalSeconds;
        this.initialMoney = 72000;
        this.moneyPerSecond = this.initialMoney/this.totalSeconds;
        this.currentMoney = this.initialMoney;
        this.timerInterval = null;
        this.isRunning = false;
        this.isCompleted = false;
        this.correctPassword = this.hexToString("217365637572653230323521");
        this.userName = "";
        this.challengeStartTime = null;
        
        // Timer color thresholds (in seconds spent, not remaining)
        this.bestTimeThreshold = null; // Will be loaded from leaderboard
        this.maxTimeThreshold = 1800; // 10 minutes = red
        
        // Hint system properties
        this.hintTimePenalty = 90;
        this.unlockedHints = [];
        this.hintContent = {
            '1': 'Please alert the host that you used a hint!',
            '2': 'Please alert the host that you used a hint!',
            '3': 'Please alert the host that you used a hint!'
        };
        
        // Database
        this.database = new CSVDatabase();
        
        this.timeDisplay = document.getElementById('timeDisplay');
        this.moneyDisplay = document.getElementById('moneyDisplay');
        this.timerDisplayContainer = document.getElementById('timerDisplay');
        this.infoDropdowns = document.getElementById('infoDropdowns');
        this.form = document.getElementById('challengeForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.status = document.getElementById('status');
        this.userNameDisplay = document.getElementById('userName');
        this.mainInput = document.getElementById('mainInput');
        this.mainLabel = document.getElementById('mainLabel');
        this.hintsGame = document.getElementById('hintsGame');
        this.statsContainer = document.getElementById('statsContainer');
        this.instructionsContainer = document.querySelector('.instructionsContainer');
        this.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.leaderboardContainer = document.getElementById('leaderboardContainer');
        this.leaderboardTableBody = document.getElementById('leaderboardTableBody');
        this.closeLeaderboardBtn = document.getElementById('closeLeaderboard');
        this.exportCSVBtn = document.getElementById('exportCSV');

        // Modal elements
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalConfirm = document.getElementById('modalConfirm');
        this.modalCancel = document.getElementById('modalCancel');
        
        this.alertOverlay = document.getElementById('alertOverlay');
        this.alertTitle = document.getElementById('alertTitle');
        this.alertMessage = document.getElementById('alertMessage');
        this.alertOk = document.getElementById('alertOk');

        // Stats elements
        this.timeSpentStat = document.getElementById('timeSpentStat');
        this.moneyLostStat = document.getElementById('moneyLostStat');
        this.hintsUsedStat = document.getElementById('hintsUsedStat');
        this.timeRemainingStat = document.getElementById('timeRemainingStat');
        this.performanceGrade = document.getElementById('performanceGrade');
        this.performanceSummary = document.getElementById('performanceSummary');
 
        this.initializeTimer();
        this.setupEventListeners();
        
        // Load initial data from server
        this.loadInitialData();
    }

    async loadInitialData() {
        await this.database.loadData();
        
        // Load best time from leaderboard for color thresholds
        const leaderboard = await this.database.getLeaderboard('timeSpent');
        if (leaderboard.length > 0) {
            this.bestTimeThreshold = leaderboard[0].timeSpent; // Fastest time
            console.log(`Best time loaded: ${this.bestTimeThreshold} seconds`);
        } else {
            this.bestTimeThreshold = null; // No one has completed yet
            console.log('No completed challenges yet - no best time');
        }
        
        console.log('Initial data loaded from server');
    }

    hexToString(hex) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    typeWriter(text, element, speed = 100) {
        return new Promise((resolve) => {
            element.innerHTML = '';
            let i = 0;
            
            const textContainer = document.createElement('span');
            element.appendChild(textContainer);
            
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.innerHTML = '|';
            cursor.style.color = '#ffffff';
            element.appendChild(cursor);
            
            const timer = setInterval(() => {
                if (i < text.length) {
                    textContainer.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                    setTimeout(() => {
                        cursor.remove();
                        resolve();
                    }, 1000);
                }
            }, speed);
        });
    }
 
    initializeTimer() {
        this.currentSeconds = this.totalSeconds;
        this.currentMoney = this.initialMoney;
    }
 
    startTimer() {
        if (this.isRunning) return;
 
        this.isRunning = true;
        this.challengeStartTime = new Date();
        this.timerInterval = setInterval(() => {
            this.currentSeconds--;
            this.currentMoney = Math.max(0, this.currentMoney - this.moneyPerSecond);
 
            this.updateDisplay();
 
            if (this.currentSeconds <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
 
    updateDisplay() {
        const minutes = Math.floor(this.currentSeconds / 60);
        const seconds = this.currentSeconds % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.moneyDisplay.textContent = `$${this.currentMoney.toLocaleString()}`;
 
        const timeSpent = this.totalSeconds - this.currentSeconds;
        this.applyTimerColors(timeSpent);
    }

    applyTimerColors(timeSpent) {
        let timerColor, moneyColor;
        
        // If no one has completed yet, start with green until 10 minutes
        if (this.bestTimeThreshold === null) {
            if (timeSpent < this.maxTimeThreshold) {
                // Under 10 minutes - GREEN (no record to beat yet!)
                timerColor = '#2ed573';
                moneyColor = '#2ed573';
            } else {
                // 10+ minutes - RED
                timerColor = '#ff4757';
                moneyColor = '#ff4757';
            }
        } else {
            // Someone has completed - compare to best time
            if (timeSpent <= this.bestTimeThreshold) {
                // Beating or matching best time - GREEN
                timerColor = '#2ed573';
                moneyColor = '#2ed573';
            } else if (timeSpent < this.maxTimeThreshold) {
                // Slower than best but under 10 minutes - YELLOW
                timerColor = '#ffa502';
                moneyColor = '#ffa502';
            } else {
                // 10+ minutes - RED
                timerColor = '#ff4757';
                moneyColor = '#ff4757';
            }
        }
        
        this.timeDisplay.style.color = timerColor;
        this.moneyDisplay.style.color = moneyColor;
    }
 
    async timeUp() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.submitBtn.disabled = true;
        
        const moneyLost = this.initialMoney - this.currentMoney;
        const timeSpent = this.totalSeconds - this.currentSeconds;
        const performance = this.calculatePerformanceGrade(timeSpent, this.unlockedHints.length, moneyLost);
        
        // Save failed attempt to database
        await this.database.addEntry({
            fullName: this.userName,
            timeSpent: timeSpent,
            timeRemaining: 0,
            moneyLost: moneyLost,
            hintsUsed: this.unlockedHints.length,
            grade: 'F',
            completedAt: new Date().toISOString(),
            status: 'failed'
        });
        
        this.status.textContent = "⏰ Time's up! Challenge failed!";
        this.status.style.color = '#ff4757';
    }

    showConfirmModal(title, message) {
        return new Promise((resolve) => {
            this.modalTitle.textContent = title;
            this.modalMessage.textContent = message;
            this.modalOverlay.classList.remove('hidden');
            
            const handleConfirm = () => {
                this.modalOverlay.classList.add('hidden');
                this.modalConfirm.removeEventListener('click', handleConfirm);
                this.modalCancel.removeEventListener('click', handleCancel);
                resolve(true);
            };
            
            const handleCancel = () => {
                this.modalOverlay.classList.add('hidden');
                this.modalConfirm.removeEventListener('click', handleConfirm);
                this.modalCancel.removeEventListener('click', handleCancel);
                resolve(false);
            };
            
            this.modalConfirm.addEventListener('click', handleConfirm);
            this.modalCancel.addEventListener('click', handleCancel);
        });
    }

    showAlertModal(title, message) {
        return new Promise((resolve) => {
            this.alertTitle.textContent = title;
            this.alertMessage.textContent = message;
            this.alertOverlay.classList.remove('hidden');
            
            const handleOk = () => {
                this.alertOverlay.classList.add('hidden');
                this.alertOk.removeEventListener('click', handleOk);
                resolve();
            };
            
            this.alertOk.addEventListener('click', handleOk);
        });
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        document.querySelectorAll('.hint-lock').forEach(lock => {
            lock.addEventListener('click', (e) => {
                const hintNumber = e.currentTarget.getAttribute('data-hint');
                this.handleHintClick(hintNumber);
            });
        });

        this.leaderboardBtn.addEventListener('click', () => {
            this.showLeaderboard();
        });

        this.closeLeaderboardBtn.addEventListener('click', () => {
            this.leaderboardContainer.style.display = 'none';
        });

        this.exportCSVBtn.addEventListener('click', () => {
            this.database.downloadCSV();
        });
    }

    async showLeaderboard() {
        const leaderboard = await this.database.getLeaderboard('timeSpent');
        this.leaderboardTableBody.innerHTML = '';

        if (leaderboard.length === 0) {
            this.leaderboardTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No completed challenges yet!</td></tr>';
        } else {
            leaderboard.forEach((entry, index) => {
                const row = document.createElement('tr');
                
                const timeSpentMin = Math.floor(entry.timeSpent / 60);
                const timeSpentSec = entry.timeSpent % 60;
                const timeSpentFormatted = `${timeSpentMin}:${timeSpentSec.toString().padStart(2, '0')}`;
                
                const date = new Date(entry.completedAt);
                const dateFormatted = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${timeSpentFormatted}</td>
                    <td>$${entry.moneyLost.toLocaleString()}</td>
                    <td>${entry.hintsUsed}</td>
                    <td><span class="grade-badge grade-${entry.grade.charAt(0).toLowerCase()}">${entry.grade}</span></td>
                `;
                
                this.leaderboardTableBody.appendChild(row);
            });
        }

        this.leaderboardContainer.style.display = 'flex';
    }
    
    async handleHintClick(hintNumber) {
        if (!this.isRunning) return;
        
        const isUnlocked = this.unlockedHints.includes(hintNumber);
        
        if (!isUnlocked) {
            const moneyPenalty = this.hintTimePenalty * this.moneyPerSecond;
            const confirmMessage = `This will cost you:\n• 90 seconds of time\n• $${moneyPenalty.toLocaleString()} in money\n\nDo you want to proceed?`;
            
            const confirmed = await this.showConfirmModal(`🔍 Unlock Hint ${hintNumber}?`, confirmMessage);
            
            if (!confirmed) {
                return;
            }
            
            this.currentSeconds = Math.max(0, this.currentSeconds - this.hintTimePenalty);
            this.currentMoney = Math.max(0, this.currentMoney - moneyPenalty);
            
            this.unlockedHints.push(hintNumber);
            
            this.updateDisplay();
            this.updateHintDisplay();
            
            const hintText = this.hintContent[hintNumber];
            await this.showAlertModal('🔓 HINT UNLOCKED!', hintText);
        }
    }
    
    updateHintDisplay() {
        for (let i = 1; i <= 3; i++) {
            const hintDiv = document.getElementById(`hint${i}`);
            if (this.unlockedHints.includes(i.toString())) {
                hintDiv.style.visibility = 'hidden';
            }
        }
    }
 
handleSubmit() {
    // Disable button immediately to prevent multiple rapid clicks
    this.submitBtn.disabled = true;
    
    if (!this.isRunning) {
        const name = this.mainInput.value.trim();

        if (!name) {
            this.status.textContent = "Please enter your name!";
            this.status.style.color = '#ff4757';
            // Re-enable button after 3 seconds
            setTimeout(() => {
                this.submitBtn.disabled = false;
            }, 3000);
            return;
        }

        if (name.length > 25) {
            this.status.textContent = "Name must be 25 characters or less!";
            this.status.style.color = '#ff4757';
            // Re-enable button after 3 seconds
            setTimeout(() => {
                this.submitBtn.disabled = false;
            }, 3000);
            return;
        }

        this.userName = name;
        this.startTimer();
       
        this.userNameDisplay.textContent = name;
        this.userNameDisplay.style.display = 'block';
       
        this.timerDisplayContainer.style.display = 'block';
        this.hintsGame.style.display = 'block';
        this.infoDropdowns.style.display = 'none';
       
        this.submitBtn.textContent = 'Stop Challenge!';
        this.submitBtn.classList.add('stop-btn');
       
        this.mainLabel.textContent = 'Enter Password to Stop:';
        this.mainInput.type = 'password';
        this.mainInput.value = '';
        this.mainInput.placeholder = 'Enter password';
       
        this.status.textContent = "Challenge started! Good luck!";
        this.status.style.color = '#4ecdc4';
        
        this.updateHintDisplay();
        
        // Re-enable button after 3 seconds
        setTimeout(() => {
            this.submitBtn.disabled = false;
        }, 3000);

    } else {
        const password = this.mainInput.value;

        if (password !== this.correctPassword) {
            this.status.textContent = "Incorrect password! Cannot stop challenge.";
            this.status.style.color = '#ff4757';
            // Re-enable button after 3 seconds
            setTimeout(() => {
                this.submitBtn.disabled = false;
            }, 3000);
            return;
        }

        this.stopChallenge();
        // Note: button stays disabled after challenge is stopped
    }
}

calculatePerformanceGrade(timeSpent, hintsUsed, moneyLost) {
    console.log('=== GRADE CALCULATION ===');
    console.log('Time Spent (seconds):', timeSpent);
    console.log('Hints Used:', hintsUsed);
    console.log('Money Lost:', moneyLost);
    
    let baseGrade;
    let score = 100;
    
    const timeSpentMinutes = timeSpent / 60;
    console.log('Time Spent (minutes):', timeSpentMinutes);
    
    // Determine BASE GRADE based on time ranges (in bulk)
    if (timeSpentMinutes <= 20) {
        baseGrade = 'A+';
        score = 100; // Start at A range
        console.log('Time range: 0-20 minutes → Base Grade A+, Starting Score: 100');
    } else if (timeSpentMinutes <= 30) {
        baseGrade = 'B+';
        score = 89; // Start at B range
        console.log('Time range: 20-30 minutes → Base Grade B, Starting Score: 89');
    } else if (timeSpentMinutes <= 40) {
        baseGrade = 'C+';
        score = 79; // Start at C range
        console.log('Time range: 30-40 minutes → Base Grade C, Starting Score: 79');
    } else {
        // 30+ minutes but still passed - minimum C
        baseGrade = 'C-';
        score = 70; // Bottom of C range
        console.log('Time range: 30+ minutes → Base Grade C, Starting Score: 70');
    }
    
    // Apply hint penalties to adjust within the grade tier
    const hintPenalty = hintsUsed * 3;
    console.log('Hint Penalty:', hintPenalty, '(', hintsUsed, 'hints × 3 points)');
    score -= hintPenalty;
    console.log('Score after hints:', score);
    
    // Ensure completed challenges never go below C-
    const originalScore = score;
    score = Math.max(score, 70);
    if (originalScore !== score) {
        console.log('Score capped at minimum: 70 (was', originalScore, ')');
    }
    
    console.log('Final Score:', score);
    
    // Return grade based on final score
    let finalGrade;
    if (score >= 97) finalGrade = { grade: 'A+', class: 'grade-a' };
    else if (score >= 93) finalGrade = { grade: 'A', class: 'grade-a' };
    else if (score >= 90) finalGrade = { grade: 'A-', class: 'grade-a' };
    else if (score >= 87) finalGrade = { grade: 'B+', class: 'grade-b' };
    else if (score >= 83) finalGrade = { grade: 'B', class: 'grade-b' };
    else if (score >= 80) finalGrade = { grade: 'B-', class: 'grade-b' };
    else if (score >= 77) finalGrade = { grade: 'C+', class: 'grade-c' };
    else if (score >= 73) finalGrade = { grade: 'C', class: 'grade-c' };
    else finalGrade = { grade: 'C-', class: 'grade-c' };
    
    console.log('Final Grade:', finalGrade.grade);
    console.log('=========================');
    
    return finalGrade;
}

    getPerformanceSummary(timeSpent, hintsUsed, moneyLost, grade) {
        if (grade === 'A+' || grade === 'A' || grade === 'A-') {
            return "Outstanding performance! You completed the challenge quickly with minimal resource usage!";
        } else if (grade === 'B+' || grade === 'B' || grade === 'B-') {
            return "Good job! You solved the challenge efficiently!";
        } else if (grade === 'C+' || grade === 'C' || grade === 'C-') {
            return "Decent work!";
        } else {
            return "Challenge completed";
        }
    }

    showStatsScreen(timeSpent, moneyLost, hintsUsed, timeRemaining) {
        this.instructionsContainer.style.display = 'none';
        this.statsContainer.style.display = 'block';
        
        document.querySelector('.hintsContainer').style.visibility = 'hidden';
        document.body.classList.add('fade-to-black');
        
        this.userNameDisplay.classList.add('congratulations-mode');
        const congratsText = `Congratulations, ${this.userName}!`;
        this.typeWriter(congratsText, this.userNameDisplay, 100);
        
        const performance = this.calculatePerformanceGrade(timeSpent, hintsUsed, moneyLost);
        this.performanceGrade.textContent = `Grade: ${performance.grade}`;
        this.performanceGrade.className = `performance-grade ${performance.class}`;
        
        const spentMinutes = Math.floor(timeSpent / 60);
        const spentSeconds = timeSpent % 60;
        const remainingMinutes = Math.floor(timeRemaining / 60);
        const remainingSecondsLeft = timeRemaining % 60;
        
        this.timeSpentStat.textContent = `${spentMinutes.toString().padStart(2, '0')}:${spentSeconds.toString().padStart(2, '0')}`;
        this.moneyLostStat.textContent = `${moneyLost.toLocaleString()}`;
        this.hintsUsedStat.textContent = hintsUsed.toString();
        this.timeRemainingStat.textContent = `${remainingMinutes.toString().padStart(2, '0')}:${remainingSecondsLeft.toString().padStart(2, '0')}`;
        
        this.performanceSummary.textContent = this.getPerformanceSummary(timeSpent, hintsUsed, moneyLost, performance.grade);
    }
 
    async stopChallenge() {
        if (this.isCompleted || this.currentSeconds <= 0) return;
 
        const moneyLost = this.initialMoney - this.currentMoney;
        const timeSpent = this.totalSeconds - this.currentSeconds;
        const totalHintsUsed = this.unlockedHints.length;
        const performance = this.calculatePerformanceGrade(timeSpent, totalHintsUsed, moneyLost);
 
        // Save to database
        await this.database.addEntry({
            fullName: this.userName,
            timeSpent: timeSpent,
            timeRemaining: this.currentSeconds,
            moneyLost: moneyLost,
            hintsUsed: totalHintsUsed,
            grade: performance.grade,
            completedAt: new Date().toISOString(),
            status: 'completed'
        });
        
        // Update best time if this is a new record
        if (this.bestTimeThreshold === null || timeSpent < this.bestTimeThreshold) {
            this.bestTimeThreshold = timeSpent;
            console.log(`🏆 NEW BEST TIME: ${timeSpent} seconds!`);
        }
 
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isCompleted = true;
 
        this.showStatsScreen(timeSpent, moneyLost, totalHintsUsed, this.currentSeconds);
    }
}

const instructionsContainer = document.querySelector(".instructionsContainer");
const scenarioContainer = document.querySelector(".scenarioContainer");
const hintsContainer = document.querySelector(".hintsContainer");
const backButton = document.querySelector(".backButton");
const nextButton = document.querySelector(".nextButton");
const startButton = document.querySelector(".submit-btn");

backButton.addEventListener("click", function() {
    scenarioContainer.style.display = "block";
    instructionsContainer.style.display = "none";
    backButton.style.display = "none";
    nextButton.style.display = "block";
    hintsContainer.style.visibility = "hidden";
})

nextButton.addEventListener("click", function() {
    scenarioContainer.style.display = "none";
    instructionsContainer.style.display = "block";
    hintsContainer.style.visibility = "visible";
    backButton.style.display = "block";
    nextButton.style.display = "none";
})

startButton.addEventListener("click", function() {
    backButton.style.display = "none";
})
 
document.addEventListener('DOMContentLoaded', () => {
    new MoneyTimer();
    
    const dropdowns = document.querySelectorAll('.info-dropdown');
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('toggle', function() {
            if (this.open) {
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== this && otherDropdown.open) {
                        otherDropdown.open = false;
                    }
                });
            }
        });
    });
});