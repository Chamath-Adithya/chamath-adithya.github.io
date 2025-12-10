
// --- BOOT SEQUENCE LOGIC ---
const bootLog = document.getElementById('boot-log');
const bootProgress = document.getElementById('boot-progress');
const bootScreen = document.getElementById('boot-screen');
const osInterface = document.getElementById('os-interface');

const bootMessages = [
    "BIOS DATE 05/12/2025 15:23:01 VER 2.0.0",
    "CPU: QUANTUM CORE i9 - 128 CORES DETECTED",
    "MEM: 64TB RAM OK",
    "INITIALIZING CHAMATH-ADITHYA KERNEL...",
    "LOADING DRIVERS: [GPU] [NET] [AI_CORE]",
    "MOUNTING FILESYSTEMS... OK",
    "CHECKING SECURITY PROTOCOLS... OK",
    "CONNECTING TO NEURAL NET... ESTABLISHED",
    "LOADING USER PROFILE: GUEST",
    "SYSTEM READY."
];

let msgIndex = 0;

function typeBootLog() {
    if (msgIndex < bootMessages.length) {
        const div = document.createElement('div');
        div.innerText = "> " + bootMessages[msgIndex];
        div.className = "text-green-400"; // Matrix style text
        if(msgIndex > 6) div.className = "text-cyan";

        bootLog.appendChild(div);
        bootLog.scrollTop = bootLog.scrollHeight;

        // Update Progress bar
        const progress = ((msgIndex + 1) / bootMessages.length) * 100;
        bootProgress.style.width = `${progress}%`;

        msgIndex++;
        setTimeout(typeBootLog, Math.random() * 200 + 50); // Faster boot
    } else {
        setTimeout(() => {
            bootScreen.style.opacity = '0';
            setTimeout(() => {
                bootScreen.style.display = 'none';
                osInterface.style.display = 'flex';
                // Auto open about window on start for desktop, maybe not mobile
                if(window.innerWidth > 768) {
                    setTimeout(() => openWindow('about-window'), 500);
                }
            }, 500);
        }, 500);
    }
}

// Start Boot on Load
window.addEventListener('load', typeBootLog);


// --- WINDOW MANAGEMENT ---
let maxZIndex = 50;

function openWindow(id) {
    const win = document.getElementById(id);
    win.classList.add('active');
    moveToFront(id);
    addToTaskbar(id);
}

function closeWindow(id) {
    const win = document.getElementById(id);
    win.classList.remove('active');
    removeFromTaskbar(id);
}

function minimizeWindow(id) {
    closeWindow(id); // Simple minimize behavior
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if(win.style.width === "100%") {
        win.style.width = "";
        win.style.height = "";
        win.style.top = "";
        win.style.left = "";
    } else {
        win.style.width = "100%";
        win.style.height = "100%";
        win.style.top = "0";
        win.style.left = "0";
    }
}

function moveToFront(id) {
    const win = document.getElementById(id);
    if(win) {
        maxZIndex++;
        win.style.zIndex = maxZIndex;
    }
}

// Draggable Logic (Desktop Only)
const windows = document.querySelectorAll('.os-window');
windows.forEach(win => {
    const handle = win.querySelector('.drag-handle');
    if(!handle) return;

    win.addEventListener('mousedown', () => moveToFront(win.id));
    // Mobile touch event for z-index
    win.addEventListener('touchstart', () => moveToFront(win.id), {passive: true});

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    handle.addEventListener('mousedown', (e) => {
        // Disable drag on mobile/maximized
        if(window.innerWidth <= 768 || win.style.width === "100%") return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = win.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        win.style.left = `${initialLeft + dx}px`;
        win.style.top = `${initialTop + dy}px`;
        win.style.transform = 'none';
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
});

// --- TASKBAR LOGIC ---
function addToTaskbar(id) {
    const container = document.getElementById('taskbar-apps');
    const existing = document.getElementById(`task-${id}`);
    if (existing) return;

    const nameMap = {
        'about-window': 'Profile',
        'projects-window': 'Projects',
        'skills-window': 'Skills',
        'terminal-window': 'Terminal',
        'calc-window': 'Calculator',
        'settings-window': 'Settings'
    };

    const displayName = nameMap[id] || id.replace(/-window/g, '').replace(/-/g, ' ').toUpperCase();

    const btn = document.createElement('button');
    btn.id = `task-${id}`;
    btn.className = "px-3 py-1 bg-white/10 border-b-2 border-cyan text-gray-300 text-xs font-mono hover:bg-white/20 transition-colors flex items-center gap-2";
    btn.innerHTML = `<span class="w-2 h-2 rounded-full bg-cyan animate-pulse"></span> ${displayName}`;
    btn.onclick = () => openWindow(id);
    container.appendChild(btn);
}

function removeFromTaskbar(id) {
    const btn = document.getElementById(`task-${id}`);
    if (btn) btn.remove();
}

// --- START MENU LOGIC ---
const startMenu = document.getElementById('start-menu');

function toggleStartMenu() {
    startMenu.classList.toggle('hidden-menu');
    startMenu.classList.toggle('visible-menu');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !e.target.closest('button[onclick="toggleStartMenu()"]')) {
        startMenu.classList.add('hidden-menu');
        startMenu.classList.remove('visible-menu');
    }
});


// --- TERMINAL LOGIC ---
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('terminal-output');
document.getElementById('term-date').innerText = new Date().toLocaleString();

termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim().toLowerCase();
        this.value = '';

        processCommand(command);
    }
});

function processCommand(cmd) {
    addToTerm(`guest@chamath-os:~$ ${cmd}`, 'text-gray-400');

    // Clean command (remove sudo if present just for parsing)
    const cleanCmd = cmd.replace('sudo ', '');

    // Basic parsing for args
    const parts = cleanCmd.split(' ');
    const baseCmd = parts[0];
    const args = parts.slice(1).join(' ');

    if (cmd.startsWith('sudo')) {
        addToTerm("Permission denied: user is not in the sudoers file. This incident will be reported.", 'text-red-500');
        return;
    }

    switch(baseCmd) {
        case 'help':
            addToTerm("Available commands: help, ls, cat, echo, whoami, projects, skills, socials, contact, clear, date, weather, fact, matrix, reboot", 'text-cyan');
            break;
        case 'ls':
            addToTerm("profile.exe  projects_db  skills.sys  socials.txt  README.txt", 'text-green-300');
            break;
        case 'cat':
            if (!args) {
                addToTerm("Usage: cat <filename>", 'text-yellow-400');
            } else if (args === 'readme.txt') {
                addToTerm("----------------------------------------", 'text-gray-500');
                addToTerm("Welcome to Chamath-Adithya OS v2.0", 'text-white');
                addToTerm("This is an interactive portfolio designed", 'text-gray-400');
                addToTerm("to showcase my skills in IoT & Web Dev.", 'text-gray-400');
                addToTerm("----------------------------------------", 'text-gray-500');
            } else if (args === 'socials.txt') {
                 addToTerm("GitHub: https://github.com/Chamath-Adithya", 'text-blue-300');
                 addToTerm("LinkedIn: https://linkedin.com/in/chamath-adithya", 'text-blue-300');
            } else if (args === 'profile.exe' || args === 'projects_db' || args === 'skills.sys') {
                addToTerm("Error: Binary file not readable. Use GUI to open.", 'text-red-400');
            } else {
                addToTerm(`File not found: ${args}`, 'text-red-500');
            }
            break;
        case 'echo':
            addToTerm(args, 'text-white');
            break;
        case 'whoami':
            addToTerm("Chamath Adithya | Founder & CTO | SOLVEO", 'text-magenta');
            break;
        case 'projects':
            addToTerm("Opening Project Database...", 'text-green-400');
            openWindow('projects-window');
            break;
        case 'skills':
            addToTerm("Listing System Capabilities...", 'text-green-400');
            addToTerm("LANGUAGES: JS, TS, C++, Rust, Go, Python, PHP, Dart", 'text-gray-300');
            addToTerm("HARDWARE: ESP32, Arduino, Raspberry Pi, MQTT", 'text-gray-300');
            addToTerm("CLOUD: AWS, Docker, K8s, Firebase, Terraform", 'text-gray-300');
            addToTerm("SECURITY: Kali, Metasploit, Wireshark, Burp", 'text-gray-300');
            break;
         case 'socials':
            addToTerm("GitHub: https://github.com/Chamath-Adithya", 'text-blue-300');
            addToTerm("LinkedIn: https://linkedin.com/in/chamath-adithya", 'text-blue-300');
            break;
        case 'contact':
            addToTerm("Email: achamath1@gmail.com", 'text-white');
            addToTerm("Opening mail client...", 'text-gray-500');
            setTimeout(() => window.location.href = "mailto:achamath1@gmail.com", 1000);
            break;
        case 'weather':
            addToTerm("Location: Sri Lanka", 'text-gray-400');
            addToTerm("Condition: Partly Cloudy, 28°C", 'text-yellow-300');
            addToTerm("Humidity: 82%", 'text-blue-300');
            break;
        case 'fact':
            const facts = [
                "The first computer bug was an actual moth.",
                "IoT devices will outnumber humans 3 to 1 by 2025.",
                "The Apollo 11 guidance computer had less processing power than a modern calculator.",
                "Linux powers 100% of the world's top 500 supercomputers."
            ];
            addToTerm(facts[Math.floor(Math.random() * facts.length)], 'text-magenta');
            break;
        case 'matrix':
             // Fun little text loop
             let i = 0;
             const matrixInterval = setInterval(() => {
                addToTerm(Math.random().toString(36).substring(7), 'text-green-500');
                i++;
                if(i > 20) clearInterval(matrixInterval);
                // Auto scroll
                const container = document.querySelector('#terminal-window .window-content');
                container.scrollTop = container.scrollHeight;
             }, 50);
             break;
        case 'clear':
            termOutput.innerHTML = '';
            break;
        case 'date':
            addToTerm(new Date().toString(), 'text-white');
            break;
        case 'reboot':
            location.reload();
            break;
        case '':
            break;
        default:
            addToTerm(`Command not found: ${cmd}`, 'text-red-500');
    }
    // Scroll to bottom
    const container = document.querySelector('#terminal-window .window-content');
    container.scrollTop = container.scrollHeight;
}

function addToTerm(text, colorClass) {
    const div = document.createElement('div');
    div.className = colorClass;
    div.textContent = text;
    termOutput.appendChild(div);
}


// --- CLOCK & STATS ---
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('clock').innerText = timeString;
    document.getElementById('mobile-clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Random CPU fluctuation for effect
    if(Math.random() > 0.5) {
        document.getElementById('cpu-stat').innerText = `CPU: ${Math.floor(Math.random() * 30 + 5)}%`;
    }
}
setInterval(updateClock, 1000);


// --- 3D BACKGROUND (THREE.JS) ---
const initThreeJS = () => {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create Starfield
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const posArray = new Float32Array(starsCount * 3);

    for(let i = 0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.8,
    });

    const starMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starMesh);

    camera.position.z = 30;

    // Animation
    const animate = () => {
        requestAnimationFrame(animate);
        starMesh.rotation.y += 0.0005;
        starMesh.rotation.x += 0.0002;
        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

initThreeJS();

// --- AUDIO SYSTEM (Web Audio API) ---
class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.enabled = true;
        this.initialized = false;
        this.volume = 0.3; // Store volume for lazy init
    }

    // Initialize Audio Context on first user interaction (Mobile Fix)
    initAudio() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.enabled ? this.volume : 0;
            this.masterGain.connect(this.ctx.destination);

            // Play silent buffer to unlock iOS audio
            const buffer = this.ctx.createBuffer(1, 1, 22050);
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.ctx.destination);
            source.start(0);

            this.initialized = true;
        } catch (e) {
            console.error("Audio init failed:", e);
        }
    }

    toggleMute() {
        this.enabled = !this.enabled;
        if (this.masterGain) {
            this.masterGain.gain.value = this.enabled ? this.volume : 0;
        }
        return this.enabled;
    }

    setVolume(val) {
        this.volume = val;
        if (this.masterGain) {
            this.masterGain.gain.value = this.enabled ? this.volume : 0;
        }
    }

    // Oscillator helper
    playTone(freq, type, duration, startTime = 0) {
        if (!this.enabled) return;
        if (!this.initialized) this.initAudio();
        if (!this.ctx) return;

        // Ensure context is running
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playHover() {
        // Disable hover sounds on touch devices
        if (window.matchMedia('(hover: none)').matches) return;
        // High pitched short blip
        this.playTone(800, 'sine', 0.05);
    }

    playClick() {
        this.initAudio(); // Ensure initialized
        // Mechanical click
        this.playTone(300, 'square', 0.05);
        this.playTone(600, 'sawtooth', 0.02, 0.01);
    }

    playOpen() {
        // Rising sweep
        if (!this.enabled) return;
        this.initAudio(); // Ensure initialized

        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playError() {
        // Buzz
        this.playTone(150, 'sawtooth', 0.2);
    }
}

const audioSys = new SoundManager();

// Global unlock for mobile
['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, () => {
        audioSys.initAudio();
    }, { once: true });
});

// Attach sounds to UI elements
document.addEventListener('mouseover', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.desktop-icon-grid button')) {
        audioSys.playHover();
    }
});

document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.desktop-icon-grid button')) {
        audioSys.playClick();
    }
});

// Patch openWindow to play sound
const originalOpenWindow = openWindow;
openWindow = function(id) {
    audioSys.playOpen();
    originalOpenWindow(id);
};


// --- SETTINGS LOGIC ---
function toggleMuteBtn() {
    const isEnabled = audioSys.toggleMute();
    const btn = document.getElementById('mute-btn');
    const icon = document.getElementById('tray-vol-icon');

    if (isEnabled) {
        btn.innerText = "DISABLE AUDIO";
        btn.classList.remove('text-red-400', 'border-red-500/30');
        btn.classList.add('text-green-400', 'border-green-500/30');
        icon.className = "fas fa-volume-up";
        icon.style.color = "";
    } else {
        btn.innerText = "ENABLE AUDIO";
        btn.classList.remove('text-green-400', 'border-green-500/30');
        btn.classList.add('text-red-400', 'border-red-500/30');
        icon.className = "fas fa-volume-mute";
        icon.style.color = "red";
    }
}

function setVolume(val) {
    audioSys.setVolume(val / 100);
    document.getElementById('vol-level').innerText = val + '%';
}

function toggleScanlines() {
    const scanlines = document.querySelector('.scanlines');
    const btn = document.getElementById('scanline-btn');

    if (scanlines.style.display === 'none') {
        scanlines.style.display = 'block';
        btn.innerText = "[ENABLED]";
        btn.className = "text-green-400 hover:text-green-300";
    } else {
        scanlines.style.display = 'none';
        btn.innerText = "[DISABLED]";
        btn.className = "text-red-400 hover:text-red-300";
    }
}

function setTheme(theme) {
    document.body.classList.remove('theme-amber', 'theme-green');
    if (theme === 'amber') document.body.classList.add('theme-amber');
    if (theme === 'green') document.body.classList.add('theme-green');

    // Play sound to confirm
    audioSys.playClick();
}


// --- CALCULATOR LOGIC ---
let calcExpression = "";

function calcInput(val) {
    const display = document.getElementById('calc-display');
    audioSys.playClick();

    if (val === 'C') {
        calcExpression = "";
        display.innerText = "0";
        return;
    }

    if (val === '=') {
        try {
            // Basic eval safety check - only allow numbers and math ops
            if (/^[0-9+\-*/.() ]*$/.test(calcExpression)) {
                // eslint-disable-next-line no-eval
                const result = eval(calcExpression);
                display.innerText = result;
                calcExpression = String(result);
            } else {
                display.innerText = "ERR";
                audioSys.playError();
            }
        } catch (e) {
            display.innerText = "ERR";
            audioSys.playError();
        }
        return;
    }

    calcExpression += val;
    display.innerText = calcExpression;
}
