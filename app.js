/**
 * A LITTLE LIGHT, ALWAYS — Master Application & Scroll Choreography
 * Connects 3D WebGL Camera, Chapter Narrative Cards, Procedural Audio, and Interactive Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Engine
  const world = new DiwaliCinematicWorld('webgl-container');

  // 2. DOM Elements
  const scrollContainer = document.querySelector('.story-scroll-container');
  const sceneLayers = document.querySelectorAll('.scene-layer');
  const chapterDots = document.querySelectorAll('.chapter-dot');
  const dayBadge = document.querySelector('.day-badge');
  const dayBadgeNum = document.querySelector('.day-badge-number');
  const dayBadgeTitle = document.querySelector('.day-badge-title');
  const dayBadgeTime = document.querySelector('.day-badge-time');
  
  // Transition Wipes
  const ribbonWipe = document.querySelector('.ribbon-wipe-overlay');
  const sunlightFlood = document.querySelector('.sunlight-flood-overlay');
  const boxSweep = document.querySelector('.box-sweep-overlay');

  // Controls & Modals
  const soundToggleBtn = document.getElementById('sound-toggle');
  const motionToggleBtn = document.getElementById('motion-toggle');
  const toastNotice = document.getElementById('toast-notice');
  const giftModal = document.getElementById('gift-modal');
  const openGiftBtn = document.getElementById('open-gift-btn');
  const closeGiftBtn = document.getElementById('close-gift-modal');
  const shareBtn = document.getElementById('share-btn');
  const replayBtn = document.getElementById('replay-btn');

  // Chapter Metadata
  const chapters = [
    { id: 'prologue', name: 'Prologue', day: '', time: 'Welcome', start: 0.00, end: 0.08 },
    { id: 'dhanteras', name: 'Dhanteras', day: 'DAY 1', time: 'Warm Afternoon', start: 0.08, end: 0.28 },
    { id: 'kali-chaudas', name: 'Kali Chaudas', day: 'DAY 2', time: 'Early Morning', start: 0.28, end: 0.48 },
    { id: 'diwali', name: 'Diwali', day: 'DAY 3', time: 'Festive Evening', start: 0.48, end: 0.68 },
    { id: 'bestu-varas', name: 'Bestu Varas', day: 'DAY 4', time: 'New Year Dawn', start: 0.68, end: 0.86 },
    { id: 'bhai-bij', name: 'Bhai Bij', day: 'DAY 5', time: 'Golden Twilight', start: 0.86, end: 1.00 }
  ];

  let currentActiveIndex = 0;
  let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 3. Scroll Synchronization Loop
  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Update 3D Camera & Scene
    world.updateScene(progress);

    // Determine Active Chapter
    let activeIdx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (progress >= chapters[i].start && progress <= chapters[i].end) {
        activeIdx = i;
        break;
      }
    }
    if (progress > chapters[chapters.length - 1].start) {
      activeIdx = chapters.length - 1;
    }

    if (activeIdx !== currentActiveIndex) {
      currentActiveIndex = activeIdx;
      onChapterChanged(activeIdx);
    }

    // Sync Text Layer Visibilities with soft opacity fades
    sceneLayers.forEach((layer, idx) => {
      const ch = chapters[idx];
      // Compute normalized fade envelope inside chapter range
      const mid = (ch.start + ch.end) / 2;
      const span = (ch.end - ch.start) / 2;
      const dist = Math.abs(progress - mid);
      const isVisible = dist < span * 1.05;

      if (isVisible) {
        layer.classList.add('is-active');
        const fade = Math.max(0, 1 - (dist / (span * 0.95)));
        layer.style.opacity = Math.min(1, fade * 1.4);
      } else {
        layer.classList.remove('is-active');
        layer.style.opacity = 0;
      }
    });

    // Story-Driven Transition Wipes
    // 1. Ribbon Wipe (End of Dhanteras ~0.25 to 0.29)
    if (progress > 0.24 && progress < 0.30) {
      const w = 1 - Math.abs(progress - 0.27) / 0.03;
      ribbonWipe.style.opacity = Math.max(0, w * 0.95);
    } else {
      ribbonWipe.style.opacity = 0;
    }

    // 2. Sunlight Flood Wipe (Kali Chaudas window open ~0.44 to 0.50)
    if (progress > 0.44 && progress < 0.50) {
      const w = 1 - Math.abs(progress - 0.47) / 0.03;
      sunlightFlood.style.opacity = Math.max(0, w * 0.92);
    } else {
      sunlightFlood.style.opacity = 0;
    }

    // 3. Velvet Box Sweep Wipe (Diwali gift pass ~0.64 to 0.70)
    if (progress > 0.64 && progress < 0.70) {
      const w = 1 - Math.abs(progress - 0.67) / 0.03;
      boxSweep.style.opacity = Math.max(0, w * 0.95);
    } else {
      boxSweep.style.opacity = 0;
    }
  }

  function onChapterChanged(idx) {
    const ch = chapters[idx];

    // Update Bottom Navigation Pills
    chapterDots.forEach((dot, dotIdx) => {
      if (dotIdx === idx) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'step');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });

    // Update Day Badge
    if (idx === 0) {
      dayBadge.style.opacity = 0;
    } else {
      dayBadge.style.opacity = 1;
      dayBadgeNum.textContent = idx.toString();
      dayBadgeTitle.textContent = ch.name;
      dayBadgeTime.textContent = ch.time;
    }

    // Audio Cue
    if (window.diwaliAudio) {
      window.diwaliAudio.onChapterEnter(idx);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial pass

  // 4. Click Navigation on Chapter Dots
  chapterDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = parseInt(dot.getAttribute('data-chapter'), 10);
      const ch = chapters[targetIdx];
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (ch.start + 0.03) * maxScroll;

      window.scrollTo({
        top: targetY,
        behavior: isReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  // 5. Sound Toggle Button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isAudible = window.diwaliAudio.toggle();
      if (isAudible) {
        soundToggleBtn.classList.add('sound-active');
        soundToggleBtn.querySelector('.btn-label').textContent = 'Sound On';
        showToast('Ambient Tanpura & Bells Playing');
      } else {
        soundToggleBtn.classList.remove('sound-active');
        soundToggleBtn.querySelector('.btn-label').textContent = 'Sound Off';
        showToast('Sound Muted');
      }
    });
  }

  // 6. Reduced Motion Toggle
  if (motionToggleBtn) {
    motionToggleBtn.addEventListener('click', () => {
      isReducedMotion = !isReducedMotion;
      document.body.classList.toggle('reduced-motion', isReducedMotion);
      motionToggleBtn.querySelector('.btn-label').textContent = isReducedMotion ? 'Motion: Off' : 'Motion: On';
      showToast(isReducedMotion ? 'Reduced Motion Enabled' : 'Cinematic Motion Enabled');
    });
  }

  // 7. Interactive Dhanteras Gift Modal
  if (openGiftBtn) {
    openGiftBtn.addEventListener('click', () => {
      giftModal.classList.add('open');
      if (window.diwaliAudio) {
        window.diwaliAudio.playTempleBell(880);
      }
    });
  }
  if (closeGiftBtn) {
    closeGiftBtn.addEventListener('click', () => {
      giftModal.classList.remove('open');
    });
  }
  if (giftModal) {
    giftModal.addEventListener('click', (e) => {
      if (e.target === giftModal) {
        giftModal.classList.remove('open');
      }
    });
  }

  // 8. Functional Share Button (Web Share API with Clipboard Fallback)
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'A Little Light, Always — A Diwali Story by Payal',
        text: '“Wishing you and your loved ones a beautiful Diwali and a wonderful year ahead.” — A cinematic 5-day story by Payal.',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          showToast('Thank you for sharing the Diwali light!');
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyToClipboard();
          }
        }
      } else {
        copyToClipboard();
      }
    });
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Greeting Link Copied to Clipboard!');
    }).catch(() => {
      showToast('A Little Light, Always — Link: ' + window.location.href);
    });
  }

  function showToast(message) {
    if (!toastNotice) return;
    toastNotice.textContent = message;
    toastNotice.classList.add('show');
    clearTimeout(toastNotice._timer);
    toastNotice._timer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3200);
  }

  // 9. Replay Button
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: isReducedMotion ? 'auto' : 'smooth'
      });
      showToast('Beginning the Story Anew...');
    });
  }

  // 10. Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      // Step forward half a screen
      window.scrollBy({ top: window.innerHeight * 0.65, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      window.scrollBy({ top: -window.innerHeight * 0.65, behavior: 'smooth' });
    } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
      const targetCh = parseInt(e.key, 10);
      const ch = chapters[targetCh];
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: (ch.start + 0.02) * maxScroll,
        behavior: 'smooth'
      });
    }
  });
});
