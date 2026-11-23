import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/mnt/data/laundry_flow_work')
styles=ROOT.joinpath('styles.css').read_text(); appjs=ROOT.joinpath('app.js').read_text(); configjs=ROOT.joinpath('config.js').read_text()
base_html='<div id="app"></div><div id="toast" class="toast" aria-live="polite"></div><div id="printArea" class="print-area"></div>'
customers=[
 {'id':'c1','customer_code':'C01001','name':'Aisha Demo','mobile':'+971500001001','address':'Al Qusais, Dubai','building_block':'Al Qusais Block A','door_no':'101','access_enabled':True,'created_at':'2026-11-20T00:00:00Z'},
 {'id':'c2','customer_code':'C01002','name':'Omar Demo','mobile':'+971500001002','address':'Al Qusais, Dubai','building_block':'Al Qusais Block A','door_no':'204','access_enabled':True,'created_at':'2026-11-21T00:00:00Z'},
 {'id':'c3','customer_code':'C01003','name':'Sara Demo','mobile':'+971500001003','address':'Al Qusais, Dubai','building_block':'Al Qusais Block B','door_no':'305','access_enabled':True,'created_at':'2026-11-22T00:00:00Z'},
]
staff=[
 {'id':'a1','login_id':'admin','display_name':'Amina — Admin','role':'admin','phone':'','active':True},
 {'id':'m1','login_id':'manager','display_name':'Khalid — Manager','role':'manager','phone':'','active':True},
 {'id':'d1','login_id':'driver','display_name':'Rafi — Delivery','role':'delivery','phone':'','active':True},
]
garments=[{'id':'g1','code':'shirt','name':'Shirt','active':True,'sort_order':10}]
services=[{'id':'s1','code':'wash_iron','name':'Wash + Iron','workflow':'wash_iron','active':True,'sort_order':10}]
rates=[{'id':'r1','garment_type_id':'g1','service_id':'s1','unit_price':8,'active':True,'effective_from':'2026-01-01','effective_to':None}]
refs={'garments':garments,'services':services,'rates':rates,'discounts':[],'settings':{'business':{'name':'Smart Look','address':'Al Qusais','currency':'AED'},'workflow':{'confirm_stage_changes':False}}}
summary={'stage_counts':{'pickup_requested':3},'outstanding':0,'payments_received':0,'customer_credits':0,'active_orders':3}
def order(oid,cust,driver=None):
    return {'id':oid,'order_no':'LD-'+oid.upper(),'customer_id':cust['id'],'channel':'pickup','laundry_status':'pickup_requested','pickup_driver_id':driver,'delivery_driver_id':None,'delivery_address':cust['address'],'total':0,'subtotal':0,'discount_amount':0,'created_at':'2026-11-23T08:00:00Z','updated_at':'2026-11-23T08:00:00Z','customer':cust,'items':[],'pieces':[],'payments':[],'paid':0,'received':0,'outstanding':0,'payment_status':'unpriced','customer_credit':0,'next_statuses':['collected']}
orders=[order('o1',customers[0]),order('o2',customers[1]),order('o3',customers[2])]
def bootstrap(role):
    actor={'admin':{'id':'a1','actor_type':'staff','role':'admin','display_name':'Amina — Admin'},'manager':{'id':'m1','actor_type':'staff','role':'manager','display_name':'Khalid — Manager'},'delivery':{'id':'d1','actor_type':'staff','role':'delivery','display_name':'Rafi — Delivery'}}[role]
    role_orders=orders if role in ('admin','manager') else [order('o1',customers[0],'d1'),order('o2',customers[1],'d1')]
    return {'ok':True,'actor':actor,'refs':refs,'orders':role_orders,'customers':customers if role in ('admin','manager') else [],'staff':staff if role=='admin' else ([staff[2]] if role=='manager' else []),'summary':summary}
results=[]
def check(name,cond):
    results.append((name,bool(cond)))
    if not cond: raise AssertionError(name)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for role in ('manager','admin','delivery'):
        page=browser.new_page(viewport={'width':1360,'height':900}); actions=[]
        def handler(route,request,role=role):
            url=request.url
            if url.endswith('/bootstrap'):
                route.fulfill(status=200,content_type='application/json',body=json.dumps(bootstrap(role)))
            elif url.endswith('/action'):
                body=request.post_data_json or {};actions.append(body)
                resp={'ok':True}
                if body.get('action')=='bulk_assign_pickups': resp.update({'assigned':len(body.get('order_ids',[])),'order_ids':body.get('order_ids',[])})
                route.fulfill(status=200,content_type='application/json',body=json.dumps(resp))
            else:
                route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
        page.route('https://bfmsoerewmiqianxmcck.supabase.co/**',handler)
        page.set_content(base_html);page.add_style_tag(content=styles)
        page.evaluate("""() => { Object.defineProperty(window,'localStorage',{value:{_:{laundry_token:'x'},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}}}); window.confirm=()=>{throw new Error('confirm should not be called when disabled')}; }""")
        page.add_script_tag(content=configjs);page.add_script_tag(content=appjs);page.wait_for_selector('.shell')
        if role=='manager':
            page.locator('[data-view="orders"]').first.click()
            check('bulk pickup assignment panel visible',page.locator('.bulk-pickup-card').count()==1)
            check('building filter present',page.locator('#pickupBuildingFilter').count()==1)
            page.locator('#pickupBuildingFilter').select_option(label='Al Qusais Block A')
            check('building filter shows two rows',page.locator('[data-bulk-pickup]').count()==2)
            page.locator('[data-action="toggle-all-pickups"]').click()
            check('two pickup orders selected',page.locator('[data-bulk-pickup]:checked').count()==2)
            page.locator('#bulkPickupDriver').select_option('d1')
            page.locator('[data-action="bulk-assign-pickups"]').click(); page.wait_for_timeout(150)
            bulk=[a for a in actions if a.get('action')=='bulk_assign_pickups']
            check('bulk assign sends two order ids',len(bulk)==1 and set(bulk[0].get('order_ids',[]))=={'o1','o2'} and bulk[0].get('driver_id')=='d1')
            page.locator('[data-view="orders"]').first.click(); page.locator('[data-action="open-order"][data-id="o1"]').click()
            check('all future quick stages enabled',page.locator('[data-action="set-quick-stage"][data-id="o1"]').count()==5)
            page.locator('[data-action="set-quick-stage"][data-status="ready"]').click(); page.wait_for_timeout(120)
            quick=[a for a in actions if a.get('action')=='set_quick_stage']
            check('ready can be tagged directly without confirmation',len(quick)>=1 and quick[-1].get('target_status')=='ready')
            page.locator('[data-view="customers"]').first.click()
            check('customer building filter present',page.locator('#customerBuildingFilter').count()==1)
            page.locator('#customerBuildingFilter').select_option(label='Al Qusais Block B')
            check('customer building filter works',page.locator('.customer-table tbody tr').count()==1 and 'Sara Demo' in page.locator('.customer-table tbody tr').inner_text())
            check('customer sort control present',page.locator('#customerSort').count()==1)
            page.locator('[data-action="edit-customer"][data-id="c3"]').click()
            check('customer edit has building field',page.locator('#customerForm input[name="building_block"]').count()==1)
            check('customer edit has door field',page.locator('#customerForm input[name="door_no"]').count()==1)
        elif role=='admin':
            page.locator('[data-view="admin"]').first.click(); page.locator('[data-admin-tab="workflow"]').click()
            check('workflow setup tab present',page.locator('#workflowSettingsForm').count()==1)
            check('confirmation default off',not page.locator('#workflowSettingsForm input[name="confirm_stage_changes"]').is_checked())
            page.locator('#workflowSettingsForm input[name="confirm_stage_changes"]').check(); page.locator('#workflowSettingsForm .btn.primary').click(); page.wait_for_timeout(100)
            wf=[a for a in actions if a.get('action')=='save_workflow_settings']
            check('workflow confirmation setting saves',len(wf)==1 and wf[0].get('confirm_stage_changes') is True)
        elif role=='delivery':
            check('delivery stops has building filter',page.locator('#deliveryBuildingFilter').count()==1)
            check('delivery stops has sorting',page.locator('#deliverySort').count()==1)
            page.locator('#deliveryBuildingFilter').select_option(label='Al Qusais Block A')
            check('delivery sees assigned block stops',page.locator('[data-order-card]').count()>=2)
        page.close()
    browser.close()
print(json.dumps({'passed':sum(v for _,v in results),'total':len(results),'results':results},indent=2))
