(() => {
  const heroSlides = [
    {
      file: 'ecofit-lifestyle-banner.webp',
      alt: 'Hai người mẫu Ecofit trong trang phục thể thao ngoài trời.',
    },
    {
      file: 'ecofit-white-tee-detail.webp',
      alt: 'Vận động viên mặc đúng mẫu áo Ecofit trắng gạo cổ tim với hai sọc hồng nhạt.',
    },
    {
      file: 'ecofit-white-tee-campaign.webp',
      alt: 'Người mẫu nam và nữ mặc áo Ecofit trắng cổ tim với sọc hồng nhạt.',
    },
  ];

  const imageSizes = {
    'ecofit-lifestyle-banner.webp': [960, 363],
    'ecofit-hero-lockup.webp': [609, 208],
    'ecofit-logo.png': [1450, 736],
    'ecofit-bamboo-polo.webp': [590, 332],
    'ecofit-bamboo-polo-sharp.webp': [1672, 941],
    'ecofit-bamboo-material.webp': [590, 332],
    'ecofit-collection.webp': [1086, 1448],
    'ecofit-tee-material.webp': [1122, 1402],
    'ecofit-athleisure.webp': [1086, 1448],
    'ecofit-green-sportswear.webp': [1672, 941],
    'ecofit-tee-runner.webp': [1774, 887],
    'ecofit-white-tee-detail.webp': [2022, 778],
    'ecofit-white-tee-campaign.webp': [2020, 779],
  };

  const image = (src, alt, loading = 'lazy') => {
    const img = document.createElement('img');
    if (src === 'ecofit-bamboo-polo-sharp.webp') {
      img.srcset = '/images/ecofit-bamboo-polo-sharp-900.webp 900w, /images/ecofit-bamboo-polo-sharp.webp 1672w';
      img.sizes = '(max-width: 760px) calc(100vw - 32px), min(790px, 90vw)';
    }
    img.src = `/images/${src}`;
    img.alt = alt;
    img.loading = loading;
    img.decoding = 'async';
    const [width, height] = imageSizes[src] || [];
    if (width && height) {
      img.width = width;
      img.height = height;
    }
    return img;
  };

  const figure = (src, alt, className = '') => {
    const item = document.createElement('figure');
    item.className = `ecofit-story-image ${className}`.trim();
    item.append(image(src, alt));
    return item;
  };

  const card = (src, alt, title, description) => {
    const item = document.createElement('article');
    item.className = 'ecofit-story-card';
    item.append(figure(src, alt));

    const copy = document.createElement('div');
    copy.className = 'ecofit-story-card-copy';
    const heading = document.createElement('h3');
    heading.textContent = title;
    const text = document.createElement('p');
    text.textContent = description;
    copy.append(heading, text);
    item.append(copy);
    return item;
  };

  const makeImageHotspot = (position, label, tip, modifier = '', number = '') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = ('ecofit-tee-hotspot ' + modifier).trim();
    button.style.setProperty('--hotspot-x', position[0]);
    button.style.setProperty('--hotspot-y', position[1]);
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', 'false');
    const index = document.createElement('span');
    index.className = 'ecofit-tee-hotspot-index';
    index.textContent = number;
    const text = document.createElement('span');
    text.className = 'ecofit-tee-hotspot-tip';
    text.textContent = tip;
    button.append(index, text);
    button.addEventListener('click', () => {
      const wasOpen = button.classList.contains('is-open');
      button.parentElement.querySelectorAll('.ecofit-tee-hotspot').forEach((other) => {
        other.classList.remove('is-open');
        other.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        button.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
    return button;
  };

  function buildHero() {
    const section = document.createElement('section');
    section.id = 'eco-home';
    section.className = 'ecofit-hero';
    section.setAttribute('aria-label', 'Bộ ảnh Ecofit');

    const track = document.createElement('div');
    track.className = 'ecofit-hero-track';
    track.setAttribute('aria-live', 'off');
    const slides = heroSlides.map((slide, index) => {
      const frame = document.createElement('div');
      frame.className = `ecofit-hero-slide${index === 0 ? ' is-active' : ''}`;
      frame.setAttribute('aria-hidden', String(index !== 0));
      const slideImage = image(slide.file, slide.alt, index === 0 ? 'eager' : 'lazy');
      slideImage.fetchPriority = index === 0 ? 'high' : 'low';
      frame.append(slideImage);
      track.append(frame);
      return frame;
    });

    const brand = document.createElement('div');
    brand.className = 'ecofit-hero-brand';
    brand.dataset.slide = '0';
    brand.setAttribute('role', 'group');
    brand.setAttribute('aria-label', 'Ecofit. Play Better. Live Greener. Athleisure for everyday movement.');
    brand.setAttribute('aria-hidden', 'true');
    const lockup = image('ecofit-hero-lockup.webp', '', 'eager');
    lockup.className = 'ecofit-hero-lockup';
    lockup.setAttribute('aria-hidden', 'true');
    lockup.fetchPriority = 'high';
    brand.append(lockup);

    const controls = document.createElement('div');
    controls.className = 'ecofit-hero-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Điều khiển ảnh giới thiệu');

    const makeIcon = (kind) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.classList.add('ecofit-hero-control-icon');
      if (kind === 'pause') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M8 5v14M16 5v14');
        svg.append(path);
      } else if (kind === 'play') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'm8 5 11 7-11 7z');
        path.setAttribute('fill', 'currentColor');
        svg.append(path);
      } else {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', kind === 'previous' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6');
        svg.append(path);
      }
      return svg;
    };

    const pause = document.createElement('button');
    pause.type = 'button';
    pause.className = 'ecofit-hero-control';
    pause.setAttribute('aria-label', 'Tạm dừng trình chiếu');
    pause.setAttribute('aria-pressed', 'false');
    pause.append(makeIcon('pause'));

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'ecofit-hero-control';
    previous.setAttribute('aria-label', 'Ảnh trước');
    previous.append(makeIcon('previous'));

    const counter = document.createElement('span');
    counter.className = 'ecofit-hero-counter';
    counter.setAttribute('aria-live', 'polite');
    counter.textContent = `1 / ${slides.length}`;

    const progress = document.createElement('div');
    progress.className = 'ecofit-hero-progress';
    progress.setAttribute('aria-hidden', 'true');
    const progressSegments = slides.map((_, index) => {
      const segment = document.createElement('span');
      segment.className = `ecofit-hero-progress-segment${index === 0 ? ' is-active' : ''}`;
      progress.append(segment);
      return segment;
    });

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'ecofit-hero-control';
    next.setAttribute('aria-label', 'Ảnh tiếp theo');
    next.append(makeIcon('next'));

    controls.append(previous, progress, counter, pause, next);
    section.append(track, brand, controls);

    let current = 0;
    let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let heroInView = true;
    let pendingTransition = 0;
    let transitionTimer = 0;
    const syncPauseControl = () => {
      pause.setAttribute('aria-pressed', String(userPaused));
      pause.setAttribute('aria-label', userPaused ? 'Phát trình chiếu' : 'Tạm dừng trình chiếu');
      pause.replaceChildren(makeIcon(userPaused ? 'play' : 'pause'));
    };
    syncPauseControl();
    const warmHeroImages = () => {
      slides.slice(1).forEach((frame) => {
        const slideImage = frame.querySelector('img');
        slideImage.loading = 'eager';
        if (slideImage.decode) slideImage.decode().catch(() => {});
      });
    };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(warmHeroImages, { timeout: 1200 });
    } else {
      window.setTimeout(warmHeroImages, 400);
    }

    const show = (index) => {
      const nextIndex = (index + slides.length) % slides.length;
      const request = ++pendingTransition;
      const nextImage = slides[nextIndex].querySelector('img');
      nextImage.loading = 'eager';
      const ready = nextImage.decode ? nextImage.decode().catch(() => {}) : Promise.resolve();
      ready.then(() => {
        if (request !== pendingTransition) return;
        const previousSlide = slides[current];
        current = nextIndex;
        brand.dataset.slide = String(current);
        brand.classList.toggle('is-visible', current !== 0);
        brand.setAttribute('aria-hidden', String(current === 0));
        slides.forEach((slide, slideIndex) => {
          slide.classList.remove('is-transitioning');
          slide.classList.remove('is-outgoing');
          const active = slideIndex === current;
          slide.classList.toggle('is-active', active);
          slide.setAttribute('aria-hidden', String(!active));
        });
        window.clearTimeout(transitionTimer);
        previousSlide.classList.add('is-outgoing');
        const activeSlide = slides[current];
        activeSlide.classList.add('is-transitioning');
        transitionTimer = window.setTimeout(() => {
          activeSlide.classList.remove('is-transitioning');
          previousSlide.classList.remove('is-outgoing');
        }, 760);
        progressSegments.forEach((segment, segmentIndex) => {
          segment.classList.toggle('is-active', segmentIndex === current);
        });
        counter.textContent = `${current + 1} / ${slides.length}`;
      });
    };

    previous.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    pause.addEventListener('click', () => {
      userPaused = !userPaused;
      syncPauseControl();
    });
    if ('IntersectionObserver' in window) {
      const heroVisibility = new IntersectionObserver(([entry]) => {
        heroInView = Boolean(entry?.isIntersecting);
      });
      heroVisibility.observe(section);
    }

    window.setInterval(() => {
      if (!userPaused && heroInView && !document.hidden) show(current + 1);
    }, 5000);

    return section;
  }

  function buildStories() {
    const section = document.createElement('section');
    section.id = 'ecofit-stories';
    section.className = 'ecofit-stories';
    section.setAttribute('aria-labelledby', 'ecofit-stories-title');

    const inner = document.createElement('div');
    inner.className = 'ecofit-stories-inner';

    const intro = document.createElement('header');
    intro.className = 'ecofit-stories-intro';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'ecofit-stories-eyebrow';
    eyebrow.textContent = 'ECOFIT JOURNAL';
    const title = document.createElement('h2');
    title.id = 'ecofit-stories-title';
    title.textContent = 'Chuyển động xanh, chất liệu mới';
    const description = document.createElement('p');
    description.textContent = 'Khám phá câu chuyện Ecofit qua chất liệu, thiết kế và phong cách thể thao mỗi ngày.';
    intro.append(eyebrow, title, description);
    inner.append(intro);

    const teeMaterialCard = card(
      'ecofit-tee-material.webp',
      'Áo Ecofit trắng gạo cổ tim với hai sọc hồng nhạt, chụp cận chất vải.',
      'Chất liệu áo Ecofit',
      'Vải bamboo prime màu trắng gạo, cổ tim tay ngắn và hai sọc hồng ruốc đúng theo mẫu áo.'
    );
    teeMaterialCard.id = 'ecofit-materials';
    teeMaterialCard.classList.add('ecofit-tee-material-card', 'ecofit-tee-feature');
    const teeMaterialImage = teeMaterialCard.querySelector('.ecofit-story-image');
    teeMaterialImage.append(
      makeImageHotspot(['21%', '22%'], 'Xem chi tiết sọc vai', 'Hai sọc hồng nhạt chạy từ vai xuống tay áo.', '', '01'),
      makeImageHotspot(['63%', '37%'], 'Xem chi tiết cổ áo', 'Cổ tim gọn trên nền vải trắng gạo.', 'ecofit-tee-hotspot--neckline', '02')
    );
    inner.append(teeMaterialCard);

    const collectionHeading = document.createElement('div');
    collectionHeading.className = 'ecofit-story-group-heading ecofit-collection-heading';
    const collectionTitle = document.createElement('h3');
    collectionTitle.textContent = 'Phong cách Ecofit';
    const collectionDescription = document.createElement('p');
    collectionDescription.textContent = 'Thiết kế năng động cùng cảm hứng sử dụng chất liệu có trách nhiệm.';
    collectionHeading.append(collectionTitle, collectionDescription);
    inner.append(collectionHeading);

    const collectionGrid = document.createElement('div');
    collectionGrid.className = 'ecofit-collection-grid';
    collectionGrid.append(
      card('ecofit-collection.webp', 'Các hình ảnh phong cách thể thao Ecofit từ bộ ảnh thương hiệu.', 'Bộ sưu tập', 'Tinh thần thể thao và phong cách sống Ecofit.'),
      card('ecofit-athleisure.webp', 'Ảnh phong cách athleisure Ecofit trong bộ ảnh thương hiệu.', 'Athleisure', 'Phong cách thể thao cho nhịp sống năng động.')
    );
    inner.append(collectionGrid);

    const closing = document.createElement('div');
    closing.className = 'ecofit-story-banner ecofit-closing-banner';
    closing.append(figure(
      'ecofit-green-sportswear.webp',
      'Ecofit Green Sportswear — trang phục thể thao bền vững trong hoạt động ngoài trời.'
    ));
    const exploreLink = document.createElement('a');
    exploreLink.className = 'ecofit-story-cta';
    exploreLink.href = '/san-pham/ao-ecofit/';
    exploreLink.textContent = 'Khám phá sản phẩm';
    closing.append(exploreLink);
    inner.append(closing);
    section.append(inner);
    return section;
  }

  function updateProducts(main) {
    const shop = main.querySelector('#shop-products');
    if (!shop) return;
    if (shop.dataset.ecofitProductReady === 'true') return;

    const heading = shop.querySelector('h1, h2, h3');
    if (heading && heading.textContent.trim() !== 'Sản phẩm Ecofit') heading.textContent = 'Sản phẩm Ecofit';

    for (const leaf of shop.querySelectorAll('*')) {
      if (leaf.children.length !== 0) continue;
      const text = leaf.textContent.trim();
      if (text === '0 items') leaf.hidden = true;
      if (text === 'Product collection coming soon.') leaf.textContent = 'Sản phẩm Ecofit sẽ sớm có mặt tại đây.';
      if (text === 'This space is ready for the new products and images.') leaf.textContent = 'Thông tin sản phẩm đang được chuẩn bị.';
    }
  }

  function buildFooter() {
    const footer = document.createElement('footer');
    footer.id = 'ecofit-footer';
    footer.className = 'ecofit-footer';
    footer.innerHTML = `
      <div class="ecofit-footer-inner">
        <a class="ecofit-footer-brand" href="#eco-home" aria-label="Ecofit — đầu trang">ECOFIT</a>
        <p>Play Better. Live Greener.</p>
        <nav aria-label="Liên kết Ecofit">
          <a href="/#eco-home">Khám phá</a>
          <a href="/san-pham/ao-ecofit/">Sản phẩm</a>
          <a href="/#ecofit-materials">Chất liệu</a>
        </nav>
        <div class="ecofit-footer-contact">
          <p class="ecofit-footer-contact-title">Liên hệ &amp; kết nối</p>
          <div class="ecofit-footer-social-links">
            <a href="https://www.facebook.com/profile.php?id=61594559625360" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.99 22 12c0-5.523-4.477-10-10-10Z"/></svg><span>Facebook Ecofit ↗</span></a>
            <a href="https://www.tiktok.com/@ecofit.wear?is_from_webapp=1&amp;sender_device=pc" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.9 2.88 2.88 2.88 0 1 1 .4-5.73V9.35a6.4 6.4 0 1 0 5.95 6.32V9.01a8.2 8.2 0 0 0 4.8 1.54V7.1a4.8 4.8 0 0 1-1.03-.41Z"/></svg><span>TikTok @ecofit.wear ↗</span></a>
            <a href="https://zalo.me/0868060624" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M5.2 4.5h13.6A2.2 2.2 0 0 1 21 6.7v9.6a2.2 2.2 0 0 1-2.2 2.2h-7L5 21v-2.5h-.2a2.2 2.2 0 0 1-2.2-2.2V6.7a2.2 2.2 0 0 1 2.6-2.2Z"/><path fill="currentColor" d="M7.7 8h8.6v1.7l-5 4.3h5.1v2H7.8v-1.7l5-4.3H7.7z"/></svg><span>Zalo 0868 060 624 ↗</span></a>
          </div>
        </div>
        <small>© 2026 Ecofit. All rights reserved.</small>
      </div>`;
    return footer;
  }

  function observeRevealTargets(targets) {
    if (!targets.length) return;

    targets.forEach((target, targetIndex) => {
      target.classList.add('ecofit-reveal');
      const group = target.closest('.ecofit-bamboo-grid, .ecofit-collection-grid');
      if (group) {
        const index = [...group.children].indexOf(target);
        const fromSide = group.classList.contains('ecofit-bamboo-grid');
        const bambooFromRight = target.classList.contains('ecofit-bamboo-image--second');
        target.style.setProperty('--ecofit-reveal-x', fromSide ? (bambooFromRight ? '96px' : '-96px') : (index % 2 ? '56px' : '-56px'));
        target.style.setProperty('--ecofit-reveal-y', '0px');
        target.style.setProperty('--ecofit-reveal-delay', `${Math.max(0, Math.min(index, 2)) * 110}ms`);
      } else {
        target.style.setProperty('--ecofit-reveal-delay', `${Math.min(targetIndex, 3) * 75}ms`);
      }
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('ecofit-revealed'));
      return;
    }

    let remaining = targets.length;
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('ecofit-reveal-pending');
        entry.target.classList.add('ecofit-revealed');
        revealObserver.unobserve(entry.target);
        remaining -= 1;
      });
      if (remaining === 0) {
        revealObserver.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    targets.forEach((target) => {
      target.classList.add('ecofit-reveal-pending');
      revealObserver.observe(target);
    });
  }

  function initializeScrollEffects(section) {
    const targets = [...section.querySelectorAll(
      '.ecofit-stories-intro, .ecofit-story-group-heading, .ecofit-bamboo-grid > .ecofit-story-image, .ecofit-tee-feature, .ecofit-collection-grid > .ecofit-story-card, .ecofit-closing-banner'
    )];
    observeRevealTargets(targets);
  }

  function initializeProductEffects(main) {
    const shop = main.querySelector('#shop-products');
    if (!shop || shop.dataset.ecofitMotionReady === 'true') return;
    const targets = [...shop.querySelectorAll(
      'h1, h2, h3, p, article, [data-product-card], [class*="product-card"], img'
    )].slice(0, 12);
    if (!targets.length) return;
    shop.dataset.ecofitMotionReady = 'true';
    shop.classList.add('ecofit-shop-motion');
    observeRevealTargets(targets);
  }

  function applyExplore() {
    const root = document.getElementById('root');
    const main = root?.querySelector('main');
    if (!root || !main) return false;

    let hero = main.querySelector('#eco-home');
    if (!hero || !hero.classList.contains('ecofit-hero')) {
      const oldHero = hero || main.firstElementChild;
      if (oldHero) {
        if (oldHero.id === 'eco-home') oldHero.removeAttribute('id');
        oldHero.dataset.ecofitLegacyNike = 'true';
      }
      hero = buildHero();
      main.insertBefore(hero, oldHero?.parentElement === main ? oldHero : main.firstElementChild);
    }

    main.querySelector('#ecofit-motion-story')?.remove();

    if (!main.querySelector('#ecofit-stories')) {
      const stories = buildStories();
      hero.insertAdjacentElement('afterend', stories);
      initializeScrollEffects(stories);
    }

    const materials = main.querySelector('.ecofit-bamboo-group');
    if (materials && materials.id !== 'ecofit-materials') materials.id = 'ecofit-materials';
    updateProducts(main);
    initializeProductEffects(main);

    const legacyFooter = root.querySelector('footer');
    if (legacyFooter) legacyFooter.dataset.ecofitLegacyNike = 'true';
    if (!document.getElementById('ecofit-footer')) {
      root.insertAdjacentElement('afterend', buildFooter());
    }

    document.documentElement.classList.add('ecofit-explore-ready');
    return true;
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (applyExplore()) observer.disconnect();
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (applyExplore()) observer.disconnect();
})();
