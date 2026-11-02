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
export function compare(a, na, b, nb, alpha=.05) {
  if (![a,na,b,nb].every(Number.isInteger) || na<=0 || nb<=0 || a<0 || b<0 || a>na || b>nb || !(alpha>0 && alpha<1)) throw new RangeError('Invalid binomial counts');
  const pa=a/na, pb=b/nb, diff=pb-pa, pool=(a+b)/(na+nb);
  const se=Math.sqrt(pa*(1-pa)/na+pb*(1-pb)/nb);
  const nullSE=Math.sqrt(pool*(1-pool)*(1/na+1/nb));
  const z=nullSE ? diff/nullSE : 0;
  const critical=quantile(1-alpha/2);
  return {pa,pb,diff,se,low:diff-critical*se,high:diff+critical*se,
    relative:pa ? diff/pa : null,p:Math.max(0,Math.min(1,2*(1-normalCDF(Math.abs(z))))),
    validApprox:[a,na-a,b,nb-b].every(v=>v>=10)};
}
// Equal allocation, two-sided independent-proportions normal approximation.
export function plan(baseline, mde, alpha=.05, power=.8) {
  if (!(baseline>0 && mde>0 && baseline+mde<1 && alpha>0 && alpha<1 && power>.5 && power<1)) throw new RangeError('Invalid planning assumptions');
  const target=baseline+mde, average=(baseline+target)/2;
  const numerator=quantile(1-alpha/2)*Math.sqrt(2*average*(1-average))+
    quantile(power)*Math.sqrt(baseline*(1-baseline)+target*(1-target));
  return Math.ceil((numerator/mde)**2);
}
export function srm(na,nb) {
  const expected=(na+nb)/2;
  const chi=((na-expected)**2+(nb-expected)**2)/expected;
  return Math.max(0,Math.min(1,2*(1-normalCDF(Math.sqrt(chi)))));
}
export const scenarios = [
  {id:'uncertain',n:1000,a:40,b:50,ga:2,gb:2},
  {id:'small',n:2000000,a:80000,b:81200,ga:4000,gb:4000},
  {id:'harm',n:50000,a:2000,b:2400,ga:100,gb:350},
  {id:'win',n:50000,a:2000,b:2400,ga:100,gb:100}
];
export function assess(s) {
  const main=compare(s.a,s.n,s.b,s.n), guard=compare(s.ga,s.n,s.gb,s.n);
  // Predeclared safety gate: one-sided 95% upper bound below +0.2 pp.
  const upper=guard.diff+quantile(.95)*guard.se;
  const balance=srm(s.n,s.n), business=.004, margin=.002;
  const safe=guard.validApprox && upper<margin;
  const outcome=balance<.001 ? 'invalid' : !main.validApprox ? 'uncertain' : main.p>=.05 ? 'uncertain' : main.diff<business ? 'small' : !safe ? 'harm' : 'win';
  return {main,guard,upper,balance,safe,outcome,business,margin};
}
