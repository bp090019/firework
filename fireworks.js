class Firework {
    constructor(canvasWidth, canvasHeight) {
        this.canvas = {
            width: canvasWidth,
            height: canvasHeight
        };
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight;
        this.targetX = Math.random() * canvasWidth;
        this.targetY = Math.random() * (canvasHeight/2) + 100;
        this.trail = [];
        this.trailLength = 10;
        this.speed = {
            x: (this.targetX - this.x) / 50,
            y: (this.targetY - this.y) / 50
        };
        this.particles = [];
        this.exploded = false;
        this.colors = [
            '#FF0000', '#00FF00', '#0000FF', 
            '#FFFF00', '#FF00FF', '#00FFFF',
            '#FFA500', '#FF1493', '#7FFF00',
            '#FF69B4', '#FFD700', '#FF4500',
            '#9400D3', '#00FA9A', '#FF1493'
        ];
        this.currentColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    createHeartParticles() {
        const heartCount = 2;
        const baseSize = 12;

        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 8 + Math.random() * 6;
            const life = 40 + Math.random() * 20;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                alpha: 1,
                life: life,
                maxLife: life,
                size: 2 + Math.random() * 2,
                isExplosion: true
            });
        }

        for (let h = 0; h < heartCount; h++) {
            const angle = (Math.PI * 2 * h) / heartCount;
            const distance = 60 + Math.random() * 80;
            const heartX = this.x + Math.cos(angle) * distance;
            const heartY = this.y + Math.sin(angle) * distance;
            const heartColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            const heartSize = baseSize * (0.8 + Math.random() * 0.4);

            for (let i = 0; i < 360; i += 3) {
                const rad = (i * Math.PI) / 180;
                const heartShape = {
                    x: heartX + heartSize * (16 * Math.pow(Math.sin(rad), 3)),
                    y: heartY - heartSize * (13 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
                };

                const particleColor = Math.random() > 0.8 ? 
                    this.colors[Math.floor(Math.random() * this.colors.length)] : 
                    heartColor;

                this.particles.push({
                    x: this.x + (Math.random() - 0.5) * 50,
                    y: this.y + (Math.random() - 0.5) * 50,
                    targetX: heartShape.x,
                    targetY: heartShape.y,
                    color: particleColor,
                    alpha: 0,
                    life: 150 + Math.random() * 20,
                    size: 1.5,
                    speed: 6,
                    delay: Math.random() * 20
                });
            }
        }
    }

    update(ctx) {
        if (!this.exploded) {
            this.trail.push({x: this.x, y: this.y});
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            this.x += this.speed.x;
            this.y += this.speed.y;

            if (Math.abs(this.y - this.targetY) < 5) {
                this.exploded = true;
                this.createHeartParticles();
            }

            this.trail.forEach((pos, index) => {
                const alpha = (index / this.trailLength) * 0.5;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            });

            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.currentColor;
            ctx.fill();

            return true;
        } else {
            this.particles.forEach(p => {
                if (p.delay > 0) {
                    p.delay--;
                    return;
                }

                if (p.isExplosion) {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.2;
                    p.vx *= 0.98;
                    p.life--;
                    p.alpha = (p.life / p.maxLife) * 0.8;
                } else {
                    if (p.alpha < 1) p.alpha += 0.05;
                    const dx = p.targetX - p.x;
                    const dy = p.targetY - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0.1) {
                        p.x += (dx / distance) * p.speed;
                        p.y += (dy / distance) * p.speed;
                    }
                    p.life--;
                    if (p.life < 30) p.alpha *= 0.9;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha * 0.3;
                ctx.fill();

                ctx.globalAlpha = 1;
            });

            this.particles = this.particles.filter(p => p.life > 0);
            return this.particles.length > 0;
        }
    }
}

class FireworkShow {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.fireworks = [];
        this.lastLaunch = 0;
        this.launchInterval = 1000;
        this.countdown = 10;
        this.countdownStarted = false;

        
        this.messageSettings = {
            durationPerMessage: 5000,
            fontSize: 55,
            fontFamily: 'Arial',
            colors: ['#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C', '#F39C12'],
            glowColors: ['#C0392B', '#8E44AD', '#2980B9', '#16A085', '#D35400']
        };
        
        this.currentMessageIndex = 0;
        this.messageAlpha = 0;
        this.messageStartTime = 0;
        this.sparkles = [];
        this.floatingParticles = [];
        
        this.setupCanvas();
    }

    setupCanvas() {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.background = '#000';
        this.canvas.style.display = 'block';
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setCustomMessages(messages) {
        if (Array.isArray(messages)) {
            this.customMessages = messages;
        }
    }

    setMessageSettings(settings) {
        this.messageSettings = { ...this.messageSettings, ...settings };
    }

    createSparkles() {
        this.sparkles = [];
        for (let i = 0; i < 120; i++) {
            this.sparkles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                alpha: Math.random(),
                twinkleSpeed: 0.02 + Math.random() * 0.05,
                color: ['#FFD700', '#FFFFFF', '#FF69B4', '#00FFFF', '#FF6347', '#7CFC00', '#DA70D6'][Math.floor(Math.random() * 7)]
            });
        }
    }

    createFloatingParticles() {
        this.floatingParticles = [];
        const symbols = ['✨', '⭐', '💫', '🌟', '✦', '💔', '🥀'];
        for (let i = 0; i < 15; i++) {
            this.floatingParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                size: 15 + Math.random() * 20,
                speedX: (Math.random() - 0.5) * 1,
                speedY: -0.5 - Math.random() * 1,
                alpha: 0.3 + Math.random() * 0.5,
                rotation: Math.random() * 360
            });
        }
    }

    updateSparkles() {
        this.sparkles.forEach(s => {
            s.x += s.speedX;
            s.y += s.speedY;
            s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.03;
            s.alpha = Math.max(0.2, Math.min(1, s.alpha));
            
            if (s.x < 0) s.x = this.canvas.width;
            if (s.x > this.canvas.width) s.x = 0;
            if (s.y < 0) s.y = this.canvas.height;
            if (s.y > this.canvas.height) s.y = 0;
        });
    }

    updateFloatingParticles() {
        this.floatingParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += 1;
            
            if (p.y < -50) {
                p.y = this.canvas.height + 50;
                p.x = Math.random() * this.canvas.width;
            }
            if (p.x < -50) p.x = this.canvas.width + 50;
            if (p.x > this.canvas.width + 50) p.x = -50;
        });
    }

    drawSparkles() {
        this.sparkles.forEach(s => {
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fillStyle = s.color;
            this.ctx.globalAlpha = s.alpha * 0.8;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = s.color;
            this.ctx.globalAlpha = s.alpha * 0.2;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    drawFloatingParticles() {
        this.floatingParticles.forEach(p => {
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.font = `${p.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillText(p.symbol, 0, 0);
            this.ctx.restore();
        });
        this.ctx.globalAlpha = 1;
    }

    drawSingleMessage(message, alpha, colorIndex) {
        const settings = this.messageSettings;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const color = settings.colors[colorIndex % settings.colors.length];
        const glowColor = settings.glowColors[colorIndex % settings.glowColors.length];
        
        const scale = 0.7 + (alpha * 0.3);
        const fontSize = settings.fontSize * scale;
        
        const floatY = Math.sin(Date.now() * 0.003) * 10;
        const floatX = Math.cos(Date.now() * 0.002) * 5;
        
        this.ctx.save();
        
        this.ctx.shadowBlur = 60 * alpha;
        this.ctx.shadowColor = glowColor;
        
        this.ctx.font = `bold ${fontSize}px ${settings.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let i = 5; i > 0; i--) {
            this.ctx.fillStyle = glowColor;
            this.ctx.globalAlpha = alpha * 0.1 / i;
            this.ctx.fillText(message, centerX + floatX, centerY + floatY);
        }
        
        this.ctx.fillStyle = '#000';
        this.ctx.globalAlpha = alpha * 0.5;
        this.ctx.fillText(message, centerX + floatX + 3, centerY + floatY + 3);
        
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillText(message, centerX + floatX, centerY + floatY);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.globalAlpha = alpha * 0.4;
        this.ctx.fillText(message, centerX + floatX, centerY + floatY - 2);
        
        this.ctx.restore();
        this.ctx.globalAlpha = 1;
    }

    animateMessages() {
        const durationPerMessage = this.messageSettings.durationPerMessage;
        const messageCount = this.customMessages.length;
        const totalDuration = durationPerMessage * messageCount;
        const elapsed = Date.now() - this.messageStartTime;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateSparkles();
        this.updateFloatingParticles();
        this.drawSparkles();
        this.drawFloatingParticles();
        
        if (elapsed >= totalDuration) {
            setTimeout(() => {
                this.start();
            }, 300);
            return;
        }
        
        this.currentMessageIndex = Math.floor(elapsed / durationPerMessage);
        const messageElapsed = elapsed % durationPerMessage;
        const fadeTime = 500;
        
        if (messageElapsed < fadeTime) {
            this.messageAlpha = messageElapsed / fadeTime;
        } else if (messageElapsed > durationPerMessage - fadeTime) {
            this.messageAlpha = (durationPerMessage - messageElapsed) / fadeTime;
        } else {
            this.messageAlpha = 1;
        }
        
        if (this.currentMessageIndex < messageCount) {
            this.drawSingleMessage(
                this.customMessages[this.currentMessageIndex],
                this.messageAlpha,
                this.currentMessageIndex
            );
        }
        
        requestAnimationFrame(() => this.animateMessages());
    }

    showCustomMessage() {
        this.messageStartTime = Date.now();
        this.currentMessageIndex = 0;
        this.createSparkles();
        this.createFloatingParticles();
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.animateMessages();
    }

    drawCountdown() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        
        this.ctx.shadowBlur = 60;
        this.ctx.shadowColor = '#FFD700';
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = `bold ${150 * pulse}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.countdown, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = 'bold 30px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('✨ Bersiaplah... ✨', this.canvas.width / 2, this.canvas.height / 2 + 120);
        
        this.ctx.shadowBlur = 0;
    }

    startCountdown() {
        this.countdownStarted = true;
        
        const countdownInterval = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(countdownInterval);
                setTimeout(() => {
                    this.showCustomMessage();
                }, 500);
            }
        }, 1000);
        
        const animate = () => {
            if (this.countdown > 0) {
                this.drawCountdown();
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    launch() {
        const now = Date.now();
        if (now - this.lastLaunch > this.launchInterval) {
            this.fireworks.push(new Firework(this.canvas.width, this.canvas.height));
            this.lastLaunch = now;
        }
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.launch();
        this.fireworks = this.fireworks.filter(firework => firework.update(this.ctx));

        requestAnimationFrame(() => this.animate());
    }

    start() {
        this.animate();
    }
}

window.onload = () => {
    let canvas = document.getElementById('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        document.body.appendChild(canvas);
    }
    
    const show = new FireworkShow('canvas');
  
    show.setCustomMessages([
        "cie kate balik pondok arek e",
        "kenal samean asik yo bakne",
        "tetep semangat belajar nde pondok",
        "sok nk muleh ojo lali karo om tampan iki yo",
        "maksih, TAK TUNGGU BALIMU"
    ]);
  
    show.setMessageSettings({
        durationPerMessage: 5000,
        fontSize: 55,
        fontFamily: 'Arial',
        colors: ['#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C', '#F39C12'],
        glowColors: ['#C0392B', '#8E44AD', '#2980B9', '#16A085', '#D35400']
    });
    
    show.startCountdown();
};
