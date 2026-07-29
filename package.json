import { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get } from "firebase/database";

// ── Firebase config ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyD0IjY3Kpn0kr-N-kLwPqGAa8emUJ5BYCk",
  authDomain: "andy-quinones-tournament.firebaseapp.com",
  databaseURL: "https://andy-quinones-tournament-default-rtdb.firebaseio.com",
  projectId: "andy-quinones-tournament",
  storageBucket: "andy-quinones-tournament.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ── Firebase helpers ──────────────────────────────────────────────────────────
function dbSet(path, value){ return set(ref(db, path), value); }
function dbListen(path, callback){ return onValue(ref(db, path), snap=>callback(snap.val())); }

// ── Local session storage only (not synced) ───────────────────────────────────
const SK_SESSION="aqmgt-session";
function sget(key,fallback){try{const r=localStorage.getItem(key);return r!==null?JSON.parse(r):fallback;}catch{return fallback;}}
function sset(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}
let UID=35;

const COURSE=[
  {hole:1,par:4,hcp:17,yards:293},{hole:2,par:4,hcp:1,yards:400},{hole:3,par:5,hcp:5,yards:414},
  {hole:4,par:3,hcp:7,yards:190},{hole:5,par:4,hcp:11,yards:328},{hole:6,par:4,hcp:15,yards:298},
  {hole:7,par:4,hcp:9,yards:370},{hole:8,par:3,hcp:13,yards:160},{hole:9,par:4,hcp:3,yards:392},
  {hole:10,par:4,hcp:10,yards:358},{hole:11,par:4,hcp:18,yards:292},{hole:12,par:5,hcp:4,yards:500},
  {hole:13,par:3,hcp:14,yards:143},{hole:14,par:5,hcp:8,yards:480},{hole:15,par:3,hcp:16,yards:148},
  {hole:16,par:5,hcp:6,yards:491},{hole:17,par:4,hcp:2,yards:422},{hole:18,par:4,hcp:12,yards:311},
];
const HCP_ORDER=[...COURSE].sort((a,b)=>a.hcp-b.hcp).map(h=>h.hole);
const FLIGHT_NAMES=["A","B","C","D","E"];
const FLIGHT_SIZES=[6,6,6,6,7];
const PAYOUTS={1:400,2:200,3:100};
const SKINS_POT=400;
const ADMIN_CODES=["ANDYQ26","STAFF001","STAFF002"];
const PRIZE_HOLES={2:"💥 Longest Drive",4:"📍 Closest to Pin",8:"📍 Closest to Pin",9:"🎯 Closest 2nd Shot",13:"📍 Closest to Pin",15:"📍 Closest to Pin"};
const CONTESTS=[
  {id:"ld",label:"Longest Drive",icon:"💥",note:"Hole 2 · Par 4 · 400 yards"},
  {id:"ctp4",label:"Closest to Pin — Hole 4",icon:"📍",note:"Hole 4 · Par 3 · 190 yards"},
  {id:"ctp8",label:"Closest to Pin — Hole 8",icon:"📍",note:"Hole 8 · Par 3 · 160 yards"},
  {id:"ctp13",label:"Closest to Pin — Hole 13",icon:"📍",note:"Hole 13 · Par 3 · 143 yards"},
  {id:"ctp15",label:"Closest to Pin — Hole 15",icon:"📍",note:"Hole 15 · Par 3 · 148 yards"},
  {id:"c2h9",label:"Closest 2nd Shot — Hole 9",icon:"🎯",note:"Hole 9 · Par 4 · 392 yards"},
];
const C={navy:"#0d2340",navyMid:"#162d4a",navyLight:"#1e3a5f",green:"#3aeb3a",greenDim:"#2ab82a",greenDark:"#1a7a1a",white:"#ffffff",offWhite:"#e8f0e8",gray:"#8faab0",grayDark:"#4a6070",gold:"#d4af37",silver:"#9ca3af",bronze:"#b87333",red:"#b91c1c",orange:"#c2410c"};

const totalScore=s=>Object.values(s).reduce((a,v)=>a+(v||0),0);
function relToPar(s){const t=totalScore(s);if(!t)return"--";const played=Object.keys(s).map(Number);const par=played.reduce((a,h)=>a+COURSE[h-1].par,0);const d=t-par;return d===0?"E":d>0?`+${d}`:`${d}`;}
function scoreLabel(score,par){if(!score)return"";const d=score-par;if(d<=-3)return`${score} (Albatross)`;if(d===-2)return`${score} (Eagle)`;if(d===-1)return`${score} (Birdie)`;if(d===0)return`${score} (Par)`;if(d===1)return`${score} (Bogey)`;if(d===2)return`${score} (Double)`;return`${score} (+${d})`;}
function scorecardPlayoff(a,b){for(const h of HCP_ORDER){const sa=a.scores[h]??99,sb=b.scores[h]??99;if(sa<sb)return 1;if(sb<sa)return -1;}return 0;}
function rankTeams(teams){const sub=teams.filter(t=>t.submitted&&Object.keys(t.scores).length===18);return[...sub].sort((a,b)=>{const sa=totalScore(a.scores),sb=totalScore(b.scores);if(sa!==sb)return sa-sb;return -scorecardPlayoff(a,b);});}
function assignFlights(ranked){const r={};let pos=0;FLIGHT_SIZES.forEach((size,fi)=>{ranked.slice(pos,pos+size).forEach((t,rank)=>{r[t.id]={flight:FLIGHT_NAMES[fi],flightRank:rank+1};});pos+=size;});return r;}
function computeSkins(ft){const sw={};let carry=0;COURSE.forEach(({hole})=>{const scores=ft.map(t=>({id:t.id,score:t.scores[hole]??99}));const min=Math.min(...scores.map(s=>s.score));const winners=scores.filter(s=>s.score===min);if(winners.length===1){sw[hole]={teamId:winners[0].id,skins:1+carry};carry=0;}else{sw[hole]={teamId:null,carryover:true};carry++;}});const tally={};ft.forEach(t=>{tally[t.id]=0;});Object.values(sw).forEach(({teamId,skins})=>{if(teamId)tally[teamId]=(tally[teamId]||0)+skins;});return{skinWinners:sw,tally};}
function generateCode(name,idx){const c=name.replace(/[^a-zA-Z0-9]/g,"").toUpperCase();return`${c.substring(0,3)||"TM"}${String(idx+1).padStart(2,"0")}`;}
function newTeam(name,idx){const id=`T${UID++}`;sset(SK_UID,UID);return{id,name,code:generateCode(name,idx),scores:{},submitted:false};}
function generateTestScores(seed){const scores={};let rng=seed*1103515245+12345;COURSE.forEach(({hole,par})=>{rng=(rng*1103515245+12345)&0x7fffffff;const roll=rng%100;let s=roll<5?par-2:roll<35?par-1:roll<65?par:roll<85?par+1:par+2;scores[hole]=Math.max(1,s);});return scores;}

const ROSTER=[
  {name:"Matt Simpson",                code:"MSI01"},
  {name:"Scott Mandziara",             code:"SMA02"},
  {name:"Jackson Fuller",              code:"JFU03"},
  {name:"Mark Reichert",               code:"MRE04"},
  {name:"Tim Lowery",                  code:"TLO05"},
  {name:"Chris Loness",                code:"CLO06"},
  {name:"Austin Holtgrieve",           code:"AHO07"},
  {name:"Zach Guenther",               code:"ZGU08"},
  {name:"Matt Hacker",                 code:"MHA09"},
  {name:"Erika Martin",                code:"EMA10"},
  {name:"Wendy LaRose",                code:"WLA11"},
  {name:"David Koenig",                code:"DKO12"},
  {name:"Gary Steensgard",             code:"GST13"},
  {name:"Mitch Miller",                code:"MMI14"},
  {name:"Alec Picinich",               code:"API15"},
  {name:"Dan Fitzgerald",              code:"DFI16"},
  {name:"Steve Wade",                  code:"SWA17"},
  {name:"Austin Alvarez",              code:"AAL18"},
  {name:"Drew Quinones",               code:"DREWQ"},
  {name:"Anna Maurer",                 code:"AMA20"},
  {name:"Steve Mohrmann",              code:"SMO21"},
  {name:"Julie Quinones",              code:"JQU22"},
  {name:"Welfare Association - Boden", code:"WAB23"},
  {name:"Wes Degener",                 code:"WDE24"},
  {name:"Ryan Sosnowski",              code:"RSO25"},
  {name:"Jared Brandt",                code:"JBR26"},
  {name:"Cody Pingleton",              code:"CPI27"},
  {name:"Steve Pardo",                 code:"SPA28"},
  {name:"Keith Schildroth",            code:"KSC29"},
  {name:"Bryce Beckmann",              code:"BBE30"},
  {name:"Florissant Police Officers",  code:"FPO31"},
];
function buildDefaultTeams(){return ROSTER.map((r,i)=>({id:`T${i+1}`,name:r.name,code:r.code,scores:{},submitted:false}));}

const cardSt={background:"#162d4a",border:"1px solid #1e3a5f",borderRadius:12,padding:16,margin:"14px 16px"};
const inp={background:"#0a1b30",border:"2px solid #1e3a5f",borderRadius:8,color:"#fff",padding:"11px 13px",fontSize:15,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"Georgia,serif"};
const codeInp={...inp,letterSpacing:3,textAlign:"center",fontSize:17,fontFamily:"monospace"};
const btn=(bg="#1a7a1a",fg="#fff",mt=10)=>({background:bg,color:fg,border:"none",borderRadius:9,padding:"12px 20px",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",marginTop:mt,fontFamily:"Georgia,serif"});

function ScorePill({score,par}){
  if(!score)return <span style={{color:"#4a6070",fontSize:13}}>—</span>;
  const d=score-par;
  let bg="#4a6070",color="#fff",r="3px";
  if(d<=-2){bg=C.gold;color="#111";r="50%";}
  else if(d===-1){bg=C.greenDim;r="50%";}
  else if(d===0){bg=C.navyLight;}
  else if(d===1){bg=C.orange;}
  else{bg=C.red;}
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:r,background:bg,color,fontWeight:700,fontSize:13,border:d<=-2?`2px solid ${C.gold}`:"none"}}>{score}</span>;
}
function Toast({msg,type}){return <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:type==="error"?C.red:C.greenDark,color:"#fff",padding:"11px 24px",borderRadius:10,fontSize:14,fontWeight:700,zIndex:9999,boxShadow:"0 4px 24px rgba(0,0,0,.5)",whiteSpace:"nowrap"}}>{msg}</div>;}
// LogoBadge removed (unused)
function Header({sub}){return(<div style={{background:"linear-gradient(180deg,#0a1b30 0%,#0d2340 100%)",borderBottom:"3px solid #3aeb3a",padding:"16px 16px 14px",textAlign:"center"}}><div style={{textAlign:"center",marginBottom:4}}><div style={{fontSize:9,letterSpacing:3,color:C.green,textTransform:"uppercase",fontWeight:700}}>2nd Annual Tournament · Aug 1, 2026</div><div style={{fontSize:20,fontWeight:700,color:C.white,lineHeight:1.2,fontFamily:"Georgia,serif"}}>Andy Quinones Memorial</div><div style={{fontSize:13,color:C.green,fontWeight:700,letterSpacing:.5}}>Golf Tournament</div></div>{sub&&<div style={{fontSize:12,color:C.gray,marginTop:4}}>{sub}</div>}</div>);}

export default function App(){
  const [teams,setTeams]=useState([]);
  const [roundEnded,setRound]=useState(false);
  const [contests,setContests]=useState({});
  const [dbReady,setDbReady]=useState(false);
  const [view,setView]=useState(()=>{const s=sget(SK_SESSION,null);if(!s)return"login";return s.type==="admin"?"admin":"scoring";});
  const [curId,setCurId]=useState(()=>{const s=sget(SK_SESSION,null);return s?.type==="player"?s.teamId:null;});

  // ── Sync from Firebase on mount ───────────────────────────────────────────
  useEffect(()=>{
    const unsubTeams=dbListen("teams",(val)=>{
      if(val){
        const arr=Object.values(val).map(t=>({...t,scores:t.scores||{}}));
        setTeams(arr);
      } else {
        // First load — seed default teams
        const defaults=buildDefaultTeams();
        const obj={};
        defaults.forEach(t=>{obj[t.id]=t;});
        dbSet("teams",obj);
        setTeams(defaults);
      }
      setDbReady(true);
    });
    const unsubRound=dbListen("roundEnded",(val)=>setRound(!!val));
    const unsubContests=dbListen("contests",(val)=>setContests(val||{}));
    return()=>{unsubTeams();unsubRound();unsubContests();};
  },[]);

  const [codeInput,setCode]=useState("");
  const [loginErr,setLoginErr]=useState("");
  const [adminTab,setAdminTab]=useState("teams");
  const [playerTab,setPlayerTab]=useState("scorecard");
  const [editHole,setEditHole]=useState(null);
  const [holeVal,setHoleVal]=useState("");
  const [toast,setToast]=useState(null);
  const [selFlight,setSelFlight]=useState("A");
  const [addName,setAddName]=useState("");
  const [addCode,setAddCode]=useState("");
  const [editingTeamId,setEditingTeamId]=useState(null);
  const [editName,setEditName]=useState("");
  const [editCode,setEditCode]=useState("");
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [showAddForm,setShowAddForm]=useState(false);
  const [bulkText,setBulkText]=useState("");
  const [bulkMode,setBulkMode]=useState(false);
  const [overrideTeamId,setOverrideTeamId]=useState(null);
  const [overrideScores,setOverrideScores]=useState({});
  const [overrideHole,setOverrideHole]=useState(null);
  const [overrideVal,setOverrideVal]=useState("");
  const [contestEditing,setContestEditing]=useState(null);
  const [contestName,setContestName]=useState("");

  const ranked=useMemo(()=>rankTeams(teams),[teams]);
  const flightMap=useMemo(()=>assignFlights(ranked),[ranked]);
  const curTeam=teams.find(t=>t.id===curId);

  function showToast(msg,type="success"){setToast({msg,type});setTimeout(()=>setToast(null),2800);}
  function logout(){sset(SK_SESSION,null);setView("login");setCurId(null);setCode("");setEditHole(null);}
  function getFlightTeams(f){return ranked.filter(t=>flightMap[t.id]?.flight===f);}

  function handleLogin(){
    const code=codeInput.trim().toUpperCase();
    if(ADMIN_CODES.includes(code)){sset(SK_SESSION,{type:"admin"});setView("admin");setLoginErr("");return;}
    const team=teams.find(t=>t.code===code);
    if(team){sset(SK_SESSION,{type:"player",teamId:team.id});setCurId(team.id);setView("scoring");setLoginErr("");return;}
    setLoginErr("Invalid code. See tournament staff.");
  }
  function saveScore(hole,val){
    const s=parseInt(val);
    if(!s||s<1||s>15){showToast("Enter a score 1–15","error");return;}
    const team=teams.find(t=>t.id===curId);
    const newScores={...team.scores,[hole]:s};
    dbSet(`teams/${curId}/scores`,newScores);
    setEditHole(null);showToast(`Hole ${hole} saved ✓`);
  }
  function submitCard(){
    dbSet(`teams/${curId}/submitted`,true);
    sset(SK_SESSION,null);showToast("Scorecard submitted!");
    setView("login");setCurId(null);setCode("");
  }
  function addTeam(){
    const name=addName.trim();if(!name){showToast("Enter a team name","error");return;}
    const code=(addCode.trim().toUpperCase()||generateCode(name,teams.length));
    if(teams.find(t=>t.code===code)){showToast("Code already in use","error");return;}
    const t={id:`T${UID++}`,name,code,scores:{},submitted:false};
    dbSet(`teams/${t.id}`,t);
    setAddName("");setAddCode("");setShowAddForm(false);showToast(`${name} added ✓`);
  }
  function saveEditTeam(){
    const name=editName.trim(),code=editCode.trim().toUpperCase();
    if(!name||!code){showToast("Name and code required","error");return;}
    if(teams.find(t=>t.code===code&&t.id!==editingTeamId)){showToast("Code in use","error");return;}
    dbSet(`teams/${editingTeamId}/name`,name);
    dbSet(`teams/${editingTeamId}/code`,code);
    setEditingTeamId(null);showToast("Team updated ✓");
  }
  function deleteTeam(id){
    dbSet(`teams/${id}`,null);
    setConfirmDelete(null);showToast("Team removed");
  }
  function openOverride(team){setOverrideTeamId(team.id);setOverrideScores({...team.scores});setOverrideHole(null);setOverrideVal("");setEditingTeamId(null);setConfirmDelete(null);}
  function saveOverride(){
    const missing=COURSE.filter(h=>!overrideScores[h.hole]||overrideScores[h.hole]<1);
    if(missing.length){showToast(`Missing score for Hole ${missing[0].hole}`,"error");return;}
    dbSet(`teams/${overrideTeamId}/scores`,overrideScores);
    dbSet(`teams/${overrideTeamId}/submitted`,true);
    setOverrideTeamId(null);showToast("Scores updated ✓");
  }
  function addBulk(){
    const lines=bulkText.split("\n").map(l=>l.trim()).filter(Boolean);
    if(!lines.length){showToast("Paste at least one name","error");return;}
    const existing=new Set(teams.map(t=>t.code));let count=0;
    lines.forEach(name=>{
      let code=generateCode(name,teams.length+count);let a=0;
      while(existing.has(code)){code=generateCode(name,teams.length+count+(a++));}
      existing.add(code);
      const t={id:`T${UID++}`,name,code,scores:{},submitted:false};
      dbSet(`teams/${t.id}`,t);count++;
    });
    setBulkText("");setBulkMode(false);showToast(`${count} team${count!==1?"s":""} added ✓`);
  }
  function saveContest(id){
    const winner=contestName.trim();if(!winner){showToast("Enter a winner name","error");return;}
    dbSet(`contests/${id}`,{winner});
    setContestEditing(null);setContestName("");showToast("Contest saved ✓");
  }

  function setRoundEnded(val){
    setRound(val);
    dbSet("roundEnded",val);
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if(!dbReady) return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:32}}>⛳</div>
      <div style={{color:C.green,fontFamily:"Georgia,serif",fontSize:16,fontWeight:700}}>Andy Quinones Memorial</div>
      <div style={{color:C.gray,fontSize:13}}>Loading tournament data...</div>
    </div>
  );

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if(view==="login")return(
    <div style={{minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"Georgia,serif",paddingBottom:48}}>
      <Header/>
      <div style={{...cardSt,textAlign:"center"}}>
        <div style={{fontSize:12,color:C.gray,marginBottom:14,lineHeight:1.8}}>Florissant Golf Club · Florissant, MO<br/>Scramble · Stroke Play · 18 Holes · 5 Flights</div>
        <div style={{fontSize:12,color:C.gray,marginBottom:10}}>Enter your team code from check-in</div>
        <input style={codeInp} placeholder="TEAM CODE" value={codeInput} onChange={e=>{setCode(e.target.value.toUpperCase());setLoginErr("");}} onKeyDown={e=>e.key==="Enter"&&handleLogin()} maxLength={9}/>
        {loginErr&&<div style={{color:"#f87171",fontSize:13,marginTop:8}}>{loginErr}</div>}
        <button style={btn()} onClick={handleLogin}>Enter Tournament</button>
      </div>
      <div style={{...cardSt,padding:14}}>
        <div style={{fontSize:10,color:C.gray,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>Score Legend</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          {[[C.gold,"Eagle+","50%"],[C.greenDim,"Birdie","50%"],[C.navyLight,"Par","4px"],[C.orange,"Bogey","2px"],[C.red,"Double+","2px"]].map(([bg,label,r])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:18,height:18,borderRadius:r,background:bg}}/><span style={{fontSize:11,color:C.gray}}>{label}</span></div>
          ))}
        </div>
      </div>
      <div style={{textAlign:"center",padding:"8px 16px",fontSize:11,color:C.grayDark,lineHeight:1.8}}>In memory of Andy Quinones<br/><span style={{color:C.greenDim,fontStyle:"italic"}}>Play with honor · Play with heart</span></div>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );

  // ── PLAYER VIEW ───────────────────────────────────────────────────────────
  if((view==="scoring"||view==="results")&&curTeam){
    const entered=Object.keys(curTeam.scores).length;
    const allIn=entered===18;
    const front9=COURSE.slice(0,9).reduce((a,h)=>a+(curTeam.scores[h.hole]||0),0);
    const back9=COURSE.slice(9).reduce((a,h)=>a+(curTeam.scores[h.hole]||0),0);
    const remaining=COURSE.filter(h=>!curTeam.scores[h.hole]);
    const myFlight=flightMap[curTeam.id]?.flight;
    const myFlightRank=flightMap[curTeam.id]?.flightRank;
    const myFT=myFlight?getFlightTeams(myFlight):[];
    const {tally:myTally}=myFT.length?computeSkins(myFT):{skinWinners:{},tally:{}};
    const myTotalSkins=Object.values(myTally).reduce((a,v)=>a+v,0);
    const mySkinVal=myTotalSkins>0?(SKINS_POT/myTotalSkins):0;
    const medals=[C.gold,C.silver,C.bronze];
    const allSubmitted=teams.length>0&&teams.every(t=>t.submitted);
    const TABS=[{id:"scorecard",label:"Scorecard",icon:"📋"},{id:"results",label:"Results",icon:"🏆"},{id:"skins",label:"Skins",icon:"💰"},{id:"contests",label:"Contests",icon:"🎯"},{id:"field",label:"Field",icon:"📊"}];

    function LockedScreen({label}){return(<div style={{padding:"48px 32px",textAlign:"center"}}><div style={{fontSize:40,marginBottom:16}}>🔒</div><div style={{fontWeight:700,fontSize:17,color:C.white,marginBottom:10}}>{label} Locked</div><div style={{fontSize:13,color:C.gray,lineHeight:1.8}}>Results will be revealed once all teams submit and the round ends.<br/><br/><span style={{color:C.green,fontWeight:600}}>Andy is watching — so no cheating. ⛳</span></div></div>);}

    function ScorecardContent(){
      return(
        <div style={{paddingBottom:20}}>
          <div style={{display:"flex",gap:6,padding:"12px 16px 0"}}>
            {[["Total",totalScore(curTeam.scores)||"—"],["Score",relToPar(curTeam.scores)],["Holes",`${entered}/18`]].map(([l,v])=>(
              <div key={l} style={{flex:1,background:C.navyMid,border:`1px solid ${C.navyLight}`,borderRadius:9,padding:"9px 4px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:700,color:C.green}}>{v}</div>
                <div style={{fontSize:9,color:C.gray,textTransform:"uppercase",letterSpacing:1.5}}>{l}</div>
              </div>
            ))}
          </div>
          {entered>0&&(<div style={{display:"flex",gap:6,padding:"8px 16px 0"}}>{[["Front 9",front9||"—"],["Back 9",back9||"—"]].map(([l,v])=>(<div key={l} style={{flex:1,background:"#0a1b30",border:`1px solid ${C.navyLight}`,borderRadius:7,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,color:C.offWhite}}>{v}</div><div style={{fontSize:9,color:C.gray,textTransform:"uppercase",letterSpacing:1}}>{l}</div></div>))}</div>)}
          <div style={{display:"flex",gap:3,padding:"10px 16px 0",flexWrap:"wrap"}}>
            {COURSE.map(({hole})=>(<div key={hole} style={{width:14,height:14,borderRadius:3,background:curTeam.scores[hole]?C.greenDim:C.navyLight,border:`1px solid ${curTeam.scores[hole]?C.green:C.grayDark}`,cursor:"pointer",flexShrink:0}} onClick={()=>{if(!curTeam.submitted){setEditHole(hole);setHoleVal(curTeam.scores[hole]||"");document.getElementById(`hole-${hole}`)?.scrollIntoView({behavior:"smooth",block:"center"});}}}/>))}
            <div style={{fontSize:10,color:allIn?C.green:C.gray,marginLeft:6,alignSelf:"center",fontWeight:allIn?700:400}}>{allIn?"All 18 entered ✓":`${entered}/18`}</div>
          </div>
          {entered>0&&!allIn&&!curTeam.submitted&&(<div style={{margin:"10px 16px 0",background:"#1c1500",border:"1px solid #78350f",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#fbbf24",lineHeight:1.6}}>Still needed: {remaining.map(h=>`Hole ${h.hole}`).join(", ")}</div>)}
          <div style={{margin:"10px 16px 0",display:"flex",alignItems:"center",gap:8,background:"#1a1500",border:`1px solid ${C.gold}`,borderRadius:8,padding:"8px 12px"}}><div style={{width:14,height:14,borderRadius:3,border:`2px solid ${C.gold}`,background:"#1a1500",flexShrink:0}}/><div style={{fontSize:11,color:C.gold,fontWeight:600}}>Gold border = contest hole with prizes</div></div>
          <div style={{padding:"12px 16px 0"}}>
            {[0,9].map(start=>(
              <div key={start}>
                <div style={{fontSize:10,color:C.green,textTransform:"uppercase",letterSpacing:2,fontWeight:700,margin:"10px 0 6px",borderBottom:`1px solid ${C.navyLight}`,paddingBottom:4}}>{start===0?"Front 9 (Out)":"Back 9 (In)"}</div>
                {COURSE.slice(start,start+9).map(({hole,par,hcp,yards})=>{
                  const isPrize=!!PRIZE_HOLES[hole],hasScore=!!curTeam.scores[hole];
                  return(
                    <div id={`hole-${hole}`} key={hole} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:hasScore?"#0e2a18":isPrize?"#1a1500":C.navy,borderRadius:9,marginBottom:5,border:`2px solid ${hasScore?C.greenDark:isPrize?C.gold:C.navyLight}`}}>
                      <div style={{minWidth:72}}><div style={{fontWeight:700,fontSize:15}}>Hole {hole}</div><div style={{fontSize:10,color:C.gray}}>Par {par} · {yards}y · HCP {hcp}</div>{isPrize&&<div style={{fontSize:10,color:C.gold,fontWeight:700,marginTop:2}}>{PRIZE_HOLES[hole]}</div>}</div>
                      <div style={{flex:1,textAlign:"center"}}><ScorePill score={curTeam.scores[hole]} par={par}/></div>
                      {!curTeam.submitted&&(editHole===hole?(
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          <input autoFocus type="number" min={1} max={15} style={{...inp,width:54,padding:"6px 8px",textAlign:"center",fontSize:16,letterSpacing:0}} value={holeVal} onChange={e=>setHoleVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveScore(hole,holeVal);if(e.key==="Escape")setEditHole(null);}}/>
                          <button onClick={()=>saveScore(hole,holeVal)} style={{background:C.greenDark,color:"#fff",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontWeight:700,fontSize:14}}>✓</button>
                          <button onClick={()=>setEditHole(null)} style={{background:C.navyLight,color:"#fff",border:"none",borderRadius:6,padding:"6px 9px",cursor:"pointer",fontSize:13}}>✕</button>
                        </div>
                      ):(
                        <button onClick={()=>{setEditHole(hole);setHoleVal(curTeam.scores[hole]||"");}} style={{background:hasScore?C.navyLight:C.greenDark,color:"#fff",border:"none",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>{hasScore?"Edit":"Enter"}</button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{padding:"14px 16px 0"}}>
            {curTeam.submitted&&(<div style={{...cardSt,margin:"0 0 12px",textAlign:"center",background:"#0e2a18",border:`1px solid ${C.greenDark}`}}><div style={{fontSize:28,marginBottom:4}}>⛳</div><div style={{fontWeight:700,color:C.green,fontSize:17}}>Scorecard Submitted</div><div style={{fontSize:12,color:C.gray,marginTop:6,lineHeight:1.7}}>Great round! Check the Results tab once the round ends.</div></div>)}
            {!curTeam.submitted&&allIn&&(<div style={{background:"#0e2a18",border:`1px solid ${C.green}`,borderRadius:12,padding:16,marginBottom:12}}><div style={{fontSize:13,color:C.offWhite,fontWeight:700,marginBottom:4}}>All 18 holes entered ✓</div><div style={{fontSize:11,color:C.gray,marginBottom:12,lineHeight:1.6}}>Review your scores above before submitting.<br/><strong style={{color:"#fbbf24"}}>Scores cannot be changed after submission.</strong></div><button style={btn("#166534","#fff",0)} onClick={submitCard}>⛳ Submit Final Scorecard</button></div>)}
            {!curTeam.submitted&&!allIn&&entered>0&&<div style={{fontSize:12,color:C.gray,textAlign:"center",padding:"4px 0 12px"}}>{18-entered} hole{18-entered!==1?"s":""} remaining — submit unlocks when all 18 are in</div>}
            {!curTeam.submitted&&entered===0&&<div style={{fontSize:12,color:C.gray,textAlign:"center",padding:"4px 0 12px"}}>Tap Enter on any hole to start scoring</div>}
            <button style={btn(C.navyLight,"#fff",0)} onClick={logout}>← Log Out</button>
          </div>
        </div>
      );
    }

    function ResultsContent(){
      if(!roundEnded)return <LockedScreen label="Results"/>;
      return(
        <div style={{padding:"12px 16px 0",paddingBottom:20}}>
          {myFlight&&(<div style={{background:"#0e2a18",border:`2px solid ${C.green}`,borderRadius:12,padding:16,textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:10,color:C.green,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Your Result</div>
            <div style={{fontSize:20,fontWeight:700,color:C.white,marginBottom:2}}>{curTeam.name}</div>
            <div style={{fontSize:13,color:C.gray,marginBottom:12}}>Flight {myFlight} · Score {totalScore(curTeam.scores)} ({relToPar(curTeam.scores)})</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <div style={{background:myFlightRank<=3?medals[myFlightRank-1]:C.navyLight,borderRadius:8,padding:"8px 16px",minWidth:72,textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:myFlightRank===1?"#111":"#fff"}}>{myFlightRank<=3?["🥇","🥈","🥉"][myFlightRank-1]:`#${myFlightRank}`}</div><div style={{fontSize:10,color:myFlightRank===1?"#333":C.gray,marginTop:2}}>Flight {myFlight}</div></div>
              {PAYOUTS[myFlightRank]&&<div style={{background:C.greenDark,borderRadius:8,padding:"8px 16px",minWidth:72,textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>${PAYOUTS[myFlightRank]}</div><div style={{fontSize:10,color:C.gray,marginTop:2}}>Prize</div></div>}
              {myTally[curTeam.id]>0&&<div style={{background:"#2d1f00",border:`1px solid ${C.gold}`,borderRadius:8,padding:"8px 16px",minWidth:72,textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:C.gold}}>${(myTally[curTeam.id]*mySkinVal).toFixed(0)}</div><div style={{fontSize:10,color:C.gray,marginTop:2}}>{myTally[curTeam.id]} Skin{myTally[curTeam.id]!==1?"s":""}</div></div>}
            </div>
          </div>)}
          <div style={{display:"flex",gap:5,marginBottom:10}}>
            {FLIGHT_NAMES.map(f=>(<button key={f} onClick={()=>setSelFlight(f)} style={{flex:1,background:selFlight===f?C.greenDark:C.navyMid,color:"#fff",border:"none",borderRadius:7,padding:"9px 4px",fontSize:13,fontWeight:selFlight===f?700:400,cursor:"pointer",position:"relative"}}>{f}{myFlight===f&&<span style={{position:"absolute",top:3,right:4,width:6,height:6,borderRadius:"50%",background:C.green,display:"block"}}/>}</button>))}
          </div>
          {getFlightTeams(selFlight).map((t,i)=>{
            const rank=i+1,payout=PAYOUTS[rank],isMe=t.id===curId;
            const {tally:sft}=computeSkins(getFlightTeams(selFlight));
            const ts=sft[t.id]||0;
            return(<div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",background:isMe?"#0a2218":rank<=3?"#0e2018":C.navyMid,borderRadius:10,marginBottom:6,border:`2px solid ${isMe?C.green:rank===1?"#2d5a27":C.navyLight}`}}>
              <div style={{width:28,height:28,flexShrink:0,background:rank<=3?medals[rank-1]:C.navyLight,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:rank===1?"#111":"#fff"}}>{rank<=3?["🥇","🥈","🥉"][rank-1]:rank}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontWeight:700,fontSize:14}}>{t.name}</span>{isMe&&<span style={{fontSize:9,background:C.green,color:C.navy,borderRadius:4,padding:"1px 5px",fontWeight:700,textTransform:"uppercase"}}>You</span>}</div>
                <div style={{display:"flex",gap:8,marginTop:2}}>{payout&&<span style={{fontSize:10,color:C.gold,fontWeight:700}}>💰 ${payout}</span>}{ts>0&&<span style={{fontSize:10,color:C.gold}}>🏌 {ts} skin{ts!==1?"s":""}</span>}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:700,fontSize:20,color:C.green}}>{totalScore(t.scores)}</div><div style={{fontSize:12,color:C.gray}}>{relToPar(t.scores)}</div></div>
            </div>);
          })}
        </div>
      );
    }

    function SkinsContent(){
      if(!roundEnded)return <LockedScreen label="Skins"/>;
      const ft=getFlightTeams(selFlight);
      if(!ft.length)return <div style={{padding:"48px 32px",textAlign:"center",color:C.gray,fontSize:13}}>No scores in Flight {selFlight} yet.</div>;
      const {skinWinners:sw,tally:st}=computeSkins(ft);
      const ts=Object.values(st).reduce((a,v)=>a+v,0);
      const sv=ts>0?(SKINS_POT/ts):0;
      return(
        <div style={{padding:"12px 16px 0",paddingBottom:20}}>
          <div style={{display:"flex",gap:5,marginBottom:12}}>{FLIGHT_NAMES.map(f=>(<button key={f} onClick={()=>setSelFlight(f)} style={{flex:1,background:selFlight===f?C.greenDark:C.navyMid,color:"#fff",border:"none",borderRadius:7,padding:"9px 4px",fontSize:13,fontWeight:selFlight===f?700:400,cursor:"pointer",position:"relative"}}>{f}{myFlight===f&&<span style={{position:"absolute",top:3,right:4,width:6,height:6,borderRadius:"50%",background:C.green,display:"block"}}/>}</button>))}</div>
          <div style={{background:"#0e2a18",border:`1px solid ${C.greenDark}`,borderRadius:9,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Flight {selFlight} Skins</div>
            <div style={{fontSize:11,color:C.gray,marginBottom:10}}>${SKINS_POT} pot · {ts} skin{ts!==1?"s":""} won{ts>0?` · $${sv.toFixed(0)}/skin`:""}</div>
            {ft.filter(t=>st[t.id]>0).sort((a,b)=>st[b.id]-st[a.id]).map(t=>(<div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.navyLight}`,fontSize:13}}><span style={{color:t.id===curId?C.green:C.offWhite,fontWeight:600}}>{t.name}{t.id===curId&&" (You)"}</span><span style={{color:C.gold,fontWeight:700}}>{st[t.id]} skin{st[t.id]!==1?"s":""} — ${(st[t.id]*sv).toFixed(0)}</span></div>))}
            {ft.every(t=>!st[t.id])&&<div style={{color:C.gray,fontSize:12}}>No skins decided yet.</div>}
          </div>
          {COURSE.map(({hole,par})=>{const s=sw[hole],winner=s?.teamId?ft.find(t=>t.id===s.teamId):null,isMe=winner&&winner.id===curId,ws=winner?winner.scores[hole]:null;return(<div key={hole} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:isMe?"#0a2218":winner?"#0e1f10":C.navyMid,borderRadius:8,marginBottom:4,border:`1px solid ${isMe?C.green:winner?C.greenDark:C.navyLight}`}}><div style={{width:38,fontSize:11,color:C.gray,fontWeight:700,flexShrink:0}}>H{hole}<div style={{fontSize:9,color:C.grayDark}}>P{par}</div></div><div style={{flex:1,fontSize:12}}>{winner?<span style={{color:isMe?C.green:C.gold,fontWeight:700}}>🏆 {winner.name}{isMe?" (You)":""}<span style={{color:C.gray,fontWeight:400,marginLeft:5}}>{scoreLabel(ws,par)} · {s.skins} skin{s.skins!==1?"s":""} · ${(s.skins*sv).toFixed(0)}</span></span>:s?.carryover?<span style={{color:C.orange}}>Tie — carries over</span>:<span style={{color:C.grayDark}}>—</span>}</div></div>);})}
        </div>
      );
    }

    function ContestsContent(){
      if(!roundEnded)return <LockedScreen label="Contests"/>;
      const hasAny=Object.keys(contests).length>0;
      return(<div style={{padding:"12px 16px 0",paddingBottom:20}}>{!hasAny&&<div style={{padding:"48px 32px",textAlign:"center",color:C.gray,fontSize:13}}>Contest winners haven't been entered yet. Check back soon.</div>}{CONTESTS.map(({id,label,icon,note})=>{const result=contests[id];if(!result)return null;return(<div key={id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px",background:"#0e2018",borderRadius:12,marginBottom:10,border:`1px solid ${C.greenDark}`}}><div style={{fontSize:26,flexShrink:0}}>{icon}</div><div style={{flex:1}}><div style={{fontSize:10,color:C.gray,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{label}</div><div style={{fontWeight:700,fontSize:16,color:C.white}}>🏆 {result.winner}</div><div style={{fontSize:10,color:C.grayDark,marginTop:3}}>{note}</div></div></div>);})}</div>);
    }

    function FieldContent(){
      if(!allSubmitted)return <LockedScreen label="Field"/>;
      const submitted=teams.filter(t=>t.submitted&&Object.keys(t.scores).length===18);
      if(!submitted.length)return(<div style={{padding:"48px 32px",textAlign:"center"}}><div style={{fontSize:40,marginBottom:16}}>📊</div><div style={{fontWeight:700,fontSize:17,color:C.white,marginBottom:10}}>No Scorecards Yet</div><div style={{fontSize:13,color:C.gray,lineHeight:1.8}}>Submitted scorecards will appear here so you can see how the field played each hole.</div></div>);
      const sorted=[...submitted].sort((a,b)=>totalScore(a.scores)-totalScore(b.scores));
      function Cell({score,par}){if(!score)return <div style={{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.grayDark}}>—</div>;const d=score-par;let bg=C.grayDark,color="#fff",r="3px";if(d<=-2){bg=C.gold;color="#111";r="50%";}else if(d===-1){bg=C.greenDim;r="50%";}else if(d===0){bg=C.navyLight;}else if(d===1){bg=C.orange;}else{bg=C.red;}return <div style={{width:28,height:28,borderRadius:r,background:bg,color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,border:d<=-2?`2px solid ${C.gold}`:"none"}}>{score}</div>;}
      return(
        <div style={{paddingBottom:24}}>
          <div style={{padding:"10px 16px 0",display:"flex",gap:8,flexWrap:"wrap"}}>{[[C.gold,"Eagle+","50%"],[C.greenDim,"Birdie","50%"],[C.navyLight,"Par","3px"],[C.orange,"Bogey","3px"],[C.red,"Double+","3px"]].map(([bg,label,r])=>(<div key={label} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:14,borderRadius:r,background:bg,flexShrink:0}}/><span style={{fontSize:10,color:C.gray}}>{label}</span></div>))}</div>
          <div style={{fontSize:11,color:C.gray,padding:"6px 16px 8px"}}>{submitted.length} of {teams.length} scorecards submitted · sorted by score</div>
          <div style={{overflowX:"auto",paddingBottom:8}}>
            <table style={{borderCollapse:"collapse",minWidth:"100%",fontSize:11}}>
              <thead><tr>
                <th style={{position:"sticky",left:0,background:C.navy,padding:"6px 8px",textAlign:"left",color:C.green,fontWeight:700,fontSize:11,whiteSpace:"nowrap",borderBottom:`1px solid ${C.navyLight}`,minWidth:110,zIndex:2}}>Team</th>
                <th style={{padding:"4px 4px",color:C.gray,fontWeight:600,borderBottom:`1px solid ${C.navyLight}`,fontSize:10,textAlign:"center"}}>TOT</th>
                {COURSE.map(({hole,par})=>(<th key={hole} style={{padding:"4px 2px",minWidth:32,color:C.gray,fontWeight:600,textAlign:"center",borderBottom:`1px solid ${C.navyLight}`,borderLeft:hole===10?`1px solid ${C.navyLight}`:"none",background:C.navy,fontSize:10}}><div style={{color:C.offWhite}}>{hole}</div><div style={{color:C.grayDark,fontSize:9}}>P{par}</div></th>))}
              </tr></thead>
              <tbody>{sorted.map((t,i)=>{const isMe=t.id===curId,fm=flightMap[t.id];return(<tr key={t.id} style={{background:isMe?"#0a2218":i%2===0?C.navy:C.navyMid}}><td style={{position:"sticky",left:0,background:isMe?"#0a2218":i%2===0?C.navy:C.navyMid,padding:"5px 8px",borderBottom:`1px solid ${C.navyLight}`,zIndex:1,minWidth:110}}><div style={{fontWeight:isMe?700:500,fontSize:11,color:isMe?C.green:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:108}}>{t.name}{isMe?" ★":""}</div>{fm&&<div style={{fontSize:9,color:C.gold}}>Flight {fm.flight} #{fm.flightRank}</div>}</td><td style={{padding:"5px 4px",textAlign:"center",borderBottom:`1px solid ${C.navyLight}`,fontWeight:700,color:C.green,fontSize:12}}>{totalScore(t.scores)}<div style={{fontSize:9,color:C.gray,fontWeight:400}}>{relToPar(t.scores)}</div></td>{COURSE.map(({hole,par})=>(<td key={hole} style={{padding:"3px 2px",textAlign:"center",borderBottom:`1px solid ${C.navyLight}`,borderLeft:hole===10?`1px solid ${C.navyLight}`:"none"}}><Cell score={t.scores[hole]} par={par}/></td>))}</tr>);})}</tbody>
            </table>
          </div>
        </div>
      );
    }

    return(
      <div style={{minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"Georgia,serif",paddingBottom:48}}>
        <Header sub={curTeam.name}/>
        <div style={{display:"flex",gap:4,padding:"12px 16px 0"}}>
          {TABS.map(({id,label,icon})=>{const locked=(id!=="scorecard"&&!roundEnded)||(id==="field"&&!allSubmitted);return(<button key={id} onClick={()=>setPlayerTab(id)} style={{flex:1,background:playerTab===id?C.greenDark:C.navyMid,color:playerTab===id?"#fff":locked?C.grayDark:C.gray,border:"none",borderRadius:7,padding:"7px 1px",fontSize:9,fontWeight:playerTab===id?700:400,cursor:"pointer",fontFamily:"Georgia,serif",position:"relative",textAlign:"center"}}><div style={{fontSize:13,marginBottom:2}}>{icon}</div><div>{label}</div>{locked&&<div style={{position:"absolute",top:3,right:3,fontSize:8}}>🔒</div>}</button>);})}
        </div>
        {playerTab==="scorecard"&&<ScorecardContent/>}
        {playerTab==="results"&&<ResultsContent/>}
        {playerTab==="skins"&&<SkinsContent/>}
        {playerTab==="contests"&&<ContestsContent/>}
        {playerTab==="field"&&<FieldContent/>}
        {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      </div>
    );
  }

  // ── ADMIN VIEW ────────────────────────────────────────────────────────────
  if(view==="admin"){
    const ATABS=["teams","results","skins","contests","settings"];
    const submitted=teams.filter(t=>t.submitted).length;

    function TeamsTab(){
      return(
        <div style={{padding:"12px 16px"}}>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["Teams",teams.length],["Submitted",submitted],["Remaining",teams.length-submitted]].map(([l,v])=>(<div key={l} style={{flex:1,background:C.navyMid,border:`1px solid ${C.navyLight}`,borderRadius:9,padding:"9px 4px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.green}}>{v}</div><div style={{fontSize:9,color:C.gray,textTransform:"uppercase",letterSpacing:1}}>{l}</div></div>))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <button onClick={()=>{setShowAddForm(f=>!f);setBulkMode(false);}} style={{flex:1,background:showAddForm?C.navyLight:C.greenDark,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{showAddForm?"✕ Cancel":"＋ Add Team"}</button>
            <button onClick={()=>{setBulkMode(m=>!m);setShowAddForm(false);}} style={{flex:1,background:bulkMode?C.navyLight:C.navyMid,color:"#fff",border:`1px solid ${C.navyLight}`,borderRadius:8,padding:"10px 0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{bulkMode?"✕ Cancel":"⊞ Bulk Add"}</button>
          </div>
          {showAddForm&&(<div style={{...cardSt,margin:"0 0 14px",background:"#0e2a18",border:`1px solid ${C.greenDark}`}}><div style={{fontSize:12,color:C.green,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>Add New Team</div><div style={{marginBottom:10}}><label style={{fontSize:11,color:C.gray,display:"block",marginBottom:4}}>Team Name *</label><input style={inp} placeholder="e.g. John Smith" value={addName} onChange={e=>{setAddName(e.target.value);setAddCode(generateCode(e.target.value,teams.length));}}/></div><div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><label style={{fontSize:11,color:C.gray}}>Check-in Code *</label><span style={{fontSize:10,color:C.grayDark}}>Auto-generated</span></div><input style={{...inp,letterSpacing:3,fontFamily:"monospace",textTransform:"uppercase"}} placeholder="AUTO" value={addCode} onChange={e=>setAddCode(e.target.value.toUpperCase())} maxLength={8}/></div><button style={btn(C.greenDark,"#fff",0)} onClick={addTeam}>Add Team</button></div>)}
          {bulkMode&&(<div style={{...cardSt,margin:"0 0 14px",background:"#0e1a2a",border:`1px solid ${C.navyLight}`}}><div style={{fontSize:12,color:C.green,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Bulk Add Teams</div><div style={{fontSize:11,color:C.gray,marginBottom:10,lineHeight:1.6}}>Paste one team name per line.</div><textarea style={{...inp,height:140,resize:"vertical",letterSpacing:0,fontFamily:"Georgia,serif",lineHeight:1.6}} placeholder={"John Smith\nMike Johnson\n..."} value={bulkText} onChange={e=>setBulkText(e.target.value)}/><button style={btn(C.greenDark,"#fff",10)} onClick={addBulk}>Add {bulkText.split("\n").filter(l=>l.trim()).length||0} Teams</button></div>)}
          {teams.length===0&&<div style={{textAlign:"center",padding:32,color:C.grayDark,fontSize:14}}>No teams yet.</div>}
          {teams.map((t,i)=>{
            const isEditing=editingTeamId===t.id,isConfirm=confirmDelete===t.id,isOverride=overrideTeamId===t.id;
            const entered=Object.keys(t.scores).length,fm=flightMap[t.id];
            return(
              <div key={t.id} style={{...cardSt,margin:"0 0 10px",padding:0,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:(isEditing||isOverride)?`1px solid ${C.navyLight}`:"none"}}>
                  <div style={{width:24,height:24,background:C.navyLight,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gray,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                    <div style={{fontSize:11,fontFamily:"monospace",color:C.gray,letterSpacing:1}}>{t.code}{t.submitted&&<span style={{color:C.greenDim,marginLeft:8,letterSpacing:0}}>✓ Submitted</span>}{!t.submitted&&entered>0&&<span style={{color:"#f59e0b",marginLeft:8,letterSpacing:0}}>{entered}/18</span>}</div>
                    {fm&&<div style={{fontSize:10,color:C.gold,fontWeight:700,marginTop:1}}>Flight {fm.flight} · #{fm.flightRank}</div>}
                  </div>
                  {t.submitted&&<div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:700,color:C.green,fontSize:16}}>{totalScore(t.scores)}</div><div style={{fontSize:11,color:C.gray}}>{relToPar(t.scores)}</div></div>}
                  {!isEditing&&!isConfirm&&!isOverride&&(<div style={{display:"flex",gap:6,flexShrink:0}}>
                    {t.submitted?<button onClick={()=>openOverride(t)} style={{background:"#1a3a1a",color:C.green,border:`1px solid ${C.greenDark}`,borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>✏ Scores</button>:<button onClick={()=>{setEditingTeamId(t.id);setEditName(t.name);setEditCode(t.code);setConfirmDelete(null);}} style={{background:C.navyLight,color:"#fff",border:"none",borderRadius:6,padding:"6px 11px",cursor:"pointer",fontSize:12,fontWeight:600}}>Edit</button>}
                    <button onClick={()=>{setConfirmDelete(t.id);setEditingTeamId(null);setOverrideTeamId(null);}} style={{background:"#3b1010",color:"#f87171",border:"1px solid #7f1d1d",borderRadius:6,padding:"6px 9px",cursor:"pointer",fontSize:13}}>🗑</button>
                  </div>)}
                </div>
                {isEditing&&(<div style={{padding:"12px 14px",background:"#0e2a18"}}><div style={{marginBottom:10}}><label style={{fontSize:11,color:C.gray,display:"block",marginBottom:4}}>Team Name</label><input style={inp} value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEditTeam()}/></div><div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><label style={{fontSize:11,color:C.gray}}>Code</label><button onClick={()=>setEditCode(generateCode(editName,i))} style={{background:"none",border:"none",color:C.green,fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Regenerate</button></div><input style={{...inp,letterSpacing:3,fontFamily:"monospace",textTransform:"uppercase"}} value={editCode} onChange={e=>setEditCode(e.target.value.toUpperCase())} maxLength={8}/></div><div style={{display:"flex",gap:8}}><button onClick={saveEditTeam} style={{flex:1,background:C.greenDark,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>Save</button><button onClick={()=>setEditingTeamId(null)} style={{flex:1,background:C.navyLight,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:14,cursor:"pointer"}}>Cancel</button></div></div>)}
                {isConfirm&&(<div style={{padding:"12px 14px",background:"#1c0808",borderTop:"1px solid #7f1d1d"}}><div style={{fontSize:13,color:"#f87171",marginBottom:10,textAlign:"center"}}>Remove <strong>{t.name}</strong>?{t.submitted?" Scorecard will be deleted.":""}</div><div style={{display:"flex",gap:8}}><button onClick={()=>deleteTeam(t.id)} style={{flex:1,background:C.red,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>Yes, Remove</button><button onClick={()=>setConfirmDelete(null)} style={{flex:1,background:C.navyLight,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:14,cursor:"pointer"}}>Cancel</button></div></div>)}
                {isOverride&&(
                  <div style={{padding:"14px",background:"#0a1a0a",borderTop:`1px solid ${C.greenDark}`}}>
                    <div style={{fontSize:11,color:"#fbbf24",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>⚠ Admin Score Override</div>
                    <div style={{fontSize:11,color:C.gray,marginBottom:14,lineHeight:1.5}}>Editing submitted scorecard for <strong style={{color:"#fff"}}>{t.name}</strong>.</div>
                    {[0,9].map(start=>(<div key={start}><div style={{fontSize:9,color:C.green,textTransform:"uppercase",letterSpacing:2,fontWeight:700,margin:"8px 0 6px",borderBottom:`1px solid ${C.navyLight}`,paddingBottom:3}}>{start===0?"Front 9":"Back 9"}</div>{COURSE.slice(start,start+9).map(({hole,par,hcp})=>{const current=overrideScores[hole],isEditingThis=overrideHole===hole,d=current?(current-par):null;let pillBg=C.navyLight;if(d!=null){if(d<=-2)pillBg=C.gold;else if(d===-1)pillBg=C.greenDim;else if(d===0)pillBg=C.navyLight;else if(d===1)pillBg=C.orange;else pillBg=C.red;}return(<div key={hole} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.navyLight}`}}><div style={{minWidth:68,fontSize:12}}><span style={{fontWeight:700}}>Hole {hole}</span><span style={{color:C.gray,fontSize:10,marginLeft:5}}>P{par} HCP{hcp}</span></div><div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>{isEditingThis?(<><input autoFocus type="number" min={1} max={15} style={{...inp,width:52,padding:"5px 6px",textAlign:"center",fontSize:15,letterSpacing:0}} value={overrideVal} onChange={e=>setOverrideVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const s=parseInt(overrideVal);if(s>=1&&s<=15){setOverrideScores(prev=>({...prev,[hole]:s}));setOverrideHole(null);}else showToast("Score must be 1–15","error");}if(e.key==="Escape")setOverrideHole(null);}}/><button onClick={()=>{const s=parseInt(overrideVal);if(s>=1&&s<=15){setOverrideScores(prev=>({...prev,[hole]:s}));setOverrideHole(null);}else showToast("Score must be 1–15","error");}} style={{background:C.greenDark,color:"#fff",border:"none",borderRadius:5,padding:"5px 9px",cursor:"pointer",fontWeight:700,fontSize:13}}>✓</button><button onClick={()=>setOverrideHole(null)} style={{background:C.navyLight,color:"#fff",border:"none",borderRadius:5,padding:"5px 8px",cursor:"pointer",fontSize:12}}>✕</button></>):(<><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:d!=null&&d<=-1?"50%":"4px",background:current?pillBg:C.navy,color:d!=null&&d<=-2?"#111":"#fff",fontWeight:700,fontSize:13,border:current?"none":`1px dashed ${C.grayDark}`}}>{current||"—"}</span><button onClick={()=>{setOverrideHole(hole);setOverrideVal(current||"");}} style={{background:C.navyLight,color:"#fff",border:"none",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:11}}>{current?"Edit":"Enter"}</button></>)}</div></div>);})}</div>))}
                    <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontSize:13}}><span style={{color:C.gray}}>New total</span><span style={{fontWeight:700,color:C.green,fontSize:16}}>{totalScore(overrideScores)||"—"} <span style={{fontSize:12,color:C.gray}}>{relToPar(overrideScores)}</span></span></div>
                    <div style={{display:"flex",gap:8,marginTop:12}}><button onClick={saveOverride} style={{flex:1,background:C.greenDark,color:"#fff",border:"none",borderRadius:8,padding:"11px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>Save Override</button><button onClick={()=>{setOverrideTeamId(null);setOverrideHole(null);}} style={{flex:1,background:C.navyLight,color:"#fff",border:"none",borderRadius:8,padding:"11px 0",fontSize:14,cursor:"pointer"}}>Cancel</button></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    function ResultsTab(){
      return(
        <div style={{padding:"12px 16px"}}>
          {!roundEnded&&<div style={{background:"#1c1500",border:"1px solid #78350f",borderRadius:9,padding:12,marginBottom:14,fontSize:13,color:"#fbbf24",lineHeight:1.6}}>⚠ Results hidden from players until you end the round.<br/><span style={{fontSize:11,color:"#d97706"}}>{submitted}/{teams.length} scorecards in</span></div>}
          {ranked.length===0&&<div style={{color:C.gray,fontSize:13,textAlign:"center",padding:24}}>No submitted scorecards yet.</div>}
          {ranked.length>0&&(<>
            <div style={{display:"flex",gap:5,marginBottom:14}}>{FLIGHT_NAMES.map(f=><button key={f} onClick={()=>setSelFlight(f)} style={{flex:1,background:selFlight===f?C.greenDark:C.navyMid,color:"#fff",border:"none",borderRadius:7,padding:"9px 4px",fontSize:13,fontWeight:selFlight===f?700:400,cursor:"pointer"}}>{f}</button>)}</div>
            <div style={{background:"#0e2a18",border:`1px solid ${C.greenDark}`,borderRadius:9,padding:"10px 14px",marginBottom:10,textAlign:"center"}}><div style={{fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:2}}>Flight {selFlight}</div><div style={{fontSize:10,color:C.gray,marginTop:2}}>1st $400 · 2nd $200 · 3rd $100</div></div>
            {getFlightTeams(selFlight).map((t,i)=>{const rank=i+1,payout=PAYOUTS[rank],medals=[C.gold,C.silver,C.bronze];return(<div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",background:rank<=3?"#0e2a18":C.navyMid,borderRadius:9,marginBottom:6,border:`1px solid ${rank===1?C.green:C.navyLight}`}}><div style={{width:28,height:28,background:rank<=3?medals[rank-1]:C.navyLight,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:rank===1?"#111":"#fff",flexShrink:0}}>{rank<=3?["🥇","🥈","🥉"][rank-1]:rank}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{t.name}</div><div style={{fontSize:10,color:C.gray}}>Overall #{ranked.indexOf(t)+1}{payout&&<span style={{color:C.gold,marginLeft:8}}>wins ${payout}</span>}</div></div><div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:20,color:C.green}}>{totalScore(t.scores)}</div><div style={{fontSize:12,color:C.gray}}>{relToPar(t.scores)}</div></div></div>);})}
            {getFlightTeams(selFlight).length===0&&<div style={{color:C.gray,fontSize:13,padding:12}}>No teams in this flight yet.</div>}
          </>)}
        </div>
      );
    }

    function SkinsTab(){
      const ft=getFlightTeams(selFlight);
      const {skinWinners,tally}=ft.length?computeSkins(ft):{skinWinners:{},tally:{}};
      const totalSkins=Object.values(tally).reduce((a,v)=>a+v,0);
      const skinVal=totalSkins>0?(SKINS_POT/totalSkins):0;
      return(
        <div style={{padding:"12px 16px"}}>
          <div style={{display:"flex",gap:5,marginBottom:14}}>{FLIGHT_NAMES.map(f=><button key={f} onClick={()=>setSelFlight(f)} style={{flex:1,background:selFlight===f?C.greenDark:C.navyMid,color:"#fff",border:"none",borderRadius:7,padding:"9px 4px",fontSize:13,fontWeight:selFlight===f?700:400,cursor:"pointer"}}>{f}</button>)}</div>
          {!ft.length?<div style={{color:C.gray,fontSize:13,padding:12}}>No submitted scores in Flight {selFlight} yet.</div>:(<>
            <div style={{background:"#0e2a18",border:`1px solid ${C.greenDark}`,borderRadius:9,padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Flight {selFlight} Skins</div>
              <div style={{fontSize:11,color:C.gray,marginBottom:10}}>${SKINS_POT} pot · {totalSkins} skin{totalSkins!==1?"s":""} won{totalSkins>0?` · $${skinVal.toFixed(0)}/skin`:""}</div>
              {ft.filter(t=>tally[t.id]>0).sort((a,b)=>tally[b.id]-tally[a.id]).map(t=>(<div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.navyLight}`,fontSize:13}}><span style={{color:C.offWhite,fontWeight:600}}>{t.name}</span><span style={{color:C.gold,fontWeight:700}}>{tally[t.id]} skin{tally[t.id]!==1?"s":""} — ${(tally[t.id]*skinVal).toFixed(0)}</span></div>))}
              {ft.every(t=>!tally[t.id])&&<div style={{color:C.gray,fontSize:12}}>No skins decided yet.</div>}
            </div>
            {COURSE.map(({hole,par})=>{const s=skinWinners[hole],winner=s?.teamId?ft.find(t=>t.id===s.teamId):null,ws=winner?winner.scores[hole]:null;return(<div key={hole} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:winner?"#0e2a18":C.navyMid,borderRadius:8,marginBottom:4,border:`1px solid ${winner?C.greenDark:C.navyLight}`}}><div style={{width:38,fontSize:11,color:C.gray,fontWeight:700}}>H{hole}<div style={{fontSize:9,color:C.grayDark}}>P{par}</div></div><div style={{flex:1,fontSize:13}}>{winner?<span style={{color:C.gold,fontWeight:700}}>🏆 {winner.name}<span style={{color:C.green,marginLeft:6,fontSize:11}}>{scoreLabel(ws,par)} · {s.skins} skin{s.skins>1?"s":""} · ${(s.skins*skinVal).toFixed(0)}</span></span>:s?.carryover?<span style={{color:C.orange}}>Tie — carries over</span>:<span style={{color:C.grayDark}}>No scores yet</span>}</div></div>);})}
          </>)}
        </div>
      );
    }

    function ContestsTab(){
      const editing=contestEditing,nameVal=contestName;
      return(
        <div style={{padding:"12px 16px"}}>
          <div style={{fontSize:12,color:C.gray,marginBottom:14,lineHeight:1.6}}>Enter winners as measured on course. Visible to players once round ends.</div>
          {CONTESTS.map(({id,label,icon,note})=>{
            const result=contests[id],isEditing=editing===id;
            return(<div key={id} style={{...cardSt,margin:"0 0 10px",padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",background:result?"#0e2a18":C.navyMid,borderBottom:isEditing?`1px solid ${C.navyLight}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div><div style={{fontWeight:700,fontSize:14}}>{icon} {label}</div><div style={{fontSize:10,color:C.gray,marginTop:2}}>{note}</div></div>
                  {!isEditing&&(<div style={{display:"flex",gap:6}}><button onClick={()=>{setContestEditing(id);setContestName(result?.winner||"");}} style={{background:result?C.navyLight:C.greenDark,color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>{result?"Edit":"Enter"}</button>{result&&<button onClick={()=>{dbSet(`contests/${id}`,null);showToast("Contest cleared");}} style={{background:"#3b1010",color:"#f87171",border:"1px solid #7f1d1d",borderRadius:6,padding:"6px 9px",cursor:"pointer",fontSize:12}}>✕</button>}</div>)}
                </div>
                {result&&!isEditing&&<div style={{marginTop:8,background:"#0a1b30",borderRadius:7,padding:"8px 12px",border:`1px solid ${C.greenDark}`}}><div style={{fontWeight:700,color:C.green,fontSize:14}}>🏆 {result.winner}</div></div>}
              </div>
              {isEditing&&(<div style={{padding:"12px 14px",background:"#0a1b30"}}><div style={{marginBottom:12}}><label style={{fontSize:11,color:C.gray,display:"block",marginBottom:4}}>Winner Name *</label><input style={inp} placeholder="First & last name" value={nameVal} onChange={e=>setContestName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveContest(id)}/></div><div style={{display:"flex",gap:8}}><button onClick={()=>saveContest(id)} style={{flex:1,background:C.greenDark,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>Save</button><button onClick={()=>setContestEditing(null)} style={{flex:1,background:C.navyLight,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:14,cursor:"pointer"}}>Cancel</button></div></div>)}
            </div>);
          })}
        </div>
      );
    }

    function SettingsTab(){
      return(
        <div style={{padding:"12px 16px"}}>
          <div style={cardSt}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Round Status</div>
            <div style={{fontSize:13,color:C.gray,marginBottom:8,lineHeight:1.6}}>{roundEnded?"Round ended. Results visible to players.":"Round active. Results hidden from players."}</div>
            <div style={{fontSize:12,color:C.gray,marginBottom:12}}>{submitted}/{teams.length} scorecards submitted</div>
            <button style={btn(roundEnded?C.navyLight:"#166534","#fff",0)} onClick={()=>{setRoundEnded(!roundEnded);showToast(roundEnded?"Round reopened.":"Results are now live!");}}>{roundEnded?"↩ Reopen Round":"🏁 End Round & Publish Results"}</button>
          </div>
          <div style={cardSt}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:10}}>Flight Rules</div>
            {[["Format","All teams ranked by gross score after submission"],["Splits","1–6=A · 7–12=B · 13–18=C · 19–24=D · 25–31=E"],["Tiebreaker","Scorecard playoff from HCP 1 (Hole 2)"],["Places","1st $400 · 2nd $200 · 3rd $100"],["Skins","$400 pot per flight · ties carry over"]].map(([k,v])=>(<div key={k} style={{padding:"7px 0",borderBottom:`1px solid ${C.navyLight}`,fontSize:12}}><div style={{color:C.green,fontWeight:700,marginBottom:2}}>{k}</div><div style={{color:C.gray,lineHeight:1.5}}>{v}</div></div>))}
          </div>
          <div style={cardSt}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Test Mode</div>
            <div style={{fontSize:13,color:C.gray,marginBottom:12,lineHeight:1.6}}>Fill all teams with random scores and end the round to preview results.</div>
            <button style={btn("#1a3a6a","#fff",0)} onClick={()=>{
              const obj={};
              teams.forEach((t,i)=>{obj[t.id]={...t,scores:generateTestScores(i+1),submitted:true};});
              dbSet("teams",obj);
              dbSet("roundEnded",true);
              dbSet("contests",{ld:{winner:"Matt Simpson"},ctp4:{winner:"Drew Quinones"},ctp8:{winner:"Kyle Orf"},ctp13:{winner:"Erika Martin"},ctp15:{winner:"Julie Quinones"},c2h9:{winner:"Scott Mandziara"}});
              showToast("Test scores loaded ✓");
            }}>🧪 Load Test Scores</button>
          </div>
          <div style={cardSt}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Reset Tournament</div>
            <div style={{fontSize:13,color:C.gray,marginBottom:12,lineHeight:1.6}}>Wipes all teams, scores, and results.</div>
            <button style={btn(C.red,"#fff",0)} onClick={()=>{if(window.confirm("Delete ALL teams and scores?")){const fresh=buildDefaultTeams();const obj={};fresh.forEach(t=>{obj[t.id]=t;});dbSet("teams",obj);dbSet("roundEnded",false);dbSet("contests",null);showToast("Tournament data cleared.");}}}>🗑 Clear All Tournament Data</button>
            <button style={btn(C.navyLight,"#fff",8)} onClick={()=>{sset(SK_SESSION,null);setView("login");setCode("");}}>← Log Out</button>
          </div>
        </div>
      );
    }

    return(
      <div style={{minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"Georgia,serif",paddingBottom:48}}>
        <Header sub="Staff Portal"/>
        <div style={{display:"flex",gap:5,padding:"12px 16px 0"}}>
          {ATABS.map(t=>(<button key={t} onClick={()=>setAdminTab(t)} style={{flex:1,background:adminTab===t?C.greenDark:C.navyMid,color:"#fff",border:"none",borderRadius:7,padding:"9px 4px",fontSize:12,fontWeight:adminTab===t?700:400,cursor:"pointer",fontFamily:"Georgia,serif"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>))}
        </div>
        {adminTab==="teams"&&<TeamsTab/>}
        {adminTab==="results"&&<ResultsTab/>}
        {adminTab==="skins"&&<SkinsTab/>}
        {adminTab==="contests"&&<ContestsTab/>}
        {adminTab==="settings"&&<SettingsTab/>}
        {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      </div>
    );
  }

  return null;
}

