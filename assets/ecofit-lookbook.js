const looks = [
  {
    label: 'Mỗi ngày',
    heading: 'Mỗi ngày,\nnhịp riêng.',
    description: 'Từ những bước chân đầu ngày đến cuộc hẹn quen thuộc, mang theo một nhịp sống thật riêng.',
    image: '/images/ecofit-white-tee-campaign.webp',
    width: 2020,
    height: 779,
    alt: 'Hai người mẫu mặc áo Ecofit trắng gạo với hai sọc hồng khi đi dạo ngoài trời.',
  },
  {
    label: 'Vận động',
    heading: 'Bắt đầu\ntừ một bước.',
    description: 'Một khoảng thời gian dành cho chuyển động, với chiếc áo Ecofit cùng bạn trên từng bước chạy.',
    image: '/images/ecofit-tee-runner.webp',
    width: 1774,
    height: 887,
    alt: 'Người mẫu mặc áo Ecofit trắng gạo cổ tim khi chạy ngoài trời.',
  },
  {
    label: 'Nhịp riêng',
    heading: 'Chuyển động\ntheo cách bạn.',
    description: 'Cổ tim gọn, sắc trắng gạo và hai sọc hồng — những chi tiết tạo nên dấu ấn Ecofit.',
    image: '/images/ecofit-white-tee-detail.webp',
    width: 2022,
    height: 778,
    alt: 'Nhìn gần áo Ecofit trắng gạo với cổ tim và hai sọc hồng trên vai.',
  },
];

export function initializeLookbook(stories) {
  const journal = stories.querySelector('#ecofit-motion-journal');
  if (!journal || stories.querySelector('#ecofit-lookbook')) return;

  const section = document.createElement('section');
  section.id = 'ecofit-lookbook';
  section.className = 'eco-lookbook';
  section.setAttribute('aria-labelledby', 'eco-lookbook-title');
  section.innerHTML = `
    <div class="eco-lookbook-heading">
      <div>
        <p class="eco-lookbook-eyebrow">ECOFIT / LOOKBOOK 01</p>
        <h2 id="eco-lookbook-title">Một chiếc áo.<br><em>Ba nhịp sống.</em></h2>
      </div>
      <p>Trong những khoảnh khắc khác nhau, chọn chuyển động theo cách của bạn.</p>
    </div>
    <div class="eco-lookbook-shell">
      <figure class="eco-lookbook-media">
        <div class="eco-lookbook-picture" data-lookbook-picture tabindex="0" role="group" aria-label="Bộ ảnh lookbook. Kéo ngang hoặc dùng phím mũi tên để đổi ảnh.">
          ${looks.map((look, index) => `<img class="eco-lookbook-image${index === 0 ? ' is-active' : ''}" data-lookbook-image="${index}" src="${look.image}" width="${look.width}" height="${look.height}" loading="lazy" decoding="async" draggable="false" alt="${look.alt}" aria-hidden="${index !== 0}">`).join('')}
        </div>
        <figcaption><span>KÉO ĐỂ ĐỔI ẢNH ↔</span><span data-lookbook-count aria-live="polite">01 / 03</span></figcaption>
      </figure>
      <div class="eco-lookbook-panel">
        <p class="eco-lookbook-panel-kicker">MỘT CHIẾC ÁO / NHIỀU CÁCH MẶC</p>
        <div class="eco-lookbook-copy" aria-live="polite">
          <h3 data-lookbook-heading></h3>
          <p data-lookbook-description></p>
        </div>
        <div class="eco-lookbook-options" role="group" aria-label="Chọn nhịp sống">
          ${looks.map((look, index) => `<button type="button" data-lookbook-option="${index}" aria-pressed="${index === 0}"><span>0${index + 1}</span><strong>${look.label}</strong><i aria-hidden="true">↗</i></button>`).join('')}
        </div>
        <a class="eco-lookbook-link" href="/san-pham/ao-ecofit/">Khám phá chiếc áo <span aria-hidden="true">↗</span></a>
      </div>
    </div>`;
  journal.before(section);

  const picture = section.querySelector('[data-lookbook-picture]');
  const images = [...section.querySelectorAll('[data-lookbook-image]')];
  const buttons = [...section.querySelectorAll('[data-lookbook-option]')];
  const heading = section.querySelector('[data-lookbook-heading]');
  const description = section.querySelector('[data-lookbook-description]');
  const count = section.querySelector('[data-lookbook-count]');
  let selected = 0;
  let pointerStart = null;

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      images.forEach((image) => {
        image.loading = 'eager';
        if (typeof image.decode === 'function') image.decode().catch(() => {});
      });
      imageObserver.disconnect();
    }, { rootMargin: '350px 0px' });
    imageObserver.observe(section);
  }

  function select(index) {
    selected = (index + looks.length) % looks.length;
    images.forEach((image, imageIndex) => {
      const active = imageIndex === selected;
      image.classList.toggle('is-active', active);
      image.setAttribute('aria-hidden', String(!active));
    });
    buttons.forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === selected)));
    heading.textContent = looks[selected].heading;
    description.textContent = looks[selected].description;
    count.textContent = `0${selected + 1} / 03`;
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  picture.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    select(selected + (event.key === 'ArrowRight' ? 1 : -1));
  });
  picture.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    picture.setPointerCapture(event.pointerId);
  });
  picture.addEventListener('pointerup', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) select(selected + (dx < 0 ? 1 : -1));
  });
  picture.addEventListener('pointercancel', () => { pointerStart = null; });
  select(0);
}

export function initializeSignature(scope) {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const markers = scope.querySelectorAll('.ecofit-cinematic-eyebrow, .eco-section-line > span:first-child, .eco-lookbook-eyebrow');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('eco-signature-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  markers.forEach((marker) => observer.observe(marker));
}
