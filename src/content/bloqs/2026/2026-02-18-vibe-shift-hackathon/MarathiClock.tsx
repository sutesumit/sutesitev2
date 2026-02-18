"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";

const MARATHI_CHARS = [
  'अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','क','ख','ग','घ','ङ','च','छ','ज','झ','ञ',
  'ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श',
  'ष','स','ह','ळ','ऋ','क्ष','ज्ञ','श्र','त्र','दृ'
];

const DIGITS = {
  '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  '3': [[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[0,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]],
  '4': [[0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
  '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '6': [[0,0,1,1,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
  '8': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '9': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,1,1,0,0]],
  ':': [[0,1,0],[0,1,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0],[0,1,0]],
};

const BASE_CELL = 20;
const N = 320;

function getTimeString() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}

function buildTargets(timeStr, cell, W, H) {
  const chars = timeStr.split('');
  const widths = chars.map(c => (DIGITS[c]?.[0]?.length ?? 5));
  const totalCols = (widths.reduce((a,b)=>a+b,0) + (chars.length-1)*2);
  const totalW = totalCols * cell;
  const startX = (W - totalW) / 2, startY = (H - 7*cell) / 2;
  const pts = [];
  let ox = 0;
  for (const ch of chars) {
    const grid = DIGITS[ch];
    if (!grid) { ox += 7*cell; continue; }
    const cols = grid[0].length;
    for (let r=0;r<7;r++) for (let c=0;c<cols;c++)
      if (grid[r][c]) pts.push({ x: startX+ox+c*cell+cell/2, y: startY+r*cell+cell/2 });
    ox += (cols+2)*cell;
  }
  return pts;
}

function makeParticle(x, y, char, W, H, isTarget, cellScale) {
  return {
    x, y, vx:(Math.random()-.5)*5, vy:(Math.random()-.5)*5,
    char, tx:x, ty:y, isTarget: !!isTarget,
    jig:Math.random()*Math.PI*2, jigSpd:.04+Math.random()*.06, jigAmp:1.2+Math.random()*2,
    wing:Math.random()*Math.PI*2, wingSpd:.06+Math.random()*.09,
    size: (isTarget ? 9+Math.random()*4 : 6+Math.random()*3) * cellScale,
    hue:210+Math.random()*30, sat:8+Math.random()*10,
    bri: isTarget ? 8+Math.random()*12 : 30+Math.random()*25,
    alpha: isTarget ? .82+Math.random()*.18 : .25+Math.random()*.3,
    trail:[], W, H
  };
}

function updateParticle(p, all, phase, mx, my) {
  p.jig+=p.jigSpd; p.wing+=p.wingSpd;
  p.trail.push({x:p.x,y:p.y});
  if(p.trail.length>5) p.trail.shift();
  if(phase==='swarm'){
    let sx=0,sy=0,ax=0,ay=0,cx=0,cy=0,n=0;
    for(const b of all){
      if(b===p) continue;
      const dx=p.x-b.x,dy=p.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<75&&d>0){
        if(d<28){sx+=dx/d*(28-d)/28;sy+=dy/d*(28-d)/28;}
        ax+=b.vx;ay+=b.vy;cx+=b.x;cy+=b.y;n++;
      }
    }
    if(n){ax/=n;ay/=n;cx=cx/n-p.x;cy=cy/n-p.y;
      p.vx+=sx*.18+ax*.04+cx*.004;
      p.vy+=sy*.18+ay*.04+cy*.004;}
    p.vx+=(mx-p.x)*.0004;p.vy+=(my-p.y)*.0004;
    const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
    if(spd>4){p.vx=p.vx/spd*4;p.vy=p.vy/spd*4;}
    p.vx*=.97;p.vy*=.97;
    if(p.x<-30)p.x=p.W+30;if(p.x>p.W+30)p.x=-30;
    if(p.y<-30)p.y=p.H+30;if(p.y>p.H+30)p.y=-30;
  } else if(phase==='form'){
    p.vx+=(p.tx-p.x)*.09;p.vy+=(p.ty-p.y)*.09;
    p.vx*=.82;p.vy*=.82;
  } else {
    p.vx+=(p.tx-p.x)*.14;p.vy+=(p.ty-p.y)*.14;
    p.vx+=Math.sin(p.jig)*p.jigAmp*.12;
    p.vy+=Math.cos(p.jig*.87)*p.jigAmp*.12;
    p.vx*=.80;p.vy*=.80;
  }
  p.x+=p.vx;p.y+=p.vy;
}

function drawParticle(ctx, p, phase, isDark) {
  if(phase==='swarm'&&p.trail.length>1){
    ctx.save();
    for(let i=1;i<p.trail.length;i++){
      const t=i/p.trail.length;
      ctx.beginPath();
      // Adjust alpha and brightness for trail
      const trailAlpha = isDark ? t*.15 : t*.08;
      const trailBri = isDark ? p.bri + 40 : p.bri;
      ctx.strokeStyle=`hsla(${p.hue},${p.sat}%,${trailBri}%,${trailAlpha})`;
      ctx.lineWidth=t*1.0;
      ctx.moveTo(p.trail[i-1].x,p.trail[i-1].y);
      ctx.lineTo(p.trail[i].x,p.trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }
  const bob = phase==='swarm' ? Math.sin(p.wing)*2 : (p.isTarget ? Math.sin(p.wing)*.6 : Math.sin(p.wing)*2);
  const ang=Math.atan2(p.vy,p.vx);
  const displayAlpha = (phase!=='swarm' && p.isTarget) ? Math.min(1, p.alpha*1.3) : p.alpha;
  
  // Theme-aware brightness adjustment
  let displayBri = (phase!=='swarm' && p.isTarget) ? p.bri : (phase!=='swarm' ? p.bri+20 : p.bri);
  if (isDark) {
    displayBri = 100 - displayBri; // Invert or shift brightness for dark mode
    if (p.isTarget) displayBri = Math.max(70, displayBri + 40);
    else displayBri = Math.max(40, displayBri + 20);
  }

  const displaySize = (phase==='rest' && p.isTarget) ? p.size*1.1 : p.size;
  ctx.save();
  ctx.globalAlpha=displayAlpha;
  ctx.translate(p.x,p.y+bob);
  ctx.rotate(ang*.25);
  ctx.font=`${displaySize}px serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=`hsl(${p.hue},${p.sat}%,${displayBri}%)`;
  ctx.fillText(p.char,0,0);
  ctx.restore();
}

export default function App() {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({x:400,y:300});
  const stateRef = useRef({particles:[],phase:'swarm',timer:0,raf:null});
  const sizeRef = useRef({w:0, h:0, cell: BASE_CELL});
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);
  
  const [displayTime, setDisplayTime] = useState(getTimeString());
  const [phaseText, setPhaseText] = useState('उडताना…');

  const start = useCallback((t, W, H) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive cell size: roughly 32 cols total. 
    const cell = Math.min(BASE_CELL, Math.floor((W * 0.9) / 32));
    sizeRef.current = { w: W, h: H, cell };

    const targets = buildTargets(t, cell, W, H);
    const expandedTargets = [];
    const repeats = Math.ceil(N / Math.max(targets.length, 1));
    for(let r=0;r<repeats;r++) for(const tgt of targets) expandedTargets.push(tgt);
    
    const cellScale = cell / BASE_CELL;
    const particles = Array.from({length:N}, (_,i) => {
      const hasTgt = i < expandedTargets.length;
      const p = makeParticle(
        Math.random()*W, Math.random()*H,
        MARATHI_CHARS[Math.floor(Math.random()*MARATHI_CHARS.length)],
        W, H, hasTgt, cellScale
      );
      if(hasTgt){
        p.tx=expandedTargets[i].x+(Math.random()-.5)*(6 * cellScale);
        p.ty=expandedTargets[i].y+(Math.random()-.5)*(6 * cellScale);
      }
      return p;
    });

    const s = stateRef.current;
    if(s.raf) cancelAnimationFrame(s.raf);
    s.particles=particles; s.phase='swarm'; s.timer=0;
    setPhaseText('उडताना…');
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const LABELS = {swarm:'उडताना…',form:'रचताना…',rest:'विराम ✦'};
    const loop = () => {
      s.timer++;
      if(s.phase==='swarm'&&s.timer>110){s.phase='form';s.timer=0;setPhaseText(LABELS.form);}
      else if(s.phase==='form'&&s.timer>160){s.phase='rest';s.timer=0;setPhaseText(LABELS.rest);}
      ctx.clearRect(0,0,W,H);
      if(s.phase==='swarm'){
        ctx.save();
        const lineColor = isDarkRef.current ? `255,255,255` : `0,0,0`;
        const lineAlpha = isDarkRef.current ? .06 : .03;
        for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
          const a=particles[i],b=particles[j];
          const dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<52){
            ctx.beginPath();
            ctx.strokeStyle=`rgba(${lineColor},${(1-d/52)*lineAlpha})`;
            ctx.lineWidth=.3;
            ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
      for(const p of s.particles){
        updateParticle(p,s.particles,s.phase,mouseRef.current.x,mouseRef.current.y);
        drawParticle(ctx,p,s.phase,isDarkRef.current);
      }
      s.raf = requestAnimationFrame(loop);
    };
    loop();
  }, []);

  const refresh = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (w === 0) return;
    const t = getTimeString();
    setDisplayTime(t);
    start(t, w, h);
  }, [start]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimeout;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      
      const { width, height } = entry.contentRect;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const t = getTimeString();
        setDisplayTime(t);
        start(t, width, height);
      }, 100);
    });

    observer.observe(container);

    const iv = setInterval(() => {
      const nt = getTimeString();
      const currentT = getTimeString(); 
      if (nt !== displayTime) {
         setDisplayTime(nt);
         const { w, h } = sizeRef.current;
         if (w > 0) start(nt, w, h);
      }
    }, 10000);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
      clearInterval(iv);
      if(stateRef.current.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, [start, displayTime]);

  return (
    <div ref={containerRef} style={{width:'100%',height:'60vh',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative',userSelect:'none'}}>
      <style>{`
        @keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        .rbtn:hover{opacity:.5;}
        .rbtn:active{transform:scale(.95);}
      `}</style>

      <div style={{position:'absolute',top:18,left:0,right:0,textAlign:'center',color:isDark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.22)',fontSize:10,letterSpacing:5,fontWeight:400,zIndex:2,fontFamily:'serif'}}>
        मराठी अक्षर घड्याळ &nbsp;·&nbsp; <span style={{opacity:.55,fontSize:9}}>{phaseText}</span>
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={e=>{
          const r=canvasRef.current?.getBoundingClientRect();
          if(r) mouseRef.current={x:e.clientX-r.left,y:e.clientY-r.top};
        }}
        style={{position:'absolute', inset:0, width:'100%', height:'100%', cursor:'crosshair'}}
      />

      <div style={{position:'absolute',bottom:24,left:0,right:0,display:'flex',flexDirection:'column',alignItems:'center',gap:10,zIndex:10}}>
        <div style={{color:isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',fontSize:10,letterSpacing:7,fontFamily:'serif',animation:'floatY 4s ease-in-out infinite'}}>
          {displayTime}
        </div>
        <button
          className="rbtn"
          onClick={refresh}
          style={{background:'transparent',border:isDark ? '1px solid rgba(255,255,255,.2)' : '1px solid rgba(0,0,0,.12)',borderRadius:999,color:isDark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.3)',padding:'7px 26px',fontSize:10,letterSpacing:3,cursor:'pointer',transition:'opacity .2s ease',fontFamily:'serif',fontWeight:400}}
        >
          ↺&nbsp;पुन्हा|Repeat&nbsp;↺
        </button>
        <div style={{color:isDark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.12)',fontSize:9,letterSpacing:2,fontFamily:'serif'}}>move cursor · guide the flock</div>
      </div>
    </div>
  );
}
