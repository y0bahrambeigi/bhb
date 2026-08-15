const LESSONS=[
{title:"خروجی و متغیرها",sub:"print، رشته و عدد",code:'name = "Civil Engineer"\nage = 25\nprint(name, age)',exercise:{title:"تمرین متغیرها",text:"متغیر x را برابر 10 قرار بده و مقدار آن را چاپ کن.",tests:["'x' in globals()","x == 10"],labels:["متغیر x تعریف شده باشد","x دقیقاً برابر 10 باشد"]}},
{title:"شرط‌ها",sub:"if / elif / else",code:'score = 85\nif score >= 60:\n    print("Pass")',exercise:{title:"تمرین شرط",text:"اگر age بزرگ‌تر یا مساوی 18 بود عبارت Adult چاپ شود.",tests:["'age' in globals()","age >= 18"],labels:["متغیر age تعریف شده باشد","age حداقل 18 باشد"]}},
{title:"حلقه‌ها",sub:"for و range",code:'for i in range(5):\n    print(i)',exercise:{title:"تمرین حلقه",text:"با حلقه for اعداد 0 تا 4 را چاپ کن.",tests:["'i' in globals()","i == 4"],labels:["حلقه اجرا شده باشد","آخرین i برابر 4 باشد"]}},
{title:"توابع",sub:"def و return",code:'def area(b, h):\n    return b*h/2\nprint(area(4,3))',exercise:{title:"تمرین تابع",text:"تابع square(n) بساز که مربع n را برگرداند.",tests:["'square' in globals()","square(5)==25"],labels:["تابع square تعریف شده باشد","square(5) برابر 25 باشد"]}},
{title:"NumPy",sub:"آرایه و محاسبات علمی",code:'import numpy as np\nx=np.array([1,2,3,4])\nprint(x.mean())',exercise:{title:"تمرین NumPy",text:"آرایه a=[2,4,6,8] بساز و میانگین آن را در m ذخیره کن.",tests:["'a' in globals()","abs(float(m)-5)<1e-9"],labels:["آرایه a تعریف شده باشد","m برابر 5 باشد"]}},
{title:"Matplotlib",sub:"نمودار علمی",code:'import matplotlib.pyplot as plt\nx=[0,1,2,3,4]\ny=[i**2 for i in x]\nplt.plot(x,y,marker="o")\nplt.title("Quadratic")\nplt.grid(True)\nplt.show()',exercise:{title:"تمرین نمودار",text:"یک نمودار ساده رسم کن و plt.show() را فراخوانی کن.",tests:["'plt' in globals()"],labels:["matplotlib.pyplot با نام plt موجود باشد"]}}
];
const CIVIL={
beam:`import numpy as np
import matplotlib.pyplot as plt
L=6.0
w=20e3
E=200e9
I=8.0e-5
x=np.linspace(0,L,200)
v=w*x*(L**3-2*L*x**2+x**3)/(24*E*I)
print("Maximum deflection (mm):", round(float(v.max()*1000),3))
plt.plot(x,v*1000)
plt.xlabel("x (m)")
plt.ylabel("Deflection (mm)")
plt.title("Simply Supported Beam - UDL")
plt.grid(True)
plt.show()`,
truss:`import numpy as np
E=200e9
A=4e-4
x1,y1=0.0,0.0
x2,y2=3.0,4.0
L=((x2-x1)**2+(y2-y1)**2)**0.5
c=(x2-x1)/L
s=(y2-y1)/L
k=(E*A/L)*np.array([[c*c,c*s,-c*c,-c*s],[c*s,s*s,-c*s,-s*s],[-c*c,-c*s,c*c,c*s],[-c*s,-s*s,c*s,s*s]])
print("Element length:",L)
print("Element stiffness matrix:\\n",k)`,
sdof:`import numpy as np
import matplotlib.pyplot as plt
m=1000.0
k=2.0e6
zeta=0.05
wn=(k/m)**0.5
wd=wn*(1-zeta**2)**0.5
u0=0.02
v0=0.0
t=np.linspace(0,3,500)
u=np.exp(-zeta*wn*t)*(u0*np.cos(wd*t)+((v0+zeta*wn*u0)/wd)*np.sin(wd*t))
print("Natural frequency (Hz):", round(wn/(2*np.pi),3))
plt.plot(t,u*1000)
plt.xlabel("Time (s)")
plt.ylabel("Displacement (mm)")
plt.title("SDOF Free Vibration")
plt.grid(True)
plt.show()`};
const QUIZ=[
{q:"خروجی print(2**3) چیست؟",opts:["6","8","9","23"],a:1},
{q:"کدام ساختار برای تصمیم‌گیری استفاده می‌شود؟",opts:["for","if","def","import"],a:1},
{q:"تابع len([1,2,3]) چه مقداری می‌دهد؟",opts:["2","3","4","6"],a:1},
{q:"در NumPy، np.mean([2,4,6]) چند است؟",opts:["3","4","6","12"],a:1},
{q:"برای نمایش نمودار Matplotlib معمولاً از چه دستوری استفاده می‌شود؟",opts:["plt.show()","plt.run()","plot.open()","show.plot()"],a:0}
];
const ACH=[
{id:"first_run",icon:"🚀",title:"اولین اجرا",desc:"اولین کد واقعی Python را اجرا کن"},
{id:"tester",icon:"🧪",title:"تست‌زن",desc:"یک تمرین را با تست خودکار پاس کن"},
{id:"quiz_master",icon:"🎯",title:"Quiz Master",desc:"آزمون ۵ مرحله‌ای را کامل کن"},
{id:"plotter",icon:"📈",title:"Plotter",desc:"یک نمودار Matplotlib تولید کن"},
{id:"civil",icon:"🏗️",title:"Civil Coder",desc:"یک پروژه مهندسی عمران را اجرا کن"},
{id:"xp500",icon:"🏆",title:"500 XP",desc:"به 500 امتیاز برس"}
];
let state=JSON.parse(localStorage.getItem("pls_ultra")||'{"lesson":0,"xp":0,"solved":0,"ach":[],"quizIndex":0,"quizScore":0,"civilOpen":false}');
let pyodide=null,editor=null,startTime=Date.now(),deferredPrompt=null;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem("pls_ultra",JSON.stringify(state))}
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2100)}
function getCode(){return editor?editor.getValue():$("fallbackEditor").value}
function setCode(v){if(editor)editor.setValue(v);else $("fallbackEditor").value=v}
function award(id,xp=0){if(!state.ach.includes(id)){state.ach.push(id);toast("Achievement جدید باز شد!")}state.xp+=xp;if(state.xp>=500&&!state.ach.includes("xp500"))state.ach.push("xp500");save();renderStats();renderAchievements()}
function renderLessons(){$("lessonList").innerHTML=LESSONS.map((l,i)=>`<button class="lessonItem ${state.lesson===i?"active":""}" onclick="selectLesson(${i})"><b>${i+1}. ${l.title}</b><small>${l.sub}</small></button>`).join("")}
function selectLesson(i){state.lesson=i;state.civilOpen=false;setCode(LESSONS[i].code);renderLesson();renderLessons();save()}
function renderLesson(){const e=LESSONS[state.lesson].exercise;$("exerciseTitle").textContent=e.title;$("exerciseText").textContent=e.text;$("exerciseTests").textContent=e.labels.map((x,i)=>`${i+1}. ${x}`).join("\n");$("taskBadge").textContent=LESSONS[state.lesson].title}
function renderStats(){$("xp").textContent=state.xp;$("xpTop").textContent=state.xp+" XP";$("level").textContent=Math.floor(state.xp/100)+1;$("solved").textContent=state.solved;$("achievementCount").textContent=state.ach.length;$("achievementTop").textContent=state.ach.length}
function renderAchievements(){$("achievementGrid").innerHTML=ACH.map(a=>`<div class="achievement ${state.ach.includes(a.id)?"unlocked":""}"><i>${a.icon}</i><div><b>${a.title}</b><div class="muted tiny">${a.desc}</div></div></div>`).join("");$("achievementProgress").textContent=`${state.ach.length}/${ACH.length}`}
function renderQuiz(){const q=QUIZ[state.quizIndex];$("quizProgressBar").style.width=(state.quizIndex/QUIZ.length*100)+"%";$("quizQuestion").innerHTML=`<h3>${state.quizIndex+1}. ${q.q}</h3>`;$("quizOptions").innerHTML=q.opts.map((o,i)=>`<button class="quizOpt" onclick="answerQuiz(${i},this)">${o}</button>`).join("");$("quizFeedback").textContent="";$("quizNextBtn").hidden=true}
function answerQuiz(i,btn){document.querySelectorAll(".quizOpt").forEach(x=>x.disabled=true);const q=QUIZ[state.quizIndex];if(i===q.a){state.quizScore++;$("quizFeedback").textContent="✅ پاسخ صحیح";state.xp+=15}else $("quizFeedback").textContent=`❌ پاسخ صحیح: ${q.opts[q.a]}`;btn.classList.add("selected");$("quizNextBtn").hidden=false;save();renderStats()}
function nextQuiz(){state.quizIndex++;if(state.quizIndex>=QUIZ.length){$("quizQuestion").innerHTML=`<h3>آزمون تمام شد</h3><p>امتیاز: ${state.quizScore} از ${QUIZ.length}</p>`;$("quizOptions").innerHTML="";$("quizNextBtn").hidden=true;award("quiz_master",50);state.quizIndex=0;state.quizScore=0;save();return}renderQuiz();save()}
async function initPyodide(){try{$("pythonState").textContent="Loading";pyodide=await loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"});await pyodide.loadPackage(["numpy","matplotlib"]);$("pythonState").textContent="Ready";$("mplState").textContent="Ready";$("runtimeBadge").textContent="Python آماده";$("consolePane").textContent=">>> Python + NumPy + Matplotlib آماده است."}catch(e){$("pythonState").textContent="Error";$("mplState").textContent="Error";$("runtimeBadge").textContent="خطا";$("consolePane").textContent=String(e)}}
function initMonaco(){if(typeof require==="undefined"){$("monacoState").textContent="Fallback";$("fallbackEditor").hidden=false;return}require.config({paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"}});require(["vs/editor/editor.main"],()=>{editor=monaco.editor.create($("monacoEditor"),{value:LESSONS[state.lesson].code,language:"python",theme:"vs-dark",automaticLayout:true,fontSize:14,minimap:{enabled:false},fontLigatures:true,smoothScrolling:true,tabSize:4,wordWrap:"on"});$("monacoState").textContent="Ready"})}
async function runPython(){if(!pyodide)return toast("Python هنوز آماده نیست");$("statusText").textContent="در حال اجرا…";showOutput("console");try{await pyodide.runPythonAsync(`import sys,io\nsys.stdout=io.StringIO()\nsys.stderr=io.StringIO()\nimport matplotlib.pyplot as plt\nplt.close('all')`);const result=await pyodide.runPythonAsync(getCode());const out=pyodide.runPython("sys.stdout.getvalue()");const err=pyodide.runPython("sys.stderr.getvalue()");$("consolePane").textContent=out||err||String(result??"اجرای موفق بدون خروجی");$("statusText").textContent="اجرا موفق";award("first_run",10);const hasFig=pyodide.runPython("len(plt.get_fignums())>0");if(hasFig){const b64=pyodide.runPython(`import io,base64\n_buf=io.BytesIO()\nplt.gcf().savefig(_buf,format="png",bbox_inches="tight",dpi=140)\nbase64.b64encode(_buf.getvalue()).decode()`);$("plotImage").src="data:image/png;base64,"+b64;$("plotHint").hidden=true;award("plotter",20);showOutput("plot")}if(state.civilOpen)award("civil",25)}catch(e){$("consolePane").textContent=">>> ERROR\n"+e;$("statusText").textContent="خطا"}}
async function runTests(){if(!pyodide)return toast("Python هنوز آماده نیست");showOutput("tests");const ex=LESSONS[state.lesson].exercise;let results=[];try{await pyodide.runPythonAsync(getCode());for(let i=0;i<ex.tests.length;i++){let ok=false;try{ok=!!pyodide.runPython(ex.tests[i])}catch{}results.push({ok,label:ex.labels[i]})}}catch(e){results.push({ok:false,label:"کد بدون خطای اجرایی باشد: "+String(e).slice(0,120)})}$("testsPane").innerHTML=results.map(r=>`<div class="testResult ${r.ok?"pass":"fail"}">${r.ok?"✅":"❌"} ${r.label}</div>`).join("");if(results.length&&results.every(r=>r.ok)){state.solved++;award("tester",30);toast("همه تست‌ها پاس شدند!")}else toast("بعضی تست‌ها هنوز پاس نشده‌اند")}
function formatCode(){let c=getCode().replace(/\t/g,"    ").replace(/[ ]+$/gm,"");setCode(c);toast("کد مرتب شد")}
function resetLesson(){state.civilOpen=false;setCode(LESSONS[state.lesson].code);toast("کد درس بازنشانی شد")}
function openCivilProject(name){state.civilOpen=true;setCode(CIVIL[name]);$("taskBadge").textContent={beam:"خمش تیر",truss:"خرپا",sdof:"SDOF"}[name];scrollToEditor();toast("پروژه مهندسی بارگذاری شد")}
function scrollToEditor(){$("editorPanel").scrollIntoView({behavior:"smooth",block:"start"})}
function showOutput(name){["console","plot","tests"].forEach(n=>{$(n+"Pane").hidden=n!==name});document.querySelectorAll("[data-output]").forEach(t=>t.classList.toggle("active",t.dataset.output===name))}
document.querySelectorAll("[data-output]").forEach(t=>t.onclick=()=>showOutput(t.dataset.output));
document.querySelectorAll("[data-pane]").forEach(t=>t.onclick=()=>{document.querySelectorAll("[data-pane]").forEach(x=>x.classList.remove("active"));t.classList.add("active");["exercise","quiz","ai"].forEach(n=>$(n+"Pane").hidden=n!==t.dataset.pane)});
function saveAIEndpoint(){const ep=$("aiEndpoint").value.trim();localStorage.setItem("pls_ai_endpoint",ep);$("aiState").textContent=ep?"Connected endpoint":"محلی";toast(ep?"AI endpoint ذخیره شد":"حالت AI محلی فعال شد")}
async function askTutor(){const input=$("aiInput"),q=input.value.trim();if(!q)return;addMsg(q,"user");input.value="";const endpoint=localStorage.getItem("pls_ai_endpoint")||"";if(endpoint){try{$("aiState").textContent="Thinking";const resp=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"system",content:"You are a Persian Python tutor specialized in civil engineering. Be concise, pedagogical, and help debug code."},{role:"user",content:q+"\n\nCurrent code:\n"+getCode()}]})});if(!resp.ok)throw new Error("HTTP "+resp.status);const data=await resp.json();const text=data.output_text||data.reply||data.message||data.choices?.[0]?.message?.content||"پاسخ AI دریافت شد ولی قالب پاسخ شناخته نشد.";addMsg(text,"bot");$("aiState").textContent="Connected";return}catch(e){addMsg("اتصال AI ناموفق بود: "+e.message,"bot");$("aiState").textContent="Error"}}let a="سؤال را دقیق‌تر بپرس.";const s=q.toLowerCase();if(s.includes("error")||s.includes("خطا"))a="پیام خطا را از Console بخوان. SyntaxError معمولاً از کوتیشن، پرانتز، دونقطه یا تورفتگی است. NameError یعنی نامی قبل از تعریف استفاده شده.";else if(s.includes("خرپا"))a="در تحلیل خرپای دوبعدی ابتدا ماتریس سختی عضو در مختصات محلی تشکیل و سپس با کسینوس‌های جهت به دستگاه کلی منتقل می‌شود.";else if(s.includes("تیر"))a="برای خیز تیر، واحدهای E، I، بار و طول باید سازگار باشند. بهتر است خروجی خیز را به میلی‌متر تبدیل کنی.";else if(s.includes("matplotlib"))a="از import matplotlib.pyplot as plt، سپس plt.plot(...) و در پایان plt.show() استفاده کن.";addMsg(a,"bot")}
function addMsg(text,type){const d=document.createElement("div");d.className="msg "+type;d.textContent=text;$("chat").appendChild(d);$("chat").scrollTop=$("chat").scrollHeight}
$("aiInput").addEventListener("keydown",e=>{if(e.key==="Enter")askTutor()});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false});
$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true}};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
setInterval(()=>{let s=Math.floor((Date.now()-startTime)/1000);$("focus").textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")},1000);
$("aiEndpoint").value=localStorage.getItem("pls_ai_endpoint")||"";if($("aiEndpoint").value)$("aiState").textContent="Connected endpoint";
renderLessons();renderLesson();renderStats();renderAchievements();renderQuiz();initMonaco();initPyodide();