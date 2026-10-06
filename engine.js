(function(root){
'use strict';
const cells=w=>Array.from(w.text,(letter,i)=>({r:w.r+(w.dir==='v'?i:0),c:w.c+(w.dir==='h'?i:0),letter}));
function board(words,size=15){const b=new Map;words.forEach((w,id)=>cells(w).forEach(p=>{const k=p.r*size+p.c;const old=b.get(k);b.set(k,{...p,ids:old?[...old.ids,id]:[id],seed:w.seed||old?.seed})}));return b}
function components(words,size=15){const parents=words.map((_,i)=>i);function find(x){return parents[x]===x?x:parents[x]=find(parents[x])}for(const p of board(words,size).values())for(const i of p.ids)parents[find(i)]=find(p.ids[0]);return words.map((_,i)=>find(i))}
function validate(words,word,dictionary,size=15){const fail=reason=>({valid:false,reason});if(!/^[A-Z]{2,15}$/.test(word.text))return fail('Use 2–15 letters, with no spaces.');if(!dictionary.has(word.text))return fail('This word is not in our word list. Try another.');if(words.some(w=>w.text===word.text))return fail('That word is already on the board.');if(!['h','v'].includes(word.dir)||!Number.isInteger(word.r)||!Number.isInteger(word.c))return fail('Choose a starting square and direction.');const path=cells(word);if(path.some(p=>p.r<0||p.r>=size||p.c<0||p.c>=size))return fail('This word does not fit on the board.');const b=board(words,size),crossed=new Set;let added=0;for(const p of path){const old=b.get(p.r*size+p.c);if(old){if(old.letter!==p.letter)return fail('The crossing letters do not match.');for(const id of old.ids)crossed.add(id)}else{added++;}}
if(!added)return fail('Add at least one new letter.');const comps=components(words,size),ids=[...crossed];const winning=ids.length===2&&comps[ids[0]]!==comps[ids[1]];if(ids.length!==1&&!winning)return fail('Cross exactly one word, or join both chains with your final word.');return{valid:true,winning,cost:10+word.text.length,reason:winning?'The final link! Connect both chains.':`Valid link · +${10+word.text.length} points`}}
function puzzle(index,size=15){
 // The route is fixed and verified; the pair of starting words changes daily.
 // The seeds anchor the route at opposite corners so the objective is
 // immediately readable on every board size.
 const pairs=[
  ['BLOOM','TIGER','NIGHTFALL','LIGHT'],
  ['GLOOM','MANGO','NORTHWARD','DREAM'],
  ['BROOM','MANGO','NORTHWARD','DREAM'],
  ['BLOOM','MIGHT','NORTHWARD','DREAM'],
  ['GLOOM','TIGER','NIGHTFALL','LIGHT'],
  ['BROOM','METAL','NORTHWARD','DREAM']
 ];
 // Pick a fresh pair whenever a puzzle is initialized so replaying or
 // refreshing gives players a new starting point.
 const [left,right,middle,finalWord]=pairs[Math.floor(Math.random()*pairs.length)];
 const leftRow=0;
 const rightRow=size-1;
 const seeds=[{text:left,r:leftRow,c:0,dir:'h',seed:true},{text:right,r:rightRow,c:size-right.length,dir:'h',seed:true}];
 // The first hint is deliberately local to the left seed. Larger boards are
 // open canvases: players can build their own route across the extra space.
 const solution=[{text:'OCEAN',r:leftRow,c:2,dir:'v'}];
 return {seeds,solution};
}
const api={cells,board,components,validate,puzzle};root.WordLinks=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
