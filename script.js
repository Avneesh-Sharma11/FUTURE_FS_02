const KEY = "mini-crm-contacts-v1";
const seed = [
  {id:uid(),name:"Ada Lovelace",email:"ada@analytical.dev",phone:"+44 20 7946 0958",company:"Analytical Engines",status:"Customer",notes:"Enterprise plan",createdAt:Date.now()-345600000},
  {id:uid(),name:"Alan Turing",email:"alan@bletchley.uk",phone:"+44 1908 640404",company:"Bletchley Labs",status:"Contacted",notes:"Follow up",createdAt:Date.now()-172800000},
  {id:uid(),name:"Grace Hopper",email:"grace@cobol.io",phone:"+1 202 555 0142",company:"Cobol Inc.",status:"Lead",notes:"Met at conference",createdAt:Date.now()-21600000},
];

let contacts = load();
let filter = "All";
let query = "";
let editingId = null;

const $ = (s)=>document.querySelector(s);
const list = $("#list");
const overlay = $("#overlay");
const form = $("#form");

function uid(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function load(){try{const r=localStorage.getItem(KEY);return r?JSON.parse(r):seed}catch{return seed}}
function save(){localStorage.setItem(KEY,JSON.stringify(contacts))}
function initials(n){return n.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function escape(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function render(){
  $("#sTotal").textContent = contacts.length;
  $("#sLead").textContent = contacts.filter(c=>c.status==="Lead").length;
  $("#sContacted").textContent = contacts.filter(c=>c.status==="Contacted").length;
  $("#sCustomer").textContent = contacts.filter(c=>c.status==="Customer").length;

  const q = query.trim().toLowerCase();
  const rows = contacts
    .filter(c=>filter==="All"||c.status===filter)
    .filter(c=>!q||c.name.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||c.company.toLowerCase().includes(q))
    .sort((a,b)=>b.createdAt-a.createdAt);

  if(!rows.length){list.innerHTML=`<div class="empty">No contacts found.</div>`;return}

  list.innerHTML = rows.map(c=>`
    <div class="row">
      <div class="person">
        <div class="avatar">${escape(initials(c.name))}</div>
        <div><div class="name">${escape(c.name)}</div></div>
      </div>
      <div class="email">${escape(c.email)||"—"}</div>
      <div>${escape(c.company)||"—"}</div>
      <div><span class="pill ${c.status}">${c.status}</span></div>
      <div class="actions">
        <button class="btn-ghost" data-edit="${c.id}">Edit</button>
        <button class="btn-danger" data-del="${c.id}">Delete</button>
      </div>
    </div>`).join("");
}

list.addEventListener("click",e=>{
  const ed=e.target.dataset.edit, dl=e.target.dataset.del;
  if(ed) openEdit(ed);
  if(dl && confirm("Delete this contact?")){
    contacts = contacts.filter(c=>c.id!==dl); save(); render();
  }
});

$("#chips").addEventListener("click",e=>{
  if(!e.target.dataset.f) return;
  filter = e.target.dataset.f;
  document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("active",c.dataset.f===filter));
  render();
});

$("#search").addEventListener("input",e=>{query=e.target.value;render()});

$("#newBtn").addEventListener("click",()=>{
  editingId=null; form.reset();
  $("#modalTitle").textContent="New Contact";
  $("#saveBtn").textContent="Create Contact";
  overlay.classList.add("open");
});
$("#cancelBtn").addEventListener("click",()=>overlay.classList.remove("open"));
overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.classList.remove("open")});

function openEdit(id){
  const c = contacts.find(x=>x.id===id); if(!c) return;
  editingId = id;
  for(const k of ["name","email","phone","company","status","notes"]) form.elements[k].value = c[k]||"";
  $("#modalTitle").textContent="Edit Contact";
  $("#saveBtn").textContent="Save Changes";
  overlay.classList.add("open");
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if(!d.name.trim()) return;
  if(editingId){
    contacts = contacts.map(c=>c.id===editingId?{...c,...d}:c);
  }else{
    contacts.unshift({id:uid(),createdAt:Date.now(),...d});
  }
  save(); render(); overlay.classList.remove("open");
});

render();