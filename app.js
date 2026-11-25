(() => {
  const cfg = window.LAUNDRY_CONFIG;
  const STAGES = [
    ["pickup_requested","Requested"],["collected","Collected"],["received","Received"],
    ["processing","Processing"],["washing","Washing"],["ironing","Ironing"],["ready","Ready"],["out_for_delivery","Out for delivery"],["delivered","Delivered"]
  ];
  const DEFAULT_QUICK_STAGES = [
    {code:"pickup_requested",name:"Requested",active:true,sort_order:10,system_status:"pickup_requested",system:true},
    {code:"collected",name:"Collected",active:true,sort_order:20,system_status:"collected",system:true},
    {code:"received",name:"Received",active:true,sort_order:30,system_status:"received",system:true},
    {code:"in_progress",name:"In Progress",active:true,sort_order:40,system_status:"processing",system:true},
    {code:"ready",name:"Ready",active:true,sort_order:50,system_status:"ready",system:true},
    {code:"delivered",name:"Delivered",active:true,sort_order:60,system_status:"delivered",system:true}
  ];
  const COUNTRY_PRESETS = [["AF","Afghanistan","Asia/Kabul","AFN"],["AL","Albania","Europe/Tirane","ALL"],["DZ","Algeria","Africa/Algiers","DZD"],["AS","American Samoa","Pacific/Pago_Pago","USD"],["AD","Andorra","Europe/Andorra","EUR"],["AO","Angola","Africa/Luanda","AOA"],["AI","Anguilla","America/Anguilla","XCD"],["AQ","Antarctica","Antarctica/McMurdo",""],["AG","Antigua and Barbuda","America/Antigua","XCD"],["AR","Argentina","America/Argentina/Buenos_Aires","ARS"],["AM","Armenia","Asia/Yerevan","AMD"],["AW","Aruba","America/Aruba","AWG"],["AU","Australia","Australia/Lord_Howe","AUD"],["AT","Austria","Europe/Vienna","EUR"],["AZ","Azerbaijan","Asia/Baku","AZN"],["BS","Bahamas","America/Nassau","BSD"],["BH","Bahrain","Asia/Bahrain","BHD"],["BD","Bangladesh","Asia/Dhaka","BDT"],["BB","Barbados","America/Barbados","BBD"],["BY","Belarus","Europe/Minsk","BYN"],["BE","Belgium","Europe/Brussels","EUR"],["BZ","Belize","America/Belize","BZD"],["BJ","Benin","Africa/Porto-Novo","XOF"],["BM","Bermuda","Atlantic/Bermuda","BMD"],["BT","Bhutan","Asia/Thimphu","INR"],["BO","Bolivia, Plurinational State of","America/La_Paz","BOB"],["BQ","Bonaire, Sint Eustatius and Saba","America/Kralendijk","USD"],["BA","Bosnia and Herzegovina","Europe/Sarajevo","BAM"],["BW","Botswana","Africa/Gaborone","BWP"],["BV","Bouvet Island","UTC","NOK"],["BR","Brazil","America/Noronha","BRL"],["IO","British Indian Ocean Territory","Indian/Chagos","USD"],["BN","Brunei Darussalam","Asia/Brunei","BND"],["BG","Bulgaria","Europe/Sofia","BGN"],["BF","Burkina Faso","Africa/Ouagadougou","XOF"],["BI","Burundi","Africa/Bujumbura","BIF"],["CV","Cabo Verde","Atlantic/Cape_Verde","CVE"],["KH","Cambodia","Asia/Phnom_Penh","KHR"],["CM","Cameroon","Africa/Douala","XAF"],["CA","Canada","America/St_Johns","CAD"],["KY","Cayman Islands","America/Cayman","KYD"],["CF","Central African Republic","Africa/Bangui","XAF"],["TD","Chad","Africa/Ndjamena","XAF"],["CL","Chile","America/Santiago","CLP"],["CN","China","Asia/Shanghai","CNY"],["CX","Christmas Island","Indian/Christmas","AUD"],["CC","Cocos (Keeling) Islands","Indian/Cocos","AUD"],["CO","Colombia","America/Bogota","COP"],["KM","Comoros","Indian/Comoro","KMF"],["CG","Congo","Africa/Brazzaville","XAF"],["CD","Congo, The Democratic Republic of the","Africa/Kinshasa","CDF"],["CK","Cook Islands","Pacific/Rarotonga","NZD"],["CR","Costa Rica","America/Costa_Rica","CRC"],["HR","Croatia","Europe/Zagreb","EUR"],["CU","Cuba","America/Havana","CUP"],["CW","Curaçao","America/Curacao","XCG"],["CY","Cyprus","Asia/Nicosia","EUR"],["CZ","Czechia","Europe/Prague","CZK"],["CI","Côte d'Ivoire","Africa/Abidjan","XOF"],["DK","Denmark","Europe/Copenhagen","DKK"],["DJ","Djibouti","Africa/Djibouti","DJF"],["DM","Dominica","America/Dominica","XCD"],["DO","Dominican Republic","America/Santo_Domingo","DOP"],["EC","Ecuador","America/Guayaquil","USD"],["EG","Egypt","Africa/Cairo","EGP"],["SV","El Salvador","America/El_Salvador","USD"],["GQ","Equatorial Guinea","Africa/Malabo","XAF"],["ER","Eritrea","Africa/Asmara","ERN"],["EE","Estonia","Europe/Tallinn","EUR"],["SZ","Eswatini","Africa/Mbabane","SZL"],["ET","Ethiopia","Africa/Addis_Ababa","ETB"],["FK","Falkland Islands (Malvinas)","Atlantic/Stanley","FKP"],["FO","Faroe Islands","Atlantic/Faroe","DKK"],["FJ","Fiji","Pacific/Fiji","FJD"],["FI","Finland","Europe/Helsinki","EUR"],["FR","France","Europe/Paris","EUR"],["GF","French Guiana","America/Cayenne","EUR"],["PF","French Polynesia","Pacific/Tahiti","XPF"],["TF","French Southern Territories","Indian/Kerguelen","EUR"],["GA","Gabon","Africa/Libreville","XAF"],["GM","Gambia","Africa/Banjul","GMD"],["GE","Georgia","Asia/Tbilisi","GEL"],["DE","Germany","Europe/Berlin","EUR"],["GH","Ghana","Africa/Accra","GHS"],["GI","Gibraltar","Europe/Gibraltar","GIP"],["GR","Greece","Europe/Athens","EUR"],["GL","Greenland","America/Nuuk","DKK"],["GD","Grenada","America/Grenada","XCD"],["GP","Guadeloupe","America/Guadeloupe","EUR"],["GU","Guam","Pacific/Guam","USD"],["GT","Guatemala","America/Guatemala","GTQ"],["GG","Guernsey","Europe/Guernsey","GBP"],["GN","Guinea","Africa/Conakry","GNF"],["GW","Guinea-Bissau","Africa/Bissau","XOF"],["GY","Guyana","America/Guyana","GYD"],["HT","Haiti","America/Port-au-Prince","HTG"],["HM","Heard Island and McDonald Islands","UTC","AUD"],["VA","Holy See (Vatican City State)","Europe/Vatican","EUR"],["HN","Honduras","America/Tegucigalpa","HNL"],["HK","Hong Kong","Asia/Hong_Kong","HKD"],["HU","Hungary","Europe/Budapest","HUF"],["IS","Iceland","Atlantic/Reykjavik","ISK"],["IN","India","Asia/Kolkata","INR"],["ID","Indonesia","Asia/Jakarta","IDR"],["IR","Iran, Islamic Republic of","Asia/Tehran","IRR"],["IQ","Iraq","Asia/Baghdad","IQD"],["IE","Ireland","Europe/Dublin","EUR"],["IM","Isle of Man","Europe/Isle_of_Man","GBP"],["IL","Israel","Asia/Jerusalem","ILS"],["IT","Italy","Europe/Rome","EUR"],["JM","Jamaica","America/Jamaica","JMD"],["JP","Japan","Asia/Tokyo","JPY"],["JE","Jersey","Europe/Jersey","GBP"],["JO","Jordan","Asia/Amman","JOD"],["KZ","Kazakhstan","Asia/Almaty","KZT"],["KE","Kenya","Africa/Nairobi","KES"],["KI","Kiribati","Pacific/Tarawa","AUD"],["KP","Korea, Democratic People's Republic of","Asia/Pyongyang","KPW"],["KR","Korea, Republic of","Asia/Seoul","KRW"],["KW","Kuwait","Asia/Kuwait","KWD"],["KG","Kyrgyzstan","Asia/Bishkek","KGS"],["LA","Lao People's Democratic Republic","Asia/Vientiane","LAK"],["LV","Latvia","Europe/Riga","EUR"],["LB","Lebanon","Asia/Beirut","LBP"],["LS","Lesotho","Africa/Maseru","ZAR"],["LR","Liberia","Africa/Monrovia","LRD"],["LY","Libya","Africa/Tripoli","LYD"],["LI","Liechtenstein","Europe/Vaduz","CHF"],["LT","Lithuania","Europe/Vilnius","EUR"],["LU","Luxembourg","Europe/Luxembourg","EUR"],["MO","Macao","Asia/Macau","MOP"],["MG","Madagascar","Indian/Antananarivo","MGA"],["MW","Malawi","Africa/Blantyre","MWK"],["MY","Malaysia","Asia/Kuala_Lumpur","MYR"],["MV","Maldives","Indian/Maldives","MVR"],["ML","Mali","Africa/Bamako","XOF"],["MT","Malta","Europe/Malta","EUR"],["MH","Marshall Islands","Pacific/Majuro","USD"],["MQ","Martinique","America/Martinique","EUR"],["MR","Mauritania","Africa/Nouakchott","MRU"],["MU","Mauritius","Indian/Mauritius","MUR"],["YT","Mayotte","Indian/Mayotte","EUR"],["MX","Mexico","America/Mexico_City","MXN"],["FM","Micronesia, Federated States of","Pacific/Chuuk","USD"],["MD","Moldova, Republic of","Europe/Chisinau","MDL"],["MC","Monaco","Europe/Monaco","EUR"],["MN","Mongolia","Asia/Ulaanbaatar","MNT"],["ME","Montenegro","Europe/Podgorica","EUR"],["MS","Montserrat","America/Montserrat","XCD"],["MA","Morocco","Africa/Casablanca","MAD"],["MZ","Mozambique","Africa/Maputo","MZN"],["MM","Myanmar","Asia/Yangon","MMK"],["NA","Namibia","Africa/Windhoek","ZAR"],["NR","Nauru","Pacific/Nauru","AUD"],["NP","Nepal","Asia/Kathmandu","NPR"],["NL","Netherlands","Europe/Amsterdam","EUR"],["NC","New Caledonia","Pacific/Noumea","XPF"],["NZ","New Zealand","Pacific/Auckland","NZD"],["NI","Nicaragua","America/Managua","NIO"],["NE","Niger","Africa/Niamey","XOF"],["NG","Nigeria","Africa/Lagos","NGN"],["NU","Niue","Pacific/Niue","NZD"],["NF","Norfolk Island","Pacific/Norfolk","AUD"],["MK","North Macedonia","Europe/Skopje","MKD"],["MP","Northern Mariana Islands","Pacific/Saipan","USD"],["NO","Norway","Europe/Oslo","NOK"],["OM","Oman","Asia/Muscat","OMR"],["PK","Pakistan","Asia/Karachi","PKR"],["PW","Palau","Pacific/Palau","USD"],["PS","Palestine, State of","Asia/Gaza","ILS"],["PA","Panama","America/Panama","PAB"],["PG","Papua New Guinea","Pacific/Port_Moresby","PGK"],["PY","Paraguay","America/Asuncion","PYG"],["PE","Peru","America/Lima","PEN"],["PH","Philippines","Asia/Manila","PHP"],["PN","Pitcairn","Pacific/Pitcairn","NZD"],["PL","Poland","Europe/Warsaw","PLN"],["PT","Portugal","Europe/Lisbon","EUR"],["PR","Puerto Rico","America/Puerto_Rico","USD"],["QA","Qatar","Asia/Qatar","QAR"],["RO","Romania","Europe/Bucharest","RON"],["RU","Russian Federation","Europe/Kaliningrad","RUB"],["RW","Rwanda","Africa/Kigali","RWF"],["RE","Réunion","Indian/Reunion","EUR"],["BL","Saint Barthélemy","America/St_Barthelemy","EUR"],["SH","Saint Helena, Ascension and Tristan da Cunha","Atlantic/St_Helena","SHP"],["KN","Saint Kitts and Nevis","America/St_Kitts","XCD"],["LC","Saint Lucia","America/St_Lucia","XCD"],["MF","Saint Martin (French part)","America/Marigot","EUR"],["PM","Saint Pierre and Miquelon","America/Miquelon","EUR"],["VC","Saint Vincent and the Grenadines","America/St_Vincent","XCD"],["WS","Samoa","Pacific/Apia","WST"],["SM","San Marino","Europe/San_Marino","EUR"],["ST","Sao Tome and Principe","Africa/Sao_Tome","STN"],["SA","Saudi Arabia","Asia/Riyadh","SAR"],["SN","Senegal","Africa/Dakar","XOF"],["RS","Serbia","Europe/Belgrade","RSD"],["SC","Seychelles","Indian/Mahe","SCR"],["SL","Sierra Leone","Africa/Freetown","SLE"],["SG","Singapore","Asia/Singapore","SGD"],["SX","Sint Maarten (Dutch part)","America/Lower_Princes","XCG"],["SK","Slovakia","Europe/Bratislava","EUR"],["SI","Slovenia","Europe/Ljubljana","EUR"],["SB","Solomon Islands","Pacific/Guadalcanal","SBD"],["SO","Somalia","Africa/Mogadishu","SOS"],["ZA","South Africa","Africa/Johannesburg","ZAR"],["GS","South Georgia and the South Sandwich Islands","Atlantic/South_Georgia","GBP"],["SS","South Sudan","Africa/Juba","SSP"],["ES","Spain","Europe/Madrid","EUR"],["LK","Sri Lanka","Asia/Colombo","LKR"],["SD","Sudan","Africa/Khartoum","SDG"],["SR","Suriname","America/Paramaribo","SRD"],["SJ","Svalbard and Jan Mayen","Arctic/Longyearbyen","NOK"],["SE","Sweden","Europe/Stockholm","SEK"],["CH","Switzerland","Europe/Zurich","CHF"],["SY","Syrian Arab Republic","Asia/Damascus","SYP"],["TW","Taiwan, Province of China","Asia/Taipei","TWD"],["TJ","Tajikistan","Asia/Dushanbe","TJS"],["TZ","Tanzania, United Republic of","Africa/Dar_es_Salaam","TZS"],["TH","Thailand","Asia/Bangkok","THB"],["TL","Timor-Leste","Asia/Dili","USD"],["TG","Togo","Africa/Lome","XOF"],["TK","Tokelau","Pacific/Fakaofo","NZD"],["TO","Tonga","Pacific/Tongatapu","TOP"],["TT","Trinidad and Tobago","America/Port_of_Spain","TTD"],["TN","Tunisia","Africa/Tunis","TND"],["TM","Turkmenistan","Asia/Ashgabat","TMT"],["TC","Turks and Caicos Islands","America/Grand_Turk","USD"],["TV","Tuvalu","Pacific/Funafuti","AUD"],["TR","Türkiye","Europe/Istanbul","TRY"],["UG","Uganda","Africa/Kampala","UGX"],["UA","Ukraine","Europe/Simferopol","UAH"],["AE","United Arab Emirates","Asia/Dubai","AED"],["GB","United Kingdom","Europe/London","GBP"],["US","United States","America/New_York","USD"],["UM","United States Minor Outlying Islands","Pacific/Midway","USD"],["UY","Uruguay","America/Montevideo","UYU"],["UZ","Uzbekistan","Asia/Samarkand","UZS"],["VU","Vanuatu","Pacific/Efate","VUV"],["VE","Venezuela, Bolivarian Republic of","America/Caracas","VES"],["VN","Viet Nam","Asia/Ho_Chi_Minh","VND"],["VG","Virgin Islands, British","America/Tortola","USD"],["VI","Virgin Islands, U.S.","America/St_Thomas","USD"],["WF","Wallis and Futuna","Pacific/Wallis","XPF"],["EH","Western Sahara","Africa/El_Aaiun","MAD"],["YE","Yemen","Asia/Aden","YER"],["ZM","Zambia","Africa/Lusaka","ZMW"],["ZW","Zimbabwe","Africa/Harare","USD"],["AX","Åland Islands","Europe/Mariehamn","EUR"]];
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
    mode: localStorage.getItem("laundry_mode") || "light",
    orderView: localStorage.getItem("laundry_order_view") || "optimal",
    orderFilters: new Set(),
    workflowMode: localStorage.getItem("laundry_workflow_mode") || "quick",
    reportTab: "sales",
    salesView: "summary",
    salesChartType: "bar",
    salesChartMetric: "sales",
    reportPreset: localStorage.getItem("laundry_report_preset") || "this_month",
    reportGroup: localStorage.getItem("laundry_report_group") || "day",
    reportFrom: "",
    reportDraftFrom: "",
    reportDraftTo: "",
    reportTo: "",
    reportCalendarMonth: "",
    reportData: null,
    reportLoading: false,
    reportError: "",
    reportRequest: 0,
    reportCurrency: "",
    reportCurrencies: [],
    adminTab: "business",
    countrySearch: "",
    customerBuildingFilter: "all",
    customerSort: "building",
    pickupBuildingFilter: "all",
    pickupSort: "building",
    deliveryBuildingFilter: "all",
    deliverySort: "building",
    bulkPickupSelected: new Set(),
    homeStageFilter: "all",
  };
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const esc = (v="") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  function platformSettings(){return state.data?.refs?.settings?.platform||{country_code:"AE",country_name:"United Arab Emirates",timezone:"Asia/Dubai",currency:"AED",max_user_count:10,tax_type:"VAT",vat_percent:5,cgst_percent:0,sgst_percent:0,tax_inclusive:true}}
  function currencyCode(){return String(platformSettings().currency||business()?.currency||"AED").toUpperCase()}
  const fmt = (n,c=currencyCode()) => `${String(c||currencyCode()).toUpperCase()} ${Number(n || 0).toFixed(2)}`;
  const ofmt = (o,n) => fmt(n,o?.currency_code||currencyCode());
  const stageLabel = s => STAGES.find(x=>x[0]===s)?.[1] || s;
  const quickStageKey = s => ["processing","washing","ironing"].includes(s)?"in_progress":["ready","out_for_delivery"].includes(s)?"ready":s;
  function workflowStages(){const rows=state.data?.refs?.settings?.workflow?.stages;return (Array.isArray(rows)&&rows.length?rows:DEFAULT_QUICK_STAGES).slice().sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0))}
  function activeWorkflowStages(){return workflowStages().filter(x=>x.active!==false)}
  function orderQuickStage(o){
    const physical=quickStageKey(o?.laundry_status||o),stored=o?.quick_stage_code;
    if(physical==="delivered")return "delivered";
    const custom=workflowStages().find(x=>x.code===stored&&!DEFAULT_QUICK_STAGES.some(d=>d.code===stored));
    return custom&&quickStageKey(custom.system_status)===physical?stored:physical;
  }
  function quickStageLabel(v){const code=typeof v==="object"?orderQuickStage(v):quickStageKey(v);return workflowStages().find(x=>x.code===code)?.name||stageLabel(code)}
  const roleName = r => ({super_admin:"Super Admin",admin:"Admin",manager:"Manager",delivery:"Delivery",customer:"Customer"}[r] || r);
  const id = x => document.getElementById(x);
  function isAdminRole(r){return r==="super_admin"||r==="admin"}
  function isOpsManager(r){return r==="super_admin"||r==="admin"||r==="manager"}

  function orgDate(){const tz=platformSettings().timezone||"Asia/Dubai";const parts=new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const m=Object.fromEntries(parts.filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));return new Date(Date.UTC(Number(m.year),Number(m.month)-1,Number(m.day)))}
  function dateKey(d){return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`}
  function addDays(d,n){const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x}
  function monthEnd(d){return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0))}
  function reportRange(preset=state.reportPreset){
    const today=orgDate(), wd=today.getUTCDay()||7; let from=today,to=today,label="Today";
    if(preset==="yesterday"){from=to=addDays(today,-1);label="Yesterday"}
    else if(preset==="this_week"){from=addDays(today,-wd+1);to=today;label="This week"}
    else if(preset==="last_week"){to=addDays(today,-wd);from=addDays(to,-6);label="Last week"}
    else if(preset==="this_month"){from=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),1));to=today;label="This month"}
    else if(preset==="last_month"){const d=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth()-1,1));from=d;to=monthEnd(d);label="Last month"}
    else if(preset==="this_year"){from=new Date(Date.UTC(today.getUTCFullYear(),0,1));to=today;label="This year"}
    else if(preset==="last_year"){from=new Date(Date.UTC(today.getUTCFullYear()-1,0,1));to=new Date(Date.UTC(today.getUTCFullYear()-1,11,31));label="Last year"}
    else if(preset==="custom"){return {from:state.reportFrom||dateKey(today),to:state.reportTo||dateKey(today),label:"Custom"}}
    return {from:dateKey(from),to:dateKey(to),label};
  }
  if(!state.reportCalendarMonth) state.reportCalendarMonth=dateKey(orgDate()).slice(0,7);

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
    return state.data?.refs?.settings?.workflow || {confirm_stage_changes:false,stages:DEFAULT_QUICK_STAGES};
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
      cash:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9h.01M18 15h.01"/>',
      card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 15h4"/>',
      bank:'<path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M2 18h20M12 3l9 5H3z"/>',
      more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
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
    if(isAdminRole(role)) return ["home","orders","admin","reports"];
    if(role==="manager") return ["home","orders","customers","reports"];
    if(role==="delivery") return ["stops","orders","history","reports","account"];
    return ["home","orders","pickup","reports","account"];
  }

  function navItems(role){
    const map={
      super_admin:[["home","Home","home"],["orders","Orders","orders"],["admin","Setup","admin"],["reports","Reports","reports"]],
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
    state.reportRequest++;state.reportCurrency="";state.reportCurrencies=[];state.reportLoading=false;state.reportError="";state.token=""; state.data=null; state.reportData=null; localStorage.removeItem("laundry_token"); renderLogin();
  }

  function renderApp(){
    const d=state.data, a=d.actor, nav=navItems(a.role);
    const navButtons=nav.map(([v,l,i])=>`<button class="navbtn ${state.view===v?'active':''}" data-view="${v}">${icon(i)}<span>${l}</span></button>`).join("");
    const org=business();
    const orgInitial=(org.name||"Laundry Desk").trim().charAt(0).toUpperCase()||"L";
    app.innerHTML=`<div class="shell ${state.view==="home"?"home-shell":""}">
      <header class="topbar"><div class="topbar-inner">
        <div class="brand"><div class="brand-mark">${esc(orgInitial)}</div><div class="brand-copy"><div>${esc(org.name||"Laundry Desk")}</div>${org.address?`<span>${esc(org.address)}</span>`:""}</div></div>
        <nav class="desktop-nav">${navButtons}</nav>
        <div class="actor"><div class="actor-copy"><div class="actor-name">${esc(a.role==="super_admin"?"Admin":a.display_name)}</div>${a.role==="super_admin"?"":`<div class="actor-role">${roleName(a.role)}</div>`}</div><button class="icon-btn" data-action="toggle-theme" aria-label="Switch to ${state.mode==='graphite'?'light':'graphite'} theme" title="Switch theme">${icon(state.mode==='graphite'?"sun":"moon")}</button><button class="icon-btn" data-action="theme" aria-label="Theme settings" title="Theme settings">${icon("palette")}</button><button class="btn ghost smallbtn exit-btn" data-action="logout" aria-label="Exit" title="Exit">${icon("logout","sm")}<span>Exit</span></button></div>
      </div></header>
      <main class="main">${renderView()}</main>
      <nav class="bottomnav"><div class="bottomnav-inner" style="--nav-count:${nav.length}">${navButtons}</div></nav>
      ${state.modal||""}
    </div>`;
    bindDynamicForms();
  }

  function renderView(){
    const role=state.data.actor.role;
    if(isAdminRole(role)) return state.view==="home"?homeStaff():state.view==="orders"?ordersView():state.view==="admin"?adminView():reportsView();
    if(role==="manager") return state.view==="home"?homeStaff():state.view==="orders"?ordersView():state.view==="customers"?managerCustomersView():reportsView();
    if(role==="delivery") return state.view==="stops"?deliveryStops():state.view==="orders"?ordersView(false):state.view==="history"?historyView():state.view==="reports"?reportsView():accountView();
    return state.view==="home"?customerHome():state.view==="orders"?ordersView():state.view==="pickup"?customerPickup():state.view==="reports"?reportsView():accountView();
  }

  function titleBlock(kicker,title,sub,actions=""){
    return `<div class="page-head"><div class="page-head-copy"><div class="kicker">${kicker}</div><div class="page-title-line"><h1>${title}</h1>${sub?`<p class="sub">${sub}</p>`:""}</div></div>${actions?`<div class="page-head-actions">${actions}</div>`:""}</div>`;
  }

  function metric(label,value,accent=false){return `<div class="card metric ${accent?'accent':''}"><div class="value">${value}</div><div class="label">${label}</div></div>`}

  function homeStageCount(key,summary){
    if(key==="all") return Number(summary.active_orders||0);
    if(Object.prototype.hasOwnProperty.call(summary.stage_counts||{},key)) return Number(summary.stage_counts[key]||0);
    if(key==="in_progress") return Number(summary.stage_counts.processing||0)+Number(summary.stage_counts.washing||0)+Number(summary.stage_counts.ironing||0);
    if(key==="ready") return Number(summary.stage_counts.ready||0)+Number(summary.stage_counts.out_for_delivery||0);
    return 0;
  }

  function homeStageMatch(order,key){
    if(key==="all") return order.laundry_status!=="delivered";
    return orderQuickStage(order)===key;
  }

  function homeAttentionCard(o){
    const pieces=(o.items||[]).reduce((sum,x)=>sum+Number(x.quantity||0),0);
    const location=o.channel==="pickup"?customerLocationLabel(o.customer,false):"Counter";
    const due=Number(o.outstanding||0);
    const canPay=["super_admin","admin","manager","delivery"].includes(state.data.actor.role)&&due>0;
    return `<article class="home-attention-card" data-home-order="${o.id}">
      <button class="home-attention-main" data-action="open-order" data-id="${o.id}" aria-label="Open ${esc(o.order_no)}">
        <span class="home-attention-copy"><b>${esc(o.order_no)} · ${esc(o.customer?.name||"Customer")}</b><small>${esc(location||"")}${pieces?` · ${pieces} pcs`:""}</small></span>
        <span class="home-stage-pill">${esc(quickStageLabel(o))}</span>
      </button>
      <div class="home-attention-side ${due>0?'has-due':''}"><small>${due>0?'Due':'Total'}</small><b>${fmt(due>0?due:o.total)}</b></div>
      <div class="home-attention-actions">${canPay?`<button class="home-mini-action" data-action="payment" data-id="${o.id}">${icon("payment","sm")}<span>Pay</span></button>`:""}<button class="home-mini-action" data-action="open-order" data-id="${o.id}">${icon("orders","sm")}<span>Open</span></button></div>
    </article>`;
  }

  function homeStaff(){
    const s=state.data.summary, role=state.data.actor.role, orders=state.data.orders||[];
    const configured=activeWorkflowStages().filter(x=>x.code!=="delivered");
    const stages=[{code:"all",name:"All active"},...configured];
    if(state.homeStageFilter!=="all"&&!configured.some(x=>x.code===state.homeStageFilter))state.homeStageFilter="all";
    const activeOrders=orders.filter(o=>o.laundry_status!=="delivered");
    let focusOrders;
    if(state.homeStageFilter!=="all") focusOrders=activeOrders.filter(o=>homeStageMatch(o,state.homeStageFilter));
    else{
      const priority=o=>orderQuickStage(o)==="pickup_requested"?0:orderQuickStage(o)==="ready"?1:Number(o.outstanding||0)>0?2:3;
      focusOrders=activeOrders.filter(o=>["pickup_requested","ready"].includes(orderQuickStage(o))||Number(o.outstanding||0)>0).sort((a,b)=>priority(a)-priority(b)||String(b.updated_at||b.created_at||"").localeCompare(String(a.updated_at||a.created_at||"")));
      if(!focusOrders.length)focusOrders=activeOrders;
    }
    focusOrders=focusOrders.slice(0,6);
    const selectedLabel=stages.find(x=>x.code===state.homeStageFilter)?.name||"All active";
    const stageStrip=`<section class="home-stage-section"><div class="home-section-head"><b>Work by stage</b><span>Tap to focus</span></div><div class="home-stage-grid">${stages.map(x=>`<button class="home-stage-card ${state.homeStageFilter===x.code?'active':''}" data-home-stage="${esc(x.code)}"><span>${esc(x.name)}</span><b>${homeStageCount(x.code,s)}</b></button>`).join("")}</div></section>`;
    const metrics=`<section class="home-dashboard-section"><div class="home-section-head"><b>Today</b><span>${esc(platformSettings().timezone||"")}</span></div><div class="home-kpi-grid"><div class="home-kpi"><span>Active orders</span><b>${Number(s.active_orders||0)}</b></div><div class="home-kpi due"><span>Outstanding</span><b>${fmt(s.outstanding)}</b></div><div class="home-kpi"><span>Collected</span><b>${fmt(s.payments_received)}</b></div><div class="home-kpi credit"><span>Customer credit</span><b>${fmt(s.customer_credits)}</b></div></div></section>`;
    const quick=isOpsManager(role)?`<section class="home-quick-section compact-home-section"><div class="home-section-head"><b>Quick actions</b><span>One tap</span></div><div class="home-quick-actions home-quick-compact"><button class="home-quick-card" data-action="counter-order"><span class="home-quick-icon">${icon("orders")}</span><span><b>Counter order</b><small>At shop</small></span></button><button class="home-quick-card" data-action="pickup-request"><span class="home-quick-icon">${icon("pickup")}</span><span><b>Pickup request</b><small>Phone / WhatsApp</small></span></button><button class="home-quick-card" data-action="receive-payment"><span class="home-quick-icon">${icon("payment")}</span><span><b>Receive payment</b><small>Due / advance</small></span></button><button class="home-quick-card" data-action="new-customer"><span class="home-quick-icon">${icon("user")}</span><span><b>Add customer</b><small>New customer</small></span></button></div></section>`:"";
    const attention=`<section class="home-attention-section"><div class="home-section-head"><b>${state.homeStageFilter==="all"?'Needs attention':esc(selectedLabel)}</b><span>${focusOrders.length} ${focusOrders.length===1?'case':'cases'}</span></div>${focusOrders.length?`<div class="home-attention-list">${focusOrders.map(homeAttentionCard).join("")}</div>`:`<div class="empty home-empty">No orders in this stage.</div>`}</section>`;
    return `<div class="home-compact">${stageStrip}${metrics}${quick}${attention}</div>`;
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
    const paymentLabel=o.outstanding>0?`Due ${ofmt(o,o.outstanding)}`:(o.payment_status==="unpriced"?"Not priced":"Paid");
    const canPay=["super_admin","admin","manager","delivery"].includes(state.data.actor.role) && Number(o.outstanding||0)>0;
    const actions=`<div class="order-card-actions">${canPay?`<button class="btn smallbtn order-pay-btn" data-action="payment" data-id="${o.id}">${icon("payment","sm")}Pay</button>`:""}<button class="btn smallbtn order-details-btn" data-action="open-order" data-id="${o.id}" aria-label="Open ${esc(o.order_no)} details">Details</button></div>`;
    if(mode==="detailed"){
      return `<article class="card order order-detailed" data-order-card="${o.id}"><div class="order-head"><div><div class="order-no">${esc(o.order_no)}</div><div class="small muted">${esc(o.customer?.name||"")}${pieces?` · ${pieces} pcs`:""}${route?` · ${esc(route)}`:""}</div></div><div class="money">${ofmt(o,o.total)}</div></div>
        <div class="order-meta"><span class="stage active">${quickStageLabel(o)}</span><span class="badge ${o.payment_status}">${o.payment_status}</span></div>
        <div class="order-money"><div><span>Paid</span><b>${ofmt(o,o.paid)}</b></div><div><span>Due</span><b>${ofmt(o,o.outstanding)}</b></div>${o.customer_credit>0?`<div><span>Credit</span><b>${ofmt(o,o.customer_credit)}</b></div>`:""}<div><span>Type</span><b>${o.channel==="counter"?"Counter":"Pickup"}</b></div></div>${actions}</article>`;
    }
    return `<article class="card order order-optimal" data-order-card="${o.id}">
      <div class="order-optimal-main"><div class="order-no">${esc(o.order_no)}</div><div class="order-customer">${esc(o.customer?.name||"")}${pieces?` · ${pieces} pcs`:""}${route?` · ${esc(route)}`:""}</div></div>
      <div class="order-optimal-status"><span class="stage active">${quickStageLabel(o)}</span><span class="badge ${o.payment_status}">${o.payment_status}</span></div>
      <div class="order-optimal-money"><span>${paymentLabel}</span><b>${ofmt(o,o.total)}</b></div>${actions}
    </article>`;
  }

  function visibleOrders(includeDelivered=true){
    let orders=state.data.orders||[];
    if(!includeDelivered) orders=orders.filter(o=>o.laundry_status!=="delivered");
    if(state.orderFilters.size) orders=orders.filter(o=>state.orderFilters.has(orderQuickStage(o))||state.orderFilters.has(o.laundry_status));
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
    if(!["super_admin","admin","manager"].includes(state.data.actor.role))return "";
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
      <div class="bulk-assign-bar"><div class="bulk-driver-picker"><div class="field-label">Collection boy</div>${driverChips("bulk_pickup_driver","",false).replace('name="bulk_pickup_driver"','name="bulk_pickup_driver" id="bulkPickupDriver"')}</div><button class="btn primary" data-action="bulk-assign-pickups">Assign selected (${state.bulkPickupSelected.size})</button></div></section>`;
  }

  function ordersView(includeDelivered=true){
    const orders=visibleOrders(includeDelivered);
    const total=(state.data.orders||[]).filter(o=>includeDelivered||o.laundry_status!=="delivered").length;
    const create=state.data.actor.role==="manager"?`<button class="btn primary" data-action="counter-order">+ New</button>`:"";
    const allActive=state.orderFilters.size===0;
    const filters=[{code:"all",name:"All"},...activeWorkflowStages()].map(({code:key,name:label})=>{
      const active=key==="all"?allActive:state.orderFilters.has(key);
      return `<button class="tab filter-chip ${active?'active':''}" data-filter-stage="${key}" aria-pressed="${active?'true':'false'}">${label}</button>`;
    }).join("");
    return `${titleBlock("Orders","Orders",`${orders.length} of ${total} shown`,create)}
      ${pickupAssignmentPanel()}
      <div class="orders-toolbar"><div class="tabs order-stage-tabs" aria-label="Order status filters">${filters}</div><div class="view-switch" aria-label="Order view"><button class="view-switch-btn ${state.orderView==="optimal"?'active':''}" data-order-view="optimal">Compact</button><button class="view-switch-btn ${state.orderView==="detailed"?'active':''}" data-order-view="detailed">Details</button></div></div>
      <div id="orderList" class="${state.orderView==="detailed"?'grid cards order-list detailed-view':'order-list optimal-view'}">${orders.length?orders.map(o=>orderCard(o,state.orderView)).join(""):`<div class="empty">No orders match these statuses.</div>`}</div>`;
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
    if(["super_admin","admin","manager"].includes(role)) return [["sales","Sales"],["overview","Overview"],["customers","Customers"],["operations","Operations"],["payments","Payments"],["calendar","Calendar"]];
    if(role==="delivery") return [["overview","My activity"],["operations","Operations"],["payments","Payments"],["calendar","Calendar"]];
    return [["overview","My report"],["payments","Payments"],["calendar","Calendar"]];
  }

  function reportCurrencyCode(){return state.reportData?.report_currency||state.reportCurrency||currencyCode()}
  function reportMoney(v){return v==null?"—":fmt(v,reportCurrencyCode())}
  function reportCurrencyControl(){return state.reportCurrencies.length>1?`<label class="report-currency-label">Currency<select id="reportCurrency">${state.reportCurrencies.map(c=>`<option value="${esc(c)}" ${c===state.reportCurrency?"selected":""}>${esc(c)}</option>`).join("")}</select></label>`:""}
  function reportControls(){
    if(state.reportTab==="calendar")return `<div class="report-controls"><div class="report-options calendar-options">${reportCurrencyControl()}<label class="calendar-month">Month<input id="reportCalendarMonth" type="month" value="${esc(state.reportCalendarMonth)}" required></label></div></div>`;
    const presets=[["today","Today"],["yesterday","Yesterday"],["this_week","This week"],["last_week","Last week"],["this_month","This month"],["last_month","Last month"],["this_year","This year"],["last_year","Last year"],["custom","Custom"]];
    return `<div class="report-controls ${state.reportTab==="sales"?"sales-report-controls":""}">${state.reportTab==="sales"?`<label class="sales-mobile-period">Period<select id="salesPeriodPreset">${presets.map(([k,l])=>`<option value="${k}" ${state.reportPreset===k?"selected":""}>${l}</option>`).join("")}</select></label>`:""}<div class="report-presets">${presets.map(([k,l])=>`<button class="chip ${state.reportPreset===k?'active':''}" data-report-preset="${k}">${l}</button>`).join("")}</div><div class="report-options">${reportCurrencyControl()}${state.reportTab!=="customers"&&state.reportTab!=="sales"?`<label>Group by<select id="reportGroup"><option value="day" ${state.reportGroup==='day'?'selected':''}>Day</option><option value="week" ${state.reportGroup==='week'?'selected':''}>Week</option><option value="month" ${state.reportGroup==='month'?'selected':''}>Month</option><option value="year" ${state.reportGroup==='year'?'selected':''}>Year</option></select></label>`:""}</div>${state.reportPreset==='custom'?`<form id="reportCustomForm" class="report-custom"><label>From<input type="date" name="from" value="${esc(state.reportDraftFrom||state.reportFrom||reportRange('today').from)}" required></label><label>To<input type="date" name="to" value="${esc(state.reportDraftTo||state.reportTo||reportRange('today').to)}" required></label><button class="btn primary smallbtn">Apply</button></form>`:''}</div>`;
  }

  function selectReportPreset(preset){state.reportPreset=preset;localStorage.setItem("laundry_report_preset",preset);if(state.reportTab!=="sales"||state.salesView==="summary"){if(["this_year","last_year"].includes(preset))state.reportGroup="month";else if(preset!=="custom")state.reportGroup="day";}localStorage.setItem("laundry_report_group",state.reportGroup);loadReports(true)}
  function reportLoading(){return `<div class="report-loading"><span class="btn-spinner"></span><div><b>Loading report</b><span>Calculating orders, payments and workflow activity…</span></div></div>`}
  function breakdownCards(obj){const entries=Object.entries(obj||{});return entries.length?`<div class="report-breakdown">${entries.map(([k,v])=>`<div class="card report-break"><span>${esc(k.replaceAll('_',' '))}</span><b>${reportMoney(v)}</b></div>`).join("")}</div>`:`<div class="empty">No activity in this period.</div>`}
  function trendTable(rows){return rows?.length?`<div class="table-wrap report-table"><table><thead><tr><th>Period</th><th>Orders</th><th>Pieces</th><th>Sales</th><th>Received</th><th>Collected</th><th>Delivered</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="mono">${esc(r.key)}</td><td>${r.orders}</td><td>${r.pieces}</td><td>${reportMoney(r.sales)}</td><td>${reportMoney(r.payments_received)}</td><td>${r.collected}</td><td>${r.delivered}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No activity in this period.</div>`}
  function netPositionText(v){if(v==null)return "—";v=Number(v||0);return v>0?`${reportMoney(v)} due`:v<0?`${reportMoney(Math.abs(v))} credit`:`Settled`}

  function reportOverview(r){
    const role=state.data.actor.role,p=r.period,c=r.current;
    if(role==="delivery") return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Period activity</div><h2>My work</h2></div></div><div class="grid metrics report-metrics">${metric("Collected",p.collected,true)}${metric("Delivered",p.delivered)}${metric("Payments collected",reportMoney(p.payments_received))}${metric("Assigned active",c.active_orders)}</div></div><div class="report-section"><h2>Trend</h2>${trendTable(r.series)}</div>`;
    if(role==="customer") return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Period activity</div><h2>My laundry</h2></div></div><div class="grid metrics report-metrics">${metric("Orders",p.orders,true)}${metric("Pieces",p.pieces)}${metric("Spend",reportMoney(p.sales))}${metric("Paid",reportMoney(p.payments_received))}</div></div><div class="report-section"><div class="report-section-head"><div><div class="kicker">Current position</div><h2>My balance</h2></div></div><div class="grid metrics report-metrics">${metric("Amount due",reportMoney(c.outstanding),true)}${metric("Available credit",reportMoney(c.customer_credit))}${metric("Active orders",c.active_orders)}${metric("Net",netPositionText(c.customer_credit==null?null:c.outstanding-c.customer_credit))}</div></div><div class="report-section"><h2>Trend</h2>${trendTable(r.series)}</div>`;
    return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Period activity</div><h2>Business activity</h2></div><span class="report-note">Filtered by selected dates</span></div><div class="grid metrics report-metrics">${metric("Orders",p.orders,true)}${metric("Pieces",p.pieces)}${metric("Sales",reportMoney(p.sales))}${metric("Payments received",reportMoney(p.payments_received))}${metric("Collected",p.collected)}${metric("Delivered",p.delivered)}${metric("Avg order",reportMoney(p.avg_order_value))}</div></div><div class="report-section"><div class="report-section-head"><div><div class="kicker">Current position</div><h2>What is open now</h2></div><span class="report-note">Not date-filtered</span></div><div class="grid metrics report-metrics">${metric("Active orders",c.active_orders,true)}${metric("Outstanding",reportMoney(c.outstanding))}${metric("Customer credit",reportMoney(c.customer_credit))}${metric("In progress",c.quick_stage_counts.in_progress||0)}${metric("Ready",c.quick_stage_counts.ready||0)}</div></div><div class="report-section"><h2>Trend</h2>${trendTable(r.series)}</div>`;
  }

  function reportCustomers(r){return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Customer position</div><h2>Customer-wise business</h2></div><span class="report-note">Sales and receipts: selected period · Due and credit: current position</span></div>${r.customers?.length?`<div class="table-wrap report-table customer-report"><table><thead><tr><th>Customer</th><th>Orders</th><th>Pieces</th><th>Sales</th><th>Received</th><th>Outstanding</th><th>Credit</th><th>Net position</th></tr></thead><tbody>${r.customers.map(c=>`<tr><td><b>${esc(c.name)}</b><div class="small muted mono">${esc(c.customer_code)}</div></td><td>${c.orders}</td><td>${c.pieces}</td><td>${reportMoney(c.sales)}</td><td>${reportMoney(c.payments_received)}</td><td>${reportMoney(c.outstanding)}</td><td>${reportMoney(c.credit)}</td><td class="strong ${c.net_position<0?'credit-text':c.net_position>0?'due-text':''}">${netPositionText(c.net_position)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No customer activity in this period.</div>`}</div>`}

  function periodBreakdown(r,kind){const rows=r.series||[],headers=kind==="operations"?["Period","Collected","Delivered"]:["Period","Payments received"];return rows.length?`<div class="table-wrap report-table"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.key)}</td>${kind==="operations"?`<td>${x.collected||0}</td><td>${x.delivered||0}</td>`:`<td>${reportMoney(x.payments_received)}</td>`}</tr>`).join("")}</tbody></table></div>`:`<div class="empty">No activity in this period.</div>`}
  function reportOperations(r){const c=r.current,p=r.period;const qs=c.quick_stage_counts||{};return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Current workload</div><h2>Quick workflow queue</h2></div><span class="report-note">Current position · not date-filtered</span></div><div class="queue-strip report-queue">${workflowStages().filter(x=>x.code!=="delivered"&&(x.active!==false||qs[x.code])).map(x=>`<div class="queue-chip"><b>${qs[x.code]||0}</b><span>${esc(x.name)}${x.active===false?" (inactive)":""}</span></div>`).join("")}</div></div><div class="report-section"><div class="grid metrics report-metrics">${metric("Collected in period",p.collected,true)}${metric("Delivered in period",p.delivered)}${metric("Collected >12h",c.aging.collected_over_12h)}${metric("In progress >48h",c.aging.in_progress_over_48h)}${metric("Ready >24h",c.aging.ready_over_24h)}</div></div><details class="card report-details"><summary>Detailed stage counts</summary><div class="report-stage-list">${STAGES.map(([k,l])=>`<div><span>${l}</span><b>${c.detailed_stage_counts[k]||0}</b></div>`).join("")}</div></details><div class="report-section"><h2>Workflow activity by ${esc(r.range.group)}</h2>${periodBreakdown(r,"operations")}</div>`}

  function reportPayments(r){const p=r.period,c=r.current,role=state.data.actor.role;return `<div class="report-section"><div class="grid metrics report-metrics">${metric(role==="delivery"?"Collected by me":"Payments received",reportMoney(p.payments_received),true)}${role!=="delivery"?metric("Outstanding now",reportMoney(c.outstanding)):''}${role!=="delivery"?metric("Customer credit",reportMoney(c.customer_credit)):''}${role!=="delivery"?metric("Credit added",reportMoney(p.credit_added)):''}${role!=="delivery"?metric("Credit applied",reportMoney(p.credit_applied)):''}</div></div><div class="report-section"><h2>By payment method</h2>${breakdownCards(r.breakdowns.payment_method)}</div><div class="report-section"><h2>By collection point</h2>${breakdownCards(r.breakdowns.payment_context)}</div><div class="report-section"><h2>Receipts by ${esc(r.range.group)}</h2>${periodBreakdown(r,"payments")}</div>`}

  function reportCalendar(r){
    const month=r.range.calendar_month||state.reportCalendarMonth;const first=new Date(`${month}-01T00:00:00Z`),days=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate(),offset=(first.getUTCDay()+6)%7,map=new Map((r.calendar||[]).map(x=>[x.date,x]));let cells='';
    for(let i=0;i<offset;i++)cells+='<div class="calendar-cell blank"></div>';
    for(let day=1;day<=days;day++){const key=`${month}-${String(day).padStart(2,'0')}`,x=map.get(key)||{};cells+=`<div class="calendar-cell ${x.orders||x.collected||x.delivered||x.payments_received?'has-data':''}"><div class="calendar-day">${day}</div><div class="calendar-stat"><span>C</span><b>${x.collected||0}</b></div><div class="calendar-stat"><span>D</span><b>${x.delivered||0}</b></div><div class="calendar-income">${x.payments_received?reportMoney(x.payments_received):'—'}</div></div>`}
    return `<div class="report-section"><div class="report-section-head"><div><div class="kicker">Daily operations</div><h2>Calendar</h2><p class="small muted">C = Collected · D = Delivered · amount = payments received (all methods).</p></div></div><div class="calendar-weekdays">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${cells}</div></div>`;
  }

  async function loadReports(show=true){
    if(!state.token)return;
    const request=++state.reportRequest, range=reportRange(), calendar=state.reportTab==="calendar";
    const queryRange=calendar?{from:state.reportCalendarMonth+"-01",to:dateKey(monthEnd(new Date(state.reportCalendarMonth+"-01T00:00:00Z")))}:range;
    state.reportLoading=true;state.reportData=null;state.reportError="";
    if(show&&state.view==="reports")renderApp();
    try{
      const qs=new URLSearchParams({from:queryRange.from,to:queryRange.to,group:calendar?"day":state.reportGroup,calendar_month:state.reportCalendarMonth,currency:state.reportCurrency});
      const result=await api(`/reports?${qs.toString()}`);
      if(request!==state.reportRequest)return;
      if(!result.period||!result.current||!result.range)throw new Error("Invalid report response");
      state.reportCurrency=result.report_currency||currencyCode();state.reportCurrencies=result.available_currencies||[state.reportCurrency];state.reportData=result;state.reportData.loadedRange={...queryRange,label:calendar?"Calendar":range.label};
    }catch(e){if(request===state.reportRequest){state.reportError=e.message||"Unable to load report";state.reportData=null;}}
    finally{if(request===state.reportRequest){state.reportLoading=false;if(state.view==="reports"&&state.data&&state.token)renderApp()}}
  }

  function salesRows(r){return (r.series||[]).map(x=>[x.key,x.orders||0,x.pieces||0,x.subtotal||0,x.discount_amount||0,x.tax_amount||0,x.sales||0,x.payments_received||0])}
  const SALES_HEADERS=["Period","Orders","Pieces","Gross rates","Discount","Recorded tax","Billed sales","Received"];
  const SALES_CHART_METRICS={sales:"Billed sales",payments_received:"Payments received",orders:"Orders",pieces:"Garments"};
  function salesChartRows(r){
    const group=r.range?.group||state.reportGroup,range=r.loadedRange||r.range,values=new Map((r.series||[]).map(x=>[x.key,x]));
    let d=new Date(range.from+"T00:00:00Z"),end=new Date(range.to+"T00:00:00Z");
    if(!Number.isFinite(+d)||!Number.isFinite(+end))return r.series||[];
    if(group==="week")d=addDays(d,1-(d.getUTCDay()||7));
    if(group==="month")d.setUTCDate(1);if(group==="year")d.setUTCMonth(0,1);
    const rows=[];while(d<=end){if(rows.length>=1500)return null;const k=dateKey(d).slice(0,group==="year"?4:group==="month"?7:10);rows.push(values.get(k)||{key:k});if(group==="year")d.setUTCFullYear(d.getUTCFullYear()+1);else if(group==="month")d.setUTCMonth(d.getUTCMonth()+1);else d=addDays(d,group==="week"?7:1);}
    return rows;
  }
  function salesChartSVG(r){
    const rows=salesChartRows(r);if(!rows?.length)return "";
    const kind=state.salesChartType,metric=state.salesChartMetric,unit=["sales","payments_received"].includes(metric)?reportCurrencyCode():"count";
    const values=rows.map(x=>Number(x[metric]||0)),max=Math.max(1,...values),min=Math.min(0,...values),span=max-min;
    const w=Math.max(320,Math.min(12000,Math.max(Math.min(1180,document.documentElement.clientWidth-90),rows.length*52+100))),h=300,left=76,right=20,top=64,bottom=248,plotW=w-left-right,step=plotW/rows.length;
    const y=v=>top+(max-v)/span*(bottom-top),x=i=>left+(i+.5)*step,base=y(0),dark=state.mode==="graphite",ink=dark?"#dce4ee":"#334155",grid=dark?"#424c58":"#e1e7ee",bg=dark?"#20252c":"#ffffff",accent=dark?"#91b9e9":"#5179a6";
    const round=v=>Number(v.toFixed(2)),n=v=>Number(v.toFixed(2)).toLocaleString("en-US",{maximumFractionDigits:2}),full=(v)=>unit==="count"?n(v):unit+" "+Number(v).toFixed(2);
    const points=values.map((v,i)=>`${round(x(i))},${round(y(v))}`).join(" "),skip=Math.max(1,Math.ceil(rows.length/Math.max(4,Math.floor(plotW/100))));
    const ticks=Array.from({length:5},(_,i)=>{const v=max-span*i/4;return `<line x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}" stroke="${grid}"/><text x="${left-9}" y="${y(v)+4}" text-anchor="end" font-size="11">${esc(n(v))}</text>`}).join("");
    const marks=kind==="bar"?values.map((v,i)=>`<rect x="${round(x(i)-Math.min(48,step*.66)/2)}" y="${round(Math.min(base,y(v)))}" width="${round(Math.min(48,step*.66))}" height="${round(Math.max(v===0?1:0,Math.abs(y(v)-base)))}" rx="2" fill="${accent}"><title>${esc(rows[i].key)}: ${esc(full(v))}</title></rect>`).join(""):`${kind==="area"?`<polygon points="${round(x(0))},${round(base)} ${points} ${round(x(values.length-1))},${round(base)}" fill="${accent}" opacity=".19"/>`:""}<polyline points="${points}" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linejoin="round"/>${values.map((v,i)=>`<circle cx="${round(x(i))}" cy="${round(y(v))}" r="${rows.length>150?1.4:3.5}" fill="${accent}"><title>${esc(rows[i].key)}: ${esc(full(v))}</title></circle>`).join("")}`;
    const labels=rows.map((r,i)=>i%skip===0||i===rows.length-1&&i%skip>skip/2?`<text x="${round(x(i))}" y="269" font-size="11" text-anchor="middle">${esc(r.key)}</text>`:"").join("");
    const range=r.loadedRange||r.range;return `<svg id="salesChartSvg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(SALES_CHART_METRICS[metric])} ${kind} chart" font-family="Arial,sans-serif" fill="${ink}"><rect width="100%" height="100%" fill="${bg}"/><text x="20" y="25" font-size="17" font-weight="700">${esc(SALES_CHART_METRICS[metric])} · ${esc(unit)}</text><text x="20" y="43" font-size="11">${esc(range.from)} to ${esc(range.to)} · by ${esc(r.range.group||state.reportGroup)}</text>${ticks}<line x1="${left}" x2="${w-right}" y1="${base}" y2="${base}" stroke="${ink}" stroke-opacity=".45"/>${marks}${labels}</svg>`;
  }
  function salesChart(r){const svg=salesChartSVG(r);return `<section class="card sales-chart-card"><div class="sales-chart-controls"><div class="sales-chart-heading"><h2>Sales chart</h2><span class="small muted">Selected period · ${esc(reportCurrencyCode())}</span></div><div class="sales-chart-tools"><label class="chart-metric-label">Measure<select id="salesChartMetric">${Object.entries(SALES_CHART_METRICS).map(([k,v])=>`<option value="${k}" ${state.salesChartMetric===k?'selected':''}>${v}</option>`).join("")}</select></label><div class="chart-types" role="group" aria-label="Chart type">${["bar","line","area"].map(t=>`<button type="button" class="chip ${state.salesChartType===t?'active':''}" data-chart-type="${t}" aria-pressed="${state.salesChartType===t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join("")}</div></div></div>${svg?`<div class="sales-chart-scroll">${svg}</div><div class="chart-downloads"><button class="btn smallbtn" data-action="chart-png">${icon("download","sm")} PNG</button><button class="btn smallbtn" data-action="chart-svg">${icon("download","sm")} SVG</button><span class="small muted">Download selected chart</span></div>`:`<div class="empty">Choose a larger grouping (week, month or year) to display this date range.</div>`}</section>`}
  function saveChartBlob(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
  async function downloadSalesChart(format){const svg=document.getElementById("salesChartSvg");if(!svg)return toast("No chart available",true);const src=new XMLSerializer().serializeToString(svg),blob=new Blob([src],{type:"image/svg+xml;charset=utf-8"}),filename=reportFilename(format).replace(/\.(png|svg)$/i,`-${state.salesChartMetric}-${state.salesChartType}.$1`);if(format==="svg"){saveChartBlob(blob,filename);return}const url=URL.createObjectURL(blob);try{const img=new Image();await new Promise((ok,fail)=>{img.onload=ok;img.onerror=()=>fail(new Error("Unable to render chart"));img.src=url});const canvas=document.createElement("canvas"),scale=Math.min(2,12000/img.naturalWidth);canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);const png=await new Promise(ok=>canvas.toBlob(ok,"image/png"));if(!png)throw new Error("Unable to create PNG");saveChartBlob(png,filename)}catch(e){toast(e.message,true)}finally{URL.revokeObjectURL(url)}}
  const SALES_VIEWS={summary:"Sales Summary",chart:"Sales Chart",period:"Sales by Period"};
  function salesViewTabs(){return `<div class="sales-view-tabs" role="group" aria-label="Sales view">${Object.entries(SALES_VIEWS).map(([k,v])=>`<button type="button" class="sales-view-tab ${state.salesView===k?'active':''}" data-sales-view="${k}" aria-pressed="${state.salesView===k}">${v}</button>`).join("")}</div>`}
  function salesGroupControls(){return `<div class="sales-group-controls"><span class="small muted">Group by</span><div class="sales-group-chips" role="group" aria-label="Sales grouping">${["day","week","month","year"].map(g=>`<button type="button" class="chip ${state.reportGroup===g?'active':''}" data-sales-group="${g}" aria-pressed="${state.reportGroup===g}">${g[0].toUpperCase()+g.slice(1)}</button>`).join("")}</div></div>`}
  function salesSummary(r){const p=r.period;return `<div class="report-section"><div class="report-section-head"><h2>Sales summary</h2><span class="report-note">Order date · payments by receipt date</span></div><div class="grid metrics report-metrics">${metric("Billed sales",reportMoney(p.sales),true)}${metric("Discounts",reportMoney(p.discount_amount))}${metric("Recorded tax",reportMoney(p.tax_amount))}${metric("Payments received",reportMoney(p.payments_received))}${metric("Orders",p.orders)}${metric("Pieces",p.pieces)}</div><p class="small muted">Billed sales include tax; advance receipts are not sales. Historical orders without tax snapshots may have unrecorded tax.</p></div>`}
  function salesPeriod(r){return `<div class="report-section"><h2>Sales by ${esc(r.range.group||state.reportGroup)}</h2>${r.series?.length?`<div class="table-wrap report-table"><table><thead><tr>${SALES_HEADERS.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${salesRows(r).map(row=>`<tr>${row.map((v,i)=>`<td>${i>=3?reportMoney(v):esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`:`<div class="empty">No sales or payment activity in this period.</div>`}</div>`}
  function reportSales(r){return state.salesView==="chart"?salesChart(r):state.salesView==="period"?salesPeriod(r):salesSummary(r)}

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
  function ensureXLSX(){if(window.XLSX)return Promise.resolve();if(!xlsxLoader)xlsxLoader=loadScriptFallback(["https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js","https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"],()=>!!window.XLSX,"Excel export library").catch(e=>{xlsxLoader=null;throw e});return xlsxLoader}
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
  function reportFilename(ext){const r=state.reportData?.loadedRange||reportRange(),tab=(state.reportTab==="sales"?"sales-"+state.salesView:state.reportTab||"overview").replace(/[^a-z0-9]+/gi,"-");return `Laundry-Desk-${tab}-${r.from}-to-${r.to}.${ext}`}
  function reportExportModel(){const r=state.reportData,role=state.data.actor.role,range=r?.loadedRange||reportRange();if(!r||state.reportLoading||state.reportError)return null;const sections=[];if(state.reportTab==="sales"){if(state.salesView==="summary")sections.push({title:"Sales summary (order date)",headers:["Metric",reportCurrencyCode()],rows:[["Billed sales",r.period.sales],["Discounts",r.period.discount_amount],["Recorded tax",r.period.tax_amount],["Payments received",r.period.payments_received],["Orders",r.period.orders],["Pieces",r.period.pieces]]});else if(state.salesView==="chart"){const k=state.salesChartMetric,rows=salesChartRows(r)||r.series||[];sections.push({title:"Sales chart data - "+SALES_CHART_METRICS[k],headers:["Period",SALES_CHART_METRICS[k]],rows:rows.map(x=>[x.key,Number(x[k]||0)])})}else sections.push({title:"Sales by "+r.range.group,headers:SALES_HEADERS,rows:salesRows(r)})}else if(state.reportTab==="customers"){sections.push({title:"Customer-wise business",headers:["Customer","Code","Orders","Pieces","Sales","Received","Outstanding","Credit","Net position"],rows:(r.customers||[]).map(c=>[c.name,c.customer_code,c.orders,c.pieces,c.sales,c.payments_received,c.outstanding,c.credit,c.net_position])})}else if(state.reportTab==="operations"){sections.push({title:"Current quick workflow",headers:["Stage","Count"],rows:workflowStages().filter(x=>x.code!=="delivered"&&(x.active!==false||r.current?.quick_stage_counts?.[x.code])).map(x=>[x.name,r.current?.quick_stage_counts?.[x.code]||0])});sections.push({title:"Operational exceptions",headers:["Metric","Count"],rows:[["Collected in period",r.period?.collected||0],["Delivered in period",r.period?.delivered||0],["Collected >12h",r.current?.aging?.collected_over_12h||0],["In progress >48h",r.current?.aging?.in_progress_over_48h||0],["Ready >24h",r.current?.aging?.ready_over_24h||0]]});sections.push({title:"Detailed stage counts (current)",headers:["Stage","Count"],rows:STAGES.map(([k,l])=>[l,r.current?.detailed_stage_counts?.[k]||0])});sections.push({title:"Workflow activity by "+r.range.group,headers:["Period","Collected","Delivered"],rows:(r.series||[]).map(x=>[x.key,x.collected||0,x.delivered||0])})}else if(state.reportTab==="payments"){sections.push({title:"Payment summary",headers:["Metric",reportCurrencyCode()],rows:[[role==="delivery"?"Collected by me":"Payments received",r.period?.payments_received||0],["Outstanding now",r.current?.outstanding||0],["Customer credit",r.current?.customer_credit??"—"],["Credit added",r.period?.credit_added??"—"],["Credit applied",r.period?.credit_applied??"—"]]});sections.push({title:"By method",headers:["Method",reportCurrencyCode()],rows:Object.entries(r.breakdowns?.payment_method||{})});sections.push({title:"By collection point",headers:["Point",reportCurrencyCode()],rows:Object.entries(r.breakdowns?.payment_context||{})});sections.push({title:"Receipts by "+r.range.group,headers:["Period","Payments received"],rows:(r.series||[]).map(x=>[x.key,x.payments_received||0])})}else if(state.reportTab==="calendar"){sections.push({title:`Calendar ${r.range?.calendar_month||state.reportCalendarMonth}`,headers:["Date","Orders","Pieces","Sales","Received","Collected","Delivered"],rows:(r.calendar||[]).map(x=>[x.date,x.orders||0,x.pieces||0,x.sales||0,x.payments_received||0,x.collected||0,x.delivered||0])})}else{sections.push({title:"Period activity",headers:["Metric","Value"],rows:[["Orders",r.period?.orders||0],["Pieces",r.period?.pieces||0],["Sales",r.period?.sales||0],["Payments received",r.period?.payments_received||0],["Collected",r.period?.collected||0],["Delivered",r.period?.delivered||0],["Average order value",r.period?.avg_order_value||0]]});sections.push({title:"Current position",headers:["Metric","Value"],rows:[["Active orders",r.current?.active_orders||0],["Outstanding",r.current?.outstanding||0],["Customer credit",r.current?.customer_credit??"—"],["In progress",r.current?.quick_stage_counts?.in_progress||0],["Ready",r.current?.quick_stage_counts?.ready||0]]});sections.push({title:"Trend",headers:["Period","Orders","Pieces","Sales","Received","Collected","Delivered"],rows:(r.series||[]).map(x=>[x.key,x.orders,x.pieces,x.sales,x.payments_received,x.collected,x.delivered])})}if(r.warnings?.length)sections.push({title:"Report notes",headers:["Note"],rows:r.warnings.map(x=>[x])});return {title:`${business().name||"Laundry Desk"} — ${state.reportTab==="sales"?SALES_VIEWS[state.salesView]:state.reportTab||"Overview"} report`,subtitle:`${range.label} · ${range.from} to ${range.to} · ${reportCurrencyCode()}`,sections}}
  async function exportExcel(trigger){const model=reportExportModel();if(!model)return toast("Load a report first",true);const filename=reportFilename("xlsx");try{setBusy(true,trigger,"Preparing Excel…");await ensureXLSX();const wb=XLSX.utils.book_new();for(const sec of model.sections){const data=[[sec.title],[model.subtitle],[],sec.headers,...sec.rows];const ws=XLSX.utils.aoa_to_sheet(data);XLSX.utils.book_append_sheet(wb,ws,sec.title.slice(0,31).replace(/[\/:?*\[\]]/g," ")||"Report")}XLSX.writeFile(wb,filename);toast("Excel downloaded")}catch(e){toast(e.message,true)}finally{setBusy(false)}}
  async function exportPDF(trigger){const model=reportExportModel();if(!model)return toast("Load a report first",true);const filename=reportFilename("pdf");try{setBusy(true,trigger,"Preparing PDF…");await ensurePDF();const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});let y=42;doc.setFontSize(16);doc.text(model.title,40,y);y+=20;doc.setFontSize(9);doc.text(model.subtitle,40,y);y+=16;for(const sec of model.sections){if(y>500){doc.addPage();y=42}doc.setFontSize(11);doc.text(sec.title,40,y);y+=8;doc.autoTable({startY:y,head:[sec.headers],body:sec.rows,styles:{fontSize:7,cellPadding:3},headStyles:{fillColor:[45,48,52]},margin:{left:40,right:40}});y=(doc.lastAutoTable?.finalY||y)+20}doc.save(filename);toast("PDF downloaded")}catch(e){console.error("PDF export failed",e);toast(e?.message||"Could not create PDF. Please try again.",true)}finally{setBusy(false)}}

  function reportsView(){
    const role=state.data.actor.role,tabs=reportTabs(role),range=state.reportData?.loadedRange||reportRange();if(!tabs.some(([k])=>k===state.reportTab))state.reportTab=tabs[0][0];
    const content=state.reportLoading?reportLoading():state.reportError?`<div class="empty" role="alert">${esc(state.reportError)} <button class="btn smallbtn" data-report-retry>Retry</button></div>`:!state.reportData?`<div class="empty">Choose a period to load reports.</div>`:state.reportTab==="sales"?reportSales(state.reportData):state.reportTab==="customers"?reportCustomers(state.reportData):state.reportTab==="operations"?reportOperations(state.reportData):state.reportTab==="payments"?reportPayments(state.reportData):state.reportTab==="calendar"?reportCalendar(state.reportData):reportOverview(state.reportData);
    const exports=state.reportData&&!state.reportLoading?`<button class="btn smallbtn" data-action="export-excel">${icon("download","sm")}Excel</button><button class="btn smallbtn" data-action="export-pdf">${icon("download","sm")}PDF</button>`:"";
    return `${titleBlock(role==="customer"?"My data":role==="delivery"?"My activity":"Business intelligence","Reports",state.reportTab==="calendar"?esc(state.reportCalendarMonth):`${range.label} · ${range.from} to ${range.to}`,exports)}<div class="tabs report-tabs">${tabs.map(([k,l])=>`<button class="tab ${state.reportTab===k?'active':''}" data-report-tab="${k}">${l}</button>`).join("")}</div>${state.reportTab==="sales"?salesViewTabs():""}${reportControls()}${state.reportTab==="sales"&&state.salesView!=="summary"?salesGroupControls():""}<div id="reportPanel">${state.reportData?.warnings?.length?`<div class="report-warning" role="status">${state.reportData.warnings.map(w=>`<div>${esc(w)}</div>`).join("")}</div>`:""}${content}</div>`;
  }

  function adminView(){
    const superUser=state.data.actor.role==="super_admin";
    const tabs=[...[ ["business","Business"],["staff","Staff"],["customers","Customers"],["rates","Rates"],["catalog","Catalog"],["discounts","Discounts"],["system","System"] ],...(superUser?[["super","Config"]]:[])];
    if(!tabs.some(([k])=>k===state.adminTab))state.adminTab="business";
    const render=state.adminTab==="super"?adminSuper():state.adminTab==="staff"?adminStaff():state.adminTab==="customers"?adminCustomers():state.adminTab==="rates"?adminRates():state.adminTab==="catalog"?adminCatalog():state.adminTab==="discounts"?adminDiscounts():state.adminTab==="system"?adminSystem():adminBusiness();
    return `${titleBlock("Control room","Setup",superUser?"Business setup and protected configuration.":"Organization, accounts, catalog, rates and demo controls.")}
      <div class="tabs">${tabs.map(([k,l])=>`<button class="tab ${state.adminTab===k?'active':''}" data-admin-tab="${k}">${l}</button>`).join("")}</div>
      <div id="adminPanel">${render}</div>`;
  }

  function adminBusiness(){const b=business();return `<div class="grid cards"><form id="businessForm" class="card stack"><div><div class="kicker">Organization</div><h2>Business identity</h2><p class="small muted">Used in the app header, receipts and printable labels.</p></div><label>Organization name<input class="input" name="name" value="${esc(b.name||'')}" required maxlength="120"></label><label>Address<textarea name="address" required placeholder="Building, street, area, Dubai, UAE">${esc(b.address||'')}</textarea></label><label>Phone <span class="muted">optional</span><input class="input" name="phone" value="${esc(b.phone||'')}" placeholder="+971..."></label><button class="btn primary">SAVE ORGANIZATION →</button></form><div class="card stack"><div><div class="kicker">Preview</div><h2>${esc(b.name||'Laundry Desk')}</h2><p class="sub">${esc(b.address||'Add the billing address')}</p>${b.phone?`<p class="small">${esc(b.phone)}</p>`:''}</div><div class="business-preview-mark">${esc((b.name||'L').trim().charAt(0).toUpperCase())}</div><p class="small muted">Changes are shared across all staff and customers after their next refresh.</p></div></div>`}
  function adminWorkflow(){const w=workflowSettings();return `<form id="workflowSettingsForm" class="card stack workflow-settings-card"><div><div class="kicker">Quick flow</div><h2>Stage behavior</h2><p class="small muted">Users can move directly to any later quick stage: Requested · Collected · Received · In Progress · Ready · Delivered.</p></div><label class="toggle-row"><span><b>Confirm stage changes</b><small>When off, tapping a later stage updates immediately. When on, every quick-stage change asks for confirmation.</small></span><input type="checkbox" name="confirm_stage_changes" ${w.confirm_stage_changes?'checked':''}></label><div class="workflow-example"><span>Requested</span><span>Collected</span><span>Received</span><span>In Progress</span><span>Ready</span><span>Delivered</span></div><button class="btn primary">SAVE WORKFLOW SETTING →</button></form>`}

  function adminStaff(){const p=platformSettings(),active=state.data.staff.filter(x=>x.active).length,limit=Number(p.max_user_count||10),full=active>=limit;return `<div class="row between staff-head"><div><h2>Staff</h2><p class="small muted">${active} / ${limit} active users</p></div><button class="btn primary" data-action="new-staff" ${full?'disabled title="Maximum user count reached"':''}>+ Staff</button></div>${full?`<div class="limit-note">User limit reached. Disable an existing user or ask Super Admin to increase the maximum.</div>`:""}<div class="list">${state.data.staff.map(s=>`<div class="list-row"><div class="row between"><div><b>${esc(s.display_name)}</b><div class="small mono muted">${esc(s.login_id)} · ${roleName(s.role)}</div></div><span class="badge ${s.active?'paid':'unpaid'}">${s.active?'active':'disabled'}</span></div>${s.role==="super_admin"&&state.data.actor.role!=="super_admin"?`<span class="small muted">Protected</span>`:`<button class="btn smallbtn" data-action="edit-staff" data-id="${s.id}">Edit</button>`}</div>`).join("")}</div>`}

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
    return `<div class="customer-summary-line"><b>${rows.length} / ${all.length} customers</b><span>Route-ready by building & door</span></div>
      <div class="customer-command-row">${customerQuickAdd()}<div class="customer-tools"><label><span>Building</span><select id="customerBuildingFilter"><option value="all">All buildings</option>${buildings.map(x=>`<option value="${esc(x)}" ${state.customerBuildingFilter===x?'selected':''}>${esc(x)}</option>`).join("")}</select></label><label><span>Sort</span><select id="customerSort"><option value="building" ${state.customerSort==='building'?'selected':''}>Building + Door</option><option value="name" ${state.customerSort==='name'?'selected':''}>Customer A–Z</option><option value="newest" ${state.customerSort==='newest'?'selected':''}>Newest</option><option value="oldest" ${state.customerSort==='oldest'?'selected':''}>Oldest</option></select></label></div></div>
      <div class="table-wrap compact-table"><table class="customer-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Building / Block</th><th>Door</th><th>Area</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(c=>`<tr><td><b>${esc(c.name)}</b><div class="small mono muted">${esc(c.customer_code)}</div></td><td class="mono">${esc(c.mobile)}</td><td>${esc(c.building_block||'—')}</td><td>${esc(c.door_no||'—')}</td><td>${esc(c.address||'—')}</td><td><span class="badge ${c.access_enabled?'paid':'unpaid'}">${c.access_enabled?'active':'disabled'}</span></td><td><div class="row compact-actions"><button class="btn smallbtn" data-action="customer-account" data-id="${c.id}">${icon("wallet","sm")}Account</button><button class="btn smallbtn" data-action="edit-customer" data-id="${c.id}">Edit</button>${adminMode?`<button class="btn smallbtn" data-action="toggle-customer" data-id="${c.id}" data-enabled="${c.access_enabled}">${c.access_enabled?'Disable':'Enable'}</button><button class="btn smallbtn" data-action="reset-customer" data-id="${c.id}">Reset code</button>`:''}</div></td></tr>`).join("")||`<tr><td colspan="7"><div class="empty compact-empty">No customers in this building/block.</div></td></tr>`}</tbody></table></div>`}
  function managerCustomersView(){return `${titleBlock("Customers","Customers","Add, search and route customers")}${customerDirectory(false)}`}
  function countryPreset(code){const r=COUNTRY_PRESETS.find(x=>x[0]===code);if(!r)return null;return {code:r[0],name:r[1],timezone:r[2],currency:r[3]}}
  function countrySearchResults(term){const q=String(term||"").trim().toLowerCase();return COUNTRY_PRESETS.filter(x=>!q||x[0].toLowerCase().includes(q)||x[1].toLowerCase().includes(q)).slice(0,10)}
  function countryPicker(p){return `<div class="country-picker" data-country-picker><input type="hidden" name="country_code" value="${esc(p.country_code||'AE')}" data-country-code><input type="hidden" name="country_name" value="${esc(p.country_name||'United Arab Emirates')}" data-country-name><label><span class="field-label">Country</span><input class="input" id="countrySearch" value="${esc(p.country_name||'United Arab Emirates')}" autocomplete="off" placeholder="Search country" data-country-search></label><div class="country-results" data-country-results></div></div>`}
  function taxFields(p){const gst=String(p.tax_type||"VAT").toUpperCase()==="GST";return `<input type="hidden" name="tax_type" value="${gst?'GST':'VAT'}" data-tax-type><div class="tax-vat-fields ${gst?'hidden':''}" data-tax-vat><label><span class="field-label">VAT %</span><input class="input" name="vat_percent" type="number" min="0" step="0.01" value="${Number(p.vat_percent||0)}"></label></div><div class="tax-gst-fields ${gst?'':'hidden'}" data-tax-gst><label><span class="field-label">CGST %</span><input class="input" name="cgst_percent" type="number" min="0" step="0.01" value="${Number(p.cgst_percent||0)}"></label><label><span class="field-label">SGST %</span><input class="input" name="sgst_percent" type="number" min="0" step="0.01" value="${Number(p.sgst_percent||0)}"></label></div>`}
  function stageConfigRows(){return workflowStages().map((x,i)=>`<div class="super-stage-row" data-stage-row data-code="${esc(x.code)}"><button type="button" class="stage-order-btn" data-stage-move="up" ${i===0?'disabled':''}>↑</button><button type="button" class="stage-order-btn" data-stage-move="down" ${i===workflowStages().length-1?'disabled':''}>↓</button><div class="super-stage-name"><input class="input" data-stage-name value="${esc(x.name)}" ${x.system?'readonly':''}><small>${x.system?'System stage':'Custom stage'}</small></div><label class="stage-toggle"><input type="checkbox" data-stage-active ${x.active!==false?'checked':''}><span>${x.active!==false?'On':'Off'}</span></label>${x.system?'<span class="stage-lock">System</span>':'<button type="button" class="btn tiny danger" data-stage-remove>Remove</button>'}</div>`).join("")}
  function adminSuper(){
    if(state.data.actor.role!=="super_admin")return `<div class="empty">Super Admin only.</div>`;
    if(!state.data.actor.super_admin_unlocked)return `<form id="superUnlockForm" class="card stack super-unlock"><div class="super-shield">${icon("settings")}</div><div><div class="kicker">Protected settings</div><h2>Unlock Config</h2><p class="small muted">Use your device time (${esc(Intl.DateTimeFormat().resolvedOptions().timeZone||platformSettings().timezone)}). Use the 24-hour hour followed by the minute plus your configured offset (two digits each).</p></div><label><span class="field-label">Pass code</span><input class="input mono super-passcode" name="passcode" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required autocomplete="off" placeholder="••••"></label><button class="btn primary">UNLOCK →</button></form>`;
    const p=platformSettings(),w=workflowSettings(),active=state.data.staff.filter(x=>x.active).length;
    return `<div class="super-grid"><form id="superPlatformForm" class="card stack super-card"><div><div class="kicker">Platform</div><h2>Platform configuration</h2><p class="small muted">Country suggests defaults. Timezone and currency stay editable.</p></div>${countryPicker(p)}<div class="super-inline-fields"><label><span class="field-label">Timezone</span><input class="input" name="timezone" value="${esc(p.timezone||'Asia/Dubai')}" required></label><label><span class="field-label">Currency</span><input class="input mono" name="currency" maxlength="3" value="${esc(p.currency||'AED')}" required></label></div><div class="super-inline-fields"><label><span class="field-label">Max active users</span><input class="input" name="max_user_count" type="number" min="1" max="9999" value="${Number(p.max_user_count||10)}" required><small>${active} active now</small></label>${taxFields(p)}</div><label><span class="field-label">Time passcode offset</span><input class="input mono" name="unlock_minute_offset" type="number" min="0" max="40" step="1" value="${Number(p.unlock_minute_offset??10)}" required><small>0 = HHMM. Default 10 = HH followed by (minute + 10). Applies to the next unlock.</small></label><label class="toggle-row compact-toggle"><span><b>Rates include tax</b><small>On: rates already include tax. Off: tax is added on top for newly priced/repriced orders. Existing orders are not changed retroactively.</small></span><input type="checkbox" name="tax_inclusive" ${p.tax_inclusive!==false?'checked':''}></label><button class="btn primary">SAVE PLATFORM →</button></form><form id="superWorkflowForm" class="card stack super-card"><div><div class="kicker">Quick flow</div><h2>Stages</h2><p class="small muted">Disable stages or add custom milestones. Detailed washing/ironing logic remains intact.</p></div><label class="toggle-row compact-toggle"><span><b>Confirm stage changes</b><small>Off by default.</small></span><input type="checkbox" name="confirm_stage_changes" ${w.confirm_stage_changes?'checked':''}></label><div class="super-stage-list" id="superStageList">${stageConfigRows()}</div><div class="super-add-stage"><input class="input" id="newStageName" placeholder="New stage name"><button type="button" class="btn" data-action="super-add-stage">+ Add stage</button></div><button class="btn primary">SAVE STAGES →</button></form></div>`;
  }

  function adminCustomers(){return customerDirectory(true)}
  function adminRates(){const garments=state.data.refs.garments.filter(x=>x.active),services=state.data.refs.services.filter(x=>x.active),g=new Map(state.data.refs.garments.map(x=>[x.id,x.name])),s=new Map(state.data.refs.services.map(x=>[x.id,x.name])),today=new Date().toISOString().slice(0,10);return `<div class="section-head compact-head"><div><h2>Rates</h2><p class="small muted">Add at the top. Edit price and effective date directly in the grid.</p></div></div><div class="table-wrap rate-editor"><table><thead><tr><th>Garment</th><th>Service</th><th>${esc(currencyCode())}</th><th>Effective from</th><th></th></tr></thead><tbody><tr class="quick-add-row"><td><select id="quickRateGarment">${garments.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></td><td><select id="quickRateService">${services.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></td><td><input id="quickRatePrice" class="input inline-input money" type="number" min="0" step="0.01" placeholder="0.00"></td><td><input id="quickRateDate" class="input inline-input" type="date" value="${today}"></td><td><button class="btn primary smallbtn" data-action="quick-save-rate">+ Add</button></td></tr>${state.data.refs.rates.filter(r=>r.active).map(r=>`<tr data-rate-row="${r.id}"><td><b>${esc(g.get(r.garment_type_id)||"")}</b></td><td>${esc(s.get(r.service_id)||"")}</td><td><input class="input inline-input money" data-rate-price value="${Number(r.unit_price).toFixed(2)}" type="number" min="0" step="0.01"></td><td><input class="input inline-input" data-rate-date value="${r.effective_from}" type="date"></td><td><button class="btn smallbtn" data-action="save-rate-row" data-id="${r.id}" data-garment="${r.garment_type_id}" data-service="${r.service_id}">Save</button></td></tr>`).join("")}</tbody></table></div>`}
  function adminCatalog(){return `<div class="grid cards"><div class="card"><div class="row between"><h2>Garments</h2><button class="btn smallbtn primary" data-action="new-garment">+ Add</button></div><div class="list">${state.data.refs.garments.map(g=>`<div class="list-row"><div class="row between"><div><b>${esc(g.name)}</b><div class="small mono muted">${esc(g.code)}</div></div><span class="badge ${g.active?'paid':'unpaid'}">${g.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-garment" data-id="${g.id}">Edit</button></div>`).join("")}</div></div><div class="card"><div class="row between"><h2>Services</h2><button class="btn smallbtn primary" data-action="new-service">+ Add</button></div><div class="list">${state.data.refs.services.map(s=>`<div class="list-row"><div class="row between"><div><b>${esc(s.name)}</b><div class="small mono muted">${esc(s.workflow)}</div></div><span class="badge ${s.active?'paid':'unpaid'}">${s.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-service" data-id="${s.id}">Edit</button></div>`).join("")}</div></div></div>`}
  function adminDiscounts(){return `<div class="row between"><h2>Discounts</h2><button class="btn primary" data-action="new-discount">+ Discount</button></div><div class="list">${state.data.refs.discounts.map(d=>`<div class="list-row"><div class="row between"><div><b>${esc(d.name)}</b><div class="small muted">${d.discount_type==='percent'?d.value+'%':fmt(d.value)}</div></div><span class="badge ${d.active?'paid':'unpaid'}">${d.active?'active':'off'}</span></div><button class="btn smallbtn" data-action="edit-discount" data-id="${d.id}">Edit</button></div>`).join("")}</div>`}

  const QUICK_ORDER=["pickup_requested","collected","received","in_progress","ready","delivered"];
  function stageRank(code){return QUICK_ORDER.indexOf(quickStageKey(code))}
  function stageBar(order,mode=state.workflowMode){
    const physical=order.laundry_status,current=orderQuickStage(order),rawTags=new Set(order.tagged_stages||[]);rawTags.add(physical);
    const stages=workflowStages(),currentIdx=stages.findIndex(x=>x.code===current),role=state.data.actor.role,canChange=isOpsManager(role)&&physical!=="delivered";
    const quickTags=new Set([...rawTags].map(quickStageKey));quickTags.add(current);
    // Only actually recorded stages receive a tick. Skipped stages stay neutral.
    const chip=(code,label,applied,tagged,earlier,actionable=false)=>{const cls=applied?"applied":tagged?"done":earlier?"skipped":"future",inner=`<span class="stage-check" aria-hidden="true">✓</span><span>${esc(label)}</span>`;return actionable?`<button type="button" class="stage ${cls}" data-action="set-quick-stage" data-id="${esc(order.id)}" data-status="${esc(code)}" title="Move to ${esc(label)}">${inner}</button>`:`<span class="stage ${cls}" ${applied?'aria-current="step"':''} title="${applied?'Current stage':tagged?'Recorded stage':earlier?'Not tagged':'Not reached'}">${inner}</span>`};
    let html="";
    if(mode==="quick"){
      let visible=stages.filter(x=>x.active!==false||x.code===current);if(!visible.some(x=>x.code===current)){const fallback=DEFAULT_QUICK_STAGES.find(x=>x.code===current);if(fallback)visible=[...visible,fallback].sort((a,b)=>a.sort_order-b.sort_order)}
      html=visible.map(st=>{const i=stages.findIndex(x=>x.code===st.code),applied=st.code===current,rank=stageRank(st.system_status||st.code),earlier=rank<stageRank(physical)||(currentIdx>=0&&i>=0&&i<currentIdx),future=!applied&&!earlier&&rank>=stageRank(physical)&&(currentIdx<0||i>currentIdx);return chip(st.code,st.name,applied,quickTags.has(st.code),earlier,canChange&&future&&st.active!==false)}).join("");
    }else{
      const workflows=new Set((order.items||[]).map(i=>i.service?.workflow).filter(Boolean)),generic=[...workflows].some(w=>["dry_clean","custom"].includes(w));
      const visible=STAGES.filter(([k])=>{if(k===physical||rawTags.has(k))return true;if(order.channel==="counter"&&["pickup_requested","collected","out_for_delivery"].includes(k))return false;if(k==="processing")return generic||rawTags.has("in_progress");if(k==="washing")return !generic&&!(workflows.size===1&&workflows.has("iron_only"));if(k==="ironing")return !generic&&!(workflows.size===1&&workflows.has("wash_only"));return true});
      const idx=STAGES.findIndex(([k])=>k===physical);
      html=visible.map(([k,label])=>chip(k,label,k===physical,rawTags.has(k)||(k==="processing"&&rawTags.has("in_progress")),STAGES.findIndex(([s])=>s===k)<idx)).join("");
    }
    const label=mode==="quick"?(workflowStages().find(s=>s.code===current)?.name||stageLabel(current)):stageLabel(physical);
    return `<div class="stage-current-line"><span class="stage-current-dot"></span><b>Current: ${esc(label)}</b>${mode==="quick"&&physical==="out_for_delivery"?'<span>· Out for delivery</span>':mode==="detailed"&&current!==quickStageKey(physical)?`<span>· Quick: ${esc(workflowStages().find(x=>x.code===current)?.name||current)}</span>`:""}</div><div class="stagebar quick-stagebar synchronized-stages">${html}</div><div class="small muted quick-stage-note">${physical==="delivered"?'Delivered · workflow complete.':mode==="quick"&&canChange?'Tap any later stage.':'Recorded milestones only.'} Unchecked earlier stages were not tagged.</div>`;
  }

  async function setQuickStageAction(orderId,status,trigger){
    const o=state.data.orders.find(x=>x.id===orderId);if(!o)return;
    if(status!=="pickup_requested"&&!(o.items||[]).length){if(o.channel==="pickup")return openCollect(orderId);return toast("Add garments with services before changing the order stage",true)}
    const label=workflowStages().find(x=>x.code===status)?.name||quickStageLabel(status);
    if(workflowSettings().confirm_stage_changes&&!confirm(`Move ${o.order_no} to ${label}?`))return;
    try{setBusy(true,trigger,"Updating stage…");await api("/action",{method:"POST",body:{action:"set_quick_stage",order_id:orderId,target_status:status}});await refresh();openOrder(orderId);setTimeout(()=>{const applied=document.querySelector(".order-modal .quick-stagebar .stage.applied"),bar=applied?.closest(".quick-stagebar");if(applied&&bar)bar.scrollTo({left:Math.max(0,applied.offsetLeft-(bar.clientWidth-applied.offsetWidth)/2),behavior:"smooth"})},60);toast(`Moved to ${label}`)}catch(e){toast(e.message,true)}finally{setBusy(false)}
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

  function orderTaxDetail(o){const t=o?.tax_snapshot||{},amount=Number(o?.tax_amount||0);if(!(amount>0))return "";const inclusive=t.tax_inclusive!==false,cur=o.currency_code||currencyCode();if(String(t.tax_type||"VAT").toUpperCase()==="GST"){return `<div class="order-tax-summary"><span>${inclusive?'Included ':''}CGST ${Number(t.cgst_percent||0)}% · ${fmt(t.cgst_amount||0,cur)}</span><span>${inclusive?'Included ':''}SGST ${Number(t.sgst_percent||0)}% · ${fmt(t.sgst_amount||0,cur)}</span></div>`}return `<div class="order-tax-summary"><span>${inclusive?'Included ':''}VAT ${Number(t.vat_percent||0)}% · ${fmt(t.vat_amount||amount,cur)}</span></div>`}

  function printTaxLines(o){const t=o?.tax_snapshot||{},amount=Number(o?.tax_amount||0),cur=o.currency_code||currencyCode();if(!(amount>0))return "";if(String(t.tax_type||"VAT").toUpperCase()==="GST")return `<br>Taxable ${fmt(o.taxable_amount||0,cur)}<br>CGST ${Number(t.cgst_percent||0)}% ${fmt(t.cgst_amount||0,cur)}<br>SGST ${Number(t.sgst_percent||0)}% ${fmt(t.sgst_amount||0,cur)}`;return `<br>Taxable ${fmt(o.taxable_amount||0,cur)}<br>VAT ${Number(t.vat_percent||0)}% ${fmt(t.vat_amount||amount,cur)}`}

  function openOrder(orderId){
    const o=state.data.orders.find(x=>x.id===orderId); if(!o)return;
    const role=state.data.actor.role; let primary=""; const secondary=[];
    if(role==="delivery" && o.laundry_status==="pickup_requested" && o.pickup_driver_id===state.data.actor.id) primary=`<button class="order-next-action" data-action="collect" data-id="${o.id}"><span class="next-copy"><small>Next action</small><b>Collect garments</b></span>${icon("arrow")}</button>`;
    if(role==="delivery" && o.laundry_status==="out_for_delivery" && o.delivery_driver_id===state.data.actor.id) primary=`<button class="order-next-action" data-action="deliver" data-id="${o.id}"><span class="next-copy"><small>Next action</small><b>Deliver / take payment</b></span>${icon("arrow")}</button>`;
    if(["super_admin","admin","manager"].includes(role)){
      if(state.workflowMode==="quick"){
        const q=quickNextAction(o);
        if(o.laundry_status==="pickup_requested"){
          primary=o.pickup_driver_id?`<div class="order-waiting"><small>Next action</small><b>Awaiting driver collection</b></div>`:`<button class="order-next-action" data-action="assign" data-id="${o.id}" data-kind="pickup"><span class="next-copy"><small>Next action</small><b>Assign pickup driver</b></span>${icon("arrow")}</button>`;
        }else if(q && o.laundry_status==="ready" && o.channel==="pickup" && !o.delivery_driver_id){
          primary=`<button class="order-next-action" data-action="assign" data-id="${o.id}" data-kind="delivery" data-dispatch="true"><span class="next-copy"><small>Next action</small><b>Assign + send delivery</b></span>${icon("arrow")}</button>`;
        }else if(q && o.laundry_status==="ready" && o.channel==="pickup"){
          primary=`<button class="order-next-action" data-action="quick-advance" data-id="${o.id}"><span class="next-copy"><small>Delivery</small><b>Send for delivery</b></span>${icon("arrow")}</button>`;
        }
      }else if(o.next_statuses?.[0]) primary=`<button class="order-next-action" data-action="advance" data-id="${o.id}" data-status="${o.next_statuses[0]}"><span class="next-copy"><small>Detailed stage</small><b>${esc(stageLabel(o.next_statuses[0]))}</b></span>${icon("arrow")}</button>`;
      secondary.push(orderActionButton("payment",o.id,"Payment","payment"));
      if(o.channel==="pickup") secondary.push(orderActionButton("assign",o.id,"Driver","driver",`data-kind="${o.laundry_status==='ready'||o.laundry_status==='out_for_delivery'?'delivery':'pickup'}"`));
    }
    secondary.push(orderActionButton("print-menu",o.id,"Print","print")); if(o.customer?.mobile)secondary.push(orderActionButton("whatsapp",o.id,"WhatsApp","whatsapp"));
    const subStatus="";
    state.modal=`<div class="modal-backdrop"><section class="modal order-modal"><div class="modal-head"><div><div class="kicker">${o.channel} order</div><h2 class="mono">${esc(o.order_no)}</h2></div><button class="x" data-action="close-modal">×</button></div>
      <div class="workflow-mode"><button class="${state.workflowMode==='quick'?'active':''}" data-workflow-mode="quick" data-id="${o.id}">Quick flow</button><button class="${state.workflowMode==='detailed'?'active':''}" data-workflow-mode="detailed" data-id="${o.id}">Detailed stages</button></div>
      ${stageBar(o)}${subStatus}
      <div class="grid metrics order-metrics" style="margin-top:12px">${metric("Total",ofmt(o,o.total),true)}${metric("Paid",ofmt(o,o.paid))}${metric("Due",ofmt(o,o.outstanding))}${metric("Credit",ofmt(o,o.customer_credit))}</div>${orderTaxDetail(o)}
      <div class="section card order-customer-card"><div class="row between"><div><div class="kicker">Customer</div><h3>${esc(o.customer?.name||"")}</h3><div class="small">${esc(o.customer?.customer_code||"")} · ${esc(o.customer?.mobile||"")}</div></div><span class="badge ${o.payment_status}">${o.payment_status}</span></div></div>
      <div class="section order-pieces"><div class="kicker">Pieces</div><div class="list">${o.items.length?o.items.map(i=>`<div class="list-row"><div class="row between"><span>${i.quantity} × ${esc(i.garment?.name||"")} <span class="muted">/ ${esc(i.service?.name||"")}</span></span><b>${ofmt(o,i.line_total)}</b></div></div>`).join(""):`<div class="empty compact-empty">Garments will be captured at pickup.</div>`}</div></div>
      ${o.payments.length?`<details class="section order-payments"><summary>Payment history <span>${o.payments.length}</span></summary><div class="list" style="margin-top:8px">${o.payments.map(p=>`<div class="list-row"><div class="row between"><span>${esc(p.method)} · ${esc(p.payment_context)}</span><b>${ofmt(o,p.received_amount)}</b></div><div class="small muted">Applied to order: ${ofmt(o,p.amount)}</div></div>`).join("")}</div></details>`:""}
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
  function collectionSummary(){const t=collectionTotals();const serviceNames=new Map(state.data.refs.services.map(s=>[s.id,s.name]));const used=Object.entries(t.serviceCounts).map(([sid,q])=>`${esc(serviceNames.get(sid)||'Service')} · ${q}`).join(" &nbsp;•&nbsp; ");return `<div class="collection-summary collection-floating-summary"><div class="collection-total-pill"><span>Garments</span><b>${t.pieces}</b></div><div class="collection-total-pill"><span>Services</span><b>${t.services}</b></div><div class="collection-total-pill total"><span>Total</span><b>${fmt(t.total)}</b></div>${used?`<small>${used}${platformSettings().tax_inclusive===false?' · tax added at save':''}</small>`:`<small>Add garments to see the live total</small>`}</div>`}
  function collectionEntry(title,kicker,formId,extraTop="",extraBottom=""){
    const activeServices=collectionServices();
    const preferred=activeServices.find(s=>s.code==="wash_iron")||activeServices[0];
    if(!preferred){toast("No service with an active rate is configured.",true);return null}
    state.qty={};state.serviceId=preferred.id;state.garmentSearch="";
    return `<div class="modal-head"><div><div class="kicker">${kicker}</div><h2>${title}</h2></div><button type="button" class="x" data-action="close-modal">×</button></div>${extraTop}<div class="section collection-section"><div class="row between collection-heading"><div><div class="kicker">1 · Service</div><h3>Choose service, then tap garments</h3></div><span class="small muted">Mix services in one collection</span></div><div id="collectionServices">${collectionServiceTabs()}</div></div><div class="section collection-section"><div class="row between collection-heading"><div class="kicker">2 · Garments</div><input id="garmentSearch" class="input collection-search" placeholder="Search garment" autocomplete="off"></div><div id="itemPicker">${itemPicker(state.serviceId)}</div></div><div id="collectionSummary">${collectionSummary()}</div>${extraBottom}`;
  }


  function choiceChipGroup(name,choices,selected="",extraClass=""){
    return `<div class="choice-chip-group ${extraClass}" data-choice-group><input type="hidden" name="${esc(name)}" value="${esc(selected)}" data-choice-input>${choices.map(c=>`<button type="button" class="choice-chip ${String(c.value)===String(selected)?'selected':''}" data-choice-value="${esc(c.value)}"><span class="choice-chip-check">✓</span>${c.icon?icon(c.icon,"sm"):''}<span>${esc(c.label)}</span></button>`).join("")}</div>`;
  }
  function driverChips(name="pickup_driver_id",selected="",includeLater=true){
    const drivers=state.data.staff.filter(s=>s.role==="delivery"&&s.active);
    const choices=[...(includeLater?[{value:"",label:"Assign later",icon:"more"}]:[]),...drivers.map(d=>({value:d.id,label:d.display_name,icon:"driver"}))];
    return choiceChipGroup(name,choices,selected,"driver-chip-group");
  }
  function paymentMethodChips(name="payment_method",selected="cash"){
    return choiceChipGroup(name,[{value:"cash",label:"Cash",icon:"cash"},{value:"card",label:"Card",icon:"card"},{value:"bank",label:"Bank",icon:"bank"},{value:"other",label:"Other",icon:"more"}],selected,"payment-chip-group");
  }
  function paymentExtraFields(methodName="method",refName="transaction_ref",detailName="payment_detail"){
    return `<div class="payment-extra-fields" data-payment-extra-fields data-payment-method-name="${esc(methodName)}"><label class="payment-ref-field" data-payment-ref-wrap><span class="field-label">Transaction Ref. ID</span><input class="input" name="${esc(refName)}" autocomplete="off" placeholder="Reference / approval ID" data-payment-ref></label><label class="payment-detail-field" data-payment-detail-wrap><span class="field-label" data-payment-detail-label>Payment details</span><input class="input" name="${esc(detailName)}" autocomplete="off" placeholder="Optional details" data-payment-detail></label></div>`;
  }
  function syncPaymentExtraFields(form){
    form?.querySelectorAll("[data-payment-extra-fields]").forEach(box=>{
      const method=form.querySelector(`[name="${box.dataset.paymentMethodName}"]`)?.value||"cash";
      const refWrap=box.querySelector("[data-payment-ref-wrap]"),detailWrap=box.querySelector("[data-payment-detail-wrap]");
      const ref=box.querySelector("[data-payment-ref]"),detail=box.querySelector("[data-payment-detail]"),label=box.querySelector("[data-payment-detail-label]");
      const electronic=method==="card"||method==="bank";
      if(refWrap)refWrap.classList.toggle("show",electronic);
      if(detailWrap)detailWrap.classList.toggle("show",method!=="cash");
      if(ref)ref.required=electronic;
      if(label)label.textContent=method==="card"?"Card / POS details":method==="bank"?"Bank / transfer details":"Payment details";
      if(detail)detail.placeholder=method==="card"?"Terminal / last 4 / card note":method==="bank"?"Bank / transfer note":"Optional details";
    });
  }
  function paymentDetailsFromForm(f,refName="transaction_ref",detailName="payment_detail"){
    return {transaction_ref:String(f.get(refName)||"").trim()||null,payment_details:{detail:String(f.get(detailName)||"").trim()||null}};
  }
  function discountChips(name="discount_id",selected=""){
    const rows=(state.data.refs.discounts||[]).filter(d=>d.active&&Number(d.value)>0);
    const choices=[{value:"",label:"None",icon:"tag"},...rows.map(d=>({value:d.id,label:`${d.name} · ${d.discount_type==='percent'?d.value+'%':fmt(d.value)}`,icon:"tag"}))];
    return choiceChipGroup(name,choices,selected,"discount-chip-group");
  }

  function customerPicker(name="customer_id",selectedId="",opts={}){
    const c=state.data.customers.find(x=>x.id===selectedId)||null;
    const finance=opts.finance===true;
    return `<div class="customer-search-picker" data-customer-picker data-active-index="-1" ${finance?'data-finance-picker="true"':''}>
      <input type="hidden" name="${name}" value="${esc(selectedId||'')}" data-customer-id>
      <label><span class="field-label inline-label">${esc(opts.label||"Customer")}</span>
        <div class="customer-search-box">
          <span class="customer-search-icon">${icon("user","sm")}</span>
          <input class="input customer-search-input" type="search" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" placeholder="Name / mobile / building / door" value="${c?esc(c.name):''}" data-customer-search>
          <button type="button" class="customer-search-clear" data-customer-clear aria-label="Clear customer">×</button>
        </div>
      </label>
      <div class="customer-search-selected ${c?'show':''}" data-customer-selected>${c?`<b>${esc(c.name)}</b><span>${esc(c.mobile||'')} · ${esc(c.building_block||'Building —')} · ${c.door_no?`Door ${esc(c.door_no)}`:'Door —'}</span>`:''}</div>
      <div class="customer-search-results" role="listbox" data-customer-results></div>
    </div>`;
  }
  function customerSearchText(c){return [c.name,c.mobile,c.customer_code,c.building_block,c.door_no,c.address].filter(Boolean).join(" ").toLowerCase()}
  function customerSearchResults(term){
    const q=String(term||"").trim().toLowerCase();
    let rows=state.data.customers.filter(c=>c.access_enabled!==false);
    if(q) rows=rows.filter(c=>customerSearchText(c).includes(q));
    return rows.sort((a,b)=>{
      if(q){const an=(a.name||"").toLowerCase().startsWith(q)?0:1,bn=(b.name||"").toLowerCase().startsWith(q)?0:1;if(an!==bn)return an-bn}
      return (a.name||"").localeCompare(b.name||"");
    }).slice(0,8);
  }
  function renderCustomerSearch(picker,term=""){
    const results=picker?.querySelector("[data-customer-results]");if(!results)return;
    const rows=customerSearchResults(term);picker.dataset.activeIndex="-1";
    results.innerHTML=rows.length?rows.map((c,i)=>`<button type="button" class="customer-search-result" role="option" aria-selected="false" data-result-index="${i}" data-customer-choice="${c.id}"><span class="customer-result-main"><b>${esc(c.name)}</b><small>${esc(c.mobile||'')}</small></span><span class="customer-result-location"><b>${esc(c.building_block||'Building —')}</b><small>${c.door_no?`Door ${esc(c.door_no)}`:'Door —'}</small></span></button>`).join(""):`<div class="customer-search-empty">No matching customer</div>`;
    results.classList.add("show");picker.querySelector("[data-customer-search]")?.setAttribute("aria-expanded","true");
  }
  function moveCustomerHighlight(picker,delta){
    const rows=[...picker.querySelectorAll("[data-customer-choice]")];if(!rows.length)return;
    let idx=Number(picker.dataset.activeIndex||-1);idx=(idx+delta+rows.length)%rows.length;picker.dataset.activeIndex=String(idx);
    rows.forEach((r,i)=>{const on=i===idx;r.classList.toggle("keyboard-active",on);r.setAttribute("aria-selected",on?"true":"false")});rows[idx].scrollIntoView({block:"nearest"});
  }
  function selectHighlightedCustomer(picker){const idx=Number(picker?.dataset.activeIndex||-1),rows=[...picker.querySelectorAll("[data-customer-choice]")];if(idx>=0&&rows[idx]){chooseCustomer(picker,rows[idx].dataset.customerChoice);return true}return false}

  function chooseCustomer(picker,customerId){
    const c=state.data.customers.find(x=>x.id===customerId);if(!c||!picker)return;
    const hidden=picker.querySelector("[data-customer-id]"),input=picker.querySelector("[data-customer-search]"),selected=picker.querySelector("[data-customer-selected]"),results=picker.querySelector("[data-customer-results]");
    hidden.value=c.id; input.value=c.name;
    selected.innerHTML=`<b>${esc(c.name)}</b><span>${esc(c.mobile||'')} · ${esc(c.building_block||'Building —')} · ${c.door_no?`Door ${esc(c.door_no)}`:'Door —'}</span>`;selected.classList.add("show");
    results.classList.remove("show");results.innerHTML="";picker.dataset.activeIndex="-1";input.setAttribute("aria-expanded","false");
    if(picker.dataset.financePicker==="true") loadCustomerFinance(c.id);
  }

  function openCounter(){
    state.qty={};state.garmentSearch="";state.serviceId=collectionServices()[0]?.id||null;
    const top=`<div class="counter-top-grid"><div class="counter-customer-cell">${customerPicker("customer_id")}</div><div class="counter-discount-field"><div class="field-label">Discount <span class="muted">optional</span></div>${discountChips("discount_id","")}</div></div>`;
    const bottom=`<div class="section payment-inline-row"><label class="payment-amount-field"><span class="field-label">Pay now <span class="muted">optional</span></span><input class="input" name="payment_amount" type="number" min="0" step="0.01" placeholder="0.00"></label><div class="payment-method-field"><div class="field-label">Method</div>${paymentMethodChips("payment_method","cash")}</div></div>${paymentExtraFields("payment_method","payment_transaction_ref","payment_detail")}<p class="small muted compact-note">Customer advance is applied automatically first.</p><div class="section submit-section"><button class="btn primary block">CREATE ORDER →</button></div>`;
    const body=collectionEntry("New counter order","At the shop","counterForm",top,bottom);if(!body)return;
    state.modal=`<div class="modal-backdrop"><form class="modal collection-modal" id="counterForm">${body}</form></div>`;renderApp();
  }



  function openPickupRequest(){
    state.modal=`<div class="modal-backdrop"><form class="modal" id="pickupStaffForm"><div class="modal-head"><div><div class="kicker">WhatsApp / phone</div><h2>Pickup request</h2></div><button type="button" class="x" data-action="close-modal">×</button></div><div class="stack">${customerPicker("customer_id")}<div><div class="field-label">Assign pickup</div>${driverChips("pickup_driver_id","",true)}</div><label>Address / note<textarea name="note" placeholder="Preferred time, building, WhatsApp note..."></textarea></label><button class="btn primary block">SAVE REQUEST →</button></div></form></div>`;renderApp();
  }

  function openCollect(orderId){
    const o=state.data.orders.find(x=>x.id===orderId);
    const top=`<div class="collection-customer-line"><div><b>${esc(o.customer.name)}</b><span class="mono small">${esc(o.order_no)}</span></div><span class="small muted">Doorstep pickup</span></div>`;
    const bottom=`<div class="section payment-inline-row"><label class="payment-amount-field"><span class="field-label">Pay now <span class="muted">optional</span></span><input class="input" name="payment_amount" type="number" min="0" step="0.01" placeholder="0.00"></label><div class="payment-method-field"><div class="field-label">Method</div>${paymentMethodChips("payment_method","cash")}</div></div>${paymentExtraFields("payment_method","payment_transaction_ref","payment_detail")}<p class="small muted compact-note">Customer advance is used automatically first.</p><div class="section submit-section"><button class="btn primary block">SAVE + COLLECT →</button></div>`;
    const body=collectionEntry("Collect garments","Doorstep pickup","collectForm",top,bottom);if(!body)return;
    state.modal=`<div class="modal-backdrop"><form class="modal collection-modal" id="collectForm" data-order="${o.id}">${body}</form></div>`;renderApp();
  }



  function openDeliver(orderId){const o=state.data.orders.find(x=>x.id===orderId);state.modal=`<div class="modal-backdrop"><form class="modal" id="deliverForm" data-order="${o.id}"><div class="modal-head"><div><div class="kicker">Handover</div><h2>${esc(o.customer.name)}</h2><div class="mono small">${o.order_no}</div></div><button type="button" class="x" data-action="close-modal">×</button></div><div class="grid metrics">${metric("Due",ofmt(o,o.outstanding),true)}${metric("Credit",ofmt(o,o.customer_credit))}</div><div class="section payment-inline-row"><label class="payment-amount-field"><span class="field-label">Received</span><input class="input" name="payment_amount" type="number" min="0" step="0.01" value="${o.outstanding||''}"></label><div class="payment-method-field"><div class="field-label">Method</div>${paymentMethodChips("payment_method","cash")}</div></div>${paymentExtraFields("payment_method","payment_transaction_ref","payment_detail")}<p class="small muted compact-note">Use 0 if already settled. Delivery and payment remain separate.</p><div class="section submit-section"><button class="btn primary block">CONFIRM HANDOVER →</button></div></form></div>`;renderApp()}


  function simpleModal(title,body,formId){state.modal=`<div class="modal-backdrop"><form class="modal" id="${formId}"><div class="modal-head"><h2>${title}</h2><button type="button" class="x" data-action="close-modal">×</button></div>${body}</form></div>`;renderApp()}
  function openPayment(o){simpleModal("Record payment",`<div class="grid metrics">${metric("Due",ofmt(o,o.outstanding),true)}${metric("Credit",ofmt(o,o.customer_credit))}</div>${o.customer_credit>0&&o.outstanding>0?`<div class="section"><button type="button" class="btn block" data-action="credit" data-id="${o.id}">Apply ${fmt(Math.min(o.customer_credit,o.outstanding))} customer credit</button></div>`:""}<input type="hidden" name="order_id" value="${o.id}"><div class="section payment-inline-row"><label class="payment-amount-field"><span class="field-label">Amount</span><input class="input" name="amount" type="number" min="0.01" step="0.01" value="${o.outstanding||''}" required></label><div class="payment-method-field"><div class="field-label">Method</div>${paymentMethodChips("method","cash")}</div></div>${paymentExtraFields("method","transaction_ref","payment_detail")}<div class="payment-context-row"><label><span class="field-label">Received at</span><select name="context"><option value="shop">Shop</option><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label><button class="btn primary">SAVE PAYMENT →</button></div>`,'paymentForm')}

  function openPrintMenu(o){
    state.modal=`<div class="modal-backdrop"><section class="modal compact-modal"><div class="modal-head"><div><div class="kicker">${esc(o.order_no)}</div><h2>Print</h2></div><button class="x" data-action="close-modal">×</button></div><div class="print-choice-grid"><button class="print-choice" data-action="print-receipt" data-id="${o.id}">${icon("print")}<span><b>Receipt / PDF</b><small>Customer bill and QR</small></span></button>${o.pieces.length?`<button class="print-choice" data-action="print-labels" data-id="${o.id}">${icon("tag")}<span><b>Bag + garment tags</b><small>${o.pieces.length} piece${o.pieces.length===1?'':'s'}</small></span></button>`:`<div class="print-choice disabled">${icon("tag")}<span><b>Garment tags</b><small>Available after pieces are captured</small></span></div>`}</div></section></div>`;
    renderApp();
  }
  function openAssign(o,kind,dispatch=false){const current=kind==="pickup"?(o.pickup_driver_id||""):(o.delivery_driver_id||"");simpleModal(dispatch?"Assign + send delivery":`Assign ${kind}`,`<div class="stack"><input type="hidden" name="order_id" value="${o.id}"><input type="hidden" name="kind" value="${kind}"><input type="hidden" name="dispatch" value="${dispatch?'true':'false'}"><div><div class="field-label">${kind==="pickup"?'Collection boy':'Delivery person'}</div>${driverChips("driver_id",current,false)}</div>${dispatch?`<p class="small muted">This will assign the person and move the order to delivery in one step.</p>`:''}<button class="btn primary block">${dispatch?'ASSIGN + SEND →':'ASSIGN →'}</button></div>`,"assignForm")}
  function openCustomer(customer=null){simpleModal(customer?"Edit customer":"Add customer",`<div class="stack"><input type="hidden" name="id" value="${customer?.id||''}"><label>Name<input class="input" name="name" value="${esc(customer?.name||'')}" required></label><label>Mobile number<input class="input" name="mobile" value="${esc(customer?.mobile||'')}" placeholder="Mobile number" required></label><div class="form-grid two"><label>Building / Block<input class="input" name="building_block" value="${esc(customer?.building_block||'')}" placeholder="e.g. Al Qusais Block A"></label><label>Door No.<input class="input" name="door_no" value="${esc(customer?.door_no||'')}" placeholder="e.g. 204"></label></div><label>Area / street<textarea name="address" placeholder="Area, street, landmark">${esc(customer?.address||'')}</textarea></label><label>Six-digit code <span class="muted">${customer?'leave blank to keep current code':'optional — generated if blank'}</span><input class="input" name="pin" inputmode="numeric" maxlength="6"></label><button class="btn primary block">${customer?'SAVE CHANGES':'CREATE CUSTOMER'} →</button></div>`,"customerForm")}
  function financeTypeLabel(t){return ({advance:"Advance received",overpayment:"Overpayment credit",application:"Used for order",adjustment:"Adjustment"}[t]||t)}
  function financePositionMarkup(value){const n=Number(value||0);return n>0?`<span class="finance-position due">${fmt(n)} due</span>`:n<0?`<span class="finance-position credit">${fmt(Math.abs(n))} advance</span>`:`<span class="finance-position settled">Settled</span>`}
  function financeOrderRows(f){const rows=f?.outstanding_orders||[];if(!rows.length)return `<div class="empty compact-empty">No outstanding orders. The full receipt will become customer advance.</div>`;return `<div class="finance-order-toolbar"><span class="small muted">Optional — selected orders are settled first</span><div class="row"><button type="button" class="btn tiny" data-action="finance-auto-oldest">Auto oldest</button><button type="button" class="btn tiny" data-action="finance-select-all">Select all</button></div></div><div class="finance-order-list">${rows.map(o=>`<label class="finance-order-row"><input type="checkbox" name="priority_order_ids" value="${o.id}" data-finance-order data-due="${Number(o.outstanding||0)}"><span><b>${esc(o.order_no)}</b><small>${quickStageLabel(o)} · ${new Date(o.created_at).toLocaleDateString()}</small></span><strong>${ofmt(o,o.outstanding)}</strong></label>`).join("")}</div><div class="small muted finance-allocation-note" data-finance-allocation-note>Auto: oldest dues first.</div>`}
  function updateFinancePreview(form){if(!form)return;const amount=Math.max(0,Number(form.querySelector('[name="amount"]')?.value||0)),net=Number(form.dataset.netPosition||0);const after=net-amount;const markup=financePositionMarkup(after);const out=form.querySelector('[data-finance-after]');if(out)out.innerHTML=markup;const footer=form.closest('.finance-modal')?.querySelector('[data-finance-footer-after]');if(footer)footer.innerHTML=markup;const checked=[...form.querySelectorAll('[data-finance-order]:checked')];const sum=checked.reduce((s,x)=>s+Number(x.dataset.due||0),0);const note=form.querySelector('[data-finance-allocation-note]');if(note)note.textContent=checked.length?`${checked.length} selected first · ${fmt(sum)} selected due · remainder continues to oldest dues.`:'Auto: oldest dues first.'}
  function financeLedgerHtml(wallet){
    if(!wallet?.length)return `<div class="empty compact-empty">No advance or credit transactions yet.</div>`;
    return `<div class="finance-ledger">${wallet.map(x=>{
      const meta=[new Date(x.created_at).toLocaleString(),x.reference_no||null,x.transaction_ref?`Ref ${x.transaction_ref}`:null].filter(Boolean).map(esc).join(" · ");
      return `<div class="finance-row"><div><b>${esc(financeTypeLabel(x.entry_type))}</b><span>${meta}</span>${x.note?`<small>${esc(x.note)}</small>`:""}</div><div class="finance-amount ${Number(x.amount)>=0?'credit-text':'due-text'}"><b>${Number(x.amount)>=0?'+':'−'}${fmt(Math.abs(Number(x.amount)))}</b><span>Bal ${fmt(x.balance_after)}</span></div></div>`;
    }).join("")}</div>`;
  }
  function financeReceiptsHtml(receipts){
    if(!receipts?.length)return "";
    return `<details class="section order-payments"><summary>Receipts <span>${receipts.length}</span></summary><div class="list" style="margin-top:8px">${receipts.slice(0,30).map(x=>{
      const orderNos=(x.order_nos||[]).join(", ");
      const meta=[new Date(x.created_at).toLocaleString(),x.transaction_ref?`Ref ${x.transaction_ref}`:null,x.payment_details?.detail||null,x.note||null].filter(Boolean).map(esc).join(" · ");
      return `<div class="list-row"><div class="row between"><span>${esc(x.method)}${orderNos?` · ${esc(orderNos)}`:""}</span><b>${fmt(x.received_amount)}</b></div><div class="small muted">${meta}</div></div>`;
    }).join("")}</div></details>`;
  }
  function customerFinanceModal(f=null){
    const c=f?.customer||null,wallet=f?.wallet||[],receipts=f?.receipts||[];
    const search=`<div class="finance-customer-search">${customerPicker("customer_id",c?.id||"",{finance:true,label:"Customer"})}</div>`;
    const head=`<div class="modal-head finance-modal-head"><div><div class="kicker">Customer account</div><h2>Receive payment</h2></div><button type="button" class="x" data-action="close-modal" aria-label="Close">×</button></div>`;
    if(!c)return `<div class="modal-backdrop"><section class="modal finance-modal">${head}<div class="finance-modal-scroll"><div class="finance-first-view">${search}<div class="finance-empty-state">${icon("payment")}<b>Select a customer</b><span>Search by name, mobile, building/block or door number.</span></div></div></div></section></div>`;
    const dueClass=Number(f.outstanding)>0?"finance-due-metric":"";
    const metrics=`<div class="grid metrics finance-metrics"><div class="card metric ${dueClass}"><div class="value">${fmt(f.outstanding)}</div><div class="label">Due</div></div>${metric("Advance",fmt(f.credit))}<div class="card metric"><div class="value">${financePositionMarkup(f.net_position)}</div><div class="label">Net</div></div></div>`;
    const form=`<form id="customerAccountPaymentForm" class="finance-receive" data-net-position="${Number(f.net_position||0)}" data-outstanding="${Number(f.outstanding||0)}" data-credit="${Number(f.credit||0)}"><input type="hidden" name="customer_id" value="${c.id}"><div class="finance-payment-compact"><label class="payment-amount-field"><span class="field-label">Amount</span><input class="input" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" data-finance-amount></label><div class="payment-method-field"><div class="field-label">Method</div>${paymentMethodChips("method","cash")}</div><div class="finance-after"><span>After</span><b data-finance-after>${financePositionMarkup(f.net_position)}</b></div></div>${paymentExtraFields("method","transaction_ref","payment_detail")}<div class="finance-allocation"><div class="field-label">Apply to orders <span class="muted">optional priority</span></div>${financeOrderRows(f)}</div><label class="finance-note"><span class="field-label">Note <span class="muted">optional</span></span><input class="input" name="note" placeholder="Receipt note"></label></form>`;
    const ledger=`<div class="section finance-history-section"><div class="row between"><div><div class="kicker">Wallet</div><h3>Transactions</h3></div><span class="badge ${f.credit>0?'paid':'unpaid'}">${fmt(f.credit)}</span></div>${financeLedgerHtml(wallet)}</div>`;
    const footer=`<div class="finance-modal-footer"><div class="finance-footer-position"><span>After receipt</span><b data-finance-footer-after>${financePositionMarkup(f.net_position)}</b></div><button class="btn primary finance-submit" type="submit" form="customerAccountPaymentForm">RECEIVE PAYMENT →</button></div>`;
    return `<div class="modal-backdrop"><section class="modal finance-modal">${head}<div class="finance-modal-scroll"><div class="finance-first-view">${search}${metrics}${form}</div>${ledger}${financeReceiptsHtml(receipts)}</div>${footer}</section></div>`;
  }
  async function loadCustomerFinance(customerId,trigger=null){if(!customerId){state.modal=customerFinanceModal(null);renderApp();return}try{setBusy(true,trigger,"Opening account…");const f=await api(`/customer-finance?id=${encodeURIComponent(customerId)}`);state.modal=customerFinanceModal(f);renderApp();setTimeout(()=>{const form=id("customerAccountPaymentForm");syncPaymentExtraFields(form);updateFinancePreview(form)},0)}catch(e){toast(e.message,true)}finally{setBusy(false)}}
  async function openCustomerFinance(customerId,trigger=null){return loadCustomerFinance(customerId,trigger)}
  function openReceivePayment(){state.modal=customerFinanceModal(null);renderApp();setTimeout(()=>document.querySelector('.finance-modal [data-customer-search]')?.focus(),0)}


  function openDemoReset(){
    simpleModal("Reset demo data",`<div class="stack"><div class="danger-note"><b>This removes operational demo transactions.</b><span>Staff users, customers, rates, services, garments, discounts and organization settings are retained.</span></div><div class="reset-scope"><div><span>Will be cleared</span><b>Orders · payments · credits · workflow history · tags</b></div><div><span>Will be retained</span><b>Users · customers · pricing · setup</b></div></div><label>Type <b>RESET</b> to confirm<input class="input mono" name="confirmation" autocomplete="off" placeholder="RESET" required></label><button class="btn danger block" type="submit">RESET DEMO DATA</button></div>`,"demoResetForm")
  }
  function openStaff(staff=null){const superUser=state.data.actor.role==="super_admin";if(staff?.role==="super_admin"&&!superUser)return toast("Only Super Admin can modify this account",true);const roles=superUser?["super_admin","admin","manager","delivery"]:["admin","manager","delivery"];simpleModal(staff?"Edit staff":"Add staff",`<div class="stack"><input type="hidden" name="id" value="${staff?.id||''}"><label>Name<input class="input" name="display_name" value="${esc(staff?.display_name||'')}" required></label><label>Login ID<input class="input" name="login_id" value="${esc(staff?.login_id||'')}" required></label><label>Role<select name="role">${roles.map(r=>`<option value="${r}" ${staff?.role===r?'selected':''}>${roleName(r)}</option>`).join("")}</select></label><label>Phone<input class="input" name="phone" value="${esc(staff?.phone||'')}"></label><label>New six-digit code <span class="muted">${staff?'leave blank to keep':'generated if blank'}</span><input class="input" name="pin" inputmode="numeric" maxlength="6"></label><label class="row"><input name="active" type="checkbox" ${staff?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE STAFF →</button></div>`,"staffForm")}
  function openRate(){simpleModal("Add / change rate",`<div class="stack"><label>Garment<select name="garment_type_id">${state.data.refs.garments.filter(x=>x.active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label><label>Service<select name="service_id">${state.data.refs.services.filter(x=>x.active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label><label>Price ${esc(currencyCode())}<input class="input" name="unit_price" type="number" min="0" step="0.01" required></label><label>Effective from<input class="input" name="effective_from" type="date" value="${new Date().toISOString().slice(0,10)}"></label><button class="btn primary block">SAVE RATE →</button></div>`,"rateForm")}
  function openCatalog(kind,item=null){const isG=kind==="garment";simpleModal(`${item?'Edit':'Add'} ${kind}`,`<div class="stack"><input type="hidden" name="id" value="${item?.id||''}"><label>Name<input class="input" name="name" value="${esc(item?.name||'')}" required></label><label>Code<input class="input mono" name="code" value="${esc(item?.code||'')}" required></label>${isG?'':`<label>Workflow<select name="workflow"><option value="wash_iron" ${item?.workflow==='wash_iron'?'selected':''}>Wash + Iron</option><option value="wash_only" ${item?.workflow==='wash_only'?'selected':''}>Wash Only</option><option value="iron_only" ${item?.workflow==='iron_only'?'selected':''}>Iron Only</option><option value="dry_clean" ${item?.workflow==='dry_clean'?'selected':''}>Dry Clean</option><option value="custom" ${item?.workflow==='custom'?'selected':''}>Other / Custom</option></select></label>`}<label class="row"><input name="active" type="checkbox" ${item?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE →</button></div>`,isG?"garmentForm":"serviceForm")}
  function openDiscount(item=null){simpleModal(item?"Edit discount":"Add discount",`<div class="stack"><input type="hidden" name="id" value="${item?.id||''}"><label>Name<input class="input" name="name" value="${esc(item?.name||'')}" required></label><label>Type<select name="discount_type"><option value="percent" ${item?.discount_type==='percent'?'selected':''}>Percent</option><option value="fixed" ${item?.discount_type==='fixed'?'selected':''}>Fixed ${currencyCode()}</option></select></label><label>Value<input class="input" name="value" type="number" min="0" step="0.01" value="${item?.value??''}" required></label><label class="row"><input name="active" type="checkbox" ${item?.active===false?'':'checked'}> Active</label><button class="btn primary block">SAVE DISCOUNT →</button></div>`,"discountForm")}

  function themeModal(){
    return `<div class="modal-backdrop"><form class="modal" id="themeForm"><div class="modal-head"><div><div class="kicker">Appearance</div><h2>Theme</h2></div><button type="button" class="x" data-action="close-modal">×</button></div>
      <p class="sub">Light is the default. Switch to Graphite when you prefer a darker workspace.</p>
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

  function markAttention(el){if(!el)return;el.classList.add("field-attention");setTimeout(()=>el.classList.remove("field-attention"),1800)}
  function focusFirstInvalid(form){const invalid=form?.querySelector(":invalid");if(invalid){markAttention(invalid);invalid.focus({preventScroll:false});return true}return false}

  function bindDynamicForms(){
    const bind=(formId,fn)=>{const f=id(formId);if(f)f.addEventListener("submit",fn)};
    bind("pickupSelfForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"create_pickup_request",address:f.get("address"),note:f.get("note")},"Pickup requested",e.submitter)});
    bind("pickupStaffForm",e=>{e.preventDefault();const f=new FormData(e.target);if(!f.get("customer_id")){const input=e.target.querySelector("[data-customer-search]");markAttention(input);input?.focus();return toast("Select a customer",true)}doAction({action:"create_pickup_request",customer_id:f.get("customer_id"),pickup_driver_id:f.get("pickup_driver_id")||null,note:f.get("note")},"Pickup request saved",e.submitter)});
    bind("counterForm",e=>{e.preventDefault();const f=new FormData(e.target),items=selectedItems(),pd=paymentDetailsFromForm(f,"payment_transaction_ref","payment_detail");if(!f.get("customer_id")){const input=e.target.querySelector("[data-customer-search]");markAttention(input);input?.focus();return toast("Select a customer",true)}if(!items.length){const input=id("garmentSearch");markAttention(input);input?.focus();return toast("Add at least one garment",true)}doAction({action:"create_counter_order",customer_id:f.get("customer_id"),discount_id:f.get("discount_id")||null,items,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method"),payment_transaction_ref:pd.transaction_ref,payment_details:pd.payment_details},"Counter order created",e.submitter)});
    bind("collectForm",e=>{e.preventDefault();const f=new FormData(e.target),items=selectedItems(),pd=paymentDetailsFromForm(f,"payment_transaction_ref","payment_detail");if(!items.length)return toast("Add at least one garment",true);doAction({action:"collect_pickup",order_id:e.target.dataset.order,items,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method"),payment_transaction_ref:pd.transaction_ref,payment_details:pd.payment_details},"Pickup collected",e.submitter)});
    bind("deliverForm",e=>{e.preventDefault();const f=new FormData(e.target),pd=paymentDetailsFromForm(f,"payment_transaction_ref","payment_detail");doAction({action:"deliver_order",order_id:e.target.dataset.order,payment_amount:f.get("payment_amount"),payment_method:f.get("payment_method"),payment_transaction_ref:pd.transaction_ref,payment_details:pd.payment_details},"Delivered",e.submitter)});
    bind("paymentForm",e=>{e.preventDefault();const f=new FormData(e.target),pd=paymentDetailsFromForm(f);doAction({action:"record_payment",order_id:f.get("order_id"),amount:f.get("amount"),method:f.get("method"),context:f.get("context"),transaction_ref:pd.transaction_ref,payment_details:pd.payment_details},"Payment recorded",e.submitter)});
    bind("customerAccountPaymentForm",async e=>{e.preventDefault();const f=new FormData(e.target),customerId=f.get("customer_id"),pd=paymentDetailsFromForm(f),priority=[...e.target.querySelectorAll('[name="priority_order_ids"]:checked')].map(x=>x.value);try{setBusy(true,e.submitter,"Receiving payment…");const r=await api("/action",{method:"POST",body:{action:"record_customer_payment",customer_id:customerId,amount:f.get("amount"),method:f.get("method"),note:f.get("note"),priority_order_ids:priority,transaction_ref:pd.transaction_ref,payment_details:pd.payment_details}});await refresh();const d=r.result||{};const finance=await api(`/customer-finance?id=${encodeURIComponent(customerId)}`);state.modal=customerFinanceModal(finance);renderApp();setTimeout(()=>{syncPaymentExtraFields(id("customerAccountPaymentForm"));updateFinancePreview(id("customerAccountPaymentForm"))},0);toast(`Received ${fmt(d.received||f.get("amount"))} · ${fmt(d.allocated||0)} settled · ${fmt(d.advance_added||0)} advance`)}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("assignForm",e=>{e.preventDefault();const f=new FormData(e.target),dispatch=f.get("dispatch")==="true";if(!f.get("driver_id"))return toast("Select a person to assign",true);doAction({action:"assign_driver",order_id:f.get("order_id"),kind:f.get("kind"),driver_id:f.get("driver_id"),dispatch},dispatch?"Person assigned and sent":"Person assigned",e.submitter,dispatch?"Assigning + sending…":"Assigning…")});
    bind("customerForm",async e=>{e.preventDefault();const f=new FormData(e.target),isNew=!f.get("id");try{setBusy(true,e.submitter,"Saving customer…");const r=await api("/action",{method:"POST",body:{action:"save_customer",id:f.get("id")||null,name:f.get("name"),mobile:f.get("mobile"),building_block:f.get("building_block"),door_no:f.get("door_no"),address:f.get("address"),pin:f.get("pin")||null}});state.modal=null;await refresh();if(isNew&&r.temporary_pin)alert(`Customer created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the customer.`);else toast("Customer saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("customerQuickForm",async e=>{e.preventDefault();const f=new FormData(e.target);try{setBusy(true,e.submitter,"Adding customer…");const r=await api("/action",{method:"POST",body:{action:"save_customer",name:f.get("name"),mobile:f.get("mobile"),building_block:f.get("building_block"),door_no:f.get("door_no"),address:f.get("address"),pin:null}});await refresh();const panel=id("adminPanel");if(panel&&isAdminRole(state.data.actor.role)){panel.innerHTML=adminCustomers();bindDynamicForms()}else if(state.data.actor.role==="manager"&&state.view==="customers")renderApp();if(r.temporary_pin)alert(`Customer created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the customer.`)}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("staffForm",async e=>{e.preventDefault();const f=new FormData(e.target),isNew=!f.get("id");try{setBusy(true,e.submitter,"Saving staff…");const r=await api("/action",{method:"POST",body:{action:"save_staff",id:f.get("id")||null,display_name:f.get("display_name"),login_id:f.get("login_id"),role:f.get("role"),phone:f.get("phone"),pin:f.get("pin")||null,active:f.get("active")==="on"}});state.modal=null;await refresh();if(isNew&&r.temporary_pin)alert(`Staff created. Six-digit login code: ${r.temporary_pin}\nShare it privately with the staff member.`);else toast("Staff saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("rateForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_rate",garment_type_id:f.get("garment_type_id"),service_id:f.get("service_id"),unit_price:f.get("unit_price"),effective_from:f.get("effective_from")},"Rate saved",e.submitter)});
    bind("garmentForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_garment",id:f.get("id")||null,name:f.get("name"),code:f.get("code"),active:f.get("active")==="on"},"Garment saved",e.submitter)});
    bind("serviceForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_service",id:f.get("id")||null,name:f.get("name"),code:f.get("code"),workflow:f.get("workflow"),active:f.get("active")==="on"},"Service saved",e.submitter)});
    bind("discountForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_discount",id:f.get("id")||null,name:f.get("name"),discount_type:f.get("discount_type"),value:f.get("value"),active:f.get("active")==="on"},"Discount saved",e.submitter)});
    bind("businessForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_business_settings",name:f.get("name"),address:f.get("address"),phone:f.get("phone")},"Organization updated",e.submitter,"Saving organization…")});
    bind("workflowSettingsForm",e=>{e.preventDefault();const f=new FormData(e.target);doAction({action:"save_workflow_settings",confirm_stage_changes:f.get("confirm_stage_changes")==="on"},"Workflow setting updated",e.submitter,"Saving workflow…")});
    bind("demoResetForm",async e=>{e.preventDefault();const f=new FormData(e.target),confirmation=String(f.get("confirmation")||"").trim().toUpperCase();if(confirmation!=="RESET")return toast("Type RESET to confirm",true);try{setBusy(true,e.submitter,"Resetting demo data…");const r=await api("/action",{method:"POST",body:{action:"reset_demo_data",confirmation:"RESET"}});state.modal=null;state.reportData=null;await refresh();const d=r.reset||{};toast(`Demo reset complete · ${d.orders||0} orders · ${d.payments||0} payments cleared`)}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("reportCustomForm",e=>{e.preventDefault();const f=new FormData(e.target);const from=f.get("from"),to=f.get("to");if(from>to){e.target.elements.from.focus();return toast("From date must be before To date",true)}state.reportFrom=from;state.reportTo=to;state.reportDraftFrom=from;state.reportDraftTo=to;loadReports(true)});
    bind("superUnlockForm",async e=>{e.preventDefault();const f=new FormData(e.target);try{setBusy(true,e.submitter,"Unlocking…");await api("/action",{method:"POST",body:{action:"unlock_super_admin",passcode:f.get("passcode"),device_timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||platformSettings().timezone}});await refresh();state.adminTab="super";renderApp();toast("Config unlocked")}catch(err){toast(err.message,true);markAttention(e.target.querySelector('[name="passcode"]'));e.target.querySelector('[name="passcode"]')?.focus()}finally{setBusy(false)}});
    bind("superPlatformForm",async e=>{e.preventDefault();const f=new FormData(e.target);try{setBusy(true,e.submitter,"Saving platform…");await api("/action",{method:"POST",body:{action:"save_super_platform",country_code:f.get("country_code"),country_name:f.get("country_name"),timezone:f.get("timezone"),currency:f.get("currency"),max_user_count:Number(f.get("max_user_count")),unlock_minute_offset:Number(f.get("unlock_minute_offset")),tax_type:f.get("tax_type"),vat_percent:Number(f.get("vat_percent")||0),cgst_percent:Number(f.get("cgst_percent")||0),sgst_percent:Number(f.get("sgst_percent")||0),tax_inclusive:f.get("tax_inclusive")==="on"}});await refresh();state.adminTab="super";renderApp();toast("Platform settings saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
    bind("superWorkflowForm",async e=>{e.preventDefault();const rows=[...e.target.querySelectorAll('[data-stage-row]')];const stages=rows.map((r,i)=>({code:r.dataset.code,name:r.querySelector('[data-stage-name]')?.value||"Stage",active:!!r.querySelector('[data-stage-active]')?.checked,sort_order:(i+1)*10,system:r.querySelector('[data-stage-name]')?.readOnly===true}));try{setBusy(true,e.submitter,"Saving stages…");await api("/action",{method:"POST",body:{action:"save_super_workflow",confirm_stage_changes:e.target.querySelector('[name="confirm_stage_changes"]')?.checked===true,stages}});await refresh();state.adminTab="super";renderApp();toast("Workflow stages saved")}catch(err){toast(err.message,true)}finally{setBusy(false)}});
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
      p.innerHTML=`<div class="print-sheet"><div class="print-head"><div><div class="print-title">${esc(org.name||"Laundry Desk")}</div>${org.address?`<div class="print-address">${esc(org.address)}</div>`:""}${org.phone?`<div>${esc(org.phone)}</div>`:""}<div class="print-order">${esc(o.order_no)} · ${new Date(o.created_at).toLocaleString()}</div></div><div id="printQr" class="qr"></div></div><h3>${esc(o.customer.name)} · ${esc(o.customer.customer_code)}</h3><div>${esc(o.customer.mobile)}</div><table class="print-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${o.items.map(i=>`<tr><td>${esc(i.garment.name)} / ${esc(i.service.name)}</td><td>${i.quantity}</td><td>${ofmt(o,i.unit_price)}</td><td>${ofmt(o,i.line_total)}</td></tr>`).join("")}</tbody></table><div style="margin-top:6mm;text-align:right">Subtotal ${ofmt(o,o.subtotal)}${Number(o.discount_amount||0)>0?`<br>Discount −${ofmt(o,o.discount_amount)}`:""}${printTaxLines(o)}<br><b>Total ${ofmt(o,o.total)}</b><br>Paid ${ofmt(o,o.paid)}<br><b>Outstanding ${ofmt(o,o.outstanding)}</b>${o.customer_credit>0?`<br>Customer credit ${ofmt(o,o.customer_credit)}`:""}</div><p style="margin-top:8mm">Laundry status: <b>${stageLabel(o.laundry_status)}</b> · Payment status: <b>${o.payment_status}</b></p></div>`;
      if(window.QRCode)new QRCode(document.getElementById("printQr"),{text:o.order_no,width:90,height:90});
    }else{
      p.innerHTML=`<div class="print-sheet"><div class="bag-label"><div class="row between"><div><div class="print-org">${esc(org.name||"Laundry Desk")}</div><div class="print-title">${esc(o.order_no)}</div><b>${esc(o.customer.name)}</b><br>${esc(o.customer.customer_code)} · ${o.pieces.length} pcs</div><div id="printQr" class="qr"></div></div></div><div class="label-grid">${o.pieces.map(pc=>`<div class="garment-tag"><span class="print-org">${esc(org.name||"Laundry Desk")}</span><br><b>${esc(o.order_no)}</b><br>Customer: ${esc(o.customer.customer_code)}<br>Piece: <b>${pc.piece_no}/${o.pieces.length}</b><br><span class="mono">${esc(pc.tag_code)}</span></div>`).join("")}</div></div>`;
      if(window.QRCode)new QRCode(document.getElementById("printQr"),{text:o.order_no,width:90,height:90});
    }
    setTimeout(()=>{window.print();setBusy(false)},120);
  }

  function whatsapp(o){const phone=(o.customer.mobile||"").replace(/\D/g,""),org=business();const msg=`${org.name||"Laundry Desk"} — ${o.order_no}\nStatus: ${stageLabel(o.laundry_status)}\nTotal: ${ofmt(o,o.total)}\nPaid: ${ofmt(o,o.paid)}\nBalance: ${ofmt(o,o.outstanding)}\n\nReceipt PDF can be attached to this chat.`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank")}

  document.addEventListener("click",async e=>{
    const demoBtn=e.target.closest("[data-demo]"); if(demoBtn){const [u,p]=demoBtn.dataset.demo.split("|");id("loginIdentifier").value=u;id("loginPin").value=p;return}
    const themeBtn=e.target.closest("[data-theme-color]"); if(themeBtn){applyTheme(themeBtn.dataset.themeColor,true);state.modal=themeModal();renderApp();return}
    const modeBtn=e.target.closest("[data-theme-mode]"); if(modeBtn){applyMode(modeBtn.dataset.themeMode,true);state.modal=themeModal();renderApp();return}
    const v=e.target.closest("[data-view]")?.dataset.view;if(v){state.view=v;renderApp();if(v==="reports")loadReports(true);return}
    const q=e.target.closest("[data-qty]");if(q){const key=q.dataset.qty,delta=Number(q.dataset.delta);state.qty[key]=Math.max(0,Number(state.qty[key]||0)+delta);if(!state.qty[key])delete state.qty[key];const picker=id("itemPicker"),services=id("collectionServices"),summary=id("collectionSummary");if(picker)picker.innerHTML=itemPicker(state.serviceId);if(services)services.innerHTML=collectionServiceTabs();if(summary)summary.innerHTML=collectionSummary();return}
    const tab=e.target.closest("[data-admin-tab]"); if(tab){state.adminTab=tab.dataset.adminTab;document.querySelectorAll("[data-admin-tab]").forEach(x=>x.classList.toggle("active",x===tab));const panel=id("adminPanel");panel.innerHTML=state.adminTab==="super"?adminSuper():state.adminTab==="business"?adminBusiness():state.adminTab==="staff"?adminStaff():state.adminTab==="customers"?adminCustomers():state.adminTab==="rates"?adminRates():state.adminTab==="catalog"?adminCatalog():state.adminTab==="discounts"?adminDiscounts():adminSystem();bindDynamicForms();return}
    const stageFilter=e.target.closest("[data-filter-stage]");if(stageFilter){const key=stageFilter.dataset.filterStage||"all";if(key==="all")state.orderFilters.clear();else{if(state.orderFilters.has(key))state.orderFilters.delete(key);else state.orderFilters.add(key)}renderApp();return}
    const orderView=e.target.closest("[data-order-view]");if(orderView){state.orderView=orderView.dataset.orderView==="detailed"?"detailed":"optimal";localStorage.setItem("laundry_order_view",state.orderView);document.querySelectorAll("[data-order-view]").forEach(x=>x.classList.toggle("active",x.dataset.orderView===state.orderView));renderOrderList(state.data.actor.role!=="delivery");return}
    const workflow=e.target.closest("[data-workflow-mode]");if(workflow){state.workflowMode=workflow.dataset.workflowMode==="detailed"?"detailed":"quick";localStorage.setItem("laundry_workflow_mode",state.workflowMode);openOrder(workflow.dataset.id);return}
    const salesView=e.target.closest("[data-sales-view]");if(salesView){state.salesView=salesView.dataset.salesView;renderApp();return}
    const salesGroup=e.target.closest("[data-sales-group]");if(salesGroup){const group=salesGroup.dataset.salesGroup;if(group!==state.reportGroup){state.reportGroup=group;localStorage.setItem("laundry_report_group",group);loadReports(true)}return}
    const chartType=e.target.closest("[data-chart-type]");if(chartType){state.salesChartType=chartType.dataset.chartType;renderApp();return}
    const reportTab=e.target.closest("[data-report-tab]");if(reportTab){const changedCalendar=(state.reportTab==="calendar")!==(reportTab.dataset.reportTab==="calendar");state.reportTab=reportTab.dataset.reportTab;if(changedCalendar)loadReports(true);else renderApp();return}
    if(e.target.closest("[data-report-retry]")){loadReports(true);return}
    const reportPreset=e.target.closest("[data-report-preset]");if(reportPreset){selectReportPreset(reportPreset.dataset.reportPreset);return}
    const choice=e.target.closest("[data-choice-value]");if(choice){const group=choice.closest("[data-choice-group]"),input=group?.querySelector("[data-choice-input]");if(input){input.value=choice.dataset.choiceValue;group.querySelectorAll("[data-choice-value]").forEach(x=>x.classList.toggle("selected",x===choice));const form=group.closest("form");syncPaymentExtraFields(form);if(form?.id==="customerAccountPaymentForm")updateFinancePreview(form)}return}
    const customerChoice=e.target.closest("[data-customer-choice]");if(customerChoice){const picker=customerChoice.closest("[data-customer-picker]");chooseCustomer(picker,customerChoice.dataset.customerChoice);return}
    const customerClear=e.target.closest("[data-customer-clear]");if(customerClear){const picker=customerClear.closest("[data-customer-picker]");const hidden=picker?.querySelector("[data-customer-id]"),input=picker?.querySelector("[data-customer-search]"),selected=picker?.querySelector("[data-customer-selected]"),results=picker?.querySelector("[data-customer-results]");if(hidden)hidden.value="";if(input){input.value="";input.focus()}if(selected){selected.classList.remove("show");selected.innerHTML=""}if(results)renderCustomerSearch(picker,"");picker?.querySelector("[data-customer-search]")?.setAttribute("aria-expanded","true");if(picker?.dataset.financePicker==="true"){state.modal=customerFinanceModal(null);renderApp();setTimeout(()=>document.querySelector('.finance-modal [data-customer-search]')?.focus(),0)}return}
    if(!e.target.closest("[data-customer-picker]"))document.querySelectorAll("[data-customer-results].show").forEach(x=>x.classList.remove("show"));
    const countryChoice=e.target.closest("[data-country-choice]");if(countryChoice){const p=countryPreset(countryChoice.dataset.countryChoice);const form=countryChoice.closest("form");if(p&&form){form.querySelector('[name="country_code"]').value=p.code;form.querySelector('[name="country_name"]').value=p.name;const search=form.querySelector('[data-country-search]');if(search)search.value=p.name;form.querySelector('[name="timezone"]').value=p.timezone;form.querySelector('[name="currency"]').value=p.currency||form.querySelector('[name="currency"]').value;const isIndia=p.code==="IN";form.querySelector('[name="tax_type"]').value=isIndia?"GST":"VAT";form.querySelector('[data-tax-vat]')?.classList.toggle('hidden',isIndia);form.querySelector('[data-tax-gst]')?.classList.toggle('hidden',!isIndia);if(isIndia){form.querySelector('[name="cgst_percent"]').value="9";form.querySelector('[name="sgst_percent"]').value="9"}else{form.querySelector('[name="vat_percent"]').value=p.code==="AE"?"5":"0"}form.querySelector('[data-country-results]').innerHTML=""}return}
    const moveStage=e.target.closest("[data-stage-move]");if(moveStage){const row=moveStage.closest('[data-stage-row]'),list=row?.parentElement;if(row&&list){if(moveStage.dataset.stageMove==="up"&&row.previousElementSibling)list.insertBefore(row,row.previousElementSibling);if(moveStage.dataset.stageMove==="down"&&row.nextElementSibling)list.insertBefore(row.nextElementSibling,row);[...list.children].forEach((r,i)=>{r.querySelector('[data-stage-move="up"]')?.toggleAttribute('disabled',i===0);r.querySelector('[data-stage-move="down"]')?.toggleAttribute('disabled',i===list.children.length-1)})}return}
    const removeStage=e.target.closest("[data-stage-remove]");if(removeStage){removeStage.closest('[data-stage-row]')?.remove();return}
    const homeStage=e.target.closest("[data-home-stage]");if(homeStage){state.homeStageFilter=homeStage.dataset.homeStage||"all";renderApp();return}
    const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
    if(a==="super-add-stage"){const input=id("newStageName"),name=String(input?.value||"").trim();if(!name){markAttention(input);input?.focus();return}const list=id("superStageList"),code=`custom_${name.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}_${Date.now().toString(36).slice(-4)}`;if(list){const row=document.createElement("div");row.className="super-stage-row";row.dataset.stageRow="";row.dataset.code=code;row.innerHTML=`<button type="button" class="stage-order-btn" data-stage-move="up">↑</button><button type="button" class="stage-order-btn" data-stage-move="down">↓</button><div class="super-stage-name"><input class="input" data-stage-name value="${esc(name)}"><small>Custom stage</small></div><label class="stage-toggle"><input type="checkbox" data-stage-active checked><span>On</span></label><button type="button" class="btn tiny danger" data-stage-remove>Remove</button>`;const delivered=[...list.querySelectorAll('[data-stage-row]')].find(r=>r.dataset.code==="delivered");if(delivered)list.insertBefore(row,delivered);else list.appendChild(row);if(input)input.value=""}return}
    if(a==="logout")return logout(true,b); if(a==="toggle-theme"){applyMode(state.mode==="graphite"?"light":"graphite",true);renderApp();return} if(a==="theme")return openTheme(); if(a==="close-modal")return closeModal();
    if(a==="open-demo-reset")return openDemoReset();
    if(a==="set-quick-stage")return setQuickStageAction(b.dataset.id,b.dataset.status,b);
    if(a==="toggle-all-pickups"){const select=b.dataset.select==="true";document.querySelectorAll("[data-bulk-pickup]").forEach(x=>{if(select)state.bulkPickupSelected.add(x.dataset.bulkPickup);else state.bulkPickupSelected.delete(x.dataset.bulkPickup)});renderApp();return}
    if(a==="bulk-assign-pickups"){const driver=document.querySelector('[name="bulk_pickup_driver"]')?.value,orders=[...state.bulkPickupSelected];if(!orders.length)return toast("Select at least one pickup order",true);if(!driver)return toast("Choose a collection boy",true);try{setBusy(true,b,"Assigning pickups…");const r=await api("/action",{method:"POST",body:{action:"bulk_assign_pickups",driver_id:driver,order_ids:orders}});state.bulkPickupSelected.clear();await refresh();toast(`${r.assigned||0} pickup${Number(r.assigned||0)===1?'':'s'} assigned`)}catch(err){toast(err.message,true)}finally{setBusy(false)}return}
    if(a==="collection-service"){state.serviceId=b.dataset.id;state.garmentSearch="";const picker=id("itemPicker"),services=id("collectionServices"),search=id("garmentSearch");if(search)search.value="";if(picker)picker.innerHTML=itemPicker(state.serviceId);if(services)services.innerHTML=collectionServiceTabs();return}
    if(a==="finance-auto-oldest"){const form=b.closest("form");form?.querySelectorAll('[data-finance-order]').forEach(x=>x.checked=false);updateFinancePreview(form);return}
    if(a==="finance-select-all"){const form=b.closest("form");form?.querySelectorAll('[data-finance-order]').forEach(x=>x.checked=true);updateFinancePreview(form);return}
    if(a==="open-order")return openOrder(b.dataset.id); if(a==="counter-order")return openCounter(); if(a==="pickup-request")return openPickupRequest(); if(a==="receive-payment")return openReceivePayment(); if(a==="new-customer")return openCustomer(); if(a==="edit-customer")return openCustomer(state.data.customers.find(c=>c.id===b.dataset.id)); if(a==="customer-account")return openCustomerFinance(b.dataset.id,b);
    if(a==="collect")return openCollect(b.dataset.id); if(a==="deliver")return openDeliver(b.dataset.id);
    if(a==="payment")return openPayment(state.data.orders.find(o=>o.id===b.dataset.id)); if(a==="assign")return openAssign(state.data.orders.find(o=>o.id===b.dataset.id),b.dataset.kind,b.dataset.dispatch==="true"); if(a==="print-menu")return openPrintMenu(state.data.orders.find(o=>o.id===b.dataset.id));
    if(a==="advance"){const orderId=b.dataset.id,target=b.dataset.status;if(workflowSettings().confirm_stage_changes&&!confirm(`Move to ${stageLabel(target)}?`))return;try{setBusy(true,b,"Updating stage…");await api("/action",{method:"POST",body:{action:"advance_order",order_id:orderId,target_status:target}});await refresh();openOrder(orderId);toast(`Moved to ${stageLabel(target)}`)}catch(e){toast(e.message,true)}finally{setBusy(false)}return}
    if(a==="quick-advance")return doAction({action:"quick_advance",order_id:b.dataset.id},"Order updated",b,"Updating…");
    if(a==="credit")return doAction({action:"apply_credit",order_id:b.dataset.id},"Customer credit applied",b,"Applying credit…");
    if(a==="print-receipt")return printDoc(state.data.orders.find(o=>o.id===b.dataset.id),"receipt",b); if(a==="print-labels")return printDoc(state.data.orders.find(o=>o.id===b.dataset.id),"labels",b); if(a==="whatsapp")return whatsapp(state.data.orders.find(o=>o.id===b.dataset.id));
    if(a==="chart-png"||a==="chart-svg")return downloadSalesChart(a.slice(6));
    if(a==="export-excel")return exportExcel(b); if(a==="export-pdf")return exportPDF(b);
    if(a==="quick-save-rate"){const price=id("quickRatePrice")?.value,date=id("quickRateDate")?.value,garment=id("quickRateGarment")?.value,service=id("quickRateService")?.value;if(!garment||!service||price==="")return toast("Select garment, service and rate",true);return doAction({action:"save_rate",garment_type_id:garment,service_id:service,unit_price:price,effective_from:date},"Rate added",b,"Adding rate…")}
    if(a==="save-rate-row"){const row=document.querySelector(`[data-rate-row="${b.dataset.id}"]`),price=row?.querySelector("[data-rate-price]")?.value,date=row?.querySelector("[data-rate-date]")?.value;if(price===""||!date)return toast("Rate and effective date are required",true);return doAction({action:"save_rate",id:b.dataset.id,garment_type_id:b.dataset.garment,service_id:b.dataset.service,unit_price:price,effective_from:date},"Rate updated",b,"Saving rate…")}
    if(a==="new-staff")return openStaff(); if(a==="edit-staff")return openStaff(state.data.staff.find(s=>s.id===b.dataset.id)); if(a==="new-rate")return openRate(); if(a==="new-garment")return openCatalog("garment"); if(a==="edit-garment")return openCatalog("garment",state.data.refs.garments.find(x=>x.id===b.dataset.id)); if(a==="new-service")return openCatalog("service"); if(a==="edit-service")return openCatalog("service",state.data.refs.services.find(x=>x.id===b.dataset.id)); if(a==="new-discount")return openDiscount(); if(a==="edit-discount")return openDiscount(state.data.refs.discounts.find(x=>x.id===b.dataset.id));
    if(a==="toggle-customer")return doAction({action:"set_customer_access",customer_id:b.dataset.id,enabled:b.dataset.enabled!=="true"},"Customer access updated",b,"Updating access…");
    if(a==="reset-customer"){if(!confirm("Reset this customer's six-digit login code?"))return;try{setBusy(true,b,"Resetting code…");const r=await api("/action",{method:"POST",body:{action:"reset_customer_pin",customer_id:b.dataset.id}});await refresh();alert(`New customer code: ${r.pin}\nShare it privately with the customer.`)}catch(err){toast(err.message,true)}finally{setBusy(false)}return}
  });

  document.addEventListener("input",e=>{
    if(e.target.matches?.("[data-finance-amount]")){updateFinancePreview(e.target.closest("form"));return}
    const country=e.target.closest?.("[data-country-search]");if(country){const box=country.closest("form")?.querySelector("[data-country-results]");if(box)box.innerHTML=countrySearchResults(country.value).map(x=>`<button type="button" class="country-result" data-country-choice="${x[0]}"><b>${esc(x[1])}</b><span>${esc(x[2])} · ${esc(x[3]||'—')}</span></button>`).join("");return}
    const input=e.target.closest("[data-customer-search]");if(!input)return;
    const picker=input.closest("[data-customer-picker]");const hidden=picker?.querySelector("[data-customer-id]"),selected=picker?.querySelector("[data-customer-selected]");
    if(hidden)hidden.value="";if(selected){selected.classList.remove("show");selected.innerHTML=""}
    renderCustomerSearch(picker,input.value);
  });
  document.addEventListener("focusin",e=>{const input=e.target.closest("[data-customer-search]");if(input)renderCustomerSearch(input.closest("[data-customer-picker]"),input.value)});

  document.addEventListener("keydown",e=>{
    const search=e.target.closest?.("[data-customer-search]");
    if(search){
      const picker=search.closest("[data-customer-picker]"),results=picker?.querySelector("[data-customer-results]");
      if(e.key==="ArrowDown"){e.preventDefault();if(!results?.classList.contains("show"))renderCustomerSearch(picker,search.value);moveCustomerHighlight(picker,1);return}
      if(e.key==="ArrowUp"){e.preventDefault();if(!results?.classList.contains("show"))renderCustomerSearch(picker,search.value);moveCustomerHighlight(picker,-1);return}
      if(e.key==="Escape"){results?.classList.remove("show");search.setAttribute("aria-expanded","false");return}
      if(e.key==="Enter"&&results?.classList.contains("show")){if(selectHighlightedCustomer(picker)){e.preventDefault();return}const first=results.querySelector("[data-customer-choice]");if(first){e.preventDefault();chooseCustomer(picker,first.dataset.customerChoice);return}}
    }
    if(e.key!=="Enter"||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
    const target=e.target;if(target.matches?.("textarea,button,[type=submit],[type=button]"))return;
    const form=target.closest?.("form");if(!form)return;
    e.preventDefault();
    if(!form.checkValidity()){focusFirstInvalid(form);form.reportValidity();return}
    form.requestSubmit();
  });
  document.addEventListener("invalid",e=>{if(e.target?.matches?.("input,select,textarea"))markAttention(e.target)},true);
  document.addEventListener("input",e=>{e.target?.classList?.remove("field-attention")});
  document.addEventListener("change",e=>{e.target?.classList?.remove("field-attention")});

  document.addEventListener("change",e=>{
    if(e.target?.matches?.("[data-finance-order]")){updateFinancePreview(e.target.closest("form"));return}
    if(e.target?.matches?.("[data-bulk-pickup]")){if(e.target.checked)state.bulkPickupSelected.add(e.target.dataset.bulkPickup);else state.bulkPickupSelected.delete(e.target.dataset.bulkPickup);renderApp();return}
    if(e.target?.id==="customerBuildingFilter"){state.customerBuildingFilter=e.target.value;renderApp();return}
    if(e.target?.id==="customerSort"){state.customerSort=e.target.value;renderApp();return}
    if(e.target?.id==="pickupBuildingFilter"){state.pickupBuildingFilter=e.target.value;renderApp();return}
    if(e.target?.id==="pickupSort"){state.pickupSort=e.target.value;renderApp();return}
    if(e.target?.id==="deliveryBuildingFilter"){state.deliveryBuildingFilter=e.target.value;renderApp();return}
    if(e.target?.id==="deliverySort"){state.deliverySort=e.target.value;renderApp();return}
    if(e.target?.form?.id==="reportCustomForm"){if(e.target.name==="from")state.reportDraftFrom=e.target.value;if(e.target.name==="to")state.reportDraftTo=e.target.value;}
    if(e.target?.id==="salesPeriodPreset"){selectReportPreset(e.target.value);return}
    if(e.target?.id==="salesChartMetric"){state.salesChartMetric=e.target.value;renderApp();return}
    if(e.target?.id==="reportCurrency"){state.reportCurrency=e.target.value;loadReports(true);return}
    if(e.target?.id==="reportGroup"){state.reportGroup=e.target.value;localStorage.setItem("laundry_report_group",state.reportGroup);loadReports(true)}
    if(e.target?.id==="reportCalendarMonth"&&e.target.value){state.reportCalendarMonth=e.target.value;loadReports(true)}
  });

  let chartResizeTimer;window.addEventListener("resize",()=>{clearTimeout(chartResizeTimer);chartResizeTimer=setTimeout(()=>{const scroll=document.querySelector(".sales-chart-scroll");if(scroll&&state.reportData&&state.reportTab==="sales")scroll.innerHTML=salesChartSVG(state.reportData)},120)});
  window.addEventListener("online",()=>{if(state.token)refresh()});
  if(state.token) refresh(true); else renderLogin();
})();
