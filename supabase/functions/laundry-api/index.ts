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
    return { assigned: true };
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
    const payload = {
      garment_type_id: body.garment_type_id,
      service_id: body.service_id,
      unit_price: Number(body.unit_price),
      active: body.active !== false,
      effective_from: body.effective_from || new Date().toISOString().slice(0, 10),
      effective_to: body.effective_to || null,
    };
    const r = await db.from("laundry_rates").upsert(payload, { onConflict: "garment_type_id,service_id,effective_from" }).select("id").single();
    if (r.error) throw r.error;
    await audit(actor, "rate_saved", "rate", r.data.id, payload);
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
      return json({ ok: true, service: "laundry-api", version: "1.1.0", time: new Date().toISOString() });
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
