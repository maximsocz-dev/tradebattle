import { useState, useEffect, useRef } from "react";

// ─── Styles ────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#07090d;--s1:#0d1117;--s2:#131920;--border:#1e2d3d;
    --green:#00ff87;--red:#ff3d5a;--gold:#ffd700;--blue:#4da6ff;
    --text:#dde8f0;--muted:#4a6278;
    --bebas:'Bebas Neue',sans-serif;
    --bar:'Barlow',sans-serif;
    --barc:'Barlow Condensed',sans-serif;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--bar);}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:var(--border);}
  .fade{animation:fade 0.4s ease forwards;}
  @keyframes fade{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  .pop{animation:pop 0.3s cubic-bezier(.175,.885,.32,1.275) forwards;}
  @keyframes pop{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
  .ticker-wrap{overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
  .ticker-track{display:flex;gap:32px;animation:ticker 30s linear infinite;width:max-content;}
  @keyframes ticker{from{transform:translateX(0);}to{transform:translateX(-50%);}};
  .btn{cursor:pointer;font-family:var(--barc);font-weight:700;letter-spacing:.06em;border:none;transition:all .15s;}
  .btn-green{background:var(--green);color:#07090d;}.btn-green:hover{filter:brightness(1.1);transform:translateY(-1px);}
  .btn-red{background:var(--red);color:#fff;}.btn-red:hover{filter:brightness(1.1);transform:translateY(-1px);}
  .btn-outline{background:transparent;color:var(--text);border:1px solid var(--border);font-family:var(--barc);font-weight:600;cursor:pointer;transition:all .15s;}
  .btn-outline:hover{border-color:var(--blue);color:var(--blue);}
  .btn-gold{background:var(--gold);color:#07090d;font-family:var(--barc);font-weight:700;cursor:pointer;border:none;transition:all .15s;letter-spacing:.06em;}
  .btn-gold:hover{filter:brightness(1.08);transform:translateY(-1px);}
  .input{background:var(--s2);border:1px solid var(--border);color:var(--text);font-family:var(--bar);outline:none;transition:border-color .2s;}
  .input:focus{border-color:var(--blue);}
  .card{background:var(--s1);border:1px solid var(--border);}
  .tab-active{border-bottom:2px solid var(--gold)!important;color:var(--gold)!important;}
  .rank1{color:var(--gold);}
  .rank2{color:#c0c0c0;}
  .rank3{color:#cd7f32;}
  .pill-green{background:#00ff8720;border:1px solid #00ff8740;color:var(--green);}
  .pill-red{background:#ff3d5a20;border:1px solid #ff3d5a40;color:var(--red);}
  .shine{position:relative;overflow:hidden;}
  .shine::after{content:'';position:absolute;top:-50%;left:-75%;width:50%;height:200%;background:linear-gradient(to right,transparent,rgba(255,255,255,0.04),transparent);transform:skewX(-20deg);animation:shine 4s ease-in-out infinite;}
  @keyframes shine{0%,100%{left:-75%;}50%{left:125%;}}
  .progress-bar{height:4px;background:var(--border);}
  .progress-fill{height:100%;background:linear-gradient(90deg,var(--green),var(--blue));transition:width 1s ease;}
  .hot-badge{background:var(--red);color:#fff;font-family:var(--barc);font-size:10px;font-weight:700;padding:2px 6px;}
  .new-badge{background:var(--green);color:#07090d;font-family:var(--barc);font-size:10px;font-weight:700;padding:2px 6px;}
  .fut-badge{background:#7c3aed;color:#fff;font-family:var(--barc);font-size:9px;font-weight:700;padding:2px 5px;letter-spacing:.04em;}
`;

// ─── Futures Specs ─────────────────────────────────────────────
const FUTURES_SPECS = {
  MNQ:  { name:"Micro Nasdaq-100",   base:19800, multiplier:2,     margin:1800, category:"Index" },
  MES:  { name:"Micro S&P 500",      base:5480,  multiplier:5,     margin:1200, category:"Index" },
  MYM:  { name:"Micro Dow Jones",    base:40200, multiplier:0.5,   margin:900,  category:"Index" },
  M2K:  { name:"Micro Russell 2000", base:2085,  multiplier:5,     margin:750,  category:"Index" },
  MCL:  { name:"Micro Crude Oil",    base:82.4,  multiplier:100,   margin:800,  category:"Energy" },
  MGC:  { name:"Micro Gold",         base:2342,  multiplier:10,    margin:1100, category:"Metals" },
  SIL:  { name:"Micro Silver",       base:27.8,  multiplier:1000,  margin:1500, category:"Metals" },
  MBT:  { name:"Micro Bitcoin",      base:67500, multiplier:0.1,   margin:4000, category:"Crypto" },
  M6E:  { name:"Micro EUR/USD",      base:1.085, multiplier:12500, margin:500,  category:"Forex" },
  M6B:  { name:"Micro GBP/USD",      base:1.265, multiplier:6250,  margin:500,  category:"Forex" },
};

const BASE_PRICES = {
  AAPL:182, TSLA:248, NVDA:875, AMZN:195, MSFT:415, GOOG:172,
  META:520, SPY:545, QQQ:468, NFLX:635, AMD:168, GME:18,
  BTC:67500, ETH:3200, SOL:185, DOGE:0.18, BNB:420, XRP:0.62,
  EURUSD:1.085, GBPUSD:1.265, JPYUSD:0.0067, AUDUSD:0.653,
  GOLD:2340, OIL:82, SILVER:27, NATGAS:2.18,
  ...Object.fromEntries(Object.entries(FUTURES_SPECS).map(([k,v])=>[k,v.base])),
};

const ASSET_CATEGORIES = {
  "📈 Stocks":      ["AAPL","TSLA","NVDA","AMZN","MSFT","GOOG","META","SPY","QQQ","NFLX","AMD","GME"],
  "₿ Crypto":       ["BTC","ETH","SOL","DOGE","BNB","XRP"],
  "💱 Forex":       ["EURUSD","GBPUSD","JPYUSD","AUDUSD"],
  "🏅 Commodities": ["GOLD","OIL","SILVER","NATGAS"],
  "⚡ Futures":     Object.keys(FUTURES_SPECS),
};

// ─── Price Engine ──────────────────────────────────────────────
function useLivePrices() {
  const [prices, setPrices] = useState(() => {
    const p = {};
    Object.entries(BASE_PRICES).forEach(([k,v]) => { p[k] = { price:v, change:0, pct:0 }; });
    return p;
  });
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(sym => {
          const vol = FUTURES_SPECS[sym] ? 0.0005 : 0.0022;
          const drift = (Math.random()-0.495)*vol;
          const newPrice = Math.max(0.0001, next[sym].price*(1+drift));
          next[sym] = { price:newPrice, change:newPrice-BASE_PRICES[sym], pct:((newPrice-BASE_PRICES[sym])/BASE_PRICES[sym])*100 };
        });
        return next;
      });
    }, 1200);
    return () => clearInterval(iv);
  }, []);
  return prices;
}

// ─── Candle History ────────────────────────────────────────────
function useCandleHistory(prices, symbol) {
  const histRef = useRef({});
  const [candles, setCandles] = useState([]);

  useEffect(() => {
    if (!symbol) return;
    if (!histRef.current[symbol]) {
      const base = BASE_PRICES[symbol] || 100;
      const seed = [];
      let p = base * 0.97;
      const now = Date.now();
      for (let i = 59; i >= 0; i--) {
        const o = p;
        const move = (Math.random()-0.48)*base*0.003;
        const c = Math.max(0.0001, o+move);
        seed.push({ t:now-i*5000, o, h:Math.max(o,c)*(1+Math.random()*0.002), l:Math.min(o,c)*(1-Math.random()*0.002), c });
        p = c;
      }
      histRef.current[symbol] = seed;
    }
    setCandles([...histRef.current[symbol]]);
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    const iv = setInterval(() => {
      const hist = histRef.current[symbol];
      if (!hist || !hist.length) return;
      const last = hist[hist.length-1];
      const cur = prices[symbol]?.price || last.c;
      const nc = { t:Date.now(), o:last.c, h:Math.max(last.c,cur)*(1+Math.random()*0.001), l:Math.min(last.c,cur)*(1-Math.random()*0.001), c:cur };
      const updated = [...hist.slice(-99), nc];
      histRef.current[symbol] = updated;
      setCandles([...updated]);
    }, 5000);
    return () => clearInterval(iv);
  }, [symbol, prices]);

  return candles;
}

// ─── Format helpers ────────────────────────────────────────────
function fmt(n, d=2) {
  if (n===undefined||n===null) return "—";
  if (Math.abs(n)>=10000) return n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
  return n.toFixed(d);
}
function fmtUSD(n) { return "$"+fmt(n,2); }
function fmtPct(n) { return (n>=0?"+":"")+fmt(n,2)+"%"; }
function fmtPrice(sym, p) {
  if (!p && p!==0) return "—";
  if (p<0.01) return "$"+p.toFixed(6);
  if (p<1) return "$"+p.toFixed(4);
  if (p<10) return "$"+p.toFixed(3);
  if (p>=10000) return "$"+p.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  return "$"+p.toFixed(2);
}
function fmtPriceShort(sym, p) {
  if (!p && p!==0) return "—";
  if (p<0.01) return p.toFixed(5);
  if (p<1) return p.toFixed(4);
  if (p>=10000) return (p/1000).toFixed(1)+"k";
  return p.toFixed(2);
}

// ─── Storage ───────────────────────────────────────────────────
function loadState() { try { const r=sessionStorage.getItem("tb3"); return r?JSON.parse(r):null; } catch{return null;} }
function saveState(s) { try { sessionStorage.setItem("tb3",JSON.stringify(s)); } catch{} }

// ─── Demo Rooms ────────────────────────────────────────────────
const DEMO_ROOMS = [
  { id:"r1", name:"Weekend Warriors",  mode:"timed",  duration:168, target:null, startingCash:10000, creator:"TradingKing99",  players:["TradingKing99","MarketWizard","BullRunner","CryptoQueen","DayTrader_X"], status:"active" },
  { id:"r2", name:"Futures Showdown",  mode:"target", duration:null, target:25,  startingCash:25000, creator:"FuturesPro",     players:["FuturesPro","MNQMaster","ScalpKing","M2KHunter"],                        status:"active" },
  { id:"r3", name:"Pro Arena",         mode:"timed",  duration:24,  target:null, startingCash:50000, creator:"WallStreetPro", players:["WallStreetPro","Algo_Master","Quant_Trader","RiskManager"],                status:"active" },
];

function makeMockPortfolio(cash, names) {
  return names.map(name => {
    const gain=(Math.random()-0.35)*cash*0.4;
    return { name, cash:cash+gain, gain, pct:(gain/cash)*100, trades:Math.floor(Math.random()*18)+1 };
  });
}

// ─── Candlestick Chart Component ───────────────────────────────
function CandleChart({ symbol, prices }) {
  const candles = useCandleHistory(prices, symbol);
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const W=640, H=220, PAD={top:8,right:8,bottom:22,left:60};

  if (!candles.length || !symbol) return (
    <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--muted)", fontFamily:"var(--barc)", fontSize:13, background:"var(--s2)", border:"1px solid var(--border)" }}>
      Select an asset below to view its chart
    </div>
  );

  const visible = candles.slice(-50);
  const allPrices = visible.flatMap(c=>[c.h,c.l]);
  const minP = Math.min(...allPrices), maxP = Math.max(...allPrices);
  const range = maxP-minP || 1;
  const cW = W-PAD.left-PAD.right, cH = H-PAD.top-PAD.bottom;
  const candleW = Math.max(3, cW/visible.length-1.5);
  const yS = p => PAD.top+cH-((p-minP)/range)*cH;
  const xS = i => PAD.left+(i+0.5)*(cW/visible.length);
  const cur = prices[symbol];
  const ticks = 5;

  return (
    <div style={{ position:"relative", background:"var(--s2)", border:"1px solid var(--border)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span style={{ fontFamily:"var(--bebas)", fontSize:18, letterSpacing:1 }}>{symbol}</span>
          {FUTURES_SPECS[symbol]&&<span className="fut-badge">FUTURES · {FUTURES_SPECS[symbol].name}</span>}
          <span style={{ fontFamily:"var(--bebas)", fontSize:16, color:cur?.pct>=0?"var(--green)":"var(--red)" }}>{fmtPrice(symbol,cur?.price)}</span>
        </div>
        <span style={{ fontFamily:"var(--barc)", fontSize:12, fontWeight:700, color:cur?.pct>=0?"var(--green)":"var(--red)" }}>{fmtPct(cur?.pct||0)}</span>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block", cursor:"crosshair" }}
        onMouseMove={e=>{
          const rect=svgRef.current.getBoundingClientRect();
          const mx=(e.clientX-rect.left)*(W/rect.width);
          const idx=Math.floor((mx-PAD.left)/(cW/visible.length));
          if(idx>=0&&idx<visible.length) setTooltip({idx,c:visible[idx],x:xS(idx)});
          else setTooltip(null);
        }}
        onMouseLeave={()=>setTooltip(null)}>
        {/* Grid */}
        {Array.from({length:ticks},(_,i)=>minP+(range*i)/(ticks-1)).map((v,i)=>(
          <g key={i}>
            <line x1={PAD.left} x2={W-PAD.right} y1={yS(v)} y2={yS(v)} stroke="#1e2d3d" strokeWidth={0.5}/>
            <text x={PAD.left-4} y={yS(v)+3.5} textAnchor="end" fill="#4a6278" fontSize={9} fontFamily="'Barlow Condensed',sans-serif">
              {fmtPriceShort(symbol,v)}
            </text>
          </g>
        ))}
        {/* Candles */}
        {visible.map((c,i)=>{
          const isG=c.c>=c.o, col=isG?"#00ff87":"#ff3d5a";
          const bTop=yS(Math.max(c.o,c.c)), bBot=yS(Math.min(c.o,c.c));
          return (
            <g key={i} opacity={tooltip?.idx===i?1:0.88}>
              <line x1={xS(i)} x2={xS(i)} y1={yS(c.h)} y2={yS(c.l)} stroke={col} strokeWidth={1}/>
              <rect x={xS(i)-candleW/2} y={bTop} width={candleW} height={Math.max(1,bBot-bTop)} fill={col}/>
            </g>
          );
        })}
        {/* Crosshair */}
        {tooltip&&<>
          <line x1={tooltip.x} x2={tooltip.x} y1={PAD.top} y2={H-PAD.bottom} stroke="#4da6ff" strokeWidth={0.5} strokeDasharray="3,3"/>
          <line x1={PAD.left} x2={W-PAD.right} y1={yS(tooltip.c.c)} y2={yS(tooltip.c.c)} stroke="#4da6ff" strokeWidth={0.5} strokeDasharray="3,3"/>
        </>}
        {/* Last price line */}
        {cur&&<line x1={PAD.left} x2={W-PAD.right} y1={yS(cur.price)} y2={yS(cur.price)} stroke={cur.pct>=0?"#00ff87":"#ff3d5a"} strokeWidth={0.5} strokeDasharray="5,3" opacity={0.5}/>}
      </svg>
      {/* Tooltip box */}
      {tooltip&&(
        <div style={{ position:"absolute", top:42, left:Math.min(tooltip.x/W*100,55)+"%", background:"#0d1117", border:"1px solid #1e2d3d", padding:"7px 10px", fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, pointerEvents:"none", zIndex:10 }}>
          <div style={{ color:"var(--muted)", marginBottom:3 }}>{new Date(tooltip.c.t).toLocaleTimeString()}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 10px" }}>
            {[["O",tooltip.c.o],["H",tooltip.c.h],["L",tooltip.c.l],["C",tooltip.c.c]].map(([l,v])=>(
              <span key={l}><span style={{ color:"var(--muted)" }}>{l} </span>
                <span style={{ fontWeight:700, color:tooltip.c.c>=tooltip.c.o?"var(--green)":"var(--red)" }}>{fmtPriceShort(symbol,v)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ticker ────────────────────────────────────────────────────
function Ticker({ prices }) {
  const syms = ["AAPL","TSLA","NVDA","BTC","ETH","MNQ","MES","MYM","MGC","EURUSD","GOLD","SPY","QQQ","MBT"];
  const items = [...syms,...syms];
  return (
    <div className="ticker-wrap" style={{ padding:"6px 0", background:"var(--s1)" }}>
      <div className="ticker-track">
        {items.map((s,i)=>{
          const p=prices[s]; const isFut=!!FUTURES_SPECS[s];
          return (
            <span key={i} style={{ fontFamily:"var(--barc)", fontSize:12, fontWeight:600, display:"flex", gap:5, alignItems:"center", whiteSpace:"nowrap" }}>
              <span style={{ color:"var(--muted)" }}>{s}</span>
              {isFut&&<span style={{ fontSize:8, background:"#7c3aed", color:"#fff", padding:"1px 3px", fontWeight:700 }}>FUT</span>}
              <span>{fmtPrice(s,p?.price)}</span>
              <span style={{ color:p?.pct>=0?"var(--green)":"var(--red)", fontSize:11 }}>{fmtPct(p?.pct||0)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Lobby ─────────────────────────────────────────────────────
function Lobby({ prices, onJoin, onCreate, username, setUsername }) {
  const [nameInput,setNameInput]=useState(username||"");
  const [nameSet,setNameSet]=useState(!!username);
  if (!nameSet) return (
    <div className="fade" style={{ padding:32, maxWidth:420, margin:"60px auto", textAlign:"center" }}>
      <div style={{ fontFamily:"var(--bebas)", fontSize:52, letterSpacing:2, marginBottom:4 }}>TRADE<span style={{ color:"var(--gold)" }}>BATTLE</span></div>
      <p style={{ color:"var(--muted)", marginBottom:32, fontSize:14 }}>Paper trading tournaments. Stocks, Crypto, Forex, Futures & more. No real money.</p>
      <div className="card" style={{ padding:28 }}>
        <p style={{ fontFamily:"var(--barc)", fontWeight:700, marginBottom:12, letterSpacing:".05em" }}>CHOOSE YOUR TRADER NAME</p>
        <input className="input" value={nameInput} onChange={e=>setNameInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&nameInput.trim()&&(setUsername(nameInput.trim()),setNameSet(true))}
          placeholder="e.g. BullRunner42" style={{ width:"100%", padding:"12px 14px", fontSize:15, marginBottom:16 }}/>
        <button className="btn btn-gold" onClick={()=>{if(nameInput.trim()){setUsername(nameInput.trim());setNameSet(true);}}} style={{ width:"100%", padding:"14px", fontSize:16 }}>ENTER THE ARENA →</button>
      </div>
    </div>
  );
  return (
    <div className="fade" style={{ padding:"20px 16px", maxWidth:700, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"var(--bebas)", fontSize:32, letterSpacing:1 }}>ARENA <span style={{ color:"var(--gold)" }}>LOBBY</span></div>
          <div style={{ color:"var(--muted)", fontSize:13 }}>As <span style={{ color:"var(--blue)" }}>{username}</span></div>
        </div>
        <button className="btn btn-gold" onClick={onCreate} style={{ padding:"10px 20px", fontSize:14 }}>+ CREATE BATTLE</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {DEMO_ROOMS.map((room,i)=>{
          const mock=makeMockPortfolio(room.startingCash,room.players).sort((a,b)=>b.cash-a.cash);
          return (
            <div key={room.id} className="card shine" style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:17 }}>{room.name}</div>
                  {i===0&&<span className="hot-badge">🔥 HOT</span>}
                  {i===1&&<span className="fut-badge">⚡ FUTURES</span>}
                  {i===2&&<span className="new-badge">NEW</span>}
                </div>
                <button className="btn btn-outline" onClick={()=>onJoin(room)} style={{ padding:"7px 18px", fontSize:13 }}>JOIN</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:12 }}>
                {[{label:"MODE",val:room.mode==="timed"?`⏱ ${room.duration}h`:`🎯 +${room.target}%`},{label:"BANK",val:fmtUSD(room.startingCash)},{label:"PLAYERS",val:room.players.length},{label:"LEADER",val:mock[0].name.slice(0,10)}].map(({label,val})=>(
                  <div key={label} style={{ background:"var(--s2)", padding:"8px 10px" }}>
                    <div style={{ fontFamily:"var(--barc)", fontSize:9, color:"var(--muted)", fontWeight:700, letterSpacing:".08em", marginBottom:3 }}>{label}</div>
                    <div style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:13 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {mock.map((p,j)=><span key={j} style={{ fontFamily:"var(--barc)", fontSize:11, color:"var(--muted)", background:"var(--s2)", padding:"3px 8px", border:"1px solid var(--border)" }}>{p.name}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Create Room ───────────────────────────────────────────────
function CreateRoom({ onCreate, username }) {
  const [name,setName]=useState(""); const [mode,setMode]=useState("timed");
  const [duration,setDuration]=useState("24"); const [target,setTarget]=useState("20");
  const [cash,setCash]=useState("10000"); const [invite,setInvite]=useState("");
  function submit(){
    if(!name.trim()) return;
    onCreate({ id:"r"+Date.now(), name:name.trim(), mode, duration:mode==="timed"?parseInt(duration):null,
      target:mode==="target"?parseInt(target):null, startingCash:parseInt(cash), creator:username,
      players:[username,...invite.split(",").map(s=>s.trim()).filter(Boolean)], createdAt:Date.now(), status:"active" });
  }
  return (
    <div className="fade" style={{ padding:"24px 16px", maxWidth:500, margin:"0 auto" }}>
      <div style={{ fontFamily:"var(--bebas)", fontSize:30, letterSpacing:1, marginBottom:20 }}>CREATE <span style={{ color:"var(--gold)" }}>BATTLE</span></div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:6 }}>BATTLE NAME</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Friday Night Showdown" style={{ width:"100%", padding:"11px 14px", fontSize:14 }}/>
        </div>
        <div>
          <label style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:8 }}>BATTLE MODE</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[{id:"timed",icon:"⏱",label:"TIMED",sub:"Best P&L when time expires"},{id:"target",icon:"🎯",label:"FIRST TO TARGET",sub:"Hit % gain first to win"}].map(m=>(
              <div key={m.id} onClick={()=>setMode(m.id)} style={{ padding:"14px", border:`1px solid ${mode===m.id?"var(--gold)":"var(--border)"}`, cursor:"pointer", background:mode===m.id?"#ffd70012":"var(--s1)", transition:"all .15s" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{m.icon}</div>
                <div style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:13 }}>{m.label}</div>
                <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
        {mode==="timed"&&<div>
          <label style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:8 }}>DURATION</label>
          <div style={{ display:"flex", gap:8 }}>
            {["1","6","24","48","168"].map(h=>(
              <span key={h} onClick={()=>setDuration(h)} style={{ flex:1, padding:"8px", textAlign:"center", border:`1px solid ${duration===h?"var(--gold)":"var(--border)"}`, cursor:"pointer", fontFamily:"var(--barc)", fontWeight:700, fontSize:12, color:duration===h?"var(--gold)":"var(--muted)", transition:"all .15s" }}>
                {h==="168"?"1W":`${h}H`}
              </span>
            ))}
          </div>
        </div>}
        {mode==="target"&&<div>
          <label style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:6 }}>PROFIT TARGET (%)</label>
          <input className="input" value={target} onChange={e=>setTarget(e.target.value)} type="number" style={{ width:"100%", padding:"11px 14px", fontSize:14 }}/>
        </div>}
        <div>
          <label style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:8 }}>STARTING BANK</label>
          <div style={{ display:"flex", gap:8 }}>
            {["1000","5000","10000","25000","50000"].map(v=>(
              <span key={v} onClick={()=>setCash(v)} style={{ flex:1, padding:"8px 4px", textAlign:"center", border:`1px solid ${cash===v?"var(--gold)":"var(--border)"}`, cursor:"pointer", fontFamily:"var(--barc)", fontWeight:700, fontSize:11, color:cash===v?"var(--gold)":"var(--muted)", transition:"all .15s" }}>
                ${parseInt(v)>=1000?(parseInt(v)/1000)+"K":v}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".08em", display:"block", marginBottom:6 }}>INVITE PLAYERS (comma-separated)</label>
          <input className="input" value={invite} onChange={e=>setInvite(e.target.value)} placeholder="e.g. BullRunner, CryptoQueen" style={{ width:"100%", padding:"11px 14px", fontSize:14 }}/>
        </div>
        <button className="btn btn-gold" onClick={submit} style={{ padding:"14px", fontSize:16, width:"100%" }}>LAUNCH BATTLE ⚡</button>
      </div>
    </div>
  );
}

// ─── Battle Room ───────────────────────────────────────────────
function BattleRoom({ room, username, prices, onLeave }) {
  const [tab,setTab]=useState("trade");
  const [portfolio,setPortfolio]=useState(()=>{
    const saved=loadState();
    if(saved?.roomId===room.id&&saved?.username===username) return saved.portfolio;
    return { cash:room.startingCash, positions:{}, futures:{}, trades:[] };
  });
  const [catTab,setCatTab]=useState("📈 Stocks");
  const [selected,setSelected]=useState(null);
  const [qty,setQty]=useState("");
  const [contracts,setContracts]=useState("1");
  const [orderType,setOrderType]=useState("buy");
  const [toast,setToast]=useState(null);
  const [chartSym,setChartSym]=useState("AAPL");
  const [leaderboard]=useState(()=>makeMockPortfolio(room.startingCash,room.players.filter(p=>p!==username)));

  useEffect(()=>{ saveState({roomId:room.id,username,portfolio}); },[portfolio]);

  const isFutures = selected && !!FUTURES_SPECS[selected];
  const spec = isFutures ? FUTURES_SPECS[selected] : null;

  const posValue = Object.entries(portfolio.positions||{}).reduce((s,[sym,pos])=>s+(prices[sym]?.price||pos.avgPrice)*pos.qty, 0);
  const futPnl = Object.entries(portfolio.futures||{}).reduce((s,[sym,pos])=>{
    const cur=prices[sym]?.price||pos.entryPrice;
    const sp=FUTURES_SPECS[sym];
    return s+(cur-pos.entryPrice)*sp.multiplier*pos.contracts*(pos.side==="long"?1:-1);
  }, 0);
  const totalValue = portfolio.cash+posValue+futPnl;
  const totalGain = totalValue-room.startingCash;
  const totalPct = (totalGain/room.startingCash)*100;
  const fullBoard = [...leaderboard,{name:username,cash:totalValue,gain:totalGain,pct:totalPct,trades:portfolio.trades.length}].sort((a,b)=>b.cash-a.cash);
  const myRank = fullBoard.findIndex(p=>p.name===username)+1;
  const targetPct = room.mode==="target"?room.target:null;

  function showToast(msg, color="var(--green)") { setToast({msg,color}); setTimeout(()=>setToast(null),2800); }

  function executeSpot() {
    const q=parseFloat(qty);
    if(!selected||!q||q<=0) return showToast("Enter a valid quantity","var(--red)");
    const price=prices[selected]?.price;
    if(!price) return;
    const cost=price*q;
    if(orderType==="buy"){
      if(cost>portfolio.cash) return showToast("Insufficient funds!","var(--red)");
      setPortfolio(prev=>{
        const pos=prev.positions[selected]||{qty:0,avgPrice:0};
        const nQty=pos.qty+q; const nAvg=(pos.avgPrice*pos.qty+price*q)/nQty;
        return {...prev,cash:prev.cash-cost,positions:{...prev.positions,[selected]:{qty:nQty,avgPrice:nAvg}},trades:[{id:Date.now(),sym:selected,side:"BUY",qty:q,price,time:Date.now(),type:"spot"},...prev.trades]};
      });
      showToast(`✅ Bought ${q} ${selected} @ ${fmtPrice(selected,price)}`);
    } else {
      const pos=portfolio.positions[selected];
      if(!pos||pos.qty<q) return showToast("Not enough to sell!","var(--red)");
      setPortfolio(prev=>{
        const nQty=prev.positions[selected].qty-q;
        const nPos={...prev.positions};
        if(nQty<=0) delete nPos[selected]; else nPos[selected]={...prev.positions[selected],qty:nQty};
        return {...prev,cash:prev.cash+cost,positions:nPos,trades:[{id:Date.now(),sym:selected,side:"SELL",qty:q,price,time:Date.now(),type:"spot"},...prev.trades]};
      });
      showToast(`💰 Sold ${q} ${selected} @ ${fmtPrice(selected,price)}`,"var(--blue)");
    }
    setQty("");
  }

  function executeFut() {
    const c=parseInt(contracts)||1;
    if(!spec) return;
    const price=prices[selected]?.price;
    const side=orderType==="buy"?"long":"short";
    const marginNeeded=spec.margin*c;
    if(marginNeeded>portfolio.cash) return showToast(`Need ${fmtUSD(marginNeeded)} margin!`,"var(--red)");
    const existing=portfolio.futures[selected];
    if(existing&&existing.side!==side){
      const pnl=(price-existing.entryPrice)*spec.multiplier*existing.contracts*(existing.side==="long"?1:-1);
      setPortfolio(prev=>{
        const nF={...prev.futures}; delete nF[selected];
        return {...prev,cash:prev.cash+existing.margin+pnl,futures:nF,trades:[{id:Date.now(),sym:selected,side:"CLOSE "+existing.side.toUpperCase(),qty:existing.contracts,price,time:Date.now(),type:"futures",pnl},...prev.trades]};
      });
      showToast(`Closed ${existing.side} ${selected}: ${pnl>=0?"+":" "}${fmtUSD(pnl)}`,pnl>=0?"var(--green)":"var(--red)"); return;
    }
    setPortfolio(prev=>{
      const pp=prev.futures[selected];
      const nC=(pp?.contracts||0)+c;
      const nE=pp?(pp.entryPrice*pp.contracts+price*c)/nC:price;
      const nM=(pp?.margin||0)+marginNeeded;
      return {...prev,cash:prev.cash-marginNeeded,futures:{...prev.futures,[selected]:{side,contracts:nC,entryPrice:nE,margin:nM}},trades:[{id:Date.now(),sym:selected,side:side==="long"?"LONG":"SHORT",qty:c,price,time:Date.now(),type:"futures"},...prev.trades]};
    });
    showToast(`⚡ ${side==="long"?"LONG":"SHORT"} ${c}x ${selected} @ ${fmtPrice(selected,price)}`);
    setContracts("1");
  }

  function closeFut(sym){
    const pos=portfolio.futures[sym]; const s=FUTURES_SPECS[sym];
    const price=prices[sym]?.price||pos.entryPrice;
    const pnl=(price-pos.entryPrice)*s.multiplier*pos.contracts*(pos.side==="long"?1:-1);
    setPortfolio(prev=>{ const nF={...prev.futures}; delete nF[sym]; return {...prev,cash:prev.cash+pos.margin+pnl,futures:nF,trades:[{id:Date.now(),sym,side:"CLOSE",qty:pos.contracts,price,time:Date.now(),type:"futures",pnl},...prev.trades]}; });
    showToast(`Closed ${sym}: ${pnl>=0?"+":" "}${fmtUSD(pnl)}`,pnl>=0?"var(--green)":"var(--red)");
  }

  const maxBuy = selected&&prices[selected]&&!isFutures ? Math.floor(portfolio.cash/prices[selected].price) : 0;
  const myFutPos = selected&&isFutures ? portfolio.futures[selected] : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:800, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ background:"var(--s1)", borderBottom:"1px solid var(--border)", padding:"10px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <button className="btn-outline" onClick={onLeave} style={{ padding:"5px 12px", fontSize:12 }}>← LOBBY</button>
            <div>
              <div style={{ fontFamily:"var(--bebas)", fontSize:20, letterSpacing:1 }}>{room.name}</div>
              <div style={{ fontFamily:"var(--barc)", fontSize:10, color:"var(--muted)", fontWeight:600 }}>{room.mode==="timed"?`⏱ ${room.duration}H`:`🎯 +${room.target}%`} · {room.players.length} PLAYERS</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--bebas)", fontSize:22, color:totalGain>=0?"var(--green)":"var(--red)" }}>{fmtUSD(totalValue)}</div>
            <div style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:totalGain>=0?"var(--green)":"var(--red)" }}>{fmtPct(totalPct)} · #{myRank}</div>
          </div>
        </div>
        {targetPct&&<div style={{ marginTop:8 }}><div className="progress-bar"><div className="progress-fill" style={{ width:`${Math.min(100,(totalPct/targetPct)*100)}%` }}/></div></div>}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--border)", background:"var(--s1)" }}>
        {[["trade","📊 Trade"],["chart","📈 Chart"],["portfolio","💼 Positions"],["leaderboard","🏆 Board"],["history","📋 History"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} className={tab===t?"tab-active":""}
            style={{ flex:1, padding:"10px 4px", background:"transparent", border:"none", borderBottom:"2px solid transparent", cursor:"pointer", fontFamily:"var(--barc)", fontWeight:700, fontSize:11, letterSpacing:".05em", color:tab===t?"var(--gold)":"var(--muted)", transition:"all .15s", textTransform:"uppercase" }}>
            {l}
          </button>
        ))}
      </div>

      {toast&&<div className="pop" style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", background:"var(--s1)", border:`1px solid ${toast.color}`, padding:"10px 20px", fontFamily:"var(--barc)", fontWeight:700, fontSize:13, color:toast.color, zIndex:999, whiteSpace:"nowrap" }}>{toast.msg}</div>}

      <div style={{ flex:1, overflowY:"auto" }}>

        {/* ── TRADE TAB ── */}
        {tab==="trade"&&(
          <div className="fade" style={{ padding:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, alignItems:"start" }}>
            <div>
              {/* Category tabs */}
              <div style={{ display:"flex", gap:0, marginBottom:10, overflowX:"auto", paddingBottom:2 }}>
                {Object.keys(ASSET_CATEGORIES).map(c=>(
                  <button key={c} onClick={()=>{setCatTab(c);setSelected(null);}}
                    style={{ padding:"6px 9px", background:catTab===c?"var(--s2)":"transparent", border:`1px solid ${catTab===c?"var(--border)":"transparent"}`, cursor:"pointer", fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:catTab===c?"var(--text)":"var(--muted)", whiteSpace:"nowrap", transition:"all .15s" }}>
                    {c}
                  </button>
                ))}
              </div>
              {catTab==="⚡ Futures"&&(
                <div style={{ background:"#7c3aed18", border:"1px solid #7c3aed44", padding:"8px 12px", marginBottom:8, fontFamily:"var(--barc)", fontSize:11, color:"#c4b5fd", lineHeight:1.5 }}>
                  ⚡ <strong>Micro Futures</strong> — margin-based leverage. P&L = point move × multiplier × contracts. Click chart tab to see live candles.
                </div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {ASSET_CATEGORIES[catTab].map(sym=>{
                  const p=prices[sym]; const isSelected=selected===sym;
                  const isFut=!!FUTURES_SPECS[sym]; const s=isFut?FUTURES_SPECS[sym]:null;
                  const hasFutPos=isFut&&portfolio.futures[sym];
                  return (
                    <div key={sym} onClick={()=>{setSelected(sym);setChartSym(sym);}}
                      style={{ padding:"10px 12px", background:isSelected?"var(--s2)":"var(--s1)", border:`1px solid ${isSelected?"var(--gold)":"var(--border)"}`, cursor:"pointer", transition:"all .1s" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:13 }}>{sym}</span>
                            {isFut&&<span className="fut-badge">FUT</span>}
                          </div>
                          {isFut&&<div style={{ fontFamily:"var(--barc)", fontSize:9, color:"var(--muted)", marginTop:1 }}>{s.name}</div>}
                          {!isFut&&portfolio.positions[sym]&&<div style={{ fontFamily:"var(--barc)", fontSize:10, color:"var(--blue)", marginTop:1 }}>HOLDING {fmt(portfolio.positions[sym].qty,4)}</div>}
                          {hasFutPos&&<div style={{ fontFamily:"var(--barc)", fontSize:10, color:"#c4b5fd", marginTop:1 }}>{portfolio.futures[sym].side.toUpperCase()} {portfolio.futures[sym].contracts}x</div>}
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:13 }}>{fmtPrice(sym,p?.price)}</div>
                          <div style={{ fontFamily:"var(--barc)", fontSize:11, color:p?.pct>=0?"var(--green)":"var(--red)" }}>{fmtPct(p?.pct||0)}</div>
                          {isFut&&<div style={{ fontFamily:"var(--barc)", fontSize:9, color:"var(--muted)" }}>Margin: {fmtUSD(s.margin)}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Panel */}
            <div style={{ position:"sticky", top:0 }}>
              {selected ? (
                <div className="card" style={{ padding:16 }}>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ fontFamily:"var(--bebas)", fontSize:24, letterSpacing:1 }}>{selected}</span>
                      {isFutures&&<span className="fut-badge">FUTURES</span>}
                    </div>
                    {isFutures&&<div style={{ fontFamily:"var(--barc)", fontSize:11, color:"var(--muted)", marginBottom:4 }}>{spec.name}</div>}
                    <div style={{ fontFamily:"var(--bebas)", fontSize:20, color:prices[selected]?.pct>=0?"var(--green)":"var(--red)" }}>{fmtPrice(selected,prices[selected]?.price)}</div>
                    {isFutures&&(
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5, marginTop:8 }}>
                        {[["Mult","$"+spec.multiplier+"/pt"],["Margin",fmtUSD(spec.margin)],["Cat",spec.category]].map(([l,v])=>(
                          <div key={l} style={{ background:"var(--s2)", padding:"5px 7px", fontFamily:"var(--barc)", fontSize:10 }}>
                            <div style={{ color:"var(--muted)" }}>{l}</div>
                            <div style={{ fontWeight:700, color:"#c4b5fd" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {myFutPos&&(
                    <div style={{ background:"#7c3aed18", border:"1px solid #7c3aed44", padding:"10px", marginBottom:10 }}>
                      <div style={{ fontFamily:"var(--barc)", fontSize:10, fontWeight:700, color:"#c4b5fd", marginBottom:4 }}>OPEN POSITION</div>
                      <div style={{ fontFamily:"var(--barc)", fontSize:12, display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span>{myFutPos.side.toUpperCase()} {myFutPos.contracts}x @ {fmtPrice(selected,myFutPos.entryPrice)}</span>
                        {(()=>{
                          const cur=prices[selected]?.price||myFutPos.entryPrice;
                          const pnl=(cur-myFutPos.entryPrice)*spec.multiplier*myFutPos.contracts*(myFutPos.side==="long"?1:-1);
                          return <span style={{ color:pnl>=0?"var(--green)":"var(--red)", fontWeight:700 }}>{fmtUSD(pnl)}</span>;
                        })()}
                      </div>
                      <button className="btn btn-red" onClick={()=>closeFut(selected)} style={{ width:"100%", padding:"8px", fontSize:12 }}>CLOSE POSITION</button>
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                    {[{id:"buy",label:isFutures?"LONG ↑":"BUY"},{id:"sell",label:isFutures?"SHORT ↓":"SELL"}].map(o=>(
                      <button key={o.id} onClick={()=>setOrderType(o.id)}
                        style={{ padding:"10px", fontFamily:"var(--barc)", fontWeight:700, fontSize:13, border:`1px solid ${orderType===o.id?(o.id==="buy"?"var(--green)":"var(--red)"):"var(--border)"}`, background:orderType===o.id?(o.id==="buy"?"#00ff8720":"#ff3d5a20"):"var(--s2)", color:orderType===o.id?(o.id==="buy"?"var(--green)":"var(--red)"):"var(--muted)", cursor:"pointer", transition:"all .15s" }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {isFutures ? (
                    <div>
                      <div style={{ fontFamily:"var(--barc)", fontSize:10, fontWeight:700, color:"var(--muted)", marginBottom:6, letterSpacing:".07em" }}>CONTRACTS</div>
                      <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                        {["1","2","5","10"].map(c=>(
                          <span key={c} onClick={()=>setContracts(c)} style={{ flex:1, padding:"8px 4px", textAlign:"center", border:`1px solid ${contracts===c?"#7c3aed":"var(--border)"}`, cursor:"pointer", fontFamily:"var(--barc)", fontWeight:700, fontSize:13, color:contracts===c?"#c4b5fd":"var(--muted)", transition:"all .15s" }}>{c}</span>
                        ))}
                      </div>
                      <input className="input" type="number" value={contracts} onChange={e=>setContracts(e.target.value)} min="1" style={{ width:"100%", padding:"9px 12px", fontSize:14, fontFamily:"var(--bebas)", letterSpacing:1, marginBottom:8 }}/>
                      <div style={{ background:"var(--s2)", padding:"9px 12px", marginBottom:10, fontFamily:"var(--barc)", fontSize:11 }}>
                        {[["MARGIN REQ",fmtUSD(spec.margin*(parseInt(contracts)||1)),"#c4b5fd"],["$1 MOVE",fmtUSD(spec.multiplier*(parseInt(contracts)||1)),"var(--text)"],["CASH AFTER",fmtUSD(Math.max(0,portfolio.cash-spec.margin*(parseInt(contracts)||1))),portfolio.cash-spec.margin*(parseInt(contracts)||1)<0?"var(--red)":"var(--green)"]].map(([l,v,c])=>(
                          <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ color:"var(--muted)" }}>{l}</span><span style={{ fontWeight:700, color:c }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <button className={`btn ${orderType==="buy"?"btn-green":"btn-red"}`} onClick={executeFut} style={{ width:"100%", padding:"13px", fontSize:15 }}>
                        {orderType==="buy"?"LONG":"SHORT"} {contracts}x {selected}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily:"var(--barc)", fontSize:10, fontWeight:700, color:"var(--muted)", marginBottom:5, letterSpacing:".07em" }}>QUANTITY</div>
                      <input className="input" type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="0.00" style={{ width:"100%", padding:"10px 12px", fontSize:15, fontFamily:"var(--bebas)", letterSpacing:1 }}/>
                      {orderType==="buy"&&maxBuy>0&&(
                        <div style={{ display:"flex", gap:6, marginTop:6, marginBottom:8 }}>
                          {[0.25,0.5,1].map(f=>(
                            <span key={f} onClick={()=>setQty(fmt(maxBuy*f,4))} style={{ fontFamily:"var(--barc)", fontSize:11, color:"var(--muted)", cursor:"pointer", padding:"3px 8px", border:"1px solid var(--border)" }}>{f===1?"MAX":`${f*100}%`}</span>
                          ))}
                        </div>
                      )}
                      {qty&&parseFloat(qty)>0&&(
                        <div style={{ background:"var(--s2)", padding:"9px 12px", margin:"8px 0", fontFamily:"var(--barc)", fontSize:11 }}>
                          {[["TOTAL",fmtUSD(parseFloat(qty)*(prices[selected]?.price||0)),"var(--text)"],["CASH AFTER",fmtUSD(Math.max(0,portfolio.cash-(orderType==="buy"?parseFloat(qty)*(prices[selected]?.price||0):0))),portfolio.cash-parseFloat(qty)*(prices[selected]?.price||0)<0?"var(--red)":"var(--green)"]].map(([l,v,c])=>(
                            <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span style={{ color:"var(--muted)" }}>{l}</span><span style={{ fontWeight:700, color:c }}>{v}</span></div>
                          ))}
                        </div>
                      )}
                      <button className={`btn ${orderType==="buy"?"btn-green":"btn-red"}`} onClick={executeSpot} style={{ width:"100%", padding:"13px", fontSize:15, marginTop:4 }}>
                        {orderType==="buy"?"BUY":"SELL"} {selected}
                      </button>
                    </div>
                  )}
                  <div style={{ marginTop:10, fontFamily:"var(--barc)", fontSize:11, color:"var(--muted)", display:"flex", justifyContent:"space-between" }}>
                    <span>CASH</span><span style={{ color:"var(--text)", fontWeight:600 }}>{fmtUSD(portfolio.cash)}</span>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding:24, textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>👆</div>
                  <div style={{ fontFamily:"var(--barc)", fontWeight:700, color:"var(--muted)" }}>Select an asset to trade</div>
                  <div style={{ fontFamily:"var(--barc)", fontSize:12, color:"var(--muted)", marginTop:8 }}>Try ⚡ Futures tab for MNQ, MYM, MGC & more</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHART TAB ── */}
        {tab==="chart"&&(
          <div className="fade" style={{ padding:16 }}>
            <div style={{ display:"flex", gap:0, marginBottom:12, overflowX:"auto", paddingBottom:4 }}>
              {Object.keys(ASSET_CATEGORIES).map(c=>(
                <button key={c} onClick={()=>setCatTab(c)} style={{ padding:"6px 10px", background:catTab===c?"var(--s2)":"transparent", border:`1px solid ${catTab===c?"var(--border)":"transparent"}`, cursor:"pointer", fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:catTab===c?"var(--text)":"var(--muted)", whiteSpace:"nowrap", transition:"all .15s" }}>{c}</button>
              ))}
            </div>
            <CandleChart symbol={chartSym} prices={prices} />
            <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
              {ASSET_CATEGORIES[catTab].map(sym=>{
                const p=prices[sym]; const isFut=!!FUTURES_SPECS[sym]; const isSelected=chartSym===sym;
                return (
                  <div key={sym} onClick={()=>setChartSym(sym)} style={{ padding:"8px 10px", background:isSelected?"var(--s2)":"var(--s1)", border:`1px solid ${isSelected?"var(--gold)":"var(--border)"}`, cursor:"pointer", transition:"all .1s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                      <span style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:12 }}>{sym}</span>
                      {isFut&&<span className="fut-badge" style={{ fontSize:8, padding:"1px 3px" }}>F</span>}
                    </div>
                    <div style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:11, color:p?.pct>=0?"var(--green)":"var(--red)" }}>{fmtPct(p?.pct||0)}</div>
                    <div style={{ fontFamily:"var(--barc)", fontSize:10, color:"var(--muted)" }}>{fmtPriceShort(sym,p?.price)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PORTFOLIO TAB ── */}
        {tab==="portfolio"&&(
          <div className="fade" style={{ padding:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
              {[{label:"TOTAL VALUE",val:fmtUSD(totalValue),color:"var(--text)"},{label:"P&L",val:fmtUSD(totalGain),color:totalGain>=0?"var(--green)":"var(--red)"},{label:"RETURN",val:fmtPct(totalPct),color:totalGain>=0?"var(--green)":"var(--red)"}].map(({label,val,color})=>(
                <div key={label} className="card" style={{ padding:"14px 12px", textAlign:"center" }}>
                  <div style={{ fontFamily:"var(--barc)", fontSize:9, fontWeight:700, color:"var(--muted)", letterSpacing:".08em", marginBottom:4 }}>{label}</div>
                  <div style={{ fontFamily:"var(--bebas)", fontSize:20, letterSpacing:.5, color }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".07em", marginBottom:8 }}>SPOT POSITIONS</div>
            {Object.keys(portfolio.positions).length===0
              ? <div className="card" style={{ padding:14, textAlign:"center", color:"var(--muted)", fontSize:13, marginBottom:14 }}>No spot positions</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                  {Object.entries(portfolio.positions).map(([sym,pos])=>{
                    const cur=prices[sym]?.price||pos.avgPrice;
                    const pnl=(cur-pos.avgPrice)*pos.qty;
                    return (
                      <div key={sym} className="card" style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:14 }}>{sym}</div>
                          <div style={{ fontFamily:"var(--barc)", fontSize:11, color:"var(--muted)", marginTop:2 }}>{fmt(pos.qty,4)} @ {fmtPrice(sym,pos.avgPrice)}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"var(--barc)", fontWeight:700 }}>{fmtUSD(cur*pos.qty)}</div>
                          <div style={{ fontFamily:"var(--barc)", fontSize:12, color:pnl>=0?"var(--green)":"var(--red)" }}>{fmtUSD(pnl)} ({fmtPct(((cur-pos.avgPrice)/pos.avgPrice)*100)})</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
            <div style={{ fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"#c4b5fd", letterSpacing:".07em", marginBottom:8 }}>⚡ FUTURES POSITIONS</div>
            {Object.keys(portfolio.futures||{}).length===0
              ? <div className="card" style={{ padding:14, textAlign:"center", color:"var(--muted)", fontSize:13 }}>No futures positions</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {Object.entries(portfolio.futures).map(([sym,pos])=>{
                    const s=FUTURES_SPECS[sym];
                    const cur=prices[sym]?.price||pos.entryPrice;
                    const pnl=(cur-pos.entryPrice)*s.multiplier*pos.contracts*(pos.side==="long"?1:-1);
                    return (
                      <div key={sym} style={{ background:"#7c3aed12", border:"1px solid #7c3aed44", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:14 }}>{sym}</span>
                            <span style={{ fontFamily:"var(--barc)", fontSize:10, background:pos.side==="long"?"#00ff8720":"#ff3d5a20", border:`1px solid ${pos.side==="long"?"#00ff8740":"#ff3d5a40"}`, color:pos.side==="long"?"var(--green)":"var(--red)", padding:"2px 6px", fontWeight:700 }}>{pos.side.toUpperCase()}</span>
                          </div>
                          <div style={{ fontFamily:"var(--barc)", fontSize:11, color:"#c4b5fd", marginTop:2 }}>{pos.contracts}x · entry {fmtPrice(sym,pos.entryPrice)}</div>
                          <div style={{ fontFamily:"var(--barc)", fontSize:10, color:"var(--muted)", marginTop:1 }}>Margin: {fmtUSD(pos.margin)}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"var(--bebas)", fontSize:18, color:pnl>=0?"var(--green)":"var(--red)" }}>{fmtUSD(pnl)}</div>
                          <div style={{ fontFamily:"var(--barc)", fontSize:12, color:pnl>=0?"var(--green)":"var(--red)" }}>{fmtPct((pnl/pos.margin)*100)}</div>
                          <button className="btn btn-outline" onClick={()=>closeFut(sym)} style={{ marginTop:6, padding:"4px 10px", fontSize:11, borderColor:"var(--red)", color:"var(--red)" }}>CLOSE</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
            <div style={{ marginTop:12, fontFamily:"var(--barc)", fontSize:12, color:"var(--muted)" }}>
              Cash: <span style={{ color:"var(--text)", fontWeight:600 }}>{fmtUSD(portfolio.cash)}</span>
              <span style={{ margin:"0 8px" }}>·</span>
              Futures P&L: <span style={{ color:futPnl>=0?"var(--green)":"var(--red)", fontWeight:600 }}>{fmtUSD(futPnl)}</span>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab==="leaderboard"&&(
          <div className="fade" style={{ padding:16 }}>
            <div style={{ marginBottom:14, fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".07em" }}>LIVE RANKINGS · {room.name.toUpperCase()}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {fullBoard.map((p,i)=>{
                const isMe=p.name===username;
                return (
                  <div key={p.name} className="card" style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:14, border:isMe?"1px solid var(--gold)":undefined, background:isMe?"#ffd70008":undefined }}>
                    <div style={{ fontFamily:"var(--bebas)", fontSize:28, width:32, textAlign:"center" }} className={i===0?"rank1":i===1?"rank2":i===2?"rank3":""}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:14, display:"flex", gap:8, alignItems:"center" }}>
                        {p.name} {isMe&&<span style={{ fontFamily:"var(--barc)", fontSize:10, background:"var(--gold)", color:"#07090d", padding:"1px 6px", fontWeight:700 }}>YOU</span>}
                      </div>
                      <div style={{ fontFamily:"var(--barc)", fontSize:11, color:"var(--muted)", marginTop:2 }}>{p.trades} trades</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"var(--bebas)", fontSize:18, color:p.gain>=0?"var(--green)":"var(--red)" }}>{fmtUSD(p.cash)}</div>
                      <div style={{ fontFamily:"var(--barc)", fontSize:12, color:p.gain>=0?"var(--green)":"var(--red)" }}>{fmtPct(p.pct)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab==="history"&&(
          <div className="fade" style={{ padding:16 }}>
            <div style={{ marginBottom:14, fontFamily:"var(--barc)", fontSize:11, fontWeight:700, color:"var(--muted)", letterSpacing:".07em" }}>TRADE HISTORY</div>
            {portfolio.trades.length===0
              ? <div className="card" style={{ padding:24, textAlign:"center", color:"var(--muted)" }}>No trades yet</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {portfolio.trades.map(t=>(
                    <div key={t.id} className="card" style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span className={t.side.includes("LONG")||t.side==="BUY"?"pill-green":"pill-red"} style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:10, padding:"3px 7px" }}>{t.side}</span>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontFamily:"var(--barc)", fontWeight:700, fontSize:14 }}>{t.sym}</span>
                            {t.type==="futures"&&<span className="fut-badge">FUT</span>}
                          </div>
                          <div style={{ fontFamily:"var(--barc)", fontSize:11, color:"var(--muted)" }}>{new Date(t.time).toLocaleTimeString()}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"var(--barc)", fontWeight:700 }}>{fmt(t.qty,t.type==="futures"?0:4)} {t.type==="futures"?"ct":"units"} @ {fmtPrice(t.sym,t.price)}</div>
                        {t.pnl!=null&&<div style={{ fontFamily:"var(--barc)", fontSize:12, color:t.pnl>=0?"var(--green)":"var(--red)", fontWeight:700 }}>P&L: {fmtUSD(t.pnl)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────
export default function App() {
  const prices = useLivePrices();
  const [screen,setScreen]=useState("lobby");
  const [activeRoom,setActiveRoom]=useState(null);
  const [username,setUsername]=useState("");
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}>
      <style>{STYLES}</style>
      {screen!=="battle"&&(
        <>
          <div style={{ background:"var(--s1)", borderBottom:"1px solid var(--border)", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontFamily:"var(--bebas)", fontSize:22, letterSpacing:2 }}>TRADE<span style={{ color:"var(--gold)" }}>BATTLE</span></div>
            <div style={{ display:"flex", gap:10 }}>
              {["lobby","create"].map(s=>(
                <button key={s} className="btn-outline" onClick={()=>setScreen(s)} style={{ padding:"6px 14px", fontSize:12, borderColor:screen===s?"var(--gold)":undefined, color:screen===s?"var(--gold)":undefined }}>
                  {s==="lobby"?"🏟 LOBBY":"+ CREATE"}
                </button>
              ))}
            </div>
          </div>
          <Ticker prices={prices}/>
        </>
      )}
      <div style={{ maxHeight:screen==="battle"?"100vh":"calc(100vh - 74px)", overflowY:"auto" }}>
        {screen==="lobby"&&<Lobby prices={prices} onJoin={r=>{setActiveRoom(r);setScreen("battle");}} onCreate={()=>setScreen("create")} username={username} setUsername={setUsername}/>}
        {screen==="create"&&<CreateRoom onCreate={r=>{setActiveRoom(r);setScreen("battle");}} username={username||"You"}/>}
        {screen==="battle"&&activeRoom&&<BattleRoom room={activeRoom} username={username||"You"} prices={prices} onLeave={()=>setScreen("lobby")}/>}
      </div>
    </div>
  );
}
