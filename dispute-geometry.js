/* Geographic containment helper. No city or saved-progress mutation. Natural Earth geometry is public domain. */
(function(root){
'use strict';
function polygons(geometry){return geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];}
function ringLocation(lng,lat,ring){
 let inside=false;
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const a=ring[j],b=ring[i],dx=b[0]-a[0],dy=b[1]-a[1];
  const cross=(lat-a[1])*dx-(lng-a[0])*dy;
  if(Math.abs(cross)<=1e-10&&lng>=Math.min(a[0],b[0])-1e-10&&lng<=Math.max(a[0],b[0])+1e-10&&lat>=Math.min(a[1],b[1])-1e-10&&lat<=Math.max(a[1],b[1])+1e-10)return 2;
  if((a[1]>lat)!==(b[1]>lat)&&lng<dx*(lat-a[1])/dy+a[0])inside=!inside;
 }
 return inside?1:0;
}
function containsPoint(feature,lng,lat){
 if(!Number.isFinite(lng)||!Number.isFinite(lat)||lat < -90||lat > 90)return false;
 lng=((lng+180)%360+360)%360-180;
 const g=feature.geometry||feature,b=feature.bbox;
 if(b&&(lng<b[0]||lat<b[1]||lng>b[2]||lat>b[3]))return false;
 return polygons(g).some(poly=>{
  const outer=ringLocation(lng,lat,poly[0]);if(!outer)return false;if(outer===2)return true;
  for(let i=1;i<poly.length;i++){const hole=ringLocation(lng,lat,poly[i]);if(hole===2)return true;if(hole===1)return false;}
  return true;
 });
}
function polygonBounds(poly){
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(const ring of poly)for(const [x,y] of ring){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 return [x0,y0,x1,y1];
}
function boxesIntersect(a,b,margin=0){return a[0]<=b[2]+margin&&a[2]>=b[0]-margin&&a[1]<=b[3]+margin&&a[3]>=b[1]-margin;}
function create(data){
 const features=data.features||[],legend=data.legend||data.metadata?.legend||'Disputed area · affiliation not shown';
 function findAt(lng,lat){return features.filter(f=>containsPoint(f,lng,lat));}
 function statusForCity(city){const areas=findAt(Number(city.lng),Number(city.lat));return areas.length?{disputed:true,affiliation:null,label:legend,areaIds:areas.map(f=>f.id||f.properties.id),areaNames:areas.map(f=>f.name||f.properties.name)}:null;}
 function auditCountries(countries){return countries.flatMap(c=>c.cities.flatMap(city=>{const status=statusForCity(city);return status?[{id:city.id,en:city.en,sourcePoolCode:c.code,...status}]:[];}));}
 function relevantFeatures(referenceGeometry,margin=2){const boxes=polygons(referenceGeometry).map(polygonBounds);return features.filter(f=>polygons(f.geometry).some(p=>{const b=polygonBounds(p);return boxes.some(a=>boxesIntersect(a,b,margin));}));}
 function projectedFeatures(toPoint,referenceGeometry){return (referenceGeometry?relevantFeatures(referenceGeometry):features).map(f=>({id:f.id||f.properties.id,name:f.name||f.properties.name,path:polygons(f.geometry).map(poly=>poly.map(ring=>ring.map((point,i)=>{const p=toPoint(point);return (i?'L':'M')+p[0].toFixed(6)+','+p[1].toFixed(6);}).join('')+'Z').join('')).join('')}));}
 return {findAt,statusForCity,auditCountries,relevantFeatures,projectedFeatures,features,legend};
}
const api={create,containsPoint};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CityDisputeGeometry=api;
})(typeof window!=='undefined'?window:globalThis);
