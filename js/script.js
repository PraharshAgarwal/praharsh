(function () {
  'use strict';

  /* ============ THEME (persisted) ============ */
  var THEME_KEY = 'portfolio-theme';
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { }
  }
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'light'; }
  function toggleTheme() { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { }
    if (saved) { applyTheme(saved); return; }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
  })();

  /* ============ BOOT SEQUENCE ============ */
  var boot = document.getElementById('bootScreen');
  var fill = document.getElementById('bootFill');
  requestAnimationFrame(function () { fill.style.width = '100%'; });
  setTimeout(function () {
    boot.classList.add('hide');
    setTimeout(function () {
      boot.remove();
      openWindow('terminal');
      // On larger screens, cascade the Finder window in behind the terminal
      // so the desktop reads as "in use" on first load rather than empty.
      if (window.innerWidth > 900) {
        setTimeout(function () { openWindow('about'); }, 900);
      }
    }, 500);
  }, 1200);

  /* ============ CLOCK ============ */
  var mbClock = document.getElementById('mbClock');
  var mbTime = document.getElementById('mbTime');
  var widgetDate = document.getElementById('widgetDate');
  var widgetTime = document.getElementById('widgetTime');
  function updateClock() {
    var d = new Date();
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    mbClock.textContent = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
    var h = d.getHours(); var m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    var timeStr = h12 + ':' + (m < 10 ? '0' + m : m);
    mbTime.textContent = timeStr + ' ' + ampm;
    if (widgetDate) widgetDate.textContent = days[d.getDay()].toUpperCase() + ', ' + months[d.getMonth()].toUpperCase() + ' ' + d.getDate();
    if (widgetTime) widgetTime.textContent = timeStr;
  }
  updateClock();
  setInterval(updateClock, 15000);

  /* ============ WINDOW REGISTRY ============
     Dock/desktop ids like "skills"/"education"/"experience" all live
     inside the single Finder window (#win-about) as sections. */
  var SECTION_TO_WINDOW = { about: 'about', skills: 'about', education: 'about', experience: 'about' };
  var SECTION_TITLES = {
    about: 'About Me', skills: 'Tech Stack', education: 'Education', experience: 'Experience'
  };

  var windows = Array.prototype.slice.call(document.querySelectorAll('.mac-window'));
  var zTop = 10;
  var mbAppName = document.getElementById('mbAppName');
  var finderTitle = document.getElementById('finderTitle');
  var finderPath = document.getElementById('finderPath');

  function getWin(id) { return document.getElementById('win-' + id); }
  function winKeyOf(win) { return win.id.replace('win-', ''); }

  function dockButtonFor(section) {
    return document.querySelector('.dock-item[data-open="' + section + '"]');
  }

  function bringToFront(win) {
    zTop += 1;
    win.style.zIndex = zTop;
    mbAppName.textContent = win.getAttribute('data-app') || 'Finder';
  }

  function updateRunningIndicators() {
    document.querySelectorAll('.dock-item[data-open]').forEach(function (d) {
      var section = d.getAttribute('data-open');
      var winId = SECTION_TO_WINDOW[section] || section;
      var win = getWin(winId);
      var isOpen = win && win.classList.contains('open');
      d.classList.toggle('running', !!isOpen);
    });
  }

  function switchFinderSection(section) {
    var win = getWin('about');
    win.querySelectorAll('.finder-panel').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-panel') === section);
    });
    win.querySelectorAll('.fs-item').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-section') === section);
    });
    finderTitle.textContent = SECTION_TITLES[section] || 'Finder';
    finderPath.textContent = 'Macintosh HD ▸ Users ▸ praharsh ▸ ' + (SECTION_TITLES[section] || 'Finder');
  }

  function openWindow(id, triggerEl, section) {
    var winId = SECTION_TO_WINDOW[id] || id;
    var win = getWin(winId);
    if (!win) return;

    if (SECTION_TO_WINDOW[id]) switchFinderSection(id);

    if (!win.classList.contains('open')) {
      if (triggerEl) {
        var iconRect = triggerEl.getBoundingClientRect();
        var originX = iconRect.left + iconRect.width / 2;
        var originY = iconRect.top + iconRect.height / 2;
        win.style.transformOrigin = (originX - win.offsetLeft) + 'px ' + (originY - win.offsetTop) + 'px';
      } else {
        win.style.transformOrigin = 'center center';
      }
      win.classList.add('open');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { win.classList.add('show'); });
      });
    } else {
      win.classList.add('show');
    }
    bringToFront(win);
    updateRunningIndicators();
    if (winId === 'terminal') {
      runTerminal();
      if (termInputEl) setTimeout(function () { termInputEl.focus(); }, 260);
    }
  }

  function closeWindow(win) {
    win.classList.add('closing');
    win.classList.remove('show');
    setTimeout(function () {
      win.classList.remove('open', 'closing');
      updateRunningIndicators();
    }, 220);
  }

  function minimizeWindow(win) {
    win.classList.remove('show');
    setTimeout(function () {
      win.classList.remove('open');
      updateRunningIndicators();
    }, 200);
  }

  function toggleMaximize(win) {
    win.classList.toggle('maximized');
  }

  function topmostWindow() {
    var visible = windows.filter(function (w) { return w.classList.contains('show'); });
    if (!visible.length) return null;
    return visible.reduce(function (a, b) {
      return (parseInt(b.style.zIndex || 0) > parseInt(a.style.zIndex || 0)) ? b : a;
    });
  }

  /* ---- Open triggers: desktop icons + dock, with bounce feedback ---- */
  document.querySelectorAll('[data-open]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var id = el.getAttribute('data-open');
      if (id === 'resume') e.preventDefault();

      if (el.classList.contains('dock-item')) {
        el.classList.remove('bounce');
        void el.offsetWidth;
        el.classList.add('bounce');
      }
      if (el.classList.contains('dicon')) {
        el.classList.remove('pulse');
        void el.offsetWidth;
        el.classList.add('pulse');
      }
      openWindow(id, el);
    });
  });

  /* ---- Finder sidebar section switching ---- */
  document.querySelectorAll('.fs-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchFinderSection(btn.getAttribute('data-section'));
    });
  });

  /* ---- Traffic lights + focus-on-click ---- */
  var TL_LABELS = { close: 'Close window', min: 'Minimize window', max: 'Maximize window' };
  windows.forEach(function (win) {
    win.addEventListener('mousedown', function () { bringToFront(win); });

    // Accessible name + landmark role for each window, derived from its own title, 
    // no need to hand-maintain ids across five near-identical window blocks.
    win.setAttribute('role', 'region');
    var titleEl = win.querySelector('.win-title');
    if (titleEl) {
      if (!titleEl.id) titleEl.id = win.id + '-title';
      win.setAttribute('aria-labelledby', titleEl.id);
    }

    win.querySelectorAll('.tl').forEach(function (btn) {
      var action = btn.getAttribute('data-action');
      if (TL_LABELS[action]) btn.setAttribute('aria-label', TL_LABELS[action]);
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (action === 'close') closeWindow(win);
        else if (action === 'min') minimizeWindow(win);
        else if (action === 'max') toggleMaximize(win);
      });
    });
  });

  /* ============ DRAGGABLE + RESIZABLE WINDOWS (desktop only) ============ */
  function isDesktopWidth() { return window.innerWidth > 720; }

  windows.forEach(function (win) {
    var bar = win.querySelector('.win-titlebar');
    var dragging = false, startX, startY, startLeft, startTop;

    bar.addEventListener('pointerdown', function (e) {
      if (!isDesktopWidth()) return;
      if (e.target.closest('.tl')) return;
      if (win.classList.contains('maximized')) return;
      dragging = true;
      bar.classList.add('dragging');
      bar.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      var rect = win.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
      bringToFront(win);
    });
    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      var newLeft = Math.max(0, startLeft + dx);
      var newTop = Math.max(24, startTop + dy);
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove('dragging');
    }
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);

    bar.addEventListener('dblclick', function (e) {
      if (e.target.closest('.tl')) return;
      if (isDesktopWidth()) toggleMaximize(win);
    });

    // Resize handle
    var handle = document.createElement('div');
    handle.className = 'resize-handle';
    win.appendChild(handle);
    var resizing = false, rStartX, rStartY, rStartW, rStartH;
    handle.addEventListener('pointerdown', function (e) {
      if (!isDesktopWidth()) return;
      if (win.classList.contains('maximized')) return;
      resizing = true;
      handle.setPointerCapture(e.pointerId);
      rStartX = e.clientX; rStartY = e.clientY;
      var rect = win.getBoundingClientRect();
      rStartW = rect.width; rStartH = rect.height;
      bringToFront(win);
      e.stopPropagation();
    });
    handle.addEventListener('pointermove', function (e) {
      if (!resizing) return;
      var dw = e.clientX - rStartX, dh = e.clientY - rStartY;
      var newW = Math.max(320, rStartW + dw);
      var newH = Math.max(220, rStartH + dh);
      win.style.width = newW + 'px';
      win.style.height = newH + 'px';
      e.stopPropagation();
    });
    function endResize() { resizing = false; }
    handle.addEventListener('pointerup', endResize);
    handle.addEventListener('pointercancel', endResize);
  });

  /* ============ TERMINAL TYPED SEQUENCE + Q&A ============ */
  var termLines = document.getElementById('termLines');
  var termBodyEl = document.querySelector('#win-terminal .term-body');
  if (termBodyEl) {
    termBodyEl.addEventListener('click', function () {
      if (termInputEl) termInputEl.focus();
    });
  }
  var termRan = false;
  function runTerminal() {
    if (termRan) return;
    termRan = true;
    var script = [
      { cmd: 'whoami', out: 'Praharsh Agarwal - Full-Stack Developer' },
      { cmd: 'cat role.txt', out: 'B.Tech CSE @ VIT Chennai · CGPA 9.32 · Building things that matter :)' },
      { cmd: 'ls skills/', out: 'Java  Python  C++  JavaScript  TypeScript  Node.js  PostgreSQL  Next.js  NestJS  Flask' },
      { cmd: 'open contact.app', out: 'Launching Mail, say hello any time.' }
    ];
    var i = 0;
    function next() {
      if (i >= script.length) { enableInteractivePrompt(); return; }
      var item = script[i];
      var lineDiv = document.createElement('div');
      lineDiv.className = 'term-line';
      var promptSpan = document.createElement('span');
      promptSpan.className = 'term-prompt';
      promptSpan.textContent = 'praharsh@portfolio ~ %';
      var cmdSpan = document.createElement('span');
      cmdSpan.className = 'term-cmd';
      lineDiv.appendChild(promptSpan);
      lineDiv.appendChild(cmdSpan);
      termLines.appendChild(lineDiv);

      var chars = item.cmd.split('');
      var ci = 0;
      var typer = setInterval(function () {
        cmdSpan.textContent += chars[ci];
        ci++;
        if (ci >= chars.length) {
          clearInterval(typer);
          setTimeout(function () {
            var outDiv = document.createElement('div');
            outDiv.className = 'term-out';
            outDiv.innerHTML = item.out;
            termLines.appendChild(outDiv);
            i++;
            setTimeout(next, 260);
          }, 200);
        }
      }, 28);
    }
    next();
  }

  /* ---- Interactive Q&A prompt ----
     Not a real AI, a small keyword-matched assistant that reads its
     answers straight from the DOM/data already on the page, so it can
     never say something about Praharsh that isn't actually here. */
  var termInputEl = null;
  var termPromptWrap = null;
  var termHistory = [];
  var termHistoryIdx = -1;

  function scrollTermToBottom() {
    var body = document.querySelector('#win-terminal .term-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function addTermLine(container, className, text, isHTML) {
    var div = document.createElement('div');
    div.className = className;
    if (isHTML) div.innerHTML = text; else div.textContent = text;
    container.insertBefore(div, termPromptWrap);
    return div;
  }

  function enableInteractivePrompt() {
    // Turn on live-region announcements only now, during the scripted intro,
    // termLines updates character-by-character, which would spam a screen
    // reader; new Q&A answers, appended as whole lines, are safe to announce.
    termLines.setAttribute('aria-live', 'polite');
    termLines.setAttribute('aria-relevant', 'additions');

    addTermLine(termLines, 'term-out term-hint', 'Ask me something, try "skills", "projects", "education", "experience", or "hire". Type "help" for more.');

    termPromptWrap = document.createElement('div');
    termPromptWrap.className = 'term-line term-input-line';
    var promptSpan = document.createElement('span');
    promptSpan.className = 'term-prompt';
    promptSpan.textContent = 'praharsh@portfolio ~ %';
    termInputEl = document.createElement('input');
    termInputEl.type = 'text';
    termInputEl.className = 'term-input';
    termInputEl.autocomplete = 'off';
    termInputEl.spellcheck = false;
    termInputEl.setAttribute('aria-label', 'Ask a question about Praharsh');
    termInputEl.placeholder = 'ask me something…';
    termPromptWrap.appendChild(promptSpan);
    termPromptWrap.appendChild(termInputEl);
    termLines.appendChild(termPromptWrap);

    termInputEl.addEventListener('keydown', handleTermKeydown);
    termInputEl.focus();
  }

  function handleTermKeydown(e) {
    if (e.key === 'Enter') {
      var val = termInputEl.value.trim();
      if (!val) return;
      termHistory.push(val);
      termHistoryIdx = termHistory.length;

      var qLine = document.createElement('div');
      qLine.className = 'term-line';
      var qPrompt = document.createElement('span');
      qPrompt.className = 'term-prompt';
      qPrompt.textContent = 'praharsh@portfolio ~ %';
      var qCmd = document.createElement('span');
      qCmd.className = 'term-cmd';
      qCmd.textContent = val;
      qLine.appendChild(qPrompt);
      qLine.appendChild(qCmd);
      termLines.insertBefore(qLine, termPromptWrap);

      if (val.toLowerCase() === 'clear') {
        Array.prototype.slice.call(termLines.querySelectorAll('.term-line, .term-out')).forEach(function (el) {
          if (el !== termPromptWrap) el.remove();
        });
      } else {
        addTermLine(termLines, 'term-out term-answer', getAnswer(val), true);
      }
      termInputEl.value = '';
      scrollTermToBottom();
    } else if (e.key === 'ArrowUp') {
      if (termHistoryIdx > 0) { termHistoryIdx--; termInputEl.value = termHistory[termHistoryIdx]; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (termHistoryIdx < termHistory.length - 1) { termHistoryIdx++; termInputEl.value = termHistory[termHistoryIdx]; }
      else { termHistoryIdx = termHistory.length; termInputEl.value = ''; }
      e.preventDefault();
    }
  }

  /* ---- Answer sources: scraped from the same content the windows show,
     so the terminal never drifts out of sync with the rest of the site. ---- */
  function textOf(sel) { var el = document.querySelector(sel); return el ? el.textContent.trim() : ''; }
  function listOf(sel) { return Array.prototype.map.call(document.querySelectorAll(sel), function (el) { return el.textContent.trim(); }); }

  function aboutAnswer() {
    var paras = listOf('.finder-panel[data-panel="about"] .about-copy p');
    return esc(paras.join(' '));
  }
  function skillsAnswer() {
    var langs = listOf('.finder-panel[data-panel="skills"] .sb-label');
    var chips = listOf('.finder-panel[data-panel="skills"] .chip');
    return 'Languages: ' + esc(langs.join(', ')) + '.\nFrameworks &amp; tools: ' + esc(chips.join(', ')) + '.';
  }
  function educationAnswer() {
    var rows = document.querySelectorAll('.finder-panel[data-panel="education"] .edu-row');
    return Array.prototype.map.call(rows, function (row) {
      var title = (row.querySelector('h3') || {}).textContent || '';
      var org = (row.querySelector('.edu-info p') || {}).textContent || '';
      var year = (row.querySelector('.edu-year-tag') || {}).textContent || '';
      var tag = (row.querySelector('.edu-tag') || {}).textContent || '';
      return esc(title + ' — ' + org + ' (' + year + (tag ? ', ' + tag : '') + ')');
    }).join('\n');
  }
  function experienceAnswer() {
    var notes = document.querySelectorAll('.finder-panel[data-panel="experience"] .exp-note');
    return Array.prototype.map.call(notes, function (note) {
      var title = (note.querySelector('h3') || {}).textContent || '';
      var org = (note.querySelector('.exp-org') || {}).textContent || '';
      var date = (note.querySelector('.exp-date') || {}).textContent || '';
      return esc(title + ' at ' + org + ' (' + date + ')');
    }).join('\n');
  }
  function projectsAnswer(filterKey) {
    var keys = Object.keys(projects);
    if (filterKey) {
      var match = keys.filter(function (k) { return k === filterKey; });
      if (match.length) keys = match;
    }
    return keys.map(function (k) {
      var p = projects[k];
      return esc(p.title + ': ' + p.sub + '. ' + p.desc + ' [' + p.tags.join(', ') + ']');
    }).join('\n\n');
  }
  function contactAnswer() {
    var email = textOf('.gi-row .gi-val a[href^="mailto:"]') || 'agarwalpraharsh@gmail.com';
    var links = document.querySelectorAll('#contactForm .mail-socials a');
    var gh = links[0] ? links[0].href : '';
    var li = links[1] ? links[1].href : '';
    return 'Email: ' + esc(email) + '\nGitHub: ' + esc(gh) + '\nLinkedIn: ' + esc(li) + '\nOr just open Mail from the dock, the form goes straight to my inbox.';
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function getAnswer(raw) {
    var q = raw.toLowerCase();

    if (/^(hi|hello|hey|yo|sup|hola)\b/.test(q)) {
      return "Hey! I'm a small keyword-matched helper, not a real AI, ask me about skills, projects, education, experience, or how to reach Praharsh.";
    }
    if (/help|what can you (do|answer)|commands|options/.test(q)) {
      return 'Try asking about: about · skills · projects (or a project name) · education · experience · contact · resume · hire. "clear" wipes the screen.';
    }
    if (/sudo/.test(q)) {
      return 'Nice try, this terminal only has visitor privileges.';
    }
    if (/hire|available|opportunit|job|internship|freelance|open to work/.test(q)) {
      return "Praharsh is open to opportunities right now. Fastest way in: open Mail from the dock, or email " + esc(textOf('.gi-row .gi-val a[href^="mailto:"]') || 'agarwalpraharsh@gmail.com') + ".";
    }
    if (/contact|email|reach|linkedin|github|social/.test(q)) {
      return contactAnswer();
    }
    if (/resume|cv/.test(q)) {
      return 'Here you go: <a href="assets/resume.pdf" target="_blank" rel="noopener" style="color:#7ab8ff;">Open the resume PDF</a> (or find it on the desktop as Resume.pdf).';
    }
    if (/arthiq/.test(q)) return projectsAnswer('arthiq');
    if (/travelapp|travel app/.test(q)) return projectsAnswer('travelapp');
    if (/securebank|secure bank/.test(q)) return projectsAnswer('securebank');
    if (/project/.test(q)) {
      return projectsAnswer() + '\n\nAsk about a project by name for more detail: "ArthIQ", "TravelApp", or "SecureBank".';
    }
    if (/skill|tech stack|technolog|language|framework|know\b|stack\b/.test(q)) {
      return skillsAnswer();
    }
    if (/education|college|university|degree|school|cgpa|gpa|vit/.test(q)) {
      return educationAnswer();
    }
    if (/experience|fyi|intern|work history|club|committee/.test(q)) {
      return experienceAnswer();
    }
    if (/who (are|is)|about (you|him|praharsh)|yourself|bio\b/.test(q)) {
      return aboutAnswer();
    }
    if (/age|old are/.test(q)) {
      return "That's not listed here, but he's a B.Tech CSE student at VIT Chennai, class of 2028.";
    }
    if (/thank/.test(q)) {
      return "Anytime! ask about anything else, or say hi to Praharsh directly via Mail.";
    }
    return "Not sure about that one. Try: about, skills, projects, education, experience, contact, or hire.";
  }

  /* ============ PROJECTS PANEL ============ */
  var projects = {
    arthiq: {
      title: 'ArthIQ', sub: 'Smart Personal Finance Tracker', date: 'Feb 2026', accent: 'amber',
      desc: 'Responsive personal finance tracking SPA built with a custom client-side router, lazy-loaded modules, and Web Storage API state management. Features an interactive multi-month analytics dashboard for tracking spending trends and financial insights.',
      tags: ['JavaScript', 'HTML5', 'CSS3', 'SPA'],
      link: 'https://github.com/PraharshAgarwal/ArthIQ/'
    },
    travelapp: {
      title: 'TravelApp', sub: 'Flight Booking Platform', date: 'Jan 2026', accent: 'emerald',
      desc: 'Full-stack travel booking platform for students built with Next.js, NestJS, and PostgreSQL. Features scalable REST APIs, advanced search and booking workflows, secure Razorpay payment integration, and a responsive modern UI.',
      tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Razorpay'],
      link: 'https://github.com/PraharshAgarwal/TravelApp/'
    },
    securebank: {
      title: 'SecureBank', sub: 'Banking Management System', date: 'Jan 2026', accent: 'violet',
      desc: 'Full-stack banking application built with Flask and PostgreSQL featuring a BCNF-compliant relational schema, ACID-compliant fund transfers with row-level locking, B+ tree indexing for optimized queries, materialized views, and automated audit logging.',
      tags: ['Python', 'Flask', 'PostgreSQL', 'SQL'],
      link: 'https://github.com/PraharshAgarwal/SecureBank/'
    }
  };

  var projDetail = document.getElementById('projDetail');
  var projSidebar = document.getElementById('projSidebar');

  function renderProject(key) {
    var p = projects[key];
    projDetail.innerHTML =
      '<div class="pd-meta">' + p.date + '</div>' +
      '<h2>' + p.title + '</h2>' +
      '<p class="pd-sub">' + p.sub + '</p>' +
      '<p class="pd-desc">' + p.desc + '</p>' +
      '<div class="pd-tags">' + p.tags.map(function (t) { return '<span class="pd-tag">' + t + '</span>'; }).join('') + '</div>' +
      '<a class="pd-link" href="' + p.link + '" target="_blank" rel="noopener">View on GitHub ↗</a>';
  }
  if (projDetail) renderProject('arthiq');

  if (projSidebar) {
    projSidebar.querySelectorAll('.proj-side-item').forEach(function (item) {
      item.addEventListener('click', function () {
        projSidebar.querySelectorAll('.proj-side-item').forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');
        renderProject(item.getAttribute('data-proj'));
      });
    });
  }

  /* ============ CONTACT FORM (Web3Forms) ============ */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('contact-submit');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      var formData = new FormData(form);
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            statusEl.textContent = 'Message sent! thanks for reaching out!';
            statusEl.className = 'form-status success';
            form.reset();
          } else {
            statusEl.textContent = 'Something went wrong. Please try emailing directly.';
            statusEl.className = 'form-status error';
          }
        })
        .catch(function () {
          statusEl.textContent = 'Network error! please try emailing directly.';
          statusEl.className = 'form-status error';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send';
        });
    });
  }

  /* ============ MENU BAR DROPDOWNS ============ */
  var menuButtons = document.querySelectorAll('[data-menu]');
  var dropdowns = document.querySelectorAll('.mb-dropdown');
  var openMenuKey = null;

  dropdowns.forEach(function (d) {
    d.setAttribute('role', 'menu');
    d.querySelectorAll('.mb-dd-item').forEach(function (item) { item.setAttribute('role', 'menuitem'); });
  });
  menuButtons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });

  function closeAllMenus() {
    dropdowns.forEach(function (d) { d.classList.remove('show'); });
    menuButtons.forEach(function (b) { b.classList.remove('mb-open'); b.setAttribute('aria-expanded', 'false'); });
    openMenuKey = null;
  }

  function openMenu(key, btn) {
    closeAllMenus();
    var panel = document.querySelector('.mb-dropdown[data-panel="' + key + '"]');
    if (!panel) return;
    var rect = btn.getBoundingClientRect();
    panel.style.left = rect.left + 'px';
    panel.style.right = 'auto';
    if (key === 'apple') { panel.style.left = '8px'; }
    panel.classList.add('show');
    btn.classList.add('mb-open');
    btn.setAttribute('aria-expanded', 'true');
    openMenuKey = key;

    if (key === 'window') populateWindowMenu(panel);
  }

  function populateWindowMenu(panel) {
    var openWins = windows.filter(function (w) { return w.classList.contains('open'); });
    if (!openWins.length) {
      panel.innerHTML = '<div class="mb-dd-empty">No windows open</div>';
      return;
    }
    panel.innerHTML = openWins.map(function (w) {
      var label = w.getAttribute('data-app') || winKeyOf(w);
      var titleEl = w.querySelector('.win-title');
      var title = titleEl ? titleEl.textContent : label;
      return '<button class="mb-dd-item mb-dd-window-item" role="menuitem" data-win="' + w.id + '"><span class="running-pip"></span>' + title + '</button>';
    }).join('');
    panel.querySelectorAll('[data-win]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var win = document.getElementById(btn.getAttribute('data-win'));
        if (win) { win.classList.add('show'); bringToFront(win); }
        closeAllMenus();
      });
    });
  }

  menuButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var key = btn.getAttribute('data-menu');
      if (openMenuKey === key) { closeAllMenus(); }
      else { openMenu(key, btn); }
    });
  });

  document.addEventListener('click', function () { closeAllMenus(); });
  document.querySelectorAll('.mb-dropdown').forEach(function (dd) {
    dd.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  /* ---- Dropdown item actions ---- */
  document.querySelectorAll('.mb-dd-item[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.getAttribute('data-action');
      if (action === 'open') {
        var id = btn.getAttribute('data-open');
        openWindow(id, dockButtonFor(id) || null);
      } else if (action === 'toggle-theme') {
        toggleTheme();
      } else if (action === 'restart') {
        document.documentElement.style.transition = 'opacity .4s ease';
        document.documentElement.style.opacity = '0';
        setTimeout(function () { location.reload(); }, 400);
      } else if (action === 'close-front') {
        var top = topmostWindow();
        if (top) closeWindow(top);
      } else if (action === 'copy-email') {
        var email = 'agarwalpraharsh@gmail.com';
        if (navigator.clipboard) navigator.clipboard.writeText(email).catch(function () { });
        btn.textContent = 'Copied ✓';
        setTimeout(function () { btn.textContent = 'Copy Email Address'; }, 1400);
      } else if (action === 'tile') {
        tileOpenWindows();
      }
      closeAllMenus();
    });
  });

  document.getElementById('themeToggle').addEventListener('click', function (e) {
    e.stopPropagation();
    toggleTheme();
  });

  function tileOpenWindows() {
    if (!isDesktopWidth()) return;
    var openWins = windows.filter(function (w) { return w.classList.contains('open'); });
    if (!openWins.length) return;
    var cols = Math.ceil(Math.sqrt(openWins.length));
    var rows = Math.ceil(openWins.length / cols);
    var areaTop = 40, areaLeft = 12;
    var availW = window.innerWidth - areaLeft * 2;
    var availH = window.innerHeight - areaTop - 90;
    var cellW = availW / cols, cellH = availH / rows;
    openWins.forEach(function (w, i) {
      w.classList.remove('maximized');
      var col = i % cols, row = Math.floor(i / cols);
      w.style.left = (areaLeft + col * cellW + 8) + 'px';
      w.style.top = (areaTop + row * cellH + 8) + 'px';
      w.style.width = Math.max(320, cellW - 16) + 'px';
      w.style.height = Math.max(220, cellH - 16) + 'px';
    });
  }

  /* ============ KEYBOARD SHORTCUTS ============ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllMenus();
      var top = topmostWindow();
      if (top) closeWindow(top);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') {
      var t = topmostWindow();
      if (t) { e.preventDefault(); closeWindow(t); }
    }
  });

})();
