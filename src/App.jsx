import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ────────────────────────────────────────────
const SUPABASE_URL = "https://ouerpsdkpzsojjqzfezq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZXJwc2RrcHpzb2pqcXpmZXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDU2OTAsImV4cCI6MjA5NDY4MTY5MH0.AoYkAJFzAyvmgSCzdHiBTI7Qw4c3d53Yga_-CyM8m9c";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Season helper (June–May rule) ─────────────────────────────
function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0=Jan, 5=June
  const start = month >= 5 ? year : year - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

// ── Date formatter (British format) ───────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric" }).replace(/\//g,"-");
}

// ── Static reference data ──────────────────────────────────────
const TEAMS = ["Superstars","Fenwick","Ingram","Bowmont","Hawkhill","Portland",
  "Glanton","Longburn","Hauxley","Grasmere","Aberwick","Lions","Dunstan",
  "Auckland","Netherton","Lomond","Lumley","Firsts","Reserves"];
const AGE_GROUPS = ["U7s","U8s","U9s","U10s","U11s","U12s","U13s","U14s",
  "U15s","U16s","U17s","U18s","Adults","Superstars"];
const GENDERS = ["Male","Female","Prefer not to say"];
const NATIONALITIES = ["British","English","Scottish","Welsh","Irish","Other"];

// Kit/equipment items now loaded from Supabase catalogue table

// ── Design tokens ──────────────────────────────────────────────
const C = {
  navy:"#0a1628", blue:"#1a3a8f", royal:"#1e4fd8", bright:"#2563eb",
  white:"#ffffff", offwhite:"#f0f4ff", silver:"#cbd5e1", muted:"#64748b",
  border:"#1e3a7a", success:"#16a34a", warn:"#d97706", danger:"#dc2626",
  card:"#0f2044", input:"#0d1e3d",
};

const inp = { width:"100%", background:C.input, border:`1px solid ${C.border}`,
  borderRadius:8, padding:"11px 14px", color:C.white, fontSize:15,
  fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" };
// Date inputs: color-scheme:dark = white calendar icon, height matches other inputs
const dateInp = { ...inp, colorScheme:"dark", height:46, padding:"0 14px" };
const sel = { ...inp, appearance:"none" };
const btn = { background:`linear-gradient(135deg,${C.royal},${C.bright})`, color:C.white,
  border:"none", borderRadius:10, padding:"13px 24px", fontSize:15, fontWeight:700,
  cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const card = { background:`linear-gradient(145deg,${C.card},#0a1830)`,
  border:`1px solid ${C.border}`, borderRadius:14, padding:18,
  boxShadow:"0 4px 24px rgba(0,0,0,0.35)" };
const lbl = { display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.08em",
  textTransform:"uppercase", color:C.silver, marginBottom:5, fontFamily:"'DM Sans',sans-serif" };
const secHead = { margin:"0 0 14px", fontSize:12, letterSpacing:"0.08em",
  textTransform:"uppercase", color:C.silver, fontFamily:"'DM Sans',sans-serif", fontWeight:700,
  borderBottom:`1px solid ${C.border}`, paddingBottom:9 };

// ── Shared components ──────────────────────────────────────────
const Bdg = ({s:status}) => (
  <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:10,
    fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
    fontFamily:"'DM Sans',sans-serif",
    background:status==="pending"?"rgba(217,119,6,0.2)":"rgba(22,163,74,0.2)",
    color:status==="pending"?C.warn:C.success,
    border:`1px solid ${status==="pending"?C.warn:C.success}` }}>{status}</span>
);

// #1 — Real club badge
function Crest({size=48, glow=false}) {
  return (
    <img
      src="/Badge_No_Background.svg"
      alt="Waldridge Park JFC"
      width={size}
      height={size}
      style={{
        filter: glow ? "drop-shadow(0 0 14px rgba(30,79,216,0.8))" : "none",
        flexShrink: 0,
        objectFit: "contain",
      }}
    />
  );
}

function F({label, children, mb=16}) {
  return <div style={{marginBottom:mb}}><label style={lbl}>{label}</label>{children}</div>;
}

function Section({title, children}) {
  return (
    <div style={{...card, marginBottom:14}}>
      <div style={secHead}>{title}</div>
      {children}
    </div>
  );
}

function Stepper({value, onChange, min=1, max=99}) {
  return (
    <div style={{display:"flex", alignItems:"center", border:`1px solid ${C.border}`,
      borderRadius:10, overflow:"hidden", background:C.input, width:"fit-content"}}>
      <button onClick={()=>onChange(Math.max(min, value-1))}
        style={{width:46, height:46, background:"transparent", border:"none",
          color:C.white, fontSize:24, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:300}}>−</button>
      <div style={{minWidth:38, textAlign:"center", fontSize:17, fontWeight:700,
        fontFamily:"'DM Sans',sans-serif", color:C.white}}>{value}</div>
      <button onClick={()=>onChange(Math.min(max, value+1))}
        style={{width:46, height:46, background:"transparent", border:"none",
          color:C.white, fontSize:24, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:300}}>+</button>
    </div>
  );
}

// #21 — Close button at bottom of modal content so it's always reachable on mobile
function Modal({onClose, title, children}) {
  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", display:"flex",
      alignItems:"flex-end", justifyContent:"center", zIndex:200}} onClick={onClose}>
      <div style={{...card, width:"100%", maxWidth:600, maxHeight:"92vh", overflowY:"auto",
        borderRadius:"18px 18px 0 0", padding:0}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"16px 18px 12px", borderBottom:`1px solid ${C.border}`,
          position:"sticky", top:0, background:C.card, borderRadius:"18px 18px 0 0", zIndex:1}}>
          <div style={{fontSize:17, fontWeight:700, fontFamily:"'Crimson Pro',Georgia,serif"}}>{title}</div>
        </div>
        <div style={{padding:18}}>
          {children}
          {/* Close button at bottom — always visible without scrolling up */}
          <button onClick={onClose} style={{...btn, width:"100%", marginTop:18,
            background:`linear-gradient(135deg,${C.muted},#475569)`}}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrBanner({msg}) {
  if (!msg) return null;
  return <div style={{background:"rgba(220,38,38,0.15)", border:`1px solid ${C.danger}`,
    borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:13,
    color:C.danger, fontFamily:"'DM Sans',sans-serif"}}>{msg}</div>;
}

function Spinner() {
  return <div style={{display:"flex", alignItems:"center", justifyContent:"center", padding:40}}>
    <div style={{width:32, height:32, border:`3px solid ${C.border}`,
      borderTop:`3px solid ${C.royal}`, borderRadius:"50%",
      animation:"spin 0.8s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

// ── Layout ─────────────────────────────────────────────────────
function Topbar({user, onLogout, active}) {
  const titles = {dashboard:"Home", registration:"New Registration", kitorder:"Kit Order", secretary:"Secretary"};
  return (
    <div style={{background:`linear-gradient(90deg,${C.navy},${C.card})`,
      borderBottom:`1px solid ${C.border}`, padding:"0 14px",
      display:"flex", alignItems:"center", justifyContent:"space-between", height:56, flexShrink:0}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <Crest size={34}/>
        <div>
          {/* #3 — Full club name */}
          <div style={{fontSize:13, fontWeight:700, color:C.white, lineHeight:1.1,
            fontFamily:"'Crimson Pro',Georgia,serif"}}>Waldridge Park JFC</div>
          <div style={{fontSize:10, color:C.muted, fontFamily:"'DM Sans',sans-serif",
            letterSpacing:"0.06em", textTransform:"uppercase"}}>{titles[active]||"Club Management"}</div>
        </div>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", color:C.white}}>
            {user.name.split(" ")[0]}</div>
          <div style={{fontSize:10, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>
            {user.teams.join(", ")}</div>
        </div>
        <button onClick={onLogout} style={{background:"transparent", border:`1px solid ${C.border}`,
          borderRadius:8, padding:"5px 11px", color:C.muted, fontSize:12,
          cursor:"pointer", fontFamily:"'DM Sans',sans-serif"}}>Out</button>
      </div>
    </div>
  );
}

function BottomNav({active, setActive, isSecretary}) {
  const tabs = [
    {id:"dashboard", icon:"⊞", label:"Home"},
    {id:"registration", icon:"✚", label:"Register"},
    {id:"kitorder", icon:"🛒", label:"Kit"},
    ...(isSecretary ? [{id:"secretary", icon:"★", label:"Secretary"}] : []),
  ];
  return (
    <div style={{display:"flex", background:C.navy, borderTop:`1px solid ${C.border}`, flexShrink:0}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setActive(t.id)}
          style={{flex:1, padding:"10px 4px 8px", background:"transparent", border:"none",
            borderTop:active===t.id?`2px solid ${C.royal}`:"2px solid transparent",
            color:active===t.id?C.white:C.muted, display:"flex", flexDirection:"column",
            alignItems:"center", gap:3, cursor:"pointer"}}>
          <span style={{fontSize:19}}>{t.icon}</span>
          <span style={{fontSize:10, fontFamily:"'DM Sans',sans-serif",
            fontWeight:active===t.id?700:400, letterSpacing:"0.04em"}}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    setErr(""); setLoading(true);
    const {data, error} = await sb.auth.signInWithPassword({email, password:pw});
    if (error) { setErr(error.message); setLoading(false); return; }
    const {data:profile, error:pErr} = await sb.rpc("get_my_profile");
    if (pErr || !profile) {
      setErr(`Profile error: ${pErr?.message||"unknown"}`);
      setLoading(false); return;
    }
    onLogin({id:data.user.id, name:profile.name, role:profile.role,
      isSecretary:profile.is_secretary, teams:profile.teams||[]});
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh", background:`linear-gradient(160deg,${C.navy} 0%,#060e1c 100%)`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:24, fontFamily:"'Crimson Pro',Georgia,serif", color:C.white, position:"relative", overflow:"hidden"}}>
      <div style={{position:"absolute", inset:0, opacity:0.03,
        backgroundImage:`linear-gradient(${C.white} 1px,transparent 1px),linear-gradient(90deg,${C.white} 1px,transparent 1px)`,
        backgroundSize:"40px 40px"}}/>
      <div style={{position:"relative", width:"100%", maxWidth:400}}>
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", marginBottom:36}}>
          <Crest size={120} glow/>
          <h1 style={{margin:"18px 0 4px", fontSize:28, fontWeight:700, letterSpacing:"0.02em", textAlign:"center"}}>
            Waldridge Park</h1>
          <div style={{fontSize:12, color:C.muted, fontFamily:"'DM Sans',sans-serif",
            letterSpacing:"0.14em", textTransform:"uppercase"}}>Junior Football Club · Est. 1988</div>
        </div>
        <div style={card}>
          <ErrBanner msg={err}/>
          <F label="Email Address">
            <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="you@wpjfc.co.uk" onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
          </F>
          <F label="Password">
            <input style={inp} type="password" value={pw} onChange={e=>setPw(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
          </F>
          <button style={{...btn, width:"100%", padding:15, fontSize:16, opacity:loading?0.6:1}}
            onClick={doLogin} disabled={loading}>
            {loading?"Signing in…":"Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────
function DashboardView({user, setActive}) {
  const [stats, setStats] = useState({pendingRegs:0, pendingOrders:0});

  useEffect(()=>{
    // Use RPC to avoid RLS permission issues on direct table queries
    async function load() {
      const [{data:regs},{data:orders}] = await Promise.all([
        sb.rpc("get_my_pending_counts", {uid: user.id, is_sec: user.isSecretary}),
        sb.rpc("get_my_pending_counts", {uid: user.id, is_sec: user.isSecretary}),
      ]);
      // Simpler: just fetch all registrations and orders via existing RPCs and count
      const [rData, oData] = await Promise.all([
        user.isSecretary
          ? sb.rpc("get_all_registrations")
          : sb.from("registrations").select("id,status").eq("submitted_by",user.id),
        user.isSecretary
          ? sb.rpc("get_all_kit_orders")
          : sb.from("kit_orders").select("id,status").eq("submitted_by",user.id),
      ]);
      const recs = rData.data || [];
      const ords = oData.data || [];
      setStats({
        pendingRegs: recs.filter(r=>r.status==="pending").length,
        pendingOrders: ords.filter(o=>o.status==="pending").length,
      });
    }
    load();
  },[user]);

  // #4 — each tile navigates to the correct tab in My Submissions
  const statTiles = [
    {label:"Pending Regs",   value:stats.pendingRegs,   color:C.warn,    action:()=>setActive("mysubmissions_regs")},
    {label:"Pending Orders", value:stats.pendingOrders, color:C.royal,   action:()=>setActive("mysubmissions_orders")},
    {label:"Your Teams",     value:user.teams.length,   color:C.success, action:null},
    {label:"Season",         value:currentSeason(),     color:C.silver,  action:null},
  ];

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px", fontSize:24, fontFamily:"'Crimson Pro',Georgia,serif"}}>
        Welcome, {user.name.split(" ")[0]}</h2>
      <p style={{margin:"0 0 22px", color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13}}>
        {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
      </p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18}}>
        {statTiles.map(st=>(
          <div key={st.label}
            onClick={st.action||undefined}
            style={{...card, borderTop:`3px solid ${st.color}`, padding:14,
              cursor:st.action?"pointer":"default",
              transition:"opacity 0.15s",
            }}
            onMouseEnter={e=>{if(st.action)e.currentTarget.style.opacity="0.8";}}
            onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>
            <div style={{fontSize:30, fontWeight:700, color:st.color, fontFamily:"'Crimson Pro',Georgia,serif"}}>{st.value}</div>
            <div style={{fontSize:11, color:C.silver, fontFamily:"'DM Sans',sans-serif", marginTop:2}}>{st.label}</div>
            {st.action&&<div style={{fontSize:10,color:st.color,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Tap to view →</div>}
          </div>
        ))}
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {[
          {id:"registration", icon:"✚", title:"New Registration", desc:"Register a player for your team"},
          {id:"kitorder",     icon:"🛒", title:"Kit Order",        desc:"Order kit and equipment"},
          ...(user.isSecretary?[{id:"secretary",icon:"★",title:"Secretary Dashboard",desc:"Review all submissions"}]:[])
        ].map(item=>(
          <button key={item.id} onClick={()=>setActive(item.id)}
            style={{...card, display:"flex", alignItems:"center", gap:14, border:"none",
              cursor:"pointer", textAlign:"left", padding:16}}>
            <div style={{width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.blue},${C.royal})`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0}}>{item.icon}</div>
            <div>
              <div style={{fontSize:16, fontWeight:700, color:C.white, fontFamily:"'Crimson Pro',Georgia,serif"}}>{item.title}</div>
              <div style={{fontSize:12, color:C.muted, fontFamily:"'DM Sans',sans-serif", marginTop:2}}>{item.desc}</div>
            </div>
            <div style={{marginLeft:"auto", color:C.muted, fontSize:20}}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Registration form ──────────────────────────────────────────
const EMPTY_REG = (teams) => ({
  team:teams[0]||"", ageGroup:"", firstName:"", surname:"", address:"",
  postcode:"", dob:"", gender:"", nationality:"", parentName:"",
  parentDob:"", parentEmail:"", parentPhone:"", idSeen:false, photo:null,
});

function RegistrationForm({user}) {
  const [form, setForm] = useState(()=>EMPTY_REG(user.teams));
  const [preview, setPreview] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false); // #9
  const fileRef = useRef();
  const teamOpts = user.isSecretary ? TEAMS : user.teams;

  const set = useCallback((k,v) => setForm(f=>({...f,[k]:v})), []);

  // #8 — no capture attribute so user gets camera/file choice
  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return;
    set("photo", file);
    const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(file);
  };

  const doSubmit = async () => {
    setConfirm(false);
    setErr(""); setLoading(true);
    try {
      let photo_url = null;
      if (form.photo) {
        const ext = form.photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const {error:upErr} = await sb.storage.from("player-photos").upload(path, form.photo);
        if (upErr) throw upErr;
        const {data:urlData} = sb.storage.from("player-photos").getPublicUrl(path);
        photo_url = urlData.publicUrl;
      }
      const {error} = await sb.rpc("submit_registration", {payload:{
        team:form.team, age_group:form.ageGroup||"",
        first_name:form.firstName, surname:form.surname,
        dob:form.dob||null, gender:form.gender, nationality:form.nationality,
        address:form.address, postcode:form.postcode,
        parent_name:form.parentName, parent_dob:form.parentDob||null,
        parent_email:form.parentEmail, parent_phone:form.parentPhone,
        id_seen:form.idSeen, photo_url,
      }});
      if (error) throw error;
      setDone(true);
    } catch(e) { setErr(e.message||"Submission failed."); }
    setLoading(false);
  };

  if (done) return (
    <div style={{padding:40, display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:400, textAlign:"center"}}>
      <div style={{width:70, height:70, borderRadius:"50%", background:"rgba(22,163,74,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, marginBottom:18,
        border:`2px solid ${C.success}`}}>✓</div>
      <h2 style={{margin:"0 0 8px", fontFamily:"'Crimson Pro',Georgia,serif", fontSize:22}}>Registration Submitted</h2>
      <p style={{color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:14}}>
        {form.firstName} {form.surname} registered for {form.team}.</p>
      <button style={{...btn, marginTop:22}}
        onClick={()=>{setDone(false);setPreview(null);setForm(EMPTY_REG(user.teams));}}>
        Register Another
      </button>
    </div>
  );

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px", fontSize:22, fontFamily:"'Crimson Pro',Georgia,serif"}}>New Registration</h2>
      <p style={{margin:"0 0 20px", color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13}}>
        Photo and ID verification required.</p>
      <ErrBanner msg={err}/>

      <Section title="Player Details">
        <F label="Team">
          <select style={sel} value={form.team} onChange={e=>set("team",e.target.value)}>
            {teamOpts.map(t=><option key={t}>{t}</option>)}
          </select>
        </F>
        <F label="Age Group">
          <select style={sel} value={form.ageGroup} onChange={e=>set("ageGroup",e.target.value)}>
            <option value="">Select...</option>{AGE_GROUPS.map(a=><option key={a}>{a}</option>)}
          </select>
        </F>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <F label="First Name"><input style={inp} value={form.firstName} onChange={e=>set("firstName",e.target.value)}/></F>
          <F label="Surname"><input style={inp} value={form.surname} onChange={e=>set("surname",e.target.value)}/></F>
        </div>
        <F label="Address">
          <input style={inp} value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Street address"/>
        </F>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <F label="Postcode">
            <input style={inp} value={form.postcode} onChange={e=>set("postcode",e.target.value.toUpperCase())}/>
          </F>
          {/* #5 #10 — date input clipped by wrapper to prevent mobile overflow */}
          <F label="Date of Birth">
            <div style={{overflow:"hidden", borderRadius:8}}>
              <input style={dateInp} type="date"
                value={form.dob} onChange={e=>set("dob",e.target.value)}/>
            </div>
          </F>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          {/* #6 — Non-binary removed */}
          <F label="Gender">
            <select style={sel} value={form.gender} onChange={e=>set("gender",e.target.value)}>
              <option value="">Select...</option>{GENDERS.map(g=><option key={g}>{g}</option>)}
            </select>
          </F>
          <F label="Nationality">
            <select style={sel} value={form.nationality} onChange={e=>set("nationality",e.target.value)}>
              <option value="">Select...</option>{NATIONALITIES.map(n=><option key={n}>{n}</option>)}
            </select>
          </F>
        </div>
      </Section>

      <Section title="Parent / Guardian">
        <F label="Full Name"><input style={inp} value={form.parentName} onChange={e=>set("parentName",e.target.value)}/></F>
        {/* #7 — date input clipped by wrapper to prevent mobile overflow */}
        <F label="Date of Birth">
          <div style={{overflow:"hidden", borderRadius:8}}>
            <input style={dateInp} type="date"
              value={form.parentDob} onChange={e=>set("parentDob",e.target.value)}/>
          </div>
        </F>
        <F label="Email Address"><input style={inp} type="email" value={form.parentEmail} onChange={e=>set("parentEmail",e.target.value)}/></F>
        <F label="Contact Number"><input style={inp} type="tel" value={form.parentPhone} onChange={e=>set("parentPhone",e.target.value)}/></F>
      </Section>

      <Section title="Photo & Identity">
        <F label="Player Headshot">
          {/* #8 — no capture attr, gives camera/file choice on iOS */}
          <div onClick={()=>fileRef.current.click()}
            style={{border:`2px dashed ${C.border}`, borderRadius:12, padding:18, textAlign:"center",
              cursor:"pointer", background:C.input, minHeight:100, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:8}}>
            {preview
              ? <img src={preview} alt="Preview" style={{maxHeight:120, maxWidth:"100%", borderRadius:10, objectFit:"cover"}}/>
              : <><div style={{fontSize:34}}>📷</div>
                  <div style={{fontSize:13, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>Tap to choose photo or take with camera</div></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*"
            style={{display:"none"}} onChange={handlePhoto}/>
        </F>
        <label style={{display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer",
          background:C.input, borderRadius:12, padding:14,
          border:`1px solid ${form.idSeen?C.success:C.border}`}}>
          <input type="checkbox" checked={form.idSeen} onChange={e=>set("idSeen",e.target.checked)}
            style={{width:22, height:22, accentColor:C.royal, flexShrink:0, marginTop:1}}/>
          <div>
            <div style={{fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif", marginBottom:3}}>ID Seen & Verified</div>
            <div style={{fontSize:12, color:C.muted, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5}}>
              I confirm I have physically inspected this player's Passport or Birth Certificate.</div>
          </div>
        </label>
      </Section>

      {/* #9 — confirmation dialog */}
      {confirm && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:300, padding:24}}>
          <div style={{...card, maxWidth:420, width:"100%"}}>
            <div style={{fontSize:18, fontWeight:700, fontFamily:"'Crimson Pro',Georgia,serif", marginBottom:14}}>
              Confirm Registration</div>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.silver, lineHeight:1.6, marginBottom:22}}>
              By clicking Submit you are confirming that the parents of this player have set up their
              standing order and that all FA rules around approaching players of other clubs have been followed.
            </p>
            <div style={{display:"flex", gap:10}}>
              <button style={{...btn, flex:1}} onClick={doSubmit}>Submit</button>
              <button style={{flex:1, background:"transparent", color:C.muted, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"13px 24px", fontSize:15, fontWeight:700,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif"}}
                onClick={()=>setConfirm(false)}>Go Back</button>
            </div>
          </div>
        </div>
      )}

      <button style={{...btn, width:"100%", padding:15, fontSize:16, opacity:loading?0.6:1}}
        onClick={()=>setConfirm(true)} disabled={loading}>
        {loading?"Submitting…":"Submit Registration"}
      </button>
    </div>
  );
}

// ── Kit order form ─────────────────────────────────────────────
function KitOrderForm({user}) {
  const [tab, setTab] = useState("kit");
  const [ageGroup, setAgeGroup] = useState("");
  const [team, setTeam] = useState(user.teams[0]||"");
  const [items, setItems] = useState([]);
  const [special, setSpecial] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);
  const [mSize, setMSize] = useState("");
  const [mQty, setMQty] = useState(1);
  const [catalogue, setCatalogue] = useState([]);
  const teamOpts = user.isSecretary ? TEAMS : user.teams;

  useEffect(()=>{
    sb.rpc("get_catalogue").then(({data})=>{ setCatalogue(data||[]); });
  },[]);

  const kitItems = catalogue.filter(i=>i.category==="kit");
  const equipItems = catalogue.filter(i=>i.category==="equipment");

  const openModal = (type, item) => { setModal({type, item}); setMSize(""); setMQty(1); };

  const confirmAdd = () => {
    const item = modal.item;
    // #13 — GK shirt defaults squad to "1"
    const defaultSquad = item.personalisation === "gk_squad" ? "1" : "";
    setItems(prev=>[...prev, {
      id:Date.now(), name:item.name, size:mSize, qty:mQty,
      personalisation: item.personalisation === "gk_squad" ? "squad_required" : item.personalisation,
      personalisations: Array(mQty).fill(null).map((_,i)=>({
        squad: item.personalisation==="gk_squad" ? String(i===0?"1":"") : defaultSquad,
        initials:"",
      })),
    }]);
    setModal(null);
  };

  const removeItem = id => setItems(prev=>prev.filter(i=>i.id!==id));

  const updateQty = (id, n) => setItems(prev=>prev.map(oi=>{
    if (oi.id!==id) return oi;
    const p = [...oi.personalisations];
    const next = Array(n).fill(null).map((_,i)=>p[i]||{squad:"",initials:""});
    return {...oi, qty:n, personalisations:next};
  }));

  const updateP = (id, idx, field, val) => setItems(prev=>prev.map(oi=>{
    if (oi.id!==id) return oi;
    const p = [...oi.personalisations]; p[idx] = {...p[idx],[field]:val};
    return {...oi, personalisations:p};
  }));

  const needsP = p => p==="squad_required"||p==="optional"||p==="initials_optional";

  // #12 — validate squad numbers are present and unique for shirts
  const validateSquads = () => {
    for (const oi of items) {
      if (oi.personalisation === "squad_required") {
        const squads = oi.personalisations.map(p=>p.squad.trim()).filter(Boolean);
        if (squads.length < oi.qty) {
          return `All squad numbers are required for ${oi.name}.`;
        }
        const unique = new Set(squads);
        if (unique.size < squads.length) {
          return `Duplicate squad numbers found for ${oi.name}. Each must be unique.`;
        }
      }
    }
    return null;
  };

  const submit = async () => {
    // #16 — age group mandatory
    if (!ageGroup) { setErr("Please select an age group before submitting."); return; }
    const squadErr = validateSquads();
    if (squadErr) { setErr(squadErr); return; }
    setErr(""); setLoading(true);
    try {
      const {error} = await sb.rpc("submit_kit_order", {payload:{
        team, age_group:ageGroup, special_request:special,
        items:items.map(i=>({
          item_name:i.name, size:i.size||null, qty:i.qty,
          personalisation_type:i.personalisation||null,
          personalisation_data:i.personalisations,
        })),
      }});
      if (error) throw error;
      setDone(true);
    } catch(e) { setErr(e.message||"Submission failed."); }
    setLoading(false);
  };

  if (done) return (
    <div style={{padding:40, display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:400, textAlign:"center"}}>
      <div style={{width:70, height:70, borderRadius:"50%", background:"rgba(22,163,74,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, marginBottom:18,
        border:`2px solid ${C.success}`}}>✓</div>
      <h2 style={{margin:"0 0 8px", fontFamily:"'Crimson Pro',Georgia,serif", fontSize:22}}>Order Submitted</h2>
      <p style={{color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:14}}>
        Kit order for {team} sent to secretary.</p>
      <button style={{...btn, marginTop:22}} onClick={()=>{setDone(false);setItems([]);setSpecial("");}}>New Order</button>
    </div>
  );

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px", fontSize:22, fontFamily:"'Crimson Pro',Georgia,serif"}}>Kit Order</h2>
      <p style={{margin:"0 0 12px", color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13}}>
        Select items, adjust quantities and add personalisation.</p>

      {/* #17 — policy info box */}
      <div style={{background:"rgba(30,79,216,0.12)", border:`1px solid ${C.royal}`, borderRadius:10,
        padding:"12px 14px", marginBottom:14, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.silver, lineHeight:1.6}}>
        ℹ️ All kit must be ordered in accordance with the club's{" "}
        <a href="https://www.waldridgepark.co.uk/club-policies" target="_blank" rel="noreferrer"
          style={{color:C.bright}}>kit and equipment policies</a>.{" "}
        For sizing, see the{" "}
        <a href="https://www.pendlesportswear.co.uk/size-guides/" target="_blank" rel="noreferrer"
          style={{color:C.bright}}>Pendle size guide</a>.
      </div>

      <ErrBanner msg={err}/>

      <div style={{...card, marginBottom:14}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10}}>
          <F label="Team" mb={0}>
            <select style={sel} value={team} onChange={e=>setTeam(e.target.value)}>
              {teamOpts.map(t=><option key={t}>{t}</option>)}
            </select>
          </F>
          {/* #16 — age group marked required */}
          <F label="Age Group *" mb={0}>
            <select style={{...sel, borderColor:!ageGroup?C.warn:C.border}}
              value={ageGroup} onChange={e=>setAgeGroup(e.target.value)}>
              <option value="">Select...</option>{AGE_GROUPS.map(a=><option key={a}>{a}</option>)}
            </select>
          </F>
        </div>
        <F label="Team Contact" mb={0}>
          <input style={{...inp, color:C.muted}} value={user.name} readOnly/>
        </F>
      </div>

      <div style={{display:"flex", gap:4, marginBottom:12, background:C.card,
        borderRadius:10, padding:4, border:`1px solid ${C.border}`}}>
        {/* #11 — kit first */}
        {["kit","equipment"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{flex:1, padding:"9px 0", borderRadius:8, border:"none",
              background:tab===t?`linear-gradient(135deg,${C.royal},${C.bright})`:"transparent",
              color:tab===t?C.white:C.muted, fontFamily:"'DM Sans',sans-serif",
              fontSize:13, fontWeight:700, cursor:"pointer", textTransform:"capitalize"}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14}}>
        {(tab==="equipment"?equipItems:kitItems).map(item=>(
          <button key={item.id} onClick={()=>openModal(tab,item)}
            style={{background:C.input, border:`1px solid ${C.border}`, borderRadius:12,
              padding:13, color:C.white, cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{fontSize:13, fontWeight:700, marginBottom:2}}>{item.name}</div>
            <div style={{fontSize:10, color:C.royal, fontWeight:700, marginBottom:4, textTransform:"uppercase",
              letterSpacing:"0.06em"}}>{item.brand}</div>
            <div style={{fontSize:10, color:C.muted, marginBottom:6}}>
              {item.sizes ? item.sizes.join(" · ") : "No size"}
              {item.u13above?" · U13+":""}</div>
            {item.personalisation==="squad_required"&&
              <div style={{fontSize:10, color:C.warn, fontWeight:700}}>⚠ Squad no. required</div>}
            {item.personalisation==="gk_squad"&&
              <div style={{fontSize:10, color:C.warn, fontWeight:700}}>⚠ Squad no. required</div>}
            {(item.personalisation==="optional"||item.personalisation==="initials_optional")&&
              <div style={{fontSize:10, color:C.muted}}>Personalisation optional</div>}
            <div style={{marginTop:8, fontSize:11, color:C.royal, fontWeight:700}}>+ Add to order</div>
          </button>
        ))}
        {catalogue.length===0&&(
          <div style={{gridColumn:"1/-1", color:C.muted, fontFamily:"'DM Sans',sans-serif",
            fontSize:13, padding:"20px 0", textAlign:"center"}}>Loading catalogue…</div>
        )}
      </div>

      {items.length>0&&(
        <div style={{...card, marginBottom:14}}>
          <div style={secHead}>Order · {items.length} line{items.length!==1?"s":""}</div>
          {items.map((oi,idx)=>(
            <div key={oi.id} style={{background:C.input, borderRadius:10, padding:13,
              marginBottom:10, border:`1px solid ${C.border}`}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                <div>
                  <span style={{fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif"}}>
                    {idx+1}. {oi.name}</span>
                  {oi.size&&<span style={{color:C.muted, fontSize:12, fontFamily:"'DM Sans',sans-serif", marginLeft:6}}>· {oi.size}</span>}
                </div>
                <button onClick={()=>removeItem(oi.id)}
                  style={{background:"transparent", border:"none", color:C.danger, cursor:"pointer", fontSize:20, padding:2}}>✕</button>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:needsP(oi.personalisation)?12:0}}>
                <span style={{fontSize:12, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>Qty:</span>
                <Stepper value={oi.qty} onChange={v=>updateQty(oi.id,v)}/>
              </div>
              {needsP(oi.personalisation)&&(
                <div>
                  <div style={{fontSize:10, color:C.muted, fontFamily:"'DM Sans',sans-serif",
                    marginBottom:7, textTransform:"uppercase", letterSpacing:"0.06em"}}>
                    {oi.personalisation==="squad_required"?"Squad numbers (required)":"Personalisation (optional)"}</div>
                  {oi.personalisations.map((p,i)=>(
                    <div key={i} style={{display:"flex", alignItems:"center", gap:7, marginBottom:6}}>
                      <span style={{fontSize:11, color:C.muted, fontFamily:"'DM Sans',sans-serif",
                        minWidth:18, fontWeight:700}}>{i+1}</span>
                      {(oi.personalisation==="squad_required"||oi.personalisation==="optional")&&(
                        <input style={{...inp, padding:"7px 9px", fontSize:13, flex:1}}
                          value={p.squad||""} placeholder="Squad #"
                          onChange={e=>updateP(oi.id,i,"squad",e.target.value)}/>
                      )}
                      {(oi.personalisation==="optional"||oi.personalisation==="initials_optional")&&(
                        <input style={{...inp, padding:"7px 9px", fontSize:13, flex:1}}
                          value={p.initials||""} placeholder="Initials"
                          onChange={e=>updateP(oi.id,i,"initials",e.target.value)}/>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{...card, marginBottom:22}}>
        <F label="Special Requests / Notes" mb={0}>
          <textarea style={{...inp, minHeight:68, resize:"vertical"}} value={special}
            onChange={e=>setSpecial(e.target.value)} placeholder="Any additional information..."/>
        </F>
      </div>

      <button style={{...btn, width:"100%", padding:15, fontSize:16,
        opacity:(items.length===0||loading)?0.4:1, cursor:items.length===0?"not-allowed":"pointer"}}
        onClick={()=>items.length>0&&submit()} disabled={loading||items.length===0}>
        {loading?"Submitting…":`Submit Order · ${items.length} item${items.length!==1?"s":""}`}
      </button>

      {/* #15 — modal has enough bottom padding to clear bottom nav, close at bottom */}
      {modal&&(
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", display:"flex",
          alignItems:"flex-end", justifyContent:"center", zIndex:200}} onClick={()=>setModal(null)}>
          <div style={{...card, width:"100%", maxWidth:600, borderRadius:"18px 18px 0 0", padding:0,
            maxHeight:"80vh", overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"16px 18px 12px", borderBottom:`1px solid ${C.border}`,
              position:"sticky", top:0, background:C.card, borderRadius:"18px 18px 0 0"}}>
              <div style={{fontSize:17, fontWeight:700, fontFamily:"'Crimson Pro',Georgia,serif"}}>
                Add {modal.item.name}</div>
            </div>
            <div style={{padding:"18px 18px 8px"}}>
              {modal.item.sizes&&modal.item.sizes.length>0&&(
                <F label="Size">
                  <select style={sel} value={mSize} onChange={e=>setMSize(e.target.value)}>
                    <option value="">Select size...</option>
                    {modal.item.sizes.map(sz=><option key={sz}>{sz}</option>)}
                  </select>
                </F>
              )}
              <div style={{marginBottom:22}}>
                <label style={lbl}>Quantity</label>
                <Stepper value={mQty} onChange={setMQty}/>
              </div>
              <button style={{...btn, width:"100%", marginBottom:10}} onClick={confirmAdd}>
                Add to Order
              </button>
              <button style={{width:"100%", background:"transparent", color:C.muted,
                border:`1px solid ${C.border}`, borderRadius:10, padding:"13px 24px",
                fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                marginBottom:8}}
                onClick={()=>setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Secretary detail modals ────────────────────────────────────
function RegDetail({reg, onClose, onToggle}) {
  const d = reg;
  const [photoUrl, setPhotoUrl] = useState(d.photo_url||null);

  // #19 — if the stored public URL fails, try generating a signed URL
  useEffect(()=>{
    if (!d.photo_url) return;
    // Extract the storage path from the URL (everything after /player-photos/)
    const match = d.photo_url.match(/player-photos\/(.+)$/);
    if (!match) return;
    const path = match[1];
    sb.storage.from("player-photos").createSignedUrl(path, 3600)
      .then(({data})=>{ if (data?.signedUrl) setPhotoUrl(data.signedUrl); });
  },[d.photo_url]);

  const Row = ({label,value}) => (
    <div style={{display:"flex", gap:8, marginBottom:9, fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:11, color:C.muted, minWidth:120, flexShrink:0,
        textTransform:"uppercase", letterSpacing:"0.06em", paddingTop:1}}>{label}</div>
      <div style={{fontSize:13, color:C.offwhite}}>{value||<span style={{color:C.muted}}>—</span>}</div>
    </div>
  );

  return (
    <Modal title={`${d.first_name} ${d.surname}`} onClose={onClose}>
      <div style={{marginBottom:14}}>
        <Bdg s={reg.status}/>
        <span style={{marginLeft:10, fontSize:12, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>{reg.team}</span>
      </div>
      <div style={{...card, marginBottom:12, padding:13}}>
        <div style={secHead}>Player</div>
        <Row label="Full Name" value={`${d.first_name} ${d.surname}`}/>
        <Row label="Age Group" value={d.age_group}/>
        <Row label="Date of Birth" value={fmtDate(d.dob)}/>{/* #18 */}
        <Row label="Gender" value={d.gender}/>
        <Row label="Nationality" value={d.nationality}/>
        <Row label="Address" value={`${d.address||""} ${d.postcode||""}`.trim()}/>
      </div>
      {/* #19 — photo shown using signed URL, tappable to open/save */}
      {photoUrl&&(
        <div style={{...card, marginBottom:12, padding:13}}>
          <div style={secHead}>Photo</div>
          <a href={photoUrl} target="_blank" rel="noreferrer"
            style={{display:"block", textDecoration:"none"}}>
            <img src={photoUrl} alt="Player" style={{width:"100%", maxHeight:220,
              objectFit:"cover", borderRadius:8, display:"block"}}/>
            <div style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.royal,
              marginTop:6, textAlign:"center"}}>Tap to open / save full image</div>
          </a>
        </div>
      )}
      <div style={{...card, marginBottom:12, padding:13}}>
        <div style={secHead}>Parent / Guardian</div>
        <Row label="Name" value={d.parent_name}/>
        <Row label="Date of Birth" value={fmtDate(d.parent_dob)}/>{/* #18 */}
        <Row label="Email" value={d.parent_email}/>
        <Row label="Phone" value={d.parent_phone}/>
      </div>
      <div style={{...card, marginBottom:18, padding:13}}>
        <div style={secHead}>Verification</div>
        <div style={{display:"flex", alignItems:"center", gap:10, fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{width:24, height:24, borderRadius:6,
            background:d.id_seen?"rgba(22,163,74,0.2)":"rgba(220,38,38,0.2)",
            border:`1px solid ${d.id_seen?C.success:C.danger}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14}}>
            {d.id_seen?"✓":"✕"}</div>
          <span style={{fontSize:14, color:d.id_seen?C.success:C.danger, fontWeight:600}}>
            {d.id_seen?"ID seen and verified":"ID NOT verified"}</span>
        </div>
      </div>
      <button style={{...btn, width:"100%", padding:14,
        background:reg.status==="pending"
          ?`linear-gradient(135deg,${C.success},#15803d)`
          :`linear-gradient(135deg,${C.warn},#b45309)`}}
        onClick={()=>{onToggle(reg.id,reg.status);onClose();}}>
        {reg.status==="pending"?"✓ Mark as Actioned":"↩ Reopen"}
      </button>
    </Modal>
  );
}

function OrderDetail({order, onClose, onToggle}) {
  // #20 — only show personalisation rows when they exist and have data
  const hasPersonalisation = (item) =>
    item.personalisation_data &&
    item.personalisation_data.some(p=>p.squad||p.initials);

  return (
    <Modal title={`${order.team} · ${order.age_group}`} onClose={onClose}>
      <div style={{marginBottom:14}}>
        <Bdg s={order.status}/>
        <span style={{marginLeft:10, fontSize:12, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>
          Submitted {fmtDate(order.submitted_at)}</span>{/* #18 */}
      </div>
      <div style={{...card, marginBottom:12, padding:13}}>
        <div style={secHead}>Details</div>
        <div style={{fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.muted, marginBottom:4}}>
          Contact: <span style={{color:C.offwhite}}>{order.submitter_name||"—"}</span></div>
        {order.special_request&&(
          <div style={{marginTop:9, padding:10, background:C.input, borderRadius:8,
            border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'DM Sans',sans-serif", color:C.silver}}>
            📝 {order.special_request}</div>
        )}
      </div>
      <div style={{...card, marginBottom:18, padding:13}}>
        <div style={secHead}>Line Items</div>
        {(order.kit_order_items||[]).map((item,idx)=>(
          <div key={idx} style={{marginBottom:13, paddingBottom:13,
            borderBottom:idx<(order.kit_order_items.length-1)?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:5, fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{fontWeight:700, fontSize:14}}>{item.item_name}</span>
              <span style={{color:C.muted, fontSize:12}}>{item.size&&`${item.size} · `}Qty: {item.qty}</span>
            </div>
            {/* #20 — only render personalisation block when meaningful data exists */}
            {hasPersonalisation(item)&&(
              <div style={{background:C.input, borderRadius:8, padding:9, border:`1px solid ${C.border}`}}>
                {item.personalisation_data.filter(p=>p.squad||p.initials).map((p,i)=>(
                  <div key={i} style={{fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.silver, marginBottom:2}}>
                    <span style={{color:C.muted, minWidth:18, display:"inline-block"}}>{i+1}.</span>
                    {p.squad&&<span> Squad: <strong style={{color:C.white}}>{p.squad}</strong></span>}
                    {p.initials&&<span> Initials: <strong style={{color:C.white}}>{p.initials}</strong></span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button style={{...btn, width:"100%", padding:14,
        background:order.status==="pending"
          ?`linear-gradient(135deg,${C.success},#15803d)`
          :`linear-gradient(135deg,${C.warn},#b45309)`}}
        onClick={()=>{onToggle(order.id,order.status);onClose();}}>
        {order.status==="pending"?"✓ Mark as Actioned":"↩ Reopen"}
      </button>
    </Modal>
  );
}

// ── My Submissions (coach view) ───────────────────────────────
function MySubmissionsView({user, initialTab="registrations"}) {
  const [tab, setTab] = useState(initialTab);
  const [regs, setRegs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selReg, setSelReg] = useState(null);
  const [selOrd, setSelOrd] = useState(null);

  useEffect(()=>{
    // Use RPC (security definer) to bypass RLS, then filter to this user's submissions
    if (user.isSecretary) {
      sb.rpc("get_all_registrations").then(({data})=>{ setRegs(data||[]); setLoadingRegs(false); });
    } else {
      sb.rpc("get_all_registrations").then(({data})=>{
        setRegs((data||[]).filter(r=>r.submitted_by===user.id));
        setLoadingRegs(false);
      });
    }
  },[user.id]);

  useEffect(()=>{
    if (user.isSecretary) {
      sb.rpc("get_all_kit_orders").then(({data})=>{ setOrders(data||[]); setLoadingOrders(false); });
    } else {
      sb.rpc("get_all_kit_orders").then(({data})=>{
        setOrders((data||[]).filter(o=>o.submitted_by===user.id));
        setLoadingOrders(false);
      });
    }
  },[user.id]);

  const pending = list => list.filter(i=>i.status==="pending").length;

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px", fontSize:22, fontFamily:"'Crimson Pro',Georgia,serif"}}>My Submissions</h2>
      <p style={{margin:"0 0 18px", color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13}}>
        Your registrations and kit orders.</p>
      <div style={{display:"flex", gap:4, marginBottom:14, background:C.card, borderRadius:10,
        padding:4, border:`1px solid ${C.border}`}}>
        {[{id:"registrations",label:`Registrations${pending(regs)>0?` (${pending(regs)} pending)`:""}`,},
          {id:"orders",label:`Orders${pending(orders)>0?` (${pending(orders)} pending)`:""}`,}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1, padding:"9px 0", borderRadius:8, border:"none",
              background:tab===t.id?`linear-gradient(135deg,${C.royal},${C.bright})`:"transparent",
              color:tab===t.id?C.white:C.muted, fontFamily:"'DM Sans',sans-serif",
              fontSize:13, fontWeight:700, cursor:"pointer"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="registrations"&&(
        <div style={card}>
          <div style={{marginBottom:12}}>
            <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.muted}}>
              {regs.length} total · {pending(regs)} pending</span>
          </div>
          {loadingRegs?<Spinner/>:regs.length===0
            ?<div style={{color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"12px 0"}}>
              You haven't submitted any registrations yet.</div>
            :regs.map(r=>(
            <div key={r.id} onClick={()=>setSelReg(r)}
              style={{background:C.input, borderRadius:10, padding:13, marginBottom:8,
                border:`1px solid ${C.border}`, cursor:"pointer", display:"flex",
                justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif", marginBottom:3}}>
                  {r.first_name} {r.surname}</div>
                <div style={{fontSize:11, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>
                  {r.team} · {r.age_group} · {fmtDate(r.submitted_at)}</div>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <Bdg s={r.status}/><span style={{color:C.muted, fontSize:18}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="orders"&&(
        <div style={card}>
          <div style={{marginBottom:12}}>
            <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.muted}}>
              {orders.length} total · {pending(orders)} pending</span>
          </div>
          {loadingOrders?<Spinner/>:orders.length===0
            ?<div style={{color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"12px 0"}}>
              You haven't submitted any kit orders yet.</div>
            :orders.map(o=>(
            <div key={o.id} onClick={()=>setSelOrd(o)}
              style={{background:C.input, borderRadius:10, padding:13, marginBottom:8,
                border:`1px solid ${C.border}`, cursor:"pointer", display:"flex",
                justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif", marginBottom:3}}>
                  {o.team} · {o.age_group}</div>
                <div style={{fontSize:11, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>
                  {(o.kit_order_items||[]).length} item{(o.kit_order_items||[]).length!==1?"s":""} · {fmtDate(o.submitted_at)}</div>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <Bdg s={o.status}/><span style={{color:C.muted, fontSize:18}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selReg&&(
        <Modal title={`${selReg.first_name} ${selReg.surname}`} onClose={()=>setSelReg(null)}>
          <div style={{marginBottom:14}}><Bdg s={selReg.status}/></div>
          {[["Team",selReg.team],["Age Group",selReg.age_group],
            ["Date of Birth",fmtDate(selReg.dob)],["Submitted",fmtDate(selReg.submitted_at)]
          ].map(([label,value])=>(
            <div key={label} style={{display:"flex", gap:8, marginBottom:9, fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{fontSize:11, color:C.muted, minWidth:110, flexShrink:0,
                textTransform:"uppercase", letterSpacing:"0.06em"}}>{label}</div>
              <div style={{fontSize:13, color:C.offwhite}}>{value||"—"}</div>
            </div>
          ))}
        </Modal>
      )}

      {selOrd&&(
        <Modal title={`${selOrd.team} · ${selOrd.age_group}`} onClose={()=>setSelOrd(null)}>
          <div style={{marginBottom:14}}><Bdg s={selOrd.status}/></div>
          <div style={{fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.muted, marginBottom:14}}>
            Submitted {fmtDate(selOrd.submitted_at)}</div>
          <div style={secHead}>Line Items</div>
          {(selOrd.kit_order_items||[]).map((item,idx)=>(
            <div key={idx} style={{fontFamily:"'DM Sans',sans-serif", fontSize:13,
              marginBottom:8, color:C.offwhite}}>
              {item.item_name}{item.size?` · ${item.size}`:""} × {item.qty}
            </div>
          ))}
          {selOrd.special_request&&(
            <div style={{marginTop:12, padding:10, background:C.input, borderRadius:8,
              border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'DM Sans',sans-serif", color:C.silver}}>
              📝 {selOrd.special_request}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── Secretary dashboard ────────────────────────────────────────
const EMPTY_ITEM = { name:"", category:"kit", brand:"Pendle", sizes:"", personalisation:"", u13above:false };
const PERSONALISATION_OPTS = [
  {value:"",                 label:"None"},
  {value:"squad_required",   label:"Squad number (required)"},
  {value:"gk_squad",         label:"Squad number — GK default 1"},
  {value:"optional",         label:"Squad number (optional)"},
  {value:"initials_optional",label:"Initials (optional)"},
];

function SecretaryView() {
  const [tab, setTab] = useState("registrations");
  const [regs, setRegs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selReg, setSelReg] = useState(null);
  const [selOrd, setSelOrd] = useState(null);

  // Catalogue state
  const [catalogue, setCatalogue] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [editItem, setEditItem] = useState(null);  // null = closed, {} = new, {id,...} = editing
  const [catErr, setCatErr] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  const loadCatalogue = () => {
    setLoadingCat(true);
    sb.rpc("get_catalogue").then(({data})=>{ setCatalogue(data||[]); setLoadingCat(false); });
  };

  useEffect(()=>{
    sb.rpc("get_all_registrations").then(({data})=>{ setRegs(data||[]); setLoadingRegs(false); });
  },[]);

  useEffect(()=>{
    sb.rpc("get_all_kit_orders").then(({data})=>{ setOrders(data||[]); setLoadingOrders(false); });
  },[]);

  useEffect(()=>{ loadCatalogue(); },[]);

  const toggleReg = async (id, currentStatus) => {
    const newStatus = currentStatus==="pending"?"actioned":"pending";
    await sb.rpc("toggle_registration", {reg_id:id, new_status:newStatus});
    setRegs(prev=>prev.map(r=>r.id===id?{...r,status:newStatus}:r));
  };

  const toggleOrd = async (id, currentStatus) => {
    const newStatus = currentStatus==="pending"?"actioned":"pending";
    await sb.rpc("toggle_kit_order", {order_id:id, new_status:newStatus});
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status:newStatus}:o));
  };

  const saveItem = async () => {
    if (!editItem.name.trim()) { setCatErr("Name is required."); return; }
    setCatErr(""); setCatSaving(true);
    const sizesArr = editItem.sizes
      ? editItem.sizes.split(",").map(s=>s.trim()).filter(Boolean)
      : null;
    const payload = {
      id: editItem.id||null,
      name: editItem.name.trim(),
      category: editItem.category,
      brand: editItem.brand||"Various",
      sizes: sizesArr&&sizesArr.length>0 ? sizesArr : null,
      personalisation: editItem.personalisation||null,
      u13above: !!editItem.u13above,
      sort_order: editItem.sort_order||0,
    };
    await sb.rpc("upsert_catalogue_item", {payload: JSON.stringify(payload)});
    setCatSaving(false);
    setEditItem(null);
    loadCatalogue();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Remove this item from the catalogue?")) return;
    await sb.rpc("delete_catalogue_item", {item_id: id});
    loadCatalogue();
  };

  const pending = list => list.filter(i=>i.status==="pending").length;
  const catKit = catalogue.filter(i=>i.category==="kit");
  const catEquip = catalogue.filter(i=>i.category==="equipment");

  const tabList = [
    {id:"registrations", label:`Registrations${pending(regs)>0?` (${pending(regs)})`:""}` },
    {id:"orders",        label:`Orders${pending(orders)>0?` (${pending(orders)})`:""}` },
    {id:"catalogue",     label:"Catalogue"},
  ];

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px", fontSize:22, fontFamily:"'Crimson Pro',Georgia,serif"}}>Secretary Dashboard</h2>
      <p style={{margin:"0 0 18px", color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13}}>Tap any row to view full details.</p>
      <div style={{display:"flex", gap:4, marginBottom:14, background:C.card, borderRadius:10,
        padding:4, border:`1px solid ${C.border}`}}>
        {tabList.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1, padding:"9px 0", borderRadius:8, border:"none",
              background:tab===t.id?`linear-gradient(135deg,${C.royal},${C.bright})`:"transparent",
              color:tab===t.id?C.white:C.muted, fontFamily:"'DM Sans',sans-serif",
              fontSize:12, fontWeight:700, cursor:"pointer"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="registrations"&&(
        <div style={card}>
          <div style={{marginBottom:12}}>
            <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.muted}}>
              {regs.length} total · {pending(regs)} pending</span>
          </div>
          {loadingRegs?<Spinner/>:regs.length===0
            ?<div style={{color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"12px 0"}}>No registrations yet.</div>
            :regs.map(r=>(
            <div key={r.id} onClick={()=>setSelReg(r)}
              style={{background:C.input, borderRadius:10, padding:13, marginBottom:8,
                border:`1px solid ${C.border}`, cursor:"pointer", display:"flex",
                justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif", marginBottom:3}}>
                  {r.first_name} {r.surname}</div>
                {/* #18 — British date format */}
                <div style={{fontSize:11, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>
                  {r.team} · {r.age_group} · {fmtDate(r.submitted_at)}</div>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <Bdg s={r.status}/><span style={{color:C.muted, fontSize:18}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="orders"&&(
        <div style={card}>
          <div style={{marginBottom:12}}>
            <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.muted}}>
              {orders.length} total · {pending(orders)} pending</span>
          </div>
          {loadingOrders?<Spinner/>:orders.length===0
            ?<div style={{color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"12px 0"}}>No orders yet.</div>
            :orders.map(o=>(
            <div key={o.id} onClick={()=>setSelOrd(o)}
              style={{background:C.input, borderRadius:10, padding:13, marginBottom:8,
                border:`1px solid ${C.border}`, cursor:"pointer", display:"flex",
                justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif", marginBottom:3}}>
                  {o.team} · {o.age_group}</div>
                <div style={{fontSize:11, color:C.muted, fontFamily:"'DM Sans',sans-serif"}}>
                  {(o.kit_order_items||[]).length} item{(o.kit_order_items||[]).length!==1?"s":""} · {fmtDate(o.submitted_at)}</div>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <Bdg s={o.status}/><span style={{color:C.muted, fontSize:18}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selReg&&<RegDetail reg={selReg} onClose={()=>setSelReg(null)} onToggle={toggleReg}/>}
      {selOrd&&<OrderDetail order={selOrd} onClose={()=>setSelOrd(null)} onToggle={toggleOrd}/>}

      {tab==="catalogue"&&(
        <div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
            <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.muted}}>
              {catalogue.length} items</span>
            <button style={{...btn, padding:"9px 16px", fontSize:13}}
              onClick={()=>setEditItem({...EMPTY_ITEM})}>+ Add Item</button>
          </div>

          {loadingCat?<Spinner/>:[
            {label:"Kit", items:catKit},
            {label:"Equipment", items:catEquip},
          ].map(group=>(
            <div key={group.label} style={{...card, marginBottom:14}}>
              <div style={secHead}>{group.label}</div>
              {group.items.map(item=>(
                <div key={item.id} style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"10px 0", borderBottom:`1px solid ${C.border}`}}>
                  <div>
                    <div style={{fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif"}}>{item.name}</div>
                    <div style={{fontSize:11, color:C.muted, fontFamily:"'DM Sans',sans-serif", marginTop:2}}>
                      {item.brand}
                      {item.sizes&&item.sizes.length>0?` · ${item.sizes.join(", ")}`:" · No size"}
                      {item.u13above?" · U13+":""}
                      {item.personalisation?` · ${item.personalisation}`:""}
                    </div>
                  </div>
                  <div style={{display:"flex", gap:8, flexShrink:0}}>
                    <button onClick={()=>setEditItem({
                      ...item,
                      sizes: item.sizes ? item.sizes.join(", ") : "",
                      personalisation: item.personalisation||"",
                    })}
                      style={{background:C.royal, border:"none", color:C.white, borderRadius:7,
                        padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif"}}>
                      Edit
                    </button>
                    <button onClick={()=>deleteItem(item.id)}
                      style={{background:"transparent", border:`1px solid ${C.danger}`, color:C.danger,
                        borderRadius:7, padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif"}}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {group.items.length===0&&(
                <div style={{color:C.muted, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"8px 0"}}>
                  No items.</div>
              )}
            </div>
          ))}

          {/* Add / Edit modal */}
          {editItem&&(
            <Modal title={editItem.id?"Edit Item":"Add Item"} onClose={()=>{setEditItem(null);setCatErr("");}}>
              <ErrBanner msg={catErr}/>
              <F label="Name">
                <input style={inp} value={editItem.name}
                  onChange={e=>setEditItem(p=>({...p,name:e.target.value}))}/>
              </F>
              <F label="Category">
                <select style={sel} value={editItem.category}
                  onChange={e=>setEditItem(p=>({...p,category:e.target.value}))}>
                  <option value="kit">Kit</option>
                  <option value="equipment">Equipment</option>
                </select>
              </F>
              <F label="Brand">
                <input style={inp} value={editItem.brand}
                  onChange={e=>setEditItem(p=>({...p,brand:e.target.value}))}/>
              </F>
              <F label="Sizes (comma separated, leave blank if no size)">
                <input style={inp} value={editItem.sizes}
                  placeholder='e.g. XS, S, M, L or "Size 3, Size 4, Size 5"'
                  onChange={e=>setEditItem(p=>({...p,sizes:e.target.value}))}/>
              </F>
              <F label="Personalisation">
                <select style={sel} value={editItem.personalisation}
                  onChange={e=>setEditItem(p=>({...p,personalisation:e.target.value}))}>
                  {PERSONALISATION_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </F>
              <label style={{display:"flex", alignItems:"center", gap:10, marginBottom:20,
                fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.silver, cursor:"pointer"}}>
                <input type="checkbox" checked={!!editItem.u13above}
                  onChange={e=>setEditItem(p=>({...p,u13above:e.target.checked}))}
                  style={{width:18, height:18, accentColor:C.royal}}/>
                U13 and above only
              </label>
              <button style={{...btn, width:"100%", opacity:catSaving?0.6:1}}
                onClick={saveItem} disabled={catSaving}>
                {catSaving?"Saving…":"Save Item"}
              </button>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [checking, setChecking] = useState(true);

  useEffect(()=>{
    sb.auth.getSession().then(async({data:{session}})=>{
      if (session) {
        try {
          const {data:profile, error:pErr} = await sb.rpc("get_my_profile");
          if (pErr||!profile) { setChecking(false); return; }
          setUser({id:session.user.id, name:profile.name, role:profile.role,
            isSecretary:profile.is_secretary, teams:profile.teams||[]});
        } catch(e) { console.error("Session restore failed:",e); }
      }
      setChecking(false);
    });
  },[]);

  const handleLogout = async () => { await sb.auth.signOut(); setUser(null); };

  if (checking) return (
    <div style={{minHeight:"100vh", background:`linear-gradient(160deg,${C.navy} 0%,#060e1c 100%)`,
      display:"flex", alignItems:"center", justifyContent:"center"}}>
      <Crest size={80} glow/>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      {!user
        ? <LoginScreen onLogin={u=>{setUser(u);setActive("dashboard");}}/>
        : <div style={{height:"100vh", display:"flex", flexDirection:"column",
            background:`linear-gradient(160deg,${C.navy} 0%,#060e1c 100%)`,
            fontFamily:"'Crimson Pro',Georgia,serif", color:C.white, overflow:"hidden"}}>
            <Topbar user={user} onLogout={handleLogout} active={active}/>
            <main style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch"}}>
              {active==="dashboard"&&<DashboardView user={user} setActive={setActive}/>}
              {active==="registration"&&<RegistrationForm user={user}/>}
              {active==="kitorder"&&<KitOrderForm user={user}/>}
              {active==="mysubmissions_regs"&&<MySubmissionsView user={user} initialTab="registrations"/>}
              {active==="mysubmissions_orders"&&<MySubmissionsView user={user} initialTab="orders"/>}
              {active==="mysubmissions"&&<MySubmissionsView user={user}/>}
              {active==="secretary"&&user.isSecretary&&<SecretaryView/>}
            </main>
            <BottomNav active={active} setActive={setActive} isSecretary={user.isSecretary}/>
          </div>
      }
    </>
  );
}
