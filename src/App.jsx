import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ────────────────────────────────────────────
const SUPABASE_URL = "https://ouerpsdkpzsojjqzfezq.supabase.co";
const SUPABASE_KEY = "sb_publishable_N7RRUrt-JUV4L-qOWT1efA_b2tX1dVX";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Static reference data ──────────────────────────────────────
const TEAMS = ["Superstars","Fenwick","Ingram","Bowmont","Hawkhill","Portland",
  "Glanton","Longburn","Hauxley","Grasmere","Aberwick","Lions","Dunstan",
  "Auckland","Netherton","Lomond","Lumley","Firsts","Reserves"];
const AGE_GROUPS = ["U7s","U8s","U9s","U10s","U11s","U12s","U13s","U14s",
  "U15s","U16s","U17s","U18s","Adults","Superstars"];
const GENDERS = ["Male","Female","Non-binary","Prefer not to say"];
const NATIONALITIES = ["British","English","Scottish","Welsh","Irish","Other"];
const KIT_SIZES = ["XS","S","SY","Y","S-M","L","XL","XXL"];

const EQUIPMENT_ITEMS = [
  { id:"train_ball", name:"Training Balls", sizes:["Size 3","Size 4","Size 5"], personalisation:null },
  { id:"match_ball", name:"Match Balls", sizes:["Size 3","Size 4","Size 5"], personalisation:null },
  { id:"first_aid", name:"1st Aid Kit", sizes:null, personalisation:null },
  { id:"ball_pump", name:"Ball Pump", sizes:null, personalisation:null },
  { id:"cones", name:"Cones", sizes:null, personalisation:null },
  { id:"ball_bag", name:"Ball Bag", sizes:null, personalisation:null },
  { id:"corner_flags", name:"Corner Flags", sizes:null, personalisation:null, u13above:true },
  { id:"nets", name:"Nets", sizes:null, personalisation:null, u13above:true },
  { id:"bibs", name:"Bibs", sizes:["S","M","L","XL"], personalisation:null },
];

const KIT_ITEMS = [
  { id:"home_shirt", name:"Home Shirt", personalisation:"squad_required" },
  { id:"home_shorts", name:"Home Shorts", personalisation:null },
  { id:"gk_shirt", name:"GK Shirt", personalisation:null },
  { id:"away_shirt", name:"Away Shirt", personalisation:"squad_required" },
  { id:"rain_jacket", name:"Rain Jacket", personalisation:"optional" },
  { id:"jumper", name:"Jumper", personalisation:"optional" },
  { id:"coach_jacket", name:"Coach Jacket", personalisation:"initials_optional" },
  { id:"coach_jumper", name:"Coach Jumper", personalisation:"initials_optional" },
  { id:"coach_tshirt", name:"Coach T-Shirt", personalisation:"initials_optional" },
];

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

function Crest({size=48,glow=false}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{filter:glow?"drop-shadow(0 0 14px rgba(30,79,216,0.8))":"none",flexShrink:0}}>
      <circle cx="50" cy="50" r="48" fill={C.navy} stroke={C.royal} strokeWidth="2.5"/>
      <rect x="43" y="17" width="14" height="66" rx="3" fill="none" stroke={C.white} strokeWidth="3"/>
      <rect x="19" y="43" width="62" height="14" rx="3" fill="none" stroke={C.white} strokeWidth="3"/>
      <circle cx="50" cy="50" r="10" fill="none" stroke={C.white} strokeWidth="3"/>
      <circle cx="50" cy="50" r="4.5" fill={C.royal}/>
      {[-30,-18,-6,6,18].map((a,i)=>(
        <ellipse key={`l${i}`} cx={50+32*Math.cos((a-90)*Math.PI/180)}
          cy={50+32*Math.sin((a-90)*Math.PI/180)} rx="6.5" ry="3.5"
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"
          transform={`rotate(${a+12},${50+32*Math.cos((a-90)*Math.PI/180)},${50+32*Math.sin((a-90)*Math.PI/180)})`}/>
      ))}
      {[150,162,174,186,198].map((a,i)=>(
        <ellipse key={`r${i}`} cx={50+32*Math.cos((a-90)*Math.PI/180)}
          cy={50+32*Math.sin((a-90)*Math.PI/180)} rx="6.5" ry="3.5"
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"
          transform={`rotate(${a-12},${50+32*Math.cos((a-90)*Math.PI/180)},${50+32*Math.sin((a-90)*Math.PI/180)})`}/>
      ))}
    </svg>
  );
}

function Stepper({value,onChange,min=1,max=99}) {
  return (
    <div style={{display:"flex",alignItems:"center",border:`1px solid ${C.border}`,
      borderRadius:10,overflow:"hidden",background:C.input,width:"fit-content"}}>
      <button onClick={()=>onChange(Math.max(min,value-1))}
        style={{width:46,height:46,background:"transparent",border:"none",
          color:C.white,fontSize:24,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>−</button>
      <div style={{minWidth:38,textAlign:"center",fontSize:17,fontWeight:700,
        fontFamily:"'DM Sans',sans-serif",color:C.white}}>{value}</div>
      <button onClick={()=>onChange(Math.min(max,value+1))}
        style={{width:46,height:46,background:"transparent",border:"none",
          color:C.white,fontSize:24,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>+</button>
    </div>
  );
}

function F({label,children,mb=16}) {
  return <div style={{marginBottom:mb}}><label style={lbl}>{label}</label>{children}</div>;
}

function Modal({onClose,title,children}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",
      alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={onClose}>
      <div style={{...card,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",
        borderRadius:"18px 18px 0 0",padding:0}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`,position:"sticky",
          top:0,background:C.card,borderRadius:"18px 18px 0 0",zIndex:1}}>
          <div style={{fontSize:17,fontWeight:700}}>{title}</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",
            color:C.muted,fontSize:26,cursor:"pointer",lineHeight:1,padding:4}}>✕</button>
        </div>
        <div style={{padding:18}}>{children}</div>
      </div>
    </div>
  );
}

function ErrBanner({msg}) {
  if(!msg) return null;
  return <div style={{background:"rgba(220,38,38,0.15)",border:`1px solid ${C.danger}`,
    borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,
    color:C.danger,fontFamily:"'DM Sans',sans-serif"}}>{msg}</div>;
}

function Spinner() {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
    <div style={{width:32,height:32,border:`3px solid ${C.border}`,
      borderTop:`3px solid ${C.royal}`,borderRadius:"50%",
      animation:"spin 0.8s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

// ── Layout ─────────────────────────────────────────────────────
function Topbar({user,onLogout,active}) {
  const titles={dashboard:"Home",registration:"New Registration",kitorder:"Kit Order",secretary:"Secretary"};
  return (
    <div style={{background:`linear-gradient(90deg,${C.navy},${C.card})`,
      borderBottom:`1px solid ${C.border}`,padding:"0 14px",
      display:"flex",alignItems:"center",justifyContent:"space-between",height:56,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Crest size={34}/>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.white,lineHeight:1.1,
            fontFamily:"'Crimson Pro',Georgia,serif"}}>WPJFC</div>
          <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Sans',sans-serif",
            letterSpacing:"0.06em",textTransform:"uppercase"}}>{titles[active]||"Club Management"}</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:C.white}}>
            {user.name.split(" ")[0]}</div>
          <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>
            {user.teams.join(", ")}</div>
        </div>
        <button onClick={onLogout} style={{background:"transparent",border:`1px solid ${C.border}`,
          borderRadius:8,padding:"5px 11px",color:C.muted,fontSize:12,
          cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Out</button>
      </div>
    </div>
  );
}

function BottomNav({active,setActive,isSecretary}) {
  const tabs=[
    {id:"dashboard",icon:"⊞",label:"Home"},
    {id:"registration",icon:"✚",label:"Register"},
    {id:"kitorder",icon:"🛒",label:"Kit"},
    ...(isSecretary?[{id:"secretary",icon:"★",label:"Secretary"}]:[]),
  ];
  return (
    <div style={{display:"flex",background:C.navy,borderTop:`1px solid ${C.border}`,flexShrink:0}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setActive(t.id)}
          style={{flex:1,padding:"10px 4px 8px",background:"transparent",border:"none",
            borderTop:active===t.id?`2px solid ${C.royal}`:"2px solid transparent",
            color:active===t.id?C.white:C.muted,display:"flex",flexDirection:"column",
            alignItems:"center",gap:3,cursor:"pointer"}}>
          <span style={{fontSize:19}}>{t.icon}</span>
          <span style={{fontSize:10,fontFamily:"'DM Sans',sans-serif",
            fontWeight:active===t.id?700:400,letterSpacing:"0.04em"}}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const doLogin=async()=>{
    setErr(""); setLoading(true);
    const {data,error}=await sb.auth.signInWithPassword({email,password:pw});
    if(error){ setErr(error.message); setLoading(false); return; }

    // Fetch profile + teams
    const {data:profile}=await sb.from("profiles").select("*").eq("id",data.user.id).single();
    const {data:teamRows}=await sb.from("profile_teams").select("team").eq("profile_id",data.user.id);
    const teams=(teamRows||[]).map(r=>r.team);
    onLogin({id:data.user.id, name:profile.name, role:profile.role,
      isSecretary:profile.is_secretary, teams});
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.navy} 0%,#060e1c 100%)`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:24,fontFamily:"'Crimson Pro',Georgia,serif",color:C.white,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:0.03,
        backgroundImage:`linear-gradient(${C.white} 1px,transparent 1px),linear-gradient(90deg,${C.white} 1px,transparent 1px)`,
        backgroundSize:"40px 40px"}}/>
      <div style={{position:"relative",width:"100%",maxWidth:400}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:36}}>
          <Crest size={100} glow/>
          <h1 style={{margin:"18px 0 4px",fontSize:28,fontWeight:700,letterSpacing:"0.02em",textAlign:"center"}}>
            Waldridge Park</h1>
          <div style={{fontSize:12,color:C.muted,fontFamily:"'DM Sans',sans-serif",
            letterSpacing:"0.14em",textTransform:"uppercase"}}>Junior Football Club · Est. 1988</div>
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
          <button style={{...btn,width:"100%",padding:15,fontSize:16,opacity:loading?0.6:1}}
            onClick={doLogin} disabled={loading}>
            {loading?"Signing in…":"Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────
function DashboardView({user,setActive}) {
  const [stats,setStats]=useState({pendingRegs:0,pendingOrders:0});

  useEffect(()=>{
    async function load(){
      if(user.isSecretary){
        const [{count:r},{count:o}]=await Promise.all([
          sb.from("registrations").select("*",{count:"exact",head:true}).eq("status","pending"),
          sb.from("kit_orders").select("*",{count:"exact",head:true}).eq("status","pending"),
        ]);
        setStats({pendingRegs:r||0,pendingOrders:o||0});
      } else {
        const [{count:r},{count:o}]=await Promise.all([
          sb.from("registrations").select("*",{count:"exact",head:true})
            .eq("submitted_by",user.id).eq("status","pending"),
          sb.from("kit_orders").select("*",{count:"exact",head:true})
            .eq("submitted_by",user.id).eq("status","pending"),
        ]);
        setStats({pendingRegs:r||0,pendingOrders:o||0});
      }
    }
    load();
  },[user]);

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px",fontSize:24,fontFamily:"'Crimson Pro',Georgia,serif"}}>
        Welcome, {user.name.split(" ")[0]}</h2>
      <p style={{margin:"0 0 22px",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
        {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
      </p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
        {[{label:"Pending Regs",value:stats.pendingRegs,color:C.warn},
          {label:"Pending Orders",value:stats.pendingOrders,color:C.royal},
          {label:"Your Teams",value:user.teams.length,color:C.success},
          {label:"Season",value:"2024/25",color:C.silver}]
          .map(st=>(
          <div key={st.label} style={{...card,borderTop:`3px solid ${st.color}`,padding:14}}>
            <div style={{fontSize:30,fontWeight:700,color:st.color,fontFamily:"'Crimson Pro',Georgia,serif"}}>{st.value}</div>
            <div style={{fontSize:11,color:C.silver,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{st.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{id:"registration",icon:"✚",title:"New Registration",desc:"Register a player for your team"},
          {id:"kitorder",icon:"🛒",title:"Kit Order",desc:"Order kit and equipment"},
          ...(user.isSecretary?[{id:"secretary",icon:"★",title:"Secretary Dashboard",desc:"Review all submissions"}]:[])
        ].map(item=>(
          <button key={item.id} onClick={()=>setActive(item.id)}
            style={{...card,display:"flex",alignItems:"center",gap:14,border:"none",
              cursor:"pointer",textAlign:"left",padding:16}}>
            <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${C.blue},${C.royal})`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:C.white,fontFamily:"'Crimson Pro',Georgia,serif"}}>{item.title}</div>
              <div style={{fontSize:12,color:C.muted,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{item.desc}</div>
            </div>
            <div style={{marginLeft:"auto",color:C.muted,fontSize:20}}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Registration form ──────────────────────────────────────────
function RegistrationForm({user}) {
  const [form,setForm]=useState({team:user.teams[0]||"",firstName:"",surname:"",address:"",
    postcode:"",dob:"",gender:"",nationality:"",parentName:"",parentDob:"",
    parentEmail:"",parentPhone:"",idSeen:false,photo:null});
  const [preview,setPreview]=useState(null);
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const fileRef=useRef();
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const teamOpts=user.isSecretary?TEAMS:user.teams;

  const handlePhoto=e=>{
    const file=e.target.files[0]; if(!file)return;
    set("photo",file);
    const r=new FileReader(); r.onload=ev=>setPreview(ev.target.result); r.readAsDataURL(file);
  };

  const submit=async()=>{
    setErr(""); setLoading(true);
    try {
      let photo_url=null;
      if(form.photo){
        const ext=form.photo.name.split(".").pop();
        const path=`${user.id}/${Date.now()}.${ext}`;
        const {error:upErr}=await sb.storage.from("player-photos").upload(path,form.photo);
        if(upErr) throw upErr;
        const {data:urlData}=sb.storage.from("player-photos").getPublicUrl(path);
        photo_url=urlData.publicUrl;
      }
      const {error}=await sb.from("registrations").insert({
        submitted_by:user.id, team:form.team, age_group:"", status:"pending",
        first_name:form.firstName, surname:form.surname,
        dob:form.dob||null, gender:form.gender, nationality:form.nationality,
        address:form.address, postcode:form.postcode,
        parent_name:form.parentName, parent_dob:form.parentDob||null,
        parent_email:form.parentEmail, parent_phone:form.parentPhone,
        id_seen:form.idSeen, photo_url,
      });
      if(error) throw error;
      setDone(true);
    } catch(e){ setErr(e.message||"Submission failed."); }
    setLoading(false);
  };

  if(done) return (
    <div style={{padding:40,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:400,textAlign:"center"}}>
      <div style={{width:70,height:70,borderRadius:"50%",background:"rgba(22,163,74,0.2)",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,marginBottom:18,
        border:`2px solid ${C.success}`}}>✓</div>
      <h2 style={{margin:"0 0 8px",fontFamily:"'Crimson Pro',Georgia,serif",fontSize:22}}>Registration Submitted</h2>
      <p style={{color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:14}}>
        {form.firstName} {form.surname} registered for {form.team}.</p>
      <button style={{...btn,marginTop:22}} onClick={()=>{setDone(false);setPreview(null);
        setForm({team:user.teams[0]||"",firstName:"",surname:"",address:"",postcode:"",dob:"",
          gender:"",nationality:"",parentName:"",parentDob:"",parentEmail:"",parentPhone:"",idSeen:false,photo:null});
      }}>Register Another</button>
    </div>
  );

  const Section=({title,children})=>(
    <div style={{...card,marginBottom:14}}>
      <div style={secHead}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px",fontSize:22,fontFamily:"'Crimson Pro',Georgia,serif"}}>New Registration</h2>
      <p style={{margin:"0 0 20px",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
        Photo and ID verification required.</p>
      <ErrBanner msg={err}/>

      <Section title="Player Details">
        <F label="Team">
          <select style={sel} value={form.team} onChange={e=>set("team",e.target.value)}>
            {teamOpts.map(t=><option key={t}>{t}</option>)}
          </select>
        </F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <F label="First Name"><input style={inp} value={form.firstName} onChange={e=>set("firstName",e.target.value)}/></F>
          <F label="Surname"><input style={inp} value={form.surname} onChange={e=>set("surname",e.target.value)}/></F>
        </div>
        <F label="Address">
          <input style={inp} value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Street address"/>
        </F>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <F label="Postcode"><input style={inp} value={form.postcode} onChange={e=>set("postcode",e.target.value.toUpperCase())}/></F>
          <F label="Date of Birth"><input style={inp} type="date" value={form.dob} onChange={e=>set("dob",e.target.value)}/></F>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
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
        <F label="Date of Birth"><input style={inp} type="date" value={form.parentDob} onChange={e=>set("parentDob",e.target.value)}/></F>
        <F label="Email Address"><input style={inp} type="email" value={form.parentEmail} onChange={e=>set("parentEmail",e.target.value)}/></F>
        <F label="Contact Number"><input style={inp} type="tel" value={form.parentPhone} onChange={e=>set("parentPhone",e.target.value)}/></F>
      </Section>

      <Section title="Photo & Identity">
        <F label="Player Headshot">
          <div onClick={()=>fileRef.current.click()}
            style={{border:`2px dashed ${C.border}`,borderRadius:12,padding:18,textAlign:"center",
              cursor:"pointer",background:C.input,minHeight:100,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",gap:8}}>
            {preview
              ?<img src={preview} alt="Preview" style={{maxHeight:120,maxWidth:"100%",borderRadius:10,objectFit:"cover"}}/>
              :<><div style={{fontSize:34}}>📷</div>
                <div style={{fontSize:13,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>Tap to take or upload photo</div></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{display:"none"}} onChange={handlePhoto}/>
        </F>
        <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",
          background:C.input,borderRadius:12,padding:14,
          border:`1px solid ${form.idSeen?C.success:C.border}`}}>
          <input type="checkbox" checked={form.idSeen} onChange={e=>set("idSeen",e.target.checked)}
            style={{width:22,height:22,accentColor:C.royal,flexShrink:0,marginTop:1}}/>
          <div>
            <div style={{fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>ID Seen & Verified</div>
            <div style={{fontSize:12,color:C.muted,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
              I confirm I have physically inspected this player's Passport or Birth Certificate.</div>
          </div>
        </label>
      </Section>

      <button style={{...btn,width:"100%",padding:15,fontSize:16,opacity:loading?0.6:1}}
        onClick={submit} disabled={loading}>
        {loading?"Submitting…":"Submit Registration"}
      </button>
    </div>
  );
}

// ── Kit order form ─────────────────────────────────────────────
function KitOrderForm({user}) {
  const [ageGroup,setAgeGroup]=useState("");
  const [team,setTeam]=useState(user.teams[0]||"");
  const [items,setItems]=useState([]);
  const [special,setSpecial]=useState("");
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [modal,setModal]=useState(null);
  const [mSize,setMSize]=useState("");
  const [mQty,setMQty]=useState(1);
  const [tab,setTab]=useState("equipment");
  const teamOpts=user.isSecretary?TEAMS:user.teams;

  const openModal=(type,item)=>{setModal({type,item});setMSize("");setMQty(1);};

  const confirmAdd=()=>{
    const item=modal.item;
    setItems(prev=>[...prev,{id:Date.now(),name:item.name,size:mSize,qty:mQty,
      personalisation:item.personalisation,
      personalisations:Array(mQty).fill(null).map(()=>({squad:"",initials:""}))}]);
    setModal(null);
  };

  const removeItem=id=>setItems(prev=>prev.filter(i=>i.id!==id));

  const updateQty=(id,n)=>setItems(prev=>prev.map(oi=>{
    if(oi.id!==id)return oi;
    const p=[...oi.personalisations];
    const next=Array(n).fill(null).map((_,i)=>p[i]||{squad:"",initials:""});
    return {...oi,qty:n,personalisations:next};
  }));

  const updateP=(id,idx,field,val)=>setItems(prev=>prev.map(oi=>{
    if(oi.id!==id)return oi;
    const p=[...oi.personalisations]; p[idx]={...p[idx],[field]:val};
    return {...oi,personalisations:p};
  }));

  const needsP=p=>p==="squad_required"||p==="optional"||p==="initials_optional";

  const submit=async()=>{
    setErr(""); setLoading(true);
    try {
      const {data:order,error:oErr}=await sb.from("kit_orders").insert({
        submitted_by:user.id, team, age_group:ageGroup,
        status:"pending", special_request:special,
      }).select().single();
      if(oErr) throw oErr;

      const lineItems=items.map(i=>({
        order_id:order.id, item_name:i.name, size:i.size||null,
        qty:i.qty, personalisation_type:i.personalisation||null,
        personalisation_data:i.personalisations.length>0?i.personalisations:null,
      }));
      const {error:iErr}=await sb.from("kit_order_items").insert(lineItems);
      if(iErr) throw iErr;
      setDone(true);
    } catch(e){ setErr(e.message||"Submission failed."); }
    setLoading(false);
  };

  if(done) return (
    <div style={{padding:40,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:400,textAlign:"center"}}>
      <div style={{width:70,height:70,borderRadius:"50%",background:"rgba(22,163,74,0.2)",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,marginBottom:18,
        border:`2px solid ${C.success}`}}>✓</div>
      <h2 style={{margin:"0 0 8px",fontFamily:"'Crimson Pro',Georgia,serif",fontSize:22}}>Order Submitted</h2>
      <p style={{color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:14}}>
        Kit order for {team} sent to secretary.</p>
      <button style={{...btn,marginTop:22}} onClick={()=>{setDone(false);setItems([]);setSpecial("");}}>New Order</button>
    </div>
  );

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px",fontSize:22,fontFamily:"'Crimson Pro',Georgia,serif"}}>Kit Order</h2>
      <p style={{margin:"0 0 18px",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
        Select items, adjust quantities and add personalisation.</p>
      <ErrBanner msg={err}/>

      <div style={{...card,marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <F label="Team" mb={0}>
            <select style={sel} value={team} onChange={e=>setTeam(e.target.value)}>
              {teamOpts.map(t=><option key={t}>{t}</option>)}
            </select>
          </F>
          <F label="Age Group" mb={0}>
            <select style={sel} value={ageGroup} onChange={e=>setAgeGroup(e.target.value)}>
              <option value="">Select...</option>{AGE_GROUPS.map(a=><option key={a}>{a}</option>)}
            </select>
          </F>
        </div>
        <F label="Team Contact" mb={0}>
          <input style={{...inp,color:C.muted}} value={user.name} readOnly/>
        </F>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:12,background:C.card,
        borderRadius:10,padding:4,border:`1px solid ${C.border}`}}>
        {["equipment","kit"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",
              background:tab===t?`linear-gradient(135deg,${C.royal},${C.bright})`:"transparent",
              color:tab===t?C.white:C.muted,fontFamily:"'DM Sans',sans-serif",
              fontSize:13,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {(tab==="equipment"?EQUIPMENT_ITEMS:KIT_ITEMS).map(item=>(
          <button key={item.id} onClick={()=>openModal(tab,item)}
            style={{background:C.input,border:`1px solid ${C.border}`,borderRadius:12,
              padding:13,color:C.white,cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{item.name}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:6}}>
              {item.sizes?item.sizes.join(" · "):tab==="kit"?"XS S SY Y S-M L XL XXL":"No size"}
              {item.u13above?" · U13+":""}</div>
            {item.personalisation==="squad_required"&&
              <div style={{fontSize:10,color:C.warn,fontWeight:700}}>⚠ Squad no. required</div>}
            {(item.personalisation==="optional"||item.personalisation==="initials_optional")&&
              <div style={{fontSize:10,color:C.muted}}>Personalisation optional</div>}
            <div style={{marginTop:8,fontSize:11,color:C.royal,fontWeight:700}}>+ Add to order</div>
          </button>
        ))}
      </div>

      {items.length>0&&(
        <div style={{...card,marginBottom:14}}>
          <div style={secHead}>Order · {items.length} line{items.length!==1?"s":""}</div>
          {items.map((oi,idx)=>(
            <div key={oi.id} style={{background:C.input,borderRadius:10,padding:13,
              marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>
                    {idx+1}. {oi.name}</span>
                  {oi.size&&<span style={{color:C.muted,fontSize:12,fontFamily:"'DM Sans',sans-serif",marginLeft:6}}>· {oi.size}</span>}
                </div>
                <button onClick={()=>removeItem(oi.id)}
                  style={{background:"transparent",border:"none",color:C.danger,cursor:"pointer",fontSize:20,padding:2}}>✕</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:needsP(oi.personalisation)?12:0}}>
                <span style={{fontSize:12,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>Qty:</span>
                <Stepper value={oi.qty} onChange={v=>updateQty(oi.id,v)}/>
              </div>
              {needsP(oi.personalisation)&&(
                <div>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Sans',sans-serif",
                    marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    {oi.personalisation==="squad_required"?"Squad numbers (required)":"Personalisation (optional)"}</div>
                  {oi.personalisations.map((p,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                      <span style={{fontSize:11,color:C.muted,fontFamily:"'DM Sans',sans-serif",
                        minWidth:18,fontWeight:700}}>{i+1}</span>
                      {(oi.personalisation==="squad_required"||oi.personalisation==="optional")&&(
                        <input style={{...inp,padding:"7px 9px",fontSize:13,flex:1}}
                          value={p.squad||""} placeholder="Squad #"
                          onChange={e=>updateP(oi.id,i,"squad",e.target.value)}/>
                      )}
                      {(oi.personalisation==="optional"||oi.personalisation==="initials_optional")&&(
                        <input style={{...inp,padding:"7px 9px",fontSize:13,flex:1}}
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

      <div style={{...card,marginBottom:22}}>
        <F label="Special Requests / Notes" mb={0}>
          <textarea style={{...inp,minHeight:68,resize:"vertical"}} value={special}
            onChange={e=>setSpecial(e.target.value)} placeholder="Any additional information..."/>
        </F>
      </div>

      <button style={{...btn,width:"100%",padding:15,fontSize:16,
        opacity:(items.length===0||loading)?0.4:1,cursor:items.length===0?"not-allowed":"pointer"}}
        onClick={()=>items.length>0&&submit()} disabled={loading||items.length===0}>
        {loading?"Submitting…":`Submit Order · ${items.length} item${items.length!==1?"s":""}`}
      </button>

      {modal&&(
        <Modal title={`Add ${modal.item.name}`} onClose={()=>setModal(null)}>
          {(modal.item.sizes||modal.type==="kit")&&(
            <F label="Size">
              <select style={sel} value={mSize} onChange={e=>setMSize(e.target.value)}>
                <option value="">Select size...</option>
                {(modal.item.sizes||KIT_SIZES).map(sz=><option key={sz}>{sz}</option>)}
              </select>
            </F>
          )}
          <div style={{marginBottom:22}}>
            <label style={lbl}>Quantity</label>
            <Stepper value={mQty} onChange={setMQty}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={btn} onClick={confirmAdd}>Add to Order</button>
            <button style={{background:"transparent",color:C.muted,border:`1px solid ${C.border}`,
              borderRadius:8,padding:"10px 18px",fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
              onClick={()=>setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Secretary detail modals ────────────────────────────────────
function RegDetail({reg,onClose,onToggle}) {
  const d=reg;
  const Row=({label,value})=>(
    <div style={{display:"flex",gap:8,marginBottom:9,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:11,color:C.muted,minWidth:120,flexShrink:0,
        textTransform:"uppercase",letterSpacing:"0.06em",paddingTop:1}}>{label}</div>
      <div style={{fontSize:13,color:C.offwhite}}>{value||<span style={{color:C.muted}}>—</span>}</div>
    </div>
  );
  return (
    <Modal title={`${d.first_name} ${d.surname}`} onClose={onClose}>
      <div style={{marginBottom:14}}>
        <Bdg s={reg.status}/>
        <span style={{marginLeft:10,fontSize:12,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>
          {reg.team}</span>
      </div>
      <div style={{...card,marginBottom:12,padding:13}}>
        <div style={secHead}>Player</div>
        <Row label="Full Name" value={`${d.first_name} ${d.surname}`}/>
        <Row label="Date of Birth" value={d.dob}/>
        <Row label="Gender" value={d.gender}/>
        <Row label="Nationality" value={d.nationality}/>
        <Row label="Address" value={`${d.address||""} ${d.postcode||""}`.trim()}/>
      </div>
      {d.photo_url&&(
        <div style={{...card,marginBottom:12,padding:13}}>
          <div style={secHead}>Photo</div>
          <img src={d.photo_url} alt="Player" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:8}}/>
        </div>
      )}
      <div style={{...card,marginBottom:12,padding:13}}>
        <div style={secHead}>Parent / Guardian</div>
        <Row label="Name" value={d.parent_name}/>
        <Row label="Date of Birth" value={d.parent_dob}/>
        <Row label="Email" value={d.parent_email}/>
        <Row label="Phone" value={d.parent_phone}/>
      </div>
      <div style={{...card,marginBottom:18,padding:13}}>
        <div style={secHead}>Verification</div>
        <div style={{display:"flex",alignItems:"center",gap:10,fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{width:24,height:24,borderRadius:6,
            background:d.id_seen?"rgba(22,163,74,0.2)":"rgba(220,38,38,0.2)",
            border:`1px solid ${d.id_seen?C.success:C.danger}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
            {d.id_seen?"✓":"✕"}</div>
          <span style={{fontSize:14,color:d.id_seen?C.success:C.danger,fontWeight:600}}>
            {d.id_seen?"ID seen and verified":"ID NOT verified"}</span>
        </div>
      </div>
      <button style={{...btn,width:"100%",padding:14,
        background:reg.status==="pending"
          ?`linear-gradient(135deg,${C.success},#15803d)`
          :`linear-gradient(135deg,${C.warn},#b45309)`}}
        onClick={()=>{onToggle(reg.id,reg.status);onClose();}}>
        {reg.status==="pending"?"✓ Mark as Actioned":"↩ Reopen"}
      </button>
    </Modal>
  );
}

function OrderDetail({order,onClose,onToggle}) {
  return (
    <Modal title={`${order.team} · ${order.age_group}`} onClose={onClose}>
      <div style={{marginBottom:14}}>
        <Bdg s={order.status}/>
        <span style={{marginLeft:10,fontSize:12,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>
          Submitted {order.submitted_at?.slice(0,10)}</span>
      </div>
      <div style={{...card,marginBottom:12,padding:13}}>
        <div style={secHead}>Details</div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,marginBottom:4}}>
          Contact: <span style={{color:C.offwhite}}>{order.submitter_name||"—"}</span></div>
        {order.special_request&&(
          <div style={{marginTop:9,padding:10,background:C.input,borderRadius:8,
            border:`1px solid ${C.border}`,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.silver}}>
            📝 {order.special_request}</div>
        )}
      </div>
      <div style={{...card,marginBottom:18,padding:13}}>
        <div style={secHead}>Line Items</div>
        {(order.kit_order_items||[]).map((item,idx)=>(
          <div key={idx} style={{marginBottom:13,paddingBottom:13,
            borderBottom:idx<(order.kit_order_items.length-1)?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontFamily:"'DM Sans',sans-serif"}}>
              <span style={{fontWeight:700,fontSize:14}}>{item.item_name}</span>
              <span style={{color:C.muted,fontSize:12}}>{item.size&&`${item.size} · `}Qty: {item.qty}</span>
            </div>
            {item.personalisation_data&&item.personalisation_data.length>0&&(
              <div style={{background:C.input,borderRadius:8,padding:9,border:`1px solid ${C.border}`}}>
                {item.personalisation_data.map((p,i)=>(
                  <div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.silver,marginBottom:2}}>
                    <span style={{color:C.muted,minWidth:18,display:"inline-block"}}>{i+1}.</span>
                    {p.squad&&<span> Squad: <strong style={{color:C.white}}>{p.squad}</strong></span>}
                    {p.initials&&<span> Initials: <strong style={{color:C.white}}>{p.initials}</strong></span>}
                    {!p.squad&&!p.initials&&<span style={{color:C.muted}}> No personalisation</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button style={{...btn,width:"100%",padding:14,
        background:order.status==="pending"
          ?`linear-gradient(135deg,${C.success},#15803d)`
          :`linear-gradient(135deg,${C.warn},#b45309)`}}
        onClick={()=>{onToggle(order.id,order.status);onClose();}}>
        {order.status==="pending"?"✓ Mark as Actioned":"↩ Reopen"}
      </button>
    </Modal>
  );
}

// ── Secretary dashboard ────────────────────────────────────────
function SecretaryView() {
  const [tab,setTab]=useState("registrations");
  const [regs,setRegs]=useState([]);
  const [orders,setOrders]=useState([]);
  const [loadingRegs,setLoadingRegs]=useState(true);
  const [loadingOrders,setLoadingOrders]=useState(true);
  const [selReg,setSelReg]=useState(null);
  const [selOrd,setSelOrd]=useState(null);

  useEffect(()=>{
    sb.from("registrations").select("*").order("submitted_at",{ascending:false})
      .then(({data})=>{ setRegs(data||[]); setLoadingRegs(false); });
  },[]);

  useEffect(()=>{
    sb.from("kit_orders")
      .select("*, kit_order_items(*), profiles(name)")
      .order("submitted_at",{ascending:false})
      .then(({data})=>{
        const mapped=(data||[]).map(o=>({...o,submitter_name:o.profiles?.name}));
        setOrders(mapped); setLoadingOrders(false);
      });
  },[]);

  const toggleReg=async(id,currentStatus)=>{
    const newStatus=currentStatus==="pending"?"actioned":"pending";
    await sb.from("registrations").update({status:newStatus}).eq("id",id);
    setRegs(prev=>prev.map(r=>r.id===id?{...r,status:newStatus}:r));
  };

  const toggleOrd=async(id,currentStatus)=>{
    const newStatus=currentStatus==="pending"?"actioned":"pending";
    await sb.from("kit_orders").update({status:newStatus}).eq("id",id);
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status:newStatus}:o));
  };

  const pending=list=>list.filter(i=>i.status==="pending").length;

  return (
    <div style={{padding:18}}>
      <h2 style={{margin:"0 0 4px",fontSize:22,fontFamily:"'Crimson Pro',Georgia,serif"}}>Secretary Dashboard</h2>
      <p style={{margin:"0 0 18px",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Tap any row to view full details.</p>
      <div style={{display:"flex",gap:4,marginBottom:14,background:C.card,borderRadius:10,
        padding:4,border:`1px solid ${C.border}`}}>
        {[{id:"registrations",label:`Registrations${pending(regs)>0?` (${pending(regs)})`:""}`,},
          {id:"orders",label:`Orders${pending(orders)>0?` (${pending(orders)})`:""}`,}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",
              background:tab===t.id?`linear-gradient(135deg,${C.royal},${C.bright})`:"transparent",
              color:tab===t.id?C.white:C.muted,fontFamily:"'DM Sans',sans-serif",
              fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="registrations"&&(
        <div style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>
              {regs.length} total · {pending(regs)} pending</span>
          </div>
          {loadingRegs?<Spinner/>:regs.length===0
            ?<div style={{color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"12px 0"}}>No registrations yet.</div>
            :regs.map(r=>(
            <div key={r.id} onClick={()=>setSelReg(r)}
              style={{background:C.input,borderRadius:10,padding:13,marginBottom:8,
                border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",
                justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>
                  {r.first_name} {r.surname}</div>
                <div style={{fontSize:11,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>
                  {r.team} · {r.submitted_at?.slice(0,10)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Bdg s={r.status}/><span style={{color:C.muted,fontSize:18}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="orders"&&(
        <div style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>
              {orders.length} total · {pending(orders)} pending</span>
          </div>
          {loadingOrders?<Spinner/>:orders.length===0
            ?<div style={{color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"12px 0"}}>No orders yet.</div>
            :orders.map(o=>(
            <div key={o.id} onClick={()=>setSelOrd(o)}
              style={{background:C.input,borderRadius:10,padding:13,marginBottom:8,
                border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",
                justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>
                  {o.team} · {o.age_group}</div>
                <div style={{fontSize:11,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>
                  {(o.kit_order_items||[]).length} item{(o.kit_order_items||[]).length!==1?"s":""} · {o.submitted_at?.slice(0,10)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Bdg s={o.status}/><span style={{color:C.muted,fontSize:18}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selReg&&<RegDetail reg={selReg} onClose={()=>setSelReg(null)} onToggle={toggleReg}/>}
      {selOrd&&<OrderDetail order={selOrd} onClose={()=>setSelOrd(null)} onToggle={toggleOrd}/>}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [active,setActive]=useState("dashboard");
  const [checking,setChecking]=useState(true);

  // Restore session on page load
  useEffect(()=>{
    sb.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const {data:profile}=await sb.from("profiles").select("*").eq("id",session.user.id).single();
        const {data:teamRows}=await sb.from("profile_teams").select("team").eq("profile_id",session.user.id);
        const teams=(teamRows||[]).map(r=>r.team);
        setUser({id:session.user.id,name:profile.name,role:profile.role,
          isSecretary:profile.is_secretary,teams});
      }
      setChecking(false);
    });
  },[]);

  const handleLogout=async()=>{ await sb.auth.signOut(); setUser(null); };

  if(checking) return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.navy} 0%,#060e1c 100%)`,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Crest size={64} glow/>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      {!user
        ? <LoginScreen onLogin={u=>{setUser(u);setActive("dashboard");}}/>
        : <div style={{height:"100vh",display:"flex",flexDirection:"column",
            background:`linear-gradient(160deg,${C.navy} 0%,#060e1c 100%)`,
            fontFamily:"'Crimson Pro',Georgia,serif",color:C.white,overflow:"hidden"}}>
            <Topbar user={user} onLogout={handleLogout} active={active}/>
            <main style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
              {active==="dashboard"&&<DashboardView user={user} setActive={setActive}/>}
              {active==="registration"&&<RegistrationForm user={user}/>}
              {active==="kitorder"&&<KitOrderForm user={user}/>}
              {active==="secretary"&&user.isSecretary&&<SecretaryView/>}
            </main>
            <BottomNav active={active} setActive={setActive} isSecretary={user.isSecretary}/>
          </div>
      }
    </>
  );
}
