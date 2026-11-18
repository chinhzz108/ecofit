export function createGarmentPreview(canvas) {
  const context = canvas.getContext('2d');
  const silhouette = document.createElement('canvas');
  silhouette.width = canvas.width;
  silhouette.height = canvas.height;
  const source = silhouette.getContext('2d');
  let currentImage;
  let lastDifference;

  return function paintGarment(image, pose, difference) {
    if (image === currentImage && difference === lastDifference) return;
    const [centerX, headY, height, path, garment] = pose;
    const viewWidth = height * 0.6;
    const { width, height: canvasHeight } = canvas;

    if (image !== currentImage) {
      source.clearRect(0, 0, width, canvasHeight);
      source.save();
      source.clip(new Path2D(path), 'evenodd');
      source.drawImage(image, 0, 0);
      source.restore();
      canvas.style.width = `${width / viewWidth * 100}%`;
      canvas.style.height = `${canvasHeight / height * 100}%`;
      canvas.style.left = `${(0.5 - centerX / viewWidth) * 100}%`;
      canvas.style.top = `${-headY / height * 100}%`;
      currentImage = image;
    }

    lastDifference = difference;
    context.clearRect(0, 0, width, canvasHeight);
    context.drawImage(silhouette, 0, 0);
    if (difference === 0) return;

    // Widen or narrow the torso of the shirt. Blend back into the original
    // frame at the shoulders, hem and sides to keep the whole pose aligned.
    const [center, halfWidth, hem] = garment;
    const start = Math.round(headY + height * 0.26);
    const left = center - halfWidth;
    const right = center + halfWidth;
    const fade = 18;
    const outerLeft = left - fade;
    const outerRight = right + fade;
    const strength = Math.max(-0.16, Math.min(0.16, difference * 0.085));

    for (let y = start + 1; y < hem; y += 1) {
      const progress = (y - start) / (hem - start);
      const taper = Math.min(progress / 0.35, (1 - progress) / 0.17, 1);
      const offset = Math.round(halfWidth * strength * taper);
      if (offset === 0) continue;

      context.clearRect(outerLeft, y, outerRight - outerLeft, 1);
      context.drawImage(silhouette, outerLeft, y, fade, 1, outerLeft, y, fade - offset, 1);
      context.drawImage(silhouette, left, y, right - left, 1, left - offset, y, right - left + 2 * offset, 1);
      context.drawImage(silhouette, right, y, fade, 1, right + offset, y, fade - offset, 1);
    }
  };
}
