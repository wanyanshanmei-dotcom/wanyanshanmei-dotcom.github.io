import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const bundled=existsSync(new URL('../dist/adscope-stats.mjs',import.meta.url));
const {normalCDF,quantile,plan}=await import(bundled?'../dist/adscope-stats.mjs':'./adscope-stats.mjs');
assert.ok(Math.abs(normalCDF(1.959963984540054)-.975)<1e-6);
assert.ok(Math.abs(quantile(.975)-1.959963984540054)<3e-6);
// Independently checked using Python statistics.NormalDist.
assert.equal(plan(.04,.004),39475);
assert.equal(plan(.04,.002),154304);
assert.ok(plan(.02,.004)!==plan(.04,.004));
assert.throws(()=>plan(.99,.02));assert.throws(()=>plan(0,.004));
console.log('AdScope planning: reference values, sensitivity and invalid-input checks pass.');
