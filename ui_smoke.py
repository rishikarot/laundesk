import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/mnt/data/laundry_dev')
styles=ROOT.joinpath('styles.css').read_text(); appjs=ROOT.joinpath('app.js').read_text(); configjs=ROOT.joinpath('config.js').read_text()
base_html='<div id="app"></div><div id="toast" class="toast" aria-live="polite"></div><div id="printArea" class="print-area"></div>'
customers=[{'id':'c1','customer_code':'C01001','name':'Aisha Demo','mobile':'+971500001001','address':'Al Qusais, Dubai','access_enabled':True,'created_at':'2026-11-23T00:00:00Z'},{'id':'c11','customer_code':'C01011','name':'Rishi','mobile':'9895494496','address':'Kerala, India','access_enabled':True,'created_at':'2026-11-23T00:00:00Z'}]
staff=[{'id':'a1','login_id':'admin','display_name':'Amina — Admin','role':'admin','phone':'+971500000101','active':True},{'id':'m1','login_id':'manager','display_name':'Khalid — Manager','role':'manager','phone':'+971500000102','active':True},{'id':'d1','login_id':'driver','display_name':'Rafi — Delivery','role':'delivery','phone':'+971500000103','active':True}]
garments=[{'id':'g1','code':'shirt','name':'Shirt','active':True,'sort_order':10}]; services=[{'id':'s1','code':'wash_iron','name':'Wash + Iron','workflow':'wash_iron','active':True,'sort_order':10}]; rates=[{'id':'r1','garment_type_id':'g1','service_id':'s1','unit_price':8,'active':True,'effective_from':'2026-11-23','effective_to':None}]
refs={'garments':garments,'services':services,'rates':rates,'discounts':[],'settings':{'business':{'name':'Smart Look','address':'Al Qusais, Street 1','phone':'','currency':'AED','timezone':'Asia/Dubai'}}}; summary={'stage_counts':{},'outstanding':0,'payments_received':0,'customer_credits':0,'active_orders':0}
report={'ok':True,'range':{'from':'2026-11-01','to':'2026-11-23','calendar_month':'2026-11'},'period':{'orders':0,'pieces':0,'sales':0,'payments_received':0,'collected':0,'delivered':0,'avg_order_value':0,'credit_added':0,'credit_applied':0},'current':{'active_orders':0,'outstanding':0,'customer_credit':0,'quick_stage_counts':{},'aging':{},'detailed_stage_counts':{}},'series':[],'customers':[],'breakdowns':{'payment_method':{},'payment_context':{}},'calendar':[]}
def bootstrap(role):
    actor={'admin':{'id':'a1','actor_type':'staff','role':'admin','display_name':'Amina — Admin'},'manager':{'id':'m1','actor_type':'staff','role':'manager','display_name':'Khalid — Manager'},'delivery':{'id':'d1','actor_type':'staff','role':'delivery','display_name':'Rafi — Delivery'},'customer':{'id':'c11','actor_type':'customer','role':'customer','display_name':'Rishi','name':'Rishi','mobile':'9895494496','customer_code':'C01011','address':'Kerala, India'}}[role]
    return {'ok':True,'actor':actor,'refs':refs,'orders':[],'customers':customers if role in ('admin','manager') else [],'staff':staff if role=='admin' else ([staff[2]] if role=='manager' else []),'summary':summary}
results=[]
def check(name,cond): results.append((name,bool(cond))); (_ for _ in ()).throw(AssertionError(name)) if not cond else None
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for role in ('admin','manager','delivery','customer'):
        page=browser.new_page(viewport={'width':1280,'height':850}); page.on('pageerror',lambda e: print('PAGEERROR',e)); page.on('console',lambda m: print('CONSOLE',m.type,m.text) if m.type=='error' else None)
        actions=[]
        def api_handler(route,request,role=role):
            url=request.url
            if url.endswith('/bootstrap'): route.fulfill(status=200,content_type='application/json',body=json.dumps(bootstrap(role)))
            elif '/reports?' in url: route.fulfill(status=200,content_type='application/json',body=json.dumps(report))
            elif url.endswith('/action'):
                body=request.post_data_json or {}; actions.append(body); resp={'ok':True}
                if body.get('action')=='save_customer': resp['temporary_pin']='123456' if not body.get('id') else None
                if body.get('action')=='reset_demo_data': resp['reset']={'orders':4,'payments':6,'credits':2,'events':8,'items':7,'pieces':9}
                route.fulfill(status=200,content_type='application/json',body=json.dumps(resp))
            elif url.endswith('/logout'): route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
            else: route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
        page.route('https://bfmsoerewmiqianxmcck.supabase.co/**',api_handler)
        page.set_content(base_html)
        page.add_style_tag(content=styles)
        page.evaluate("""() => { try { localStorage.setItem('laundry_token','test-token'); } catch(e) { Object.defineProperty(window,'localStorage',{value:{_:{laundry_token:'test-token'},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}}}); } }""")
        page.add_script_tag(content=configjs)
        page.evaluate("""() => { window.XLSX={utils:{book_new:()=>({}),aoa_to_sheet:d=>({d}),book_append_sheet:()=>{}},writeFile:(wb,n)=>{window.__xlsx=n}}; class Doc{constructor(){this.lastAutoTable={finalY:100}}setFontSize(){}text(){}autoTable(){this.lastAutoTable={finalY:100}}addPage(){}save(n){window.__pdf=n}} window.jspdf={jsPDF:Doc}; window.jspdf.jsPDF.API={autoTable:function(){}}; }""")
        page.add_script_tag(content=appjs)
        page.wait_for_selector('.shell')
        check(f'{role}: shell rendered',page.locator('.shell').count()==1)
        if role=='admin':
            page.locator('[data-view="admin"]').first.click(); page.locator('[data-admin-tab="customers"]').click(); check('admin: quick customer row',page.locator('#customerQuickForm').count()==1); check('admin: Rishi visible',page.get_by_text('Rishi',exact=True).count()>=1)
            page.locator('[data-action="edit-customer"][data-id="c11"]').click(); check('admin: customer edit prefilled',page.locator('#customerForm input[name="mobile"]').input_value()=='9895494496'); page.locator('[data-action="close-modal"]').click(); page.locator('[data-admin-tab="rates"]').click(); check('admin: rate quick add row',page.locator('[data-action="quick-save-rate"]').count()==1)
            page.locator('[data-rate-price]').fill('9.50'); page.locator('[data-rate-date]').fill('2026-12-01'); page.locator('[data-action="save-rate-row"]').click(); page.wait_for_timeout(100); check('admin: inline rate payload',any(a.get('action')=='save_rate' and a.get('id')=='r1' and str(a.get('unit_price'))=='9.50' and a.get('effective_from')=='2026-12-01' for a in actions))
            page.locator('[data-view="reports"]').first.click(); page.wait_for_timeout(100); check('admin: Excel export available',page.locator('[data-action="export-excel"]').count()==1); check('admin: PDF export available',page.locator('[data-action="export-pdf"]').count()==1); page.locator('[data-action="export-excel"]').click(); page.wait_for_timeout(20); check('admin: Excel export invoked',bool(page.evaluate('window.__xlsx'))); page.locator('[data-action="export-pdf"]').click(); page.wait_for_timeout(20); check('admin: PDF export invoked',bool(page.evaluate('window.__pdf')))
            page.locator('[data-view="admin"]').first.click(); page.locator('[data-admin-tab="system"]').click(); check('admin: System tab available',page.locator('[data-action="open-demo-reset"]').count()==1); page.locator('[data-action="open-demo-reset"]').click(); check('admin: reset confirmation modal',page.locator('#demoResetForm').count()==1); page.locator('#demoResetForm input[name="confirmation"]').fill('RESET'); page.locator('#demoResetForm button[type="submit"]').click(); page.wait_for_timeout(120); check('admin: reset action payload',any(a.get('action')=='reset_demo_data' and a.get('confirmation')=='RESET' for a in actions))
        elif role=='manager':
            check('manager: Customers nav available',page.locator('[data-view="customers"]').count()>=1); page.locator('[data-view="customers"]').first.click(); check('manager: customer quick add',page.locator('#customerQuickForm').count()==1); page.locator('[data-action="edit-customer"][data-id="c11"]').click(); check('manager: customer edit allowed',page.locator('#customerForm').count()==1); page.locator('[data-action="close-modal"]').click(); check('manager: no access toggle',page.locator('[data-action="toggle-customer"]').count()==0)
        elif role=='delivery': check('delivery: role nav simple',all(page.locator(f'[data-view="{v}"]').count()>=1 for v in ['stops','orders','history','reports','account']))
        else: check('customer: own role nav',all(page.locator(f'[data-view="{v}"]').count()>=1 for v in ['home','orders','pickup','reports','account']))
        page.close()
    browser.close()
print(json.dumps({'passed':sum(v for _,v in results),'total':len(results),'results':results},indent=2))
