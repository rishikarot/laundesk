(() => {
  const cfg = window.LAUNDRY_CONFIG;
  const STAGES = [
    ["pickup_requested","Requested"],["collected","Collected"],["received","Received"],
    ["processing","Processing"],["washing","Washing"],["ironing","Ironing"],["ready","Ready"],["out_for_delivery","Out for delivery"],["delivered","Delivered"]
  ];
  const QUICK_STAGES = [
    ["pickup_requested","Pickup requested"],["collected","Collected"],["received","Received"],
    ["in_progress","In progress"],["ready","Ready"],["delivered","Delivered"]
  ];
  const state = {
    token: localStorage.getItem("laundry_token") || "",
    data: null,
    view: "home",
    modal: null,
    busy: false,
    qty: {},
    serviceId: null,
    garmentSearch: "",
    theme: localStorage.getItem("laundry_theme") || "#64748b",
    mode: localStorage.getItem("laundry_mode") || "graphite",
    orderView: localStorage.getItem("laundry_order_view") || "optimal",
    orderFilter: "all",
    workflowMode: localStorage.getItem("laundry_workflow_mode") || "quick",
    reportTab: "overview",
    reportPreset: localStorage.getItem("laundry_report_preset") || "this_month",
    reportGroup: localStorage.getItem("laundry_report_group") || "day",
    reportFrom: "",
    reportTo: "",
    reportCalendarMonth: "",
    reportData: null,
    reportLoading: false,
    adminTab: "business",
    customerBuildingFilter: "all",
    customerSort: "building",
    pickupBuildingFilter: "all",
    pickupSort: "building",
    deliveryBuildingFilter: "all",
    deliverySort: "building",
    bulkPickupSelected: new Set(),
  };
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const esc = (v="") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const fmt = n => `AED ${Number(n || 0).toFixed(2)}`;
  const stageLabel = s => STAGES.find(x=>x[0]===s)?.[1] || s;
  const quickStageKey = s => ["processing","washing","ironing"].includes(s)?"in_progress":["ready","out_for_delivery"].includes(s)?"ready":s;
  const quickStageLabel = s => QUICK_STAGES.find(x=>x[0]===quickStageKey(s))?.[1] || stageLabel(s);
  const roleName = r => ({admin:"Admin",manager:"Manager",delivery:"Delivery",customer:"Customer"}[r] || r);
  const id = x => document.getElementById(x);

  const DUBAI_OFFSET_MS=4*3600*1000;
  function dubaiDate(){const d=new Date(Date.now()+DUBAI_OFFSET_MS);return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()))}
  function dateKey(d){return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`}
  function addDays(d,n){const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x}
  function monthEnd(d){return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0))}
  function reportRange(preset=state.reportPreset){
    const today=dubaiDate(), wd=today.getUTCDay()||7; let from=today,to=today,label="Today";
    if(preset==="yesterday"){from=to=addDays(today,-1);label="Yesterday"}
    else if(preset==="this_week"){from=addDays(today,-wd+1);to=today;label="This week"}
    else if(preset==="last_week"){to=addDays(today,-wd);from=addDays(to,-6);label="Last week"}
    else if(preset==="this_month"){from=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),1));to=today;label="This month"}
    else if(preset==="last_month"){const d=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth()-1,1));from=d;to=monthEnd(d);label="Last month"}
    else if(preset==="this_year"){from=new Date(Date.UTC(today.getUTCFullYear(),0,1));to=today;label="This year"}
    else if(preset==="custom"){return {from:state.reportFrom||dateKey(today),to:state.reportTo||dateKey(today),label:"Custom"}}
    return {from:dateKey(from),to:dateKey(to),label};
  }
  if(!state.reportCalendarMonth) state.reportCalendarMonth=dateKey(dubaiDate()).slice(0,7);

  const THEME_PRESETS = ["#64748b","#2563eb","#0f766e","#7c3aed","#b45309"];
  function applyTheme(color, persist=true){
    if(!/^#[0-9a-f]{6}$/i.test(color||"")) color="#64748b";
    state.theme=color.toLowerCase();
    document.documentElement.style.setProperty("--brand-accent",state.theme);
    if(persist) localStorage.setItem("laundry_theme",state.theme);
  }
  function applyMode(mode, persist=true){
    state.mode=mode==="light"?"light":"graphite";
    document.documentElement.dataset.theme=state.mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",state.mode==="graphite"?"#0d0f11":"#f6f7f8");
    if(persist) localStorage.setItem("laundry_mode",state.mode);
  }
  function business(){
    return state.data?.refs?.settings?.business || {name:"Laundry Desk",address:"",phone:"",currency:"AED"};
  }
  function workflowSettings(){
    return state.data?.refs?.settings?.workflow || {confirm_stage_changes:false};
  }
  function customerLocationLabel(c,includeArea=true){
    return [c?.building_block||null,c?.door_no?`Door ${c.door_no}`:null,includeArea?c?.address||null:null].filter(Boolean).join(" · ") || (includeArea?c?.address||"":"");
  }
  function icon(name, cls=""){
    const paths={
      home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-7h6v7"/>',
      orders:'<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      reports:'<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.97 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.6 8.97a1.7 1.7 0 0 0-.34-1.88L4.2 7.03 7.03 4.2l.06.06A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.04V3h4v.08a1.7 1.7 0 0 0 1.03 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15z"/>',
      route:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3"/>',
      history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
      user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      pickup:'<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
      admin:'<path d="M4 5h16v14H4zM8 9h8M8 13h5"/>',
      palette:'<path d="M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 1.4-2.9l-.4-.5a1.8 1.8 0 0 1 1.4-2.9H17a4 4 0 0 0 4-4A7.7 7.7 0 0 0 12 3z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.8" r=".8"/><circle cx="14" cy="6.8" r=".8"/>',
      sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
      moon:'<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2z"/>',
      building:'<path d="M4 21V5l8-3 8 3v16"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2M2 21h20"/>',
      logout:'<path d="M10 17l5-5-5-5M15 12H3M14 3h7v18h-7"/>',
      payment:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 15h4"/>',
      wallet:'<path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/><path d="M14 10h8v5h-8a2.5 2.5 0 0 1 0-5z"/><circle cx="16.5" cy="12.5" r=".7"/>',
      driver:'<circle cx="8" cy="7" r="3"/><path d="M3 20a5 5 0 0 1 10 0M15 8h4l2 3v5h-6z"/><circle cx="17" cy="18" r="2"/><circle cx="21" cy="18" r="2"/>',
      print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
      whatsapp:'<path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-3.9A8 8 0 1 1 20 11.5z"/><path d="M9 8.5c.5 2.2 2.3 4 4.5 4.8l1.3-1.2 1.8.6"/>',
      arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
      tag:'<path d="M20 13 13 20l-9-9V4h7z"/><circle cx="8.5" cy="8.5" r="1"/>',
      download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'
    };
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.home}</svg>`;
  }
  applyTheme(state.theme,false);
  applyMode(state.mode,false);

  function toast(message, error=false){
    toastEl.textContent = message; toastEl.className = "toast show" + (error ? " error" : "");
    clearTimeout(toast._t); toast._t = setTimeout(()=>toastEl.className="toast",2600);
  }

  async function api(path, {method="GET", body=null, auth=true}={}){
    const headers = {"Content-Type":"application/json","apikey":cfg.publishableKey};
    if(auth && state.token) headers.Authorization = `Bearer ${state.token}`;
    const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),20000);
    let res;
    try{res=await fetch(cfg.apiUrl + path, {method,headers,body:body?JSON.stringify(body):undefined,signal:controller.signal})}
    catch(e){if(e.name==="AbortError")throw new Error("Connection is taking too long. Please try again.");throw e}
    finally{clearTimeout(timeout)}
    let payload = {};
    try{payload=await res.json()}catch{}
    if(!res.ok || payload.ok===false){
      if(res.status===401 && auth){ logout(false); }
      throw new Error(payload.error || `Request failed (${res.status})`);
    }
    return payload;
  }

  async function refresh(show=false){
    if(!state.token) return renderLogin();
    try{
      if(show) setBusy(true);
      state.data = await api("/bootstrap");
      const r = state.data.actor.role;
      if(!validViews(r).includes(state.view)) state.view = validViews(r)[0];
      renderApp();
    }catch(e){toast(e.message,true); if(!state.token) renderLogin();}
    finally{if(show) setBusy(false)}
  }

  const busyButtons = new Set();
  function processingText(button, fallback="Processing…"){
    const text=(button?.textContent||"").trim().toLowerCase();
    if(text.includes("sign in")) return "Signing in…";
    if(text.includes("sign out")||text==="exit") return "Signing out…";
    if(text.includes("request pickup")) return "Requesting…";
    if(text.includes("collect")) return "Collecting…";
    if(text.includes("deliver")) return "Delivering…";
    if(text.includes("payment")) return "Saving payment…";
    if(text.includes("assign")) return "Assigning…";
    if(text.includes("credit")) return "Applying credit…";
    if(text.includes("reset")) return "Resetting…";
    if(text.includes("disable")||text.includes("enable")) return "Updating…";
    if(text.includes("create")) return "Creating…";
    if(text.includes("save")) return "Saving…";
    if(text.includes("receipt")||text.includes("pdf")) return "Preparing…";
    if(text.includes("tag")||text.includes("label")) return "Preparing…";
    return fallback;
  }
  function setButtonBusy(button, label){
    if(!button || button.dataset.processing==="true") return;
    const rect=button.getBoundingClientRect();
    button.dataset.processing="true";
    button.dataset.originalHtml=button.innerHTML;
    button.dataset.originalMinWidth=button.style.minWidth||"";
    if(rect.width) button.style.minWidth=`${Math.ceil(rect.width)}px`;
    button.disabled=true;
    button.classList.add("processing");
    button.setAttribute("aria-busy","true");
    button.innerHTML=`<span class="btn-spinner" aria-hidden="true"></span><span>${esc(label||processingText(button))}</span>`;
    busyButtons.add(button);
  }
  function clearButtonBusy(button){
    if(!button || button.dataset.processing!=="true") return;
    button.innerHTML=button.dataset.originalHtml||button.innerHTML;
    button.style.minWidth=button.dataset.originalMinWidth||"";
    delete button.dataset.processing;
    delete button.dataset.originalHtml;
    delete button.dataset.originalMinWidth;
    button.disabled=false;
    button.classList.remove("processing");
    button.removeAttribute("aria-busy");
    busyButtons.delete(button);
  }
  function clearBusyButtons(){[...busyButtons].forEach(clearButtonBusy)}
  function setBusy(v, trigger=null, label=null){
    state.busy=v;
    document.documentElement.classList.toggle("is-busy",v);
    document.body.style.cursor=v?"progress":"";
    document.body.setAttribute("aria-busy",v?"true":"false");
    if(v && trigger) setButtonBusy(trigger,label);
    if(!v) clearBusyButtons();
  }
  function validViews(role){
    if(role==="admin") return ["home","orders","admin","reports"];
    if(role==="manager") return ["home","orders","customers","reports"];
    if(role==="delivery") return ["stops","orders","history","reports","account"];
    return ["home","orders","pickup","reports","account"];
  }

  function navItems(role){
    const map={
      admin:[["home","Home","home"],["orders","Orders","orders"],["admin","Setup","admin"],["reports","Reports","reports"]],
      manager:[["home","Home","home"],["orders","Orders","orders"],["customers","Customers","user"],["reports","Reports","reports"]],
      delivery:[["stops","Stops","route"],["orders","Orders","orders"],["history","History","history"],["reports","Reports","reports"],["account","Account","user"]],
      customer:[["home","Home","home"],["orders","Orders","orders"],["pickup","Pickup","pickup"],["reports","Reports","reports"],["account","Account","user"]]
    }; return map[role] || [];
  }

  function renderLogin(){
    state.data=null;
    app.innerHTML=`<div class="login-wrap"><main class="login">
      <div class="login-brand"><div class="login-mark">L</div><div class="login-title">Laundry Desk<span>Simple laundry operations</span></div></div>
      <div class="card stack">
        <div><h2>Welcome back</h2><p class="sub">Use your staff login or customer mobile number.</p></div>
        <form id="loginForm" class="stack">
          <label>Login / mobile<input id="loginIdentifier" class="input" autocomplete="username" placeholder="manager or mobile number" required></label>
          <label>Six-digit code<input id="loginPin" class="input mono" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="current-password" placeholder="••••••" required></label>
          <button class="btn primary block" type="submit">Sign in</button>
        </form>
        <div class="security-note">Access is role-based and customer login attempts are rate-limited on the server.</div>
      </div>
      <div class="section"><div class="kicker">Demo accounts — tap to fill</div><div class="demo-grid" style="margin-top:8px">
        ${demo("Admin","admin","111111")}${demo("Manager","manager","222222")}${demo("Delivery","driver","333333")}${demo("Customer","9895494496","123456")}
      </div></div>
    </main></div>`;
    id("loginForm").addEventListener("submit",login);
  }
  function demo(name,identifier,pin){return `<button type="button" class="demo" data-demo="${esc(identifier)}|${pin}"><b>${name}</b><span>${esc(identifier)} · ${pin}</span></button>`}

  async function login(e){
    e.preventDefault();
    const identifier=id("loginIdentifier").value.trim(), pin=id("loginPin").value.trim();
    try{setBusy(true,e.submitter,"Signing in…"); const r=await api("/login",{method:"POST",body:{identifier,pin},auth:false}); state.token=r.token; localStorage.setItem("laundry_token",state.token); state.view=r.actor.role==="delivery"?"stops":"home"; await refresh(); toast(`Welcome, ${r.actor.display_name}`)}
    catch(err){toast(err.message,true)} finally{setBusy(false)}
  }

  async function logout(call=true, trigger=null){
    if(call && state.token){
      try{setBusy(true,trigger,"Signing out…");await api("/logout",{method:"POST",body:{}})}catch{}finally{setBusy(false)}
    }
    state.token=""; state.data=null; state.reportData=null; localStorage.removeItem("laundry_token"); renderLogin();
  }

  function renderApp(){
    const d=state.data, a=d.actor, nav=navItems(a.role);
    const navButtons=nav.map(([v,l,i])=>`<button class="navbtn ${state.view===v?'active':''}" data-view="${v}">${icon(i)}<span>${l}</span></button>`).join("");
    const org=business();
    const orgInitial=(org.name||"Laundry Desk").trim().charAt(0).toUpperCase()||"L";
    app.innerHTML=`<div class="shell">
      <header class="topbar"><div class="topbar-inner">
        <div class="brand"><div class="brand-mark">${esc(orgInitial)}</div><div class="brand-copy"><div>${esc(org.name||"Laundry Desk")}</div>${org.address?`<span>${esc(org.address)}</span>`:""}</div></div>
        <nav class="desktop-nav">${navButtons}</nav>
        <div class="actor"><div class="actor-copy"><div class="actor-name">${esc(a.display_name)}</div><div class="actor-role">${roleName(a.role)}</div></div><button class="icon-btn" data-action="toggle-theme" aria-label="Switch to ${state.mode==='graphite'?'light':'graphite'} theme" title="Switch theme">${icon(state.mode==='graphite'?"sun":"moon")}</button><button class="icon-btn" data-action="theme" aria-label="Theme settings" title="Theme settings">${icon("palette")}</button><button class="btn ghost smallbtn exit-btn" data-action="logout" aria-label="Exit" title="Exit">${icon("logout","sm")}<span>Exit</span></button></div>
      </div></header>
      <main class="main">${renderView()}</main>
      <nav class="bottomnav"><div class="bottomnav-inner" style="--nav-count:${nav.length}">${navButtons}</div></nav>
      ${state.modal||""}
    </div>`;
    bindDynamicForms();
  }

  function renderView(){
    const role=state.data.actor.role;
    if(role==="admin") return state.view==="home"?homeStaff():state.view==="orders"?ordersView():state.view==="admin"?adminView():reportsView();
    if(role==="manager") return state.view==="home"?homeStaff():state.view==="orders"?ordersView():state.view==="customers"?managerCustomersView():reportsView();
    if(role==="delivery") return state.view==="stops"?deliveryStops():state.view==="orders"?ordersView(false):state.view==="history"?historyView():state.view==="reports"?reportsView():accountView();
    return state.view==="home"?customerHome():state.view==="orders"?ordersView():state.view==="pickup"?customerPickup():state.view==="reports"?reportsView():accountView();
  }

  function titleBlock(kicker,title,sub,actions=""){
    return `<div class="page-head"><div class="page-head-copy"><div class="kicker">${kicker}</div><h1>${title}</h1>${sub?`<p class="sub">${sub}</p>`:""}</div>${actions?`<div class="page-head-actions">${actions}</div>`:""}</div>`;
  }

  function metric(label,value,accent=false){return `<div class="card metric ${accent?'accent':''}"><div class="value">${value}</div><div class="label">${label}</div></div>`}

  function homeStaff(){
    const s=state.data.summary, role=state.data.actor.role;
    const urgent=(state.data.orders||[]).filter(o=>["pickup_requested","ready"].includes(o.laundry_status)).slice(0,4);
    const quick=["admin","manager"].includes(role)?`<section class="home-quick-section"><div class="section-head compact-head"><div><div class="kicker">Quick actions</div><h2>Start in one tap</h2></div></div><div class="home-quick-actions"><button class="home-quick-card" data-action="counter-order"><span class="home-quick-icon">${icon("orders")}</span><span><b>Counter order</b><small>Customer is at the shop</small></span></button><button class="home-quick-card" data-action="pickup-request"><span class="home-quick-icon">${icon("pickup")}</span><span><b>Pickup request</b><small>WhatsApp / phone request</small></span></button><button class="home-quick-card" data-action="new-customer"><span class="home-quick-icon">${icon("user")}</span><span><b>Add customer</b><small>Create before first order</small></span></button></div></section>`:"";
    return `${titleBlock("Today","Operations","What needs attention now.")}${quick}
      <div class="grid metrics">${metric("Active orders",s.active_orders,true)}${metric("Outstanding",fmt(s.outstanding))}${metric("Collected",fmt(s.payments_received))}${metric("Customer credit",fmt(s.customer_credits))}</div>
      <section class="section"><div class="section-head"><div><h2>Needs attention</h2><p class="sub small">Pickup requests and orders ready to hand over.</p></div></div>${urgent.length?`<div class="grid cards">${urgent.map(o=>orderCard(o,"optimal")).join("")}</div>`:`<div class="empty">You are up to date. No urgent work right now.</div>`}</section>
      <section class="section"><div class="section-head"><div><h2>Work by stage</h2></div></div><div class="queue-strip">${QUICK_STAGES.filter(([k])=>k!=="delivered").map(([k,l])=>{const count=k==="in_progress"?(s.stage_counts.processing||0)+(s.stage_counts.washing||0)+(s.stage_counts.ironing||0):k==="ready"?(s.stage_counts.ready||0)+(s.stage_counts.out_for_delivery||0):(s.stage_counts[k]||0);return `<div class="queue-chip"><b>${count}</b><span>${l}</span></div>`}).join("")}</div></section>`;
  }

  function customerHome(){
    const orders=state.data.orders, active=orders.filter(o=>o.laundry_status!=="delivered"), credit=state.data.summary?.customer_credits||orders[0]?.customer_credit||0, out=orders.reduce((s,o)=>s+Number(o.outstanding),0);
    return `${titleBlock("My laundry",`Hello, ${esc(state.data.actor.display_name.split(" ")[0])}`,"Everything about your laundry in one place.",`<button class="btn primary" data-view="pickup">${icon("pickup","sm")}Request pickup</button>`)}
      <div class="grid metrics">${metric("Active",active.length,true)}${metric("Amount due",fmt(out))}${metric("Credit",fmt(credit))}${metric("Total orders",orders.length)}</div>
      <section class="section"><div class="section-head"><div><h2>In progress</h2></div></div>${active.length?`<div class="grid cards">${active.map(o=>orderCard(o,"optimal")).join("")}</div>`:`<div class="empty">No active orders. Request a pickup whenever you are ready.</div>`}</section>`;
  }

  function orderCard(o, mode=state.orderView){
    const pieces=o.items.reduce((sum,x)=>sum+Number(x.quantity),0);
    const route=o.channel==="pickup"?customerLocationLabel(o.customer,false):"";
    const paymentLabel=o.outstanding>0?`Due ${fmt(o.outstanding)}`:(o.payment_status==="unpriced"?"Not priced":"Paid");
    const canPay=["admin","manager","delivery"].includes(state.data.actor.role) && Number(o.outstanding||0)>0;
    const actions=`<div class="order-card-actions">${canPay?`<button class="btn smallbtn order-pay-btn" data-action="payment" data-id="${o.id}">${icon("payment","sm")}Pay</button>`:""}<button class="btn smallbtn order-details-btn" data-action="open-order" data-id="${o.id}" aria-label="Open ${esc(o.order_no)} details">Details</button></div>`;
    if(mode==="detailed"){
      return `<article class="card order order-detailed" data-order-card="${o.id}"><div class="order-head"><div><div class="order-no">${esc(o.order_no)}</div><div class="small muted">${esc(o.customer?.name||"")}${pieces?` · ${pieces} pcs`:""}${route?` · ${esc(route)}`:""}</div></div><div class="money">${fmt(o.total)}</div></div>
        <div class="order-meta"><span class="stage active">${quickStageLabel(o.laundry_status)}</span><span class="badge ${o.payment_status}">${o.payment_status}</span></div>
        <div class="order-money"><div><span>Paid</span><b>${fmt(o.paid)}</b></div><div><span>Due</span><b>${fmt(o.outstanding)}</b></div>${o.customer_credit>0?`<div><span>Credit</span><b>${fmt(o.customer_credit)}</b></div>`:""}<div><span>Type</span><b>${o.channel==="counter"?"Counter":"Pickup"}</b></div></div>${actions}</article>`;
    }
    return `<article class="card order order-optimal" data-order-card="${o.id}">
      <div class="order-optimal-main"><div class="order-no">${esc(o.order_no)}</div><div class="order-customer">${esc(o.customer?.name||"")}${pieces?` · ${pieces} pcs`:""}${route?` · ${esc(route)}`:""}</div></div>
      <div class="order-optimal-status"><span class="stage active">${quickStageLabel(o.laundry_status)}</span><span class="badge ${o.payment_status}">${o.payment_status}</span></div>
      <div class="order-optimal-money"><span>${paymentLabel}</span><b>${fmt(o.total)}</b></div>${actions}
    </article>`;
  }

  function visibleOrders(includeDelivered=true){
    let orders=state.data.orders||[];
    if(!includeDelivered) orders=orders.filter(o=>o.laundry_status!=="delivered");
    if(state.orderFilter!=="all") orders=orders.filter(o=>QUICK_STAGES.some(([k])=>k===state.orderFilter)?quickStageKey(o.laundry_status)===state.orderFilter:o.laundry_status===state.orderFilter);
    return orders;
  }

  function renderOrderList(includeDelivered=true){
    const orders=visibleOrders(includeDelivered);
    const list=id("orderList");
    if(!list)return;
    list.className=state.orderView==="detailed"?"grid cards order-list detailed-view":"order-list optimal-view";
    list.innerHTML=orders.length?orders.map(o=>orderCard(o,state.orderView)).join(""):`<div class="empty">No orders in this view.</div>`;
  }

  function pickupAssignmentPanel(){
    if(!["admin","manager"].includes(state.data.actor.role))return "";
    const all=(state.data.orders||[]).filter(o=>o.channel==="pickup"&&o.laundry_status==="pickup_requested");
    if(!all.length)return "";
    const buildings=[...new Set(all.map(o=>(o.customer?.building_block||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    let rows=all.filter(o=>state.pickupBuildingFilter==="all"||(o.customer?.building_block||"")===state.pickupBuildingFilter);
    const doorNum=o=>{const n=Number(String(o.customer?.door_no||"").match(/\d+/)?.[0]);return Number.isFinite(n)?n:999999};
    rows=[...rows].sort((a,b)=>{
      if(state.pickupSort==="customer")return (a.customer?.name||"").localeCompare(b.customer?.name||"");
      if(state.pickupSort==="newest")return String(b.created_at||"").localeCompare(String(a.created_at||""));
      if(state.pickupSort==="oldest")return String(a.created_at||"").localeCompare(String(b.created_at||""));
      const bb=(a.customer?.building_block||"~").localeCompare(b.customer?.building_block||"~");if(bb)return bb;
      const d=doorNum(a)-doorNum(b);if(d)return d;
      return (a.customer?.name||"").localeCompare(b.customer?.name||"");
    });
    const visibleIds=rows.map(o=>o.id),allSelected=visibleIds.length>0&&visibleIds.every(x=>state.bulkPickupSelected.has(x));
    const drivers=(state.data.staff||[]).filter(x=>x.role==="delivery"&&x.active);
    return `<section class="card bulk-pickup-card"><div class="row between bulk-head"><div><div class="kicker">Collection boy assignment</div><h2>Assign pickup requests together</h2><p class="small muted">Filter by building/block, select multiple orders, then assign one collection boy.</p></div><span class="badge">${rows.length} visible</span></div>
      <div class="bulk-pickup-toolbar"><label>Building / Block<select id="pickupBuildingFilter"><option value="all">All buildings</option>${buildings.map(x=>`<option value="${esc(x)}" ${state.pickupBuildingFilter===x?'selected':''}>${esc(x)}</option>`).join("")}</select></label><label>Sort<select id="pickupSort"><option value="building" ${state.pickupSort==='building'?'selected':''}>Building + Door</option><option value="customer" ${state.pickupSort==='customer'?'selected':''}>Customer A–Z</option><option value="newest" ${state.pickupSort==='newest'?'selected':''}>Newest request</option><option value="oldest" ${state.pickupSort==='oldest'?'selected':''}>Oldest request</option></select></label><button type="button" class="btn smallbtn" data-action="toggle-all-pickups" data-select="${allSelected?'false':'true'}">${allSelected?'Clear visible':'Select visible'}</button></div>
      <div class="bulk-pickup-list">${rows.map(o=>`<label class="bulk-pickup-row"><input type="checkbox" data-bulk-pickup="${o.id}" ${state.bulkPickupSelected.has(o.id)?'checked':''}><span><b>${esc(o.customer?.name||'')}</b><small>${esc(o.customer?.building_block||'No building')} · ${esc(o.customer?.door_no?`Door ${o.customer.door_no}`:'Door —')} · ${esc(o.order_no)}</small></span><span class="small muted">${o.pickup_driver_id?'Assigned':'Unassigned'}</span></label>`).join("")||`<div class="empty compact-empty">No pickup requests for this building.</div>`}</div>
      <div class="bulk-assign-bar"><select id="bulkPickupDriver"><option value="">Choose collection boy</option>${drivers.map(d=>`<option value="${d.id}">${esc(d.display_name)}</option>`).join("")}</select><button class="btn primary" data-action="bulk-assign-pickups">Assign selected (${state.bulkPickupSelected.size})</button></div></section>`;
  }

  function ordersView(includeDelivered=true){
    state.orderFilter="all";
    let orders=state.data.orders||[];
    if(!includeDelivered) orders=orders.filter(o=>o.laundry_status!=="delivered");
    const create=state.data.actor.role==="manager"?`<button class="btn primary" data-action="counter-order">+ New</button>`:"";
    return `${titleBlock("All work","Orders",`${orders.length} visible to your account.`,create)}
      ${pickupAssignmentPanel()}
      <div class="orders-toolbar"><div class="tabs order-stage-tabs">${[["all","All"],...QUICK_STAGES].map(([s,l])=>`<button class="tab ${s==="all"?'active':''}" data-filter-stage="${s}">${l}</button>`).join("")}</div><div class="view-switch" aria-label="Order view"><button class="view-switch-btn ${state.orderView==="optimal"?'active':''}" data-order-view="optimal">Optimal</button><button class="view-switch-btn ${state.orderView==="detailed"?'active':''}" data-order-view="detailed">Detailed</button></div></div>
      <div id="orderList" class="${state.orderView==="detailed"?'grid cards order-list detailed-view':'order-list optimal-view'}">${orders.length?orders.map(o=>orderCard(o,state.orderView)).join(""):`<div class="empty">No orders.</div>`}</div>`;
  }

  function newView(){
    return `${titleBlock("Create","What do you want to do?","Choose one action. The app handles the correct workflow.")}
      <div class="quick-actions"><button class="card quick-action" data-action="counter-order"><div class="quick-action-icon">${icon("orders")}</div><div><h2>Counter order</h2><p>Customer is at the shop with garments.</p></div></button>
      <button class="card quick-action" data-action="pickup-request"><div class="quick-action-icon">${icon("pickup")}</div><div><h2>Pickup request</h2><p>Log a WhatsApp or phone request.</p></div></button>
      <button class="card quick-action" data-action="new-customer"><div class="quick-action-icon">${icon("user")}</div><div><h2>Add customer</h2><p>Create a customer before their first order.</p></div></button></div>`;
  }

  function deliveryStops(){
    const pickupAll=state.data.orders.filter(o=>o.laundry_status==="pickup_requested" && o.pickup_driver_id===state.data.actor.id);
    const buildings=[...new Set(pickupAll.map(o=>(o.customer?.building_block||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    let pickups=pickupAll.filter(o=>state.deliveryBuildingFilter==="all"||(o.customer?.building_block||"")===state.deliveryBuildingFilter);
    const doorNum=o=>{const n=Number(String(o.customer?.door_no||"").match(/\d+/)?.[0]);return Number.isFinite(n)?n:999999};
    pickups=[...pickups].sort((a,b)=>state.deliverySort==="customer"?(a.customer?.name||"").localeCompare(b.customer?.name||""):(a.customer?.building_block||"~").localeCompare(b.customer?.building_block||"~")||doorNum(a)-doorNum(b)||(a.customer?.name||"").localeCompare(b.customer?.name||""));
    const deliveries=state.data.orders.filter(o=>o.laundry_status==="out_for_delivery" && o.delivery_driver_id===state.data.actor.id);
    const other=state.data.orders.filter(o=>!["pickup_requested","out_for_delivery","delivered"].includes(o.laundry_status));
    return `${titleBlock("Assigned only","My stops","Only work assigned to you. Group pickups by building/block for faster rounds.")}
      <div class="grid metrics">${metric("Pickups",pickupAll.length,true)}${metric("Deliveries",deliveries.length,true)}${metric("In laundry",other.length)}${metric("Total assigned",state.data.orders.filter(o=>o.laundry_status!=="delivered").length)}</div>
      <section class="section"><div class="row between"><div><div class="kicker">Collect</div><h2>Pickup stops</h2></div><div class="delivery-route-tools"><select id="deliveryBuildingFilter"><option value="all">All buildings</option>${buildings.map(x=>`<option value="${esc(x)}" ${state.deliveryBuildingFilter===x?'selected':''}>${esc(x)}</option>`).join("")}</select><select id="deliverySort"><option value="building" ${state.deliverySort==='building'?'selected':''}>Building + Door</option><option value="customer" ${state.deliverySort==='customer'?'selected':''}>Customer A–Z</option></select></div></div>${pickups.length?`<div class="grid cards">${pickups.map(o=>orderCard(o,"optimal")).join("")}</div>`:`<div class="empty">No pickup stops in this building/block.</div>`}</section>
      <section class="section"><div class="kicker">Hand over</div><h2>Delivery stops</h2>${deliveries.length?`<div class="grid cards">${deliveries.map(o=>orderCard(o,"optimal")).join("")}</div>`:`<div class="empty">No deliveries assigned.</div>`}</section>`;
  }


  function historyView(){const done=state.data.orders.filter(o=>o.laundry_status==="delivered");return `${titleBlock("Completed","History",`${done.length} delivered orders assigned to you.`)}${done.length?`<div class="grid cards">${done.map(o=>orderCard(o,"optimal")).join("")}</div>`:`<div class="empty">No completed deliveries yet.</div>`}`}
  function accountView(){const a=state.data.actor; return `${titleBlock("Account",esc(a.display_name),roleName(a.role))}<div class="grid cards account-grid"><div class="card stack"><div><div class="kicker">Role</div><div class="strong">${roleName(a.role)}</div></div>${a.mobile?`<div><div class="kicker">Mobile</div><div class="strong">${esc(a.mobile)}</div></div>`:""}${a.customer_code?`<div><div class="kicker">Customer code</div><div class="mono strong">${esc(a.customer_code)}</div></div>`:""}</div><div class="card stack"><div><div class="kicker">Appearance</div><h3>Theme</h3><p class="small muted">Switch Graphite / Light and optionally adjust the accent.</p></div><button class="btn" data-action="theme">${icon("palette","sm")}Change theme</button><button class="btn danger" data-action="logout">Sign out</button></div></div>`}
  function customerPickup(){const a=state.data.actor,location=[a.door_no?`Door ${a.door_no}`:null,a.building_block||null,a.address||null].filter(Boolean).join(", ");return `${titleBlock("Doorstep","Request pickup","One request. Staff will assign the driver.")}<form id="pickupSelfForm" class="card stack"><label>Pickup address<textarea name="address" required>${esc(location)}</textarea></label><label>Note <textarea name="note" placeholder="Preferred time, landmark, special instruction..."></textarea></label><button class="btn primary block">REQUEST PICKUP →</button></form>`}

  function reportTabs(role){
    if(["admin","manager"].includes(role)) return [["overview","Overview"],["customers","Customers"],["operations","Operations"],["payments","Payments"],["calendar","Calendar"]];
    if(role==="delivery") return [["overview","My activity"],["operations","Operations"],["payments","Payments"],["calendar","Calendar"]];
    return [["overview","My report"],["payments","Payments"],["calendar","Calendar"]];
  }

  function reportControls(){
    const presets=[["today","Today"],["yesterday","Yesterday"],["this_week","This week"],["last_week","Last week"],["this_month","This month"],["last_month","Last month"],["this_year","This year"],["custom","Custom"]];
    return `<div class="report-controls"><div class="report-presets">${presets.map(([k,l])=>`<button class="chip ${state.reportPreset===k?'active':''}" data-report-preset="${k}">${l}</button>`).join("")}</div><div class="report-options"><label>Group by<select id="reportGroup"><option value="day" ${state.reportGroup==='day'?'selected':''}>Day</option><option value="week" ${state.reportGroup==='week'?'selected':''}>Week</option><option value="month" ${state.reportGroup==='month'?'selected':''}>Month</option><option value="year" ${state.reportGroup==='year'?'selected':''}>Year</option></select></label></div>${state.reportPreset==='custom'?`<form id="reportCustomForm" class="report-custom"><label>From<input type="date" name="from" value="${esc(state.reportFrom||reportRange('today').from)}" required></label><label>To<input type="date" name="to" value="${esc(state.reportTo||reportRange('today').to)}" required></label><button class="btn primary smallbtn">Apply</button></form>`:''}</div>`;
  }

  function reportLoading(){return `<div class="report-loading"><span class="btn-spinner"></span><div><b>Loading report</b><span>Calculating orders, payments and workflow activity…</span></div></div>`}
  function breakdownCards(obj){const entries=Object.entries(obj||{});return entries.length?`<div class="report-breakdown">${entries.map(([k,v])=>`<div class="card report-break"><span>${esc(k.replaceAll('_',' '))}</span><b>${fmt(v)}</b></div>`).join("")}</div>`:`<div class="empty">No activity in this period.</div>`}
  function trendTable(rows){return rows?.length?`<div class="table-wrap report-table"><table><thead><tr><th>Period</th><th>Orders</th><th>Pieces</th><th>Sales</th><th>Received</th><th>Collected</th><th>Delivered</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="mono">${esc(r.key)}</td><td>${r.orders}</td><td>${r.pieces}</td><td>${fmt(r.sales)}</td><td>${fmt(r.payments_received)}</td><td>${r.collected}</td><td>${r.delivered}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No activity in this period.</div>`}
  function netPositionText(v){v=Number(v||0);return v>0?`${fmt(v)} due`:v<0?`${fmt(Math.abs(v))} credit`:`Settled`}

  function reportOverview(r){
    const role=state.data.actor.role,p=r.period,c=r.current;
    if(role==="delivery") return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Period activity</div><h2>My work</h2></div></div><div class="grid metrics report-metrics">${metric("Collected",p.collected,true)}${metric("Delivered",p.delivered)}${metric("Payments collected",fmt(p.payments_received))}${metric("Assigned active",c.active_orders)}</div></div><div class="report-section"><h2>Trend</h2>${trendTable(r.series)}</div>`;
    if(role==="customer") return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Period activity</div><h2>My laundry</h2></div></div><div class="grid metrics report-metrics">${metric("Orders",p.orders,true)}${metric("Pieces",p.pieces)}${metric("Spend",fmt(p.sales))}${metric("Paid",fmt(p.payments_received))}</div></div><div class="report-section"><div class="report-section-head"><div><div class="kicker">Current position</div><h2>My balance</h2></div></div><div class="grid metrics report-metrics">${metric("Amount due",fmt(c.outstanding),true)}${metric("Available credit",fmt(c.customer_credit))}${metric("Active orders",c.active_orders)}${metric("Net",netPositionText(c.outstanding-c.customer_credit))}</div></div><div class="report-section"><h2>Trend</h2>${trendTable(r.series)}</div>`;
    return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Period activity</div><h2>Business activity</h2></div><span class="report-note">Filtered by selected dates</span></div><div class="grid metrics report-metrics">${metric("Orders",p.orders,true)}${metric("Pieces",p.pieces)}${metric("Sales",fmt(p.sales))}${metric("Cash received",fmt(p.payments_received))}${metric("Collected",p.collected)}${metric("Delivered",p.delivered)}${metric("Avg order",fmt(p.avg_order_value))}</div></div><div class="report-section"><div class="report-section-head"><div><div class="kicker">Current position</div><h2>What is open now</h2></div><span class="report-note">Not date-filtered</span></div><div class="grid metrics report-metrics">${metric("Active orders",c.active_orders,true)}${metric("Outstanding",fmt(c.outstanding))}${metric("Customer credit",fmt(c.customer_credit))}${metric("In progress",c.quick_stage_counts.in_progress||0)}${metric("Ready",c.quick_stage_counts.ready||0)}</div></div><div class="report-section"><h2>Trend</h2>${trendTable(r.series)}</div>`;
  }

  function reportCustomers(r){return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Customer position</div><h2>Customer-wise business</h2></div><span class="report-note">Net = outstanding − credit</span></div>${r.customers?.length?`<div class="table-wrap report-table customer-report"><table><thead><tr><th>Customer</th><th>Orders</th><th>Pieces</th><th>Sales</th><th>Received</th><th>Outstanding</th><th>Credit</th><th>Net position</th></tr></thead><tbody>${r.customers.map(c=>`<tr><td><b>${esc(c.name)}</b><div class="small muted mono">${esc(c.customer_code)}</div></td><td>${c.orders}</td><td>${c.pieces}</td><td>${fmt(c.sales)}</td><td>${fmt(c.payments_received)}</td><td>${fmt(c.outstanding)}</td><td>${fmt(c.credit)}</td><td class="strong ${c.net_position<0?'credit-text':c.net_position>0?'due-text':''}">${netPositionText(c.net_position)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No customer activity in this period.</div>`}</div>`}

  function reportOperations(r){const c=r.current,p=r.period;const qs=c.quick_stage_counts||{};return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Current workload</div><h2>Quick workflow queue</h2></div></div><div class="queue-strip report-queue">${QUICK_STAGES.filter(([k])=>k!=="delivered").map(([k,l])=>`<div class="queue-chip"><b>${qs[k]||0}</b><span>${l}</span></div>`).join("")}</div></div><div class="report-section"><div class="grid metrics report-metrics">${metric("Collected in period",p.collected,true)}${metric("Delivered in period",p.delivered)}${metric("Collected >12h",c.aging.collected_over_12h)}${metric("In progress >48h",c.aging.in_progress_over_48h)}${metric("Ready >24h",c.aging.ready_over_24h)}</div></div><details class="card report-details"><summary>Detailed stage counts</summary><div class="report-stage-list">${STAGES.map(([k,l])=>`<div><span>${l}</span><b>${c.detailed_stage_counts[k]||0}</b></div>`).join("")}</div></details>`}

  function reportPayments(r){const p=r.period,c=r.current,role=state.data.actor.role;return `<div class="report-section"><div class="grid metrics report-metrics">${metric(role==="delivery"?"Collected by me":"Cash received",fmt(p.payments_received),true)}${role!=="delivery"?metric("Outstanding now",fmt(c.outstanding)):''}${role!=="delivery"?metric("Customer credit",fmt(c.customer_credit)):''}${role!=="delivery"?metric("Credit added",fmt(p.credit_added)):''}${role!=="delivery"?metric("Credit applied",fmt(p.credit_applied)):''}</div></div><div class="report-section"><h2>By payment method</h2>${breakdownCards(r.breakdowns.payment_method)}</div><div class="report-section"><h2>By collection point</h2>${breakdownCards(r.breakdowns.payment_context)}</div>`}

  function reportCalendar(r){
    const month=r.range.calendar_month||state.reportCalendarMonth;const first=new Date(`${month}-01T00:00:00Z`),days=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate(),offset=(first.getUTCDay()+6)%7,map=new Map((r.calendar||[]).map(x=>[x.date,x]));let cells='';
    for(let i=0;i<offset;i++)cells+='<div class="calendar-cell blank"></div>';
    for(let day=1;day<=days;day++){const key=`${month}-${String(day).padStart(2,'0')}`,x=map.get(key)||{};cells+=`<div class="calendar-cell ${x.orders||x.collected||x.delivered||x.payments_received?'has-data':''}"><div class="calendar-day">${day}</div><div class="calendar-stat"><span>C</span><b>${x.collected||0}</b></div><div class="calendar-stat"><span>D</span><b>${x.delivered||0}</b></div><div class="calendar-income">${x.payments_received?fmt(x.payments_received):'—'}</div></div>`}
    return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Daily operations</div><h2>Calendar</h2><p class="small muted">C = Collected · D = Delivered · amount = cash received.</p></div><label class="calendar-month">Month<input id="reportCalendarMonth" type="month" value="${month}"></label></div><div class="calendar-weekdays">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${cells}</div></div>`;
  }

  async function loadReports(show=true){
    if(!state.token)return;const range=reportRange();state.reportLoading=true;if(show&&state.view==="reports")renderApp();
    try{const qs=new URLSearchParams({from:range.from,to:range.to,group:state.reportGroup,calendar_month:state.reportCalendarMonth});state.reportData=await api(`/reports?${qs.toString()}`)}catch(e){toast(e.message,true)}finally{state.reportLoading=false;if(state.view==="reports")renderApp()}
  }

  let xlsxLoader=null,pdfLoader=null;
  function loadScriptOnce(src,test,label="export library"){
    if(test())return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const stale=[...document.scripts].find(x=>x.src===src);
      if(stale)stale.remove();
      const sc=document.createElement("script");
      sc.src=src;sc.async=true;sc.crossOrigin="anonymous";
      const timer=setTimeout(()=>{sc.remove();reject(new Error(`${label} timed out while loading`))},12000);
      sc.onload=()=>{clearTimeout(timer);if(test())resolve();else{sc.remove();reject(new Error(`${label} loaded but did not initialize`))}};
      sc.onerror=()=>{clearTimeout(timer);sc.remove();reject(new Error(`${label} could not be loaded`))};
      document.head.appendChild(sc);
    })
  }
  async function loadScriptFallback(urls,test,label){
    if(test())return;
    let lastError=null;
    for(const src of urls){
      try{await loadScriptOnce(src,test,label);if(test())return}catch(e){lastError=e}
    }
    throw new Error(`${label} could not be loaded. Check the internet connection and try again.${lastError?.message?` (${lastError.message})`:""}`)
  }
  function ensureXLSX(){if(window.XLSX)return Promise.resolve();if(!xlsxLoader)xlsxLoader=loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",()=>!!window.XLSX,"Excel export library").catch(e=>{xlsxLoader=null;throw e});return xlsxLoader}
  async function ensurePDF(){
    const hasJsPDF=()=>!!window.jspdf?.jsPDF;
    const hasAutoTable=()=>typeof window.jspdf?.jsPDF?.API?.autoTable==="function";
    if(hasJsPDF()&&hasAutoTable())return;
    if(!pdfLoader)pdfLoader=(async()=>{
      await loadScriptFallback([
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.0/jspdf.umd.min.js",
        "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"
      ],hasJsPDF,"PDF export library");
      await loadScriptFallback([
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js",
        "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js"
      ],hasAutoTable,"PDF table library");
    })().catch(e=>{pdfLoader=null;throw e});
    return pdfLoader;
  }
  function reportFilename(ext){const r=reportRange(),tab=(state.reportTab||"overview").replace(/[^a-z0-9]+/gi,"-");return `Laundry-Desk-${tab}-${r.from}-to-${r.to}.${ext}`}
  function reportExportModel(){const r=state.reportData,role=state.data.actor.role,range=reportRange();if(!r)return null;const sections=[];if(state.reportTab==="customers"){sections.push({title:"Customer-wise business",headers:["Customer","Code","Orders","Pieces","Sales","Received","Outstanding","Credit","Net position"],rows:(r.customers||[]).map(c=>[c.name,c.customer_code,c.orders,c.pieces,c.sales,c.payments_received,c.outstanding,c.credit,c.net_position])})}else if(state.reportTab==="operations"){sections.push({title:"Current quick workflow",headers:["Stage","Count"],rows:Object.entries(r.current?.quick_stage_counts||{}).map(([k,v])=>[k.replaceAll("_"," "),v])});sections.push({title:"Operational exceptions",headers:["Metric","Count"],rows:[["Collected >12h",r.current?.aging?.collected_over_12h||0],["In progress >48h",r.current?.aging?.in_progress_over_48h||0],["Ready >24h",r.current?.aging?.ready_over_24h||0]]})}else if(state.reportTab==="payments"){sections.push({title:"Payment summary",headers:["Metric","AED"],rows:[[role==="delivery"?"Collected by me":"Cash received",r.period?.payments_received||0],["Outstanding now",r.current?.outstanding||0],["Customer credit",r.current?.customer_credit||0],["Credit added",r.period?.credit_added||0],["Credit applied",r.period?.credit_applied||0]]});sections.push({title:"By method",headers:["Method","AED"],rows:Object.entries(r.breakdowns?.payment_method||{})});sections.push({title:"By collection point",headers:["Point","AED"],rows:Object.entries(r.breakdowns?.payment_context||{})})}else if(state.reportTab==="calendar"){sections.push({title:`Calendar ${r.range?.calendar_month||state.reportCalendarMonth}`,headers:["Date","Orders","Pieces","Sales","Received","Collected","Delivered"],rows:(r.calendar||[]).map(x=>[x.date,x.orders||0,x.pieces||0,x.sales||0,x.payments_received||0,x.collected||0,x.delivered||0])})}else{sections.push({title:"Period activity",headers:["Metric","Value"],rows:[["Orders",r.period?.orders||0],["Pieces",r.period?.pieces||0],["Sales",r.period?.sales||0],["Cash received",r.period?.payments_received||0],["Collected",r.period?.collected||0],["Delivered",r.period?.delivered||0],["Average order value",r.period?.avg_order_value||0]]});sections.push({title:"Current position",headers:["Metric","Value"],rows:[["Active orders",r.current?.active_orders||0],["Outstanding",r.current?.outstanding||0],["Customer credit",r.current?.customer_credit||0],["In progress",r.current?.quick_stage_counts?.in_progress||0],["Ready",r.current?.quick_stage_counts?.ready||0]]});sections.push({title:"Trend",headers:["Period","Orders","Pieces","Sales","Received","Collected","Delivered"],rows:(r.series||[]).map(x=>[x.key,x.orders,x.pieces,x.sales,x.payments_received,x.collected,x.delivered])})}return {title:`${business().name||"Laundry Desk"} — ${state.reportTab||"Overview"} report`,subtitle:`${range.label} · ${range.from} to ${range.to}`,sections}}
  async function exportExcel(trigger){const model=reportExportModel();if(!model)return toast("Load a report first",true);try{setBusy(true,trigger,"Preparing Excel…");await ensureXLSX();const wb=XLSX.utils.book_new();for(const sec of model.sections){const data=[[sec.title],[model.subtitle],[],sec.headers,...sec.rows];const ws=XLSX.utils.aoa_to_sheet(data);XLSX.utils.book_append_sheet(wb,ws,sec.title.slice(0,31).replace(/[\/:?*\[\]]/g," ")||"Report")}XLSX.writeFile(wb,reportFilename("xlsx"));toast("Excel downloaded")}catch(e){toast(e.message,true)}finally{setBusy(false)}}
  async function exportPDF(trigger){const model=reportExportModel();if(!model)return toast("Load a report first",true);try{setBusy(true,trigger,"Preparing PDF…");await ensurePDF();const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});let y=42;doc.setFontSize(16);doc.text(model.title,40,y);y+=20;doc.setFontSize(9);doc.text(model.subtitle,40,y);y+=16;for(const sec of model.sections){if(y>500){doc.addPage();y=42}doc.setFontSize(11);doc.text(sec.title,40,y);y+=8;doc.autoTable({startY:y,head:[sec.headers],body:sec.rows,styles:{fontSize:7,cellPadding:3},headStyles:{fillColor:[45,48,52]},margin:{left:40,right:40}});y=(doc.lastAutoTable?.finalY||y)+20}doc.save(reportFilename("pdf"));toast("PDF downloaded")}catch(e){console.error("PDF export failed",e);toast(e?.message||"Could not create PDF. Please try again.",true)}finally{setBusy(false)}}

  function reportsView(){
    const role=state.data.actor.role,tabs=reportTabs(role),range=reportRange();if(!tabs.some(([k])=>k===state.reportTab))state.reportTab=tabs[0][0];
    const content=state.reportLoading?reportLoading():!state.reportData?`<div class="empty">Choose a period to load reports.</div>`:state.reportTab==="customers"?reportCustomers(state.reportData):state.reportTab==="operations"?reportOperations(state.reportData):state.reportTab==="payments"?reportPayments(state.reportData):state.reportTab==="calendar"?reportCalendar(state.reportData):reportOverview(state.reportData);
    const exports=state.reportData&&!state.reportLoading?`<button class="btn smallbtn" data-action="export-excel">${icon("download","sm")}Excel</button><button class="btn smallbtn" data-action="export-pdf">${icon("download","sm")}PDF</button>`:"";
    return `${titleBlock(role==="customer"?"My data":role==="delivery"?"My activity":"Business intelligence","Reports",`${range.label} · ${range.from} to ${range.to}`,exports)}${reportControls()}<div class="tabs report-tabs">${tabs.map(([k,l])=>`<button class="tab ${state.reportTab===k?'active':''}" data-report-tab="${k}">${l}</button>`).join("")}</div><div id="reportPanel">${content}</div>`;
  }

  function adminView(){
    const tabs=[["business","Business"],["workflow","Workflow"],["staff","Staff"],["customers","Customers"],["rates","Rates"],["catalog","Catalog"],["discounts","Discounts"],["system","System"]];
    const render=state.adminTab==="workflow"?adminWorkflow():state.adminTab==="staff"?adminStaff():state.adminTab==="customers"?adminCustomers():state.adminTab==="rates"?adminRates():state.adminTab==="catalog"?adminCatalog():state.adminTab==="discounts"?adminDiscounts():state.adminTab==="system"?adminSystem():adminBusiness();
    return `${titleBlock("Control room","Admin","Organization, workflow, accounts, catalog, rates and demo controls.")}
      <div class="tabs">${tabs.map(([k,l])=>`<button class="tab ${state.adminTab===k?'active':''}" data-admin-tab="${k}">${l}</button>`).join("")}</div>
      <div id="adminPanel">${render}</div>`;
  }
  function adminBusiness(){const b=business();return `<div class="grid cards"><form id="businessForm" class="card stack"><div><div class="kicker">Organization</div><h2>Business identity</h2><p class="small muted">Used in the app header, receipts and printable labels.</p></div><label>Organization name<input class="input" name="name" value="${esc(b.name||'')}" required maxlength="120"></label><label>Address<textarea name="address" required placeholder="Building, street, area, Dubai, UAE">${esc(b.address||'')}</textarea></label><label>Phone <span class="muted">optional</span><input class="input" name="phone" value="${esc(b.phone||'')}" placeholder="+971..."></label><button class="btn primary">SAVE ORGANIZATION →</button></form><div class="card stack"><div><div class="kicker">Preview</div><h2>${esc(b.name||'Laundry Desk')}</h2><p class="sub">${esc(b.address||'Add the billing address')}</p>${b.phone?`<p class="small">${esc(b.phone)}</p>`:''}</div><div class="business-preview-mark">${esc((b.name||'L').trim().charAt(0).toUpperCase())}</div><p class="small muted">Changes are shared across all staff and customers after their next refresh.</p></div></div>`}
  function adminWorkflow(){const w=workflowSettings();return `<form id="workflowSettingsForm" class="card stack workflow-settings-card"><div><div class="kicker">Quick flow</div><h2>Stage behavior</h2><p class="small muted">Users can move directly to any later quick stage: Requested · Collected · Received · In Progress · Ready · Delivered.</p></div><label class="toggle-row"><span><b>Confirm stage changes</b><small>When off, tapping a later stage updates immediately. When on, every quick-stage change asks for confirmation.</small></span><input type="checkbox" name="confirm_stage_changes" ${w.confirm_stage_changes?'checked':''}></label><div class="workflow-example"><span>Requested</span><span>Collected</span><span>Received</span><span>In Progress</span><span>Ready</span><span>Delivered</span></div><button class="btn primary">SAVE WORKFLOW SETTING →</button></form>`}

  function adminStaff(){return `<div class="row between"><h2>Staff</h2><button class="btn primary" data-action="new-staff">+ Staff</button></div><div class="list">${state.data.staff.map(s=>`<div class="list-row"><div class="row between"><div><b>${esc(s.display_name)}</b><div class="small mono muted">${esc(s.login_id)} · ${s.role}</div></div><span class="badge ${s.active?'paid':'unpaid'}">${s.active?'active':'disabled'}</span></div><button class="btn smallbtn" data-action="edit-staff" data-id="${s.id}">Edit</button></div>`).join("")}</div>`}
  function adminSystem(){
    const orders=state.data?.summary?.active_orders||0, outstanding=state.data?.summary?.outstanding||0, credit=state.data?.summary?.customer_credits||0;
    return `<div class="grid cards system-grid"><div class="card stack"><div><div class="kicker">Demo tools</div><h2>Reset demo data</h2><p class="small muted">Clear operational test data and return to a clean test cycle without rebuilding users or setup.</p></div><div class="demo-reset-summary"><div><span>Open orders</span><b>${orders}</b></div><div><span>Outstanding</span><b>${fmt(outstanding)}</b></div><div><span>Customer credit</span><b>${fmt(credit)}</b></div></div><div class="retain-list"><b>Reset clears</b><span>Orders, garment items/tags, workflow history, payments, customer credits, login-attempt noise and prior audit entries.</span></div><button class="btn danger block" data-action="open-demo-reset">RESET DEMO DATA</button></div><div class="card stack"><div><div class="kicker">Retained</div><h2>Ready for another test</h2></div><div class="retain-list"><b>Staff users</b><span>Admin, Manager and Delivery accounts remain unchanged.</span></div><div class="retain-list"><b>Customers</b><span>Customer accounts and login codes remain unchanged.</span></div><div class="retain-list"><b>Configuration</b><span>Organization, garments, services, rates, discounts and theme settings are retained.</span></div><p class="small muted">Order numbering restarts from the demo baseline after a reset.</p></div></div>`
  }
  function customerQuickAdd(){return `<form id="customerQuickForm" class="quick-entry quick-entry-customer"><input class="input" name="name" placeholder="Customer name" required><input class="input mono" name="mobile" placeholder="Mobile number" required><input class="input" name="building_block" placeholder="Building / Block"><input class="input" name="door_no" placeholder="Door No."><input class="input" name="address" placeholder="Area / street"><button class="btn primary" type="submit">+ Add customer</button></form>`}
  function customerDirectory(adminMode=false){
    const all=state.data.customers||[];
    const buildings=[...new Set(all.map(c=>(c.building_block||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    let rows=all.filter(c=>state.customerBuildingFilter==="all"||(c.building_block||"")===state.customerBuildingFilter);
    const doorValue=v=>{const n=Number(String(v||"").match(/\d+/)?.[0]);return Number.isFinite(n)?n:999999};
    rows=[...rows].sort((a,b)=>{
      if(state.customerSort==="name")return a.name.localeCompare(b.name);
      if(state.customerSort==="newest")return String(b.created_at||"").localeCompare(String(a.created_at||""));
      if(state.customerSort==="oldest")return String(a.created_at||"").localeCompare(String(b.created_at||""));
      const building=(a.building_block||"~").localeCompare(b.building_block||"~");
      if(building)return building;
      const door=doorValue(a.door_no)-doorValue(b.door_no);if(door)return door;
      return a.name.localeCompare(b.name);
    });
    return `<div class="section-head compact-head"><div><h2>Customers</h2><p class="small muted">${rows.length} of ${all.length} customers · filter by building/block and sort for collection routes.</p></div></div>
      ${customerQuickAdd()}
      <div class="customer-tools"><label>Building / Block<select id="customerBuildingFilter"><option value="all">All buildings</option>${buildings.map(x=>`<option value="${esc(x)}" ${state.customerBuildingFilter===x?'selected':''}>${esc(x)}</option>`).join("")}</select></label><label>Sort<select id="customerSort"><option value="building" ${state.customerSort==='building'?'selected':''}>Building + Door</option><option value="name" ${state.customerSort==='name'?'selected':''}>Customer A–Z</option><option value="newest" ${state.customerSort==='newest'?'selected':''}>Newest</option><option value="oldest" ${state.customerSort==='oldest'?'selected':''}>Oldest</option></select></label></div>
      <div class="table-wrap compact-table"><table class="customer-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Building / Block</th><th>Door</th><th>Area</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(c=>`<tr><td><b>${esc(c.name)}</b><div class="small mono muted">${esc(c.customer_code)}</div></td><td class="mono">${esc(c.mobile)}</td><td>${esc(c.building_block||'—')}</td><td>${esc(c.door_no||'—')}</td><td>${esc(c.address||'—')}</td><td><span class="badge ${c.access_enabled?'paid':'unpaid'}">${c.access_enabled?'active':'disabled'}</span></td><td><div class="row compact-actions"><button class="btn smallbtn" data-action="customer-account" data-id="${c.id}">${icon("wallet","sm")}Account</button><button class="btn smallbtn" data-action="edit-customer" data-id="${c.id}">Edit</button>${adminMode?`<button class="btn smallbtn" data-action="toggle-customer" data-id="${c.id}" data-enabled="${c.access_enabled}">${c.access_enabled?'Disable':'Enable'}</button><button class="btn smallbtn" data-action="reset-customer" data-id="${c.id}">Reset code</button>`:''}</div></td></tr>`).join("")||`<tr><td colspan="7"><div class="empty compact-empty">No customers in this building/block.</div></td></tr>`}</tbody></table></div>`}
  function managerCustomersView(){return `${titleBlock("Customer desk","Customers","Add or edit customer details before creating an order.")}${customerDirectory(false)}`}
  function adminCustomers(){return customerDirectory(true)}
  function adminRates(){const garments=state.data.refs.garments.filter(x=>x.active),services=state.data.refs.services.filter(x=>x.active),g=new Map(state.data.refs.garments.map(x=>[x.id,x.name])),s=new Map(state.data.refs.services.map(x=>[x.id,x.name])),today=new Date().toISOString().slice(0,10);return `<div class="section-head compact-head"><div><h2>Rates</h2><p class="small muted">Add at the top. Edit price and effective date directly in the grid.</p></div></div><div class="table-wrap rate-editor"><table><thead><tr><th>Garment</th><th>Service</th><th>AED</th><th>Effective from</th><th></th></tr></thead><tbody><tr class="quick-add-row"><td><select id="quickRateGarment">${garments.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></td><td><select id="quickRateService">${services.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></td><td><input id="quickRatePrice" class="input inline-input money" type="number" min="0" step="0.01" placeholder="0.00"></td><td><input id="quickRateDate" class="input inline-input" type="date" value="${today}"></td><td><button class="btn primary smallbtn" data-action="quick-save-rate">+ Add</button></td></tr>${state.data.refs.rates.filter(r=>r.active).map(r=>`<tr data-rate-row="${r.id}"><td><b>${esc(g.get(r.garment_type_id)||"")}</b></td><td>${esc(s.get(r.service_id)||"")}</td><td><input class="input inline-input money" data-rate-price value="${Number(r.unit_price).toFixed(2)}" type="number" min="0" step="0.01"></td><td><input class="input inline-input" data-rate-date value="${r.effective_from}" type="date"></td><td><button class="btn smallbtn" data-action="save-rate-row" data-id="${r.id}" data-garment="${r.garment_type_id}" data-service="${r.service_id}">Save</button></td></tr>`).join("")}</tbody></table></div>`}
  function adminCatalog(){return `<div class="grid cards"><div class="card"><div class="row between"><h2>Garments</h2><button class="btn smallbtn primary" data-action="new-garment">+ Add</button></div><div class="list">${state.data.refs.garments.map(g=>`<div class="list-row"><div class="row between"><div><b>${esc(g.name)}</b><div class="small mono muted">${esc(g.code)}</div></div><span class="badge ${g.active?'paid':'unpaid'}">${g.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-garment" data-id="${g.id}">Edit</button></div>`).join("")}</div></div><div class="card"><div class="row between"><h2>Services</h2><button class="btn smallbtn primary" data-action="new-service">+ Add</button></div><div class="list">${state.data.refs.services.map(s=>`<div class="list-row"><div class="row between"><div><b>${esc(s.name)}</b><div class="small mono muted">${esc(s.workflow)}</div></div><span class="badge ${s.active?'paid':'unpaid'}">${s.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-service" data-id="${s.id}">Edit</button></div>`).join("")}</div></div></div>`}
  function adminDiscounts(){return `<div class="row between"><h2>Discounts</h2><button class="btn primary" data-action="new-discount">+ Discount</button></div><div class="list">${state.data.refs.discounts.map(d=>`<div class="list-row"><div class="row between"><div><b>${esc(d.name)}</b><div class="small muted">${d.discount_type==='percent'?d.value+'%':fmt(d.value)}</div></div><span class="badge ${d.active?'paid':'unpaid'}">${d.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-discount" data-id="${d.id}">Edit</button></div>`).join("")}</div>`}

  function stageBar(order,mode=state.workflowMode){
    if(mode==="quick"){
      const current=quickStageKey(order.laundry_status),idx=QUICK_STAGES.findIndex(([s])=>s===current),role=state.data.actor.role,canChange=["admin","manager"].includes(role);
      const targetStatus=s=>s==="in_progress"?"processing":s;
      return `<div class="stagebar quick-stagebar quick-stage-actions">${QUICK_STAGES.map(([s,l],i)=>{const cls=i<idx?'done':i===idx?'active':i>idx?'future':'';const actionable=canChange&&i>idx;return actionable?`<button type="button" class="stage ${cls}" data-action="set-quick-stage" data-id="${order.id}" data-status="${targetStatus(s)}" title="Move directly to ${esc(l)}">${l}</button>`:`<span class="stage ${cls}">${l}</span>`}).join("")}</div><div class="small muted quick-stage-note">Tap any later stage to move forward. Skipped milestones are not auto-tagged.${workflowSettings().confirm_stage_changes?' Confirmation is enabled in Setup.':''}</div>`;
    }
    const workflows=new Set((order.items||[]).map(i=>i.service?.workflow).filter(Boolean));
    let visible=STAGES;
    if([...workflows].some(w=>["dry_clean","custom"].includes(w))) visible=STAGES.filter(([s])=>!["washing","ironing"].includes(s));
    else if(workflows.size===1&&workflows.has("iron_only")) visible=STAGES.filter(([s])=>!["washing","processing"].includes(s));
    else if(workflows.size===1&&workflows.has("wash_only")) visible=STAGES.filter(([s])=>!["ironing","processing"].includes(s));
    else visible=STAGES.filter(([s])=>s!=="processing");
    const idx=visible.findIndex(([s])=>s===order.laundry_status);
    return `<div class="stagebar">${visible.map(([s,l],i)=>`<span class="stage ${i<idx?'done':i===idx?'active':''}">${l}</span>`).join("")}</div>`;
  }

  async function setQuickStageAction(orderId,status,trigger){
    const o=state.data.orders.find(x=>x.id===orderId);if(!o)return;
    if(status==="collected"&&o.channel==="pickup"&&!(o.items||[]).length)return openCollect(orderId);
    const label=quickStageLabel(status);
    if(workflowSettings().confirm_stage_changes&&!confirm(`Move ${o.order_no} to ${label}?`))return;
    return doAction({action:"set_quick_stage",order_id:orderId,target_status:status},`Moved to ${label}`,trigger,"Updating stage…");
  }


  function orderActionButton(action,id,label,iconName,extra=""){
    return `<button class="order-action" data-action="${action}" data-id="${id}" ${extra}>${icon(iconName)}<span>${label}</span></button>`;
  }

  function quickNextAction(o){
    if(o.laundry_status==="collected")return {label:"Received",sub:"Quick flow"};
    if(o.laundry_status==="received")return {label:"Start processing",sub:"Quick flow"};
    if(["washing","ironing"].includes(o.laundry_status))return {label:"Mark ready",sub:"Quick flow"};
    if(o.laundry_status==="ready")return o.channel==="counter"?{label:"Deliver / hand over",sub:"Quick flow"}:{label:"Send for delivery",sub:"Quick flow"};
    if(o.laundry_status==="out_for_delivery")return {label:"Mark delivered",sub:"Quick flow"};
    return null;
  }

  function openOrder(orderId){
    const o=state.data.orders.find(x=>x.id===orderId); if(!o)return;
    const role=state.data.actor.role; let primary=""; const secondary=[];
    if(role==="delivery" && o.laundry_status==="pickup_requested" && o.pickup_driver_id===state.data.actor.id) primary=`<button class="order-next-action" data-action="collect" data-id="${o.id}"><span class="next-copy"><small>Next action</small><b>Collect garments</b></span>${icon("arrow")}</button>`;
    if(role==="delivery" && o.laundry_status==="out_for_delivery" && o.delivery_driver_id===state.data.actor.id) primary=`<button class="order-next-action" data-action="deliver" data-id="${o.id}"><span class="next-copy"><small>Next action</small><b>Deliver / take payment</b></span>${icon("arrow")}</button>`;
    if(["admin","manager"].includes(role)){
      if(state.workflowMode==="quick"){
        const q=quickNextAction(o);
        if(o.laundry_status==="pickup_requested"){
          primary=o.pickup_driver_id?`<div class="order-waiting"><small>Next action</small><b>Awaiting driver collection</b></div>`:`<button class="order-next-action" data-action="assign" data-id="${o.id}" data-kind="pickup"><span class="next-copy"><small>Next action</small><b>Assign pickup driver</b></span>${icon("arrow")}</button>`;
        }else if(q && o.laundry_status==="ready" && o.channel==="pickup" && !o.delivery_driver_id){
          primary=`<button class="order-next-action" data-action="assign" data-id="${o.id}" data-kind="delivery" data-dispatch="true"><span class="next-copy"><small>Next action</small><b>Assign + send delivery</b></span>${icon("arrow")}</button>`;
        }else if(q){
          primary=`<button class="order-next-action" data-action="quick-advance" data-id="${o.id}"><span class="next-copy"><small>${q.sub}</small><b>${q.label}</b></span>${icon("arrow")}</button>`;
        }
      }else if(o.next_statuses?.[0]) primary=`<button class="order-next-action" data-action="advance" data-id="${o.id}" data-status="${o.next_statuses[0]}"><span class="next-copy"><small>Detailed stage</small><b>${esc(stageLabel(o.next_statuses[0]))}</b></span>${icon("arrow")}</button>`;
      secondary.push(orderActionButton("payment",o.id,"Payment","payment"));
      if(o.channel==="pickup") secondary.push(orderActionButton("assign",o.id,"Driver","driver",`data-kind="${o.laundry_status==='ready'||o.laundry_status==='out_for_delivery'?'delivery':'pickup'}"`));
    }
    secondary.push(orderActionButton("print-menu",o.id,"Print","print")); if(o.customer?.mobile)secondary.push(orderActionButton("whatsapp",o.id,"WhatsApp","whatsapp"));
    const subStatus=state.workflowMode==="quick"&&o.laundry_status==="out_for_delivery"?`<span class="detail-substatus">Detailed: Out for delivery</span>`:"";
    state.modal=`<div class="modal-backdrop"><section class="modal order-modal"><div class="modal-head"><div><div class="kicker">${o.channel} order</div><h2 class="mono">${esc(o.order_no)}</h2></div><button class="x" data-action="close-modal">×</button></div>
      <div class="workflow-mode"><button class="${state.workflowMode==='quick'?'active':''}" data-workflow-mode="quick" data-id="${o.id}">Quick flow</button><button class="${state.workflowMode==='detailed'?'active':''}" data-workflow-mode="detailed" data-id="${o.id}">Detailed stages</button></div>
      ${stageBar(o)}${subStatus}
      <div class="grid metrics order-metrics" style="margin-top:12px">${metric("Total",fmt(o.total),true)}${metric("Paid",fmt(o.paid))}${metric("Due",fmt(o.outstanding))}${metric("Credit",fmt(o.customer_credit))}</div>
      <div class="section card order-customer-card"><div class="row between"><div><div class="kicker">Customer</div><h3>${esc(o.customer?.name||"")}</h3><div class="small">${esc(o.customer?.customer_code||"")} · ${esc(o.customer?.mobile||"")}</div></div><span class="badge ${o.payment_status}">${o.payment_status}</span></div></div>
      <div class="section order-pieces"><div class="kicker">Pieces</div><div class="list">${o.items.length?o.items.map(i=>`<div class="list-row"><div class="row between"><span>${i.quantity} × ${esc(i.garment?.name||"")} <span class="muted">/ ${esc(i.service?.name||"")}</span></span><b>${fmt(i.line_total)}</b></div></div>`).join(""):`<div class="empty compact-empty">Garments will be captured at pickup.</div>`}</div></div>
      ${o.payments.length?`<details class="section order-payments"><summary>Payment history <span>${o.payments.length}</span></summary><div class="list" style="margin-top:8px">${o.payments.map(p=>`<div class="list-row"><div class="row between"><span>${esc(p.method)} · ${esc(p.payment_context)}</span><b>${fmt(p.received_amount)}</b></div><div class="small muted">Applied to order: ${fmt(p.amount)}</div></div>`).join("")}</div></details>`:""}
      <div class="order-action-dock">${primary}<div class="order-action-grid">${secondary.join("")}</div></div>
    </section></div>`; renderApp();
  }

  function effectiveRate(garmentId,serviceId){
    const today=dateKey(dubaiDate());
    return (state.data.refs.rates||[]).filter(r=>r.active&&r.garment_type_id===garmentId&&r.service_id===serviceId&&(!r.effective_from||r.effective_from<=today)&&(!r.effective_to||r.effective_to>=today)).sort((a,b)=>String(b.effective_from||"").localeCompare(String(a.effective_from||"")))[0]||null;
  }
  function collectionKey(serviceId,garmentId){return `${serviceId}|${garmentId}`}
  function collectionQty(serviceId,garmentId){return Number(state.qty[collectionKey(serviceId,garmentId)]||0)}
  function collectionTotals(){let pieces=0,total=0;const serviceCounts={};for(const [key,q] of Object.entries(state.qty)){if(!(Number(q)>0))continue;const [serviceId,garmentId]=key.split("|");const rate=effectiveRate(garmentId,serviceId);if(!rate)continue;pieces+=Number(q);total+=Number(q)*Number(rate.unit_price||0);serviceCounts[serviceId]=(serviceCounts[serviceId]||0)+Number(q)}return {pieces,total,serviceCounts,services:Object.keys(serviceCounts).length}}
  function collectionServices(){return state.data.refs.services.filter(s=>s.active&&state.data.refs.garments.some(g=>g.active&&effectiveRate(g.id,s.id)))}
  function collectionServiceTabs(){const totals=collectionTotals();return `<div class="collection-service-tabs">${collectionServices().map(s=>`<button type="button" class="collection-service-chip ${state.serviceId===s.id?'active':''}" data-action="collection-service" data-id="${s.id}"><span>${esc(s.name)}</span>${totals.serviceCounts[s.id]?`<b>${totals.serviceCounts[s.id]}</b>`:""}</button>`).join("")}</div>`}
  function itemPicker(serviceId){
    const term=(state.garmentSearch||"").trim().toLowerCase();
    const gs=state.data.refs.garments.filter(g=>g.active&&(!term||g.name.toLowerCase().includes(term)));
    return `<div class="qty-grid">${gs.map(g=>{const q=collectionQty(serviceId,g.id),r=effectiveRate(g.id,serviceId),key=collectionKey(serviceId,g.id);return `<div class="qty-row ${r?'':'disabled-row'}"><div><b>${esc(g.name)}</b><div class="small muted">${r?fmt(r.unit_price):'Rate not configured'}</div></div><div class="stepper"><button type="button" data-qty="${key}" data-delta="-1" ${r?'':'disabled'}>−</button><span>${r?q:0}</span><button type="button" data-qty="${key}" data-delta="1" ${r?'':'disabled'}>+</button></div></div>`}).join("")||`<div class="empty compact-empty">No matching garments.</div>`}</div>`;
  }
  function selectedItems(){return Object.entries(state.qty).filter(([,q])=>Number(q)>0).map(([key,quantity])=>{const [service_id,garment_type_id]=key.split("|");return {garment_type_id,service_id,quantity:Number(quantity)}})}
  function collectionSummary(){const t=collectionTotals();const serviceNames=new Map(state.data.refs.services.map(s=>[s.id,s.name]));const used=Object.entries(t.serviceCounts).map(([sid,q])=>`${esc(serviceNames.get(sid)||'Service')} · ${q}`).join(" &nbsp;•&nbsp; ");return `<div class="collection-summary"><div><span>Pieces</span><b>${t.pieces}</b></div><div><span>Services</span><b>${t.services}</b></div><div><span>Est. total</span><b>${fmt(t.total)}</b></div>${used?`<small>${used}</small>`:""}</div>`}
  function collectionEntry(title,kicker,formId,extraTop="",extraBottom=""){
    const activeServices=collectionServices();
    const preferred=activeServices.find(s=>s.code==="wash_iron")||activeServices[0];
    if(!preferred){toast("No service with an active rate is configured.",true);return null}
    state.qty={};state.serviceId=preferred.id;state.garmentSearch="";
    return `<div class="modal-head"><div><div class="kicker">${kicker}</div><h2>${title}</h2></div><button type="button" class="x" data-action="close-modal">×</button></div>${extraTop}<div class="section collection-section"><div class="row between collection-heading"><div><div class="kicker">1 · Service</div><h3>Choose service, then tap garments</h3></div><span class="small muted">Mix services in one collection</span></div><div id="collectionServices">${collectionServiceTabs()}</div></div><div class="section collection-section"><div class="row between collection-heading"><div class="kicker">2 · Garments</div><input id="garmentSearch" class="input collection-search" placeholder="Search garment" autocomplete="off"></div><div id="itemPicker">${itemPicker(state.serviceId)}</div></div><div id="collectionSummary">${collectionSummary()}</div>${extraBottom}`;
  }

  function openCounter(){
    const top=`<div class="form-grid two"><label>Customer<select name="customer_id" required><option value="">Choose customer</option>${state.data.customers.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.building_block||c.address||c.customer_code)}${c.door_no?` · Door ${esc(c.door_no)}`:""}</option>`).join("")}</select></label><label>Discount <span class="muted">optional</span><select name="discount_id"><option value="">No discount</option>${state.data.refs.discounts.filter(d=>d.active&&Number(d.value)>0).map(d=>`<option value="${d.id}">${esc(d.name)} · ${d.discount_type==='percent'?d.value+'%':fmt(d.value)}</option>`).join("")}</select></label></div>`;
    const bottom=`<div class="section form-grid two"><label>Payment now <span class="muted">optional</span><input class="input" name="payment_amount" type="number" min="0" step="0.01" placeholder="0.00"></label><label>Method<select name="payment_method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label></div><p class="small muted">Available customer advance is applied automatically before any new payment.</p><div class="section"><button class="btn primary block">CREATE ORDER →</button></div>`;
    const body=collectionEntry("New counter order","At the shop","counterForm",top,bottom);if(!body)return;
    state.modal=`<div class="modal-backdrop"><form class="modal collection-modal" id="counterForm">${body}</form></div>`;renderApp();
  }


  function openPickupRequest(){
    const drivers=state.data.staff.filter(s=>s.role==="delivery"&&s.active);
    state.modal=`<div class="modal-backdrop"><form class="modal" id="pickupStaffForm"><div class="modal-head"><div><div class="kicker">WhatsApp / phone</div><h2>Pickup request</h2></div><button type="button" class="x" data-action="close-modal">×</button></div><div class="stack"><label>Customer<select name="customer_id" required><option value="">Choose customer</option>${state.data.customers.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.building_block||c.address||c.customer_code)}${c.door_no?` · Door ${esc(c.door_no)}`:""}</option>`).join("")}</select></label><label>Assign pickup<select name="pickup_driver_id"><option value="">Assign later</option>${drivers.map(d=>`<option value="${d.id}">${esc(d.display_name)}</option>`).join("")}</select></label><label>Address / note<textarea name="note" placeholder="Preferred time, building, WhatsApp note..."></textarea></label><button class="btn primary block">SAVE REQUEST →</button></div></form></div>`;renderApp();
  }

  function openCollect(orderId){
    const o=state.data.orders.find(x=>x.id===orderId);
    const top=`<div class="collection-customer-line"><div><b>${esc(o.customer.name)}</b><span class="mono small">${esc(o.order_no)}</span></div><span class="small muted">Doorstep pickup</span></div>`;
    const bottom=`<div class="section form-grid two"><label>Payment now <span class="muted">optional</span><input class="input" name="payment_amount" type="number" min="0" step="0.01" placeholder="0.00"></label><label>Method<select name="payment_method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label></div><p class="small muted">Existing customer advance is automatically used against this order after pricing.</p><div class="section"><button class="btn primary block">SAVE + COLLECT →</button></div>`;
    const body=collectionEntry("Collect garments","Doorstep pickup","collectForm",top,bottom);if(!body)return;
    state.modal=`<div class="modal-backdrop"><form class="modal collection-modal" id="collectForm" data-order="${o.id}">${body}</form></div>`;renderApp();
  }


  function openDeliver(orderId){const o=state.data.orders.find(x=>x.id===orderId);state.modal=`<div class="modal-backdrop"><form class="modal" id="deliverForm" data-order="${o.id}"><div class="modal-head"><div><div class="kicker">Handover</div><h2>${esc(o.customer.name)}</h2><div class="mono small">${o.order_no}</div></div><button type="button" class="x" data-action="close-modal">×</button></div><div class="grid metrics">${metric("Due",fmt(o.outstanding),true)}${metric("Credit",fmt(o.customer_credit))}</div><div class="section form-grid two"><label>Payment received<input class="input" name="payment_amount" type="number" min="0" step="0.01" value="${o.outstanding||''}"></label><label>Method<select name="payment_method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label></div><p class="small muted">Leave payment blank/0 if already settled. Delivery status and payment status are separate.</p><button class="btn primary block">CONFIRM HANDOVER →</button></form></div>`;renderApp()}

  function simpleModal(title,body,formId){state.modal=`<div class="modal-backdrop"><form class="modal" id="${formId}"><div class="modal-head"><h2>${title}</h2><button type="button" class="x" data-action="close-modal">×</button></div>${body}</form></div>`;renderApp()}
  function openPayment(o){simpleModal("Record payment",`<div class="grid metrics">${metric("Due",fmt(o.outstanding),true)}${metric("Credit",fmt(o.customer_credit))}</div>${o.customer_credit>0&&o.outstanding>0?`<div class="section"><button type="button" class="btn block" data-action="credit" data-id="${o.id}">Apply ${fmt(Math.min(o.customer_credit,o.outstanding))} customer credit</button></div>`:""}<div class="section stack"><input type="hidden" name="order_id" value="${o.id}"><label>Amount received<input class="input" name="amount" type="number" min="0.01" step="0.01" value="${o.outstanding||''}" required></label><label>Method<select name="method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label><label>Where<select name="context"><option value="shop">At shop</option><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label><button class="btn primary block">SAVE PAYMENT →</button></div>`,"paymentForm")}
  function openPrintMenu(o){
    state.modal=`<div class="modal-backdrop"><section class="modal compact-modal"><div class="modal-head"><div><div class="kicker">${esc(o.order_no)}</div><h2>Print</h2></div><button class="x" data-action="close-modal">×</button></div><div class="print-choice-grid"><button class="print-choice" data-action="print-receipt" data-id="${o.id}">${icon("print")}<span><b>Receipt / PDF</b><small>Customer bill and QR</small></span></button>${o.pieces.length?`<button class="print-choice" data-action="print-labels" data-id="${o.id}">${icon("tag")}<span><b>Bag + garment tags</b><small>${o.pieces.length} piece${o.pieces.length===1?'':'s'}</small></span></button>`:`<div class="print-choice disabled">${icon("tag")}<span><b>Garment tags</b><small>Available after pieces are captured</small></span></div>`}</div></section></div>`;
    renderApp();
  }
  function openAssign(o,kind,dispatch=false){const ds=state.data.staff.filter(s=>s.role==="delivery"&&s.active);simpleModal(dispatch?"Assign + send delivery":`Assign ${kind}`,`<div class="stack"><input type="hidden" name="order_id" value="${o.id}"><input type="hidden" name="kind" value="${kind}"><input type="hidden" name="dispatch" value="${dispatch?'true':'false'}"><label>Delivery user<select name="driver_id" required>${ds.map(d=>`<option value="${d.id}">${esc(d.display_name)}</option>`).join("")}</select></label>${dispatch?`<p class="small muted">This will assign the driver and move the order to delivery in one step.</p>`:''}<button class="btn primary block">${dispatch?'ASSIGN + SEND →':'ASSIGN →'}</button></div>`,"assignForm")}
  function openCustomer(customer=null){simpleModal(customer?"Edit customer":"Add customer",`<div class="stack"><input type="hidden" name="id" value="${customer?.id||''}"><label>Name<input class="input" name="name" value="${esc(customer?.name||'')}" required></label><label>Mobile number<input class="input" name="mobile" value="${esc(customer?.mobile||'')}" placeholder="Mobile number" required></label><div class="form-grid two"><label>Building / Block<input class="input" name="building_block" value="${esc(customer?.building_block||'')}" placeholder="e.g. Al Qusais Block A"></label><label>Door No.<input class="input" name="door_no" value="${esc(customer?.door_no||'')}" placeholder="e.g. 204"></label></div><label>Area / street<textarea name="address" placeholder="Area, street, landmark">${esc(customer?.address||'')}</textarea></label><label>Six-digit code <span class="muted">${customer?'leave blank to keep current code':'optional — generated if blank'}</span><input class="input" name="pin" inputmode="numeric" maxlength="6"></label><button class="btn primary block">${customer?'SAVE CHANGES':'CREATE CUSTOMER'} →</button></div>`,"customerForm")}
  function financeTypeLabel(t){return ({advance:"Advance received",overpayment:"Overpayment credit",application:"Used for order",adjustment:"Adjustment"}[t]||t)}
  function customerFinanceModal(f){const c=f.customer,wallet=f.wallet||[],receipts=f.receipts||[];return `<div class="modal-backdrop"><section class="modal finance-modal"><div class="modal-head"><div><div class="kicker">Customer account</div><h2>${esc(c.name)}</h2><div class="small mono muted">${esc(c.customer_code)} · ${esc(c.mobile)}${c.building_block?` · ${esc(c.building_block)}`:""}${c.door_no?` · Door ${esc(c.door_no)}`:""}</div></div><button type="button" class="x" data-action="close-modal">×</button></div><div class="grid metrics finance-metrics">${metric("Outstanding",fmt(f.outstanding),true)}${metric("Advance / credit",fmt(f.credit))}${metric("Net position",f.net_position>0?`${fmt(f.net_position)} due`:f.net_position<0?`${fmt(Math.abs(f.net_position))} credit`:"Settled")}</div><form id="customerAccountPaymentForm" class="card finance-receive"><input type="hidden" name="customer_id" value="${c.id}"><div><div class="kicker">Receive money</div><h3>Payment or advance</h3><p class="small muted">Money first settles oldest outstanding orders. Any excess stays as customer advance.</p></div><div class="finance-payment-grid"><label>Amount<input class="input" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label><label>Method<select name="method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label><label class="finance-note">Note <span class="muted">optional</span><input class="input" name="note" placeholder="Advance, monthly deposit, reference..."></label><button class="btn primary" type="submit">RECEIVE PAYMENT</button></div></form><div class="section"><div class="row between"><div><div class="kicker">Wallet ledger</div><h3>Credit / debit transactions</h3></div><span class="badge ${f.credit>0?'paid':'unpaid'}">Balance ${fmt(f.credit)}</span></div>${wallet.length?`<div class="finance-ledger">${wallet.map(x=>`<div class="finance-row"><div><b>${esc(financeTypeLabel(x.entry_type))}</b><span>${new Date(x.created_at).toLocaleString()}${x.reference_no?` · ${esc(x.reference_no)}`:""}</span>${x.note?`<small>${esc(x.note)}</small>`:""}</div><div class="finance-amount ${Number(x.amount)>=0?'credit-text':'due-text'}"><b>${Number(x.amount)>=0?'+':'−'}${fmt(Math.abs(Number(x.amount)))}</b><span>Bal ${fmt(x.balance_after)}</span></div></div>`).join("")}</div>`:`<div class="empty compact-empty">No advance or credit transactions yet.</div>`}</div>${receipts.length?`<details class="section order-payments"><summary>Cash receipts <span>${receipts.length}</span></summary><div class="list" style="margin-top:8px">${receipts.slice(0,30).map(x=>`<div class="list-row"><div class="row between"><span>${esc(x.method)} · ${esc(x.payment_context)}</span><b>${fmt(x.received_amount)}</b></div><div class="small muted">${new Date(x.created_at).toLocaleString()}${x.note?` · ${esc(x.note)}`:""}</div></div>`).join("")}</div></details>`:""}</section></div>`}
  async function openCustomerFinance(customerId,trigger=null){try{setBusy(true,trigger,"Opening account…");const f=await api(`/customer-finance?id=${encodeURIComponent(customerId)}`);state.modal=customerFinanceModal(f);renderApp()}catch(e){toast(e.message,true)}finally{setBusy(false)}}

  function openDemoReset(){
    simpleModal("Reset demo data",`<div class="stack"><div class="danger-note"><b>This removes operational demo transactions.</b><span>Staff users, customers, rates, services, garments, discounts and organization settings are retained.</span></div><div class="reset-scope"><div><span>Will be cleared</span><b>Orders · payments · credits · workflow history · tags</b></div><div><span>Will be retained</span><b>Users · customers · pricing · setup</b></div></div><label>Type <b>RESET</b> to confirm<input class="input mono" name="confirmation" autocomplete="off" placeholder="RESET" required></label><button class="btn danger block" type="submit">RESET DEMO DATA</button></div>`,"demoResetForm")
  }
  function openStaff(staff=null){simpleModal(staff?"Edit staff":"Add staff",`<div class="stack"><input type="hidden" name="id" value="${staff?.id||''}"><label>Name<input class="input" name="display_name" value="${esc(staff?.display_name||'')}" required></label><label>Login ID<input class="input" name="login_id" value="${esc(staff?.login_id||'')}" required></label><label>Role<select name="role">${["admin","manager","delivery"].map(r=>`<option ${staff?.role===r?'selected':''}>${r}</option>`).join("")}</select></label><label>Phone<input class="input" name="phone" value="${esc(staff?.phone||'')}"></label><label>New six-digit code <span class="muted">${staff?'leave blank to keep':'generated if blank'}</span><input class="input" name="pin" inputmode="numeric" maxlength="6"></label><label class="row"><input name="active" type="checkbox" ${staff?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE STAFF →</button></div>`,"staffForm")}
  function openRate(){simpleModal("Add / change rate",`<div class="stack"><label>Garment<select name="garment_type_id">${state.data.refs.garments.filter(x=>x.active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label><label>Service<select name="service_id">${state.data.refs.services.filter(x=>x.active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label><label>Price AED<input class="input" name="unit_price" type="number" min="0" step="0.01" required></label><label>Effective from<input class="input" name="effective_from" type="date" value="${new Date().toISOString().slice(0,10)}"></label><button class="btn primary block">SAVE RATE →</button></div>`,"rateForm")}
  function openCatalog(kind,item=null){const isG=kind==="garment";simpleModal(`${item?'Edit':'Add'} ${kind}`,`<div class="stack"><input type="hidden" name="id" value="${item?.id||''}"><label>Name<input class="input" name="name" value="${esc(item?.name||'')}" required></label><label>Code<input class="input mono" name="code" value="${esc(item?.code||'')}" required></label>${isG?'':`<label>Workflow<select name="workflow"><option value="wash_iron" ${item?.workflow==='wash_iron'?'selected':''}>Wash + Iron</option><option value="wash_only" ${item?.workflow==='wash_only'?'selected':''}>Wash Only</option><option value="iron_only" ${item?.workflow==='iron_only'?'selected':''}>Iron Only</option><option value="dry_clean" ${item?.workflow==='dry_clean'?'selected':''}>Dry Clean</option><option value="custom" ${item?.workflow==='custom'?'selected':''}>Other / Custom</option></select></label>`}<label class="row"><input name="active" type="checkbox" ${item?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE →</button></div>`,isG?"garmentForm":"serviceForm")}
  function openDiscount(item=null){simpleModal(item?"Edit discount":"Add discount",`<div class="stack"><input type="hidden" name="id" value="${item?.id||''}"><label>Name<input class="input" name="name" value="${esc(item?.name||'')}" required></label><label>Type<select name="discount_type"><option value="percent" ${item?.discount_type==='percent'?'selected':''}>Percent</option><option value="fixed" ${item?.discount_type==='fixed'?'selected':''}>Fixed AED</option></select></label><label>Value<input class="input" name="value" type="number" min="0" step="0.01" value="${item?.value??''}" required></label><label class="row"><input name="active" type="checkbox" ${item?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE DISCOUNT →</button></div>`,"discountForm")}

  function themeModal(){
    return `<div class="modal-backdrop"><form class="modal" id="themeForm"><div class="modal-head"><div><div class="kicker">Appearance</div><h2>Theme</h2></div><button type="button" class="x" data-action="close-modal">×</button></div>
      <p class="sub">Graphite is the default. Switch to Light when you prefer a brighter workspace.</p>
      <div class="section theme-mode-grid"><button type="button" class="theme-mode ${state.mode==='graphite'?'active':''}" data-theme-mode="graphite"><span class="theme-preview graphite"></span><b>Graphite</b><small>Black + grey</small></button><button type="button" class="theme-mode ${state.mode==='light'?'active':''}" data-theme-mode="light"><span class="theme-preview light"></span><b>Light</b><small>White + soft grey</small></button></div>
      <div class="section"><div class="kicker">Accent</div><p class="small muted">Used mainly in Light mode and focus states.</p><div class="theme-grid">${THEME_PRESETS.map(c=>`<button type="button" class="theme-swatch ${state.theme===c?'active':''}" style="background:${c}" data-theme-color="${c}" aria-label="Use ${c}"></button>`).join("")}</div></div>
      <div class="section"><label>Custom accent<div class="theme-custom"><input id="themeColor" name="color" type="color" value="${state.theme}"><input class="input mono" id="themeHex" value="${state.theme}" maxlength="7" aria-label="Theme hex color"></div></label></div>
      <div class="section"><button class="btn primary block">Save theme</button></div>
    </form></div>`;
  }
  function openTheme(){state.modal=themeModal();renderApp()}
  function closeModal(){state.modal=null;renderApp()}
  async function doAction(body, success="Saved", trigger=null, label=null){
    try{setBusy(true,trigger,label);await api("/action",{method:"POST",body});state.modal=null;await refresh();toast(success)}catch(e){toast(e.message,true)}finally{setBusy(false)}
  }

  function bindDynamicForms(){
    const bind=(formId,fn)=>{const f=id(formId);if(f)f.addEventListener("submit",fn)};
    bind("pickupSelfForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"create_pickup_request",address:f.get("address"),note:f.get("note")},"Pickup requested",e.submitter)});
    bind("pickupStaffForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"create_pickup_request",customer_id:f.get("customer_id"),pickup_driver_id:f.get("pickup_driver_id")||null,note:f.get("note")},"Pickup request saved",e.submitter)});
    bind("counterForm",e=>{e.preventDefault();const f=new FormData(e.target),items=selectedItems();if(!items.length)return toast("Add at least one garment",true);doAction({action:"create_counter_order",customer_id:f.get("customer_id"),discount_id:f.get("discount_id")||null,items,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method")},"Counter order created",e.submitter)});
    bind("collectForm",e=>{e.preventDefault();const f=new FormData(e.target),items=selectedItems();if(!items.length)return toast("Add at least one garment",true);doAction({action:"collect_pickup",order_id:e.target.dataset.order,items,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method")},"Pickup collected",e.submitter)});
    bind("deliverForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"deliver_order",order_id:e.target.dataset.order,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method")},"Delivered",e.submitter)});
    bind("paymentForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"record_payment",order_id:f.get("order_id"),amount:f.get("amount"),method:f.get("method"),context:f.get("context")},"Payment recorded",e.submitter)});
    bind("customerAccountPaymentForm",async e=>{e.preventDefault();const f=new FormData(e.target),customerId=f.get("customer_id");try{setBusy(true,e.submitter,"Receiving payment…");const r=await api("/action",{method:"POST",body:{action:"record_customer_payment",customer_id:customerId,amount:f.get("amount"),method:f.get("method"),note:f.get("note")}});await refresh();const d=r.result||{};const finance=await api(`/customer-finance?id=${encodeURIComponent(customerId)}`);state.modal=customerFinanceModal(finance);renderApp();toast(`Received ${fmt(d.received||f.get("amount"))} · ${fmt(d.allocated||0)} settled · ${fmt(d.advance_added||0)} advance`)}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("assignForm",e=>{e.preventDefault();const f=new FormData(e.target),dispatch=f.get("dispatch")==="true";doAction({action:"assign_driver",order_id:f.get("order_id"),kind:f.get("kind"),driver_id:f.get("driver_id"),dispatch},dispatch?"Driver assigned and sent":"Driver assigned",e.submitter,dispatch?"Assigning + sending…":"Assigning…")});
    bind("customerForm",async e=>{e.preventDefault();const f=new FormData(e.target),isNew=!f.get("id");try{setBusy(true,e.submitter,"Saving customer…");const r=await api("/action",{method:"POST",body:{action:"save_customer",id:f.get("id")||null,name:f.get("name"),mobile:f.get("mobile"),building_block:f.get("building_block"),door_no:f.get("door_no"),address:f.get("address"),pin:f.get("pin")||null}});state.modal=null;await refresh();if(isNew&&r.temporary_pin)alert(`Customer created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the customer.`);else toast("Customer saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("customerQuickForm",async e=>{e.preventDefault();const f=new FormData(e.target);try{setBusy(true,e.submitter,"Adding customer…");const r=await api("/action",{method:"POST",body:{action:"save_customer",name:f.get("name"),mobile:f.get("mobile"),building_block:f.get("building_block"),door_no:f.get("door_no"),address:f.get("address"),pin:null}});await refresh();const panel=id("adminPanel");if(panel&&state.data.actor.role==="admin"){panel.innerHTML=adminCustomers();bindDynamicForms()}else if(state.data.actor.role==="manager"&&state.view==="customers")renderApp();if(r.temporary_pin)alert(`Customer created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the customer.`)}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("staffForm",async e=>{e.preventDefault();const f=new FormData(e.target),isNew=!f.get("id");try{setBusy(true,e.submitter,"Saving staff…");const r=await api("/action",{method:"POST",body:{action:"save_staff",id:f.get("id")||null,display_name:f.get("display_name"),login_id:f.get("login_id"),role:f.get("role"),phone:f.get("phone"),pin:f.get("pin")||null,active:f.get("active")==="on"}});state.modal=null;await refresh();if(isNew&&r.temporary_pin)alert(`Staff created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the staff member.`);else toast("Staff saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("rateForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_rate",garment_type_id:f.get("garment_type_id"),service_id:f.get("service_id"),unit_price:f.get("unit_price"),effective_from:f.get("effective_from")},"Rate saved",e.submitter)});
    bind("garmentForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_garment",id:f.get("id")||null,name:f.get("name"),code:f.get("code"),active:f.get("active")==="on"},"Garment saved",e.submitter)});
    bind("serviceForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_service",id:f.get("id")||null,name:f.get("name"),code:f.get("code"),workflow:f.get("workflow"),active:f.get("active")==="on"},"Service saved",e.submitter)});
    bind("discountForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_discount",id:f.get("id")||null,name:f.get("name"),discount_type:f.get("discount_type"),value:f.get("value"),active:f.get("active")==="on"},"Discount saved",e.submitter)});
    bind("businessForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_business_settings",name:f.get("name"),address:f.get("address"),phone:f.get("phone")},"Organization updated",e.submitter,"Saving organization…")});
    bind("workflowSettingsForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_workflow_settings",confirm_stage_changes:f.get("confirm_stage_changes")==="on"},"Workflow setting updated",e.submitter,"Saving workflow…")});
    bind("demoResetForm",async e=>{e.preventDefault();const f=new FormData(e.target),confirmation=String(f.get("confirmation")||"").trim().toUpperCase();if(confirmation!=="RESET")return toast("Type RESET to confirm",true);try{setBusy(true,e.submitter,"Resetting demo data…");const r=await api("/action",{method:"POST",body:{action:"reset_demo_data",confirmation:"RESET"}});state.modal=null;state.reportData=null;await refresh();const d=r.reset||{};toast(`Demo reset complete · ${d.orders||0} orders · ${d.payments||0} payments cleared`)}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("reportCustomForm",e=>{e.preventDefault();const f=new FormData(e.target);state.reportFrom=f.get("from");state.reportTo=f.get("to");if(state.reportFrom>state.reportTo)return toast("From date must be before To date",true);loadReports(true)});
    bind("themeForm",e=>{e.preventDefault();const color=id("themeHex")?.value||id("themeColor")?.value; if(!/^#[0-9a-f]{6}$/i.test(color||""))return toast("Enter a valid color such as #64748B",true);applyTheme(color,true);applyMode(state.mode,true);state.modal=null;renderApp();toast("Theme updated")});
    const themeColor=id("themeColor"), themeHex=id("themeHex"); if(themeColor&&themeHex){themeColor.addEventListener("input",()=>themeHex.value=themeColor.value);themeHex.addEventListener("input",()=>{if(/^#[0-9a-f]{6}$/i.test(themeHex.value))themeColor.value=themeHex.value})}
    const search=id("garmentSearch"); if(search) search.addEventListener("input",()=>{state.garmentSearch=search.value;const picker=id("itemPicker");if(picker)picker.innerHTML=itemPicker(state.serviceId)});
  }

  let qrLoader=null;
  function ensureQRCode(){
    if(window.QRCode) return Promise.resolve();
    if(qrLoader) return qrLoader;
    qrLoader=new Promise((resolve,reject)=>{const sc=document.createElement("script");sc.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";sc.onload=resolve;sc.onerror=()=>reject(new Error("Could not load QR generator"));document.head.appendChild(sc)});
    return qrLoader;
  }
  async function printDoc(o,mode,trigger=null){
    try{setBusy(true,trigger,mode==="receipt"?"Preparing receipt…":"Preparing labels…");await ensureQRCode()}catch(e){setBusy(false);return toast(e.message,true)}
    const p=document.getElementById("printArea"), org=business();
    if(mode==="receipt"){
      p.innerHTML=`<div class="print-sheet"><div class="print-head"><div><div class="print-title">${esc(org.name||"Laundry Desk")}</div>${org.address?`<div class="print-address">${esc(org.address)}</div>`:""}${org.phone?`<div>${esc(org.phone)}</div>`:""}<div class="print-order">${esc(o.order_no)} · ${new Date(o.created_at).toLocaleString()}</div></div><div id="printQr" class="qr"></div></div><h3>${esc(o.customer.name)} · ${esc(o.customer.customer_code)}</h3><div>${esc(o.customer.mobile)}</div><table class="print-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${o.items.map(i=>`<tr><td>${esc(i.garment.name)} / ${esc(i.service.name)}</td><td>${i.quantity}</td><td>${fmt(i.unit_price)}</td><td>${fmt(i.line_total)}</td></tr>`).join("")}</tbody></table><div style="margin-top:6mm;text-align:right"><b>Total ${fmt(o.total)}</b><br>Paid ${fmt(o.paid)}<br><b>Outstanding ${fmt(o.outstanding)}</b>${o.customer_credit>0?`<br>Customer credit ${fmt(o.customer_credit)}`:""}</div><p style="margin-top:8mm">Laundry status: <b>${stageLabel(o.laundry_status)}</b> · Payment status: <b>${o.payment_status}</b></p></div>`;
      if(window.QRCode)new QRCode(document.getElementById("printQr"),{text:o.order_no,width:90,height:90});
    }else{
      p.innerHTML=`<div class="print-sheet"><div class="bag-label"><div class="row between"><div><div class="print-org">${esc(org.name||"Laundry Desk")}</div><div class="print-title">${esc(o.order_no)}</div><b>${esc(o.customer.name)}</b><br>${esc(o.customer.customer_code)} · ${o.pieces.length} pcs</div><div id="printQr" class="qr"></div></div></div><div class="label-grid">${o.pieces.map(pc=>`<div class="garment-tag"><span class="print-org">${esc(org.name||"Laundry Desk")}</span><br><b>${esc(o.order_no)}</b><br>Customer: ${esc(o.customer.customer_code)}<br>Piece: <b>${pc.piece_no}/${o.pieces.length}</b><br><span class="mono">${esc(pc.tag_code)}</span></div>`).join("")}</div></div>`;
      if(window.QRCode)new QRCode(document.getElementById("printQr"),{text:o.order_no,width:90,height:90});
    }
    setTimeout(()=>{window.print();setBusy(false)},120);
  }

  function whatsapp(o){const phone=(o.customer.mobile||"").replace(/\D/g,""),org=business();const msg=`${org.name||"Laundry Desk"} — ${o.order_no}\nStatus: ${stageLabel(o.laundry_status)}\nTotal: ${fmt(o.total)}\nPaid: ${fmt(o.paid)}\nBalance: ${fmt(o.outstanding)}\n\nReceipt PDF can be attached to this chat.`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank")}

  document.addEventListener("click",async e=>{
    const demoBtn=e.target.closest("[data-demo]"); if(demoBtn){const [u,p]=demoBtn.dataset.demo.split("|");id("loginIdentifier").value=u;id("loginPin").value=p;return}
    const themeBtn=e.target.closest("[data-theme-color]"); if(themeBtn){applyTheme(themeBtn.dataset.themeColor,true);state.modal=themeModal();renderApp();return}
    const modeBtn=e.target.closest("[data-theme-mode]"); if(modeBtn){applyMode(modeBtn.dataset.themeMode,true);state.modal=themeModal();renderApp();return}
    const v=e.target.closest("[data-view]")?.dataset.view;if(v){state.view=v;renderApp();if(v==="reports")loadReports(true);return}
    const q=e.target.closest("[data-qty]");if(q){const key=q.dataset.qty,delta=Number(q.dataset.delta);state.qty[key]=Math.max(0,Number(state.qty[key]||0)+delta);if(!state.qty[key])delete state.qty[key];const picker=id("itemPicker"),services=id("collectionServices"),summary=id("collectionSummary");if(picker)picker.innerHTML=itemPicker(state.serviceId);if(services)services.innerHTML=collectionServiceTabs();if(summary)summary.innerHTML=collectionSummary();return}
    const tab=e.target.closest("[data-admin-tab]"); if(tab){state.adminTab=tab.dataset.adminTab;document.querySelectorAll("[data-admin-tab]").forEach(x=>x.classList.toggle("active",x===tab));const panel=id("adminPanel");panel.innerHTML=state.adminTab==="business"?adminBusiness():state.adminTab==="workflow"?adminWorkflow():state.adminTab==="staff"?adminStaff():state.adminTab==="customers"?adminCustomers():state.adminTab==="rates"?adminRates():state.adminTab==="catalog"?adminCatalog():state.adminTab==="discounts"?adminDiscounts():adminSystem();bindDynamicForms();return}
    const stageFilter=e.target.closest("[data-filter-stage]");if(stageFilter){document.querySelectorAll("[data-filter-stage]").forEach(x=>x.classList.toggle("active",x===stageFilter));state.orderFilter=stageFilter.dataset.filterStage||"all";renderOrderList(state.data.actor.role!=="delivery");return}
    const orderView=e.target.closest("[data-order-view]");if(orderView){state.orderView=orderView.dataset.orderView==="detailed"?"detailed":"optimal";localStorage.setItem("laundry_order_view",state.orderView);document.querySelectorAll("[data-order-view]").forEach(x=>x.classList.toggle("active",x.dataset.orderView===state.orderView));renderOrderList(state.data.actor.role!=="delivery");return}
    const workflow=e.target.closest("[data-workflow-mode]");if(workflow){state.workflowMode=workflow.dataset.workflowMode==="detailed"?"detailed":"quick";localStorage.setItem("laundry_workflow_mode",state.workflowMode);openOrder(workflow.dataset.id);return}
    const reportTab=e.target.closest("[data-report-tab]");if(reportTab){state.reportTab=reportTab.dataset.reportTab;renderApp();return}
    const reportPreset=e.target.closest("[data-report-preset]");if(reportPreset){state.reportPreset=reportPreset.dataset.reportPreset;localStorage.setItem("laundry_report_preset",state.reportPreset);if(state.reportPreset==="this_year")state.reportGroup="month";else if(state.reportPreset!=="custom")state.reportGroup="day";localStorage.setItem("laundry_report_group",state.reportGroup);renderApp();loadReports(true);return}
    const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
    if(a==="logout")return logout(true,b); if(a==="toggle-theme"){applyMode(state.mode==="graphite"?"light":"graphite",true);renderApp();return} if(a==="theme")return openTheme(); if(a==="close-modal")return closeModal();
    if(a==="open-demo-reset")return openDemoReset();
    if(a==="set-quick-stage")return setQuickStageAction(b.dataset.id,b.dataset.status,b);
    if(a==="toggle-all-pickups"){const select=b.dataset.select==="true";document.querySelectorAll("[data-bulk-pickup]").forEach(x=>{if(select)state.bulkPickupSelected.add(x.dataset.bulkPickup);else state.bulkPickupSelected.delete(x.dataset.bulkPickup)});renderApp();return}
    if(a==="bulk-assign-pickups"){const driver=id("bulkPickupDriver")?.value,orders=[...state.bulkPickupSelected];if(!orders.length)return toast("Select at least one pickup order",true);if(!driver)return toast("Choose a collection boy",true);try{setBusy(true,b,"Assigning pickups…");const r=await api("/action",{method:"POST",body:{action:"bulk_assign_pickups",driver_id:driver,order_ids:orders}});state.bulkPickupSelected.clear();await refresh();toast(`${r.assigned||0} pickup${Number(r.assigned||0)===1?'':'s'} assigned`)}catch(err){toast(err.message,true)}finally{setBusy(false)}return}
    if(a==="collection-service"){state.serviceId=b.dataset.id;state.garmentSearch="";const picker=id("itemPicker"),services=id("collectionServices"),search=id("garmentSearch");if(search)search.value="";if(picker)picker.innerHTML=itemPicker(state.serviceId);if(services)services.innerHTML=collectionServiceTabs();return}
    if(a==="open-order")return openOrder(b.dataset.id); if(a==="counter-order")return openCounter(); if(a==="pickup-request")return openPickupRequest(); if(a==="new-customer")return openCustomer(); if(a==="edit-customer")return openCustomer(state.data.customers.find(c=>c.id===b.dataset.id)); if(a==="customer-account")return openCustomerFinance(b.dataset.id,b);
    if(a==="collect")return openCollect(b.dataset.id); if(a==="deliver")return openDeliver(b.dataset.id);
    if(a==="payment")return openPayment(state.data.orders.find(o=>o.id===b.dataset.id)); if(a==="assign")return openAssign(state.data.orders.find(o=>o.id===b.dataset.id),b.dataset.kind,b.dataset.dispatch==="true"); if(a==="print-menu")return openPrintMenu(state.data.orders.find(o=>o.id===b.dataset.id));
    if(a==="advance")return doAction({action:"advance_order",order_id:b.dataset.id,target_status:b.dataset.status},`Moved to ${stageLabel(b.dataset.status)}`,b,"Updating stage…");
    if(a==="quick-advance")return doAction({action:"quick_advance",order_id:b.dataset.id},"Order updated",b,"Updating…");
    if(a==="credit")return doAction({action:"apply_credit",order_id:b.dataset.id},"Customer credit applied",b,"Applying credit…");
    if(a==="print-receipt")return printDoc(state.data.orders.find(o=>o.id===b.dataset.id),"receipt",b); if(a==="print-labels")return printDoc(state.data.orders.find(o=>o.id===b.dataset.id),"labels",b); if(a==="whatsapp")return whatsapp(state.data.orders.find(o=>o.id===b.dataset.id));
    if(a==="export-excel")return exportExcel(b); if(a==="export-pdf")return exportPDF(b);
    if(a==="quick-save-rate"){const price=id("quickRatePrice")?.value,date=id("quickRateDate")?.value,garment=id("quickRateGarment")?.value,service=id("quickRateService")?.value;if(!garment||!service||price==="")return toast("Select garment, service and rate",true);return doAction({action:"save_rate",garment_type_id:garment,service_id:service,unit_price:price,effective_from:date},"Rate added",b,"Adding rate…")}
    if(a==="save-rate-row"){const row=document.querySelector(`[data-rate-row="${b.dataset.id}"]`),price=row?.querySelector("[data-rate-price]")?.value,date=row?.querySelector("[data-rate-date]")?.value;if(price===""||!date)return toast("Rate and effective date are required",true);return doAction({action:"save_rate",id:b.dataset.id,garment_type_id:b.dataset.garment,service_id:b.dataset.service,unit_price:price,effective_from:date},"Rate updated",b,"Saving rate…")}
    if(a==="new-staff")return openStaff(); if(a==="edit-staff")return openStaff(state.data.staff.find(s=>s.id===b.dataset.id)); if(a==="new-rate")return openRate(); if(a==="new-garment")return openCatalog("garment"); if(a==="edit-garment")return openCatalog("garment",state.data.refs.garments.find(x=>x.id===b.dataset.id)); if(a==="new-service")return openCatalog("service"); if(a==="edit-service")return openCatalog("service",state.data.refs.services.find(x=>x.id===b.dataset.id)); if(a==="new-discount")return openDiscount(); if(a==="edit-discount")return openDiscount(state.data.refs.discounts.find(x=>x.id===b.dataset.id));
    if(a==="toggle-customer")return doAction({action:"set_customer_access",customer_id:b.dataset.id,enabled:b.dataset.enabled!=="true"},"Customer access updated",b,"Updating access…");
    if(a==="reset-customer"){if(!confirm("Reset this customer's six-digit login code?"))return;try{setBusy(true,b,"Resetting code…");const r=await api("/action",{method:"POST",body:{action:"reset_customer_pin",customer_id:b.dataset.id}});await refresh();alert(`New customer code: ${r.pin}\nShare it privately with the customer.`)}catch(err){toast(err.message,true)}finally{setBusy(false)}return}
  });

  document.addEventListener("change",e=>{
    if(e.target?.matches?.("[data-bulk-pickup]")){if(e.target.checked)state.bulkPickupSelected.add(e.target.dataset.bulkPickup);else state.bulkPickupSelected.delete(e.target.dataset.bulkPickup);renderApp();return}
    if(e.target?.id==="customerBuildingFilter"){state.customerBuildingFilter=e.target.value;renderApp();return}
    if(e.target?.id==="customerSort"){state.customerSort=e.target.value;renderApp();return}
    if(e.target?.id==="pickupBuildingFilter"){state.pickupBuildingFilter=e.target.value;renderApp();return}
    if(e.target?.id==="pickupSort"){state.pickupSort=e.target.value;renderApp();return}
    if(e.target?.id==="deliveryBuildingFilter"){state.deliveryBuildingFilter=e.target.value;renderApp();return}
    if(e.target?.id==="deliverySort"){state.deliverySort=e.target.value;renderApp();return}
    if(e.target?.id==="reportGroup"){state.reportGroup=e.target.value;localStorage.setItem("laundry_report_group",state.reportGroup);loadReports(true)}
    if(e.target?.id==="reportCalendarMonth"){state.reportCalendarMonth=e.target.value;loadReports(true)}
  });

  window.addEventListener("online",()=>{if(state.token)refresh()});
  if(state.token) refresh(true); else renderLogin();
})();
