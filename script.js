// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 50;
  navbar.classList.toggle('scrolled', scrolled);

  // Back to top visibility
  backToTop.classList.toggle('visible', window.scrollY > 500);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ===== ACTIVE NAV LINK HIGHLIGHTING =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

function highlightNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navAnchors.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + id) {
          a.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav);

// ===== SCROLL REVEAL (Intersection Observer) =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  }
);

revealElements.forEach(el => revealObserver.observe(el));

// ===== BACK TO TOP =====
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== DARK/LIGHT THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

// Check saved preference
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('portfolio-theme', next);
});

// ===== TYPING ANIMATION =====
const typedTextEl = document.getElementById('typedText');
const phrases = [
  'Full-Stack Developer.',
  'CS Undergrad at VIT.',
  'Problem Solver.',
  'Backend Engineer.',
  'Database Enthusiast.',
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 80;

function typeEffect() {
  const currentPhrase = phrases[phraseIndex];

  if (isDeleting) {
    typedTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 40;
  } else {
    typedTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 80;
  }

  if (!isDeleting && charIndex === currentPhrase.length) {
    // Pause at end of phrase
    typingSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typingSpeed = 400;
  }

  setTimeout(typeEffect, typingSpeed);
}

// Start typing
typeEffect();

// ===== CONTACT FORM (Web3Forms) =====
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('contact-submit');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Show loading state
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  formStatus.className = 'form-status';
  formStatus.textContent = '';

  try {
    const formData = new FormData(contactForm);
    const json = Object.fromEntries(formData);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(json)
    });

    const result = await response.json();

    if (result.success) {
      formStatus.className = 'form-status success';
      formStatus.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
      contactForm.reset();
    } else {
      formStatus.className = 'form-status error';
      formStatus.textContent = '❌ Something went wrong. Please try again or email me directly.';
    }
  } catch (error) {
    formStatus.className = 'form-status error';
    formStatus.textContent = '❌ Network error. Please try again or email me directly.';
  }

  submitBtn.textContent = originalText;
  submitBtn.disabled = false;

  // Auto-hide status after 5 seconds
  setTimeout(() => {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }, 5000);
});

// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = progress + '%';
}

window.addEventListener('scroll', updateScrollProgress);

// ===== ANIMATED STATS COUNTER =====
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals) || 0;
  const duration = 2000;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    el.textContent = current.toFixed(decimals);

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    }
  }

  requestAnimationFrame(updateCount);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(el => animateCounter(el));
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  // Delay counter start to sync with hero stagger animation
  setTimeout(() => {
    statNumbers.forEach(el => animateCounter(el));
  }, 1500);
}

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
  document.body.classList.remove('page-loading');
});
