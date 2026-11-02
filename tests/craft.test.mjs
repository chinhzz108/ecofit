import test from 'node:test';
import assert from 'node:assert/strict';
import { weightTotal, quality, stars, totalQuality, pointSegmentDistance, tensionStep, weaveGrade } from '../ecofit-game/src/game/craft-rules.js';

test('all randomized orders can be filled with the available bag sizes', () => {
  for (const target of [225, 275, 325, 375]) {
    const weights = Array(Math.floor(target / 100)).fill(100);
    if (target % 100 >= 50) weights.push(50);
    weights.push(25);
    assert.equal(weightTotal(weights), target);
    assert.ok(weights.length < 12);
    assert.notEqual(weightTotal([...weights, 25]), target);
  }
});
test('mistakes lower quality and grades are bounded, including a failed station', () => {
  assert.equal(quality(0), 100);
  assert.equal(quality(4, 9), 64);
  assert.equal(quality(100), 0);
  assert.equal(totalQuality([100, 100, 0, 100, 100]), 80);
  assert.equal(stars(90), 3);
  assert.equal(stars(89), 2);
  assert.equal(stars(69), 1);
});
test('pedal tension responds to hold and release without depending on frame rate', () => {
  assert.equal(tensionStep(50, true, 1), 84);
  assert.equal(tensionStep(50, false, 1), 27);
  assert.equal(tensionStep(99, true, 1), 100);
  assert.equal(tensionStep(1, false, 1), 0);
  let tension = 25;
  for (let i = 0; i < 60; i++) tension = tensionStep(tension, true, 1 / 60);
  assert.ok(Math.abs(tension - tensionStep(25, true, 1)) < 1e-8);
  assert.ok(tensionStep(50, true, 1, true) < tensionStep(50, true, 1));
});
test('weaving rewards timing precision and rejects passes outside the gate', () => {
  assert.equal(weaveGrade(.5, .5, .13), 100);
  assert.equal(weaveGrade(.6, .5, .13), 80);
  assert.equal(weaveGrade(.8, .5, .13), 0);
  assert.equal(weaveGrade(.66, .5, .2), 80);
});
test('sewing validates the current seam segment rather than just its endpoint', () => {
  const a = { x: 100, y: 100 }, b = { x: 200, y: 100 };
  assert.equal(pointSegmentDistance({ x: 150, y: 100 }, a, b), 0);
  assert.equal(pointSegmentDistance({ x: 150, y: 130 }, a, b), 30);
  assert.equal(pointSegmentDistance({ x: 250, y: 100 }, a, b), 50);
  assert.equal(pointSegmentDistance({ x: 100, y: 150 }, a, a), 50);
});

