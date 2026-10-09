(function(){
'use strict';const NS='http://www.w3.org/2000/svg',bindings=new WeakMap();
const el=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
class WorldMap {
 static bind(surface,type,handler,options){let map=bindings.get(surface);if(!map){map=new Map();bindings.set(surface,map);}const previous=map.get(type);if(previous)surface.removeEventListener?.(type,previous);map.set(type,handler);surface.addEventListener(type,handler,options);}
 static clientPoint(svg,width,height,event){const r=svg.getBoundingClientRect(),scale=Math.min(r.width/width,r.height/height);if(!(scale>0))return {x:width/2,y:height/2};const cx=Number.isFinite(event.clientX)?event.clientX:r.left+r.width/2,cy=Number.isFinite(event.clientY)?event.clientY:r.top+r.height/2;return {x:(cx-r.left-(r.width-width*scale)/2)/scale,y:(cy-r.top-(r.height-height*scale)/2)/scale};}
 static wheelFactor(event,pageHeight){if(!Number.isFinite(event.deltaY)||event.deltaY===0)return null;const unit=event.deltaMode===1?16:event.deltaMode===2?Math.max(1,pageHeight):1,delta=Math.max(-240,Math.min(240,event.deltaY*unit));return Math.exp(-delta*(event.ctrlKey?.006:.002));}
 static bindPan(owner,{surface,svg,width,height,pick}){
  WorldMap.bind(surface,'selectstart',e=>e.preventDefault());WorldMap.bind(surface,'dragstart',e=>e.preventDefault());
  WorldMap.bind(surface,'pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();if(owner.drag){owner.drag.moved=true;return;}const p=WorldMap.clientPoint(svg,width(),height(),e);owner.drag={id:e.pointerId,x:p.x,y:p.y,clientX:e.clientX,clientY:e.clientY,startX:owner.x,startY:owner.y,moved:false,pick:pick(e.target)};surface.setPointerCapture?.(e.pointerId);});
  WorldMap.bind(surface,'pointermove',e=>{if(!owner.drag||e.pointerId!==owner.drag.id)return;const p=WorldMap.clientPoint(svg,width(),height(),e),dx=p.x-owner.drag.x,dy=p.y-owner.drag.y;if(Math.hypot(e.clientX-owner.drag.clientX,e.clientY-owner.drag.clientY)>4)owner.drag.moved=true;if(owner.drag.moved){e.preventDefault();owner.x=owner.drag.startX+dx;owner.y=owner.drag.startY+dy;owner.draw();}});
  const end=(e,cancel=false)=>{const drag=owner.drag;if(!drag||e.pointerId!==drag.id)return;owner.drag=null;try{surface.releasePointerCapture?.(e.pointerId);}catch{}if(cancel||drag.moved||(Number.isFinite(e.clientX)&&Number.isFinite(e.clientY)&&Math.hypot(e.clientX-drag.clientX,e.clientY-drag.clientY)>4)){owner.suppressUntil=performance.now()+180;return;}if(drag.pick!==null&&drag.pick!==undefined){owner.suppressUntil=performance.now()+180;owner.pickFromPointer(drag.pick);}};
  WorldMap.bind(surface,'pointerup',e=>end(e));WorldMap.bind(surface,'pointercancel',e=>end(e,true));WorldMap.bind(surface,'lostpointercapture',e=>{if(owner.drag?.id===e.pointerId){owner.drag=null;owner.suppressUntil=performance.now()+180;}});
 }
 static rebaseDrag(owner,point,event){if(!owner.drag)return;owner.drag.x=point.x;owner.drag.y=point.y;owner.drag.clientX=event.clientX;owner.drag.clientY=event.clientY;owner.drag.startX=owner.x;owner.drag.startY=owner.y;owner.drag.moved=true;}
 constructor({svg,surface,countries,onSelect,onHover,maxZoom=32}){
  this.svg=svg;this.surface=surface;this.onSelect=onSelect;this.onHover=onHover;this.maxZoom=Number.isFinite(maxZoom)?Math.max(1,maxZoom):32;this.zoom=1;this.x=0;this.y=0;this.paths=new Map();this.drag=null;this.suppressUntil=0;
  svg.setAttribute('viewBox','0 0 1000 500');this.land=el('g');this.land.append(el('path',{d:window.WORLD_MAP_DATA.basePath,class:'world-context','fill-rule':'evenodd'}));
  const names=new Map(countries.map(c=>[c.code,c.name]));for(const f of window.WORLD_MAP_DATA.countries){if(!names.has(f.code))continue;const p=el('path',{d:f.path,class:'world-country','fill-rule':'evenodd',role:'button',tabindex:'0','aria-label':names.get(f.code),'data-country':f.code});const title=el('title');title.textContent=names.get(f.code);p.append(title);p.addEventListener('click',()=>{if(performance.now()>=this.suppressUntil)onSelect(f.code);});p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(f.code);}});p.addEventListener('pointerenter',()=>onHover?.(names.get(f.code)));p.addEventListener('focus',()=>onHover?.(names.get(f.code)));this.paths.set(f.code,p);this.land.append(p);}window.CityDisputes?.world(this.land,onHover);svg.replaceChildren(this.land);
  WorldMap.bindPan(this,{surface,svg,width:()=>1000,height:()=>500,pick:target=>target.closest?.('[data-country]')?.getAttribute('data-country')??null});
 }
 pickFromPointer(code){if(this.paths.has(code))this.onSelect(code);}
 draw(){this.land.setAttribute('transform',`translate(${500+this.x} ${250+this.y}) scale(${this.zoom}) translate(-500 -250)`);}
 zoomBy(factor,anchor=null){if(!Number.isFinite(factor)||factor<=0)return;const next=Math.max(1,Math.min(this.maxZoom,this.zoom*factor));if(next===this.zoom)return;const ratio=next/this.zoom;this.x=anchor?(anchor.x-500)-(anchor.x-500-this.x)*ratio:this.x*ratio;this.y=anchor?(anchor.y-250)-(anchor.y-250-this.y)*ratio:this.y*ratio;this.zoom=next;if(next===1&&!anchor){this.x=0;this.y=0;}this.draw();}
 cancelGesture(){const drag=this.drag;if(!drag)return;this.drag=null;this.suppressUntil=performance.now()+180;try{this.surface.releasePointerCapture?.(drag.id);}catch{}}
 reset(){this.cancelGesture();this.zoom=1;this.x=0;this.y=0;this.draw();}
 select(code){for(const[c,p]of this.paths){p.classList.toggle('selected',c===code);p.setAttribute('aria-pressed',String(c===code));}}
}
window.CityWorldMap=WorldMap;
})();
