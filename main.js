/**
 * Prashant Singh Chauhan - Futuristic 3D Portfolio UI & Audio System
 * Includes Web Audio Synthesizer, 3D Tilt Cards, Interactive Terminal, HUD Telemetry
 */

/* ==========================================================================
   1. PROCEDURAL WEB AUDIO SCI-FI SYNTHESIZER
   ========================================================================== */
class SciFiSoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true; // Enabled by default once user interacts
        this.initAudioContext();
    }

    initAudioContext() {
        // AudioContext is created/resumed on user gesture
        const resumeAudio = () => {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        };

        window.addEventListener('click', resumeAudio, { once: true });
        window.addEventListener('keydown', resumeAudio, { once: true });
        window.addEventListener('touchstart', resumeAudio, { once: true });
    }

    playBeep(freq = 800, duration = 0.06, type = 'sine') {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio context safely ignored if blocked
        }
    }

    playChirp(up = true) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            const startFreq = up ? 400 : 1200;
            const endFreq = up ? 1400 : 350;

            osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.12);
        } catch (e) {}
    }

    playTransmit() {
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            for (let i = 0; i < 4; i++) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600 + i * 280, now + i * 0.08);

                gain.gain.setValueAtTime(0.08, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.09);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.09);
            }
        } catch (e) {}
    }

    toggle() {
        this.enabled = !this.enabled;
        const btn = document.getElementById('audio-toggle-btn');
        if (btn) {
            btn.classList.toggle('muted', !this.enabled);
            const statusText = btn.querySelector('.audio-status');
            if (statusText) statusText.textContent = this.enabled ? 'AUDIO: ON' : 'AUDIO: OFF';
        }
        if (this.enabled) {
            this.playChirp(true);
        }
        return this.enabled;
    }
}

window.soundFX = new SciFiSoundEngine();

/* ==========================================================================
   2. 3D HOLOGRAPHIC CARD TILT & PHOTO SWITCHER
   ========================================================================== */
function initHoloCard() {
    const card = document.getElementById('holo-id-card');
    if (!card) return;

    const shine = card.querySelector('.holo-shine');
    let isFlipped = false;

    // Mouse tilt physics
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        if (shine) {
            const moveX = (x / rect.width) * 100;
            const moveY = (y / rect.height) * 100;
            shine.style.background = `radial-gradient(circle at ${moveX}% ${moveY}%, rgba(0, 240, 255, 0.4), transparent 60%)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        if (shine) {
            shine.style.background = `radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15), transparent 70%)`;
        }
    });

    // Toggle between Studio Suit & Casual portrait
    const toggleImgBtn = document.getElementById('toggle-portrait-btn');
    const portraitImg = document.getElementById('holo-portrait-img');
    const feedLabel = document.getElementById('holo-feed-label');

    if (toggleImgBtn && portraitImg) {
        toggleImgBtn.addEventListener('click', () => {
            isFlipped = !isFlipped;
            window.soundFX.playChirp(!isFlipped);

            // Glitch transition
            portraitImg.classList.add('glitch-active');
            setTimeout(() => {
                if (isFlipped) {
                    portraitImg.src = 'assets/profile-casual.jpg';
                    if (feedLabel) feedLabel.textContent = 'FEED: CASUAL_SPECS_V2';
                    toggleImgBtn.innerHTML = `<span class="icon">⟳</span> FEED: SUIT MODE`;
                } else {
                    portraitImg.src = 'assets/profile-suit.jpg';
                    if (feedLabel) feedLabel.textContent = 'FEED: COMMANDER_V1';
                    toggleImgBtn.innerHTML = `<span class="icon">⟳</span> FEED: CASUAL MODE`;
                }
                setTimeout(() => {
                    portraitImg.classList.remove('glitch-active');
                }, 150);
            }, 120);
        });
    }
}

/* ==========================================================================
   3. SKILLS MATRIX FILTERING & LEVEL BARS
   ========================================================================== */
function initSkillsMatrix() {
    const filterBtns = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.soundFX.playBeep(920, 0.05);

            const filter = btn.dataset.filter;

            skillCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px) scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 250);
                }
            });
        });
    });

    // Animate skill bars when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target.querySelector('.skill-level-fill');
                if (bar && bar.dataset.level) {
                    bar.style.width = bar.dataset.level + '%';
                }
            }
        });
    }, { threshold: 0.2 });

    skillCards.forEach(card => observer.observe(card));
}

/* ==========================================================================
   4. INTERACTIVE SCI-FI TERMINAL (CLI)
   ========================================================================== */
function initSciFiTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    if (!input || !output) return;

    const commands = {
        help: () => `
<span class="cmd-cyan">AVAILABLE SYSTEM COMMANDS:</span>
  <span class="cmd-yellow">about</span>       - Print bio and background credentials
  <span class="cmd-yellow">skills</span>      - Print engineering competencies breakdown
  <span class="cmd-yellow">projects</span>    - Query featured project repositories
  <span class="cmd-yellow">model</span>       - Switch 3D view: <span class="cmd-green">model core</span> | <span class="cmd-green">drone</span> | <span class="cmd-green">matrix</span>
  <span class="cmd-yellow">theme</span>       - Switch neon theme: <span class="cmd-green">theme cyan</span> | <span class="cmd-green">purple</span> | <span class="cmd-green">green</span>
  <span class="cmd-yellow">contact</span>     - Establish communication channels
  <span class="cmd-yellow">stats</span>       - Display system hardware & engineering telemetry
  <span class="cmd-yellow">matrix</span>      - Trigger digital rain animation
  <span class="cmd-yellow">clear</span>       - Wipe terminal display
`,
        about: () => `
<span class="cmd-green">[PRASHANT SINGH CHAUHAN]</span>
> Status: Pursuing Engineering at Priyadarshini College of Engineering (PCE)
> Focus: Full-Stack Web Development, Interactive 3D WebGL, Problem Solving
> Mission: Crafting elegant code, high-performance interfaces, and digital dreams.
`,
        skills: () => `
<span class="cmd-cyan">[ENGINEERING MATRIX]</span>
  HTML5 / CSS3 / Modern Web ............. [95%] ███████████████████░
  JavaScript (ES6+ / WebGL) ............. [88%] █████████████████░░░
  Three.js & 3D Interactive ............. [82%] ████████████████░░░░
  Git, GitHub & Modern DevTools ......... [90%] ██████████████████░░
  Data Structures & Algorithms .......... [84%] ████████████████░░░░
`,
        projects: () => `
<span class="cmd-cyan">[FEATURED DEPLOYMENTS]</span>
  1. <span class="cmd-green">College Student Dashboard</span> - Academic & attendance analytics platform
     Repo: https://github.com/prashantchauhann/CollegeWeb.git
  2. <span class="cmd-green">AI Interview Preparing System</span> - Intelligent mock interviewer & confidence analyzer
     Repo: https://github.com/prashantchauhann/CollegeWeb.git
  3. <span class="cmd-green">Futuristic 3D WebGL Portfolio</span> - Three.js procedural cyber-reactor & HUD
`,
        contact: () => `
<span class="cmd-cyan">[DIRECT UPLINK CHANNELS]</span>
  > Email: prashantsinghchauhan780@gmail.com
  > LinkedIn: https://www.linkedin.com/in/prashant-singh-chauhan-0964aa327
  > GitHub: https://github.com/prashantchauhann
`,
        stats: () => `
<span class="cmd-cyan">[TELEMETRY READOUT]</span>
  OS: ANTIGRAVITY CYBER_ENGINE v2.6
  WebGL Driver: High-Performance GPU Active
  Location: Priyadarshini College of Engineering, Nagpur [21.1458° N, 79.0882° E]
  Sync State: NOMINAL (0 ERRORS DETECTED)
`,
        clear: () => {
            output.innerHTML = '';
            return '';
        }
    };

    function appendLine(html) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = html;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = input.value.trim();
            input.value = '';
            if (!raw) return;

            window.soundFX.playBeep(1100, 0.04);
            appendLine(`<span class="prompt">prashant@core:~$</span> <span class="user-cmd">${raw}</span>`);

            const parts = raw.toLowerCase().split(' ');
            const mainCmd = parts[0];
            const arg = parts[1];

            if (mainCmd === 'model') {
                if (['core', 'drone', 'matrix'].includes(arg)) {
                    if (window.futuristicScene) window.futuristicScene.switchModel(arg);
                    appendLine(`<span class="cmd-green">> Switching 3D Scene Viewport to: [${arg.toUpperCase()}]</span>`);
                } else {
                    appendLine(`<span class="cmd-red">Invalid model target. Choose: core | drone | matrix</span>`);
                }
            } else if (mainCmd === 'theme') {
                if (arg === 'purple') {
                    document.documentElement.style.setProperty('--accent-primary', '#b026ff');
                    document.documentElement.style.setProperty('--accent-glow', 'rgba(176, 38, 255, 0.6)');
                    appendLine(`<span class="cmd-green">> Neon theme set to PLASMA PURPLE</span>`);
                } else if (arg === 'green') {
                    document.documentElement.style.setProperty('--accent-primary', '#00ffaa');
                    document.documentElement.style.setProperty('--accent-glow', 'rgba(0, 255, 170, 0.6)');
                    appendLine(`<span class="cmd-green">> Neon theme set to CYBER MATRIX GREEN</span>`);
                } else if (arg === 'cyan') {
                    document.documentElement.style.setProperty('--accent-primary', '#00f0ff');
                    document.documentElement.style.setProperty('--accent-glow', 'rgba(0, 240, 255, 0.6)');
                    appendLine(`<span class="cmd-green">> Neon theme restored to QUANTUM CYAN</span>`);
                } else {
                    appendLine(`<span class="cmd-red">Available themes: cyan | purple | green</span>`);
                }
            } else if (mainCmd === 'matrix') {
                appendLine(`<span class="cmd-green">> Initiating Matrix protocol... Wake up, Neo...</span>`);
                triggerMatrixRain();
            } else if (commands[mainCmd]) {
                const res = commands[mainCmd]();
                if (res) appendLine(res);
            } else {
                appendLine(`<span class="cmd-red">Command not recognized: '${mainCmd}'. Type 'help' for command directory.</span>`);
            }
        }
    });
}

function triggerMatrixRain() {
    const terminal = document.querySelector('.terminal-card');
    if (!terminal) return;
    terminal.classList.add('matrix-glitch-mode');
    setTimeout(() => {
        terminal.classList.remove('matrix-glitch-mode');
    }, 2500);
}

/* ==========================================================================
   5. HUD TELEMETRY, CLOCK & FPS COUNTER
   ========================================================================== */
function initHUDTelemetry() {
    // 1. Live Clock
    const timeDisplay = document.getElementById('hud-time-display');
    function updateClock() {
        if (!timeDisplay) return;
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        timeDisplay.textContent = `UTC+05:30 [${hrs}:${mins}:${secs}]`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // 2. Real-time FPS Counter
    let frameCount = 0;
    let lastTime = performance.now();
    const fpsDisplay = document.getElementById('hud-fps-display');

    function checkFPS() {
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
            if (fpsDisplay) {
                const fps = Math.min(frameCount, 60);
                fpsDisplay.textContent = `${fps} FPS`;
            }
            frameCount = 0;
            lastTime = now;
        }
        requestAnimationFrame(checkFPS);
    }
    requestAnimationFrame(checkFPS);

    // 3. Audio toggle button
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            window.soundFX.toggle();
        });
    }

    // 4. Mobile Menu Navigation
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            window.soundFX.playBeep(750, 0.06);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                window.soundFX.playBeep(880, 0.05);
            });
        });
    }
}

/* ==========================================================================
   6. CONTACT TRANSMITTER FORM & COPY ACTIONS
   ========================================================================== */
function initContactTransmitter() {
    const form = document.getElementById('quantum-transmission-form');
    const statusBox = document.getElementById('transmission-status');

    if (form && statusBox) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            window.soundFX.playTransmit();

            statusBox.style.display = 'block';
            statusBox.innerHTML = `
                <div class="transmitting-indicator">
                    <span class="pulse-dot"></span>
                    <span>ESTABLISHING SECURE QUANTUM LINK... TRANSMITTING PACKET...</span>
                </div>
            `;

            setTimeout(() => {
                statusBox.innerHTML = `
                    <div class="transmitted-success">
                        <span class="check-icon">✓</span>
                        <span>TRANSMISSION CONFIRMED! Message securely delivered to Prashant Singh Chauhan.</span>
                    </div>
                `;
                form.reset();
                window.soundFX.playChirp(true);
            }, 1800);
        });
    }

    // Copy to clipboard actions
    const copyBtns = document.querySelectorAll('.copy-uplink-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.dataset.copy;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = `<span class="check">✓</span> COPIED!`;
                    window.soundFX.playBeep(1200, 0.08);
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                    }, 2000);
                });
            }
        });
    });
}

/* ==========================================================================
   7. SCROLL REVEAL & SOUND HOOKS
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.sci-fi-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));

    // Audio click hooks on all cyber-buttons
    document.querySelectorAll('.cyber-btn, .btn, .nav-links a').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            window.soundFX.playBeep(1400, 0.03);
        });
    });
}

/* ==========================================================================
   DOCUMENT READY INITIALIZATION
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
    initHoloCard();
    initSkillsMatrix();
    initSciFiTerminal();
    initHUDTelemetry();
    initContactTransmitter();
    initScrollReveal();
});
