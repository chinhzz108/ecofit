import {catalog} from './ecofit-catalog.js?rev=account-1';
import {CART_KEY,LEGACY_KEY,MAX_QUANTITY,itemKey,sellableProducts,addItem,updateQuantity,updateSize,loadCart,saveCart,summarizeCart,cartKeyForUser,claimGuestCart} from './ecofit-cart-model.js?rev=account-1';
import {onAccountChange,getAccountState,renderAccountHeader} from './ecofit-account.js?rev=account-1';

const products=sellableProducts(catalog);
const money=value=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(value);
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const bag='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>';
let initialized=false,items=[],storage=null,activeCartKey=CART_KEY;

export function initializeCommerce(actions=document.querySelector('.ecofit-header-actions')){
  if(initialized||!actions)return;
  initialized=true;
  renderAccountHeader();
  try{storage=window.localStorage;}catch{}
  items=loadCart(storage,catalog);
  const headerLink=document.createElement('a');
  headerLink.className='eco-commerce-bag';headerLink.href='/gio-hang/';headerLink.innerHTML=bag+'<span data-basket-count>0</span>';
  if(location.pathname==='/gio-hang/')headerLink.setAttribute('aria-current','page');
  actions.insertBefore(headerLink,actions.querySelector('.ecofit-menu-trigger'));

  const status=document.createElement('div');status.className='eco-commerce-toast';status.hidden=true;
  status.innerHTML='<span role="status" aria-live="polite"></span><a href="/gio-hang/">Xem giỏ →</a><button type="button" aria-label="Đóng thông báo">×</button>';
  status.querySelector('button').addEventListener('click',()=>{status.hidden=true;});document.body.append(status);
  function announce(message){status.querySelector('span').textContent=message;status.hidden=false;}

  const dialog=document.createElement('dialog');dialog.className='eco-commerce-picker';dialog.setAttribute('aria-labelledby','commerce-picker-title');document.body.append(dialog);
  let selectedProduct=null,selectedSize='',buyNow=false,previousFocus=null,previousOverflow='';
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;previousFocus?.focus();});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
  function openPicker(product,immediate){
    if(dialog.open)return;
    selectedProduct=product;selectedSize='';buyNow=immediate;previousFocus=document.activeElement;
    dialog.innerHTML=`<button class="eco-picker-close" type="button" aria-label="Đóng chọn sản phẩm">×</button>
      <div class="eco-picker-photo"><img src="${escape(product.image)}" alt="${escape(product.alt||product.name)}" width="1199" height="1312"></div>
      <form class="eco-picker-form"><p class="eco-commerce-kicker">${escape(product.collection)}</p><h2 id="commerce-picker-title">${escape(product.name)}</h2><p class="eco-picker-color">${escape(product.color)}</p>
      <p class="eco-picker-price">${typeof product.price==='number'?money(product.price):'Giá đang cập nhật'}</p>
      ${product.sizes?.length?`<fieldset><legend>Chọn size</legend><div class="eco-picker-sizes">${product.sizes.map(size=>`<button type="button" data-picker-size="${escape(size)}" aria-pressed="false">${escape(size)}</button>`).join('')}</div></fieldset>`:''}
      <label class="eco-picker-quantity">Số lượng <input name="quantity" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" required></label>
      <p class="eco-picker-message" role="status">${product.sizes?.length?'Chọn size để tiếp tục.':''}</p>
      <button class="eco-commerce-primary" type="submit" ${product.sizes?.length?'disabled':''}>${immediate?'Thêm & đến giỏ hàng':'Thêm vào giỏ hàng'}</button></form>`;
    dialog.querySelector('.eco-picker-close').addEventListener('click',()=>dialog.close());
    dialog.querySelectorAll('[data-picker-size]').forEach(button=>button.addEventListener('click',()=>{
      selectedSize=button.dataset.pickerSize;
      dialog.querySelectorAll('[data-picker-size]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
      dialog.querySelector('[type="submit"]').disabled=false;
      dialog.querySelector('.eco-picker-message').textContent='Đã chọn size '+selectedSize+'.';
    }));
    dialog.querySelector('form').addEventListener('submit',event=>{
      event.preventDefault();const quantity=Number(new FormData(event.currentTarget).get('quantity'));
      if(!Number.isInteger(quantity)||quantity<1||quantity>MAX_QUANTITY)return;
      if(selectedProduct.sizes?.length&&!selectedProduct.sizes.includes(selectedSize))return;
      const saved=commit(addItem(items,selectedProduct.id,selectedSize,quantity,catalog));
      dialog.close();
      if(!saved)return;
      if(buyNow)location.href='/gio-hang/';
      else announce(`Đã thêm ${quantity} ${selectedProduct.name}${selectedSize?' · Size '+selectedSize:''}.`);
    });
    previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();
    (dialog.querySelector('[data-picker-size]')||dialog.querySelector('input')).focus();
  }

  const page=document.querySelector('[data-cart-page]');
  function orderText(){
    const summary=summarizeCart(items,catalog);
    return ['ECOFIT — GIỎ HÀNG',...items.map((item,index)=>{
      const product=products.find(p=>p.id===item.id);
      return `${index+1}. ${product.name} · ${product.color||product.collection}${item.size?' · Size '+item.size:' · Chưa chọn size'} · Số lượng: ${item.quantity}`;
    }),`Tổng số lượng: ${summary.quantity}`,summary.hasUnpriced?'Nhờ Ecofit xác nhận giá và phí giao hàng.':`Tạm tính: ${money(summary.subtotal)} (chưa gồm giao hàng).`].join('\n');
  }
  function renderPage(){
    if(!page)return;
    const summary=summarizeCart(items,catalog);
    page.querySelector('[data-cart-empty]').hidden=items.length>0;
    page.querySelector('[data-cart-layout]').hidden=items.length===0;
    page.querySelector('[data-cart-page-count]').textContent=summary.quantity+' sản phẩm';
    page.querySelector('[data-cart-lines]').innerHTML=items.map(item=>{
      const product=products.find(p=>p.id===item.id);
      return `<article class="eco-basket-item" data-item-key="${escape(itemKey(item))}">
        <a class="eco-basket-image" href="${escape(product.href)}"><img src="${escape(product.image)}" alt="${escape(product.alt||product.name)}" width="1199" height="1312"></a>
        <div class="eco-basket-item-copy"><p class="eco-commerce-kicker">${escape(product.collection)}</p><h2><a href="${escape(product.href)}">${escape(product.name)}</a></h2><p class="eco-basket-color">${escape(product.color)}</p>
        ${product.sizes?.length?`<label class="eco-basket-size">Size <select data-cart-action="size" aria-label="Size ${escape(product.name)}"><option value="" disabled ${item.size?'':'selected'}>Chọn size</option>${product.sizes.map(size=>`<option value="${escape(size)}" ${item.size===size?'selected':''}>${escape(size)}</option>`).join('')}</select></label>`:''}
        <div class="eco-basket-item-controls"><div class="eco-basket-quantity"><button type="button" data-cart-action="minus" aria-label="Giảm số lượng ${escape(product.name)} size ${escape(item.size)}" ${item.quantity<=1?'disabled':''}>−</button><output aria-label="Số lượng">${item.quantity}</output><button type="button" data-cart-action="plus" aria-label="Tăng số lượng ${escape(product.name)} size ${escape(item.size)}" ${item.quantity>=99?'disabled':''}>+</button></div><button type="button" class="eco-basket-remove" data-cart-action="remove" aria-label="Xóa ${escape(product.name)} size ${escape(item.size)}">Xóa</button></div></div>
        <strong class="eco-basket-line-price">${typeof product.price==='number'?money(product.price*item.quantity):'Giá đang cập nhật'}</strong></article>`;
    }).join('');
    page.querySelector('[data-cart-subtotal]').textContent=summary.hasUnpriced?'Chờ xác nhận giá':money(summary.subtotal);
    page.querySelector('[data-cart-summary-count]').textContent=String(summary.quantity);
    page.querySelector('[data-cart-size-note]').hidden=!summary.needsSize;
    page.querySelector('[data-cart-contact]').setAttribute('aria-disabled',String(summary.needsSize));
    page.querySelector('[data-cart-draft]').value=orderText();
    const accountNote=page.querySelector('[data-cart-account-note]');
    if(accountNote)accountNote.textContent=getAccountState().user?'Giỏ được lưu riêng theo tài khoản trên trình duyệt này.':'Giỏ được lưu trên trình duyệt này. Bạn có thể đăng nhập để lưu riêng theo tài khoản.';
  }
  function render(){
    const summary=summarizeCart(items,catalog);
    headerLink.querySelector('[data-basket-count]').textContent=String(summary.quantity);
    headerLink.setAttribute('aria-label',`Giỏ hàng, ${summary.quantity} sản phẩm`);renderPage();
  }
  function commit(next){
    items=next;
    const saved=saveCart(storage,items,activeCartKey);render();
    if(!saved)announce('Trình duyệt chưa lưu được giỏ. Giỏ hiện được giữ trong trang đang mở.');
    return saved;
  }
  document.addEventListener('click',event=>{
    const trigger=event.target.closest?.('[data-shop-add-cart],[data-add-cart]');
    if(!trigger)return;
    const id=trigger.dataset.productId||'bamboo-prime';const product=products.find(p=>p.id===id);
    if(!product)return;
    event.preventDefault();openPicker(product,false);
  });
  if(page){
    page.addEventListener('click',event=>{
      const control=event.target.closest?.('[data-cart-action]');
      if(control&&control.dataset.cartAction!=='size'){
        const row=control.closest('[data-item-key]'),key=row.dataset.itemKey,item=items.find(value=>itemKey(value)===key);
        if(!item)return;
        const action=control.dataset.cartAction;
        commit(updateQuantity(items,key,action==='remove'?0:item.quantity+(action==='plus'?1:-1)));
        const replacement=[...page.querySelectorAll('[data-item-key]')].find(el=>el.dataset.itemKey===key);
        const focus=replacement?.querySelector(`[data-cart-action="${action}"]:not(:disabled)`)||replacement?.querySelector('select')||page.querySelector('[data-continue-shop]');focus?.focus({preventScroll:true});
      }
      if(event.target.closest?.('[data-cart-contact][aria-disabled="true"]')){
        event.preventDefault();page.querySelector('select:has(option[value=""]:checked)')?.focus();
      }
    });
    page.addEventListener('change',event=>{
      const control=event.target.closest?.('[data-cart-action="size"]');
      if(!control)return;
      const key=control.closest('[data-item-key]').dataset.itemKey;const old=items.find(row=>itemKey(row)===key);
      if(!old)return;
      const nextKey=itemKey({...old,size:control.value});commit(updateSize(items,key,control.value,catalog));
      [...page.querySelectorAll('[data-item-key]')].find(row=>row.dataset.itemKey===nextKey)?.querySelector('select')?.focus({preventScroll:true});
    });
    page.querySelector('[data-copy-cart]').addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(orderText());page.querySelector('[data-cart-copy-status]').textContent='Đã sao chép. Gửi nội dung này cho Ecofit qua Zalo để đặt áo.';}
      catch{page.querySelector('[data-cart-order-details]').open=true;page.querySelector('[data-cart-draft]').focus();page.querySelector('[data-cart-draft]').select();page.querySelector('[data-cart-copy-status]').textContent='Chọn và sao chép nội dung bên dưới để gửi Ecofit.';}
    });
  }
  onAccountChange(account=>{
    if(!['guest','authenticated'].includes(account.status))return;
    const key=cartKeyForUser(account.user?.id);
    if(key===activeCartKey){render();return;}
    if(account.user){
      const claimed=claimGuestCart(storage,catalog,account.user.id);
      items=claimed.items;
      if(!claimed.saved)announce('Chưa lưu được giỏ theo tài khoản. Hãy bật lưu trữ của trình duyệt.');
    }else items=loadCart(storage,catalog);
    activeCartKey=key;render();
  });
  window.addEventListener('storage',event=>{if([activeCartKey,...(activeCartKey===CART_KEY?[LEGACY_KEY]:[]),null].includes(event.key)){items=loadCart(storage,catalog,activeCartKey);render();}});
  window.addEventListener('pageshow',event=>{if(event.persisted){items=loadCart(storage,catalog,activeCartKey);render();}});
  render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initializeCommerce(),{once:true});
else initializeCommerce();
