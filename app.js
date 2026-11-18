(() => {
  const cfg = window.LAUNDRY_CONFIG;
  const STAGES = [
    ["pickup_requested","Pickup requested"],["collected","Collected"],["received","Received"],
    ["washing","Washing"],["ironing","Ironing"],["ready","Ready"],["out_for_delivery","Out for delivery"],["delivered","Delivered"]
  ];
  const state = {
    token: localStorage.getItem("laundry_token") || "",
    data: null,
    view: "home",
    modal: null,
    busy: false,
    qty: {},
    serviceId: null,
    theme: localStorage.getItem("laundry_theme") || "#64748b",
    mode: localStorage.getItem("laundry_mode") || "graphite",
  };
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const esc = (v="") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const fmt = n => `AED ${Number(n || 0).toFixed(2)}`;
  const stageLabel = s => STAGES.find(x=>x[0]===s)?.[1] || s;
  const roleName = r => ({admin:"Admin",manager:"Manager",delivery:"Delivery",customer:"Customer"}[r] || r);
  const id = x => document.getElementById(x);

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
      logout:'<path d="M10 17l5-5-5-5M15 12H3M14 3h7v18h-7"/>'
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
    if(role==="manager") return ["home","orders","new","reports"];
    if(role==="delivery") return ["stops","orders","history","account"];
    return ["home","orders","pickup","account"];
  }

  function navItems(role){
    const map={
      admin:[["home","Home","home"],["orders","Orders","orders"],["admin","Setup","admin"],["reports","Reports","reports"]],
      manager:[["home","Home","home"],["orders","Orders","orders"],["new","Create","plus"],["reports","Reports","reports"]],
      delivery:[["stops","Stops","route"],["orders","Orders","orders"],["history","History","history"],["account","Account","user"]],
      customer:[["home","Home","home"],["orders","Orders","orders"],["pickup","Pickup","pickup"],["account","Account","user"]]
    }; return map[role] || [];
  }

  function renderLogin(){
    state.data=null;
    app.innerHTML=`<div class="login-wrap"><main class="login">
      <div class="login-brand"><div class="login-mark">L</div><div class="login-title">Laundry Desk<span>Simple laundry operations</span></div></div>
      <div class="card stack">
        <div><h2>Welcome back</h2><p class="sub">Use your staff login or customer mobile number.</p></div>
        <form id="loginForm" class="stack">
          <label>Login / UAE mobile<input id="loginIdentifier" class="input" autocomplete="username" placeholder="manager or +971..." required></label>
          <label>Six-digit code<input id="loginPin" class="input mono" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="current-password" placeholder="••••••" required></label>
          <button class="btn primary block" type="submit">Sign in</button>
        </form>
        <div class="security-note">Access is role-based and customer login attempts are rate-limited on the server.</div>
      </div>
      <div class="section"><div class="kicker">Demo accounts — tap to fill</div><div class="demo-grid" style="margin-top:8px">
        ${demo("Admin","admin","111111")}${demo("Manager","manager","222222")}${demo("Delivery","driver","333333")}${demo("Customer","+971501234567","444444")}
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
    state.token=""; state.data=null; localStorage.removeItem("laundry_token"); renderLogin();
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
        <div class="actor"><div class="actor-copy"><div class="actor-name">${esc(a.display_name)}</div><div class="actor-role">${roleName(a.role)}</div></div><button class="icon-btn" data-action="toggle-theme" aria-label="Switch to ${state.mode==='graphite'?'light':'graphite'} theme" title="Switch theme">${icon(state.mode==='graphite'?"sun":"moon")}</button><button class="icon-btn" data-action="theme" aria-label="Theme settings" title="Theme settings">${icon("palette")}</button><button class="btn ghost smallbtn" data-action="logout">${icon("logout","sm")}<span>Exit</span></button></div>
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
    if(role==="manager") return state.view==="home"?homeStaff():state.view==="orders"?ordersView():state.view==="new"?newView():reportsView();
    if(role==="delivery") return state.view==="stops"?deliveryStops():state.view==="orders"?ordersView(false):state.view==="history"?historyView():accountView();
    return state.view==="home"?customerHome():state.view==="orders"?ordersView():state.view==="pickup"?customerPickup():accountView();
  }

  function titleBlock(kicker,title,sub,actions=""){
    return `<div class="page-head"><div class="page-head-copy"><div class="kicker">${kicker}</div><h1>${title}</h1>${sub?`<p class="sub">${sub}</p>`:""}</div>${actions?`<div class="page-head-actions">${actions}</div>`:""}</div>`;
  }

  function metric(label,value,accent=false){return `<div class="card metric ${accent?'accent':''}"><div class="value">${value}</div><div class="label">${label}</div></div>`}

  function homeStaff(){
    const s=state.data.summary, role=state.data.actor.role;
    const urgent=(state.data.orders||[]).filter(o=>["pickup_requested","ready"].includes(o.laundry_status)).slice(0,4);
    const action=role==="manager"?`<button class="btn primary" data-action="counter-order">${icon("plus","sm")}New counter order</button>`:"";
    return `${titleBlock("Today","Operations","What needs attention now.",action)}
      <div class="grid metrics">${metric("Active orders",s.active_orders,true)}${metric("Outstanding",fmt(s.outstanding))}${metric("Collected",fmt(s.payments_received))}${metric("Customer credit",fmt(s.customer_credits))}</div>
      <section class="section"><div class="section-head"><div><h2>Needs attention</h2><p class="sub small">Pickup requests and orders ready to hand over.</p></div></div>${urgent.length?`<div class="grid cards">${urgent.map(orderCard).join("")}</div>`:`<div class="empty">You are up to date. No urgent work right now.</div>`}</section>
      <section class="section"><div class="section-head"><div><h2>Work by stage</h2></div></div><div class="queue-strip">${STAGES.filter(([k])=>k!=="delivered").map(([k,l])=>`<div class="queue-chip"><b>${s.stage_counts[k]||0}</b><span>${l}</span></div>`).join("")}</div></section>`;
  }

  function customerHome(){
    const orders=state.data.orders, active=orders.filter(o=>o.laundry_status!=="delivered"), credit=orders[0]?.customer_credit||0, out=orders.reduce((s,o)=>s+Number(o.outstanding),0);
    return `${titleBlock("My laundry",`Hello, ${esc(state.data.actor.display_name.split(" ")[0])}`,"Everything about your laundry in one place.",`<button class="btn primary" data-view="pickup">${icon("pickup","sm")}Request pickup</button>`)}
      <div class="grid metrics">${metric("Active",active.length,true)}${metric("Amount due",fmt(out))}${metric("Credit",fmt(credit))}${metric("Total orders",orders.length)}</div>
      <section class="section"><div class="section-head"><div><h2>In progress</h2></div></div>${active.length?`<div class="grid cards">${active.map(orderCard).join("")}</div>`:`<div class="empty">No active orders. Request a pickup whenever you are ready.</div>`}</section>`;
  }

  function orderCard(o){
    const pieces=o.items.reduce((sum,x)=>sum+Number(x.quantity),0);
    return `<article class="card order" data-order-card="${o.id}"><div class="order-head"><div><div class="order-no">${esc(o.order_no)}</div><div class="small muted">${esc(o.customer?.name||"")}${pieces?` · ${pieces} pcs`:""}</div></div><div class="money">${fmt(o.total)}</div></div>
      <div class="order-meta"><span class="stage active">${stageLabel(o.laundry_status)}</span><span class="badge ${o.payment_status}">${o.payment_status}</span></div>
      <div class="order-money"><div><span>Paid</span><b>${fmt(o.paid)}</b></div><div><span>Due</span><b>${fmt(o.outstanding)}</b></div>${o.customer_credit>0?`<div><span>Credit</span><b>${fmt(o.customer_credit)}</b></div>`:""}<div><span>Type</span><b>${o.channel==="counter"?"Counter":"Pickup"}</b></div></div>
      <button class="btn block" data-action="open-order" data-id="${o.id}">View order</button></article>`;
  }

  function ordersView(includeDelivered=true){
    let orders=state.data.orders||[];
    if(!includeDelivered) orders=orders.filter(o=>o.laundry_status!=="delivered");
    return `${titleBlock("All work","Orders",`${orders.length} visible to your account.`,state.data.actor.role==="manager"?`<button class="btn primary" data-action="counter-order">+ New</button>`:"")}
      <div class="tabs">${[["all","All"],...STAGES].map(([s,l])=>`<button class="tab ${s==="all"?'active':''}" data-filter-stage="${s}">${l}</button>`).join("")}</div>
      <div id="orderList" class="grid cards">${orders.length?orders.map(orderCard).join(""):`<div class="empty">No orders.</div>`}</div>`;
  }

  function newView(){
    return `${titleBlock("Create","What do you want to do?","Choose one action. The app handles the correct workflow.")}
      <div class="quick-actions"><button class="card quick-action" data-action="counter-order"><div class="quick-action-icon">${icon("orders")}</div><div><h2>Counter order</h2><p>Customer is at the shop with garments.</p></div></button>
      <button class="card quick-action" data-action="pickup-request"><div class="quick-action-icon">${icon("pickup")}</div><div><h2>Pickup request</h2><p>Log a WhatsApp or phone request.</p></div></button>
      <button class="card quick-action" data-action="new-customer"><div class="quick-action-icon">${icon("user")}</div><div><h2>Add customer</h2><p>Create a customer before their first order.</p></div></button></div>`;
  }

  function deliveryStops(){
    const pickups=state.data.orders.filter(o=>o.laundry_status==="pickup_requested" && o.pickup_driver_id===state.data.actor.id);
    const deliveries=state.data.orders.filter(o=>o.laundry_status==="out_for_delivery" && o.delivery_driver_id===state.data.actor.id);
    const other=state.data.orders.filter(o=>!["pickup_requested","out_for_delivery","delivered"].includes(o.laundry_status));
    return `${titleBlock("Assigned only","My stops","No customer list. No unassigned work.")}
      <div class="grid metrics">${metric("Pickups",pickups.length,true)}${metric("Deliveries",deliveries.length,true)}${metric("In laundry",other.length)}${metric("Total assigned",state.data.orders.filter(o=>o.laundry_status!=="delivered").length)}</div>
      <section class="section"><div class="kicker">Collect</div><h2>Pickup stops</h2>${pickups.length?`<div class="grid cards">${pickups.map(orderCard).join("")}</div>`:`<div class="empty">No pickup stops assigned.</div>`}</section>
      <section class="section"><div class="kicker">Hand over</div><h2>Delivery stops</h2>${deliveries.length?`<div class="grid cards">${deliveries.map(orderCard).join("")}</div>`:`<div class="empty">No deliveries assigned.</div>`}</section>`;
  }

  function historyView(){const done=state.data.orders.filter(o=>o.laundry_status==="delivered");return `${titleBlock("Completed","History",`${done.length} delivered orders assigned to you.`)}${done.length?`<div class="grid cards">${done.map(orderCard).join("")}</div>`:`<div class="empty">No completed deliveries yet.</div>`}`}
  function accountView(){const a=state.data.actor; return `${titleBlock("Account","${esc(a.display_name)}",roleName(a.role))}<div class="grid cards"><div class="card stack"><div><div class="kicker">Role</div><div class="strong">${roleName(a.role)}</div></div>${a.mobile?`<div><div class="kicker">Mobile</div><div class="strong">${esc(a.mobile)}</div></div>`:""}${a.customer_code?`<div><div class="kicker">Customer code</div><div class="mono strong">${esc(a.customer_code)}</div></div>`:""}</div><div class="card stack"><div><div class="kicker">Appearance</div><h3>Theme</h3><p class="small muted">Switch Graphite / Light and optionally adjust the accent.</p></div><button class="btn" data-action="theme">${icon("palette","sm")}Change theme</button><button class="btn danger" data-action="logout">Sign out</button></div></div>`}
  function customerPickup(){return `${titleBlock("Doorstep","Request pickup","One request. Staff will assign the driver.")}<form id="pickupSelfForm" class="card stack"><label>Pickup address<textarea name="address" required>${esc(state.data.actor.address||"")}</textarea></label><label>Note <textarea name="note" placeholder="Building, flat, preferred time..."></textarea></label><button class="btn primary block">REQUEST PICKUP →</button></form>`}

  function reportsView(){
    const s=state.data.summary;
    return `${titleBlock("Simple numbers","Reports","Operational and payment status stay separate.")}
      <div class="grid metrics">${metric("Active orders",s.active_orders,true)}${metric("Outstanding",fmt(s.outstanding))}${metric("Payments received",fmt(s.payments_received))}${metric("Customer credits",fmt(s.customer_credits))}</div>
      <section class="section"><h2>Stage queue</h2><div class="table-wrap"><table><thead><tr><th>Stage</th><th>Count</th></tr></thead><tbody>${STAGES.map(([k,l])=>`<tr><td>${l}</td><td class="strong">${s.stage_counts[k]||0}</td></tr>`).join("")}</tbody></table></div></section>
      <section class="section"><h2>Outstanding orders</h2><div class="grid cards">${state.data.orders.filter(o=>o.outstanding>0).slice(0,12).map(orderCard).join("")||`<div class="empty">No outstanding balances.</div>`}</div></section>`;
  }

  function adminView(){
    const d=state.data;
    return `${titleBlock("Control room","Admin","Organization, accounts, access, catalog, rates and discounts.")}
      <div class="tabs"><button class="tab active" data-admin-tab="business">Business</button><button class="tab" data-admin-tab="staff">Staff</button><button class="tab" data-admin-tab="customers">Customers</button><button class="tab" data-admin-tab="rates">Rates</button><button class="tab" data-admin-tab="catalog">Catalog</button><button class="tab" data-admin-tab="discounts">Discounts</button></div>
      <div id="adminPanel">${adminBusiness()}</div>`;
  }
  function adminBusiness(){const b=business();return `<div class="grid cards"><form id="businessForm" class="card stack"><div><div class="kicker">Organization</div><h2>Business identity</h2><p class="small muted">Used in the app header, receipts and printable labels.</p></div><label>Organization name<input class="input" name="name" value="${esc(b.name||'')}" required maxlength="120"></label><label>Address<textarea name="address" required placeholder="Building, street, area, Dubai, UAE">${esc(b.address||'')}</textarea></label><label>Phone <span class="muted">optional</span><input class="input" name="phone" value="${esc(b.phone||'')}" placeholder="+971..."></label><button class="btn primary">SAVE ORGANIZATION →</button></form><div class="card stack"><div><div class="kicker">Preview</div><h2>${esc(b.name||'Laundry Desk')}</h2><p class="sub">${esc(b.address||'Add the billing address')}</p>${b.phone?`<p class="small">${esc(b.phone)}</p>`:''}</div><div class="business-preview-mark">${esc((b.name||'L').trim().charAt(0).toUpperCase())}</div><p class="small muted">Changes are shared across all staff and customers after their next refresh.</p></div></div>`}
  function adminStaff(){return `<div class="row between"><h2>Staff</h2><button class="btn primary" data-action="new-staff">+ Staff</button></div><div class="list">${state.data.staff.map(s=>`<div class="list-row"><div class="row between"><div><b>${esc(s.display_name)}</b><div class="small mono muted">${esc(s.login_id)} · ${s.role}</div></div><span class="badge ${s.active?'paid':'unpaid'}">${s.active?'active':'disabled'}</span></div><button class="btn smallbtn" data-action="edit-staff" data-id="${s.id}">Edit</button></div>`).join("")}</div>`}
  function adminCustomers(){return `<div class="row between"><h2>Customers</h2><button class="btn primary" data-action="new-customer">+ Customer</button></div><div class="list">${state.data.customers.map(c=>`<div class="list-row"><div class="row between"><div><b>${esc(c.name)}</b><div class="small mono muted">${esc(c.customer_code)} · ${esc(c.mobile)}</div></div><span class="badge ${c.access_enabled?'paid':'unpaid'}">${c.access_enabled?'access on':'access off'}</span></div><div class="row"><button class="btn smallbtn" data-action="toggle-customer" data-id="${c.id}" data-enabled="${c.access_enabled}">${c.access_enabled?'Disable':'Enable'} access</button><button class="btn smallbtn" data-action="reset-customer" data-id="${c.id}">Reset 6-digit code</button></div></div>`).join("")}</div>`}
  function adminRates(){const g=new Map(state.data.refs.garments.map(x=>[x.id,x.name])),s=new Map(state.data.refs.services.map(x=>[x.id,x.name]));return `<div class="row between"><h2>Rates</h2><button class="btn primary" data-action="new-rate">+ Rate</button></div><div class="table-wrap"><table><thead><tr><th>Garment</th><th>Service</th><th>AED</th><th>From</th></tr></thead><tbody>${state.data.refs.rates.filter(r=>r.active).map(r=>`<tr><td>${esc(g.get(r.garment_type_id)||"")}</td><td>${esc(s.get(r.service_id)||"")}</td><td class="money">${Number(r.unit_price).toFixed(2)}</td><td>${r.effective_from}</td></tr>`).join("")}</tbody></table></div>`}
  function adminCatalog(){return `<div class="grid cards"><div class="card"><div class="row between"><h2>Garments</h2><button class="btn smallbtn primary" data-action="new-garment">+ Add</button></div><div class="list">${state.data.refs.garments.map(g=>`<div class="list-row"><div class="row between"><div><b>${esc(g.name)}</b><div class="small mono muted">${esc(g.code)}</div></div><span class="badge ${g.active?'paid':'unpaid'}">${g.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-garment" data-id="${g.id}">Edit</button></div>`).join("")}</div></div><div class="card"><div class="row between"><h2>Services</h2><button class="btn smallbtn primary" data-action="new-service">+ Add</button></div><div class="list">${state.data.refs.services.map(s=>`<div class="list-row"><div class="row between"><div><b>${esc(s.name)}</b><div class="small mono muted">${esc(s.workflow)}</div></div><span class="badge ${s.active?'paid':'unpaid'}">${s.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-service" data-id="${s.id}">Edit</button></div>`).join("")}</div></div></div>`}
  function adminDiscounts(){return `<div class="row between"><h2>Discounts</h2><button class="btn primary" data-action="new-discount">+ Discount</button></div><div class="list">${state.data.refs.discounts.map(d=>`<div class="list-row"><div class="row between"><div><b>${esc(d.name)}</b><div class="small muted">${d.discount_type==='percent'?d.value+'%':fmt(d.value)}</div></div><span class="badge ${d.active?'paid':'unpaid'}">${d.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-discount" data-id="${d.id}">Edit</button></div>`).join("")}</div>`}

  function stageBar(order){
    const visible=order.items.length && order.items.every(i=>i.service?.workflow==="iron_only") ? STAGES.filter(([s])=>s!=="washing") : STAGES;
    const idx=visible.findIndex(([s])=>s===order.laundry_status);
    return `<div class="stagebar">${visible.map(([s,l],i)=>`<span class="stage ${i<idx?'done':i===idx?'active':''}">${l}</span>`).join("")}</div>`;
  }

  function openOrder(orderId){
    const o=state.data.orders.find(x=>x.id===orderId); if(!o)return;
    const role=state.data.actor.role;
    const driverOptions=state.data.staff?.filter(s=>s.role==="delivery"&&s.active)||[];
    let actions="";
    if(role==="delivery" && o.laundry_status==="pickup_requested" && o.pickup_driver_id===state.data.actor.id) actions+=`<button class="btn primary block" data-action="collect" data-id="${o.id}">COLLECT GARMENTS →</button>`;
    if(role==="delivery" && o.laundry_status==="out_for_delivery" && o.delivery_driver_id===state.data.actor.id) actions+=`<button class="btn primary block" data-action="deliver" data-id="${o.id}">DELIVER / TAKE PAYMENT →</button>`;
    if(["admin","manager"].includes(role)){
      if(o.next_statuses?.[0]) actions+=`<button class="btn primary" data-action="advance" data-id="${o.id}" data-status="${o.next_statuses[0]}">${stageLabel(o.next_statuses[0]).toUpperCase()} →</button>`;
      actions+=`<button class="btn" data-action="payment" data-id="${o.id}">Record payment</button>`;
      if(o.customer_credit>0 && o.outstanding>0) actions+=`<button class="btn" data-action="credit" data-id="${o.id}">Apply ${fmt(o.customer_credit)} credit</button>`;
      if(o.channel==="pickup") actions+=`<button class="btn" data-action="assign" data-id="${o.id}" data-kind="${o.laundry_status==='ready'||o.laundry_status==='out_for_delivery'?'delivery':'pickup'}">Assign driver</button>`;
    }
    actions+=`<button class="btn" data-action="print-receipt" data-id="${o.id}">Receipt / PDF</button>`;
    if(o.pieces.length) actions+=`<button class="btn" data-action="print-labels" data-id="${o.id}">Bag + garment tags</button>`;
    if(o.customer?.mobile) actions+=`<button class="btn" data-action="whatsapp" data-id="${o.id}">WhatsApp</button>`;
    state.modal=`<div class="modal-backdrop"><section class="modal"><div class="modal-head"><div><div class="kicker">${o.channel} order</div><h2 class="mono">${esc(o.order_no)}</h2></div><button class="x" data-action="close-modal">×</button></div>
      ${stageBar(o)}
      <div class="grid metrics" style="margin-top:12px">${metric("Total",fmt(o.total),true)}${metric("Paid",fmt(o.paid))}${metric("Due",fmt(o.outstanding))}${metric("Credit",fmt(o.customer_credit))}</div>
      <div class="section card"><div class="row between"><div><div class="kicker">Customer</div><h3>${esc(o.customer?.name||"")}</h3><div class="small">${esc(o.customer?.customer_code||"")} · ${esc(o.customer?.mobile||"")}</div></div><span class="badge ${o.payment_status}">${o.payment_status}</span></div></div>
      <div class="section"><div class="kicker">Pieces</div><div class="list">${o.items.length?o.items.map(i=>`<div class="list-row"><div class="row between"><span>${i.quantity} × ${esc(i.garment?.name||"")} <span class="muted">/ ${esc(i.service?.name||"")}</span></span><b>${fmt(i.line_total)}</b></div></div>`).join(""):`<div class="empty">Garments will be captured at pickup.</div>`}</div></div>
      ${o.payments.length?`<div class="section"><div class="kicker">Payments</div><div class="list">${o.payments.map(p=>`<div class="list-row"><div class="row between"><span>${esc(p.method)} · ${esc(p.payment_context)}</span><b>${fmt(p.received_amount)}</b></div><div class="small muted">Applied to order: ${fmt(p.amount)}</div></div>`).join("")}</div></div>`:""}
      <div class="section stack">${actions}</div>
      ${driverOptions.length?`<div class="small muted" style="margin-top:12px">Driver assignment is available only to Manager/Admin.</div>`:""}
    </section></div>`;
    renderApp();
  }

  function itemPicker(serviceId, quantities={}){
    const gs=state.data.refs.garments.filter(g=>g.active);
    const rateFor=gid=>state.data.refs.rates.find(r=>r.active&&r.garment_type_id===gid&&r.service_id===serviceId);
    return `<div class="qty-grid">${gs.map(g=>{const q=Number(quantities[g.id]||0),r=rateFor(g.id);return `<div class="qty-row"><div><b>${esc(g.name)}</b><div class="small muted">${r?fmt(r.unit_price):'No rate'}</div></div><div class="stepper"><button type="button" data-qty="${g.id}" data-delta="-1">−</button><span data-qty-value="${g.id}">${q}</span><button type="button" data-qty="${g.id}" data-delta="1">+</button></div></div>`}).join("")}</div>`;
  }
  function selectedItems(serviceId){return Object.entries(state.qty).filter(([,q])=>q>0).map(([garment_type_id,quantity])=>({garment_type_id,service_id:serviceId,quantity}))}

  function openCounter(){
    state.qty={}; state.serviceId=state.data.refs.services.find(s=>s.code==="wash_iron"&&s.active)?.id || state.data.refs.services.find(s=>s.active)?.id;
    state.modal=`<div class="modal-backdrop"><form class="modal" id="counterForm"><div class="modal-head"><div><div class="kicker">At the shop</div><h2>New counter order</h2></div><button type="button" class="x" data-action="close-modal">×</button></div>
      <div class="form-grid two"><label>Customer<select name="customer_id" required><option value="">Choose customer</option>${state.data.customers.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.customer_code)}</option>`).join("")}</select></label><label>Service<select id="itemService" name="service_id">${state.data.refs.services.filter(s=>s.active).map(s=>`<option value="${s.id}" ${s.id===state.serviceId?'selected':''}>${esc(s.name)}</option>`).join("")}</select></label></div>
      <div class="section"><label>Discount <span class="muted">optional</span><select name="discount_id"><option value="">No discount</option>${state.data.refs.discounts.filter(d=>d.active&&Number(d.value)>0).map(d=>`<option value="${d.id}">${esc(d.name)} · ${d.discount_type==='percent'?d.value+'%':fmt(d.value)}</option>`).join("")}</select></label></div>
      <div class="section"><div class="kicker">Tap quantities</div><div id="itemPicker">${itemPicker(state.serviceId)}</div></div>
      <div class="section form-grid two"><label>Payment now (optional)<input class="input" name="payment_amount" type="number" min="0" step="0.01" placeholder="0.00"></label><label>Method<select name="payment_method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label></div>
      <div class="section"><button class="btn primary block">CREATE ORDER →</button></div></form></div>`; renderApp();
  }

  function openPickupRequest(){
    const drivers=state.data.staff.filter(s=>s.role==="delivery"&&s.active);
    state.modal=`<div class="modal-backdrop"><form class="modal" id="pickupStaffForm"><div class="modal-head"><div><div class="kicker">WhatsApp / phone</div><h2>Pickup request</h2></div><button type="button" class="x" data-action="close-modal">×</button></div><div class="stack"><label>Customer<select name="customer_id" required><option value="">Choose customer</option>${state.data.customers.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.customer_code)}</option>`).join("")}</select></label><label>Assign pickup<select name="pickup_driver_id"><option value="">Assign later</option>${drivers.map(d=>`<option value="${d.id}">${esc(d.display_name)}</option>`).join("")}</select></label><label>Address / note<textarea name="note" placeholder="Preferred time, building, WhatsApp note..."></textarea></label><button class="btn primary block">SAVE REQUEST →</button></div></form></div>`;renderApp();
  }

  function openCollect(orderId){
    const o=state.data.orders.find(x=>x.id===orderId); state.qty={}; state.serviceId=state.data.refs.services.find(s=>s.code==="wash_iron"&&s.active)?.id;
    state.modal=`<div class="modal-backdrop"><form class="modal" id="collectForm" data-order="${o.id}"><div class="modal-head"><div><div class="kicker">Doorstep pickup</div><h2>${esc(o.customer.name)}</h2><div class="mono small">${o.order_no}</div></div><button type="button" class="x" data-action="close-modal">×</button></div><label>Service<select id="itemService"><option value="${state.data.refs.services.find(s=>s.code==='wash_iron').id}">Wash + Iron</option><option value="${state.data.refs.services.find(s=>s.code==='iron_only').id}">Iron Only</option></select></label><div class="section"><div class="kicker">Tap garments</div><div id="itemPicker">${itemPicker(state.serviceId)}</div></div><div class="section form-grid two"><label>Payment now (optional)<input class="input" name="payment_amount" type="number" min="0" step="0.01"></label><label>Method<select name="payment_method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label></div><div class="section"><button class="btn primary block">SAVE + COLLECT →</button></div></form></div>`;renderApp();
  }

  function openDeliver(orderId){const o=state.data.orders.find(x=>x.id===orderId);state.modal=`<div class="modal-backdrop"><form class="modal" id="deliverForm" data-order="${o.id}"><div class="modal-head"><div><div class="kicker">Handover</div><h2>${esc(o.customer.name)}</h2><div class="mono small">${o.order_no}</div></div><button type="button" class="x" data-action="close-modal">×</button></div><div class="grid metrics">${metric("Due",fmt(o.outstanding),true)}${metric("Credit",fmt(o.customer_credit))}</div><div class="section form-grid two"><label>Payment received<input class="input" name="payment_amount" type="number" min="0" step="0.01" value="${o.outstanding||''}"></label><label>Method<select name="payment_method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label></div><p class="small muted">Leave payment blank/0 if already settled. Delivery status and payment status are separate.</p><button class="btn primary block">CONFIRM HANDOVER →</button></form></div>`;renderApp()}

  function simpleModal(title,body,formId){state.modal=`<div class="modal-backdrop"><form class="modal" id="${formId}"><div class="modal-head"><h2>${title}</h2><button type="button" class="x" data-action="close-modal">×</button></div>${body}</form></div>`;renderApp()}
  function openPayment(o){simpleModal("Record payment",`<div class="grid metrics">${metric("Due",fmt(o.outstanding),true)}${metric("Credit",fmt(o.customer_credit))}</div><div class="section stack"><input type="hidden" name="order_id" value="${o.id}"><label>Amount received<input class="input" name="amount" type="number" min="0.01" step="0.01" value="${o.outstanding||''}" required></label><label>Method<select name="method"><option>cash</option><option>card</option><option>bank</option><option>other</option></select></label><label>Where<select name="context"><option value="shop">At shop</option><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label><button class="btn primary block">SAVE PAYMENT →</button></div>`,"paymentForm")}
  function openAssign(o,kind){const ds=state.data.staff.filter(s=>s.role==="delivery"&&s.active);simpleModal(`Assign ${kind}`,`<div class="stack"><input type="hidden" name="order_id" value="${o.id}"><input type="hidden" name="kind" value="${kind}"><label>Delivery user<select name="driver_id" required>${ds.map(d=>`<option value="${d.id}">${esc(d.display_name)}</option>`).join("")}</select></label><button class="btn primary block">ASSIGN →</button></div>`,"assignForm")}
  function openCustomer(){simpleModal("Add customer",`<div class="stack"><label>Name<input class="input" name="name" required></label><label>UAE mobile<input class="input" name="mobile" placeholder="+9715..." required></label><label>Address<textarea name="address"></textarea></label><label>Six-digit code <span class="muted">optional — generated if blank</span><input class="input" name="pin" inputmode="numeric" maxlength="6"></label><button class="btn primary block">CREATE CUSTOMER →</button></div>`,"customerForm")}
  function openStaff(staff=null){simpleModal(staff?"Edit staff":"Add staff",`<div class="stack"><input type="hidden" name="id" value="${staff?.id||''}"><label>Name<input class="input" name="display_name" value="${esc(staff?.display_name||'')}" required></label><label>Login ID<input class="input" name="login_id" value="${esc(staff?.login_id||'')}" required></label><label>Role<select name="role">${["admin","manager","delivery"].map(r=>`<option ${staff?.role===r?'selected':''}>${r}</option>`).join("")}</select></label><label>Phone<input class="input" name="phone" value="${esc(staff?.phone||'')}"></label><label>New six-digit code <span class="muted">${staff?'leave blank to keep':'generated if blank'}</span><input class="input" name="pin" inputmode="numeric" maxlength="6"></label><label class="row"><input name="active" type="checkbox" ${staff?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE STAFF →</button></div>`,"staffForm")}
  function openRate(){simpleModal("Add / change rate",`<div class="stack"><label>Garment<select name="garment_type_id">${state.data.refs.garments.filter(x=>x.active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label><label>Service<select name="service_id">${state.data.refs.services.filter(x=>x.active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label><label>Price AED<input class="input" name="unit_price" type="number" min="0" step="0.01" required></label><label>Effective from<input class="input" name="effective_from" type="date" value="${new Date().toISOString().slice(0,10)}"></label><button class="btn primary block">SAVE RATE →</button></div>`,"rateForm")}
  function openCatalog(kind,item=null){const isG=kind==="garment";simpleModal(`${item?'Edit':'Add'} ${kind}`,`<div class="stack"><input type="hidden" name="id" value="${item?.id||''}"><label>Name<input class="input" name="name" value="${esc(item?.name||'')}" required></label><label>Code<input class="input mono" name="code" value="${esc(item?.code||'')}" required></label>${isG?'':`<label>Workflow<select name="workflow"><option value="wash_iron" ${item?.workflow==='wash_iron'?'selected':''}>Wash + Iron</option><option value="iron_only" ${item?.workflow==='iron_only'?'selected':''}>Iron Only</option></select></label>`}<label class="row"><input name="active" type="checkbox" ${item?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE →</button></div>`,isG?"garmentForm":"serviceForm")}
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
    bind("counterForm",e=>{e.preventDefault();const f=new FormData(e.target),items=selectedItems(id("itemService").value);if(!items.length)return toast("Add at least one garment",true);doAction({action:"create_counter_order",customer_id:f.get("customer_id"),discount_id:f.get("discount_id")||null,items,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method")},"Counter order created",e.submitter)});
    bind("collectForm",e=>{e.preventDefault();const f=new FormData(e.target),items=selectedItems(id("itemService").value);if(!items.length)return toast("Add at least one garment",true);doAction({action:"collect_pickup",order_id:e.target.dataset.order,items,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method")},"Pickup collected",e.submitter)});
    bind("deliverForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"deliver_order",order_id:e.target.dataset.order,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method")},"Delivered",e.submitter)});
    bind("paymentForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"record_payment",order_id:f.get("order_id"),amount:f.get("amount"),method:f.get("method"),context:f.get("context")},"Payment recorded",e.submitter)});
    bind("assignForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"assign_driver",order_id:f.get("order_id"),kind:f.get("kind"),driver_id:f.get("driver_id")},"Driver assigned",e.submitter)});
    bind("customerForm",async e=>{e.preventDefault();const f=new FormData(e.target);try{setBusy(true,e.submitter,"Saving customer…");const r=await api("/action",{method:"POST",body:{action:"save_customer",name:f.get("name"),mobile:f.get("mobile"),address:f.get("address"),pin:f.get("pin")||null}});state.modal=null;await refresh();if(r.temporary_pin)alert(`Customer created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the customer.`);else toast("Customer saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("staffForm",async e=>{e.preventDefault();const f=new FormData(e.target),isNew=!f.get("id");try{setBusy(true,e.submitter,"Saving staff…");const r=await api("/action",{method:"POST",body:{action:"save_staff",id:f.get("id")||null,display_name:f.get("display_name"),login_id:f.get("login_id"),role:f.get("role"),phone:f.get("phone"),pin:f.get("pin")||null,active:f.get("active")==="on"}});state.modal=null;await refresh();if(isNew&&r.temporary_pin)alert(`Staff created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the staff member.`);else toast("Staff saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("rateForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_rate",garment_type_id:f.get("garment_type_id"),service_id:f.get("service_id"),unit_price:f.get("unit_price"),effective_from:f.get("effective_from")},"Rate saved",e.submitter)});
    bind("garmentForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_garment",id:f.get("id")||null,name:f.get("name"),code:f.get("code"),active:f.get("active")==="on"},"Garment saved",e.submitter)});
    bind("serviceForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_service",id:f.get("id")||null,name:f.get("name"),code:f.get("code"),workflow:f.get("workflow"),active:f.get("active")==="on"},"Service saved",e.submitter)});
    bind("discountForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_discount",id:f.get("id")||null,name:f.get("name"),discount_type:f.get("discount_type"),value:f.get("value"),active:f.get("active")==="on"},"Discount saved",e.submitter)});
    bind("businessForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_business_settings",name:f.get("name"),address:f.get("address"),phone:f.get("phone")},"Organization updated",e.submitter,"Saving organization…")});
    bind("themeForm",e=>{e.preventDefault();const color=id("themeHex")?.value||id("themeColor")?.value; if(!/^#[0-9a-f]{6}$/i.test(color||""))return toast("Enter a valid color such as #64748B",true);applyTheme(color,true);applyMode(state.mode,true);state.modal=null;renderApp();toast("Theme updated")});
    const themeColor=id("themeColor"), themeHex=id("themeHex"); if(themeColor&&themeHex){themeColor.addEventListener("input",()=>themeHex.value=themeColor.value);themeHex.addEventListener("input",()=>{if(/^#[0-9a-f]{6}$/i.test(themeHex.value))themeColor.value=themeHex.value})}
    const service=id("itemService"); if(service) service.addEventListener("change",()=>{state.serviceId=service.value; id("itemPicker").innerHTML=itemPicker(state.serviceId,state.qty)});
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
    const v=e.target.closest("[data-view]")?.dataset.view;if(v){state.view=v;renderApp();return}
    const q=e.target.closest("[data-qty]");if(q){const gid=q.dataset.qty,delta=Number(q.dataset.delta);state.qty[gid]=Math.max(0,Number(state.qty[gid]||0)+delta);const el=document.querySelector(`[data-qty-value="${gid}"]`);if(el)el.textContent=state.qty[gid];return}
    const tab=e.target.closest("[data-admin-tab]"); if(tab){document.querySelectorAll("[data-admin-tab]").forEach(x=>x.classList.toggle("active",x===tab));const panel=id("adminPanel");panel.innerHTML=tab.dataset.adminTab==="business"?adminBusiness():tab.dataset.adminTab==="staff"?adminStaff():tab.dataset.adminTab==="customers"?adminCustomers():tab.dataset.adminTab==="rates"?adminRates():tab.dataset.adminTab==="catalog"?adminCatalog():adminDiscounts();bindDynamicForms();return}
    const stageFilter=e.target.closest("[data-filter-stage]");if(stageFilter){document.querySelectorAll("[data-filter-stage]").forEach(x=>x.classList.toggle("active",x===stageFilter));let os=state.data.orders;if(stageFilter.dataset.filterStage!=="all")os=os.filter(o=>o.laundry_status===stageFilter.dataset.filterStage);id("orderList").innerHTML=os.length?os.map(orderCard).join(""):`<div class="empty">No orders in this stage.</div>`;return}
    const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
    if(a==="logout")return logout(true,b); if(a==="toggle-theme"){applyMode(state.mode==="graphite"?"light":"graphite",true);renderApp();return} if(a==="theme")return openTheme(); if(a==="close-modal")return closeModal();
    if(a==="open-order")return openOrder(b.dataset.id); if(a==="counter-order")return openCounter(); if(a==="pickup-request")return openPickupRequest(); if(a==="new-customer")return openCustomer();
    if(a==="collect")return openCollect(b.dataset.id); if(a==="deliver")return openDeliver(b.dataset.id);
    if(a==="payment")return openPayment(state.data.orders.find(o=>o.id===b.dataset.id)); if(a==="assign")return openAssign(state.data.orders.find(o=>o.id===b.dataset.id),b.dataset.kind);
    if(a==="advance")return doAction({action:"advance_order",order_id:b.dataset.id,target_status:b.dataset.status},`Moved to ${stageLabel(b.dataset.status)}`,b,"Updating stage…");
    if(a==="credit")return doAction({action:"apply_credit",order_id:b.dataset.id},"Customer credit applied",b,"Applying credit…");
    if(a==="print-receipt")return printDoc(state.data.orders.find(o=>o.id===b.dataset.id),"receipt",b); if(a==="print-labels")return printDoc(state.data.orders.find(o=>o.id===b.dataset.id),"labels",b); if(a==="whatsapp")return whatsapp(state.data.orders.find(o=>o.id===b.dataset.id));
    if(a==="new-staff")return openStaff(); if(a==="edit-staff")return openStaff(state.data.staff.find(s=>s.id===b.dataset.id)); if(a==="new-rate")return openRate(); if(a==="new-garment")return openCatalog("garment"); if(a==="edit-garment")return openCatalog("garment",state.data.refs.garments.find(x=>x.id===b.dataset.id)); if(a==="new-service")return openCatalog("service"); if(a==="edit-service")return openCatalog("service",state.data.refs.services.find(x=>x.id===b.dataset.id)); if(a==="new-discount")return openDiscount(); if(a==="edit-discount")return openDiscount(state.data.refs.discounts.find(x=>x.id===b.dataset.id));
    if(a==="toggle-customer")return doAction({action:"set_customer_access",customer_id:b.dataset.id,enabled:b.dataset.enabled!=="true"},"Customer access updated",b,"Updating access…");
    if(a==="reset-customer"){if(!confirm("Reset this customer's six-digit login code?"))return;try{setBusy(true,b,"Resetting code…");const r=await api("/action",{method:"POST",body:{action:"reset_customer_pin",customer_id:b.dataset.id}});await refresh();alert(`New customer code: ${r.pin}\nShare it privately with the customer.`)}catch(err){toast(err.message,true)}finally{setBusy(false)}return}
  });

  window.addEventListener("online",()=>{if(state.token)refresh()});
  if(state.token) refresh(true); else renderLogin();
})();
