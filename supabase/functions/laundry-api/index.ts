import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: CORS });
const fail = (message, status = 400, extra = {}) => json({ ok: false, error: message, ...extra }, status);
const money = (n) => Number(Number(n || 0).toFixed(2));
const uniq = (xs) => [...new Set(xs.filter(Boolean))];
const pin6 = () => String(Math.floor(100000 + Math.random() * 900000));

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(req) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
}

function routePath(req) {
  const p = new URL(req.url).pathname;
  const i = p.indexOf("/laundry-api");
  if (i < 0) return p;
  return p.slice(i + "/laundry-api".length) || "/";
}

async function audit(actor, action, entityType, entityId = null, details = null) {
  await db.from("laundry_audit_log").insert({
    actor_type: actor?.actor_type || "system",
    actor_id: actor?.id || null,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    details,
  });
}

async function authenticateRequest(req) {
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: "Sign in required", status: 401 };

  const tokenHash = await sha256(token);
  const { data: session, error } = await db
    .from("laundry_sessions")
    .select("*")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !session) return { error: "Session expired. Sign in again.", status: 401 };

  let actor;
  if (session.actor_type === "staff") {
    const { data } = await db
      .from("laundry_staff")
      .select("id,login_id,display_name,role,phone,active")
      .eq("id", session.staff_id)
      .maybeSingle();
    if (!data || !data.active) return { error: "Account disabled", status: 403 };
    actor = { ...data, actor_type: "staff" };
  } else {
    const { data } = await db
      .from("laundry_customers")
      .select("id,customer_code,name,mobile,address,access_enabled")
      .eq("id", session.customer_id)
      .maybeSingle();
    if (!data || !data.access_enabled) return { error: "Customer access disabled", status: 403 };
    actor = { ...data, role: "customer", display_name: data.name, actor_type: "customer" };
  }

  await db.from("laundry_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", session.id);
  return { actor, session, token };
}

function requireRole(actor, roles) {
  if (actor.actor_type !== "staff" || !roles.includes(actor.role)) {
    throw new Error("PERMISSION:You do not have permission for this action");
  }
}

async function getReferences() {
  const [garments, services, rates, discounts, settings] = await Promise.all([
    db.from("laundry_garment_types").select("id,code,name,active,sort_order").order("sort_order"),
    db.from("laundry_services").select("id,code,name,workflow,active,sort_order").order("sort_order"),
    db.from("laundry_rates").select("id,garment_type_id,service_id,unit_price,active,effective_from,effective_to").order("effective_from", { ascending: false }),
    db.from("laundry_discounts").select("id,name,discount_type,value,active").order("name"),
    db.from("laundry_settings").select("key,value"),
  ]);
  for (const r of [garments, services, rates, discounts, settings]) if (r.error) throw r.error;
  return {
    garments: garments.data || [],
    services: services.data || [],
    rates: rates.data || [],
    discounts: discounts.data || [],
    settings: Object.fromEntries((settings.data || []).map((x) => [x.key, x.value])),
  };
}

async function fetchOrders(actor, refs) {
  let q = db.from("laundry_orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (actor.actor_type === "customer") q = q.eq("customer_id", actor.id);
  if (actor.actor_type === "staff" && actor.role === "delivery") {
    q = q.or(`pickup_driver_id.eq.${actor.id},delivery_driver_id.eq.${actor.id}`);
  }
  const { data: orders, error } = await q;
  if (error) throw error;
  if (!orders?.length) return [];

  const orderIds = orders.map((o) => o.id);
  const customerIds = uniq(orders.map((o) => o.customer_id));
  const [customersR, itemsR, piecesR, paymentsR, creditsR] = await Promise.all([
    db.from("laundry_customers").select("id,customer_code,name,mobile,address,access_enabled").in("id", customerIds),
    db.from("laundry_order_items").select("*").in("order_id", orderIds).order("created_at"),
    db.from("laundry_order_pieces").select("id,order_id,order_item_id,piece_no,tag_code").in("order_id", orderIds).order("piece_no"),
    db.from("laundry_payments").select("*").in("order_id", orderIds).order("created_at"),
    db.from("laundry_credit_ledger").select("*").in("customer_id", customerIds).order("created_at"),
  ]);
  for (const r of [customersR, itemsR, piecesR, paymentsR, creditsR]) if (r.error) throw r.error;

  const customerMap = new Map((customersR.data || []).map((x) => [x.id, x]));
  const garmentMap = new Map(refs.garments.map((x) => [x.id, x]));
  const serviceMap = new Map(refs.services.map((x) => [x.id, x]));
  const creditByCustomer = {};
  for (const c of creditsR.data || []) creditByCustomer[c.customer_id] = money((creditByCustomer[c.customer_id] || 0) + Number(c.amount));

  return orders.map((o) => {
    const items = (itemsR.data || []).filter((x) => x.order_id === o.id).map((x) => ({
      ...x,
      garment: garmentMap.get(x.garment_type_id) || null,
      service: serviceMap.get(x.service_id) || null,
    }));
    const pieces = (piecesR.data || []).filter((x) => x.order_id === o.id);
    const payments = (paymentsR.data || []).filter((x) => x.order_id === o.id);
    const paid = money(payments.reduce((s, p) => s + Number(p.amount), 0));
    const received = money(payments.reduce((s, p) => s + Number(p.received_amount), 0));
    const outstanding = money(Math.max(0, Number(o.total) - paid));
    const payment_status = Number(o.total) === 0 ? "unpriced" : paid <= 0 ? "unpaid" : outstanding <= 0 ? "paid" : "partial";
    return {
      ...o,
      customer: customerMap.get(o.customer_id) || null,
      items,
      pieces,
      payments,
      paid,
      received,
      outstanding,
      payment_status,
      customer_credit: money(creditByCustomer[o.customer_id] || 0),
    };
  });
}

function allowedNext(order) {
  const ironOnly = order.items?.length > 0 && order.items.every((x) => x.service?.workflow === "iron_only");
  const map = {
    pickup_requested: ["collected"],
    collected: ["received"],
    received: [ironOnly ? "ironing" : "washing"],
    washing: ["ironing"],
    ironing: ["ready"],
    ready: [order.channel === "counter" ? "delivered" : "out_for_delivery"],
    out_for_delivery: ["delivered"],
    delivered: [],
  };
  return map[order.laundry_status] || [];
}

async function buildBootstrap(actor) {
  const refs = await getReferences();
  const orders = await fetchOrders(actor, refs);
  let customers = [];
  let staff = [];

  if (actor.actor_type === "staff" && ["admin", "manager"].includes(actor.role)) {
    const { data, error } = await db.from("laundry_customers").select("id,customer_code,name,mobile,address,access_enabled,created_at").order("name");
    if (error) throw error;
    customers = data || [];
  }
  if (actor.actor_type === "staff" && ["admin", "manager"].includes(actor.role)) {
    const { data, error } = await db.from("laundry_staff").select("id,login_id,display_name,role,phone,active,created_at").order("display_name");
    if (error) throw error;
    staff = actor.role === "admin" ? (data || []) : (data || []).filter((x) => x.role === "delivery" && x.active);
  }

  const stage_counts = {};
  let outstanding = 0;
  let payments_received = 0;
  const customerCredits = {};
  for (const o of orders) {
    stage_counts[o.laundry_status] = (stage_counts[o.laundry_status] || 0) + 1;
    outstanding += Number(o.outstanding);
    payments_received += Number(o.received);
    customerCredits[o.customer_id] = o.customer_credit;
    o.next_statuses = allowedNext(o);
  }

  return {
    ok: true,
    actor,
    refs,
    orders,
    customers,
    staff,
    summary: {
      stage_counts,
      outstanding: money(outstanding),
      payments_received: money(payments_received),
      customer_credits: money(Object.values(customerCredits).reduce((s, n) => s + Number(n), 0)),
      active_orders: orders.filter((o) => o.laundry_status !== "delivered").length,
    },
  };
}

async function orderForAction(orderId) {
  const refs = await getReferences();
  const { data: raw, error } = await db.from("laundry_orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !raw) throw new Error("Order not found");
  const fakeActor = { actor_type: "staff", role: "admin", id: "00000000-0000-0000-0000-000000000000" };
  const all = await fetchOrders(fakeActor, refs);
  return all.find((x) => x.id === orderId) || raw;
}

async function addEvent(orderId, fromStatus, toStatus, actor, note = null) {
  const { error } = await db.from("laundry_order_events").insert({
    order_id: orderId,
    from_status: fromStatus,
    to_status: toStatus,
    actor_type: actor.actor_type,
    actor_id: actor.id,
    note,
  });
  if (error) throw error;
}

async function setStatus(order, target, actor, note = null) {
  const valid = allowedNext(order);
  if (!valid.includes(target)) throw new Error(`Invalid stage change from ${order.laundry_status} to ${target}`);
  if (target === "out_for_delivery" && !order.delivery_driver_id) throw new Error("Assign a delivery driver first");

  const patch = { laundry_status: target };
  if (target === "delivered") patch.delivered_at = new Date().toISOString();
  const { error } = await db.from("laundry_orders").update(patch).eq("id", order.id);
  if (error) throw error;
  await addEvent(order.id, order.laundry_status, target, actor, note);
  await audit(actor, "status_changed", "order", order.id, { from: order.laundry_status, to: target });
}

async function recordPayment(orderId, actor, payload) {
  const amount = Number(payload.amount || 0);
  if (!(amount > 0)) throw new Error("Enter a payment amount greater than zero");
  const staffId = actor.actor_type === "staff" ? actor.id : null;
  if (!staffId) throw new Error("Only staff can record payments");
  const { data, error } = await db.rpc("laundry_record_payment_tx", {
    p_order_id: orderId,
    p_collected_by: staffId,
    p_received_amount: amount,
    p_method: payload.method || "cash",
    p_context: payload.context || "shop",
    p_note: payload.note || null,
  });
  if (error) throw error;
  await audit(actor, "payment_recorded", "order", orderId, data?.[0] || null);
  return data?.[0] || null;
}


function quickStage(status) {
  if (["washing", "ironing"].includes(status)) return "in_progress";
  if (["ready", "out_for_delivery"].includes(status)) return "ready";
  return status;
}

function dubaiDayKey(value) {
  const d = new Date(value);
  const shifted = new Date(d.getTime() + 4 * 3600 * 1000);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function bucketKey(value, group = "day") {
  const d = new Date(value);
  const shifted = new Date(d.getTime() + 4 * 3600 * 1000);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  if (group === "year") return String(y);
  if (group === "month") return `${y}-${String(m + 1).padStart(2, "0")}`;
  if (group === "week") {
    const wd = shifted.getUTCDay() || 7;
    const monday = new Date(Date.UTC(y, m, day - wd + 1));
    return `${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, "0")}-${String(monday.getUTCDate()).padStart(2, "0")}`;
  }
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseRangeDate(value, end = false) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T${end ? "23:59:59.999" : "00:00:00"}+04:00`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function fetchPaged(table, select, configure = (q) => q) {
  const out = [];
  const pageSize = 1000;
  for (let from = 0; from < 50000; from += pageSize) {
    let q = db.from(table).select(select);
    q = configure(q);
    q = q.range(from, from + pageSize - 1);
    const { data, error } = await q;
    if (error) throw error;
    const rows = data || [];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}

async function fetchCustomersByIds(ids) {
  const unique = uniq(ids);
  const out = [];
  for (let i = 0; i < unique.length; i += 100) {
    const part = unique.slice(i, i + 100);
    if (!part.length) continue;
    const { data, error } = await db.from("laundry_customers").select("id,customer_code,name,mobile").in("id", part);
    if (error) throw error;
    out.push(...(data || []));
  }
  return out;
}

async function fetchItemsByOrderIds(ids) {
  const unique = uniq(ids);
  const out = [];
  for (let i = 0; i < unique.length; i += 100) {
    const part = unique.slice(i, i + 100);
    if (!part.length) continue;
    const { data, error } = await db.from("laundry_order_items").select("order_id,quantity").in("order_id", part);
    if (error) throw error;
    out.push(...(data || []));
  }
  return out;
}

function orderScopeQuery(q, actor) {
  if (actor.actor_type === "customer") return q.eq("customer_id", actor.id);
  if (actor.actor_type === "staff" && actor.role === "delivery") return q.or(`pickup_driver_id.eq.${actor.id},delivery_driver_id.eq.${actor.id}`);
  return q;
}

async function buildReports(actor, params) {
  const from = parseRangeDate(params.get("from"));
  const to = parseRangeDate(params.get("to"), true);
  if (!from || !to || new Date(from) > new Date(to)) throw new Error("Choose a valid report date range");
  const group = ["day", "week", "month", "year"].includes(params.get("group")) ? params.get("group") : "day";
  const calendarMonth = /^\d{4}-\d{2}$/.test(params.get("calendar_month") || "") ? params.get("calendar_month") : dubaiDayKey(new Date()).slice(0, 7);
  const calFrom = `${calendarMonth}-01T00:00:00+04:00`;
  const cm = Number(calendarMonth.slice(5, 7));
  const cy = Number(calendarMonth.slice(0, 4));
  const nextY = cm === 12 ? cy + 1 : cy;
  const nextM = cm === 12 ? 1 : cm + 1;
  const calTo = new Date(new Date(`${nextY}-${String(nextM).padStart(2, "0")}-01T00:00:00+04:00`).getTime() - 1);

  const currentOrders = await fetchPaged(
    "laundry_orders",
    "id,order_no,customer_id,channel,laundry_status,total,pickup_driver_id,delivery_driver_id,created_at,updated_at,delivered_at",
    (q) => orderScopeQuery(q, actor).order("created_at", { ascending: false })
  );
  const scopedOrderIds = new Set(currentOrders.map((o) => o.id));
  const scopedCustomerIds = uniq(currentOrders.map((o) => o.customer_id));

  let allPayments = [];
  if (actor.actor_type === "staff" && actor.role === "delivery") {
    allPayments = await fetchPaged("laundry_payments", "id,order_id,customer_id,amount,received_amount,method,payment_context,collected_by_staff_id,created_at", (q) => q.eq("collected_by_staff_id", actor.id).order("created_at", { ascending: false }));
  } else if (actor.actor_type === "customer") {
    allPayments = await fetchPaged("laundry_payments", "id,order_id,customer_id,amount,received_amount,method,payment_context,collected_by_staff_id,created_at", (q) => q.eq("customer_id", actor.id).order("created_at", { ascending: false }));
  } else {
    allPayments = await fetchPaged("laundry_payments", "id,order_id,customer_id,amount,received_amount,method,payment_context,collected_by_staff_id,created_at", (q) => q.order("created_at", { ascending: false }));
  }
  if (actor.actor_type === "staff" && actor.role !== "delivery") allPayments = allPayments.filter((p) => scopedOrderIds.has(p.order_id));

  let credits = [];
  if (actor.actor_type === "customer") {
    credits = await fetchPaged("laundry_credit_ledger", "id,customer_id,order_id,amount,entry_type,created_at", (q) => q.eq("customer_id", actor.id).order("created_at", { ascending: false }));
  } else if (actor.actor_type === "staff" && actor.role === "delivery") {
    credits = [];
  } else {
    credits = await fetchPaged("laundry_credit_ledger", "id,customer_id,order_id,amount,entry_type,created_at", (q) => q.order("created_at", { ascending: false }));
    const customerSet = new Set(scopedCustomerIds);
    credits = credits.filter((c) => customerSet.has(c.customer_id));
  }

  let events = await fetchPaged("laundry_order_events", "id,order_id,to_status,actor_id,created_at", (q) => {
    q = q.gte("created_at", from).lte("created_at", to).in("to_status", ["collected", "delivered"]);
    if (actor.actor_type === "staff" && actor.role === "delivery") q = q.eq("actor_id", actor.id);
    return q.order("created_at");
  });
  if (!(actor.actor_type === "staff" && actor.role === "delivery")) events = events.filter((e) => scopedOrderIds.has(e.order_id));

  const periodOrders = currentOrders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    return t >= new Date(from).getTime() && t <= new Date(to).getTime();
  });
  const periodOrderIds = new Set(periodOrders.map((o) => o.id));
  const periodPayments = allPayments.filter((p) => {
    const t = new Date(p.created_at).getTime();
    return t >= new Date(from).getTime() && t <= new Date(to).getTime();
  });
  const periodCredits = credits.filter((c) => {
    const t = new Date(c.created_at).getTime();
    return t >= new Date(from).getTime() && t <= new Date(to).getTime();
  });
  const items = await fetchItemsByOrderIds(periodOrders.map((o) => o.id));
  const piecesByOrder = {};
  for (const i of items) piecesByOrder[i.order_id] = (piecesByOrder[i.order_id] || 0) + Number(i.quantity || 0);

  const appliedByOrder = {};
  for (const p of allPayments) appliedByOrder[p.order_id] = money((appliedByOrder[p.order_id] || 0) + Number(p.amount || 0));
  const creditByCustomer = {};
  for (const c of credits) creditByCustomer[c.customer_id] = money((creditByCustomer[c.customer_id] || 0) + Number(c.amount || 0));

  const current = {
    active_orders: 0,
    outstanding: 0,
    customer_credit: money(Object.values(creditByCustomer).reduce((s, n) => s + Number(n), 0)),
    quick_stage_counts: { pickup_requested: 0, collected: 0, received: 0, in_progress: 0, ready: 0, delivered: 0 },
    detailed_stage_counts: {},
    aging: { collected_over_12h: 0, in_progress_over_48h: 0, ready_over_24h: 0 },
  };
  const now = Date.now();
  for (const o of currentOrders) {
    const applied = Number(appliedByOrder[o.id] || 0);
    current.outstanding += Math.max(0, Number(o.total || 0) - applied);
    if (o.laundry_status !== "delivered") current.active_orders += 1;
    current.detailed_stage_counts[o.laundry_status] = (current.detailed_stage_counts[o.laundry_status] || 0) + 1;
    const q = quickStage(o.laundry_status);
    current.quick_stage_counts[q] = (current.quick_stage_counts[q] || 0) + 1;
    const ageHours = (now - new Date(o.updated_at || o.created_at).getTime()) / 3600000;
    if (o.laundry_status === "collected" && ageHours > 12) current.aging.collected_over_12h += 1;
    if (["washing", "ironing"].includes(o.laundry_status) && ageHours > 48) current.aging.in_progress_over_48h += 1;
    if (["ready", "out_for_delivery"].includes(o.laundry_status) && ageHours > 24) current.aging.ready_over_24h += 1;
  }
  current.outstanding = money(current.outstanding);

  const period = {
    orders: periodOrders.length,
    pieces: items.reduce((s, i) => s + Number(i.quantity || 0), 0),
    sales: money(periodOrders.reduce((s, o) => s + Number(o.total || 0), 0)),
    payments_received: money(periodPayments.reduce((s, p) => s + Number(p.received_amount || 0), 0)),
    collected: events.filter((e) => e.to_status === "collected").length,
    delivered: events.filter((e) => e.to_status === "delivered").length,
    credit_added: money(periodCredits.filter((c) => Number(c.amount) > 0).reduce((s, c) => s + Number(c.amount || 0), 0)),
    credit_applied: money(Math.abs(periodCredits.filter((c) => Number(c.amount) < 0).reduce((s, c) => s + Number(c.amount || 0), 0))),
  };
  period.avg_order_value = period.orders ? money(period.sales / period.orders) : 0;

  const method = {};
  const context = {};
  for (const p of periodPayments) {
    method[p.method] = money((method[p.method] || 0) + Number(p.received_amount || 0));
    context[p.payment_context] = money((context[p.payment_context] || 0) + Number(p.received_amount || 0));
  }

  const seriesMap = new Map();
  const ensureBucket = (key) => {
    if (!seriesMap.has(key)) seriesMap.set(key, { key, orders: 0, pieces: 0, sales: 0, payments_received: 0, collected: 0, delivered: 0 });
    return seriesMap.get(key);
  };
  for (const o of periodOrders) {
    const b = ensureBucket(bucketKey(o.created_at, group));
    b.orders += 1; b.pieces += Number(piecesByOrder[o.id] || 0); b.sales += Number(o.total || 0);
  }
  for (const p of periodPayments) ensureBucket(bucketKey(p.created_at, group)).payments_received += Number(p.received_amount || 0);
  for (const e of events) {
    const b = ensureBucket(bucketKey(e.created_at, group));
    if (e.to_status === "collected") b.collected += 1;
    if (e.to_status === "delivered") b.delivered += 1;
  }
  const series = [...seriesMap.values()].sort((a, b) => a.key.localeCompare(b.key)).map((x) => ({ ...x, sales: money(x.sales), payments_received: money(x.payments_received) }));

  let customers = [];
  if (actor.actor_type === "staff" && ["admin", "manager"].includes(actor.role)) {
    const customerRows = await fetchCustomersByIds(scopedCustomerIds);
    const nameMap = new Map(customerRows.map((c) => [c.id, c]));
    const rowMap = new Map();
    const ensureCustomer = (cid) => {
      if (!rowMap.has(cid)) rowMap.set(cid, { customer_id: cid, customer_code: nameMap.get(cid)?.customer_code || "", name: nameMap.get(cid)?.name || "Customer", mobile: nameMap.get(cid)?.mobile || "", orders: 0, pieces: 0, sales: 0, payments_received: 0, outstanding: 0, credit: Number(creditByCustomer[cid] || 0), last_order_at: null });
      return rowMap.get(cid);
    };
    for (const o of currentOrders) {
      const row = ensureCustomer(o.customer_id);
      row.outstanding += Math.max(0, Number(o.total || 0) - Number(appliedByOrder[o.id] || 0));
      if (!row.last_order_at || new Date(o.created_at) > new Date(row.last_order_at)) row.last_order_at = o.created_at;
    }
    for (const o of periodOrders) {
      const row = ensureCustomer(o.customer_id); row.orders += 1; row.pieces += Number(piecesByOrder[o.id] || 0); row.sales += Number(o.total || 0);
    }
    for (const p of periodPayments) ensureCustomer(p.customer_id).payments_received += Number(p.received_amount || 0);
    customers = [...rowMap.values()].map((r) => ({ ...r, sales: money(r.sales), payments_received: money(r.payments_received), outstanding: money(r.outstanding), credit: money(r.credit), net_position: money(r.outstanding - r.credit) })).sort((a, b) => b.sales - a.sales || b.payments_received - a.payments_received);
  }

  const calStart = new Date(calFrom).getTime();
  const calEnd = calTo.getTime();
  const calendarMap = new Map();
  const calBucket = (key) => {
    if (!calendarMap.has(key)) calendarMap.set(key, { date: key, orders: 0, sales: 0, payments_received: 0, collected: 0, delivered: 0 });
    return calendarMap.get(key);
  };
  for (const o of currentOrders) {
    const t = new Date(o.created_at).getTime();
    if (t >= calStart && t <= calEnd) { const b = calBucket(dubaiDayKey(o.created_at)); b.orders += 1; b.sales += Number(o.total || 0); }
  }
  for (const p of allPayments) {
    const t = new Date(p.created_at).getTime();
    if (t >= calStart && t <= calEnd) calBucket(dubaiDayKey(p.created_at)).payments_received += Number(p.received_amount || 0);
  }
  let calendarEvents = await fetchPaged("laundry_order_events", "order_id,to_status,actor_id,created_at", (q) => {
    q = q.gte("created_at", calFrom).lte("created_at", calTo.toISOString()).in("to_status", ["collected", "delivered"]);
    if (actor.actor_type === "staff" && actor.role === "delivery") q = q.eq("actor_id", actor.id);
    return q.order("created_at");
  });
  if (!(actor.actor_type === "staff" && actor.role === "delivery")) calendarEvents = calendarEvents.filter((e) => scopedOrderIds.has(e.order_id));
  for (const e of calendarEvents) {
    const b = calBucket(dubaiDayKey(e.created_at));
    if (e.to_status === "collected") b.collected += 1;
    if (e.to_status === "delivered") b.delivered += 1;
  }
  const calendar = [...calendarMap.values()].sort((a, b) => a.date.localeCompare(b.date)).map((x) => ({ ...x, sales: money(x.sales), payments_received: money(x.payments_received) }));

  return {
    ok: true,
    role: actor.role,
    range: { from, to, group, calendar_month: calendarMonth },
    period,
    current,
    breakdowns: { payment_method: method, payment_context: context },
    series,
    customers,
    calendar,
  };
}

async function quickAdvance(order, actor) {
  requireRole(actor, ["admin", "manager"]);
  const status = order.laundry_status;
  if (status === "pickup_requested") throw new Error("Pickup must be completed by the assigned delivery user");
  if (status === "collected") { await setStatus(order, "received", actor, "Quick flow"); return "received"; }
  if (status === "received") {
    const target = order.items?.length > 0 && order.items.every((x) => x.service?.workflow === "iron_only") ? "ironing" : "washing";
    await setStatus(order, target, actor, "Quick flow: started processing");
    return target;
  }
  if (status === "washing") {
    await setStatus(order, "ironing", actor, "Quick flow: processing");
    await setStatus({ ...order, laundry_status: "ironing" }, "ready", actor, "Quick flow: marked ready");
    return "ready";
  }
  if (status === "ironing") { await setStatus(order, "ready", actor, "Quick flow: marked ready"); return "ready"; }
  if (status === "ready") {
    const target = order.channel === "counter" ? "delivered" : "out_for_delivery";
    await setStatus(order, target, actor, target === "delivered" ? "Quick flow: counter handover" : "Quick flow: sent for delivery");
    return target;
  }
  if (status === "out_for_delivery") { await setStatus(order, "delivered", actor, "Quick flow: delivered"); return "delivered"; }
  throw new Error("No further quick action is available");
}

async function actionHandler(actor, body) {
  const action = body.action;

  if (action === "create_pickup_request") {
    let customerId;
    if (actor.actor_type === "customer") customerId = actor.id;
    else {
      requireRole(actor, ["admin", "manager"]);
      customerId = body.customer_id;
    }
    if (!customerId) throw new Error("Customer is required");
    const { data: customer } = await db.from("laundry_customers").select("id,address").eq("id", customerId).maybeSingle();
    if (!customer) throw new Error("Customer not found");
    const insert = {
      customer_id: customerId,
      channel: "pickup",
      laundry_status: "pickup_requested",
      delivery_address: body.address || customer.address || null,
      source_note: body.note || (actor.actor_type === "customer" ? "Customer pickup request" : "WhatsApp pickup request"),
      created_by_staff_id: actor.actor_type === "staff" ? actor.id : null,
      pickup_driver_id: body.pickup_driver_id || null,
    };
    if (actor.actor_type === "customer") insert.pickup_driver_id = null;
    const { data, error } = await db.from("laundry_orders").insert(insert).select("*").single();
    if (error) throw error;
    await addEvent(data.id, null, "pickup_requested", actor, insert.source_note);
    await audit(actor, "pickup_requested", "order", data.id, { order_no: data.order_no });
    return { order: data };
  }

  if (action === "save_customer") {
    requireRole(actor, ["admin", "manager"]);
    const existing = body.id ? await db.from("laundry_customers").select("*").eq("id", body.id).maybeSingle() : { data: null };
    const temporaryPin = body.pin || (!body.id ? pin6() : null);
    const accessEnabled = actor.role === "admin" ? body.access_enabled !== false : (existing.data?.access_enabled ?? true);
    const { data, error } = await db.rpc("laundry_upsert_customer_secure", {
      p_id: body.id || null,
      p_name: body.name,
      p_mobile: body.mobile,
      p_address: body.address || null,
      p_pin: temporaryPin,
      p_access_enabled: accessEnabled,
    });
    if (error) throw error;
    await audit(actor, body.id ? "customer_updated" : "customer_created", "customer", data, null);
    return { id: data, temporary_pin: !body.id ? temporaryPin : undefined };
  }

  if (action === "reset_customer_pin") {
    requireRole(actor, ["admin"]);
    const { data: c } = await db.from("laundry_customers").select("*").eq("id", body.customer_id).maybeSingle();
    if (!c) throw new Error("Customer not found");
    const nextPin = body.pin || pin6();
    const { error } = await db.rpc("laundry_upsert_customer_secure", {
      p_id: c.id, p_name: c.name, p_mobile: c.mobile, p_address: c.address,
      p_pin: nextPin, p_access_enabled: c.access_enabled,
    });
    if (error) throw error;
    await db.from("laundry_sessions").delete().eq("customer_id", c.id);
    await audit(actor, "customer_pin_reset", "customer", c.id, null);
    return { pin: nextPin };
  }

  if (action === "set_customer_access") {
    requireRole(actor, ["admin"]);
    const { error } = await db.from("laundry_customers").update({ access_enabled: !!body.enabled }).eq("id", body.customer_id);
    if (error) throw error;
    if (!body.enabled) await db.from("laundry_sessions").delete().eq("customer_id", body.customer_id);
    await audit(actor, "customer_access_changed", "customer", body.customer_id, { enabled: !!body.enabled });
    return { enabled: !!body.enabled };
  }

  if (action === "create_counter_order") {
    requireRole(actor, ["admin", "manager"]);
    if (!body.customer_id) throw new Error("Customer is required");
    const { data: order, error } = await db.from("laundry_orders").insert({
      customer_id: body.customer_id,
      channel: "counter",
      laundry_status: "received",
      source_note: body.note || "Counter order",
      discount_id: body.discount_id || null,
      created_by_staff_id: actor.id,
    }).select("*").single();
    if (error) throw error;
    const items = (body.items || []).filter((x) => Number(x.quantity) > 0);
    const priced = await db.rpc("laundry_replace_order_items", { p_order_id: order.id, p_items: items });
    if (priced.error) throw priced.error;
    await addEvent(order.id, null, "received", actor, "Counter intake");
    let payment = null;
    if (Number(body.payment_amount || 0) > 0) {
      payment = await recordPayment(order.id, actor, { amount: body.payment_amount, method: body.payment_method || "cash", context: "shop" });
    }
    await audit(actor, "counter_order_created", "order", order.id, priced.data?.[0] || null);
    return { order_id: order.id, pricing: priced.data?.[0] || null, payment };
  }

  if (action === "assign_driver") {
    requireRole(actor, ["admin", "manager"]);
    const kind = body.kind === "delivery" ? "delivery" : "pickup";
    const { data: driver } = await db.from("laundry_staff").select("id,role,active").eq("id", body.driver_id).maybeSingle();
    if (!driver || driver.role !== "delivery" || !driver.active) throw new Error("Select an active delivery user");
    const field = kind === "pickup" ? "pickup_driver_id" : "delivery_driver_id";
    const { error } = await db.from("laundry_orders").update({ [field]: driver.id }).eq("id", body.order_id);
    if (error) throw error;
    await audit(actor, `${kind}_driver_assigned`, "order", body.order_id, { driver_id: driver.id });
    let dispatched = false;
    if (kind === "delivery" && body.dispatch === true) {
      const order = await orderForAction(body.order_id);
      if (order.laundry_status === "ready") {
        await setStatus({ ...order, delivery_driver_id: driver.id }, "out_for_delivery", actor, "Quick flow: assigned and sent for delivery");
        dispatched = true;
      }
    }
    return { assigned: true, dispatched };
  }

  if (action === "collect_pickup") {
    requireRole(actor, ["delivery"]);
    const order = await orderForAction(body.order_id);
    if (order.pickup_driver_id !== actor.id) throw new Error("This pickup is not assigned to you");
    if (order.laundry_status !== "pickup_requested") throw new Error("Pickup is no longer awaiting collection");
    const items = (body.items || []).filter((x) => Number(x.quantity) > 0);
    const priced = await db.rpc("laundry_replace_order_items", { p_order_id: order.id, p_items: items });
    if (priced.error) throw priced.error;
    if (Number(body.payment_amount || 0) > 0) {
      await recordPayment(order.id, actor, { amount: body.payment_amount, method: body.payment_method || "cash", context: "pickup" });
    }
    const refreshed = await orderForAction(order.id);
    await setStatus(refreshed, "collected", actor, "Doorstep collection completed");
    return { collected: true, pricing: priced.data?.[0] || null };
  }

  if (action === "advance_order") {
    requireRole(actor, ["admin", "manager"]);
    const order = await orderForAction(body.order_id);
    const target = body.target_status;
    if (actor.role === "manager" && order.laundry_status === "pickup_requested") throw new Error("Pickup must be completed by the assigned delivery user");
    await setStatus(order, target, actor, body.note || null);
    return { status: target };
  }

  if (action === "deliver_order") {
    requireRole(actor, ["delivery"]);
    const order = await orderForAction(body.order_id);
    if (order.delivery_driver_id !== actor.id) throw new Error("This delivery is not assigned to you");
    if (order.laundry_status !== "out_for_delivery") throw new Error("Order is not out for delivery");
    if (Number(body.payment_amount || 0) > 0) {
      await recordPayment(order.id, actor, { amount: body.payment_amount, method: body.payment_method || "cash", context: "delivery" });
    }
    const refreshed = await orderForAction(order.id);
    await setStatus(refreshed, "delivered", actor, "Delivery handed over");
    return { delivered: true };
  }

  if (action === "record_payment") {
    requireRole(actor, ["admin", "manager", "delivery"]);
    const order = await orderForAction(body.order_id);
    if (actor.role === "delivery" && order.pickup_driver_id !== actor.id && order.delivery_driver_id !== actor.id) {
      throw new Error("This order is not assigned to you");
    }
    const payment = await recordPayment(order.id, actor, body);
    return { payment };
  }

  if (action === "apply_credit") {
    requireRole(actor, ["admin", "manager"]);
    const { data, error } = await db.rpc("laundry_apply_credit_tx", {
      p_order_id: body.order_id,
      p_collected_by: actor.id,
      p_amount: body.amount ? Number(body.amount) : null,
    });
    if (error) throw error;
    await audit(actor, "customer_credit_applied", "order", body.order_id, data?.[0] || null);
    return { result: data?.[0] || null };
  }

  if (action === "save_staff") {
    requireRole(actor, ["admin"]);
    const temporaryPin = body.pin || (!body.id ? pin6() : null);
    const { data, error } = await db.rpc("laundry_upsert_staff_secure", {
      p_id: body.id || null,
      p_login_id: body.login_id,
      p_display_name: body.display_name,
      p_role: body.role,
      p_phone: body.phone || null,
      p_pin: temporaryPin,
      p_active: body.active !== false,
    });
    if (error) throw error;
    if (body.id && body.active === false) await db.from("laundry_sessions").delete().eq("staff_id", body.id);
    await audit(actor, body.id ? "staff_updated" : "staff_created", "staff", data, null);
    return { id: data, temporary_pin: !body.id ? temporaryPin : undefined };
  }

  if (action === "save_garment") {
    requireRole(actor, ["admin"]);
    const payload = { code: body.code, name: body.name, active: body.active !== false, sort_order: Number(body.sort_order || 100) };
    let r;
    if (body.id) r = await db.from("laundry_garment_types").update(payload).eq("id", body.id).select("id").single();
    else r = await db.from("laundry_garment_types").insert(payload).select("id").single();
    if (r.error) throw r.error;
    await audit(actor, "garment_saved", "garment_type", r.data.id, payload);
    return { id: r.data.id };
  }

  if (action === "save_service") {
    requireRole(actor, ["admin"]);
    const payload = { code: body.code, name: body.name, workflow: body.workflow, active: body.active !== false, sort_order: Number(body.sort_order || 100) };
    let r;
    if (body.id) r = await db.from("laundry_services").update(payload).eq("id", body.id).select("id").single();
    else r = await db.from("laundry_services").insert(payload).select("id").single();
    if (r.error) throw r.error;
    await audit(actor, "service_saved", "service", r.data.id, payload);
    return { id: r.data.id };
  }

  if (action === "save_rate") {
    requireRole(actor, ["admin"]);
    const unitPrice = Number(body.unit_price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("Enter a valid rate");
    const payload = {
      garment_type_id: body.garment_type_id,
      service_id: body.service_id,
      unit_price: unitPrice,
      active: body.active !== false,
      effective_from: body.effective_from || new Date().toISOString().slice(0, 10),
      effective_to: body.effective_to || null,
    };
    let r;
    if (body.id) r = await db.from("laundry_rates").update(payload).eq("id", body.id).select("id").single();
    else r = await db.from("laundry_rates").upsert(payload, { onConflict: "garment_type_id,service_id,effective_from" }).select("id").single();
    if (r.error) throw r.error;
    await audit(actor, body.id ? "rate_updated" : "rate_saved", "rate", r.data.id, payload);
    return { id: r.data.id };
  }

  if (action === "save_discount") {
    requireRole(actor, ["admin"]);
    const payload = { name: body.name, discount_type: body.discount_type, value: Number(body.value || 0), active: body.active !== false };
    let r;
    if (body.id) r = await db.from("laundry_discounts").update(payload).eq("id", body.id).select("id").single();
    else r = await db.from("laundry_discounts").insert(payload).select("id").single();
    if (r.error) throw r.error;
    await audit(actor, "discount_saved", "discount", r.data.id, payload);
    return { id: r.data.id };
  }


  if (action === "quick_advance") {
    const order = await orderForAction(body.order_id);
    const status = await quickAdvance(order, actor);
    return { status };
  }

  if (action === "reset_demo_data") {
    requireRole(actor, ["admin"]);
    if (String(body.confirmation || "").trim().toUpperCase() !== "RESET") throw new Error("Type RESET to confirm");
    const { data, error } = await db.rpc("laundry_reset_demo_data", { p_actor_id: actor.id });
    if (error) throw error;
    return { reset: data || {} };
  }

  if (action === "save_business_settings") {
    requireRole(actor, ["admin"]);
    const name = String(body.name || "").trim();
    const address = String(body.address || "").trim();
    const phone = String(body.phone || "").trim();
    if (!name) throw new Error("Organization name is required");
    if (!address) throw new Error("Organization address is required");
    if (name.length > 120) throw new Error("Organization name is too long");
    if (address.length > 500) throw new Error("Organization address is too long");
    const existing = await db.from("laundry_settings").select("value").eq("key", "business").maybeSingle();
    if (existing.error) throw existing.error;
    const value = { ...(existing.data?.value || {}), name, address, phone, currency: existing.data?.value?.currency || "AED", timezone: existing.data?.value?.timezone || "Asia/Dubai" };
    const r = await db.from("laundry_settings").upsert({ key: "business", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (r.error) throw r.error;
    await audit(actor, "business_settings_updated", "settings", "business", { name, address, phone });
    return { business: value };
  }

  throw new Error("Unknown action");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const path = routePath(req);

  try {
    if (req.method === "GET" && (path === "/" || path === "/health")) {
      return json({ ok: true, service: "laundry-api", version: "1.3.1", time: new Date().toISOString() });
    }

    if (req.method === "POST" && path === "/login") {
      const body = await req.json();
      const identifier = String(body.identifier || "").trim();
      const pin = String(body.pin || "").trim();
      if (!identifier || !/^\d{6}$/.test(pin)) return fail("Enter your login and six-digit code", 400);

      const { data, error } = await db.rpc("laundry_authenticate", {
        p_identifier: identifier,
        p_pin: pin,
        p_ip: clientIp(req),
      });
      if (error) throw error;
      const result = data?.[0];
      if (!result?.ok) return fail(result?.reason || "Invalid login", result?.rate_limited ? 429 : 401, { rate_limited: !!result?.rate_limited });

      const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
      const tokenHash = await sha256(token);
      const sessionHours = 12;
      const expires = new Date(Date.now() + sessionHours * 3600 * 1000).toISOString();
      const row = {
        token_hash: tokenHash,
        actor_type: result.actor_type,
        staff_id: result.actor_type === "staff" ? result.actor_id : null,
        customer_id: result.actor_type === "customer" ? result.actor_id : null,
        role: result.actor_role,
        expires_at: expires,
      };
      const ins = await db.from("laundry_sessions").insert(row);
      if (ins.error) throw ins.error;
      await audit({ actor_type: result.actor_type, id: result.actor_id }, "login", result.actor_type, result.actor_id, null);
      return json({
        ok: true,
        token,
        expires_at: expires,
        actor: {
          id: result.actor_id,
          actor_type: result.actor_type,
          role: result.actor_role,
          display_name: result.display_name,
          customer_code: result.customer_code,
        },
      });
    }

    const auth = await authenticateRequest(req);
    if (auth.error) return fail(auth.error, auth.status);
    const actor = auth.actor;

    if (req.method === "POST" && path === "/logout") {
      await db.from("laundry_sessions").delete().eq("id", auth.session.id);
      return json({ ok: true });
    }

    if (req.method === "GET" && path === "/bootstrap") {
      return json(await buildBootstrap(actor));
    }

    if (req.method === "GET" && path === "/reports") {
      return json(await buildReports(actor, new URL(req.url).searchParams));
    }

    if (req.method === "POST" && path === "/action") {
      const body = await req.json();
      try {
        const result = await actionHandler(actor, body || {});
        return json({ ok: true, ...result });
      } catch (e) {
        const message = e?.message || "Action failed";
        if (message.startsWith("PERMISSION:")) return fail(message.slice(11), 403);
        return fail(message, 400);
      }
    }

    return fail("Not found", 404);
  } catch (e) {
    console.error("laundry-api", e);
    return fail(e?.message || "Server error", 500);
  }
});
