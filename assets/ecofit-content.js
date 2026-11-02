(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.eco-reading-progress');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  const revealed = [...document.querySelectorAll('[data-reveal]')];
  let observer;
  let pendingFrame = 0;

  // Observe once; content is never hidden unless the observer is available.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -25px 0px' });
    root.classList.add('eco-motion');
    revealed.forEach((element, index) => {
      if (!element.closest('.eco-hero')) element.style.setProperty('--reveal-delay', `${Math.min(index % 3 * 65, 130)}ms`);
      observer.observe(element);
    });
  }

  function drawScroll() {
    pendingFrame = 0;
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(1, root.scrollHeight - viewportHeight);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, window.scrollY / maxScroll)})`;
    if (reducedMotion.matches || document.hidden) return;
    const mobile = window.innerWidth <= 760;
    // Read all positions before writing transforms to avoid repeated layout work.
    const positions = parallaxItems.map(element => element.getBoundingClientRect());
    positions.forEach((bounds, index) => {
      if (bounds.bottom < -150 || bounds.top > viewportHeight + 150) return;
      const element = parallaxItems[index];
      const distance = Number(element.dataset.parallax) * (mobile ? .4 : 1);
      const position = (viewportHeight / 2 - (bounds.top + bounds.height / 2)) / viewportHeight;
      element.style.transform = `translate3d(0,${Math.max(-1, Math.min(1, position)) * distance}px,0)`;
    });
  }
  function scheduleScroll() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(drawScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('load', scheduleScroll, { once: true });
  document.addEventListener('visibilitychange', scheduleScroll);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      root.classList.remove('eco-motion');
      observer?.disconnect();
      parallaxItems.forEach(element => element.style.removeProperty('transform'));
    }
    scheduleScroll();
  });
  scheduleScroll();

  // The material explorer works with click, touch and native keyboard buttons.
  const selectors = [...document.querySelectorAll('[data-lab-select]')];
  const images = [...document.querySelectorAll('[data-lab-image]')];
  const indexLabel = document.querySelector('.eco-photo-index');
  function selectMaterial(index) {
    selectors.forEach((button, current) => {
      const active = current === index;
      button.setAttribute('aria-expanded', String(active));
      button.closest('.eco-accordion-item').classList.toggle('is-active', active);
      document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
    });
    images.forEach((image, current) => {
      image.classList.toggle('is-active', current === index);
      image.setAttribute('aria-hidden', String(current !== index));
    });
    if (indexLabel) indexLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
    scheduleScroll();
  }
  selectors.forEach((button, index) => {
    button.addEventListener('click', () => selectMaterial(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? selectors.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + selectors.length) % selectors.length;
      selectors[next].focus();
    });
  });
})();
