const data={
"72-bar":{"BMPOA-core":[790.599444,790.599444,0],"BMPOA-DiscreteLS":[793.322004,790.599444,3.728019],"BMPOA-QIO":[791.960724,790.599444,3.043915],"BMPOA-DiscreteLS-QIO":[791.960724,790.599444,3.043915]},
"120-bar":{"BMPOA-core":[38496.417609,38485.930044,14.360690],"BMPOA-DiscreteLS":[38500.734371,38485.930044,33.103483],"BMPOA-QIO":[38492.732444,38485.930044,15.210629],"BMPOA-DiscreteLS-QIO":[38528.956961,38519.942044,45.699619]}
};
const b=document.querySelector("#benchmark"),v=document.querySelector("#variant");
function render(){let x=data[b.value][v.value];document.querySelector("#cards").innerHTML=
[['Feasibility','5/5','ok'],['Max violation','0','ok'],['Mean weight',x[0].toFixed(3),''],['Median weight',x[1].toFixed(3),''],['Std. dev.',x[2].toFixed(3),''],['FE / modal','35070 / 35070','']].map(z=>'<div class="card"><small>'+z[0]+'</small><b class="'+z[2]+'">'+z[1]+'</b></div>').join('');
let rows=Object.entries(data[b.value]),vals=rows.map(r=>r[1][0]),mn=Math.min(...vals),mx=Math.max(...vals);
document.querySelector("#bars").innerHTML=rows.map(r=>{let w=mx===mn?100:35+65*(mx-r[1][0])/(mx-mn);return '<div class="barrow"><div class="barlabel"><span>'+r[0]+'</span><b>'+r[1][0].toFixed(3)+'</b></div><div class="track"><div class="fill" style="width:'+w+'%"></div></div></div>'}).join('')}
b.onchange=render;v.onchange=render;render();
function net(){document.querySelector("#net").textContent=navigator.onLine?'● online':'● offline'}addEventListener('online',net);addEventListener('offline',net);net();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');