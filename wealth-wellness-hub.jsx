import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

const C = {
  bg:"#080D14",bgCard:"#0F1622",bgElevated:"#162032",
  border:"#1E2D45",borderLight:"#253650",
  gold:"#C8A84B",goldDim:"#8A7033",
  teal:"#00C2A3",tealDim:"#007A68",
  red:"#F06060",green:"#4FCE8A",blue:"#4E9EF5",purple:"#9B7FEA",
  text:"#E8EDF5",textMid:"#7A90B0",textDim:"#3D5070",
};
const serif="'Playfair Display',Georgia,serif";
const sans="'DM Sans',system-ui,sans-serif";

const WEALTH_COMP=[
  {label:"Cash & Deposits",  value:142500,source:"DBS Bank (API)",            color:C.blue,  pct:8 },
  {label:"Equities & ETFs",  value:584200,source:"Interactive Brokers (API)", color:C.teal,  pct:34},
  {label:"Unit Trusts",      value:213000,source:"Endowus (API)",             color:C.green, pct:12},
  {label:"Digital Assets",   value:97400, source:"Coinbase (API)",            color:C.gold,  pct:6 },
  {label:"Property",         value:680000,source:"Manual Input",              color:C.purple,pct:39},
  {label:"Other",            value:18000, source:"CSV Import",                color:C.textMid,pct:1},
];
const TOTAL=WEALTH_COMP.reduce((s,a)=>s+a.value,0);

const OVER_TIME=[
  {month:"Aug",Cash:130000,Equities:410000,Trust:180000,Digital:45000,Property:650000},
  {month:"Sep",Cash:135000,Equities:450000,Trust:190000,Digital:62000,Property:655000},
  {month:"Oct",Cash:128000,Equities:430000,Trust:185000,Digital:55000,Property:660000},
  {month:"Nov",Cash:140000,Equities:500000,Trust:200000,Digital:78000,Property:665000},
  {month:"Dec",Cash:138000,Equities:520000,Trust:205000,Digital:82000,Property:668000},
  {month:"Jan",Cash:141000,Equities:555000,Trust:209000,Digital:90000,Property:672000},
  {month:"Feb",Cash:139000,Equities:570000,Trust:211000,Digital:94000,Property:677000},
  {month:"Mar",Cash:142500,Equities:584200,Trust:213000,Digital:97400,Property:680000},
];

const METRICS=[
  {key:"diversification",label:"Diversification",score:72,color:C.teal,status:"Good",
   desc:"Asset class spread & correlation",
   pts:["5 asset classes across 3 geographies","Low equity-crypto correlation (0.18)","Property concentration is high at 39%"]},
  {key:"liquidity",label:"Liquidity",score:54,color:C.gold,status:"Moderate",
   desc:"Liquid access within 30 days",
   pts:["Liquid assets: $240K (14% of portfolio)","Property & private assets are illiquid","Consider raising liquid buffer to $300K"]},
  {key:"consistency",label:"Consistency",score:81,color:C.green,status:"Strong",
   desc:"Regular contributions & stability",
   pts:["Monthly contributions for 18 months","Max portfolio drawdown: –9.2%","Rebalanced 3× in the past 12 months"]},
];

const RECS=[
  {id:1,priority:"High",icon:"⚡",title:"Increase Liquid Buffer",cat:"Liquidity",color:C.red,eta:"Within 30 days",
   body:"Your liquid assets (14%) are below the 20% threshold for your risk profile. Consider shifting SGD 100K from fixed-income holdings.",action:"View rebalancing →"},
  {id:2,priority:"Medium",icon:"⬡",title:"Reduce Property Concentration",cat:"Diversification",color:C.gold,eta:"Next quarter",
   body:"Property at 39% creates sector concentration risk. REITs could provide similar exposure with better liquidity.",action:"Explore alternatives →"},
  {id:3,priority:"Medium",icon:"↗",title:"Automate Monthly Top-Up",cat:"Consistency",color:C.teal,eta:"This week",
   body:"Setting SGD 2,000/month auto-transfer to Endowus would improve your consistency score by ~12 pts.",action:"Set up auto-invest →"},
  {id:4,priority:"Low",icon:"◆",title:"Review Digital Allocation",cat:"Diversification",color:C.blue,eta:"Ongoing",
   body:"Crypto has grown to 6% — near your 8% cap. Consider staggered profit-taking if BTC exceeds $90K.",action:"Set price alert →"},
];

const MILESTONES=[
  {label:"Emergency Fund",target:50000,current:42500,deadline:"Jun 2026",done:false,color:C.teal},
  {label:"Retirement Corpus",target:2000000,current:1735100,deadline:"Dec 2040",done:false,color:C.gold},
  {label:"Property Upgrade",target:1200000,current:680000,deadline:"Jan 2030",done:false,color:C.purple},
  {label:"6-Month Salary Buffer",target:36000,current:36000,deadline:"Achieved",done:true,color:C.green},
];

const APPS=[
  {id:1,name:"DBS Bank",type:"bank",icon:"🏦",status:"connected",sync:"2 min ago",value:142500,assets:["Savings","Current"],color:C.blue},
  {id:2,name:"Interactive Brokers",type:"brokerage",icon:"📈",status:"connected",sync:"5 min ago",value:584200,assets:["Equities","ETFs"],color:C.teal},
  {id:3,name:"Coinbase",type:"crypto",icon:"₿",status:"connected",sync:"1 min ago",value:97400,assets:["BTC","ETH","SOL"],color:C.gold},
  {id:4,name:"Endowus",type:"brokerage",icon:"🌱",status:"connected",sync:"10 min ago",value:213000,assets:["Unit Trusts","CPF"],color:C.green},
  {id:5,name:"PropertyGuru",type:"property",icon:"🏠",status:"manual",sync:"Yesterday",value:680000,assets:["Toa Payoh HDB"],color:C.purple},
  {id:6,name:"Syfe",type:"brokerage",icon:"⚡",status:"disconnected",sync:"3 days ago",value:0,assets:[],color:C.textMid},
];
const AVAIL=[
  {name:"OCBC Bank",type:"bank",icon:"🏦"},{name:"UOB Bank",type:"bank",icon:"🏦"},
  {name:"StashAway",type:"brokerage",icon:"🎯"},{name:"Kraken",type:"crypto",icon:"🐙"},
  {name:"Saxo Bank",type:"brokerage",icon:"📊"},{name:"Tiger Brokers",type:"brokerage",icon:"🐯"},
];
const LOG=[
  {id:1,ts:"Today 14:32",event:"Data Sync",source:"Interactive Brokers",detail:"Portfolio updated — +SGD 3,200 (day gain)",type:"sync",icon:"🔄"},
  {id:2,ts:"Today 14:30",event:"Data Sync",source:"Coinbase",detail:"BTC price updated $87,420 → $88,110",type:"sync",icon:"🔄"},
  {id:3,ts:"Today 09:15",event:"Auto-Invest",source:"Endowus",detail:"Regular investment SGD 1,500 executed",type:"tx",icon:"💸"},
  {id:4,ts:"Yesterday 22:00",event:"Sync Failed",source:"Syfe",detail:"Connection expired — re-authentication needed",type:"error",icon:"⚠"},
  {id:5,ts:"Yesterday 18:45",event:"Manual Update",source:"Property",detail:"Estimated valuation updated to SGD 680,000",type:"manual",icon:"✏️"},
  {id:6,ts:"Mar 04, 11:20",event:"App Connected",source:"DBS Bank",detail:"Bank account linked via Open Banking API",type:"connect",icon:"🔗"},
  {id:7,ts:"Mar 03, 16:00",event:"Milestone",source:"System",detail:"6-Month Salary Buffer milestone completed!",type:"milestone",icon:"🏆"},
  {id:8,ts:"Mar 02, 10:30",event:"CSV Import",source:"User Upload",detail:"12 transactions imported from statement.csv",type:"import",icon:"📂"},
  {id:9,ts:"Mar 01, 09:00",event:"Risk Update",source:"System",detail:"Risk profile recalculated: Moderate–Aggressive",type:"system",icon:"⚖️"},
  {id:10,ts:"Feb 28, 08:45",event:"Data Sync",source:"Endowus",detail:"Unit trust NAV prices updated",type:"sync",icon:"🔄"},
];

const fmt=(v)=>v>=1e6?`$${(v/1e6).toFixed(2)}M`:`$${(v/1e3).toFixed(0)}K`;
const fmtSGD=(v)=>`SGD ${v.toLocaleString()}`;
const pctOf=(c,t)=>Math.min(Math.round((c/t)*100),100);
const typeColor={sync:C.blue,tx:C.green,error:C.red,manual:C.gold,connect:C.teal,milestone:C.purple,import:C.blue,system:C.textMid};

function Gauge({value,color,size=88}){
  const r=size/2-9;const circ=2*Math.PI*r;
  const dash=(value/100)*circ*0.75;const off=circ*0.125;
  return(
    <svg width={size} height={size} style={{transform:"rotate(-135deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={8} strokeDasharray={`${circ*0.75} ${circ}`} strokeDashoffset={-off} strokeLinecap="round"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-off} strokeLinecap="round" style={{transition:"stroke-dasharray 1.2s ease"}}/>
    </svg>
  );
}

const PieTip=({active,payload})=>{
  if(!active||!payload?.length)return null;
  const d=payload[0].payload;
  return(
    <div style={{background:C.bgElevated,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontFamily:sans,minWidth:210}}>
      <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{d.label}</div>
      <div style={{fontSize:12,color:C.textMid,marginBottom:2}}>{fmtSGD(d.value)} · {d.pct}%</div>
      <div style={{fontSize:11,display:"flex",alignItems:"center",gap:5,color:d.color}}>🔗 {d.source}</div>
    </div>
  );
};

/* ───── AUTH ───── */
function AuthScreen({onLogin}){
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[name,setName]=useState("");
  const[loading,setLoading]=useState(false);
  const go=()=>{
    if(!email||!pass)return;
    setLoading(true);
    setTimeout(()=>{setLoading(false);onLogin(name||email.split("@")[0]);},1400);
  };
  const inp={background:C.bgElevated,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",color:C.text,fontFamily:sans,fontSize:14,width:"100%",outline:"none"};
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:sans,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`,backgroundSize:"48px 48px",opacity:0.15}}/>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,borderRadius:"50%",background:`radial-gradient(${C.gold}0A 0%,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",width:430,zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:46,height:46,background:`linear-gradient(135deg,${C.gold},${C.teal})`,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:serif,fontWeight:700,fontSize:22,color:C.bg}}>W</div>
            <div style={{textAlign:"left"}}>
              <div style={{fontFamily:serif,fontSize:22,fontWeight:700,color:C.text,lineHeight:1}}>Wealth Wellness</div>
              <div style={{fontSize:10,color:C.textMid,letterSpacing:"0.15em",textTransform:"uppercase"}}>Financial Intelligence Hub</div>
            </div>
          </div>
        </div>
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"36px 36px 28px"}}>
          <div style={{display:"flex",background:C.bgElevated,borderRadius:10,padding:4,marginBottom:28}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",background:mode===m?C.gold:"transparent",color:mode===m?C.bg:C.textMid,fontFamily:sans,fontSize:13,fontWeight:600,transition:"all 0.2s"}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {mode==="register"&&(
              <div><label style={{fontSize:11,color:C.textMid,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,display:"block"}}>Full Name</label>
              <input style={inp} placeholder="James Dawson" value={name} onChange={e=>setName(e.target.value)}/></div>
            )}
            <div><label style={{fontSize:11,color:C.textMid,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,display:"block"}}>Email</label>
            <input style={inp} type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <label style={{fontSize:11,color:C.textMid,letterSpacing:"0.08em",textTransform:"uppercase"}}>Password</label>
                {mode==="login"&&<span style={{fontSize:11,color:C.gold,cursor:"pointer"}}>Forgot password?</span>}
              </div>
              <input style={inp} type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}/>
            </div>
            <button onClick={go} disabled={loading} style={{marginTop:8,padding:"14px",background:`linear-gradient(135deg,${C.gold},#E8C97A)`,color:C.bg,border:"none",borderRadius:12,fontFamily:sans,fontSize:14,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1,transition:"opacity 0.2s"}}>
              {loading?"Authenticating…":mode==="login"?"Sign In →":"Create Account →"}
            </button>
          </div>
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.textMid,marginBottom:12,letterSpacing:"0.04em"}}>OR CONTINUE WITH</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {["Google","Apple","Singpass"].map(p=>(
                <button key={p} style={{padding:"9px 18px",background:C.bgElevated,border:`1px solid ${C.border}`,borderRadius:9,color:C.textMid,fontFamily:sans,fontSize:12,cursor:"pointer"}}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:18,fontSize:11,color:C.textDim}}>🔒 256-bit encrypted · Open Banking compliant · MAS regulated</div>
      </div>
    </div>
  );
}

/* ───── DASHBOARD ───── */
function Dashboard({user}){
  const[hovPie,setHovPie]=useState(null);
  const[openMetric,setOpenMetric]=useState(null);
  const[scoreAnim,setScoreAnim]=useState(0);
  const CURRENT_SCORE=74,OVERALL_SCORE=69;
  useEffect(()=>{let n=0;const t=setInterval(()=>{n+=2;setScoreAnim(Math.min(n,CURRENT_SCORE));if(n>=CURRENT_SCORE)clearInterval(t);},20);return()=>clearInterval(t);},[]);
  const wc=scoreAnim>=75?C.green:scoreAnim>=55?C.gold:C.red;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:22,paddingBottom:28}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",paddingTop:4}}>
        <div>
          <div style={{fontSize:11,color:C.textMid,fontFamily:sans,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Welcome back, {user}</div>
          <div style={{fontFamily:serif,fontSize:32,fontWeight:700,color:C.text,lineHeight:1.1}}>Wealth Overview</div>
          <div style={{fontSize:12,color:C.textMid,fontFamily:sans,marginTop:5}}>Last synced: Today 14:32 · 4 APIs + 1 manual · 1 CSV</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,color:C.textMid,fontFamily:sans,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Total Wealth</div>
          <div style={{fontFamily:serif,fontSize:44,fontWeight:700,color:C.text,lineHeight:1,letterSpacing:"-0.02em"}}>{fmt(TOTAL)}</div>
          <div style={{fontSize:12,color:C.green,fontFamily:sans,marginTop:4}}>▲ +SGD 8,420 this month · +0.5%</div>
        </div>
      </div>

      {/* COMPOSITION + TIME CHART */}
      <div style={{display:"grid",gridTemplateColumns:"350px 1fr",gap:18}}>
        {/* Pie */}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"22px 22px"}}>
          <div style={{fontFamily:serif,fontSize:18,fontWeight:700,color:C.text,marginBottom:2}}>Wealth Composition</div>
          <div style={{fontSize:11,color:C.textMid,fontFamily:sans,marginBottom:12}}>Hover to see data source</div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={WEALTH_COMP} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={76} stroke="none"
                onMouseEnter={(_,i)=>setHovPie(i)} onMouseLeave={()=>setHovPie(null)}>
                {WEALTH_COMP.map((d,i)=>(
                  <Cell key={i} fill={d.color} opacity={hovPie===null||hovPie===i?1:0.3} style={{cursor:"pointer",transition:"opacity 0.2s"}}/>
                ))}
              </Pie>
              <Tooltip content={<PieTip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:4}}>
            {WEALTH_COMP.map((d,i)=>(
              <div key={i} onMouseEnter={()=>setHovPie(i)} onMouseLeave={()=>setHovPie(null)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 7px",borderRadius:8,cursor:"pointer",background:hovPie===i?`${d.color}0F`:"transparent",transition:"background 0.15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:7,height:7,borderRadius:2,background:d.color,flexShrink:0}}/>
                  <span style={{fontSize:12,fontFamily:sans,color:hovPie===i?C.text:C.textMid}}>{d.label}</span>
                  <span style={{fontSize:9,color:d.color,fontFamily:sans,background:`${d.color}18`,padding:"1px 6px",borderRadius:10,border:`1px solid ${d.color}33`}}>
                    {d.source.includes("API")?"API":d.source.includes("Manual")?"Manual":"CSV"}
                  </span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:11,color:C.textMid,fontFamily:sans}}>{d.pct}%</span>
                  <span style={{fontSize:12,fontFamily:sans,color:C.text,fontWeight:500}}>{fmt(d.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Area chart over time */}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"22px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontFamily:serif,fontSize:18,fontWeight:700,color:C.text,marginBottom:2}}>Wealth Over Time</div>
              <div style={{fontSize:11,color:C.textMid,fontFamily:sans}}>Composition by asset class</div>
            </div>
            <div style={{display:"flex",gap:5}}>
              {["3M","6M","1Y","All"].map(t=>(
                <button key={t} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${t==="6M"?C.gold+"66":C.border}`,background:t==="6M"?`${C.gold}15`:"transparent",color:t==="6M"?C.gold:C.textMid,fontFamily:sans,fontSize:11,cursor:"pointer"}}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={OVER_TIME}>
              <defs>
                {[[C.purple,"p"],[C.teal,"t"],[C.green,"g"],[C.blue,"b"],[C.gold,"d"]].map(([col,id])=>(
                  <linearGradient key={id} id={`ag${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={col} stopOpacity={0.5}/><stop offset="95%" stopColor={col} stopOpacity={0.08}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} strokeOpacity={0.5}/>
              <XAxis dataKey="month" tick={{fill:C.textMid,fontSize:11,fontFamily:sans}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{fill:C.textMid,fontSize:10,fontFamily:sans}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:C.bgElevated,border:`1px solid ${C.border}`,borderRadius:10,fontFamily:sans,fontSize:12,color:C.text}} formatter={(v,n)=>[`SGD ${(v/1000).toFixed(0)}K`,n]}/>
              <Area type="monotone" dataKey="Property"  stackId="1" stroke={C.purple} fill="url(#agp)" strokeWidth={1.5}/>
              <Area type="monotone" dataKey="Equities"  stackId="1" stroke={C.teal}   fill="url(#agt)" strokeWidth={1.5}/>
              <Area type="monotone" dataKey="Trust"     stackId="1" stroke={C.green}  fill="url(#agg)" strokeWidth={1.5}/>
              <Area type="monotone" dataKey="Cash"      stackId="1" stroke={C.blue}   fill="url(#agb)" strokeWidth={1.5}/>
              <Area type="monotone" dataKey="Digital"   stackId="1" stroke={C.gold}   fill="url(#agd)" strokeWidth={1.5}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WELLNESS SCORES + RISK + DATA SOURCES */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16}}>
        {[{label:"Current Score",val:scoreAnim,max:CURRENT_SCORE,color:wc,sub:"▲ +5 pts vs last month",subc:C.green},
          {label:"Overall (12M Avg)",val:OVERALL_SCORE,max:OVERALL_SCORE,color:C.textMid,sub:"↑ Trending upward",subc:C.gold}].map((s,i)=>(
          <div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <div style={{fontSize:11,fontFamily:sans,color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.label}</div>
            <div style={{position:"relative",width:92,height:92}}>
              <Gauge value={s.max} color={s.color} size={92}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontFamily:serif,fontSize:26,fontWeight:700,color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:9,color:C.textMid,fontFamily:sans}}>/ 100</div>
              </div>
            </div>
            <div style={{fontFamily:serif,fontSize:15,color:C.text,fontWeight:600}}>Wellness Score</div>
            <div style={{fontSize:11,color:s.subc,fontFamily:sans}}>{s.sub}</div>
          </div>
        ))}
        {/* Risk */}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <div style={{fontSize:11,fontFamily:sans,color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase"}}>Risk Profile</div>
          <div style={{display:"flex",gap:5,marginTop:4}}>
            {["Low","Mod","Mod+","Aggr"].map((l,i)=>(
              <div key={i} style={{width:32,height:32,borderRadius:7,background:i===2?C.gold:`${C.gold}18`,border:`1px solid ${i===2?C.gold:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:i===2?C.bg:C.textMid,fontFamily:sans,fontWeight:600,textAlign:"center",lineHeight:1}}>{l}</div>
            ))}
          </div>
          <div style={{fontFamily:serif,fontSize:14,color:C.gold,fontWeight:600,textAlign:"center"}}>Moderate–Aggressive</div>
          <div style={{fontSize:11,color:C.textMid,fontFamily:sans,textAlign:"center",lineHeight:1.5}}>Tolerance: High volatility<br/>Horizon: 15+ years</div>
        </div>
        {/* Data sources */}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px",display:"flex",flexDirection:"column",gap:0}}>
          <div style={{fontSize:11,fontFamily:sans,color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Data Sources</div>
          {[{l:"API Connected",v:"4 accounts",c:C.green},{l:"Manual Input",v:"1 asset",c:C.gold},{l:"CSV Import",v:"12 records",c:C.blue},{l:"Last Full Sync",v:"14:32 today",c:C.textMid}].map((r,i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:12,color:C.textMid,fontFamily:sans}}>{r.l}</span>
              <span style={{fontSize:12,color:r.c,fontFamily:sans,fontWeight:500}}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* METRICS */}
      <div>
        <div style={{fontFamily:serif,fontSize:20,fontWeight:700,color:C.text,marginBottom:14}}>Financial Health Metrics</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
          {METRICS.map(m=>(
            <div key={m.key} onClick={()=>setOpenMetric(openMetric===m.key?null:m.key)}
              style={{background:C.bgCard,border:`1px solid ${openMetric===m.key?m.color+"55":C.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"border-color 0.2s"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:m.color,opacity:openMetric===m.key?1:0.4,transition:"opacity 0.2s"}}/>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <Gauge value={m.score} color={m.color} size={76}/>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontFamily:serif,fontSize:18,fontWeight:700,color:m.color,lineHeight:1}}>{m.score}</div>
                    <div style={{fontSize:8,color:C.textMid,fontFamily:sans}}>/ 100</div>
                  </div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:sans,marginBottom:3}}>{m.label}</div>
                  <div style={{fontSize:11,color:C.textMid,fontFamily:sans,marginBottom:7}}>{m.desc}</div>
                  <div style={{display:"inline-block",fontSize:10,fontFamily:sans,background:`${m.color}18`,color:m.color,border:`1px solid ${m.color}33`,borderRadius:20,padding:"2px 9px"}}>{m.status}</div>
                </div>
                <div style={{color:C.textMid,fontSize:12,transform:`rotate(${openMetric===m.key?"180":"0"}deg)`,transition:"transform 0.2s"}}>▾</div>
              </div>
              {openMetric===m.key&&(
                <div style={{marginTop:14,borderTop:`1px solid ${C.border}`,paddingTop:12,display:"flex",flexDirection:"column",gap:7}}>
                  {m.pts.map((p,i)=>(
                    <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start"}}>
                      <span style={{color:m.color,fontSize:9,marginTop:3}}>◆</span>
                      <span style={{fontSize:12,color:C.textMid,fontFamily:sans,lineHeight:1.5}}>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RECS + MILESTONES */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:18}}>
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"22px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <div style={{fontFamily:serif,fontSize:18,fontWeight:700,color:C.text,marginBottom:2}}>Actionable Steps</div>
              <div style={{fontSize:11,color:C.textMid,fontFamily:sans}}>AI-powered personalised recommendations</div>
            </div>
            <span style={{fontSize:11,fontFamily:sans,color:C.textMid,background:C.bgElevated,border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px"}}>{RECS.length} active</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {RECS.map(r=>(
              <div key={r.id} style={{background:C.bgElevated,border:`1px solid ${C.border}`,borderLeft:`3px solid ${r.color}`,borderRadius:12,padding:"15px 17px",display:"flex",gap:13,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateX(3px)";e.currentTarget.style.background=C.navyLight}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.background=C.bgElevated}}>
                <div style={{width:37,height:37,flexShrink:0,background:`${r.color}18`,border:`1px solid ${r.color}44`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:r.color}}>{r.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:sans,marginBottom:1}}>{r.title}</div>
                      <div style={{fontSize:10,color:r.color,fontFamily:sans,letterSpacing:"0.06em"}}>{r.cat} · {r.eta}</div>
                    </div>
                    <span style={{fontSize:9,fontFamily:sans,background:`${r.color}18`,color:r.color,border:`1px solid ${r.color}33`,borderRadius:20,padding:"2px 9px",textTransform:"uppercase",letterSpacing:"0.07em",flexShrink:0}}>{r.priority}</span>
                  </div>
                  <div style={{fontSize:12,color:C.textMid,fontFamily:sans,lineHeight:1.55,marginBottom:8}}>{r.body}</div>
                  <div style={{fontSize:12,color:r.color,fontFamily:sans,fontWeight:500}}>{r.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Milestones */}
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"22px 22px"}}>
          <div style={{fontFamily:serif,fontSize:18,fontWeight:700,color:C.text,marginBottom:2}}>Milestone Planner</div>
          <div style={{fontSize:11,color:C.textMid,fontFamily:sans,marginBottom:18}}>Financial goal tracker</div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {MILESTONES.map((m,i)=>{
              const p=pctOf(m.current,m.target);
              return(
                <div key={i} style={{opacity:m.done?0.75:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,fontFamily:sans,color:m.done?C.green:C.text,display:"flex",alignItems:"center",gap:5}}>
                        {m.done&&<span style={{color:C.green}}>✓</span>}{m.label}
                      </div>
                      <div style={{fontSize:10,color:C.textMid,fontFamily:sans,marginTop:1}}>{m.done?"Achieved!":m.deadline}</div>
                    </div>
                    <div style={{fontSize:13,fontFamily:sans,color:m.color,fontWeight:600}}>{p}%</div>
                  </div>
                  <div style={{height:5,background:C.bgElevated,borderRadius:4,overflow:"hidden",marginBottom:4}}>
                    <div style={{height:"100%",width:`${p}%`,background:m.color,borderRadius:4,transition:"width 1.2s ease"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:10,color:C.textMid,fontFamily:sans}}>{fmtSGD(m.current)}</span>
                    <span style={{fontSize:10,color:C.textMid,fontFamily:sans}}>{fmtSGD(m.target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button style={{marginTop:18,width:"100%",padding:"11px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textMid,fontFamily:sans,fontSize:13,cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.target.style.borderColor=C.gold;e.target.style.color=C.gold}}
            onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.textMid}}>
            + Add Milestone
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── CONNECTED APPS ───── */
function ConnectedApps(){
  const[apps,setApps]=useState(APPS);
  const[showCSV,setShowCSV]=useState(false);
  const[showManual,setShowManual]=useState(false);
  const[connecting,setConnecting]=useState(null);
  const toggle=(id)=>setApps(prev=>prev.map(a=>a.id===id?{...a,status:a.status==="connected"?"disconnected":"connected"}:a));
  const connectNew=(name)=>{
    setConnecting(name);
    setTimeout(()=>{setConnecting(null);setApps(prev=>prev.map(a=>a.name===name?{...a,status:"connected",sync:"Just now"}:a));},1800);
  };
  const inp={background:C.bgElevated,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontFamily:sans,fontSize:13,width:"100%",outline:"none"};
  const sc=(s)=>s==="connected"?C.green:s==="manual"?C.gold:C.red;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:22,paddingBottom:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontFamily:serif,fontSize:28,fontWeight:700,color:C.text,marginBottom:4}}>Connected Apps</div>
          <div style={{fontSize:13,color:C.textMid,fontFamily:sans}}>Manage data sources · Connect and disconnect anytime</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setShowCSV(!showCSV)} style={{padding:"9px 16px",background:`${C.blue}15`,border:`1px solid ${C.blue}44`,borderRadius:10,color:C.blue,fontFamily:sans,fontSize:13,cursor:"pointer"}}>📂 CSV Import</button>
          <button onClick={()=>setShowManual(!showManual)} style={{padding:"9px 16px",background:`${C.gold}15`,border:`1px solid ${C.gold}44`,borderRadius:10,color:C.gold,fontFamily:sans,fontSize:13,cursor:"pointer"}}>✏️ Manual Input</button>
        </div>
      </div>

      {showCSV&&(
        <div style={{background:C.bgCard,border:`1px solid ${C.blue}44`,borderRadius:14,padding:"22px 24px"}}>
          <div style={{fontFamily:serif,fontSize:16,fontWeight:700,color:C.text,marginBottom:3}}>Import via CSV</div>
          <div style={{fontSize:12,color:C.textMid,fontFamily:sans,marginBottom:16}}>Upload a bank or brokerage statement. Supported columns: Date, Description, Amount, Category.</div>
          <div style={{border:`2px dashed ${C.blue}44`,borderRadius:12,padding:"36px",textAlign:"center",cursor:"pointer",background:`${C.blue}06`}}>
            <div style={{fontSize:32,marginBottom:10}}>📂</div>
            <div style={{fontSize:13,color:C.textMid,fontFamily:sans}}>Drag & drop your file here, or <span style={{color:C.blue,cursor:"pointer",textDecoration:"underline"}}>browse files</span></div>
            <div style={{fontSize:11,color:C.textDim,fontFamily:sans,marginTop:6}}>Supports: .csv · .xlsx · .ofx · .qif</div>
          </div>
        </div>
      )}

      {showManual&&(
        <div style={{background:C.bgCard,border:`1px solid ${C.gold}44`,borderRadius:14,padding:"22px 24px"}}>
          <div style={{fontFamily:serif,fontSize:16,fontWeight:700,color:C.text,marginBottom:14}}>Add Asset Manually</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:14}}>
            {[["Asset Name","e.g. Toa Payoh HDB"],["Asset Type","Property, Art, Vehicle…"],["Estimated Value (SGD)","680000"],["Notes","Optional description"]].map(([l,p])=>(
              <div key={l}><label style={{fontSize:11,color:C.textMid,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:6,display:"block",fontFamily:sans}}>{l}</label><input style={inp} placeholder={p}/></div>
            ))}
          </div>
          <div style={{fontSize:11,color:C.textMid,fontFamily:sans,marginBottom:12}}>💡 For property: provide type, size, and postal code — we estimate market value using PropertyGuru's valuation engine.</div>
          <button style={{padding:"10px 22px",background:`linear-gradient(135deg,${C.gold},#E8C97A)`,border:"none",borderRadius:10,color:C.bg,fontFamily:sans,fontSize:13,fontWeight:700,cursor:"pointer"}}>Save Asset</button>
        </div>
      )}

      {/* Summary bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[{l:"Total Connected",v:"4 APIs",c:C.green},{l:"Manual Assets",v:"1 asset",c:C.gold},{l:"Total Value Tracked",v:fmt(TOTAL),c:C.text},{l:"Sync Issues",v:"1 error",c:C.red}].map((s,i)=>(
          <div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",textAlign:"center"}}>
            <div style={{fontSize:11,color:C.textMid,fontFamily:sans,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{s.l}</div>
            <div style={{fontSize:22,fontFamily:serif,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{fontSize:11,color:C.textMid,fontFamily:sans,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Your Connected Accounts</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {apps.map(app=>(
            <div key={app.id} style={{background:C.bgCard,border:`1px solid ${app.status==="connected"?app.color+"44":C.border}`,borderRadius:14,padding:"18px 20px",display:"flex",gap:14,alignItems:"flex-start",transition:"border-color 0.2s"}}>
              <div style={{width:44,height:44,borderRadius:12,background:app.status==="connected"?`${app.color}18`:C.bgElevated,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{app.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:sans}}>{app.name}</div>
                    <div style={{fontSize:10,color:C.textMid,fontFamily:sans,textTransform:"capitalize",letterSpacing:"0.05em"}}>{app.type}</div>
                  </div>
                  <div style={{fontSize:10,fontFamily:sans,color:sc(app.status),background:`${sc(app.status)}18`,border:`1px solid ${sc(app.status)}33`,borderRadius:20,padding:"2px 8px",textTransform:"capitalize"}}>{app.status}</div>
                </div>
                {app.value>0&&<div style={{fontSize:12,color:app.color,fontFamily:sans,marginBottom:5,fontWeight:500}}>{fmt(app.value)}</div>}
                {app.assets.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                    {app.assets.map((a,i)=><span key={i} style={{fontSize:9,background:C.bgElevated,border:`1px solid ${C.border}`,borderRadius:10,padding:"2px 7px",color:C.textMid,fontFamily:sans}}>{a}</span>)}
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:10,color:C.textDim,fontFamily:sans}}>Synced: {app.sync}</div>
                  <button onClick={()=>toggle(app.id)} style={{padding:"5px 12px",borderRadius:8,cursor:"pointer",fontFamily:sans,fontSize:11,fontWeight:600,border:"none",background:app.status==="connected"?`${C.red}18`:`${C.green}18`,color:app.status==="connected"?C.red:C.green,transition:"all 0.15s"}}>
                    {app.status==="connected"?"Disconnect":"Reconnect"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontSize:11,color:C.textMid,fontFamily:sans,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Available to Connect</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {AVAIL.map((a,i)=>(
            <div key={i} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{a.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:sans}}>{a.name}</div>
                  <div style={{fontSize:10,color:C.textMid,fontFamily:sans,textTransform:"capitalize"}}>{a.type}</div>
                </div>
              </div>
              <button onClick={()=>connectNew(a.name)} disabled={connecting===a.name} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.teal}55`,background:`${C.teal}12`,color:C.teal,fontFamily:sans,fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0,opacity:connecting===a.name?0.6:1}}>
                {connecting===a.name?"Connecting…":"Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── ACTIVITY LOG ───── */
function ActivityLog(){
  const[filter,setFilter]=useState("All");
  const filtered=filter==="All"?LOG:LOG.filter(e=>e.type===filter.toLowerCase()||e.type==="tx"&&filter==="Transactions"||e.type==="error"&&filter==="Errors");
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20,paddingBottom:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontFamily:serif,fontSize:28,fontWeight:700,color:C.text,marginBottom:4}}>Activity Log</div>
          <div style={{fontSize:13,color:C.textMid,fontFamily:sans}}>Complete audit trail of all data events and account actions</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["All","Sync","Transactions","Errors"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${filter===f?C.gold+"66":C.border}`,background:filter===f?`${C.gold}15`:"transparent",color:filter===f?C.gold:C.textMid,fontFamily:sans,fontSize:12,cursor:"pointer"}}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"150px 130px 170px 1fr 90px",padding:"11px 20px",borderBottom:`1px solid ${C.border}`,background:C.bgElevated}}>
          {["Timestamp","Event","Source","Detail","Type"].map(h=>(
            <div key={h} style={{fontSize:10,fontFamily:sans,color:C.textMid,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600}}>{h}</div>
          ))}
        </div>
        {LOG.map((e,i)=>(
          <div key={e.id} style={{display:"grid",gridTemplateColumns:"150px 130px 170px 1fr 90px",padding:"13px 20px",borderBottom:i<LOG.length-1?`1px solid ${C.border}`:"none",cursor:"default",transition:"background 0.12s"}}
            onMouseEnter={ev=>ev.currentTarget.style.background=C.bgElevated}
            onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
            <div style={{fontSize:11,color:C.textMid,fontFamily:sans}}>{e.ts}</div>
            <div style={{fontSize:12,color:C.text,fontFamily:sans,fontWeight:500,display:"flex",alignItems:"center",gap:5}}><span>{e.icon}</span>{e.event}</div>
            <div style={{fontSize:12,color:C.textMid,fontFamily:sans}}>{e.source}</div>
            <div style={{fontSize:12,color:e.type==="error"?C.red:e.type==="milestone"?C.purple:C.textMid,fontFamily:sans,lineHeight:1.5,paddingRight:12}}>{e.detail}</div>
            <div><span style={{fontSize:9,background:`${typeColor[e.type]}18`,color:typeColor[e.type],border:`1px solid ${typeColor[e.type]}33`,borderRadius:20,padding:"2px 9px",fontFamily:sans,textTransform:"capitalize",letterSpacing:"0.06em"}}>{e.type}</span></div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:12,color:C.textDim,fontFamily:sans}}>
        Showing {LOG.length} of 248 events · <span style={{color:C.gold,cursor:"pointer"}}>Load more</span>
      </div>
    </div>
  );
}

/* ───── APP SHELL ───── */
const NAV=[{id:"dashboard",label:"Dashboard",icon:"▦"},{id:"apps",label:"Connected Apps",icon:"◈"},{id:"log",label:"Activity Log",icon:"≡"}];

export default function App(){
  const[authed,setAuthed]=useState(false);
  const[user,setUser]=useState("James");
  const[page,setPage]=useState("dashboard");
  if(!authed) return <AuthScreen onLogin={(u)=>{setUser(u);setAuthed(true);}}/>;
  return(
    <div style={{fontFamily:sans,background:C.bg,minHeight:"100vh",color:C.text,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px;}
        input::placeholder{color:${C.textDim};}
      `}</style>
      <div style={{height:60,background:C.bgCard,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 30px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.gold},${C.teal})`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:serif,fontWeight:700,fontSize:18,color:C.bg}}>W</div>
          <div>
            <div style={{fontFamily:serif,fontSize:17,fontWeight:700,color:C.text,lineHeight:1}}>Wealth Wellness Hub</div>
            <div style={{fontSize:9,color:C.textMid,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:sans}}>Financial Intelligence</div>
          </div>
        </div>
        <nav style={{display:"flex",gap:4}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{padding:"7px 16px",borderRadius:9,border:`1px solid ${page===n.id?C.gold+"66":C.border}`,background:page===n.id?`${C.gold}12`:"transparent",color:page===n.id?C.gold:C.textMid,fontFamily:sans,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"all 0.15s",fontWeight:page===n.id?600:400}}>
              <span style={{fontSize:12}}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:11,color:C.teal,fontFamily:sans,background:`${C.teal}15`,border:`1px solid ${C.teal}33`,borderRadius:20,padding:"4px 12px"}}>● Live</div>
          <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold}55,${C.teal}55)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.text,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:sans}}>{user.charAt(0).toUpperCase()}</div>
          <button onClick={()=>setAuthed(false)} style={{background:"transparent",border:"none",color:C.textMid,fontFamily:sans,fontSize:12,cursor:"pointer"}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"26px 30px"}}>
        {page==="dashboard"&&<Dashboard user={user}/>}
        {page==="apps"&&<ConnectedApps/>}
        {page==="log"&&<ActivityLog/>}
      </div>
    </div>
  );
}
