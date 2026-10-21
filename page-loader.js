const pageConfig = {
  about: { title: 'About Samuel', sections: [] },
  community: { title: 'Our Community', sections: [] },
  priorities: { title: 'Priorities', sections: ['#priorities'] },
  contribute: { title: 'Contribute', sections: ['#contribute', '#report', '#show-support'] },
  agenda: { title: 'Samuel’s Agenda', sections: [] },
  contact: { title: 'Contact', sections: [] }
};

const pageName = document.body.dataset.page;
const config = pageConfig[pageName];
const outlet = document.querySelector('#page-content');
outlet.textContent = '';
let enteringTransition;
try {
  if (sessionStorage.getItem('campaign-page-transition') === '1') {
    sessionStorage.removeItem('campaign-page-transition');
    enteringTransition = document.createElement('div');
    enteringTransition.className = 'page-transition is-active is-entering';
    document.body.append(enteringTransition);
  }
} catch {
  // Navigation remains available when session storage is unavailable.
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || link.target === '_blank' || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const href = link.getAttribute('href');
  if (!href || !href.endsWith('.html') || href === window.location.pathname.split('/').pop()) return;
  event.preventDefault();
  const transition = document.createElement('div');
  transition.className = 'page-transition';
  const bounds = link.getBoundingClientRect();
  transition.style.setProperty('--transition-x', `${Math.round(bounds.left + bounds.width / 2)}px`);
  transition.style.setProperty('--transition-y', `${Math.round(bounds.top + bounds.height / 2)}px`);
  document.body.append(transition);
  requestAnimationFrame(() => transition.classList.add('is-active'));
  try { sessionStorage.setItem('campaign-page-transition', '1'); } catch {}
  window.setTimeout(() => { window.location.href = href; }, 590);
});

if (window.location.protocol === 'file:') {
  window.location.replace(`http://localhost:8080/${pageName}.html`);
}

function updateLinks(root) {
  const destinations = {
    '#home': 'index.html', '#about': 'about.html', '#community': 'community.html',
    '#priorities': 'priorities.html', '#contribute': 'contribute.html',
    '#updates': 'agenda.html', '#contact': 'contact.html'
  };
  root.querySelectorAll('a[href]').forEach(link => {
    const destination = destinations[link.getAttribute('href')];
    if (destination) link.setAttribute('href', destination);
  });
}

function initialisePriorityCards() {
  const focusGrid = outlet.querySelector('.focus-grid');
  const detail = outlet.querySelector('.floating-focus-detail');
  if (!focusGrid || !detail) return;

  const cards = [...focusGrid.querySelectorAll('article')];
  const closeButton = detail.querySelector('.focus-detail-close');
  const title = detail.querySelector('.focus-detail-title');
  const copy = detail.querySelector('.focus-detail-copy');
  const why = detail.querySelector('.focus-detail-why');
  const outcome = detail.querySelector('.focus-detail-outcome');
  const list = detail.querySelector('.focus-detail-list');
  const details = {
    community: {
      title: 'A stronger community voice',
      copy: 'Samuel’s community agenda starts with listening consistently and keeping residents informed about what follows.',
      why: 'People need a reliable way to raise local concerns, understand decisions, and see whether promised follow-up actually happens.',
      points: ['Hold accessible listening forums across Embu', 'Document recurring community priorities', 'Publish clear follow-up and progress updates', 'Create channels for residents who cannot attend meetings', 'Bring community evidence into policy discussions'],
      outcome: 'A visible record of local priorities, regular public feedback, and clearer follow-through on issues raised by residents.'
    },
    education: {
      title: 'Education and opportunity',
      copy: 'Samuel’s education agenda centres on useful information, mentorship, skills, and stronger opportunities for young people.',
      why: 'Young people need clearer pathways from learning to useful skills, employment, enterprise, and informed citizenship.',
      points: ['Support mentorship and career-guidance networks', 'Promote practical and digital-skills initiatives', 'Encourage civic education and informed participation', 'Connect learning with local enterprise opportunities', 'Advocate for inclusive access to learning resources'],
      outcome: 'More residents accessing useful information, mentorship, skills, and pathways to opportunity.'
    },
    leadership: {
      title: 'Accountable public leadership',
      copy: 'Samuel intends to make transparency, explanation, and measurable follow-through central to his leadership approach.',
      why: 'Public trust grows when leaders explain their positions, invite participation, use resources responsibly, and report honestly on progress.',
      points: ['Communicate decisions and positions clearly', 'Encourage participation in policy discussions', 'Report progress against published priorities', 'Promote responsible use of public resources', 'Build partnerships around shared community goals'],
      outcome: 'Clearer public communication, measurable commitments, wider participation, and leadership that can be held to account.'
    }
  };
  let selectedCard = focusGrid.querySelector('.featured') || cards[0];

  const highlight = card => cards.forEach(item => item.classList.toggle('featured', item === card));
  const close = () => {
    detail.hidden = true;
    selectedCard.focus({ preventScroll: true });
  };
  const show = card => {
    const item = details[card.dataset.focus];
    if (!item) return;
    selectedCard = card;
    highlight(card);
    title.textContent = item.title;
    copy.textContent = item.copy;
    why.textContent = item.why;
    outcome.textContent = item.outcome;
    list.replaceChildren(...item.points.map(point => {
      const listItem = document.createElement('li');
      listItem.textContent = point;
      return listItem;
    }));
    detail.hidden = false;
    detail.classList.remove('detail-pulse');
    requestAnimationFrame(() => detail.classList.add('detail-pulse'));
    closeButton.focus({ preventScroll: true });
  };

  cards.forEach(card => {
    card.tabIndex = 0;
    card.addEventListener('pointerenter', () => highlight(card));
    card.addEventListener('focus', () => highlight(card));
    card.addEventListener('click', () => show(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        show(card);
      }
    });
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    });
  });
  focusGrid.addEventListener('pointerleave', () => highlight(selectedCard));
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !detail.hidden) close();
  });
}

function initialiseBallot() {
  const ballotButton = outlet.querySelector('.interactive-ballot');
  if (!ballotButton) return;

  const ballotMessage = outlet.querySelector('.ballot-message');
  const supportCount = outlet.querySelector('.support-count');
  const ballotCount = outlet.querySelector('.ballot-count-value');
  const particleLayer = outlet.querySelector('.support-particles');
  const supportKey = 'samuel-nyaga-support-taps';
  let taps = 0;

  try {
    taps = Number.parseInt(localStorage.getItem(supportKey) || '0', 10);
    if (Number.isNaN(taps)) taps = 0;
  } catch {
    taps = 0;
  }

  supportCount.textContent = String(taps);
  ballotCount.textContent = String(taps);

  ballotButton.addEventListener('click', () => {
    if (ballotButton.classList.contains('casting')) return;
    ballotButton.classList.add('casting');
    taps += 1;
    try {
      localStorage.setItem(supportKey, String(taps));
    } catch {
      // The ballot remains interactive when browser storage is unavailable.
    }
    supportCount.textContent = String(taps);
    ballotCount.textContent = String(taps);
    ballotMessage.textContent = 'Thank you—your support has been counted on this device.';

    const colors = ['#ffffff', '#e31325', '#6f78d4', '#f7b846'];
    for (let index = 0; index < 18; index += 1) {
      const particle = document.createElement('span');
      particle.style.setProperty('--x', `${Math.round(Math.random() * 240 - 120)}px`);
      particle.style.setProperty('--y', `${Math.round(Math.random() * -170 - 40)}px`);
      particle.style.setProperty('--r', `${Math.round(Math.random() * 300 - 150)}deg`);
      particle.style.background = colors[index % colors.length];
      particleLayer.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove());
    }
    window.setTimeout(() => ballotButton.classList.remove('casting'), 1200);
  });
}

function initialiseAgendaCards() {
  const cards = [...outlet.querySelectorAll('.agenda-card')];
  if (!cards.length) return;
  const panel = document.createElement('section');
  panel.className = 'agenda-float-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.innerHTML = '<button class="agenda-float-close" type="button" aria-label="Close commitment details">×</button><p class="agenda-float-label"></p><h2></h2><p class="agenda-float-summary"></p><div class="agenda-float-actions"></div>';
  document.body.append(panel);
  const closeButton = panel.querySelector('.agenda-float-close');
  let activeCard;

  const close = () => {
    panel.classList.remove('is-open');
    window.setTimeout(() => { panel.hidden = true; }, 220);
    activeCard?.focus({ preventScroll: true });
  };
  const open = card => {
    activeCard = card;
    panel.querySelector('.agenda-float-label').textContent = card.querySelector('small').textContent;
    panel.querySelector('h2').textContent = card.querySelector('h3').textContent;
    panel.querySelector('.agenda-float-summary').textContent = card.querySelector('.agenda-card-copy > p').textContent;
    panel.querySelector('.agenda-float-actions').replaceChildren(card.querySelector('.commitment-details ul').cloneNode(true));
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    closeButton.focus({ preventScroll: true });
  };

  cards.forEach(card => {
    const button = card.querySelector('.commitment-toggle');
    card.tabIndex = 0;
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
      card.style.setProperty('--tilt-x', `${((event.clientY - bounds.top) / bounds.height - .5) * -4}deg`);
      card.style.setProperty('--tilt-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 4}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(card);
      }
    });
    button.addEventListener('click', event => {
      event.stopPropagation();
      open(card);
    });
  });
  closeButton.addEventListener('click', close);
  panel.addEventListener('click', event => { if (event.target === panel) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) close();
  });
}

function initialiseContactForm() {
  const form = outlet.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const status = form.querySelector('.contact-form-status');
    if (!name || !message) {
      status.textContent = 'Please enter your name and message.';
      return;
    }
    const phone = '254732441905';
    const text = `CONTACT REQUEST%0AName: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(String(formData.get('email') || '').trim())}%0A%0A${encodeURIComponent(message)}`;
    status.textContent = 'Opening WhatsApp…';
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  });
}

fetch('index.html')
  .then(response => {
    if (!response.ok) throw new Error('Unable to load page content.');
    return response.text();
  })
  .then(html => {
    const source = new DOMParser().parseFromString(html, 'text/html');
    const header = source.querySelector('header');
    const footer = source.querySelector('footer');
    updateLinks(header);
    updateLinks(footer);
    header.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `${pageName}.html`);
    });
    document.body.prepend(header);
    header.classList.add('page-fade-in');
    const menuButton = header.querySelector('.menu-toggle');
    const navLinks = header.querySelector('.nav-links');
    menuButton.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
    config.sections.forEach(selector => {
      const section = source.querySelector(selector);
      if (section) {
        updateLinks(section);
        outlet.append(section);
      }
    });
    if (pageName === 'about') {
      outlet.innerHTML = `<section class="about-editorial"><div class="about-editorial-hero"><div class="about-hero-side"><span>SN</span><small>Samuel Nyagah Ireri</small></div><div class="about-hero-main"><p class="about-page-label">01 — About Samuel</p><div class="about-name-wall" aria-hidden="true">Samuel<br>Nyagah</div><img class="about-hero-portrait" src="assets/samuel-nyaga-ireri-portrait.png" alt="Samuel Nyagah Ireri"><div class="about-hero-copy"><p class="kicker light"><span></span>Leadership that listens</p><h1>Built with the <em>community.</em></h1><p>Samuel Nyagah Ireri is building a people-centred platform for informed participation, opportunity, and accountable leadership in Embu.</p><a class="about-scroll-link" href="#about-story">Explore Samuel’s story <span>↓</span></a></div></div></div><section class="about-story" id="about-story"><div class="about-story-intro"><p class="kicker"><span></span>Community first</p><h2>A leader shaped by <em>listening.</em></h2><p>Samuel believes that progress begins by keeping local priorities visible, treating people with respect, and turning discussion into practical follow-through.</p></div><div class="about-story-photo"><img src="assets/facebook-page-profile.jpg" alt="Samuel Nyagah Ireri smiling"><span class="about-photo-caption">Together for Embu</span></div><div class="about-story-copy"><p>His approach brings residents, ideas, and opportunity into the same conversation. Through advocacy, public participation, and a commitment to clear communication, he works to help every community voice count.</p><div class="about-signature">Samuel Nyagah Ireri</div><div class="about-facts"><div><strong>People</strong><span>At the centre</span></div><div><strong>Listening</strong><span>The approach</span></div><div><strong>Progress</strong><span>The goal</span></div></div></div></section><section class="about-quote"><div class="about-quote-portrait"><img src="assets/samuel-nyaga-ireri-portrait.png" alt="Samuel Nyagah Ireri"></div><div class="about-quote-copy"><span>“</span><blockquote>Leadership begins by making space for every voice to be heard.</blockquote><p>Samuel Nyagah Ireri</p></div></section><section class="about-principles"><div><p class="kicker light"><span></span>What guides the work</p><h2>Purpose with <em>accountability.</em></h2><p>Every commitment is grounded in a practical belief: people deserve leadership that is visible, honest, and answerable.</p></div><div class="principles-list"><article><b>01</b><h3>Listen</h3><p>Make room for local voices and lived experience.</p></article><article><b>02</b><h3>Connect</h3><p>Bring residents, ideas, and opportunities together.</p></article><article><b>03</b><h3>Act</h3><p>Turn community priorities into visible follow-through.</p></article></div></section></section>`;
    }
    if (pageName === 'community') {
      outlet.innerHTML = `<section class="community-editorial"><div class="community-hero"><div class="community-wall" aria-hidden="true">COMMUNITY</div><p class="community-page-label">Together for Embu</p><div class="community-hero-card"><div class="community-hero-image"><img src="Judie%20Sheila/IMG_8706.JPG.jpeg" alt="Samuel speaking with community members"><span class="community-image-label">People first</span></div><div class="community-hero-copy"><p class="kicker light"><span></span>Our growing community</p><div class="community-members"><span><img src="Judie%20Sheila/IMG_8691.JPG.jpeg" alt=""></span><span><img src="Judie%20Sheila/IMG_8698.JPG.jpeg" alt=""></span><span><img src="Judie%20Sheila/IMG_8708.JPG.jpeg" alt=""></span><b>One community,<br>many voices</b></div><h1>Progress starts when <em>people connect.</em></h1><p>Fans of Samuel Nyagah Ireri brings together residents and supporters who believe in open conversation, shared responsibility, and leadership close to the people.</p><div class="community-hero-actions"><a class="community-primary" href="https://www.facebook.com/people/Fans-of-Samuel-Nyaga-Ireri/61579205035349/" target="_blank" rel="noopener noreferrer">Join the community <span>↗</span></a><a class="community-secondary" href="contribute.html">Share your voice</a></div></div></div></div><section class="community-programs"><p class="community-section-label">How we take part</p><div class="community-program-heading"><p class="kicker light"><span></span>Community in action</p><h2>Make every voice <em>count.</em></h2><p>Choose a way to connect, contribute, and help keep Embu’s priorities moving forward.</p></div><div class="community-program-grid"><article><img src="Judie%20Sheila/IMG_8687.JPG.jpeg" alt="Residents meeting at a community forum"><div><span>01</span><h3>Listen together</h3><p>Join forums that make room for local issues, ideas, and lived experience.</p><a href="agenda.html">Explore the agenda <b>→</b></a></div></article><article class="community-program-featured"><img src="Judie%20Sheila/IMG_8690.JPG.jpeg" alt="Community members gathered together"><div><span>02</span><h3>Share what matters</h3><p>Report a local concern or suggest an improvement your community needs.</p><a href="contribute.html">Send a message <b>→</b></a></div></article><article><img src="Judie%20Sheila/IMG_9249.JPG.jpeg" alt="Samuel addressing an outdoor community gathering"><div><span>03</span><h3>Stay involved</h3><p>Follow community updates, campaign moments, and opportunities to take part.</p><a href="https://www.facebook.com/people/Fans-of-Samuel-Nyaga-Ireri/61579205035349/" target="_blank" rel="noopener noreferrer">Follow on Facebook <b>↗</b></a></div></article></div></section><section class="community-statement"><div><p class="kicker"><span></span>Built through listening</p><h2>“A stronger Embu is built by <em>everyone.</em>”</h2></div><p>Our movement turns conversation into visible follow-through—connecting residents, local priorities, and the leadership needed to move them forward.</p></section><section class="community-impact"><div class="impact-intro"><span>Our community</span><p>Across Embu, people are joining a conversation rooted in participation, opportunity, and accountable leadership.</p></div><div class="impact-stats"><div><strong>People</strong><span>At the heart of every decision</span></div><div><strong>Listening</strong><span>Guides every conversation</span></div><div><strong>Action</strong><span>Turns priorities into progress</span></div><div><strong>Embu</strong><span>Our shared home</span></div></div></section></section>`;
    }
    if (pageName === 'agenda') {
      outlet.innerHTML = `<section class="agenda-editorial"><div class="agenda-top-links"><a href="community.html"><b>↗</b> Our community</a><a href="priorities.html"><b>◆</b> Priorities</a><a href="contribute.html"><b>+</b> Support the agenda</a></div><div class="agenda-hero"><p class="kicker light"><span></span>Samuel’s agenda</p><div class="agenda-hero-grid"><div><h1>A practical plan for a <em>stronger Embu.</em></h1><p>Every commitment starts with listening, grows through opportunity, and is measured by accountable follow-through.</p></div><div class="agenda-portrait"><div class="agenda-portrait-glow"></div><img src="assets/samuel-nyaga-ireri-portrait.png" alt="Samuel Nyagah Ireri"><span>People first</span></div><div class="agenda-intro"><strong>Clear purpose.<br>Visible action.</strong><p>Samuel’s agenda brings community priorities into the public conversation and keeps progress answerable to residents.</p></div></div></div><div class="agenda-statement"><h2>Leadership should listen, explain, and <em>deliver.</em></h2><p>This is a community-centred agenda for participation, education, opportunity, and responsible public leadership.</p></div><section class="agenda-actions"><p class="agenda-section-label">What Samuel intends to champion</p><h2>Our commitments</h2><div class="agenda-card-grid"><article class="agenda-card"><div class="agenda-card-image"><img src="Judie%20Sheila/IMG_8687.JPG.jpeg" alt="Residents at a community forum"><span>01</span></div><div class="agenda-card-copy"><small>Listening · Representation</small><h3>A stronger voice for local priorities</h3><p>Make regular listening and public follow-up part of the leadership approach.</p><button class="commitment-toggle" type="button" aria-expanded="false">View intended actions <span>+</span></button><div class="commitment-details" hidden><ul><li>Hold accessible community listening forums</li><li>Document recurring local priorities</li><li>Share clear follow-up updates with residents</li></ul></div></div></article><article class="agenda-card agenda-card-featured"><div class="agenda-card-image"><img src="Judie%20Sheila/IMG_8708.JPG.jpeg" alt="Samuel speaking at a community event"><span>02</span></div><div class="agenda-card-copy"><small>Education · Youth</small><h3>Skills, mentorship, and opportunity</h3><p>Champion practical learning and clearer pathways for young people.</p><button class="commitment-toggle" type="button" aria-expanded="false">View intended actions <span>+</span></button><div class="commitment-details" hidden><ul><li>Promote mentorship and career guidance</li><li>Support practical and digital-skills initiatives</li><li>Connect learning with enterprise opportunities</li></ul></div></div></article><article class="agenda-card"><div class="agenda-card-image"><img src="Judie%20Sheila/IMG_9249.JPG.jpeg" alt="Samuel addressing residents"><span>03</span></div><div class="agenda-card-copy"><small>Leadership · Policy</small><h3>Transparent and responsible leadership</h3><p>Put service, explanation, and accountability at the centre.</p><button class="commitment-toggle" type="button" aria-expanded="false">View intended actions <span>+</span></button><div class="commitment-details" hidden><ul><li>Communicate decisions and positions clearly</li><li>Encourage public participation in policy discussion</li><li>Report progress against published priorities</li></ul></div></div></article></div></section><section class="agenda-contact"><h2>Be part of the <em>conversation.</em></h2><div><a href="contact.html">Contact Samuel’s team <b>↗</b></a><a href="https://www.facebook.com/people/Fans-of-Samuel-Nyaga-Ireri/61579205035349/" target="_blank" rel="noopener noreferrer">Follow the community <b>↗</b></a></div></section></section>`;
    }
    if (pageName === 'contact') {
      outlet.innerHTML = `<section class="contact-page"><div class="contact-circuit circuit-left" aria-hidden="true"></div><div class="contact-circuit circuit-right" aria-hidden="true"></div><div class="container contact-layout"><div class="contact-intro"><p class="contact-eyebrow"><span>◉</span> Contact</p><h1>Let’s keep in <em>touch.</em></h1><p>Have a question, a local priority to share, or an idea for a stronger Embu? Samuel’s community team is ready to listen.</p><div class="contact-methods"><a class="contact-method" href="tel:+254732441905"><span class="contact-icon">☎</span><span><strong>Call us</strong><small>+254 732 441 905</small></span><b>↗</b></a><a class="contact-method" href="https://wa.me/254732441905" target="_blank" rel="noopener noreferrer"><span class="contact-icon">◔</span><span><strong>WhatsApp us</strong><small>Message Samuel’s community team</small></span><b>↗</b></a><a class="contact-method" href="https://www.facebook.com/people/Fans-of-Samuel-Nyaga-Ireri/61579205035349/" target="_blank" rel="noopener noreferrer"><span class="contact-icon">f</span><span><strong>Follow our community</strong><small>Fans of Samuel Nyagah Ireri</small></span><b>↗</b></a><div class="contact-method contact-location"><span class="contact-icon">⌖</span><span><strong>Our location</strong><small>Embu, Kenya</small></span></div></div></div><div class="contact-form-wrap"><div class="contact-form-heading"><span>Send a message</span><p>We’ll continue the conversation on WhatsApp.</p></div><form class="contact-form"><label>Your name<input type="text" name="name" placeholder="Your full name" required></label><label>Email address <small>(optional)</small><input type="email" name="email" placeholder="you@example.com"></label><label>Your message<textarea name="message" rows="7" placeholder="How can we help?" required></textarea></label><button class="contact-submit" type="submit">Send via WhatsApp <span>↗</span></button><p class="contact-form-status" role="status" aria-live="polite"></p></form></div></div></section>`;
    }
    outlet.after(footer);
    footer.classList.add('page-fade-in');
    if (pageName === 'priorities') initialisePriorityCards();
    if (pageName === 'contribute') initialiseBallot();
    if (pageName === 'agenda') initialiseAgendaCards();
    if (pageName === 'contact') initialiseContactForm();
    outlet.classList.remove('page-loading');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      outlet.classList.add('page-ready');
      header.classList.add('is-visible');
      footer.classList.add('is-visible');
      if (enteringTransition) {
        enteringTransition.classList.add('is-leaving');
        window.setTimeout(() => enteringTransition.remove(), 460);
      }
    }));
    document.title = `${config.title} | Samuel Nyagah Ireri`;
  })
  .catch(() => {
    outlet.innerHTML = '<div class="container page-error"><h1>Unable to load this page.</h1><p>Please refresh and try again.</p><p><a class="button button-red" href="index.html">Go home</a></p></div>';
  });
