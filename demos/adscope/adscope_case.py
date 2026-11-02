"""AdScope: bilingual, static, interactive portfolio project."""
from html import escape
from pathlib import Path
import json,zipfile
from scripts.adscope_data import generate

def adscope_body(lang,pre):
    zh=lang=='zh'
    def T(en,cn):return cn if zh else en
    def option(v,en,cn):return f'<option value="{v}">{T(en,cn)}</option>'
    def heading(n,en,cn,suben,subcn):return f'<div class="ad-section-title"><span>{n}</span><div><h2>{T(en,cn)}</h2><p>{T(suben,subcn)}</p></div></div>'
    countries=option('all','All markets','全部市场')+option('US','United States','美国')+option('UK','United Kingdom','英国')+option('SG','Singapore','新加坡')
    industries=option('all','All industries','全部行业')+option('beauty','Beauty','美妆')+option('apparel','Apparel','服饰')
    return f'''<main id="main" class="shell adscope" data-lang="{lang}">
    <div id="top" class="ad-hero"><a class="back" href="../index.html#project-adscope">← {T('All projects','全部项目')}</a>
    <div class="ad-kicker">ADSCOPE / 2026 <span>{T('Synthetic data','模拟数据')}</span></div>
    <h1>AdScope<span>{T('Advertising dashboard<br>& A/B experiment planning.','广告数据看板<br>与 A/B 实验设计。')}</span></h1>
    <p class="ad-intro">{T('Choose an account, inspect its data, then plan a test comparing two types of advertising.','选择客户、查看数据，再为这个客户规划一个比较两种广告内容的实验。')}</p>
    <div class="ad-actions"><a href="#monitor" class="primary">{T('Explore the demo ↓','开始体验 ↓')}</a><a href="https://github.com/wanyanshanmei-dotcom/wanyanshanmei-dotcom.github.io/tree/main/demos/adscope" target="_blank" rel="noopener noreferrer" class="text-link">GitHub ↗</a><a href="{pre}assets/adscope-source.zip" download class="text-link">{T('Download source ↓','下载源码 ↓')}</a></div></div>
    <nav class="ad-steps" aria-label="{T('Demo sections','演示章节')}"><a href="#monitor">01 / {T('Account data','看客户数据')}</a><a href="#design">02 / {T('Plan an experiment','规划实验')}</a><a href="#brief">03 / {T('Generate a plan','生成计划')}</a></nav>
    <noscript><p>{T('Enable JavaScript to use the demo.','此演示需要启用 JavaScript。')}</p></noscript>
    <section id="monitor" class="ad-section">
    {heading('01','Inspect an account.','看客户数据。','Select an account to compare the last two weeks. A change is a reason to investigate, not proof of its cause.','选择客户，对比最近两周。指标变化只是调查线索，不能直接确定原因。')}
    <div class="ad-toolbar"><label>{T('Market','市场')}<select id="ad-country">{countries}</select></label><label>{T('Industry','行业')}<select id="ad-industry">{industries}</select></label><p>{T('Oct 19–25 vs Oct 12–18, 2026 · UTC · USD','2026.10.19–10.25 对比 10.12–10.18 · UTC · 美元')}</p></div>
    <p id="ad-load" role="status">{T('Loading fictional accounts…','正在载入虚构客户数据…')}</p><div id="ad-kpis" class="ad-kpis"></div>
    <div class="ad-two"><div class="ad-panel"><h3>{T('Eight weeks of advertising spend','八周广告消耗')}</h3><div id="ad-trend"></div><p class="ad-note">{T('Daily total for the selected market and industry · Aug 31–Oct 25','当前市场与行业的每日消耗合计 · 8 月 31 日至 10 月 25 日')}</p></div><div class="ad-panel"><h3>{T('Choose an account','选择客户')}</h3><p class="ad-note">{T('Compare last week with this week, then select an account below.','比较上周与本周的广告费，点击客户查看具体变化。')}</p><div class="ad-table-wrap" id="ad-clients"></div></div></div>
    <div id="ad-diagnosis" class="ad-diagnosis" aria-live="polite"></div><a id="ad-plan-link" class="text-link" href="#design">{T('Plan an experiment ↓','规划实验 ↓')}</a></section>
    <section id="design" class="ad-section">
    {heading('02','Plan a test for this account.','为选中的客户规划实验。','Question: can a user-experience ad increase the purchase rate compared with a product-description ad?','实验问题：用户体验型广告，能否比产品介绍型广告带来更高的购买率？')}
    <p class="ad-client-context" id="ad-plan-client" aria-live="polite"></p>
    <p class="ad-note">{T('This is a future experiment, not a completed test. Inputs below are planning assumptions; they are not inferred from the account dashboard.','这是未来实验的计划，尚未执行。下方参数是你填写的规划假设，不是从客户日报自动推算的结果。')}</p>
    <div class="ad-protocol"><div><span>{T('A vs B','比较什么')}</span><p>{T('A: an ad describing the product. B: an ad showing a user’s experience. Keep price and other conditions as similar as possible.','A 组：介绍产品的广告。B 组：展示用户使用体验的广告。价格等其他条件尽量保持一致。')}</p></div><div><span>{T('Random groups','如何分组')}</span><p>{T('Eligible users each have a 50% chance of entering either group. Keep the same user in the same group.','符合条件的用户各有 50% 概率进入 A 或 B 组，同一个人固定在同一组。')}</p></div><div><span>{T('What to compare','比较哪个比例')}</span><p>{T('Users who purchase within 7 days / all users assigned to that group. Count each buyer once, including non-clickers in the denominator.','分组后 7 天内购买人数 ÷ 该组全部用户数。每个购买者只计一次，没点击的人也保留在分母中。')}</p></div></div>
    <div class="ad-two ad-planner"><form id="ad-plan-form" class="ad-panel"><h3>{T('How many users do we need?','需要多少用户？')}</h3><div class="ad-fields"><label>{T('Assumed original purchase rate (%)','假设原购买率（%）')}<input id="ad-baseline" type="number" min="0.1" max="90" step="0.1" value="4" required></label><label>{T('Increase we want to detect (percentage points)','希望检测的增加幅度（百分点）')}<input id="ad-mde" type="number" min="0.01" max="10" step="0.01" value="0.4" required></label></div><button class="ad-button" type="submit">{T('Calculate users needed','计算所需人数')} →</button><details class="ad-method-details"><summary>{T('Calculation assumptions','计算依据')}</summary><p>{T('Fixed two-sided significance level 5%, power 80%, equal-sized independent groups. The increase is the target effect used to plan sample size, not a promised outcome. Fix the sample size before running the test.','固定双侧显著性水平 5%、统计功效 80%，假设两组等大且用户独立。增加幅度是规划样本量的目标效果，不是保证会发生的结果。实验前确定样本量。')}</p></details></form><div class="ad-plan-output ad-panel" id="ad-plan-output" aria-live="polite"></div></div></section>
    <section id="brief" class="ad-section">
    {heading('03','Generate the experiment plan.','生成实验计划。','Use the selected account and current assumptions to create a bilingual document.','根据选中的客户和当前参数，自动整理成可下载的中英文计划。')}
    <div class="ad-brief-panel"><p>{T('Template-generated locally; no LLM is connected. This document contains observations and a future plan, not experiment results.','本地模板自动生成，未接入 LLM。内容是数据观察与未来计划，不是实验结果。')}</p><div class="ad-brief-controls"><label class="sr-only" for="ad-brief-lang">{T('Plan language','计划语言')}</label><select id="ad-brief-lang"><option value="zh" {'selected' if zh else ''}>中文</option><option value="en" {'' if zh else 'selected'}>English</option></select><button class="ad-button" id="ad-generate" type="button" disabled>{T('Generate plan','生成计划')} ↗</button><button class="ad-button secondary" id="ad-download" type="button" disabled>{T('Download .txt','下载 .txt')}</button></div><p id="ad-brief-status" class="ad-note" role="status"></p><pre id="ad-brief" hidden></pre></div>
    </section><div class="ad-note ad-data-note"><p>{T('Data: Python-generated fictional records for 24 accounts over 56 days.','数据：Python 生成的 24 个虚构客户、56 天每日记录。')}</p><p>{T('The browser uses JavaScript for aggregation, interaction and sample-size calculation. Dashboard click-to-purchase rate uses clicks as its denominator; the planned experiment uses all assigned users.','网页使用 JavaScript 汇总、交互和计算样本量。看板点击购买率以点击次数为分母；实验购买率以全部已分组用户为分母。')}</p><p>{T('Independent prototype built with coding assistance. No real advertising experiment has been run.','使用编程辅助完成的独立原型，未实际开展广告实验。')}</p></div></main>'''

def write_adscope_assets(out):
    root=Path(__file__).resolve().parent
    (out/'assets/adscope-data.json').write_text(json.dumps(generate(),separators=(',',':')))
    for zh in [False,True]:
        title='看数据，规划一个实验。' if zh else 'Observe. Plan a test.'
        labels=['看客户数据','规划实验','生成计划'] if zh else ['Observe','Plan a test','Write a plan']
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="600" fill="#eaf0ec"/><g font-family="Arial, sans-serif"><text x="55" y="65" fill="#526a61" font-size="14" letter-spacing="3">ADSCOPE / STATISTICAL THINKING</text><text x="55" y="140" fill="#203e34" font-size="42">{title}</text><rect x="55" y="195" width="790" height="245" rx="8" fill="#fcfdfb"/><path d="M 110 385 H 785 M 340 235 V 405" stroke="#c6d1c9"/><path d="M 140 260 L 185 275 L 230 265 L 275 310 L 315 340" stroke="#a77a4a" stroke-width="5" fill="none"/><path d="M 405 270 H 650 M 470 330 H 765" stroke="#315bd4" stroke-width="4"/><path d="M 405 258 V 282 M 650 258 V 282 M 470 318 V 342 M 765 318 V 342" stroke="#315bd4" stroke-width="3"/><circle cx="530" cy="270" r="7" fill="#315bd4"/><circle cx="610" cy="330" r="7" fill="#315bd4"/><path d="M 445 220 V 385" stroke="#a9b6ad" stroke-dasharray="4 5"/><text x="110" y="420" fill="#5d6a63" font-size="13">SPEND</text><text x="405" y="420" fill="#5d6a63" font-size="13">A / B SAMPLE PLANNING</text>'
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
