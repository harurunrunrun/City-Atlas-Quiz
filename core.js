(function(root){
  'use strict';
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const nameKey=x=>x.normalize('NFKC').trim().toLocaleLowerCase('en');
  const cityKey=c=>[(c.native||c.en),c.en].map(nameKey).join('|');
  const spaces=new WeakMap(),mapProjections=new WeakMap();
  function chord(a,b){return Math.max(0,2-2*(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));}
  function countrySpace(country){if(spaces.has(country))return spaces.get(country);let projection;if(country.geometry)projection=projectCountry(country.geometry,country.cities,260,260);else{const ls=country.cities.map(c=>(c.lng+360)%360).sort((a,b)=>a-b);let gap=-1,start=0;for(let i=0;i<ls.length;i++){const next=i===ls.length-1?ls[0]+360:ls[i+1];if(next-ls[i]>gap){gap=next-ls[i];start=next%360;}}const center=start+(360-gap)/2,lats=country.cities.map(c=>c.lat),cos=Math.max(.15,Math.cos((Math.min(...lats)+Math.max(...lats))/2*Math.PI/180));projection={points:country.cities.map(c=>{let x=(c.lng+360)%360;while(x-center>180)x-=360;while(x-center< -180)x+=360;return [x*cos,-c.lat];})};}
    const records=country.cities.map((city,i)=>{const lat=city.lat*Math.PI/180,lng=city.lng*Math.PI/180;return {city,p:projection.points[i],v:[Math.cos(lat)*Math.cos(lng),Math.cos(lat)*Math.sin(lng),Math.sin(lat)],key:cityKey(city),nativeKey:nameKey(city.native||city.en),englishKey:nameKey(city.en)};}),byId=new Map(records.map(r=>[r.city.id,r]));let far=records[0];for(const r of records)if(chord(records[0].v,r.v)>chord(records[0].v,far.v))far=r;let diam2=0;for(const r of records)diam2=Math.max(diam2,chord(far.v,r.v));const diameter=6371*2*Math.asin(Math.min(1,Math.sqrt(diam2)/2)),spacingKm=Math.min(200,Math.max(Math.min(1.5,diameter*.1),diameter*.06));const value={records,byId,spacingKm,threshold:2-2*Math.cos(spacingKm/6371)};spaces.set(country,value);return value;}
  function quartetQuality(records){let min=Infinity,x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const r of records){x0=Math.min(x0,r.p[0]);x1=Math.max(x1,r.p[0]);y0=Math.min(y0,r.p[1]);y1=Math.max(y1,r.p[1]);}for(let i=0;i<records.length;i++)for(let j=i+1;j<records.length;j++)min=Math.min(min,Math.hypot(records[i].p[0]-records[j].p[0],records[i].p[1]-records[j].p[1]));return min*196/Math.max(.0000001,x1-x0,y1-y0);}
  function questionFor(country,target,rng){
    const space=countrySpace(country),t=space.byId.get(target.id),all=shuffled(space.records.filter(r=>r.city.id!==target.id&&r.nativeKey!==t.nativeKey&&r.englishKey!==t.englishKey),rng),sample=all.slice(0,120);let best=null,bestScore=-1;
    const unique=(r,chosen)=>chosen.every(a=>a.nativeKey!==r.nativeKey&&a.englishKey!==r.englishKey&&chord(a.v,r.v)>1e-14);
    const consider=chosen=>{if(chosen.length!==4)return false;const score=quartetQuality(chosen);if(score>bestScore){best=chosen;bestScore=score;}return score>=48;};
    for(let attempt=0;attempt<16;attempt++){const chosen=[t];for(let step=0;step<3;step++){const eligible=sample.filter(r=>unique(r,chosen)&&chosen.every(a=>chord(a.v,r.v)>=space.threshold));if(!eligible.length)break;chosen.push(eligible[Math.floor(rng()*eligible.length)]);}if(consider(chosen))break;}
    if(bestScore<48){const seeds=all.slice().sort((a,b)=>Math.hypot(b.p[0]-t.p[0],b.p[1]-t.p[1])-Math.hypot(a.p[0]-t.p[0],a.p[1]-t.p[1])).slice(0,12);for(const seed of seeds){const chosen=[t,seed];while(chosen.length<4){let next=null,score=-1;for(const r of all){if(!unique(r,chosen))continue;const dist=Math.min(...chosen.map(a=>Math.hypot(a.p[0]-r.p[0],a.p[1]-r.p[1])));if(dist>score){next=r;score=dist;}}if(!next)break;chosen.push(next);}consider(chosen);if(bestScore>=48)break;}}
    if(!best)throw new Error('Country needs four distinguishable place locations');
    const cities=shuffled(best.map(r=>r.city),rng);return {country,cities,targetIndex:cities.findIndex(c=>c.id===target.id),spacing:{minimumAt260:bestScore,desiredKm:space.spacingKm,constrained:bestScore<40}};
  }
  function questionProjection(country,cities,width,height){let cached=mapProjections.get(country);if(!cached||cached.width!==width||cached.height!==height){const base=projectCountry(country.geometry,country.cities,width,height);let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const p of [...base.paths.flat(),...base.points]){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}const padding=Math.min(width,height)*.1,scale=Math.min(1,(width-padding*2)/Math.max(.000001,x1-x0),(height-padding*2)/Math.max(.000001,y1-y0)),countryCamera={zoom:scale,panX:(width/2-(x0+x1)/2)*scale,panY:(height/2-(y0+y1)/2)*scale};cached={width,height,base,countryCamera,byId:new Map(country.cities.map((c,i)=>[c.id,base.points[i]]))};mapProjections.set(country,cached);}const base=cached.base,points=cities.map(c=>cached.byId.get(c.id)||base.toPoint([c.lng,c.lat])),countryBase={...base,points};let min=Infinity;for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)min=Math.min(min,Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1]));if(min>=44)return {...base,points,focused:false,minimumSeparation:min,countryBase,countryCamera:cached.countryCamera,questionCamera:{zoom:1,panX:0,panY:0},maximumZoom:16};
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),scale=Math.max(1,Math.min((width-64)/Math.max(.000001,x1-x0),(height-64)/Math.max(.000001,y1-y0))),cx=(x0+x1)/2,cy=(y0+y1)/2,transform=p=>[(p[0]-cx)*scale+width/2,(p[1]-cy)*scale+height/2],questionCamera={zoom:scale,panX:(width/2-cx)*scale,panY:(height/2-cy)*scale};return {...base,paths:base.paths.map(r=>r.map(transform)),points:points.map(transform),toPoint:p=>transform(base.toPoint(p)),focused:true,minimumSeparation:min*scale,countryBase,countryCamera:cached.countryCamera,questionCamera,maximumZoom:Math.max(16,scale*16)};
  }
  class Game {
    constructor(countries,{rng=Math.random,best=0}={}){
      this.countries=countries.filter(c=>c.cities.length>=4); if(!this.countries.length)throw new Error('No eligible countries');
      this.rng=rng;this.best=Number.isSafeInteger(best)&&best>=0?best:0;this.streak=0;this.round=0;this.phase='ready';this.finalStreak=0;
    }
    draw(){
      const country=this.countries[Math.floor(this.rng()*this.countries.length)];
      const target=country.cities[Math.floor(this.rng()*country.cities.length)];
      this.question=questionFor(country,target,this.rng);
      this.round++;this.phase='question';this.selected=null;return this.question;
    }
    start(){if(this.phase!=='ready'&&this.phase!=='ended')return false;this.streak=0;this.finalStreak=0;this.round=0;this.draw();return true;}
    answer(index){
      if(this.phase!=='question'||!Number.isInteger(index)||index<0||index>3)return {accepted:false};
      this.selected=index; const correct=index===this.question.targetIndex;
      if(correct){this.streak++;this.best=Math.max(this.best,this.streak);this.phase='correct';}
      else{this.finalStreak=this.streak;this.streak=0;this.phase='ended';}
      return {accepted:true,correct,streak:this.streak,finalStreak:this.finalStreak,best:this.best};
    }
    next(){if(this.phase!=='correct')return false;this.draw();return true;}
  }
  function shuffled(items,rng=Math.random){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  class StudyGame {
    constructor(country, {rng=Math.random,targetIds=null,saved=null}={}) {
      this.country=country;this.rng=rng;this.ids=shuffled(targetIds||country.cities.map(c=>c.id),rng);this.answered=0;this.correctCount=0;this.phase=this.ids.length?'ready':'empty';this.question=null;this.selected=null;this.lastCorrect=null;
      if(saved&&Array.isArray(saved.ids)&&saved.ids.length&&new Set(saved.ids).size===saved.ids.length&&saved.ids.every(id=>country.cities.some(c=>c.id===id))&&Number.isInteger(saved.answered)&&saved.answered>=0&&saved.answered<=saved.ids.length&&Number.isInteger(saved.correctCount)&&saved.correctCount>=0&&saved.correctCount<=saved.answered&&['question','correct','incorrect','complete'].includes(saved.phase)){
        const cities=Array.isArray(saved.cityIds)?saved.cityIds.map(id=>country.cities.find(c=>c.id===id)):[];
        const targetId=saved.ids[saved.answered-(saved.phase==='question'?0:1)];const targetIndex=cities.findIndex(c=>c&&c.id===targetId);
        const fullPoolOK=targetIds!==null||saved.ids.length===country.cities.length||(country.previousPools||[]).some(pool=>pool.length===saved.ids.length&&saved.ids.every(id=>pool.includes(id)));
        const resultOK=saved.phase==='question' ? saved.selected===null&&saved.lastCorrect===null : Number.isInteger(saved.selected)&&saved.selected>=0&&saved.selected<4&&typeof saved.lastCorrect==='boolean'&&saved.lastCorrect===(saved.selected===targetIndex)&&(saved.phase!=='correct'||saved.lastCorrect)&&(saved.phase!=='incorrect'||!saved.lastCorrect)&&(saved.lastCorrect?saved.correctCount>=1:saved.correctCount<saved.answered);
        if(fullPoolOK&&resultOK&&cities.length===4&&cities.every(Boolean)&&new Set(cities.map(c=>c.id)).size===4&&targetIndex>=0&&((saved.phase==='question'&&saved.answered<saved.ids.length)||(saved.phase!=='question'&&saved.answered>0))&&((saved.phase==='complete')===(saved.answered===saved.ids.length))){Object.assign(this,{ids:saved.ids,answered:saved.answered,correctCount:saved.correctCount,phase:saved.phase,selected:saved.selected,lastCorrect:saved.lastCorrect});this.question={country,cities,targetIndex};}
      }
      if(this.phase==='ready')this.draw();
    }
    draw(){const target=this.country.cities.find(c=>c.id===this.ids[this.answered]);this.question=questionFor(this.country,target,this.rng);this.phase='question';this.selected=null;this.lastCorrect=null;return this.question;}
    answer(index){if(this.phase!=='question'||!Number.isInteger(index)||index<0||index>3)return {accepted:false};this.selected=index;const correct=index===this.question.targetIndex;this.lastCorrect=correct;this.answered++;if(correct)this.correctCount++;this.phase=this.answered===this.ids.length?'complete':correct?'correct':'incorrect';return {accepted:true,correct,answered:this.answered,total:this.ids.length,correctCount:this.correctCount};}
    next(){if(!['correct','incorrect'].includes(this.phase))return false;this.draw();return true;}
    toJSON(){return {ids:this.ids,answered:this.answered,correctCount:this.correctCount,phase:this.phase,selected:this.selected,lastCorrect:this.lastCorrect,cityIds:this.question?this.question.cities.map(c=>c.id):[]};}
  }
  function rings(geometry){return geometry.type==='Polygon'?geometry.coordinates:geometry.coordinates.flat();}
  function projectCountry(geometry,cities,width,height){
    const raw=rings(geometry);
    // Fit substantial nearby landmasses, not tiny remote dependencies. Keep every source ring for panning.
    const measured=raw.map(r=>{let last=r[0][0];const unwrapped=r.map(p=>{let x=p[0];while(x-last>180)x-=360;while(x-last< -180)x+=360;last=x;return [x,p[1]];});let a=0;for(let i=1;i<unwrapped.length;i++)a+=unwrapped[i-1][0]*unwrapped[i][1]-unwrapped[i][0]*unwrapped[i-1][1];const xs=unwrapped.map(p=>p[0]),ys=unwrapped.map(p=>p[1]);const box=[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)];return {r,box,area:Math.abs(a/2)*Math.cos((box[2]+box[3])/2*Math.PI/180)};});
    const main=measured.reduce((a,b)=>a.area>b.area?a:b);const baseLng=(main.box[0]+main.box[1])/2,baseLat=(main.box[2]+main.box[3])/2;const reach=Math.max(main.box[1]-main.box[0],main.box[3]-main.box[2])*2.5;
    const focused=measured.filter(m=>{let dx=(m.box[0]+m.box[1])/2-baseLng;while(dx>180)dx-=360;while(dx< -180)dx+=360;return m===main||(m.area>=main.area*.01&&(m.area>=main.area*.25||Math.hypot(dx,(m.box[2]+m.box[3])/2-baseLat)<=reach));}).flatMap(m=>m.r);
    const coords=focused.concat(cities.map(c=>[c.lng,c.lat]));
    const lngs=coords.map(p=>(p[0]%360+360)%360).sort((a,b)=>a-b);
    let gap=-1,start=0;for(let i=0;i<lngs.length;i++){const next=i===lngs.length-1?lngs[0]+360:lngs[i+1];if(next-lngs[i]>gap){gap=next-lngs[i];start=next%360;}}
    const center=start+(360-gap)/2;
    const lng=x=>{let v=(x%360+360)%360;while(v-center>180)v-=360;while(v-center< -180)v+=360;return v;};
    const minLat=Math.min(...coords.map(p=>p[1])), maxLat=Math.max(...coords.map(p=>p[1]));
    const cos=Math.max(.15,Math.cos((minLat+maxLat)/2*Math.PI/180));
    const rawPoint=p=>[lng(p[0])*cos,-p[1]];
    const points=coords.map(rawPoint);const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const pad=Math.min(width,height)*.12;const scale=Math.min((width-pad*2)/Math.max(.001,x1-x0),(height-pad*2)/Math.max(.001,y1-y0));
    const toPoint=p=>{const [x,y]=rawPoint(p);return [(x-(x0+x1)/2)*scale+width/2,(y-(y0+y1)/2)*scale+height/2];};
    return {paths:raw.map(r=>r.map(toPoint)),points:cities.map(c=>toPoint([c.lng,c.lat])),toPoint};
  }
  function separatePins(points,width,height,distance=30){
    const margin=17,clearance=19,placed=[];
    for(let i=0;i<points.length;i++){
      const anchor=points[i],candidates=[{x:anchor[0],y:anchor[1],centered:true}];
      for(const radius of [22,32,44,60,82,112,160,240,320,480,640,900])for(let a=0;a<32;a++){const angle=-Math.PI/2+a*Math.PI/16;candidates.push({x:anchor[0]+Math.cos(angle)*radius,y:anchor[1]+Math.sin(angle)*radius,centered:false});}
      let best=null;
      for(const p of candidates){
        if(p.x<margin||p.x>width-margin||p.y<margin||p.y>height-margin)continue;
        if(placed.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<distance))continue;
        if(points.some((q,j)=>(j!==i||!p.centered)&&Math.hypot(p.x-q[0],p.y-q[1])<clearance))continue;
        best=p;break;
      }
      // The fallback grid is only needed for unusual zoom/pan positions near an edge.
      if(!best)for(let y=margin;y<=height-margin&&!best;y+=18)for(let x=margin;x<=width-margin;x+=18){if(!placed.some(q=>Math.hypot(x-q.x,y-q.y)<distance)&&!points.some(q=>Math.hypot(x-q[0],y-q[1])<clearance)){best={x,y,centered:false};break;}}
      placed.push({...best||{x:clamp(anchor[0],margin,width-margin),y:clamp(anchor[1],margin,height-margin)},anchor});
    }
    return placed;
  }
  function orderQuestion(game,geometry){
    const q=game.question;if(!q)return false;
    const targetId=q.cities[q.targetIndex].id,selectedId=Number.isInteger(game.selected)?q.cities[game.selected]?.id:null;
    const space=countrySpace(q.country.geometry?q.country:{...q.country,geometry}),points=q.cities.map(c=>space.byId.get(c.id).p);
    const ordered=q.cities.map((city,i)=>({city,x:points[i][0],y:points[i][1]})).sort((a,b)=>((a.y-a.x)-(b.y-b.x))||(a.y-b.y)||(b.x-a.x)||(a.city.id-b.city.id)).map(p=>p.city);
    const changed=ordered.some((c,i)=>c.id!==q.cities[i].id);q.cities=ordered;q.targetIndex=ordered.findIndex(c=>c.id===targetId);game.selected=selectedId===null?null:ordered.findIndex(c=>c.id===selectedId);return changed;
  }
  const exports={Game,StudyGame,shuffled,cityKey,rings,projectCountry,separatePins,orderQuestion,questionProjection,countrySpace,quartetQuality};if(typeof module!=='undefined'&&module.exports)module.exports=exports;else root.CityStreakCore=exports;
})(typeof window==='undefined'?globalThis:window);
