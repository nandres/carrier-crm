// Generates the floor and window light procedurally, in a real canvas,
// so every material is a rendered image and not a CSS imitation of one.
// Run: node scripts/generate-materials.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = 'public/materials';
mkdirSync(OUT, { recursive: true });
const PORT = 9556;
const profile = join(tmpdir(), 'carrier-materials-' + Date.now());
const chrome = spawn(
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'about:blank'],
  { stdio: 'ignore' },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 80 && !target; i++) {
  await sleep(250);
  try {
    target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page');
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id) pending.get(m.id)?.(m);
};
const run = (expression) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (m) => (m.result?.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value)));
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }));
  });
const save = async (name, source) => {
  const url = await run(source);
  writeFileSync(join(OUT, name), Buffer.from(url.split(',')[1], 'base64'));
  console.log(name, Math.round(url.length * 0.75 / 1024) + ' KB');
};

const RANDOM = `let s=20261104;const r=()=>(s=(s*16807)%2147483647)/2147483647;`;

await save('terrazzo.webp', `(()=>{${RANDOM}
const S=2048,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');
x.fillStyle='#d6d9d6';x.fillRect(0,0,S,S);
const pick=(l)=>l[Math.floor(r()*l.length)];
const stone=['#e9ece7','#f4f5f1','#dfe3de','#b7bfba','#a5aeaa','#8d9794','#6f7a78','#59635f','#c4c9c2','#ffffff'];
const warm=['#b49a78','#a88a5f','#8f7a63','#c2ad8d'];
const chip=(cx,cy,size,col)=>{const n=4+Math.floor(r()*4),a0=r()*6.28;x.fillStyle=col;
 for(const dx of [-S,0,S])for(const dy of [-S,0,S]){if(cx+dx<-60||cx+dx>S+60||cy+dy<-60||cy+dy>S+60)continue;
  x.beginPath();for(let k=0;k<n;k++){const a=a0+k/n*6.283+(r()-.5)*.7,d=size*(.5+r()*.6);const px=cx+dx+Math.cos(a)*d,py=cy+dy+Math.sin(a)*d;k?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();x.fill();}};
for(let i=0;i<26000;i++)chip(r()*S,r()*S,.8+r()*2.4,pick(stone));
for(let i=0;i<5200;i++)chip(r()*S,r()*S,1.8+r()*3.2,r()<.05?pick(warm):pick(stone));
for(let i=0;i<260;i++)chip(r()*S,r()*S,5+r()*6,r()<.07?pick(warm):pick(stone));
return c.toDataURL('image/webp',.8);})()`);

await save('window-light.webp', `(()=>{const W=2400,H=1500,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
x.fillStyle='rgba(36,36,36,.065)';x.fillRect(0,0,W,H);
const panes=(ctx)=>{ctx.save();ctx.translate(W*.04,-H*.04);ctx.transform(1,0,-.46,1,0,0);
 for(let col=0;col<5;col++)for(let row=0;row<3;row++){ctx.fillRect(330+col*470,70+row*500,436,466);}ctx.restore();};
x.globalCompositeOperation='destination-out';x.filter='blur(5px)';x.fillStyle='#000';panes(x);
x.globalCompositeOperation='source-over';x.filter='blur(5px)';x.fillStyle='rgba(255,255,255,.5)';panes(x);
return c.toDataURL('image/webp',.88);})()`);

ws.close();
chrome.kill();
await sleep(400);
try {
  rmSync(profile, { recursive: true, force: true });
} catch {}
process.exit(0);
