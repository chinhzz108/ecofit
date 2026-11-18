import { catalog } from './ecofit-catalog.js?rev=account-1';

const products=catalog.filter(product=>!product.draft&&product.image&&product.name);
const grid=document.getElementById('shop-grid');
const count=document.getElementById('shop-count');
const empty=document.getElementById('shop-empty');
const filters=[...document.querySelectorAll('[data-category]')];
let category='all';

function makeCard(product,index){
  const card=document.createElement('article');
  card.className='eco-shop-card';card.dataset.productId=product.id;
  const media=document.createElement(product.href?'a':'div');media.className='eco-shop-card-media';
  if(product.href){
    media.href=product.href;
    media.setAttribute('aria-label','Xem '+product.name);
    media.addEventListener('click',event=>{
      if(event.defaultPrevented)return;
      event.preventDefault();
      window.location.assign(product.href);
    });
  }
  const image=document.createElement('img');
  image.src=product.image;image.alt=product.alt||product.name;image.width=1199;image.height=1312;
  image.loading=index<3?'eager':'lazy';image.decoding='async';
  const overlay=document.createElement('div');overlay.className='eco-shop-card-overlay';
  const hint=document.createElement('span');hint.className='eco-shop-card-hint';hint.textContent='Xem chi tiết →';
  const caption=document.createElement('div');caption.className='eco-shop-card-caption';
  const collection=document.createElement('p');collection.textContent=[product.collection,product.color].filter(Boolean).join(' / ');
  const heading=document.createElement('h2');heading.textContent=product.name;
  caption.append(collection,heading);overlay.append(hint);media.append(image,overlay,caption);
  const content=document.createElement('div');content.className='eco-shop-card-body';
  const price=document.createElement('p');price.className='eco-shop-card-price';
  price.textContent=typeof product.price==='number'?new Intl.NumberFormat('vi-VN').format(product.price)+' VNĐ':'Giá đang cập nhật';
  const actions=document.createElement('div');actions.className='eco-shop-card-actions';
  if(product.href){
    const buy=document.createElement('a');buy.className='eco-shop-buy';buy.href=product.href;buy.textContent='Mua ngay';
    buy.dataset.productId=product.id;buy.setAttribute('aria-label','Xem sản phẩm '+product.name);
    buy.addEventListener('click',event=>{
      event.preventDefault();
      window.location.assign(product.href);
    });
    actions.append(buy);
  }
  if(product.href){
    const add=document.createElement('button');add.type='button';add.className='eco-shop-add';add.textContent='+ Giỏ';
    add.dataset.shopAddCart='';add.dataset.productId=product.id;add.setAttribute('aria-label','Thêm vào giỏ '+product.name);actions.append(add);
  }
  content.append(price,actions);card.append(media,content);return card;
}
function render(){
  const matches=products.filter(product=>category==='all'||product.category===category);
  grid.replaceChildren(...matches.map((product,index)=>makeCard(product,index)));
  count.textContent=matches.length+' sản phẩm';empty.hidden=matches.length>0;
  filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
}
filters.forEach(button=>{
  const total=products.filter(product=>button.dataset.category==='all'||product.category===button.dataset.category).length;
  button.querySelector('[data-category-count]').textContent=String(total);
  button.hidden=button.dataset.category!=='all'&&total===0;
  button.addEventListener('click',()=>{category=button.dataset.category;render();});
});
document.getElementById('shop-reset').addEventListener('click',()=>{category='all';render();filters[0].focus();});
render();
