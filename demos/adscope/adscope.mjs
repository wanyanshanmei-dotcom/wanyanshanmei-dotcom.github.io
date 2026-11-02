import {plan} from './adscope-stats.mjs';
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
let records=[],selected='C01',brief='',currentAccount=null,currentPlan=null;
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
  $('ad-kpis').innerHTML=metric(T('Weekly spend','本周消耗'),usd(now.spend),`${T('vs previous week','较上周')} ${pp((now.spend-prev.spend)/prev.spend).replace(' pp','%')}`)+metric(T('Active accounts','活跃客户'),num(ids.length),T('Accounts with spend this week','本周有消耗的客户'))+metric(T('Click-through rate','点击率'),pct(now.ctr),T('Total clicks / impressions','总点击数 / 总展示数'))+metric(T('Click-to-purchase rate','点击购买率'),pct(now.cvr),T('Total purchases / clicks','总购买数 / 总点击数'));
  $('ad-trend').innerHTML=trend(rows);
  $('ad-clients').innerHTML=`<table><caption class="sr-only">${T('Weekly spend by account, USD','客户周消耗对比（美元）')}</caption><thead><tr><th>${T('Account','客户')}</th><th>${T('Previous','上周')}</th><th>${T('Current','本周')}</th><th>Δ USD</th></tr></thead><tbody>${clients.map(c=>`<tr class="${c.id===selected?'selected':''}"><th><button type="button" class="ad-account" data-client="${c.id}" aria-pressed="${c.id===selected}">${c.id} ↗</button></th><td>${usd(c.a.spend)}</td><td>${usd(c.b.spend)}</td><td class="${c.diff<0?'ad-down':'ad-up'}">${c.diff>0?'+':''}${usd(c.diff)}</td></tr>`).join('')}</tbody><tfoot><tr><th>${T('Total','合计')}</th><td>${usd(prev.spend)}</td><td>${usd(now.spend)}</td><td>${usd(now.spend-prev.spend)}</td></tr></tfoot></table>`;
  const c=clients.find(c=>c.id===selected), own=rows.find(r=>r.client===selected);
  currentAccount=c;
  const changed=c.b.ctr<c.a.ctr*.9;
  const country={US:T('United States','美国'),UK:T('United Kingdom','英国'),SG:T('Singapore','新加坡')}[own.country];
  $('ad-diagnosis').innerHTML=`<div class="ad-diagnosis-head"><span>${T('SELECTED ACCOUNT','当前客户')}</span><h3>${selected} / ${country} / ${own.industry==='beauty'?T('Beauty','美妆'):T('Apparel','服饰')}</h3></div><div class="ad-two"><div><h4>${T('Previous week → current week','上周 → 本周')}</h4><ul><li>${T('Spend','广告消耗')} ${usd(c.a.spend)} → ${usd(c.b.spend)} (${((c.b.spend/c.a.spend-1)*100).toFixed(1)}%).</li><li>${T('Click-through rate','点击率')} ${pct(c.a.ctr)} → ${pct(c.b.ctr)}.</li><li>${T('Click-to-purchase rate','点击购买率')} ${pct(c.a.cvr)} → ${pct(c.b.cvr)}.</li></ul></div><div><h4>${T('What to check next','接下来查什么')}</h4><p>${changed?T('The click-through rate fell. Check budgets and paused ads first. If ad content may be the issue, plan a test comparing two types of advertising.','点击率下降了。先检查预算、广告是否暂停等情况。如果怀疑广告内容吸引力不足，可以规划实验比较两种广告。'):T('A change in spend does not by itself mean the ad content is worse. Check budgets and paused ads, then decide whether a new-ad experiment is useful.','消耗变化不代表广告内容变差。先核实预算、广告是否暂停，再判断是否值得测试新广告。')}</p></div></div>`;
  $('ad-plan-link').textContent=T(`Plan an experiment for ${selected} ↓`,`为 ${selected} 规划实验 ↓`);
  $('ad-plan-client').textContent=T(`Current account: ${selected} · Parameters below are manual planning assumptions.`,`当前客户：${selected} · 下方参数为手动填写的规划假设。`);
  planner();
  $('ad-clients').querySelectorAll('[data-client]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.client;monitor();}));
}
function invalidate() {
  brief=''; $('ad-brief').hidden=true; $('ad-download').disabled=true;
  $('ad-brief-status').textContent=T('Account or assumptions changed. Generate a new plan before downloading.','客户或参数变化后，请重新生成计划再下载。');
}
function planner(event) {
  event?.preventDefault(); invalidate(); currentPlan=null;
  try {
    const base=Number($('ad-baseline').value)/100,mde=Number($('ad-mde').value)/100;
    if(!$('ad-plan-form').checkValidity())throw Error();
    const n=plan(base,mde,.05,.8); currentPlan={base,mde,n};
    $('ad-plan-output').innerHTML=`<span class="ad-label">${T('APPROXIMATE USERS PER GROUP','每组所需用户 · 近似值')}</span><strong class="ad-big">${num(n)}</strong><p>${T('users in A and B each','A、B 各组人数')} / ${T('total','合计')} ${num(n*2)}</p><div class="ad-rule"></div><p>${T('Assumed purchase rate','假设购买率')}<br><strong>${pct(base)} → ${pct(base+mde)}</strong></p><p>${T('Increase','增加')} ${(mde*100).toFixed(2)} ${T('percentage points','个百分点')}</p><p class="ad-note">${T('A planning estimate, not an experiment result. A smaller target difference usually needs more users.','这是规划估算，不是实验结果。希望检测的差异越小，通常需要的用户越多。')}</p>`;
  } catch { $('ad-plan-output').innerHTML=`<p role="alert">${T('Enter valid positive values. Original rate plus increase must be below 100%.','请输入有效正数，原购买率与增加幅度之和须小于 100%。')}</p>`; }
  $('ad-generate').disabled=!currentPlan||!currentAccount;
}
function makeBrief() {
  // Calculate again from the current fields; never reuse an out-of-date plan.
  planner(); if(!currentPlan||!currentAccount)return;
  const cn=$('ad-brief-lang').value==='zh',p=currentPlan,c=currentAccount;
  const f=v=>(v*100).toFixed(2)+'%', money=v=>'$'+v.toLocaleString(cn?'zh-CN':'en-US',{maximumFractionDigits:0});
  brief=cn?`AdScope｜${selected} 实验计划\n状态：仅完成模拟数据分析与实验设计，尚未执行实验。\n\n1. 客户数据观察\n客户：${selected}\n本周：2026.10.19–10.25；上周：2026.10.12–10.18；UTC、美元。\n广告消耗：${money(c.a.spend)} → ${money(c.b.spend)}。\n点击率：${f(c.a.ctr)} → ${f(c.b.ctr)}。\n点击购买率：${f(c.a.cvr)} → ${f(c.b.cvr)}。\n变化是调查线索，不能证明原因；先核实预算和广告是否暂停，再判断是否需要测试广告内容。\n\n2. 实验问题与设计\n用户体验型广告能否比产品介绍型广告带来更高的购买率？\nA 组：产品介绍型广告。B 组：用户体验型广告。\n符合条件的用户各有 50% 概率进入一组，同一个人固定分组，其他条件尽量一致。\n比较指标：分组后 7 天内购买人数 ÷ 该组全部用户数，每个购买者只计一次。\n\n3. 规划假设与人数\n假设原购买率 ${f(p.base)}，希望检测到 ${f(p.base+p.mde)}，增加 ${(p.mde*100).toFixed(2)} 个百分点。\n固定双侧显著性水平 5%、统计功效 80%，预计每组 ${num(p.n)} 人，合计 ${num(p.n*2)} 人。\n上述购买率是手动输入的规划假设，不是从客户日报自动推算。看板分母为点击次数，实验分母为全部已分组用户。\n\n4. 后续\n确认是否需要实验，按计划实施随机分组并收集数据，之后才能判断广告效果。当前没有实验结果，也不作推广结论。\n\n数据为 Python 生成的模拟记录；此文档使用本地模板生成，未接入 LLM。`:
  `AdScope | ${selected} experiment plan\nStatus: synthetic data review and planning only. The experiment has not been run.\n\n1. Account observations\nAccount: ${selected}\nCurrent week: Oct 19–25, 2026; previous: Oct 12–18; UTC, USD.\nSpend: ${money(c.a.spend)} → ${money(c.b.spend)}.\nClick-through rate: ${f(c.a.ctr)} → ${f(c.b.ctr)}.\nClick-to-purchase rate: ${f(c.a.cvr)} → ${f(c.b.cvr)}.\nChanges are investigation clues, not causal evidence. Check budgets and paused ads before proposing a content test.\n\n2. Question and design\nCan a user-experience ad increase purchase rate compared with a product-description ad?\nA: product-description ad. B: user-experience ad.\nEach eligible user has a 50% chance of entering either arm; keep assignment fixed and other conditions similar.\nMetric: buyers within 7 days / all assigned users in that arm. Count each buyer once.\n\n3. Assumptions and sample size\nAssumed original rate ${f(p.base)}; target ${f(p.base+p.mde)}; increase ${(p.mde*100).toFixed(2)} percentage points.\nFixed two-sided significance level 5%, power 80%. Approximately ${num(p.n)} users per arm, ${num(p.n*2)} total.\nThese are manual planning assumptions, not estimates inferred from the daily account data. Dashboard rates use clicks; the experiment uses all assigned users.\n\n4. Next step\nConfirm the need for a test, implement random assignment and collect outcomes before evaluating effectiveness. No experiment result or rollout decision is claimed.\n\nPython-generated synthetic records. Local template automation; no LLM connected.`;
  $('ad-brief').textContent=brief;$('ad-brief').hidden=false;$('ad-download').disabled=false;
  $('ad-brief-status').textContent=cn?`已根据 ${selected} 和当前参数生成计划。`:`Plan generated for ${selected} using the current assumptions.`;
}
$('ad-plan-form').addEventListener('submit',planner);
for(const id of ['ad-baseline','ad-mde'])$(id).addEventListener('input',planner);
$('ad-generate').addEventListener('click',makeBrief);
$('ad-brief-lang').addEventListener('change',()=>{if(brief)makeBrief();});
$('ad-download').addEventListener('click',()=>{if(!brief)return;const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`adscope-${selected}-plan-${$('ad-brief-lang').value}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
planner();
try {
  const response=await fetch(new URL('./assets/adscope-data.json',import.meta.url));
  if(!response.ok)throw Error(response.status);
  records=(await response.json()).records;monitor();$('ad-load').hidden=true;
  ['ad-country','ad-industry'].forEach(id=>$(id).addEventListener('change',monitor));
} catch { $('ad-load').textContent=T('Account data could not load. Refresh the page.','客户数据加载失败，请刷新页面。'); }
