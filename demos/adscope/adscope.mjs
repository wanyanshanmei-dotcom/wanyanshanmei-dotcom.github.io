import {plan,assess,scenarios} from './adscope-stats.mjs';
const root=document.querySelector('.adscope');
const zh=root.dataset.lang==='zh';
const T=(en,cn)=>zh?cn:en;
const $=id=>document.getElementById(id);
const num=v=>v.toLocaleString(zh?'zh-CN':'en-US',{maximumFractionDigits:0});
const pct=(v,d=2)=>(v*100).toFixed(d)+'%';
const pp=v=>(v>0?'+':'')+(v*100).toFixed(2)+' pp';
const usd=v=>(v<0?'−':'')+'$'+num(Math.abs(v));
const cost=v=>'$'+v.toFixed(2);
const pv=v=>v<.0001?'< 0.0001':v.toFixed(4);
const metric=(label,value,note='')=>`<div class="ad-kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
let records=[],selected='C01',activeScenario=0,brief='';
function aggregate(rows) {
  const s={spend:0,impressions:0,clicks:0,purchases:0,active_ads:0};
  for(const row of rows)for(const k of Object.keys(s))s[k]+=row[k];
  s.ctr=s.impressions?s.clicks/s.impressions:0;s.cvr=s.clicks?s.purchases/s.clicks:0;
  s.cpa=s.purchases?s.spend/s.purchases:0;s.ads=rows.length?s.active_ads/rows.length:0;
  return s;
}
function filterRows() {return records.filter(r=>($('ad-country').value==='all'||r.country===$('ad-country').value)&&($('ad-industry').value==='all'||r.industry===$('ad-industry').value));}
function trend(rows) {
  const values=Array.from({length:56},(_,day)=>aggregate(rows.filter(r=>r.day===day)).spend);
  const max=Math.max(...values,1),width=620,height=195;
  const x=i=>48+i*10, y=v=>height-25-v/max*145;
  const line=values.map((v,i)=>`${i?'L':'M'}${x(i)},${y(v)}`).join(' ');
  return `<svg class="ad-chart" viewBox="0 0 ${width} ${height+30}" role="img" aria-label="${T('Daily spend for 56 days; exact weekly values are in the table below.','56 天每日消耗；各客户准确周合计可在表格中查看。')}"><title>${T('Daily spend in USD','每日消耗（美元）')}</title><rect x="468" y="20" width="140" height="150" fill="#eaf0ec"/>${[0,.5,1].map(v=>`<path d="M48 ${y(max*v)} H608" stroke="#dae0d9"/><text x="42" y="${y(max*v)+4}" text-anchor="end">${num(max*v/1000)}k</text>`).join('')}<path d="${line}" stroke="#315bd4" stroke-width="2.5" fill="none"/><text x="48" y="205">08/31</text><text x="310" y="205">09/28</text><text x="560" y="205">10/25</text></svg>`;
}
function monitor() {
  const rows=filterRows(), now=aggregate(rows.filter(r=>r.day>=49)), prev=aggregate(rows.filter(r=>r.day>=42&&r.day<49));
  const ids=[...new Set(rows.map(r=>r.client))];
  const clients=ids.map(id=>{const own=rows.filter(r=>r.client===id);const a=aggregate(own.filter(r=>r.day>=42&&r.day<49)),b=aggregate(own.filter(r=>r.day>=49));return {id,a,b,diff:b.spend-a.spend};}).sort((a,b)=>a.diff-b.diff);
  if(!ids.includes(selected))selected=clients[0]?.id;
  $('ad-kpis').innerHTML=metric(T('Weekly spend','本周消耗'),usd(now.spend),`${T('vs previous week','较上周')} ${pp((now.spend-prev.spend)/prev.spend).replace(' pp','%')}`)+metric(T('Active accounts','活跃客户'),num(ids.length),T('Accounts with spend this week','本周有消耗的客户'))+metric(T('Click-through rate','点击率'),pct(now.ctr),T('Total clicks / impressions','总点击数 / 总展示数'))+metric(T('Cost per purchase','每次购买成本'),cost(now.cpa),T('Spend / attributed purchases','消耗 / 归因购买数'));
  $('ad-trend').innerHTML=trend(rows);
  $('ad-clients').innerHTML=`<table><caption class="sr-only">${T('Weekly spend by account, USD','客户周消耗对比（美元）')}</caption><thead><tr><th>${T('Account','客户')}</th><th>${T('Previous','上周')}</th><th>${T('Current','本周')}</th><th>Δ USD</th></tr></thead><tbody>${clients.map(c=>`<tr class="${c.id===selected?'selected':''}"><th><button type="button" class="ad-account" data-client="${c.id}" aria-pressed="${c.id===selected}">${c.id} ↗</button></th><td>${usd(c.a.spend)}</td><td>${usd(c.b.spend)}</td><td class="${c.diff<0?'ad-down':'ad-up'}">${c.diff>0?'+':''}${usd(c.diff)}</td></tr>`).join('')}</tbody><tfoot><tr><th>${T('Total','合计')}</th><td>${usd(prev.spend)}</td><td>${usd(now.spend)}</td><td>${usd(now.spend-prev.spend)}</td></tr></tfoot></table>`;
  const c=clients.find(c=>c.id===selected), own=rows.find(r=>r.client===selected);
  const changed=c.b.ctr<c.a.ctr*.9;
  const country={US:T('United States','美国'),UK:T('United Kingdom','英国'),SG:T('Singapore','新加坡')}[own.country];
  $('ad-diagnosis').innerHTML=`<div class="ad-diagnosis-head"><span>${T('ACCOUNT DIAGNOSIS','客户诊断')}</span><h3>${selected} / ${country} / ${own.industry==='beauty'?T('Beauty','美妆'):T('Apparel','服饰')}</h3></div><div class="ad-two"><div><h4>${T('Observed evidence','已观察到的证据')}</h4><ul><li>${T('Weekly spend','周消耗')} ${usd(c.a.spend)} → ${usd(c.b.spend)} (${((c.b.spend/c.a.spend-1)*100).toFixed(1)}%).</li><li>CTR ${pct(c.a.ctr)} → ${pct(c.b.ctr)}; ${T('click-to-purchase rate','点击购买率')} ${pct(c.a.cvr)} → ${pct(c.b.cvr)}.</li><li>${T('Mean active ads per day','日均活跃广告数')} ${c.a.ads.toFixed(1)} → ${c.b.ads.toFixed(1)}.</li><li>${T('Account contribution to selected net spend change','客户占当前筛选净消耗变化的比例')}: ${Math.abs(now.spend-prev.spend)<.01?'—':pct(c.diff/(now.spend-prev.spend),1)}. ${T('Signed; may exceed 100% when other accounts offset the change.','带符号；其他客户抵消变化时可超过 100%。')}</li></ul></div><div><h4>${T('Hypothesis → verification','待验证假设 → 下一步')}</h4><p>${changed?T('Lower CTR and fewer active ads suggest investigating creative changes or paused ads. First check budgets, delivery eligibility and tracking; the dashboard does not prove creative fatigue.','点击率和活跃广告数同时下降，提示先检查素材变化或广告暂停情况，同时核实预算、投放资格与埋点；看板不能证明素材疲劳。'):T('There is no strong CTR decline in this example. Inspect budgets, delivery and audience mix before proposing a creative experiment.','该客户没有明显的点击率下降，建议先核实预算、投放状态和受众结构，再决定是否需要素材实验。')}</p><p class="ad-note">${T('The experiment below is a separate fictional C01 follow-up. Changing this account does not change that protocol.','下方实验是 C01 的独立模拟后续；切换客户不会改变实验协议。')}</p></div></div>`;
  $('ad-clients').querySelectorAll('[data-client]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.client;monitor();}));
}
function planner(event) {
  event?.preventDefault();
  try {
    const base=Number($('ad-baseline').value)/100,mde=Number($('ad-mde').value)/100,alpha=Number($('ad-alpha').value),power=Number($('ad-power').value),traffic=Number($('ad-traffic').value);
    if(!$('ad-plan-form').checkValidity()||!Number.isInteger(traffic))throw Error();
    const n=plan(base,mde,alpha,power),days=Math.max(14,Math.ceil(n*2/traffic));
    $('ad-plan-output').innerHTML=`<span class="ad-label">${T('REQUIRED PER ARM · APPROXIMATE','每组所需样本量 · 近似值')}</span><strong class="ad-big">${num(n)}</strong><p>${T('users in A and B each','A、B 各组用户数')} / ${T('total','合计')} ${num(n*2)}</p><div class="ad-rule"></div><p>${pct(base)} → ${pct(base+mde)}<br>${T('Absolute lift','绝对提升')} ${pp(mde)} / ${T('relative lift','相对提升')} +${pct(mde/base,1)}</p><p><strong>${days+7} ${T('days minimum','天起')}</strong> = ${days} ${T('recruitment days','天招募')} + 7 ${T('days outcome follow-up','天结果随访')}</p><p class="ad-note">${T('Assumes steady eligible traffic, 50/50 allocation and independent users. This powers the primary metric only; plan guardrail sensitivity separately. Larger MDE reduces required sample size but misses smaller worthwhile effects.','假设稳定入组流量、50/50 分流且用户独立。此处只规划主指标功效，护栏需单独规划。提高 MDE 会减少样本量，也会降低发现较小有价值效果的能力。')}</p>`;
  } catch { $('ad-plan-output').innerHTML=`<p role="alert">${T('Enter valid inputs: baseline + lift must be below 100%; daily traffic must be a positive integer.','请输入有效参数：基线与提升之和须小于 100%，每日流量须为正整数。')}</p>`; }
}
const outcomeText={
  uncertain:['Evidence is insufficient','证据不足'],small:['Statistically significant; below the business threshold','统计显著，但未达到业务门槛'],harm:['Do not roll out: the safety gate fails','暂不推广：护栏未通过'],win:['Consider a staged rollout','可以考虑分阶段推广'],invalid:['Investigate allocation quality first','先排查分流质量']
};
const explanation={
  uncertain:['A positive estimate does not establish a benefit. This completed small experiment cannot resolve the target effect. Design a new adequately powered experiment; do not keep adding users until p drops below .05.','正向点估计不足以证明有效。本次已完成的小样本实验无法分辨目标效果。应重新设计功效充分的实验，不应持续追加样本直至 p < .05。'],
  small:['The large sample detects a small difference, but the estimated lift is below the predeclared +0.40 pp business threshold. Check implementation cost and incremental value before proposing a new decision rule.','大样本能够检出微小差异，但估计提升低于预设 +0.40 个百分点业务门槛。需结合实施成本和增量价值评估，不能事后为这次结果改门槛。'],
  harm:['Purchase conversion improves, but the complaint-rate bound exceeds the safety margin. Investigate the complaint mechanism before any rollout. A primary-metric win cannot override a failed safety gate.','购买转化改善，但投诉率差的上界超过安全界限。应先排查投诉原因。主指标胜出不能覆盖护栏失败。'],
  win:['The primary difference is significant and its point estimate clears the business threshold; the complaint-rate bound passes the safety gate. Start a monitored staged rollout, with predefined rollback conditions. This is not proof that the true effect exceeds +0.40 pp.','主指标差异显著，点估计达到业务门槛，且投诉率上界通过护栏。可考虑带监控的分阶段推广，并预先规定回滚条件；这不等于已证明真实效果超过 +0.40 个百分点。']
};
function intervalChart(r) {
  const low=Math.min(r.low,-.002),high=Math.max(r.high,.006),pad=(high-low)*.18;
  const min=low-pad,max=high+pad,x=v=>60+(v-min)/(max-min)*680;
  return `<svg class="ad-chart ad-ci" viewBox="0 0 800 150" role="img" aria-label="${T('Absolute purchase-rate difference, 95% confidence interval','购买率绝对差异及 95% 置信区间')} ${pp(r.low)} ${T('to','至')} ${pp(r.high)}"><title>${T('Absolute effect and uncertainty','绝对效果及不确定性')}</title><rect x="${x(.004)}" y="20" width="${Math.max(0,750-x(.004))}" height="80" fill="#edf1ea"/><path d="M${x(0)} 15 V105" stroke="#8b9990" stroke-dasharray="4 4"/><path d="M${x(.004)} 15 V105" stroke="#749581" stroke-dasharray="4 4"/><path d="M${x(r.low)} 60 H${x(r.high)} M${x(r.low)} 47 V73 M${x(r.high)} 47 V73" stroke="#315bd4" stroke-width="4"/><circle cx="${x(r.diff)}" cy="60" r="7" fill="#315bd4"/><text x="${x(r.low)}" y="95" text-anchor="middle">${pp(r.low)}</text><text x="${x(r.high)}" y="95" text-anchor="middle">${pp(r.high)}</text><text x="${x(0)}" y="128" text-anchor="middle">0 / ${T('no difference','无差异')}</text><text x="${x(.004)}" y="145" text-anchor="middle">+0.40 pp / ${T('business threshold','业务门槛')}</text></svg>`;
}
function renderResult() {
  const s=scenarios[activeScenario], r=assess(s),m=r.main,g=r.guard;
  const values=[['A / '+T('Product-led','产品介绍'),s.n,s.a,m.pa,s.ga,g.pa],['B / '+T('User story','用户体验'),s.n,s.b,m.pb,s.gb,g.pb]];
  $('ad-result').innerHTML=`<div class="ad-result-top"><div><span class="ad-label">${T('C01 / COMPLETED EXPERIMENT','C01 / 已完成实验')} · ${s.id.toUpperCase()}</span><h3>${outcomeText[r.outcome][zh?1:0]}</h3></div><span class="ad-badge ${r.outcome==='win'?'positive':''}">${T('Fixed-horizon · mature outcomes','固定样本 · 结果已成熟')}</span></div><div class="ad-table-wrap"><table><caption class="sr-only">${T('Experiment counts and rates','实验计数与比例')}</caption><thead><tr>${[T('Variant','版本'),T('Assigned users','分流用户'),T('Buyers','购买用户'),T('Purchase rate','购买率'),T('Complaint users','投诉用户'),T('Complaint rate','投诉率')].map(v=>`<th>${v}</th>`).join('')}</tr></thead><tbody>${values.map(row=>`<tr>${row.map((v,i)=>i===0?`<th scope="row">${v}</th>`:`<td>${i===3||i===5?pct(v):num(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="ad-kpis">${metric(T('Absolute purchase lift','购买率绝对提升'),pp(m.diff),T('Percentage points, B − A','百分点，B − A'))}${metric(T('Relative purchase lift','购买率相对提升'),'+'+pct(m.relative,1),T('Difference / rate in A','差异 / A 组购买率'))}${metric(T('95% confidence interval','95% 置信区间'),`${pp(m.low)} → ${pp(m.high)}`,T('Absolute purchase-rate difference','购买率绝对差异'))}${metric(T('Two-sided p-value','双侧 p 值'),pv(m.p),'α = 0.05')}</div><div class="ad-two"><div class="ad-panel"><h3>${T('Effect size, with uncertainty','效果量，以及不确定性')}</h3>${intervalChart(m)}<p class="ad-note">${T('The interval describes estimation uncertainty under the model. It is not a 95% probability statement about this fixed parameter.','区间描述模型假设下的估计不确定性，不代表固定参数有 95% 的概率落入此次区间。')}</p></div><div class="ad-panel"><h3>${T('Predeclared checks','预先声明的检查')}</h3><ul class="ad-checks"><li><span>SRM / 50:50</span><strong>p = ${pv(r.balance)}</strong></li><li><span>${T('Complaint-rate difference','投诉率差')}</span><strong>${pp(g.diff)}</strong></li><li><span>${T('One-sided 95% upper bound','单侧 95% 上界')}</span><strong>${g.validApprox?pp(r.upper):"—"}</strong></li><li><span>${T('Safety margin','护栏界限')}</span><strong>+0.20 pp</strong></li><li><span>${T('Safety gate','护栏检查')}</span><strong>${!g.validApprox?T('Sparse data: insufficient','计数稀疏：证据不足'):r.safe?T('Pass','通过'):T('Fail','未通过')}</strong></li></ul></div></div><div class="ad-decision"><span>${T('DECISION & NEXT ACTION','决策与下一步')}</span><p>${explanation[r.outcome][zh?1:0]}</p></div>`;
  document.querySelectorAll('[data-scenario]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.scenario)===activeScenario)));
  brief='';$('ad-brief').hidden=true;$('ad-download').disabled=true;
}
function makeBrief() {
  const cn=$('ad-brief-lang').value==='zh',s=scenarios[activeScenario],r=assess(s),m=r.main;
  brief=cn?`AdScope｜模拟实验简报\n情景：${outcomeText[r.outcome][1]}\n\n1. 设计\n用户级 50/50 随机分流，每组 ${num(s.n)} 人；购买结果观察 7 天；固定样本实验已完成。\n\n2. 主指标证据（对应结果表与区间图）\nA 购买率 ${pct(m.pa)}；B ${pct(m.pb)}。\n绝对提升 ${pp(m.diff)}，相对提升 +${pct(m.relative,1)}。\n95% 置信区间 [${pp(m.low)}, ${pp(m.high)}]，双侧 p ${pv(m.p)}。\n业务门槛：正向点估计至少 +0.40 pp。\n\n3. 数据与安全检查\nSRM p = ${pv(r.balance)}，未触发 .001 报警阈值。\n投诉率差 ${pp(r.guard.diff)}，单侧 95% 上界 ${r.guard.validApprox?pp(r.upper):"不适用（稀疏计数）"}，预设界限 +0.20 pp。${!r.guard.validApprox?'计数稀疏，护栏证据不足。':r.safe?'护栏通过。':'护栏未通过。'}\n\n4. 建议\n${explanation[r.outcome][1]}\n\n边界：模拟独立实验，非实际投放成果；结论依赖随机化、独立性和埋点准确。模板自动生成，未接入 LLM。`:
  `AdScope | Synthetic experiment brief\nScenario: ${outcomeText[r.outcome][0]}\n\n1. Design\nSticky user-level 50/50 allocation, ${num(s.n)} users per arm. Seven-day purchase outcome. Completed fixed-horizon experiment.\n\n2. Primary evidence (results table and interval plot)\nA: ${pct(m.pa)}; B: ${pct(m.pb)}.\nAbsolute lift ${pp(m.diff)}; relative lift +${pct(m.relative,1)}.\n95% CI [${pp(m.low)}, ${pp(m.high)}]; two-sided p ${pv(m.p)}.\nBusiness gate: positive point estimate at least +0.40 pp.\n\n3. Quality & safety\nSRM p = ${pv(r.balance)}; no flag at .001.\nComplaint-rate difference ${pp(r.guard.diff)}; one-sided 95% upper bound ${r.guard.validApprox?pp(r.upper):"not reported (sparse counts)"}; margin +0.20 pp. ${!r.guard.validApprox?'Sparse data: safety evidence insufficient.':r.safe?'Safety gate passes.':'Safety gate fails.'}\n\n4. Recommendation\n${explanation[r.outcome][0]}\n\nLimits: independent synthetic experiment, not actual campaign impact. Assumes correct randomization, independence and tracking. Template-generated; no LLM connected.`;
  $('ad-brief').textContent=brief;$('ad-brief').hidden=false;$('ad-download').disabled=false;
}
$('ad-plan-form').addEventListener('submit',planner);
document.querySelectorAll('[data-scenario]').forEach(btn=>btn.addEventListener('click',()=>{activeScenario=Number(btn.dataset.scenario);renderResult();}));
$('ad-generate').addEventListener('click',makeBrief);
$('ad-brief-lang').addEventListener('change',()=>{if(brief)makeBrief();});
$('ad-download').addEventListener('click',()=>{if(!brief)return;const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`adscope-${scenarios[activeScenario].id}-${$('ad-brief-lang').value}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
planner();renderResult();
try {
  const response=await fetch(new URL('./assets/adscope-data.json',import.meta.url));
  if(!response.ok)throw Error(response.status);
  records=(await response.json()).records;monitor();$('ad-load').hidden=true;
  ['ad-country','ad-industry'].forEach(id=>$(id).addEventListener('change',monitor));
} catch { $('ad-load').textContent=T('Account data could not load. Refresh the page. The experiment demo below remains available.','客户数据加载失败，请刷新页面。下方实验演示仍可使用。'); }
