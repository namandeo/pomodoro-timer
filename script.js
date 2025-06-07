// Timer state
let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isRunning = false;
let currentMode = 'focus';
let pomodoroCount = 0;
let sessionCount = 0;

// Default settings
let settings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15
};

// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionCountDisplay = document.getElementById('sessionCount');
const currentModeDisplay = document.querySelector('.current-mode');
const progressRing = document.querySelector('.progress-ring-circle');
const themeToggle = document.getElementById('themeToggle');
const saveSettingsBtn = document.getElementById('saveSettings');
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');

// Calculate progress ring circumference
const radius = 40; // This matches the r attribute in SVG
const circumference = 2 * Math.PI * radius;
progressRing.style.strokeDasharray = `${circumference}`;
progressRing.style.strokeDashoffset = `${circumference}`;

// Initialize timer display
updateTimerDisplay();

// Event Listeners
startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
themeToggle.addEventListener('click', toggleTheme);
saveSettingsBtn.addEventListener('click', saveSettings);
settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
});

// Close settings panel when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
        settingsPanel.classList.remove('active');
    }
});

// Prevent panel close when clicking inside
settingsPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Theme management
function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
}

// Timer Controls
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    isRunning = true;
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    timerId = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    isRunning = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    clearInterval(timerId);
}

function resetTimer() {
    pauseTimer();  // Ensure timer is stopped
    isRunning = false;  // Reset running state
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';  // Reset button state
    setTimerDuration();
    updateTimerDisplay();
    updateProgressRing();
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
        updateProgressRing();
    } else {
        handleTimerComplete();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function updateProgressRing() {
    const totalSeconds = getCurrentModeDuration() * 60;
    const progress = 1 - (timeLeft / totalSeconds);
    const offset = circumference * progress;
    progressRing.style.strokeDashoffset = `${circumference - offset}`;
}

function playNotificationSound() {
    const audio = new Audio('https://github.com/codestackr/pomodoro/blob/master/src/assets/bell.mp3?raw=true');
    audio.volume = 0.7; // 70% volume
    try {
        audio.play().catch(error => {
            console.log('Error playing sound:', error);
        });
    } catch (error) {
        console.log('Error creating audio:', error);
    }
}

function handleTimerComplete() {
    playNotificationSound();

    if (currentMode === 'focus') {
        pomodoroCount++;
        sessionCount++;
        sessionCountDisplay.textContent = pomodoroCount;
        
        if (sessionCount === 4) {
            currentMode = 'longBreak';
            sessionCount = 0;
        } else {
            currentMode = 'shortBreak';
        }
    } else {
        currentMode = 'focus';
    }

    setTimerDuration();
    updateTimerDisplay();
    updateProgressRing();
    updateModeDisplay();
    // Remove auto-start of next session
    // startTimer();
}

function getCurrentModeDuration() {
    switch (currentMode) {
        case 'focus':
            return settings.focusDuration;
        case 'shortBreak':
            return settings.shortBreakDuration;
        case 'longBreak':
            return settings.longBreakDuration;
        default:
            return settings.focusDuration;
    }
}

function setTimerDuration() {
    timeLeft = getCurrentModeDuration() * 60;
}

function updateModeDisplay() {
    let modeText = '';
    switch (currentMode) {
        case 'focus':
            modeText = 'Focus Time';
            break;
        case 'shortBreak':
            modeText = 'Short Break';
            break;
        case 'longBreak':
            modeText = 'Long Break';
            break;
    }
    currentModeDisplay.textContent = modeText;
}

// Settings Management
function saveSettings() {
    const focusDuration = Math.max(1/6, document.getElementById('focusDuration').value);
    const shortBreakDuration = Math.max(1/6, document.getElementById('shortBreakDuration').value);
    const longBreakDuration = Math.max(1/6, document.getElementById('longBreakDuration').value);

    settings = {
        focusDuration: parseFloat(focusDuration),
        shortBreakDuration: parseFloat(shortBreakDuration),
        longBreakDuration: parseFloat(longBreakDuration)
    };

    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    
    // Reset timer with new duration
    resetTimer();
    
    // Show success message
    const savedMessage = document.createElement('div');
    savedMessage.textContent = 'Settings saved!';
    savedMessage.style.color = 'var(--primary-color)';
    savedMessage.style.textAlign = 'center';
    savedMessage.style.marginTop = '1rem';
    
    const existingMessage = saveSettingsBtn.nextElementSibling;
    if (existingMessage?.textContent === 'Settings saved!') {
        existingMessage.remove();
    }
    
    saveSettingsBtn.parentNode.insertBefore(savedMessage, saveSettingsBtn.nextSibling);
    setTimeout(() => savedMessage.remove(), 3000);
}

// Load saved settings
const savedSettings = localStorage.getItem('pomodoroSettings');
if (savedSettings) {
    settings = JSON.parse(savedSettings);
    document.getElementById('focusDuration').value = settings.focusDuration;
    document.getElementById('shortBreakDuration').value = settings.shortBreakDuration;
    document.getElementById('longBreakDuration').value = settings.longBreakDuration;
    setTimerDuration();
    updateTimerDisplay();
}
