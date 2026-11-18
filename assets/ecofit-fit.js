import { createGarmentPreview } from './ecofit-fit-garment.js';

const minHeight = 155;
const maxHeight = 190;
const heightTicks = Array.from({ length: 8 }, (_, index) => maxHeight - index * 5);
const weights = Array.from({ length: 96 }, (_, index) => 35 + index);
const garmentSizes = ['M', 'L', 'XL'];
const bodyTypes = [
  { id: 'rg', baseWeight: 45, type: 'Rất gầy' },
  { id: 'g', baseWeight: 50, type: 'Gầy' },
  { id: 'cd', baseWeight: 56, type: 'Cân đối' },
  { id: 'dd', baseWeight: 63, type: 'Đầy đặn' },
  { id: 'th', baseWeight: 70, type: 'Tròn hơn' },
].map((shape) => ({ ...shape, bmi: shape.baseWeight / (1.6 ** 2) }));
const frameCache = new Map();

function loadFrame(src) {
  if (frameCache.has(src)) return frameCache.get(src);
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  const ready = image.decode().then(() => true, () => {
    frameCache.delete(src);
    return false;
  });
  const frame = { image, ready };
  frameCache.set(src, frame);
  return frame;
}

export function initializeFitPreview(product) {
  const trigger = product.querySelector('[data-fit-open]');
  if (!trigger) return;
  const fitProduct = product.dataset.ecofitFitProduct || 'bamboo-prime';
  const customFit = fitProduct !== 'bamboo-prime';

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
          <div class="eco-fit-measurements">
            <label class="eco-fit-height" for="eco-fit-height">
              <span>Chiều cao <output for="eco-fit-height" data-fit-height-value>170 cm</output></span>
              <input id="eco-fit-height" type="range" min="${minHeight}" max="${maxHeight}" step="5" value="170" aria-label="Chiều cao" aria-valuetext="170 cm" data-fit-height>
            </label>
            <label class="eco-fit-weight" for="eco-fit-weight">
              <span>Cân nặng</span>
              <select id="eco-fit-weight" data-fit-weight></select>
            </label>
          </div>
          <div class="eco-fit-size-options" role="group" aria-label="Chọn size áo">
            ${garmentSizes.map((size) => `<button type="button" data-fit-size="${size}" aria-pressed="${size === 'L'}"><strong>${size}</strong><span data-fit-size-note="${size}"></span></button>`).join('')}
          </div>
          <div class="eco-fit-stage" data-fit-stage tabindex="0" role="group" aria-label="Kéo chuột hoặc dùng phím mũi tên để xoay mannequin">
            <div class="eco-fit-ruler" aria-hidden="true">
              ${heightTicks.map((height) => `<span class="eco-fit-ruler-tick${height % 10 === 0 ? ' is-major' : ''}" style="--fit-tick:${height / maxHeight}">${height % 10 === 0 ? height : ''}</span>`).join('')}
            </div>
            <div class="eco-fit-height-marker" aria-hidden="true"><span data-fit-height-marker>170 cm</span></div>
            <div class="eco-fit-figure" data-fit-figure role="img">
              <canvas class="eco-fit-body" data-fit-body width="316" height="623" aria-hidden="true"></canvas>
            </div>
            <span class="eco-fit-stage-size" data-fit-stage-size>Size L · Vừa dự kiến</span>
            <span class="eco-fit-visual-caption" data-fit-caption>ÁO ECOFIT / QUẦN DÀI ĐEN THAM KHẢO</span>
          </div>
          <div class="eco-fit-rotation-controls" role="group" aria-label="Điều khiển góc xoay">
            <button type="button" data-fit-prev aria-label="Xoay sang góc trước">←</button>
            <p data-fit-instruction aria-live="polite">KÉO ĐỂ XOAY <span>·</span> 8 GÓC XEM</p>
            <button type="button" data-fit-next aria-label="Xoay sang góc tiếp">→</button>
          </div>
          <p class="eco-fit-selected" data-fit-selected aria-live="polite"></p>
        </section>
        <section class="eco-fit-controls" aria-label="Chọn người mẫu và size áo">
          <p class="eco-fit-control-kicker">01 / CHỌN DÁNG NGƯỜI</p>
          <div class="eco-fit-gender-picker">
            <span>Người mẫu</span>
            <div class="eco-fit-gender-options" role="group" aria-label="Chọn người mẫu nam hoặc nữ">
              <button type="button" data-fit-gender="male" aria-pressed="true">Nam</button>
              <button type="button" data-fit-gender="female" aria-pressed="false">Nữ</button>
            </div>
          </div>
          <div class="eco-fit-profile-card" data-fit-profile></div>
          <div class="eco-fit-size-picker">
            <p class="eco-fit-size-title">02 / ĐỘ VỪA CỦA ÁO</p>
            <p class="eco-fit-size-result" data-fit-size-result aria-live="polite"></p>
          </div>
          <div class="eco-fit-note"><span aria-hidden="true">i</span><p>Chiều cao hiển thị theo tỉ lệ, cân nặng chọn vóc dáng gần nhất. Độ ôm và rộng của áo là minh họa. Khi chọn size, hãy đối chiếu với số đo áo thực tế.</p></div>
          <p class="eco-fit-credit-note">155–190 cm · 35–130 kg · 5 dáng mỗi người mẫu · 8 góc WebP</p>
        </section>
      </div>
    </div>`;
  document.body.append(dialog);

  const heightInput = dialog.querySelector('[data-fit-height]');
  const heightValue = dialog.querySelector('[data-fit-height-value]');
  const heightMarker = dialog.querySelector('[data-fit-height-marker]');
  const weightSelect = dialog.querySelector('[data-fit-weight]');
  const genderButtons = [...dialog.querySelectorAll('[data-fit-gender]')];
  const sizeButtons = [...dialog.querySelectorAll('[data-fit-size]')];
  const bodyImage = dialog.querySelector('[data-fit-body]');
  const stage = dialog.querySelector('[data-fit-stage]');
  const stageSize = dialog.querySelector('[data-fit-stage-size]');
  const figure = dialog.querySelector('[data-fit-figure]');
  const paintGarment = createGarmentPreview(bodyImage);
  const selectedCopy = dialog.querySelector('[data-fit-selected]');
  const profileCard = dialog.querySelector('[data-fit-profile]');
  const angleCopy = dialog.querySelector('[data-fit-angle]');
  const caption = dialog.querySelector('[data-fit-caption]');
  let activeProfile;
  let selectedGender = 'male';
  let selectedHeight = 170;
  let selectedWeight = 60;
  let selectedSize = 'L';
  let fitDifference = 0;
  let visibleFrame;
  let currentFrame = 0;
  let outlines;
  let requestedFrame = 0;
  let dragStartX = 0;
  let dragDistance = 0;

  weightSelect.replaceChildren(...weights.map((weight) => new Option(`${weight} kg`, String(weight))));
  weightSelect.value = String(selectedWeight);

  function sourceFor(frame) {
    if (customFit) return `/images/ecofit-fit-custom/${fitProduct}-${selectedGender}-${activeProfile.id}-${String(frame).padStart(2, '0')}.webp`;
    const folder = selectedGender === 'female' ? 'ecofit-tryon-female-v1' : 'ecofit-tryon-v5';
    return `/images/${folder}/ecofit-fit-${activeProfile.id}-${String(frame).padStart(2, '0')}.webp`;
  }

  async function renderFrame(nextFrame) {
    currentFrame = ((nextFrame % 8) + 8) % 8;
    if (customFit) {
      const request = ++requestedFrame;
      const frame = loadFrame(sourceFor(currentFrame));
      const ready = await frame.ready;
      if (request !== requestedFrame || !dialog.open || !ready) return;
      const context = bodyImage.getContext('2d');
      context.clearRect(0, 0, bodyImage.width, bodyImage.height);
      context.drawImage(frame.image, 0, 0, bodyImage.width, bodyImage.height);
      bodyImage.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;max-width:none;display:block;pointer-events:none;';
      visibleFrame = null;
      figure.setAttribute('aria-label', `Mẫu ${selectedGender === 'female' ? 'nữ' : 'nam'} mặc áo ${fitProduct}, cao ${selectedHeight} cm, nặng ${selectedWeight} kg`);
      angleCopy.textContent = `${String(currentFrame + 1).padStart(2, '0')} / 08 · ${currentFrame * 45}°`;
      caption.textContent = `${selectedGender === 'female' ? 'NỮ' : 'NAM'} · ẢNH MẪU THAM CHIẾU / ÁO ECOFIT · QUẦN DÀI ĐEN`;
      selectedCopy.textContent = `${selectedGender === 'female' ? 'Nữ' : 'Nam'} / ${selectedHeight} cm / ${selectedWeight} kg / ${activeProfile.type}`;
      return;
    }
    const frameId = String(currentFrame).padStart(2, '0');
    const pose = outlines?.[`${selectedGender}-${activeProfile.id}-${frameId}`];
    if (!pose) return;

    const src = sourceFor(currentFrame);
    const request = ++requestedFrame;
    const frame = loadFrame(src);
    const ready = await frame.ready;
    if (request !== requestedFrame || !dialog.open) return;
    if (!ready) {
      selectedCopy.textContent = 'Chưa tải được góc này. Thử xoay sang góc khác.';
      return;
    }
    visibleFrame = { image: frame.image, pose };
    paintGarment(frame.image, pose, fitDifference);
    const degrees = currentFrame * 45;
    const rearView = currentFrame >= 3 && currentFrame <= 5;
    const sideView = currentFrame === 2 || currentFrame === 6;
    figure.setAttribute('aria-label', `Mannequin ${selectedGender === 'female' ? 'nữ' : 'nam'} minh họa vóc dáng cao ${selectedHeight} cm, nặng ${selectedWeight} kg, mặc áo Ecofit và quần dài, góc xoay ${degrees} độ`);
    angleCopy.textContent = `${String(currentFrame + 1).padStart(2, '0')} / 08 · ${degrees}°`;
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
    fitDifference = garmentSizes.indexOf(selectedSize) - recommendedIndex;
    figure.style.setProperty('--fit-garment-scale', customFit ? String(1 + fitDifference * .05) : '1');
    const selectedFit = fitDifference < 0 ? 'ôm hơn, có thể chật' : fitDifference > 0 ? 'rộng hơn' : 'vừa dự kiến';
    const fitLabel = fitDifference < 0 ? 'Ôm hơn' : fitDifference > 0 ? 'Rộng hơn' : 'Vừa dự kiến';
    stageSize.textContent = `Size ${selectedSize} · ${fitLabel}`;
    if (visibleFrame) paintGarment(visibleFrame.image, visibleFrame.pose, fitDifference);
    dialog.querySelector('[data-fit-size-result]').textContent = `Với ${selectedHeight} cm / ${selectedWeight} kg: size ${selectedSize} ${selectedFit}. Gợi ý tham khảo: ${recommendedSize}, ước tính theo BMI; Ecofit chưa có bảng size chính thức.`;
  }

  function renderProfile() {
    selectedHeight = Number(heightInput.value);
    selectedWeight = Number(weightSelect.value);
    const previousProfile = activeProfile;
    const area = (selectedHeight / 100) ** 2;
    const distance = (shape) => Math.abs(Math.round(shape.bmi * area) - selectedWeight);
    activeProfile = bodyTypes.reduce((nearest, shape) => distance(shape) < distance(nearest) ? shape : nearest);
    const measurement = `${selectedHeight} cm`;
    heightInput.setAttribute('aria-valuetext', measurement);
    heightValue.textContent = measurement;
    heightMarker.textContent = measurement;
    stage.style.setProperty('--fit-height-scale', String(selectedHeight / maxHeight));
    profileCard.innerHTML = `<span>DÁNG ${selectedGender === 'female' ? 'NỮ' : 'NAM'} GẦN NHẤT TRONG BỘ ẢNH</span><strong>${activeProfile.type}</strong><small>${selectedHeight} cm · ${selectedWeight} kg</small>`;
    dialog.querySelector('[data-fit-model-label]').textContent = `NGƯỜI MẪU ${selectedGender === 'female' ? 'NỮ' : 'NAM'} / 8 GÓC XOAY`;
    renderSizeFit();
    renderFrame(currentFrame);
    if (activeProfile !== previousProfile) preloadAngles();
  }

  function preloadAngles() {
    if (!outlines) return;
    for (let frame = 0; frame < 8; frame += 1) loadFrame(sourceFor(frame));
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
    preloadAngles();
  }));
  heightInput.addEventListener('input', renderProfile);
  weightSelect.addEventListener('change', renderProfile);
  trigger.addEventListener('click', async () => {
    if (dialog.open) return;
    dialog.showModal();
    if (!customFit) {
      try {
        outlines ??= (await import('./ecofit-fit-outlines.js')).default;
      } catch {
        selectedCopy.textContent = 'Chưa tải được ảnh thử đồ. Đóng và mở lại để thử lại.';
        return;
      }
    }
    if (!dialog.open) return;
    renderProfile();
    preloadAngles();
  });
  dialog.querySelector('[data-fit-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.focus());
  renderProfile();
}
