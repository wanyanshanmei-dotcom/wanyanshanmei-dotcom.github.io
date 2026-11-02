"""AdScope: bilingual, static, interactive portfolio project."""
from html import escape
from pathlib import Path
import json,zipfile
from scripts.adscope_data import generate

def adscope_body(lang,pre):
    zh=lang=='zh'
    def T(en,cn):return cn if zh else en
    def option(value,en,cn):return f'<option value="{value}">{T(en,cn)}</option>'
    def heading(n,en,cn,suben,subcn):return f'<div class="ad-section-title"><span>{n}</span><div><h2>{T(en,cn)}</h2><p>{T(suben,subcn)}</p></div></div>'
    countries=option('all','All markets','全部市场')+option('US','United States','美国')+option('UK','United Kingdom','英国')+option('SG','Singapore','新加坡')
    industries=option('all','All industries','全部行业')+option('beauty','Beauty','美妆')+option('apparel','Apparel','服饰')
    scenarios=''.join(f'<button type="button" data-scenario="{j}" aria-pressed="{str(j==0).lower()}"><span>0{j+1}</span>{T(en,cn)}</button>' for j,(en,cn) in enumerate([
        ('Too little evidence','证据不足'),('Significant, but small','显著但收益小'),('Guardrail deteriorates','护栏指标恶化'),('Ready for a staged rollout','可分阶段推广')]))
    return f'''<main id="main" class="shell adscope" data-lang="{lang}">
    <div id="top" class="ad-hero"><a class="back" href="../index.html#project-adscope">← {T('All projects','全部项目')}</a>
      <div class="ad-kicker">INDEPENDENT DEMO / 2026 <span>{T('Synthetic data','模拟数据')}</span></div>
      <h1>AdScope<span>{T('From a performance shift<br>to an experiment decision.','从广告异常，<br>到实验决策。')}</span></h1>
      <div class="ad-hero-bottom"><p>{T('A small operations workbench connecting account diagnostics, experimental design and evidence-based decisions. Built to make statistical reasoning visible.','把客户诊断、实验设计与业务决策连接起来的轻量运营工作台，让统计思维在每一步都可见。')}</p><div class="ad-role">{T('Project scope','项目范围')}<strong>{T('Data model · statistics · interactive prototype','数据建模 · 统计方法 · 交互原型')}</strong></div></div>
      <div class="ad-actions"><a href="#monitor" class="primary">{T('Explore the demo ↓','开始体验 ↓')}</a><a href="https://github.com/wanyanshanmei-dotcom/wanyanshanmei-dotcom.github.io/tree/main/demos/adscope" target="_blank" rel="noopener noreferrer" class="text-link">{T('GitHub source ↗','GitHub 源码 ↗')}</a><a href="{pre}assets/adscope-source.zip" download class="text-link">{T('Download source & methods ↓','下载源码与方法说明 ↓')}</a></div>
    </div>
    <nav class="ad-steps" aria-label="{T('Demo sections','演示章节')}"><a href="#monitor">01 / {T('Observe','发现问题')}</a><a href="#design">02 / {T('Design','设计实验')}</a><a href="#results">03 / {T('Decide','解释与决策')}</a><a href="#methods">04 / {T('Methods','方法与边界')}</a></nav>
    <noscript><p>{T('Enable JavaScript to use this interactive demo.','此交互演示需要启用 JavaScript。')}</p></noscript>
    <section id="monitor" class="ad-section">
    {heading('01','Find the shift.','先定位变化。','An observational dashboard identifies where to investigate; it cannot establish why.','观察性看板用于定位调查方向，不能单凭相关变化确定原因。')}
    <div class="ad-toolbar"><label>{T('Market','市场')}<select id="ad-country">{countries}</select></label><label>{T('Industry','行业')}<select id="ad-industry">{industries}</select></label><p>{T('Oct 19–25 vs Oct 12–18, 2026 · UTC · USD','2026.10.19–10.25 对比 10.12–10.18 · UTC · 美元')}</p></div>
    <p id="ad-load" role="status">{T('Loading fictional account data…','正在载入虚构客户数据…')}</p>
    <div id="ad-kpis" class="ad-kpis"></div>
    <div class="ad-two"><div class="ad-panel"><h3>{T('Eight weeks of spend','八周广告消耗')}</h3><div id="ad-trend"></div><p class="ad-note">{T('Daily total · last 14 days shaded · start: Aug 31 / end: Oct 25','每日合计 · 阴影标记最后两周 · 8 月 31 日至 10 月 25 日')}</p></div><div class="ad-panel"><h3>{T('Where did spend change?','消耗变化来自哪里？')}</h3><p class="ad-note">{T('Select a row to inspect an account. Δ is current week minus previous week; signed contributions sum to the net change.','点击客户查看诊断。Δ 为本周减上周；带符号的客户变化量加总等于总变化。')}</p><div class="ad-table-wrap" id="ad-clients"></div></div></div>
    <div id="ad-diagnosis" class="ad-diagnosis" aria-live="polite"></div>
    <a class="text-link" href="#design">{T('Turn the hypothesis into a test →','把假设转成实验 →')}</a>
    </section>
    <section id="design" class="ad-section">
    {heading('02','Specify before you test.','先设计，再看结果。','Question: does a user-story creative increase purchase conversion compared with a product-led creative?','实验问题：相比产品介绍型素材，用户体验型素材能否提升购买转化率？')}
    <div class="ad-protocol"><div><span>{T('Assignment','分流')}</span><p>{T('50 / 50, sticky user-level randomization. One user, one arm. All assigned users stay in the denominator (ITT).','用户级 50 / 50 随机分流，同一用户固定分组。分母保留所有已分流用户（ITT）。')}</p></div><div><span>{T('Primary metric','主指标')}</span><p>{T('Users purchasing within 7 days / all assigned users. One binary outcome per user; H₀: pB = pA.','分流后 7 天内购买用户数 / 全部已分流用户；每人一个二元结果。H₀：pB = pA。')}</p></div><div><span>{T('Safety & stopping','护栏与停止')}</span><p>{T('Complaint-user rate per assigned user; margin +0.20 pp. Fix sample size upfront, recruit for ≥14 days, then wait 7 days for outcomes.','护栏为已分流用户的投诉率，容忍界限 +0.20 个百分点。预先固定样本量，招募至少 14 天，再等待 7 天结果成熟。')}</p></div></div>
    <div class="ad-two ad-planner"><form id="ad-plan-form" class="ad-panel"><h3>{T('Sample-size planner','样本量规划器')}</h3><div class="ad-fields"><label>{T('Baseline purchase rate (%)','基线购买率（%）')}<input id="ad-baseline" type="number" min="0.1" max="90" step="0.1" value="4" required></label><label>{T('Minimum detectable lift (pp)','最小可检测提升（百分点）')}<input id="ad-mde" type="number" min="0.01" max="10" step="0.01" value="0.4" required></label><label>{T('Significance level α','显著性水平 α')}<select id="ad-alpha"><option value="0.05">5%</option><option value="0.01">1%</option></select></label><label>{T('Statistical power','统计功效')}<select id="ad-power"><option value="0.8">80%</option><option value="0.9">90%</option></select></label><label>{T('Eligible users / day, both arms','每天可入组用户（两组总计）')}<input id="ad-traffic" type="number" min="1" max="10000000" step="1" value="6000" required></label></div><button class="ad-button" type="submit">{T('Calculate plan','计算实验计划')} →</button></form><div class="ad-plan-output ad-panel" id="ad-plan-output" aria-live="polite"></div></div>
    <p class="ad-note">{T('Planning is exploratory and does not alter the predeclared scenario protocols below. MDE is a power assumption; the business threshold is a separate decision choice. They both default to +0.40 pp here.','规划器用于探索，不会改写下方情景预设的实验协议。MDE 是功效计算假设，业务门槛是独立决策标准；本例均预设为 +0.40 个百分点。')}</p>
    </section>
    <section id="results" class="ad-section">
    {heading('03','A result needs a decision.','结果需要被解释。','Four independent, completed synthetic experiments. Each uses α = 5% and a +0.40 pp business threshold.','四个独立、已完成的模拟实验，均采用 α = 5% 与 +0.40 个百分点业务门槛。')}
    <div class="ad-scenarios" role="group" aria-label="{T('Choose experiment scenario','选择实验情景')}">{scenarios}</div>
    <div id="ad-result" aria-live="polite"></div>
    <div class="ad-brief-panel"><div><h3>{T('An evidence-linked operating brief','生成有据可查的运营简报')}</h3><p>{T('Local template automation. No LLM is connected; every number comes from the calculations above.','本地模板自动化，当前未接入 LLM。每个数字均来自上方计算结果。')}</p></div><div class="ad-brief-controls"><label class="sr-only" for="ad-brief-lang">{T('Brief language','简报语言')}</label><select id="ad-brief-lang"><option value="zh" {'selected' if zh else ''}>中文</option><option value="en" {'' if zh else 'selected'}>English</option></select><button class="ad-button" id="ad-generate" type="button">{T('Generate brief','生成简报')} ↗</button><button class="ad-button secondary" id="ad-download" type="button" disabled>{T('Download .txt','下载 .txt')}</button></div><pre id="ad-brief" hidden></pre></div>
    </section>
    <section id="methods" class="ad-section">
    {heading('04','Make the reasoning inspectable.','让推理可被检查。','A portfolio prototype, with explicit assumptions and reproducible calculations.','独立作品集原型：说明假设，保留计算依据。')}
    <div class="ad-method-grid"><article><h3>{T('What the data represents','数据代表什么')}</h3><p>{T('24 fictional accounts × 56 days, generated with seed 20261102. Dashboard purchases are illustrative click-attributed events; experiments use separate user-level, 7-day purchase outcomes. Their denominators are intentionally different. No TikTok API, actual clients or confidential data.','24 个虚构客户 × 56 天，固定随机种子 20261102。看板购买数为模拟点击归因事件；实验另用用户级、7 天内购买结果，二者分母不同。未接入 TikTok API，不含真实客户或保密数据。')}</p></article><article><h3>{T('Analysis, not just a p-value','不只看 p 值')}</h3><p>{T('Pooled two-proportion z-test; unpooled Wald 95% CI for the absolute rate difference. Intended for independent Bernoulli outcomes with ≥10 events and non-events in each arm. Relative lift is descriptive. Sparse guardrails are labelled insufficient.','采用合并比例的双样本 z 检验；绝对比例差使用非合并标准误的 Wald 95% 置信区间。适用于独立二元结果，且每组成功、失败数均不少于 10。相对提升为描述值，稀疏护栏数据标记为证据不足。')}</p></article><article><h3>{T('Decision rule','预先设定决策规则')}</h3><p>{T('Check SRM (50/50 χ², flag p < .001), then primary p < .05, positive lift ≥0.40 pp, and complaint-rate one-sided 95% upper bound <+0.20 pp. The last gate is a non-inferiority criterion, not “no significant harm”. A staged rollout still needs operational review.','先检查 SRM（50/50 卡方检验，p < .001 报警），再要求主指标 p < .05、正向点估计 ≥0.40 个百分点、投诉率差的单侧 95% 上界 <+0.20 个百分点。护栏使用非劣效标准，并非“伤害不显著就安全”。分阶段推广仍需业务复核。')}</p></article><article><h3>{T('Limits & next steps','边界与后续')}</h3><p>{T('No repeated-peeking correction, multi-arm comparisons, clustered-user model or revenue prediction. SRM passing cannot prove randomization was correct. Subgroup dashboard patterns are exploratory. A real deployment needs allocation/event QA and a separately powered guardrail plan. AI could later draft from verified structured results with human review.','未实现反复查看校正、多组比较、用户聚类模型或收入预测。SRM 通过不能证明随机化正确；看板分组结果仅为探索线索。真实上线需检查分流与埋点，并单独规划护栏功效。未来可让 AI 根据已核算的结构化结果起草简报，由人工复核。')}</p></article></div>
    <details class="ad-method-details"><summary>{T('Formulas, definitions & references','公式、指标定义与参考资料')}</summary><div><p>Δ = pB − pA; SE = √[pA(1−pA)/nA + pB(1−pB)/nB]; CI = Δ ± 1.96 × SE.</p><p>z = Δ / √[p̂(1−p̂)(1/nA + 1/nB)]; p̂ = (xA+xB)/(nA+nB).</p><p>n ≈ [z(1−α/2)√(2p̄(1−p̄)) + z(power)√(pA(1−pA)+pB(1−pB))]² / MDE².</p><p>{T('Dashboard: CTR = clicks/impressions; click-to-purchase rate = purchases/clicks; CPA = USD spend/purchases. Ratios are calculated from aggregate counts, not averages of daily rates. All comparisons use equal 7-day windows.','看板：CTR = 点击数/展示数；点击购买率 = 购买数/点击数；CPA = 美元消耗/购买数。比例均由计数汇总后相除，不对每日比例直接取平均。所有周比较均为等长 7 天窗口。')}</p><p><a href="https://www.statsmodels.org/stable/generated/statsmodels.stats.proportion.proportions_ztest.html" target="_blank" rel="noopener noreferrer">statsmodels / Two-proportion z-test ↗</a><br><a href="https://www.microsoft.com/en-us/research/publication/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments-a-taxonomy-and-rules-of-thumb-for-practitioners/" target="_blank" rel="noopener noreferrer">Microsoft Research / Sample ratio mismatch ↗</a><br><a href="{pre}assets/adscope-data.json" download>{T('Download synthetic daily data (JSON) ↓','下载模拟每日数据（JSON）↓')}</a></p></div></details>
    <p class="ad-note">{T('Built with coding assistance. This is an independent prototype, not a client engagement or a claim of production impact.','本项目使用编程辅助完成，为独立演示原型，不作为真实客户项目或已上线业务成果。')}</p>
    </section></main>'''

def write_adscope_assets(out):
    root=Path(__file__).resolve().parent
    (out/'assets/adscope-data.json').write_text(json.dumps(generate(),separators=(',',':')))
    for zh in [False,True]:
        title='从广告异常，到实验决策。' if zh else 'From signal to decision.'
        labels=['发现变化','随机实验','证据与决策'] if zh else ['Observe','Experiment','Decide']
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="600" fill="#eaf0ec"/><g font-family="Arial, sans-serif"><text x="55" y="65" fill="#526a61" font-size="14" letter-spacing="3">ADSCOPE / STATISTICAL THINKING</text><text x="55" y="140" fill="#203e34" font-size="42">{title}</text><rect x="55" y="195" width="790" height="245" rx="8" fill="#fcfdfb"/><path d="M 110 385 H 785 M 340 235 V 405" stroke="#c6d1c9"/><path d="M 140 260 L 185 275 L 230 265 L 275 310 L 315 340" stroke="#a77a4a" stroke-width="5" fill="none"/><path d="M 405 270 H 650 M 470 330 H 765" stroke="#315bd4" stroke-width="4"/><path d="M 405 258 V 282 M 650 258 V 282 M 470 318 V 342 M 765 318 V 342" stroke="#315bd4" stroke-width="3"/><circle cx="530" cy="270" r="7" fill="#315bd4"/><circle cx="610" cy="330" r="7" fill="#315bd4"/><path d="M 445 220 V 385" stroke="#a9b6ad" stroke-dasharray="4 5"/><text x="110" y="420" fill="#5d6a63" font-size="13">SPEND</text><text x="405" y="420" fill="#5d6a63" font-size="13">EFFECT + UNCERTAINTY</text>'
        for j,label in enumerate(labels):svg+=f'<text x="{55+j*272}" y="510" fill="#203e34" font-size="22">0{j+1} / {escape(label)}</text>'
        svg+='<text x="55" y="560" fill="#5d6a63" font-size="12">INDEPENDENT INTERACTIVE DEMO · SYNTHETIC DATA</text></g></svg>'
        (out/'assets'/('adscope-cover-zh.svg' if zh else 'adscope-cover.svg')).write_text(svg)
    # Public, self-contained source bundle: only files belonging to this demo.
    files={'adscope_case.py':root/'adscope_case.py','scripts/adscope_data.py':root/'scripts/adscope_data.py',
      'adscope.mjs':out/'adscope.mjs','adscope-stats.mjs':out/'adscope-stats.mjs','adscope.css':out/'adscope.css',
      'assets/adscope-data.json':out/'assets/adscope-data.json','README.md':root/'demos/adscope/README.md',
      'verify.mjs':root/'scripts/verify_adscope.mjs'}
    with zipfile.ZipFile(out/'assets/adscope-source.zip','w',zipfile.ZIP_DEFLATED) as z:
        for name,path in files.items():z.write(path,name)
        for lang,folder in [('en',''),('zh','zh/')]:
            body=adscope_body(lang,'../' if lang=='zh' else '')
            body=body.replace('href="../index.html#project-adscope"','href="https://wanyanshanmei-dotcom.github.io/"')
            pre='../' if lang=='zh' else ''
            z.writestr(folder+'index.html',f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AdScope</title><link rel="stylesheet" href="{pre}style.css"><link rel="stylesheet" href="{pre}adscope.css"><script type="module" src="{pre}adscope.mjs"></script></head><body>{body}</body></html>')
        z.write(out/'style.css','style.css')
