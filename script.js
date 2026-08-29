const ranks = [
  {id:"prime",name:"Prime",price:4.99,icon:"✦",desc:"A clean entry-level upgrade for everyday play."},
  {id:"hero",name:"Hero",price:9.99,icon:"⚔",desc:"Step up with a stronger server presence."},
  {id:"deluxe",name:"Deluxe",price:19.99,icon:"◆",desc:"A premium tier for players who want more."},
  {id:"supreme",name:"Supreme",price:29.99,icon:"♜",desc:"Command attention with a top-tier rank.",tag:"POPULAR"},
  {id:"kraken",name:"Kraken",price:39.99,icon:"◈",desc:"A powerful upgrade for serious grinders."},
  {id:"eternal",name:"Eternal",price:49.99,icon:"♛",desc:"The ultimate golden StrafeMC rank.",tag:"FEATURED"}
];

const coins = [
  {id:"coins-500",name:"500 Coins",price:1.49,icon:"●",desc:"A small premium boost for everyday purchases."},
  {id:"coins-1500",name:"1,500 Coins",price:3.49,icon:"●",desc:"A modest bundle for regular players."},
  {id:"coins-3000",name:"3,000 Coins",price:6.49,icon:"●",desc:"A balanced bundle without flooding your balance.",tag:"POPULAR"},
  {id:"coins-5000",name:"5,000 Coins",price:9.99,icon:"●",desc:"A premium-sized bundle for active players.",tag:"BEST VALUE"},
  {id:"coins-10000",name:"10,000 Coins",price:17.99,icon:"●",desc:"The largest coin bundle — kept rare by design.",tag:"MAX"}
];
const products=[...ranks,...coins];
let cart=JSON.parse(localStorage.getItem("strafemc_cart")||"[]");

const money=n=>`$${n.toFixed(2)}`;
const findProduct=id=>products.find(p=>p.id===id);

function renderProducts(list,target){
  document.getElementById(target).innerHTML=list.map(p=>`
    <article class="product ${p.tag?'featured':''}">
      <div class="product-top"><div class="product-icon">${p.icon}</div>${p.tag?`<span class="tag">${p.tag}</span>`:""}</div>
      <h3>${p.name}</h3><div class="price">${money(p.price)}</div>
      <p>${p.desc}</p><button class="btn btn-gold add-product" data-id="${p.id}">Add to cart</button>
    </article>`).join("");
}
renderProducts(ranks,"rankGrid"); renderProducts(coins,"coinGrid");

function save(){localStorage.setItem("strafemc_cart",JSON.stringify(cart)); renderCart();}
function add(id){const item=cart.find(x=>x.id===id); item?item.qty++:cart.push({id,qty:1}); save(); openDrawer();}
function change(id,delta){const item=cart.find(x=>x.id===id); if(!item)return; item.qty+=delta; if(item.qty<=0)cart=cart.filter(x=>x.id!==id); save();}
function renderCart(){
  const count=cart.reduce((s,x)=>s+x.qty,0), total=cart.reduce((s,x)=>s+findProduct(x.id).price*x.qty,0);
  document.getElementById("cartCount").textContent=count; document.getElementById("cartTotal").textContent=money(total);
  document.getElementById("checkoutBtn").disabled=!cart.length;
  document.getElementById("cartEmpty").style.display=cart.length?"none":"block";
  document.getElementById("cartItems").innerHTML=cart.map(x=>{const p=findProduct(x.id);return `
    <div class="cart-row"><div class="product-icon">${p.icon}</div><div><strong>${p.name}</strong><small>${money(p.price)} each</small></div>
    <div class="qty"><button data-action="dec" data-id="${p.id}">−</button><span>${x.qty}</span><button data-action="inc" data-id="${p.id}">+</button></div>
    <button class="remove" data-action="remove" data-id="${p.id}">Remove</button></div>`}).join("");
}
function openDrawer(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("overlay").classList.add("open");document.getElementById("cartDrawer").setAttribute("aria-hidden","false")}
function closeDrawer(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("overlay").classList.remove("open");document.getElementById("cartDrawer").setAttribute("aria-hidden","true")}
function openModal(){document.getElementById("checkoutModal").classList.add("open");document.getElementById("checkoutModal").setAttribute("aria-hidden","false")}
function closeModal(){document.getElementById("checkoutModal").classList.remove("open");document.getElementById("checkoutModal").setAttribute("aria-hidden","true")}

document.addEventListener("click",e=>{
  const addBtn=e.target.closest(".add-product"); if(addBtn){add(addBtn.dataset.id);return}
  const action=e.target.closest("[data-action]"); if(action){const {id}=action.dataset; if(action.dataset.action==="inc")change(id,1);if(action.dataset.action==="dec")change(id,-1);if(action.dataset.action==="remove")cart=cart.filter(x=>x.id!==id),save();return}
});
document.getElementById("openCart").onclick=openDrawer;
document.getElementById("closeCart").onclick=closeDrawer;
document.getElementById("overlay").onclick=closeDrawer;
document.getElementById("checkoutBtn").onclick=()=>{closeDrawer();openModal()};
document.getElementById("closeModal").onclick=closeModal;
document.getElementById("checkoutForm").onsubmit=e=>{
  e.preventDefault();
  const form=new FormData(e.target);
  const order={id:"STR-"+Date.now().toString().slice(-7),username:form.get("username"),email:form.get("email"),items:cart,total:cart.reduce((s,x)=>s+findProduct(x.id).price*x.qty,0),created:new Date().toISOString()};
  localStorage.setItem("strafemc_last_order",JSON.stringify(order));
  e.target.hidden=true;document.getElementById("successMessage").hidden=false;cart=[];save();
};
renderCart();
