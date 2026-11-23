import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/mnt/data/laundry_optionA_work')
styles=ROOT.joinpath('styles.css').read_text(); appjs=ROOT.joinpath('app.js').read_text(); configjs=ROOT.joinpath('config.js').read_text()
base_html='<div id="app"></div><div id="toast" class="toast" aria-live="polite"></div><div id="printArea" class="print-area"></div>'
customers=[{'id':'c1','customer_code':'C01001','name':'Aisha Demo','mobile':'+971500001001','address':'Al Qusais, Dubai','access_enabled':True,'created_at':'2026-11-23T00:00:00Z'},{'id':'c11','customer_code':'C01011','name':'Rishi','mobile':'9895494496','address':'Kerala, India','access_enabled':True,'created_at':'2026-11-23T00:00:00Z'}]
staff=[{'id':'a1','login_id':'admin','display_name':'Amina — Admin','role':'admin','phone':'+971500000101','active':True},{'id':'m1','login_id':'manager','display_name':'Khalid — Manager','role':'manager','phone':'+971500000102','active':True},{'id':'d1','login_id':'driver','display_name':'Rafi — Delivery','role':'delivery','phone':'+971500000103','active':True}]
garments=[{'id':'g1','code':'shirt','name':'Shirt','active':True,'sort_order':10},{'id':'g2','code':'trouser','name':'Trouser','active':True,'sort_order':20},{'id':'g3','code':'dress','name':'Dress','active':True,'sort_order':30}]
services=[{'id':'s1','code':'wash_only','name':'Wash Only','workflow':'wash_only','active':True,'sort_order':5},{'id':'s2','code':'wash_iron','name':'Wash + Iron','workflow':'wash_iron','active':True,'sort_order':10},{'id':'s3','code':'iron_only','name':'Iron Only','workflow':'iron_only','active':True,'sort_order':20},{'id':'s4','code':'dry_clean','name':'Dry Clean','workflow':'dry_clean','active':True,'sort_order':30}]
rates=[]
for g in garments:
    for i,s in enumerate(services,1): rates.append({'id':f'r{g["id"]}{s["id"]}','garment_type_id':g['id'],'service_id':s['id'],'unit_price':5+i+(0 if g['id']=='g1' else 2),'active':True,'effective_from':'2026-11-23','effective_to':None})
refs={'garments':garments,'services':services,'rates':rates,'discounts':[],'settings':{'business':{'name':'Smart Look','address':'Al Qusais, Street 1','phone':'','currency':'AED','timezone':'Asia/Dubai'}}}
summary={'stage_counts':{'received':1},'outstanding':30,'payments_received':0,'customer_credits':50,'active_orders':1}
order={'id':'o1','order_no':'LD-261123-01001','customer_id':'c11','channel':'counter','laundry_status':'received','total':30,'created_at':'2026-11-23T08:00:00Z','updated_at':'2026-11-23T08:00:00Z','customer':customers[1],'items':[{'id':'i1','garment_type_id':'g1','service_id':'s2','quantity':2,'unit_price':9,'line_total':18,'garment':garments[0],'service':services[1]}],'pieces':[],'payments':[],'paid':0,'received':0,'outstanding':30,'payment_status':'unpaid','customer_credit':0,'next_statuses':['washing']}
report={'ok':True,'range':{'from':'2026-11-01','to':'2026-11-23','calendar_month':'2026-11'},'period':{'orders':1,'pieces':2,'sales':30,'payments_received':0,'collected':0,'delivered':0,'avg_order_value':30,'credit_added':0,'credit_applied':0},'current':{'active_orders':1,'outstanding':30,'customer_credit':50,'quick_stage_counts':{'received':1},'aging':{},'detailed_stage_counts':{'received':1}},'series':[],'customers':[],'breakdowns':{'payment_method':{},'payment_context':{}},'calendar':[]}
finance={'ok':True,'customer':customers[1],'outstanding':30,'credit':50,'net_position':-20,'wallet':[{'id':'w1','amount':50,'entry_type':'advance','note':'Advance received','method':'cash','reference_no':'ADVANCE','created_at':'2026-11-23T08:00:00Z','balance_after':50}],'receipts':[]}
def bootstrap(role):
    actor={'admin':{'id':'a1','actor_type':'staff','role':'admin','display_name':'Amina — Admin'},'manager':{'id':'m1','actor_type':'staff','role':'manager','display_name':'Khalid — Manager'},'delivery':{'id':'d1','actor_type':'staff','role':'delivery','display_name':'Rafi — Delivery'},'customer':{'id':'c11','actor_type':'customer','role':'customer','display_name':'Rishi','name':'Rishi','mobile':'9895494496','customer_code':'C01011','address':'Kerala, India'}}[role]
    orders=[dict(order)] if role in ('admin','manager') else []
    if role=='delivery':
        x=dict(order);x.update({'channel':'pickup','laundry_status':'pickup_requested','pickup_driver_id':'d1','delivery_driver_id':None,'items':[],'outstanding':0,'total':0,'payment_status':'unpriced','next_statuses':['collected']});orders=[x]
    return {'ok':True,'actor':actor,'refs':refs,'orders':orders,'customers':customers if role in ('admin','manager') else [],'staff':staff if role=='admin' else ([staff[2]] if role=='manager' else []),'summary':summary}
results=[]
def check(name,cond):
    results.append((name,bool(cond)))
    if not cond: raise AssertionError(name)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for role in ('admin','manager','delivery'):
        page=browser.new_page(viewport={'width':1280,'height':900}); actions=[]
        def handler(route,request,role=role):
            url=request.url
            if url.endswith('/bootstrap'): route.fulfill(status=200,content_type='application/json',body=json.dumps(bootstrap(role)))
            elif '/customer-finance?' in url: route.fulfill(status=200,content_type='application/json',body=json.dumps(finance))
            elif '/reports?' in url: route.fulfill(status=200,content_type='application/json',body=json.dumps(report))
            elif url.endswith('/action'):
                body=request.post_data_json or {};actions.append(body)
                resp={'ok':True}
                if body.get('action')=='record_customer_payment': resp['result']={'received':100,'allocated':30,'advance_added':70,'allocations':[{'order_id':'o1','order_no':'LD-261123-01001','amount':30}]}
                route.fulfill(status=200,content_type='application/json',body=json.dumps(resp))
            else: route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
        page.route('https://bfmsoerewmiqianxmcck.supabase.co/**',handler)
        page.set_content(base_html);page.add_style_tag(content=styles)
        page.evaluate("""() => { Object.defineProperty(window,'localStorage',{value:{_:{laundry_token:'x'},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}}}); }""")
        page.add_script_tag(content=configjs);page.add_script_tag(content=appjs);page.wait_for_selector('.shell')
        if role=='manager':
            check('manager home has 3 quick actions',page.locator('.home-quick-card').count()==3)
            check('manager Create nav removed',page.locator('[data-view="new"]').count()==0)
            page.locator('[data-action="counter-order"]').first.click();page.wait_for_selector('#counterForm')
            check('counter uses service chips',page.locator('.collection-service-chip').count()==4)
            page.locator('[data-action="collection-service"][data-id="s2"]').click();page.locator('[data-qty="s2|g1"][data-delta="1"]').click()
            page.locator('[data-action="collection-service"][data-id="s4"]').click();page.locator('[data-qty="s4|g3"][data-delta="1"]').click()
            check('mixed services retained',page.locator('#collectionSummary').inner_text().find('2')>=0)
            page.locator('#counterForm select[name="customer_id"]').select_option('c11');page.locator('#counterForm button.btn.primary.block').last.click();page.wait_for_timeout(100)
            create=[a for a in actions if a.get('action')=='create_counter_order'][-1]
            check('counter submits two service lines',len(create.get('items',[]))==2 and {x['service_id'] for x in create['items']}=={'s2','s4'})
            page.locator('[data-view="orders"]').first.click();check('order row has direct Pay',page.locator('[data-action="payment"][data-id="o1"]').count()>=1)
            page.locator('[data-view="customers"]').first.click();page.locator('[data-action="customer-account"][data-id="c11"]').click();page.wait_for_selector('#customerAccountPaymentForm')
            check('customer account shows advance ledger',page.get_by_text('Advance received',exact=True).count()>=1)
            page.locator('#customerAccountPaymentForm input[name="amount"]').fill('100');page.locator('#customerAccountPaymentForm button[type="submit"]').click();page.wait_for_timeout(120)
            check('customer payment action sent',any(a.get('action')=='record_customer_payment' and str(a.get('amount'))=='100' for a in actions))
        elif role=='admin':
            check('admin home has quick actions',page.locator('.home-quick-card').count()==3)
            page.locator('[data-view="admin"]').first.click();page.locator('[data-admin-tab="catalog"]').click();page.locator('[data-action="new-service"]').click();
            check('admin service supports dry clean',page.locator('#serviceForm select[name="workflow"] option[value="dry_clean"]').count()==1)
        elif role=='delivery':
            page.locator('[data-action="open-order"]').first.click();page.locator('[data-action="collect"]').click();page.wait_for_selector('#collectForm')
            check('delivery collection uses service chips',page.locator('#collectForm .collection-service-chip').count()==4)
            page.locator('[data-action="collection-service"][data-id="s1"]').click();page.locator('[data-qty="s1|g2"][data-delta="1"]').click();page.locator('[data-action="collection-service"][data-id="s3"]').click();page.locator('[data-qty="s3|g1"][data-delta="1"]').click()
            page.locator('#collectForm button.btn.primary.block').last.click();page.wait_for_timeout(100)
            collect=[a for a in actions if a.get('action')=='collect_pickup'][-1]
            check('delivery submits mixed services',len(collect.get('items',[]))==2 and {x['service_id'] for x in collect['items']}=={'s1','s3'})
        page.close()
    browser.close()
print(json.dumps({'passed':sum(v for _,v in results),'total':len(results),'results':results},indent=2))
