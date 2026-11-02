"""Seeded, fictional daily account data. No platform or company data is used."""
from pathlib import Path
import random,json,datetime

ROOT=Path(__file__).resolve().parents[1]
def generate():
    rng=random.Random(20261102)
    records=[]
    countries=['US','UK','SG']
    industries=['beauty','apparel']
    for client in range(24):
        country=countries[client%3]; industry=industries[(client//3)%2]
        base=800+client*42
        for day in range(56):
            latest=day>=49
            # Designed operational shock; correlations are not causal evidence.
            shock=.56 if latest and client==0 else .78 if latest and country=='US' and industry=='beauty' else 1
            spend=round(base*(1+day*.002)*rng.uniform(.91,1.09)*shock,2)
            impressions=round(spend/8*1000)
            ctr=.019*(.72 if latest and client==0 else 1)*rng.uniform(.95,1.05)
            clicks=round(impressions*ctr)
            purchases=round(clicks*.035*rng.uniform(.94,1.06))
            records.append(dict(client=f'C{client+1:02}',country=country,industry=industry,
              date=str(datetime.date(2026,8,31)+datetime.timedelta(days=day)),day=day,
              spend=spend,impressions=impressions,clicks=clicks,purchases=purchases,
              active_ads=4 if latest and client==0 else 8))
    return {'seed':20261102,'currency':'USD','timezone':'UTC','synthetic':True,'records':records}
if __name__=='__main__':
    out=(ROOT/'dist' if (ROOT/'dist').exists() else ROOT)/'assets/adscope-data.json'
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(generate(),separators=(',',':')))
    print(f'Wrote {out.name}: 24 fictional accounts × 56 days')
