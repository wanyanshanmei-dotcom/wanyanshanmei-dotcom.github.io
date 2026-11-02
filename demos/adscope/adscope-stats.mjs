// Browser and Node share these pure functions. All probabilities use [0, 1].
export function normalCDF(x) {
  if (x === 0) return 0.5;
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const tail = Math.exp(-x*x/2) / Math.sqrt(2*Math.PI) *
    t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
  return x > 0 ? 1-tail : tail;
}
export function quantile(p) {
  if (!(p > 0 && p < 1)) throw new RangeError('Probability must be in (0, 1)');
  let low=-10, high=10;
  for(let i=0;i<80;i++) { const mid=(low+high)/2; if(normalCDF(mid)<p) low=mid; else high=mid; }
  return (low+high)/2;
}
// Equal allocation, two-sided independent-proportions normal approximation.
export function plan(baseline, mde, alpha=.05, power=.8) {
  if (!(baseline>0 && mde>0 && baseline+mde<1 && alpha>0 && alpha<1 && power>.5 && power<1)) throw new RangeError('Invalid planning assumptions');
  const target=baseline+mde, average=(baseline+target)/2;
  const numerator=quantile(1-alpha/2)*Math.sqrt(2*average*(1-average))+
    quantile(power)*Math.sqrt(baseline*(1-baseline)+target*(1-target));
  return Math.ceil((numerator/mde)**2);
}
