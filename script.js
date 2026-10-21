const heroLinks = document.querySelector('.hero-actions');
if (heroLinks) {
  heroLinks.querySelector('.button-red').setAttribute('href', 'about.html');
  heroLinks.querySelector('.play-link').setAttribute('href', 'priorities.html');
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || link.target === '_blank' || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const href = link.getAttribute('href');
  if (!href || !href.endsWith('.html')) return;
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

try {
  if (sessionStorage.getItem('campaign-page-transition') === '1') {
    sessionStorage.removeItem('campaign-page-transition');
    const enteringTransition = document.createElement('div');
    enteringTransition.className = 'page-transition is-active is-entering';
    document.body.append(enteringTransition);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      enteringTransition.classList.add('is-leaving');
      window.setTimeout(() => enteringTransition.remove(), 460);
    }));
  }
} catch {
  // Navigation remains available when session storage is unavailable.
}

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
const navigation = [...document.querySelectorAll('.nav-links a')];
const sections = navigation
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navigation.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%' });
sections.forEach(section => observer.observe(section));
const copyButton = document.querySelector('.copy-number');
copyButton.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(copyButton.dataset.number);
    status.textContent = 'Number copied.';
  } catch {
    status.textContent = 'Copy +254 732 441905';
  }
});

const ballotButton = document.querySelector('.interactive-ballot');
const ballotMessage = document.querySelector('.ballot-message');
const supportCount = document.querySelector('.support-count');
const ballotCount = document.querySelector('.ballot-count-value');
const particleLayer = document.querySelector('.support-particles');
const supportKey = 'samuel-nyaga-support-taps';
let taps = 0;

try {
  taps = Number.parseInt(localStorage.getItem(supportKey) || '0', 10);
} catch {
  taps = 0;
}

supportCount.textContent = String(taps);
ballotCount.textContent = String(taps);

function celebrateSupport() {
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
}

ballotButton.addEventListener('click', () => {
  if (ballotButton.classList.contains('casting')) return;
  ballotButton.classList.add('casting');
  taps += 1;
  try {
    localStorage.setItem(supportKey, String(taps));
  } catch {
    // The interaction still works when browser storage is unavailable.
  }
  supportCount.textContent = String(taps);
  ballotCount.textContent = String(taps);
  ballotMessage.textContent = 'Thank you—your support has been counted on this device.';
  celebrateSupport();
  window.setTimeout(() => ballotButton.classList.remove('casting'), 1200);
});

const focusGrid = document.querySelector('.focus-grid');
const focusCards = [...focusGrid.querySelectorAll('article')];
const defaultFocusCard = focusGrid.querySelector('.featured');
let selectedFocusCard = defaultFocusCard;
const focusDetailTitle = document.querySelector('.focus-detail-title');
const focusDetailCopy = document.querySelector('.focus-detail-copy');
const focusDetailList = document.querySelector('.focus-detail-list');
const focusDetailWhy = document.querySelector('.focus-detail-why');
const focusDetailOutcome = document.querySelector('.focus-detail-outcome');
const floatingFocusDetail = document.querySelector('.floating-focus-detail');
const focusDetailClose = document.querySelector('.focus-detail-close');
const focusDetails = {
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

function highlightFocusCard(card) {
  focusCards.forEach(item => item.classList.toggle('featured', item === card));
}

function showFocusDetails(card) {
  const detail = focusDetails[card.dataset.focus];
  if (!detail) return;
  focusDetailTitle.textContent = detail.title;
  focusDetailCopy.textContent = detail.copy;
  focusDetailWhy.textContent = detail.why;
  focusDetailOutcome.textContent = detail.outcome;
  focusDetailList.replaceChildren(...detail.points.map(point => {
    const item = document.createElement('li');
    item.textContent = point;
    return item;
  }));
  floatingFocusDetail.hidden = false;
  floatingFocusDetail.classList.remove('detail-pulse');
  requestAnimationFrame(() => floatingFocusDetail.classList.add('detail-pulse'));
  focusDetailClose.focus({ preventScroll: true });
}

function closeFocusDetails() {
  floatingFocusDetail.hidden = true;
  selectedFocusCard?.focus({ preventScroll: true });
}

focusDetailClose.addEventListener('click', closeFocusDetails);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !floatingFocusDetail.hidden) closeFocusDetails();
});

focusCards.forEach(card => {
  card.tabIndex = 0;

  card.addEventListener('pointerenter', () => highlightFocusCard(card));
  card.addEventListener('focus', () => highlightFocusCard(card));
  card.addEventListener('click', () => {
    selectedFocusCard = card;
    highlightFocusCard(card);
    showFocusDetails(card);
  });
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectedFocusCard = card;
    highlightFocusCard(card);
    showFocusDetails(card);
  });
  card.addEventListener('pointermove', event => {
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  });
});

focusGrid.addEventListener('pointerleave', () => highlightFocusCard(selectedFocusCard));

document.querySelectorAll('.commitment-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const details = button.nextElementSibling;
    const opening = details.hidden;
    details.hidden = !opening;
    button.setAttribute('aria-expanded', String(opening));
    button.querySelector('span').textContent = opening ? '−' : '+';
  });
});

const whatsappReportForm = document.querySelector('.whatsapp-report-form');

if (whatsappReportForm) {
  whatsappReportForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(whatsappReportForm);
    const reportType = String(formData.get('reportType') || '').trim();
    const location = String(formData.get('location') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const status = whatsappReportForm.querySelector('.report-status');

    if (!reportType || !location || !message) {
      status.textContent = 'Please complete all three fields before continuing.';
      return;
    }

    const whatsappMessage = [
      'COMMUNITY REPORT',
      `Type: ${reportType}`,
      `Area: ${location}`,
      '',
      message,
      '',
      'Sent through the Samuel Nyagah Ireri community website.'
    ].join('\n');

    status.textContent = 'Opening WhatsApp with your report…';
    const whatsappUrl = `https://wa.me/254732441905?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}
