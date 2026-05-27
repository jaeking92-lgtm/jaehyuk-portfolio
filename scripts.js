const progress = document.querySelector('.progress');
const revealEls = document.querySelectorAll('.reveal');
const introScreen = document.getElementById('introScreen');
const header = document.querySelector('[data-nav]');
const zoomLayer = document.getElementById('zoomLayer');
const zoomImage = document.getElementById('zoomImage');
const zoomTitle = document.getElementById('zoomTitle');
const zoomClose = document.querySelector('.zoom-close');

document.body.classList.add('intro-active');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const introStorageKey = 'cinematicAtelierIntroPlayed';
const hasSeenIntro = (() => {
  try {
    return sessionStorage.getItem(introStorageKey) === 'true';
  } catch (error) {
    return false;
  }
})();

function closeIntro(immediate = false) {
  if (!introScreen) {
    document.body.classList.remove('intro-active');
    return;
  }
  if (immediate) {
    introScreen.style.display = 'none';
  } else {
    introScreen.classList.add('is-hidden');
    setTimeout(() => { introScreen.style.display = 'none'; }, 900);
  }
  document.body.classList.remove('intro-active');
  try {
    sessionStorage.setItem(introStorageKey, 'true');
  } catch (error) {}
}
if (reduceMotion || hasSeenIntro) closeIntro(true);
else setTimeout(() => closeIntro(false), 2450);

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.16, rootMargin:'0px 0px -6% 0px'});
revealEls.forEach(el=>observer.observe(el));

function updateProgress(){
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? (scrollY / max) * 100 : 0;
  if (progress) progress.style.width = pct + '%';
  document.documentElement.style.setProperty('--hero-y', Math.min(120, scrollY * .18) + 'px');
  header?.classList.toggle('is-scrolled', scrollY > 40);
}
addEventListener('scroll', updateProgress, {passive:true});
addEventListener('resize', updateProgress);
updateProgress();

let lastY = scrollY;
addEventListener('scroll', () => {
  if (!header || innerWidth < 720) return;
  const currentY = scrollY;
  header.classList.toggle('is-hidden', currentY > lastY && currentY > 240);
  lastY = currentY;
}, {passive:true});

window.addEventListener('pointermove', (event) => {
  const mx = (event.clientX / innerWidth - .5) * 2;
  const my = (event.clientY / innerHeight - .5) * 2;
  document.documentElement.style.setProperty('--mx', mx.toFixed(4));
  document.documentElement.style.setProperty('--my', my.toFixed(4));
}, {passive:true});

const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav a')];
const navObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id = entry.target.id;
      navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === '#' + id));
    }
  });
},{threshold:.38});
sections.forEach(section => navObserver.observe(section));

const toolsInteractive = document.querySelector('.tools-interactive');
if (toolsInteractive) {
  if (reduceMotion) {
    toolsInteractive.classList.add('tools-in');
  } else {
    const toolsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          toolsInteractive.classList.add('tools-in');
          toolsObserver.unobserve(toolsInteractive);
        }
      });
    }, { threshold:.28 });
    toolsObserver.observe(toolsInteractive);
  }
}

document.querySelectorAll('.project-visual').forEach(wrapper => {
  const img = wrapper.querySelector('img');
  if (!img) return;

  wrapper.addEventListener('mousemove', (event) => {
    const rect = wrapper.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    img.style.transform = `scale(1.035) translate(${(-x * 10).toFixed(2)}px, ${(-y * 8).toFixed(2)}px)`;
  });
  wrapper.addEventListener('mouseleave', () => {
    img.style.transform = '';
  });
  wrapper.addEventListener('click', () => {
    if (!zoomLayer || !zoomImage) return;
    zoomImage.src = img.currentSrc || img.src;
    zoomImage.alt = img.alt || '';
    if (zoomTitle) zoomTitle.textContent = wrapper.dataset.zoomTitle || img.alt || 'Project preview';
    zoomLayer.classList.add('is-open');
    zoomLayer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

function closeZoom() {
  zoomLayer?.classList.remove('is-open');
  zoomLayer?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
zoomClose?.addEventListener('click', closeZoom);
zoomLayer?.addEventListener('click', (event) => {
  if (event.target === zoomLayer) closeZoom();
});
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeZoom();
});


/* Measured Portfolio: project images cut, flow, and fuse into one composite image. */
const axisSection = document.querySelector('.project-axis-section');
const axisStage = document.querySelector('.project-axis-stage');
const axisCards = [...document.querySelectorAll('.axis-card')];
const axisGuidePath = document.getElementById('axisGuidePath');
const axisDonePath = document.getElementById('axisDonePath');
const axisCutSvg = document.querySelector('.axis-cut-svg');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
function smooth(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function range(value, start, end) {
  return clamp01((value - start) / (end - start));
}
function setAxisVar(name, value) {
  axisSection?.style.setProperty(name, value);
}
function setCardBox(card, box) {
  card.style.setProperty('--card-left', `${box.x.toFixed(2)}px`);
  card.style.setProperty('--card-top', `${box.y.toFixed(2)}px`);
  card.style.setProperty('--card-w', `${box.w.toFixed(2)}px`);
  card.style.setProperty('--card-h', `${box.h.toFixed(2)}px`);
}

let axisPathLength = 0;
function measureAxisPath() {
  if (!axisGuidePath || !axisDonePath) return;
  axisPathLength = axisGuidePath.getTotalLength();
  axisDonePath.style.strokeDasharray = axisPathLength;
  axisDonePath.style.strokeDashoffset = axisPathLength;
}

function updateAxisInteraction() {
  if (!axisSection || !axisStage || axisCards.length < 3) return;

  const rect = axisSection.getBoundingClientRect();
  const stageRect = axisStage.getBoundingClientRect();
  const stageW = stageRect.width;
  const stageH = stageRect.height;
  const scrollable = axisSection.offsetHeight - window.innerHeight;
  const globalProgress = clamp01(-rect.top / Math.max(scrollable, 1));

  const horizontalProgress = smooth(range(globalProgress, 0.00, 0.25));
  const alignProgress = smooth(range(globalProgress, 0.18, 0.35));
  const guideProgress = smooth(range(globalProgress, 0.30, 0.42));
  const traceProgress = smooth(range(globalProgress, 0.35, 0.65));
  const cutProgress = smooth(range(globalProgress, 0.35, 0.70));
  const flowProgress = smooth(range(globalProgress, 0.45, 0.75));
  const blockProgress = smooth(range(globalProgress, 0.55, 0.80));
  const pillarProgress = smooth(range(globalProgress, 0.72, 1.00));

  const cardW = Math.max(stageW * (stageW < 760 ? .64 : .5), 360);
  const cardH = Math.min(stageH * .46, Math.max(310, stageW * .31));
  const startY = stageH * .39;
  const alignedY = stageH * .40;
  const startCenters = [stageW * .82, stageW * 1.42, stageW * 2.02];
  const passCenters = [stageW * -.08, stageW * .50, stageW * 1.08];
  const alignedCenters = [stageW * .14, stageW * .50, stageW * .86];

  axisCards.forEach((card, index) => {
    const passX = lerp(startCenters[index], passCenters[index], horizontalProgress);
    const alignedX = lerp(passX, alignedCenters[index], alignProgress);
    const y = lerp(startY, alignedY, alignProgress);
    setCardBox(card, { x: alignedX, y, w: cardW, h: cardH });
  });

  const cutA = lerp(0, 10.5, cutProgress);
  const cutB = lerp(0, 15.5, cutProgress);
  const cutC = lerp(0, 8.5, cutProgress);
  setAxisVar('--card-clip-a', `${cutA.toFixed(2)}%`);
  setAxisVar('--card-clip-b', `${cutB.toFixed(2)}%`);
  setAxisVar('--card-clip-c', `${cutC.toFixed(2)}%`);
  setAxisVar('--cards-opacity', (1 - smooth(range(globalProgress, .74, .94))).toFixed(3));
  setAxisVar('--card-label-opacity', (1 - smooth(range(globalProgress, .33, .52))).toFixed(3));

  setAxisVar('--guide-opacity', guideProgress.toFixed(3));
  setAxisVar('--cut-label-opacity', guideProgress.toFixed(3));
  setAxisVar('--cursor-opacity', (traceProgress * (1 - smooth(range(globalProgress, .66, .74)))).toFixed(3));

  if (!axisPathLength) measureAxisPath();
  if (axisGuidePath && axisDonePath && axisCutSvg && axisPathLength) {
    const point = axisGuidePath.getPointAtLength(axisPathLength * traceProgress);
    const svgRect = axisCutSvg.getBoundingClientRect();
    const cursorX = svgRect.left - stageRect.left + (point.x / 1000) * svgRect.width;
    const cursorY = svgRect.top - stageRect.top + (point.y / 260) * svgRect.height;
    axisDonePath.style.strokeDashoffset = axisPathLength * (1 - traceProgress);
    setAxisVar('--cursor-x', `${cursorX.toFixed(2)}px`);
    setAxisVar('--cursor-y', `${cursorY.toFixed(2)}px`);
  }

  setAxisVar('--flow-opacity', (flowProgress * (1 - smooth(range(globalProgress, .78, .94)))).toFixed(3));
  setAxisVar('--flow-y', `${lerp(-18, 60, flowProgress).toFixed(1)}px`);
  setAxisVar('--flow-spread', `${lerp(54, 0, flowProgress).toFixed(1)}px`);

  const blockFade = 1 - smooth(range(globalProgress, .78, .92));
  setAxisVar('--block-opacity', (blockProgress * blockFade).toFixed(3));
  setAxisVar('--block-scale', lerp(.42, 1, blockProgress).toFixed(3));

  setAxisVar('--pillar-opacity', pillarProgress.toFixed(3));
  setAxisVar('--pillar-h', `${lerp(12, stageW < 760 ? 54 : 62, pillarProgress).toFixed(2)}vh`);
  setAxisVar('--pillar-w', `${lerp(stageW < 760 ? 34 : 18, stageW < 760 ? 42 : 22, pillarProgress).toFixed(2)}vw`);
  setAxisVar('--final-opacity', smooth(range(globalProgress, .86, 1.00)).toFixed(3));
}

let axisRaf = 0;
function requestAxisUpdate() {
  if (axisRaf) return;
  axisRaf = requestAnimationFrame(() => {
    axisRaf = 0;
    updateAxisInteraction();
  });
}

measureAxisPath();
addEventListener('scroll', requestAxisUpdate, {passive:true});
addEventListener('resize', () => {
  measureAxisPath();
  requestAxisUpdate();
});
requestAxisUpdate();
