// ===== BACKGROUND MUSIC =====
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');
const musicLabel = document.getElementById('musicLabel');

bgMusic.volume = 0.3; // Soft volume for lofi vibes

let isPlaying = false;

musicToggle.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        musicIcon.textContent = '🎵';
        musicLabel.textContent = 'Play Music';
        isPlaying = false;
    } else {
        bgMusic.play().then(() => {
            musicToggle.classList.add('playing');
            musicIcon.textContent = '🎶';
            musicLabel.textContent = 'Now Playing';
            isPlaying = true;
        }).catch(() => {
            // Browser blocked autoplay, that's fine
            console.log('Audio play blocked by browser');
        });
    }
});

// ===== SPARKLE CANVAS (Background sequin effect) =====

const sparkleCanvas = document.getElementById('sparkleCanvas');
const sparkleCtx = sparkleCanvas.getContext('2d');
let sparkles = [];

function resizeCanvas() {
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Sparkle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * sparkleCanvas.width;
        this.y = Math.random() * sparkleCanvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.6 + 0.2;
        this.speed = Math.random() * 0.02 + 0.005;
        this.phase = Math.random() * Math.PI * 2;
        this.isGold = Math.random() > 0.3;
    }
    update() {
        this.phase += this.speed;
        this.opacity = Math.abs(Math.sin(this.phase)) * this.maxOpacity;
        if (this.phase > Math.PI * 4) this.reset();
    }
    draw() {
        sparkleCtx.save();
        sparkleCtx.globalAlpha = this.opacity;
        sparkleCtx.fillStyle = this.isGold ? '#d4a437' : '#f0d078';
        sparkleCtx.shadowBlur = this.size * 4;
        sparkleCtx.shadowColor = this.isGold ? '#d4a437' : '#f0d078';
        
        // Draw star shape
        sparkleCtx.beginPath();
        const s = this.size;
        sparkleCtx.moveTo(this.x, this.y - s);
        sparkleCtx.lineTo(this.x + s * 0.3, this.y - s * 0.3);
        sparkleCtx.lineTo(this.x + s, this.y);
        sparkleCtx.lineTo(this.x + s * 0.3, this.y + s * 0.3);
        sparkleCtx.lineTo(this.x, this.y + s);
        sparkleCtx.lineTo(this.x - s * 0.3, this.y + s * 0.3);
        sparkleCtx.lineTo(this.x - s, this.y);
        sparkleCtx.lineTo(this.x - s * 0.3, this.y - s * 0.3);
        sparkleCtx.closePath();
        sparkleCtx.fill();
        sparkleCtx.restore();
    }
}

// Create sparkles
for (let i = 0; i < 80; i++) {
    sparkles.push(new Sparkle());
}

function animateSparkles() {
    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
    sparkles.forEach(s => {
        s.update();
        s.draw();
    });
    requestAnimationFrame(animateSparkles);
}
animateSparkles();

// ===== SPOTLIGHT FOLLOWING MOUSE =====
const spotlightOverlay = document.getElementById('spotlightOverlay');

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    spotlightOverlay.style.setProperty('--mouse-x', x + '%');
    spotlightOverlay.style.setProperty('--mouse-y', y + '%');
});

// ===== FLOATING MUSIC NOTES =====
const notesContainer = document.getElementById('floatingNotes');
const noteSymbols = ['♪', '♫', '♬', '♩', '🎵', '🎶'];

function createMusicNote() {
    const note = document.createElement('span');
    note.className = 'music-note';
    note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
    note.style.left = Math.random() * 100 + '%';
    note.style.animationDuration = (Math.random() * 6 + 6) + 's';
    note.style.animationDelay = Math.random() * 4 + 's';
    note.style.fontSize = (Math.random() * 1 + 1) + 'rem';
    notesContainer.appendChild(note);
    
    setTimeout(() => {
        note.remove();
    }, 14000);
}

// Create initial notes
for (let i = 0; i < 6; i++) {
    setTimeout(createMusicNote, i * 2000);
}

// Keep creating notes
setInterval(createMusicNote, 3000);

// ===== SCROLL ANIMATIONS (Intersection Observer) =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for scroll animation
document.querySelectorAll('.gallery-card, .message-card, .mj-quote-badge').forEach(el => {
    observer.observe(el);
});

// Staggered gallery card animation
const galleryCards = document.querySelectorAll('.gallery-card');
const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            const cardIndex = Array.from(galleryCards).indexOf(entry.target);
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, cardIndex * 100);
        }
    });
}, { threshold: 0.1 });

galleryCards.forEach(card => galleryObserver.observe(card));

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentLightboxIndex = 0;
const galleryItems = [];

// Collect gallery items with valid images
document.querySelectorAll('.gallery-card').forEach((card, index) => {
    const img = card.querySelector('img');
    const caption = card.querySelector('.card-caption');
    
    card.addEventListener('click', () => {
        // Only open lightbox if image loaded successfully
        if (img && img.style.display !== 'none') {
            openLightbox(index);
        }
    });
    
    galleryItems.push({
        src: img ? img.src : '',
        caption: caption ? caption.textContent : '',
        hasImage: img && img.style.display !== 'none'
    });
});

function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function updateLightbox() {
    const item = galleryItems[currentLightboxIndex];
    lightboxImg.src = item.src;
    lightboxCaption.textContent = item.caption;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${galleryItems.length}`;
}

function nextLightbox() {
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryItems.length;
    updateLightbox();
}

function prevLightbox() {
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightbox();
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', nextLightbox);
lightboxPrev.addEventListener('click', prevLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
});

// ===== CONFETTI =====
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiAnimating = false;

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
resizeConfettiCanvas();
window.addEventListener('resize', resizeConfettiCanvas);

const confettiColors = [
    '#d4a437', '#f0d078', '#c41e3a', '#ffffff', 
    '#b8860b', '#ff6b6b', '#ffd93d', '#c0c0c0',
    '#e8b432', '#ff1744'
];

class ConfettiPiece {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = -20;
        this.width = Math.random() * 12 + 5;
        this.height = Math.random() * 6 + 3;
        this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        this.velocityX = (Math.random() - 0.5) * 6;
        this.velocityY = Math.random() * 4 + 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.opacity = 1;
        this.gravity = 0.1;
        this.drag = 0.98;
        this.isCircle = Math.random() > 0.6;
    }
    update() {
        this.velocityY += this.gravity;
        this.velocityX *= this.drag;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.rotation += this.rotationSpeed;
        
        if (this.y > confettiCanvas.height + 20) {
            this.opacity = 0;
        }
    }
    draw() {
        confettiCtx.save();
        confettiCtx.globalAlpha = this.opacity;
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate((this.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = this.color;
        
        if (this.isCircle) {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        } else {
            confettiCtx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        confettiCtx.restore();
    }
}

function launchConfetti() {
    confettiParticles = [];
    
    // Create bursts
    for (let burst = 0; burst < 3; burst++) {
        setTimeout(() => {
            for (let i = 0; i < 80; i++) {
                const piece = new ConfettiPiece();
                piece.x = confettiCanvas.width * (0.2 + Math.random() * 0.6);
                piece.y = confettiCanvas.height * 0.3;
                piece.velocityX = (Math.random() - 0.5) * 15;
                piece.velocityY = -(Math.random() * 12 + 5);
                confettiParticles.push(piece);
            }
        }, burst * 300);
    }
    
    // Continuous rain
    for (let i = 0; i < 120; i++) {
        setTimeout(() => {
            confettiParticles.push(new ConfettiPiece());
        }, Math.random() * 2000);
    }
    
    if (!confettiAnimating) {
        confettiAnimating = true;
        animateConfetti();
    }
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiParticles = confettiParticles.filter(p => p.opacity > 0);
    
    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });
    
    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimating = false;
    }
}

// ===== AUTO LAUNCH CONFETTI ON PAGE LOAD =====
window.addEventListener('load', () => {
    setTimeout(() => {
        launchConfetti();
    }, 1500);
});

// ===== SCROLL HIDE HINT =====
const scrollHint = document.getElementById('scrollHint');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100 && scrollHint) {
        scrollHint.style.opacity = '0';
        scrollHint.style.transition = 'opacity 0.5s ease';
    }
}, { passive: true });

// ===== PARALLAX-LIKE SCROLL EFFECTS =====
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const hero = document.getElementById('hero');
    if (hero) {
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent && scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrollY / window.innerHeight) * 1.2;
        }
    }
}, { passive: true });




// ===== IMAGE ERROR HANDLING =====
// Show placeholders for missing images
window.addEventListener('load', () => {
    document.querySelectorAll('.gallery-card img').forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
            img.style.display = 'none';
            const placeholder = img.parentElement.querySelector('.placeholder');
            if (placeholder) placeholder.style.display = 'flex';
        }
    });
});




console.log('%c🎂 Happy Birthday Jannavi! 🎂', 
    'color: #d4a437; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);');
console.log('%cMade with 💛 and MJ vibes', 
    'color: #f0d078; font-size: 14px;');
