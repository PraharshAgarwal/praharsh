// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorGlow.style.left = mouseX + 'px';
  cursorGlow.style.top = mouseY + 'px';
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  backToTop.classList.toggle('visible', window.scrollY > 500);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

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
        if (a.getAttribute('href') === '#' + id) a.classList.add('active');
      });
    }
  });
}

window.addEventListener('scroll', highlightNav);

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
);

revealElements.forEach(el => revealObserver.observe(el));

// ===== BACK TO TOP =====
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

let phraseIndex = 0, charIndex = 0, isDeleting = false, typingSpeed = 80;

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
    typingSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typingSpeed = 400;
  }

  setTimeout(typeEffect, typingSpeed);
}

typeEffect();

// ===== CONTACT FORM (Web3Forms) =====
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('contact-submit');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Sending...';
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

  submitBtn.innerHTML = originalText;
  submitBtn.disabled = false;
  setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status'; }, 5000);
});

// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (scrollTop / docHeight) * 100 + '%';
}

window.addEventListener('scroll', updateScrollProgress);

// ===== ANIMATED STATS COUNTER =====
const statNumbers = document.querySelectorAll('.stat-val');

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals) || 0;
  const duration = 2000;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (eased * target).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(updateCount);
  }

  requestAnimationFrame(updateCount);
}

// Start counters after page load with a small delay
setTimeout(() => {
  statNumbers.forEach(el => animateCounter(el));
}, 1500);

// ===== SKILL PILL TILT EFFECT =====
document.querySelectorAll('.skill-pill').forEach(pill => {
  pill.addEventListener('mousemove', (e) => {
    const rect = pill.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    pill.style.transform = `translateY(-4px) scale(1.03) perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  pill.addEventListener('mouseleave', () => {
    pill.style.transform = '';
  });
});

// ===== PAGE LOAD =====
window.addEventListener('load', () => {
  document.body.classList.remove('page-loading');
});

// ===== HERO PARALLAX ON SCROLL =====
const heroVisual = document.querySelector('.hero-visual');
const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY < window.innerHeight) {
    const factor = scrollY * 0.3;
    if (heroVisual) heroVisual.style.transform = `translateY(${factor * 0.5}px) rotate(${1 - scrollY * 0.002}deg)`;
    if (heroContent) heroContent.style.transform = `translateY(${factor * 0.15}px)`;
  }
});

// ===== MAGNETIC HOVER ON PROJECT CARDS =====
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const moveX = (x - centerX) / 30;
    const moveY = (y - centerY) / 30;
    card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== SKILLS STAGGER OBSERVER =====
const skillsOrbit = document.querySelector('.skills-orbit');
if (skillsOrbit) {
  const skillsObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        skillsObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  skillsObs.observe(skillsOrbit);
}

// ===== SMOOTH CARD FOCUS GLOW =====
document.querySelectorAll('.stat-chip, .edu-content, .contact-chip').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
  });
});

// ===== SCROLL INDICATOR FADE =====
const scrollIndicator = document.getElementById('scrollIndicator');
if (scrollIndicator) {
  window.addEventListener('scroll', () => {
    const opacity = Math.max(0, 1 - window.scrollY / 300);
    scrollIndicator.style.opacity = opacity;
    if (window.scrollY > 300) {
      scrollIndicator.style.pointerEvents = 'none';
    } else {
      scrollIndicator.style.pointerEvents = 'auto';
    }
  });
}

// ===== SOCIAL ICON MAGNETIC HOVER =====
document.querySelectorAll('.social-icon').forEach(icon => {
  icon.addEventListener('mousemove', (e) => {
    const rect = icon.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    icon.style.transform = `translateY(-3px) translate(${x * 0.3}px, ${y * 0.3}px)`;
  });

  icon.addEventListener('mouseleave', () => {
    icon.style.transform = '';
  });
});

// ===== ABOUT IMAGE PARALLAX TILT =====
const imgFrame = document.querySelector('.img-frame');
if (imgFrame) {
  imgFrame.addEventListener('mousemove', (e) => {
    const rect = imgFrame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imgFrame.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  });

  imgFrame.addEventListener('mouseleave', () => {
    imgFrame.style.transform = '';
  });
}
