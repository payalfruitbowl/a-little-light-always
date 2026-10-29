/**
 * A LITTLE LIGHT, ALWAYS — Master Application & Scroll Choreography
 * Connects 3D WebGL Camera, Chapter Narrative Cards, Procedural Audio, and Multi-Input Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Engine
  let world = null;
  try {
    world = new DiwaliCinematicWorld('webgl-container');
  } catch (e) {
    console.error("Three.js World initialization error:", e);
  }

  // 2. DOM Elements
  const progressBar = document.getElementById('scroll-progress-bar');
  const sceneLayers = document.querySelectorAll('.scene-layer');
  const chapterDots = document.querySelectorAll('.chapter-dot');
  const dayBadge = document.querySelector('.day-badge');
  const dayBadgeNum = document.querySelector('.day-badge-number');
  const dayBadgeTitle = document.querySelector('.day-badge-title');
  const dayBadgeTime = document.querySelector('.day-badge-time');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
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

  // Chapter Timeline Definitions
  const chapters = [
    { id: 'prologue', name: 'Prologue', day: '', time: 'Welcome', start: 0.00, end: 0.12 },
    { id: 'dhanteras', name: 'Dhanteras', day: 'DAY 1', time: 'Warm Afternoon', start: 0.12, end: 0.32 },
    { id: 'kali-chaudas', name: 'Kali Chaudas', day: 'DAY 2', time: 'Early Morning', start: 0.32, end: 0.52 },
    { id: 'diwali', name: 'Diwali', day: 'DAY 3', time: 'Festive Evening', start: 0.52, end: 0.72 },
    { id: 'bestu-varas', name: 'Bestu Varas', day: 'DAY 4', time: 'New Year Dawn', start: 0.72, end: 0.88 },
    { id: 'bhai-bij', name: 'Bhai Bij', day: 'DAY 5', time: 'Golden Twilight', start: 0.88, end: 1.00 }
  ];

  let currentActiveIndex = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let isReducedMotion = false;

  // Helper: compute document scroll range
  function getMaxScroll() {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    const winHeight = window.innerHeight || 800;
    return Math.max(docHeight - winHeight, 1);
  }

  // 3. Multi-Input Scroll Sync

  // A. Native Window Scroll Event
  function onNativeScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const maxScroll = getMaxScroll();
    targetProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
  }
  window.addEventListener('scroll', onNativeScroll, { passive: true });

  // B. Direct Mouse Wheel Event (works everywhere even if fixed layers intercept native bubbling)
  window.addEventListener('wheel', (e) => {
    const maxScroll = getMaxScroll();
    const delta = e.deltaY;
    // Advance target progress
    const step = delta / (maxScroll * 0.9);
    targetProgress = Math.min(Math.max(targetProgress + step, 0), 1);

    // Sync native window scroll so scrollbar reflects position
    window.scrollTo({
      top: targetProgress * maxScroll,
      behavior: 'auto'
    });
  }, { passive: true });

  // C. Mobile Touch Swipe Event
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      const maxScroll = getMaxScroll();
      const step = deltaY / (maxScroll * 0.75);
      targetProgress = Math.min(Math.max(targetProgress + step, 0), 1);

      window.scrollTo({
        top: targetProgress * maxScroll,
        behavior: 'auto'
      });
    }
  }, { passive: true });

  // D. Click on Scroll Indicator / "Scroll to Begin"
  if (scrollIndicator) {
    scrollIndicator.style.cursor = 'pointer';
    scrollIndicator.addEventListener('click', () => {
      const maxScroll = getMaxScroll();
      const targetY = chapters[1].start * maxScroll + 50;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  }

  // 4. Continuous RAF Animation & Interpolation Loop
  function renderLoop() {
    requestAnimationFrame(renderLoop);

    // Smooth inertia interpolation (faster if reduced motion)
    const lerpFactor = isReducedMotion ? 0.3 : 0.09;
    currentProgress += (targetProgress - currentProgress) * lerpFactor;

    // A. Update 3D World Camera
    if (world) {
      world.updateScene(currentProgress);
    }

    // B. Update Golden Progress Bar
    if (progressBar) {
      progressBar.style.width = (currentProgress * 100) + '%';
    }

    // C. Determine Active Chapter
    let activeIdx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (currentProgress >= chapters[i].start && currentProgress <= chapters[i].end) {
        activeIdx = i;
        break;
      }
    }
    if (currentProgress >= chapters[chapters.length - 1].start) {
      activeIdx = chapters.length - 1;
    }

    if (activeIdx !== currentActiveIndex) {
      currentActiveIndex = activeIdx;
      onChapterChanged(activeIdx);
    }

    // D. Soft Opacity & Transform Fade for Story Text Layers
    sceneLayers.forEach((layer, idx) => {
      const ch = chapters[idx];
      const mid = (ch.start + ch.end) / 2;
      const span = (ch.end - ch.start) / 2;
      const dist = Math.abs(currentProgress - mid);

      if (dist < span * 1.15) {
        layer.classList.add('is-active');
        const fade = Math.max(0, 1 - (dist / (span * 0.95)));
        layer.style.opacity = Math.min(1, fade * 1.5);
        layer.style.pointerEvents = fade > 0.4 ? 'auto' : 'none';
      } else {
        layer.classList.remove('is-active');
        layer.style.opacity = '0';
        layer.style.pointerEvents = 'none';
      }
    });

    // E. Story-Driven Transitions (Wipes)
    // 1. Ribbon Wipe (Dhanteras -> Kali Chaudas ~0.28 to 0.35)
    if (ribbonWipe) {
      if (currentProgress > 0.27 && currentProgress < 0.35) {
        const w = 1 - Math.abs(currentProgress - 0.31) / 0.04;
        ribbonWipe.style.opacity = Math.max(0, w * 0.96);
      } else {
        ribbonWipe.style.opacity = '0';
      }
    }

    // 2. Sunlight Bloom Wipe (Kali Chaudas -> Diwali ~0.48 to 0.55)
    if (sunlightFlood) {
      if (currentProgress > 0.47 && currentProgress < 0.55) {
        const w = 1 - Math.abs(currentProgress - 0.51) / 0.04;
        sunlightFlood.style.opacity = Math.max(0, w * 0.94);
      } else {
        sunlightFlood.style.opacity = '0';
      }
    }

    // 3. Velvet Box Sweep Wipe (Diwali -> Bestu Varas ~0.68 to 0.75)
    if (boxSweep) {
      if (currentProgress > 0.67 && currentProgress < 0.75) {
        const w = 1 - Math.abs(currentProgress - 0.71) / 0.04;
        boxSweep.style.opacity = Math.max(0, w * 0.96);
      } else {
        boxSweep.style.opacity = '0';
      }
    }
  }

  // Start RAF loop
  renderLoop();
  onNativeScroll(); // Initial pass

  // 5. Chapter Change Handler
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

    // Update Floating Day Badge
    if (dayBadge) {
      if (idx === 0) {
        dayBadge.style.opacity = '0';
      } else {
        dayBadge.style.opacity = '1';
        if (dayBadgeNum) dayBadgeNum.textContent = idx.toString();
        if (dayBadgeTitle) dayBadgeTitle.textContent = ch.name;
        if (dayBadgeTime) dayBadgeTime.textContent = ch.time;
      }
    }

    // Audio Cue
    if (window.diwaliAudio) {
      window.diwaliAudio.onChapterEnter(idx);
    }
  }

  // 6. Click Navigation on Chapter Dots
  chapterDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(dot.getAttribute('data-chapter'), 10);
      const ch = chapters[targetIdx];
      const maxScroll = getMaxScroll();
      const targetY = (ch.start + 0.03) * maxScroll;

      targetProgress = ch.start + 0.03;
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    });
  });

  // 7. Ambient Audio Toggle
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.diwaliAudio) {
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
      }
    });
  }

  // 8. Reduced Motion Toggle
  if (motionToggleBtn) {
    motionToggleBtn.addEventListener('click', () => {
      isReducedMotion = !isReducedMotion;
      document.body.classList.toggle('reduced-motion', isReducedMotion);
      motionToggleBtn.querySelector('.btn-label').textContent = isReducedMotion ? 'Motion: Off' : 'Motion: On';
      showToast(isReducedMotion ? 'Reduced Motion Enabled' : 'Cinematic Motion Enabled');
    });
  }

  // 9. Interactive Dhanteras Gift Modal
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

  // 10. Web Share API & Clipboard Fallback
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

  // 11. Replay Button
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      targetProgress = 0;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      showToast('Beginning the Story Anew...');
    });
  }

  // 12. Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    const maxScroll = getMaxScroll();
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      targetProgress = Math.min(targetProgress + 0.12, 1);
      window.scrollTo({ top: targetProgress * maxScroll, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      targetProgress = Math.max(targetProgress - 0.12, 0);
      window.scrollTo({ top: targetProgress * maxScroll, behavior: 'smooth' });
    } else if (['0', '1', '2', '3', '4', '5'].includes(e.key)) {
      const targetCh = parseInt(e.key, 10);
      const ch = chapters[targetCh];
      targetProgress = ch.start + 0.02;
      window.scrollTo({
        top: targetProgress * maxScroll,
        behavior: 'smooth'
      });
    }
  });
});
