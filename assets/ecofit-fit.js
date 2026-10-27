const heights = Array.from({ length: 8 }, (_, index) => 155 + index * 5);
const weights = Array.from({ length: 96 }, (_, index) => 35 + index);
const garmentSizes = ['M', 'L', 'XL'];
const bodyTypes = [
  { id: 'rg', baseWeight: 45, type: 'Rất gầy' },
  { id: 'g', baseWeight: 50, type: 'Gầy' },
  { id: 'cd', baseWeight: 56, type: 'Cân đối' },
  { id: 'dd', baseWeight: 63, type: 'Đầy đặn' },
  { id: 'th', baseWeight: 70, type: 'Tròn hơn' },
].map((shape) => ({ ...shape, bmi: shape.baseWeight / (1.6 ** 2) }));
const profiles = heights.flatMap((height) => bodyTypes.map((shape) => ({
  ...shape,
  height,
  weight: Math.round(shape.bmi * ((height / 100) ** 2)),
})));

const frameFor = (profile, frame, gender) => {
  const folder = gender === 'female' ? 'ecofit-tryon-female-v1' : 'ecofit-tryon-v5';
  return `/images/${folder}/ecofit-fit-${profile.id}-${String(frame).padStart(2, '0')}.webp`;
};
const frameCache = new Map();

function preloadProfile(profile, gender) {
  for (let frame = 0; frame < 8; frame += 1) {
    const src = frameFor(profile, frame, gender);
    if (frameCache.has(src)) continue;
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    frameCache.set(src, image);
  }
}

export function initializeFitPreview(product) {
  const trigger = product.querySelector('[data-fit-open]');
  if (!trigger) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'eco-fit-dialog';
  dialog.setAttribute('aria-labelledby', 'eco-fit-title');
  dialog.innerHTML = `
    <div class="eco-fit-dialog-shell">
      <header class="eco-fit-heading">
        <div>
          <p class="eco-fit-kicker">ECOFIT / FIT STUDY</p>
          <h2 id="eco-fit-title">Thử áo theo vóc dáng.</h2>
          <p class="eco-fit-lede">Chọn chiều cao, cân nặng và size áo; kéo để xoay mẫu 360°.</p>
        </div>
        <button class="eco-fit-close" type="button" data-fit-close aria-label="Đóng phần thử áo">×</button>
      </header>
      <div class="eco-fit-layout">
        <section class="eco-fit-visual" aria-label="Mẫu thử xoay 360 độ">
          <div class="eco-fit-visual-top"><span data-fit-model-label>NGƯỜI MẪU NAM / 8 GÓC XOAY</span><span data-fit-angle>01 / 08 · 0°</span></div>
          <div class="eco-fit-stage" data-fit-stage tabindex="0" role="group" aria-label="Kéo chuột hoặc dùng phím mũi tên để xoay mannequin">
            <div class="eco-fit-figure" data-fit-figure>
              <img class="eco-fit-body" data-fit-body alt="" width="316" height="623" decoding="async" draggable="false">
            </div>
            <span class="eco-fit-visual-caption" data-fit-caption>ÁO ECOFIT / QUẦN DÀI ĐEN THAM KHẢO</span>
          </div>
          <div class="eco-fit-rotation-controls" role="group" aria-label="Điều khiển góc xoay">
            <button type="button" data-fit-prev aria-label="Xoay sang góc trước">←</button>
            <p data-fit-instruction aria-live="polite">KÉO ĐỂ XOAY <span>·</span> 8 GÓC XEM</p>
            <button type="button" data-fit-next aria-label="Xoay sang góc tiếp">→</button>
          </div>
          <p class="eco-fit-selected" data-fit-selected aria-live="polite"></p>
        </section>
        <section class="eco-fit-controls" aria-label="Chọn chiều cao, cân nặng và size áo">
          <p class="eco-fit-control-kicker">01 / CHỌN DÁNG NGƯỜI</p>
          <div class="eco-fit-gender-picker">
            <span>Người mẫu</span>
            <div class="eco-fit-gender-options" role="group" aria-label="Chọn người mẫu nam hoặc nữ">
              <button type="button" data-fit-gender="male" aria-pressed="true">Nam</button>
              <button type="button" data-fit-gender="female" aria-pressed="false">Nữ</button>
            </div>
          </div>
          <label class="eco-fit-field" for="eco-fit-height"><span>Chiều cao</span><span class="eco-fit-select-wrap"><select id="eco-fit-height" data-fit-height></select><span aria-hidden="true">⌄</span></span></label>
          <label class="eco-fit-field" for="eco-fit-weight"><span>Cân nặng</span><span class="eco-fit-select-wrap"><select id="eco-fit-weight" data-fit-weight></select><span aria-hidden="true">⌄</span></span></label>
          <div class="eco-fit-profile-card" data-fit-profile></div>
          <div class="eco-fit-size-picker">
            <p class="eco-fit-size-title">02 / CHỌN SIZE ÁO</p>
            <div class="eco-fit-size-options" role="group" aria-label="Chọn size áo">
              ${garmentSizes.map((size) => `<button type="button" data-fit-size="${size}" aria-pressed="${size === 'L'}"><strong>${size}</strong><span data-fit-size-note="${size}"></span></button>`).join('')}
            </div>
            <p class="eco-fit-size-result" data-fit-size-result aria-live="polite"></p>
          </div>
          <div class="eco-fit-note"><span aria-hidden="true">i</span><p>Chiều cao được hiển thị theo tỉ lệ; cân nặng chọn vóc dáng gần nhất trong bộ ảnh. Đây là hình minh họa, không mô phỏng độ co giãn của vải và không thay thế bảng size thực tế.</p></div>
          <p class="eco-fit-credit-note">155–190 cm · 35–130 kg · 5 dáng mỗi người mẫu · 8 góc WebP</p>
        </section>
      </div>
    </div>`;
  document.body.append(dialog);

  const heightSelect = dialog.querySelector('[data-fit-height]');
  const weightSelect = dialog.querySelector('[data-fit-weight]');
  const genderButtons = [...dialog.querySelectorAll('[data-fit-gender]')];
  const sizeButtons = [...dialog.querySelectorAll('[data-fit-size]')];
  const bodyImage = dialog.querySelector('[data-fit-body]');
  const stage = dialog.querySelector('[data-fit-stage]');
  const figure = dialog.querySelector('[data-fit-figure]');
  const selectedCopy = dialog.querySelector('[data-fit-selected]');
  const profileCard = dialog.querySelector('[data-fit-profile]');
  const angleCopy = dialog.querySelector('[data-fit-angle]');
  const caption = dialog.querySelector('[data-fit-caption]');
  let activeProfile;
  let selectedGender = 'male';
  let selectedHeight = 170;
  let selectedWeight = 60;
  let selectedSize = 'L';
  let currentFrame = 0;
  let dragStartX = 0;
  let dragDistance = 0;

  heightSelect.replaceChildren(...heights.map((height) => {
    const option = document.createElement('option');
    option.value = String(height);
    option.textContent = `${height} cm`;
    option.selected = height === selectedHeight;
    return option;
  }));

  function renderFrame(nextFrame) {
    currentFrame = (nextFrame + 8) % 8;
    const degrees = currentFrame * 45;
    const rearView = currentFrame >= 3 && currentFrame <= 5;
    const sideView = currentFrame === 2 || currentFrame === 6;
    bodyImage.src = frameFor(activeProfile, currentFrame, selectedGender);
    bodyImage.alt = `Mannequin ${selectedGender === 'female' ? 'nữ' : 'nam'} minh họa vóc dáng cao ${selectedHeight} cm, nặng ${selectedWeight} kg, mặc áo Ecofit và quần dài, góc xoay ${degrees} độ`;
    angleCopy.textContent = `${String(currentFrame + 1).padStart(2, '0')} / 08 · ${degrees}°`;
    figure.dataset.angle = String(currentFrame);
    const heightScale = String(selectedHeight / 160);
    figure.style.setProperty('--fit-height-scale', heightScale);
    stage.style.setProperty('--fit-height-scale', heightScale);
    caption.textContent = `${selectedGender === 'female' ? 'NỮ' : 'NAM'} · ${rearView ? 'MẶT SAU' : sideView ? 'GÓC NGHIÊNG' : 'MẶT TRƯỚC'} / ÁO ECOFIT · QUẦN DÀI ĐEN`;
    selectedCopy.textContent = `${selectedGender === 'female' ? 'Nữ' : 'Nam'}  /  ${selectedHeight} cm  /  ${selectedWeight} kg  /  ${activeProfile.type}  ·  Góc ${degrees}°`;
  }

  function getRecommendedSize() {
    const bmi = selectedWeight / ((selectedHeight / 100) ** 2);
    // A provisional guide anchored to the user's 170 cm / 60 kg example.
    // Replace these boundaries when Ecofit's measured garment chart is available.
    return bmi < 20.76 ? 'M' : bmi < 23.15 ? 'L' : 'XL';
  }

  function renderSizeFit() {
    const recommendedSize = getRecommendedSize();
    const recommendedIndex = garmentSizes.indexOf(recommendedSize);
    sizeButtons.forEach((button) => {
      const size = button.dataset.fitSize;
      const difference = garmentSizes.indexOf(size) - recommendedIndex;
      const fitLabel = difference < 0 ? 'Ôm hơn' : difference > 0 ? 'Rộng hơn' : 'Vừa dự kiến';
      button.setAttribute('aria-pressed', String(size === selectedSize));
      button.querySelector('[data-fit-size-note]').textContent = fitLabel;
      button.classList.toggle('is-recommended', size === recommendedSize);
    });
    const selectedDifference = garmentSizes.indexOf(selectedSize) - recommendedIndex;
    const selectedFit = selectedDifference < 0 ? 'ôm hơn, có thể chật' : selectedDifference > 0 ? 'rộng hơn' : 'vừa theo số đo tham khảo';
    dialog.querySelector('[data-fit-size-result]').textContent = `Với ${selectedHeight} cm / ${selectedWeight} kg: size ${selectedSize} ${selectedFit}. Gợi ý tham khảo: ${recommendedSize}, ước tính theo BMI; Ecofit chưa có bảng size chính thức.`;
  }

  function renderProfile() {
    selectedHeight = Number(heightSelect.value);
    selectedWeight = Number(weightSelect.value);
    const available = profiles.filter((item) => item.height === selectedHeight);
    activeProfile = available.reduce((nearest, item) => Math.abs(item.weight - selectedWeight) < Math.abs(nearest.weight - selectedWeight) ? item : nearest);
    if (!activeProfile) return;
    preloadProfile(activeProfile, selectedGender);
    profileCard.innerHTML = `<span>DÁNG ${selectedGender === 'female' ? 'NỮ' : 'NAM'} GẦN NHẤT TRONG BỘ ẢNH</span><strong>${activeProfile.type}</strong><small>${selectedHeight} cm · ${selectedWeight} kg</small>`;
    dialog.querySelector('[data-fit-model-label]').textContent = `NGƯỜI MẪU ${selectedGender === 'female' ? 'NỮ' : 'NAM'} / 8 GÓC XOAY`;
    renderFrame(currentFrame);
    renderSizeFit();
  }

  function renderWeights() {
    const previousWeight = Number(weightSelect.value) || selectedWeight;
    weightSelect.replaceChildren(...weights.map((weight) => {
      const option = document.createElement('option');
      option.value = String(weight);
      option.textContent = `${weight} kg`;
      return option;
    }));
    weightSelect.value = String(Math.max(weights[0], Math.min(weights.at(-1), previousWeight)));
    renderProfile();
  }

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragStartX = event.clientX;
    dragDistance = 0;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', (event) => {
    if (!stage.hasPointerCapture(event.pointerId)) return;
    const delta = event.clientX - dragStartX;
    dragStartX = event.clientX;
    dragDistance += delta;
    const threshold = Math.max(24, stage.clientWidth / 8);
    const steps = Math.trunc(dragDistance / threshold);
    if (steps) {
      renderFrame(currentFrame - steps);
      dragDistance -= steps * threshold;
    }
  });
  const stopDragging = (event) => {
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', stopDragging);
  stage.addEventListener('pointercancel', stopDragging);
  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); renderFrame(currentFrame + 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); renderFrame(currentFrame - 1); }
  });
  dialog.querySelector('[data-fit-prev]').addEventListener('click', () => renderFrame(currentFrame - 1));
  dialog.querySelector('[data-fit-next]').addEventListener('click', () => renderFrame(currentFrame + 1));
  sizeButtons.forEach((button) => button.addEventListener('click', () => {
    selectedSize = button.dataset.fitSize;
    renderSizeFit();
  }));
  genderButtons.forEach((button) => button.addEventListener('click', () => {
    selectedGender = button.dataset.fitGender;
    genderButtons.forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
    renderProfile();
  }));
  heightSelect.addEventListener('change', renderWeights);
  weightSelect.addEventListener('change', renderProfile);
  trigger.addEventListener('click', () => {
    renderProfile();
    if (!dialog.open) dialog.showModal();
  });
  dialog.querySelector('[data-fit-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.focus());
  weightSelect.value = String(selectedWeight);
  renderWeights();
}
