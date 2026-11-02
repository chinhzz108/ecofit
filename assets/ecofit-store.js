import {initializeCinematic} from './ecofit-cinematic.js?v=pointer-detail-2';
import {initializeFitPreview} from './ecofit-fit.js?v=fit-gender-1';
import {initializeLookbook,initializeSignature} from './ecofit-lookbook.js?v=signature-lookbook-1';

const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const front='/images/ecofit-white-tee-layer.webp';
const material='/images/ecofit-tee-material.webp';
const productViews=[
  {src:front,label:'Tổng thể',alt:'Áo Ecofit trắng gạo cổ tim, logo hồng và hai sọc hồng nhạt trên vai',width:1199,height:1312},
  {src:material,label:'Chi tiết',alt:'Cận cảnh cổ tim, hai sọc vai hồng và bề mặt vải Bamboo Prime màu trắng gạo',width:1122,height:1402},
  {src:'/images/ecofit-tee-front-back.webp',label:'Trước & sau',alt:'Mặt trước và mặt sau của cùng một mẫu áo Ecofit trắng gạo',width:1602,height:982},
  {src:'/images/ecofit-tee-runner.webp',label:'Trên người',alt:'Người mẫu nam mặc áo Ecofit cổ tim trắng gạo với hai sọc hồng nhạt khi chạy bộ, cho thấy chiếc áo trong chuyển động',width:1774,height:887,caption:'PHOM ÁO TRONG CHUYỂN ĐỘNG'}
];
const album=[
  {file:'ecofit-collection.webp',title:'Một tinh thần Ecofit',tag:'01 / BRAND STORY',alt:'Bộ ảnh giới thiệu tinh thần thương hiệu Ecofit'},
  {file:'ecofit-athleisure.webp',title:'Nhịp sống, nhịp riêng',tag:'02 / ATHLEISURE',alt:'Bộ ảnh cảm hứng phong cách athleisure Ecofit'},
  {file:'ecofit-green-sportswear.webp',title:'Chuyển động xanh',tag:'03 / MOVE GREENER',alt:'Bộ ảnh Ecofit Green Sportswear ngoài trời'},
  {file:'ecofit-bamboo-polo-sharp.webp',title:'Câu chuyện Bamboo',alt:'Poster Ecofit Bamboo với áo polo trắng, mẫu nam, khóm tre và thông tin chất liệu'},
  {file:'ecofit-bamboo-material.webp',title:'Chất liệu nhìn gần',alt:'Bộ ảnh nhìn gần bề mặt chất liệu Bamboo Ecofit'}
];
const bagIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>';
const closeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
const zoomIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></svg>';

function buildProduct(){
  const section=document.createElement('section');
  section.id='shop-products';section.className='eco-product';
  section.dataset.ecofitProductReady='true';section.dataset.ecofitMotionReady='true';
  section.setAttribute('aria-labelledby','eco-product-title');
  section.innerHTML=`<div class="eco-container">
    <div class="eco-section-line"><span>SẢN PHẨM / BAMBOO PRIME</span><a href="/chat-lieu/">Câu chuyện chất liệu ↗</a></div>
    <div class="eco-product-layout" id="eco-product-presentation">
    <div class="eco-product-gallery">
        <div class="eco-product-stage" data-view="0">
          <div class="eco-product-atmosphere" aria-hidden="true"><svg viewBox="0 0 700 700" preserveAspectRatio="none"><path d="M-80 560C110 650 420 140 790 200"/><path d="M-80 576C110 666 420 156 790 216"/></svg><i></i></div>
          <span class="eco-photo-edition">ECOFIT STUDIO / 01</span>
          <button class="eco-image-expand" type="button" data-product-zoom aria-label="Phóng to ảnh sản phẩm">${zoomIcon}</button>
        <div class="eco-product-image-space">${productViews.map((view,i)=>`<img class="eco-product-image eco-product-image--${i}${i===0?' is-active':''}" src="${view.src}" width="${view.width}" height="${view.height}" loading="lazy" decoding="async" alt="${view.alt}" aria-hidden="${i!==0}" draggable="false">`).join('')}</div>
          <div class="eco-product-pin eco-product-pin--neck"><button type="button" data-pin="0" aria-expanded="false" aria-label="Chi tiết cổ tim">01</button><span>Cổ tim gọn, viền bo mềm.</span></div>
          <div class="eco-product-pin eco-product-pin--stripe"><button type="button" data-pin="1" aria-expanded="false" aria-label="Chi tiết hai sọc vai">02</button><span>Hai sọc hồng nhạt từ vai xuống tay.</span></div>
          <div class="eco-product-pin eco-product-pin--logo"><button type="button" data-pin="2" aria-expanded="false" aria-label="Chi tiết logo Ecofit">03</button><span>Logo Ecofit hồng trên ngực áo.</span></div>
          <span class="eco-photo-caption">MỘT CHIẾC ÁO. MỘT CHẤT RIÊNG.</span>
          <span class="eco-photo-view" aria-live="polite">01 / TỔNG THỂ</span>
        </div>
        <div class="eco-product-views" role="group" aria-label="Góc nhìn sản phẩm">${productViews.map((view,i)=>`<button type="button" data-product-view="${i}" aria-pressed="${i===0}"><span class="eco-view-preview"><img src="${view.src}" alt="" loading="lazy" decoding="async"></span><span>${view.label}</span><span class="eco-view-index">0${i+1}</span></button>`).join('')}</div>
      </div>
      <div class="eco-product-info">
        <p class="eco-eyebrow">ECOFIT / BAMBOO PRIME</p>
        <h2 id="eco-product-title">Trắng gạo.<br><em>Chất riêng.</em></h2>
        <p class="eco-product-name">Áo thể thao Ecofit</p>
        <p class="eco-product-subtitle">Cổ tim. Tay ngắn. Hai sọc hồng nhạt.</p>
        <p class="eco-product-price" aria-label="Giá sản phẩm đang được cập nhật"><span>Giá sắp được cập nhật</span></p>
        <p class="eco-product-color"><span aria-hidden="true"></span>Trắng gạo <i>/</i> Hồng nhạt</p>
        <button class="eco-fit-trigger" type="button" data-fit-open>
          <span class="eco-fit-trigger-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 4.5 4.5 8l2 2 2-1.5 1 3.5-2 7h9l-2-7 1-3.5 2 1.5 2-2L17 4.5 14 6h-4L7 4.5Z"/><path d="M10 6c.3 1.5 3.7 1.5 4 0"/></svg></span>
          <span class="eco-fit-trigger-copy"><strong>Thử áo theo vóc dáng</strong><small>Chọn mẫu nam/nữ, chiều cao, cân nặng và size</small></span>
          <span class="eco-fit-trigger-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="eco-add-to-cart" type="button" data-add-cart><span>Thêm vào giỏ hàng</span>${bagIcon}</button>
        <a class="eco-product-contact" href="https://zalo.me/0868060624" target="_blank" rel="noopener noreferrer">Tư vấn size &amp; đặt áo qua Zalo <span aria-hidden="true">↗</span></a>
        <a class="eco-detail-link" href="/chat-lieu/#details">Nhìn gần từng chi tiết <span>↓</span></a>
        <dl class="eco-product-facts"><div><dt>CHẤT LIỆU</dt><dd>Bamboo Prime</dd></div><div><dt>THIẾT KẾ</dt><dd>Cổ tim, tay ngắn</dd></div></dl>
        <details class="eco-product-disclosure"><summary>Về thiết kế chiếc áo <span>+</span></summary><p>Chiếc áo màu trắng gạo, hai sọc hồng nhạt chạy từ cổ xuống tay áo. Logo Ecofit ở ngực trước và gấu áo sau tạo điểm nhấn đồng điệu.</p></details>
      </div>
    </div>
    <div class="eco-product-footnote"><span>BAMBOO PRIME</span><span>CỔ TIM / TRẮNG GẠO / HỒNG NHẠT</span><a href="/ve-ecofit/">Về Ecofit ↗</a></div>
  </div><div class="eco-mobile-buybar"><div><span>Áo Ecofit / Trắng gạo</span><strong>Chờ cập nhật</strong></div><button type="button" data-add-cart>Thêm vào giỏ ${bagIcon}</button></div>`;
  return section;
}

function buildDetails(){
  const section=document.createElement('section');
  section.className='eco-detail-section';section.id='ecofit-fabric-journey';
  section.setAttribute('aria-labelledby','eco-detail-title');
  section.innerHTML=`<div class="eco-detail-scroll" id="ecofit-materials"><div class="eco-detail-sticky"><div class="eco-container">
    <div class="eco-section-line"><span>02 / NHÌN GẦN HƠN</span><span>THE DETAILS MAKE THE DIFFERENCE</span></div>
    <div class="eco-detail-layout" id="eco-detail-presentation">
      <div class="eco-detail-image-stage">
        <img class="eco-detail-base" src="${material}" width="1122" height="1402" alt="Cận cảnh chiếc áo Ecofit trắng gạo và những chi tiết thiết kế" loading="lazy" decoding="async">
        <div class="eco-detail-focus" aria-hidden="true"><i></i><span>01 / CỔ TIM</span></div>
        <button class="eco-detail-expand" type="button" data-detail-zoom aria-label="Xem ảnh chi tiết chiếc áo">${zoomIcon}</button>
        <span class="eco-detail-photo-caption">ECOFIT / THE MATERIAL STUDY</span>
      </div>
      <div class="eco-detail-editorial">
        <p class="eco-eyebrow">BAMBOO PRIME / THE DETAIL STUDY</p>
        <h2 id="eco-detail-title">Chất ở<br><em>từng chi tiết.</em></h2>
        <div class="eco-detail-crop" aria-hidden="true"><img src="${material}" alt="" loading="lazy" decoding="async"><span>01 / CỔ TIM</span><i>NHÌN GẦN HƠN</i></div>
        <div class="eco-detail-chapters" role="group" aria-label="Chi tiết thiết kế">
          <button type="button" data-detail-step="0" aria-pressed="true"><span>01</span><div><strong>Cổ tim gọn.</strong><p>Đường cổ chữ V cùng viền bo trắng, tạo điểm nhấn nhẹ trên nền áo.</p></div><i>↗</i></button>
          <button type="button" data-detail-step="1" aria-pressed="false"><span>02</span><div><strong>Hai sọc. Một dấu ấn.</strong><p>Hai đường hồng nhạt chạy từ cổ xuống tay áo, nổi bật trên nền trắng gạo.</p></div><i>↗</i></button>
          <button type="button" data-detail-step="2" aria-pressed="false"><span>03</span><div><strong>Bamboo Prime.</strong><p>Nhìn gần bề mặt vải trắng gạo — chất liệu được chọn cho chiếc áo Ecofit.</p></div><i>↗</i></button>
        </div>
        <div class="eco-detail-progress"><span aria-hidden="true"></span><p>Rê chuột trên áo để khám phá <i>↓</i></p></div>
        <a href="/san-pham/ao-ecofit/" class="eco-detail-product-link">Xem sản phẩm <span>↗</span></a>
      </div>
    </div>
  </div></div></div>`;
  return section;
}

function modalShell(className,label){
  const dialog=document.createElement('dialog');dialog.className=className;dialog.setAttribute('aria-label',label);document.body.append(dialog);
  let previousOverflow='';
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;});
  return {dialog,open(){if(dialog.open)return;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}};
}

function initializeImageViewer(){
  const viewer=modalShell('eco-image-dialog','Ảnh Ecofit');
  viewer.dialog.innerHTML=`<div class="eco-image-dialog-top"><p data-image-title></p><button type="button" data-close-image aria-label="Đóng ảnh">${closeIcon}</button></div><div class="eco-image-dialog-stage"><img alt=""></div><div class="eco-image-dialog-bottom"><button type="button" data-image-prev aria-label="Ảnh trước">←</button><span data-image-count aria-live="polite"></span><button type="button" data-image-next aria-label="Ảnh tiếp theo">→</button></div>`;
  let list=[],index=0;
  function render(){const item=list[index],img=viewer.dialog.querySelector('.eco-image-dialog-stage img');img.src=item.src||`/images/${item.file}`;img.alt=item.alt;viewer.dialog.querySelector('[data-image-title]').textContent=item.title||item.label;viewer.dialog.querySelector('[data-image-count]').textContent=`${String(index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;}
  function move(delta){index=(index+delta+list.length)%list.length;render();}
  viewer.dialog.querySelector('[data-close-image]').addEventListener('click',()=>viewer.dialog.close());
  viewer.dialog.querySelector('[data-image-prev]').addEventListener('click',()=>move(-1));
  viewer.dialog.querySelector('[data-image-next]').addEventListener('click',()=>move(1));
  viewer.dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
  return (items,first=0)=>{list=items;index=first;render();viewer.open();};
}

function initializeCart(product,actions){
  const storageKey='ecofit:cart:white-tee:v1';
  const read=()=>{try{const value=JSON.parse(localStorage.getItem(storageKey)||'0');return Number.isFinite(value)?clamp(Math.floor(value),0,99):0;}catch{return 0;}};
  let quantity=read();
  const trigger=document.createElement('button');trigger.type='button';trigger.className='eco-header-bag';trigger.innerHTML=`${bagIcon}<span data-cart-badge>${quantity}</span>`;trigger.setAttribute('aria-label',`Giỏ hàng, ${quantity} sản phẩm`);actions.insertBefore(trigger,actions.querySelector('.ecofit-menu-trigger'));
  const cart=modalShell('eco-cart-dialog','Giỏ hàng Ecofit');
  cart.dialog.innerHTML=`<div class="eco-cart-head"><div><p class="eco-eyebrow">ECOFIT / YOUR SELECTION</p><h2>Giỏ hàng <span data-cart-heading-count>(${quantity})</span></h2></div><button type="button" data-close-cart aria-label="Đóng giỏ hàng">${closeIcon}</button></div>
    <div class="eco-cart-body"><div class="eco-cart-empty" ${quantity?'hidden':''}>${bagIcon}<h3>Một chút chất riêng.</h3><p>Giỏ hàng của bạn đang trống.</p><button type="button" data-shop-from-cart>Khám phá chiếc áo ↗</button></div>
      <div class="eco-cart-item" ${quantity?'':'hidden'}><div class="eco-cart-item-photo"><img src="${front}" width="1199" height="1312" alt="Áo Ecofit trắng gạo"></div><div class="eco-cart-item-info"><p>ECOFIT / BAMBOO PRIME</p><h3>Áo thể thao cổ tim</h3><span>Trắng gạo · Hồng nhạt</span><strong class="eco-cart-price-status">Giá đang cập nhật</strong><div class="eco-cart-item-controls"><div class="eco-quantity"><button type="button" data-cart-minus aria-label="Giảm số lượng áo">−</button><output data-cart-quantity aria-live="polite">${quantity}</output><button type="button" data-cart-plus aria-label="Tăng số lượng áo">+</button></div><button class="eco-cart-remove" type="button" data-cart-remove>Xóa</button></div></div></div></div>
    <div class="eco-cart-foot" ${quantity?'':'hidden'}><div><span>Tạm tính</span><strong class="eco-cart-price-status">Chờ cập nhật</strong></div><a class="eco-cart-contact" href="https://zalo.me/0868060624" target="_blank" rel="noopener noreferrer">Nhắn Zalo để đặt áo <span aria-hidden="true">↗</span></a><button type="button" data-continue-shopping>Tiếp tục khám phá <span>↗</span></button></div>`;
  const empty=cart.dialog.querySelector('.eco-cart-empty'),item=cart.dialog.querySelector('.eco-cart-item'),foot=cart.dialog.querySelector('.eco-cart-foot');
  function render(save=true){
    if(save){try{localStorage.setItem(storageKey,JSON.stringify(quantity));}catch{}}
    trigger.querySelector('[data-cart-badge]').textContent=String(quantity);trigger.setAttribute('aria-label',`Giỏ hàng, ${quantity} sản phẩm`);
    cart.dialog.querySelector('[data-cart-heading-count]').textContent=`(${quantity})`;cart.dialog.querySelector('[data-cart-quantity]').textContent=String(quantity);
    cart.dialog.querySelector('[data-cart-plus]').disabled=quantity>=99;
    empty.hidden=quantity>0;item.hidden=quantity===0;foot.hidden=quantity===0;
  }
  function shop(){cart.dialog.close();const productSection=document.getElementById('shop-products');if(productSection)productSection.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});else location.href='/san-pham/ao-ecofit/';}
  trigger.addEventListener('click',()=>cart.open());
  cart.dialog.querySelector('[data-close-cart]').addEventListener('click',()=>cart.dialog.close());
  cart.dialog.querySelector('[data-cart-minus]').addEventListener('click',()=>{quantity=Math.max(0,quantity-1);render();if(!quantity)cart.dialog.querySelector('[data-shop-from-cart]').focus();});
  cart.dialog.querySelector('[data-cart-plus]').addEventListener('click',()=>{quantity=Math.min(99,quantity+1);render();});
  cart.dialog.querySelector('[data-cart-remove]').addEventListener('click',()=>{quantity=0;render();cart.dialog.querySelector('[data-shop-from-cart]').focus();});
  cart.dialog.querySelector('[data-shop-from-cart]').addEventListener('click',shop);cart.dialog.querySelector('[data-continue-shopping]').addEventListener('click',shop);
  product?.querySelectorAll('[data-add-cart]').forEach(button=>button.addEventListener('click',()=>{quantity=Math.min(99,quantity+1);render();cart.open();}));
  window.addEventListener('storage',event=>{if(event.key===storageKey){quantity=read();render(false);}});
  render(false);
}

function initializeProduct(product,openImages){
  const stage=product.querySelector('.eco-product-stage'),buttons=[...product.querySelectorAll('[data-product-view]')],images=[...stage.querySelectorAll('.eco-product-image')];
  let selected=0;
  function select(index){
    selected=index;stage.dataset.view=String(index);
    images.forEach((img,i)=>{img.classList.toggle('is-active',i===index);img.setAttribute('aria-hidden',String(i!==index));if(i===index)img.loading='eager';});
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    stage.querySelector('.eco-photo-view').textContent=`${String(index+1).padStart(2,'0')} / ${productViews[index].label.toLocaleUpperCase('vi')}`;
    stage.querySelector('.eco-photo-caption').textContent=productViews[index].caption||'MỘT CHIẾC ÁO. MỘT CHẤT RIÊNG.';
    stage.querySelectorAll('[data-pin]').forEach(button=>{button.setAttribute('aria-expanded','false');button.parentElement.classList.remove('is-open');});
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
  product.querySelector('[data-product-zoom]').addEventListener('click',()=>openImages(productViews,selected));
  stage.querySelectorAll('[data-pin]').forEach(button=>button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')==='true';
    stage.querySelectorAll('[data-pin]').forEach(other=>{other.setAttribute('aria-expanded','false');other.parentElement.classList.remove('is-open');});
    button.setAttribute('aria-expanded',String(!expanded));button.parentElement.classList.toggle('is-open',!expanded);
  }));
  let px=0,py=0,x=0,y=0,raf=0,onScreen=false;
  function schedule(){if(!raf&&onScreen&&!document.hidden&&!reduced)raf=requestAnimationFrame(tick);}
  function tick(){
    raf=0;if(!onScreen||document.hidden)return;
    x+=(px-x)*.12;y+=(py-y)*.12;
    const rect=stage.getBoundingClientRect(),scroll=clamp((innerHeight-rect.top)/(innerHeight+rect.height));
    stage.style.setProperty('--product-x',`${x*13}px`);stage.style.setProperty('--product-y',`${y*8+(scroll-.5)*-22}px`);
    stage.style.setProperty('--product-rotate',`${-3+x*3+scroll*3}deg`);stage.style.setProperty('--product-tilt',`${x*7}deg`);
    stage.style.setProperty('--light-x',`${50+x*22}%`);stage.style.setProperty('--light-y',`${35+y*20}%`);
    if(Math.abs(px-x)+Math.abs(py-y)>.005)schedule();
  }
  stage.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const rect=stage.getBoundingClientRect();px=(event.clientX-rect.left)/rect.width*2-1;py=(event.clientY-rect.top)/rect.height*2-1;schedule();});
  stage.addEventListener('pointerleave',()=>{px=0;py=0;schedule();});
  new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting;if(onScreen)product.classList.add('eco-product-in-view');schedule();},{rootMargin:'100px'}).observe(stage);
  new IntersectionObserver(([entry])=>{
    product.classList.toggle('eco-product-on-screen',entry.isIntersecting);
    document.body.classList.toggle('ecofit-product-visible',entry.isIntersecting);
  }).observe(product);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);
}

function initializeDetails(section,openImages){
  const area=section.querySelector('.eco-detail-scroll'),sticky=section.querySelector('.eco-detail-sticky'),stage=section.querySelector('.eco-detail-image-stage');
  const focus=stage.querySelector('.eco-detail-focus'),crop=section.querySelector('.eco-detail-crop'),cropImage=crop.querySelector('img');
  const buttons=[...section.querySelectorAll('[data-detail-step]')];
  const coordinates=[[.58,.50],[.89,.34],[.36,.74]],labels=['01 / CỔ TIM','02 / HAI SỌC HỒNG','03 / BAMBOO PRIME'];
  let target=0,value=0,index=-1,raf=0,inView=false,lastTime=0,jump=null;
  let pointerActive=false,pointerIndex=0,pointerTarget=null,pointerValue={x:coordinates[0][0],y:coordinates[0][1]},pointerRect=null;
  const mobile=()=>window.innerWidth<=760;
  function schedule(){if(!raf&&inView&&!document.hidden)raf=requestAnimationFrame(tick);}
  function coordinateAt(progress){
    const phase=Math.min(1,Math.floor(progress*2)),fraction=progress*2-phase,a=coordinates[phase],b=coordinates[phase+1];
    return {x:a[0]+(b[0]-a[0])*fraction,y:a[1]+(b[1]-a[1])*fraction};
  }
  function setIndex(next){
    if(next===index)return;index=next;
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    focus.querySelector('span').textContent=labels[index];crop.querySelector('span').textContent=labels[index];
  }
  function previewPointerDetail(next,point){
    if(!pointerActive)pointerValue=coordinateAt(value);
    pointerActive=true;pointerIndex=next;pointerTarget=point;target=next/2;jump=null;
    setIndex(next);schedule();
  }
  function releasePointerDetail(){
    if(!pointerActive)return;
    pointerActive=false;pointerTarget=null;jump=null;schedule();
  }
  function tick(now){
    raf=0;if(!inView||document.hidden)return;
    const dt=Math.min(40,Math.max(1,now-(lastTime||now-16.7)));lastTime=now;
    const r=area.getBoundingClientRect(),height=sticky.getBoundingClientRect().height;
    if(!mobile()&&!reduced&&!pointerActive){const actual=clamp((82-r.top)/Math.max(1,r.height-height));if(jump!==null&&Math.abs(actual-jump)<.025)jump=null;target=jump??actual;}
    const delta=target-value;value=reduced?target:value+delta*(1-Math.exp(-dt/130));if(Math.abs(delta)<.0002)value=target;
    setIndex(pointerActive?pointerIndex:Math.round(value*2));
    const scrollCoordinate=coordinateAt(value);
    if(pointerActive&&pointerTarget){
      const follow=reduced?1:1-Math.exp(-dt/75);
      pointerValue.x+=(pointerTarget.x-pointerValue.x)*follow;pointerValue.y+=(pointerTarget.y-pointerValue.y)*follow;
    }
    const cx=pointerActive?pointerValue.x:scrollCoordinate.x,cy=pointerActive?pointerValue.y:scrollCoordinate.y;
    const rect=stage.getBoundingClientRect(),w=rect.width,h=rect.height,scale=Math.max(w/1122,h/1402),iw=1122*scale,ih=1402*scale;
    const fw=Math.min(142,w*.27),fh=fw*.8,tx=clamp((w-iw)/2+cx*iw,fw/2+15,w-fw/2-15),ty=clamp((h-ih)/2+cy*ih,fh/2+18,h-fh/2-38);
    focus.style.width=`${fw}px`;focus.style.height=`${fh}px`;focus.style.transform=`translate3d(${tx-fw/2}px,${ty-fh/2}px,0)`;
    const cropRect=crop.getBoundingClientRect(),zoom=2.2,imageWidth=iw*zoom,imageHeight=ih*zoom;
    const cropX=clamp(cropRect.width*.5-cx*imageWidth,cropRect.width-imageWidth,0);
    const cropY=clamp(cropRect.height*.5-cy*imageHeight,cropRect.height-imageHeight,0);
    cropImage.style.width=`${imageWidth}px`;cropImage.style.height=`${imageHeight}px`;cropImage.style.transform=`translate3d(${cropX}px,${cropY}px,0)`;
    section.style.setProperty('--detail-progress',value);
    if(Math.abs(delta)>.0002)schedule();
  }
  stage.addEventListener('pointerenter',event=>{if(event.pointerType==='touch'||mobile())return;pointerRect=stage.getBoundingClientRect();});
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||mobile())return;
    pointerRect=pointerRect||stage.getBoundingClientRect();
    const rect=pointerRect,scale=Math.max(rect.width/1122,rect.height/1402),imageWidth=1122*scale,imageHeight=1402*scale;
    const point={
      x:clamp((event.clientX-rect.left-(rect.width-imageWidth)/2)/imageWidth),
      y:clamp((event.clientY-rect.top-(rect.height-imageHeight)/2)/imageHeight)
    };
    let nearest=0,nearestDistance=Infinity;
    coordinates.forEach(([x,y],i)=>{const distance=Math.hypot((point.x-x)*imageWidth,(point.y-y)*imageHeight);if(distance<nearestDistance){nearest=i;nearestDistance=distance;}});
    previewPointerDetail(nearest,point);
  });
  stage.addEventListener('pointerleave',releasePointerDetail);
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{
    target=i/2;setIndex(i);
    if(mobile()||reduced){jump=null;}
    else{jump=target;const r=area.getBoundingClientRect(),height=sticky.getBoundingClientRect().height;window.scrollTo({top:scrollY+r.top-82+(r.height-height)*target,behavior:'smooth'});}
    schedule();
  }));
  buttons.forEach((button,i)=>{
    button.addEventListener('pointerenter',event=>{if(event.pointerType==='touch'||mobile())return;previewPointerDetail(i,coordinates[i]);});
    button.addEventListener('pointerleave',event=>{if(event.pointerType==='touch'||mobile())return;releasePointerDetail();});
    button.addEventListener('focus',()=>previewPointerDetail(i,coordinates[i]));
    button.addEventListener('blur',releasePointerDetail);
  });
  section.querySelector('[data-detail-zoom]').addEventListener('click',()=>openImages(productViews,1));
  new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;section.classList.toggle('is-motion-active',inView);schedule();},{rootMargin:'250px'}).observe(section);
  window.addEventListener('scroll',()=>{if(pointerActive)pointerRect=stage.getBoundingClientRect();schedule();},{passive:true});
  window.addEventListener('resize',()=>{pointerRect=stage.getBoundingClientRect();schedule();},{passive:true});
  window.addEventListener('wheel',()=>{jump=null;},{passive:true});window.addEventListener('touchstart',()=>{jump=null;},{passive:true});document.addEventListener('visibilitychange',schedule);
  new ResizeObserver(schedule).observe(stage);
}

function initializeScrollReveals(stories,product){
  if(reduced||!('IntersectionObserver'in window))return;
  const specs=[...(stories?.querySelectorAll('.ecofit-cinematic-specs>div')||[])];
  const targets=[
    stories?.querySelector('.ecofit-cinematic-note .ecofit-bamboo-interlude'),
    ...specs,
    product?.querySelector('.eco-product-views'),
    product?.querySelector('.eco-product-footnote'),
    document.getElementById('ecofit-footer')
  ].filter(Boolean);
  if(!targets.length)return;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('eco-scroll-revealed');
      observer.unobserve(entry.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
  targets.forEach(target=>{
    target.classList.add('eco-scroll-reveal');
    const index=specs.indexOf(target);
    if(index>=0)target.style.setProperty('--eco-scroll-delay',`${index*90}ms`);
    observer.observe(target);
  });
}

function initializePageProgress(){
  if(document.querySelector('.ecofit-page-progress'))return;
  const progress=document.createElement('div');
  progress.className='ecofit-page-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.prepend(progress);
}

function mount(){
  if(document.documentElement.classList.contains('ecofit-store-ready'))return true;
  if(document.body.dataset.ecofitPage==='product'){
    const host=document.querySelector('[data-eco-product-root]'),actions=document.querySelector('.ecofit-header-actions');
    if(!host||!actions||!document.querySelector('.ecofit-menu-trigger'))return false;
    const product=buildProduct();host.append(product);
    const openImages=initializeImageViewer();initializeCart(product,actions);initializeProduct(product,openImages);initializeFitPreview(product);
    initializeScrollReveals(null,product);initializeSignature(product);initializePageProgress();
    document.documentElement.classList.add('ecofit-store-ready');
    return true;
  }
  const stories=document.getElementById('ecofit-stories'),oldShop=document.getElementById('shop-products'),actions=document.querySelector('.ecofit-header-actions');
  if(!stories||!oldShop||!actions||!document.querySelector('.ecofit-menu-trigger'))return false;
  const details=buildDetails();
  if(!initializeCinematic(stories,details))return false;
  oldShop.remove();
  initializeLookbook(stories);initializeSignature(stories);
  const openImages=initializeImageViewer();initializeCart(null,actions);initializeDetails(details,openImages);
  initializeScrollReveals(stories,null);initializePageProgress();
  stories.querySelectorAll('.ecofit-bamboo-image').forEach((figure,i)=>{
    const button=document.createElement('button');button.type='button';button.className='eco-brand-image-expand';button.setAttribute('aria-label','Phóng to ảnh chất liệu Bamboo');button.innerHTML=zoomIcon;
    button.addEventListener('click',()=>openImages(album,i===0?3:4));figure.append(button);
  });
  document.documentElement.classList.add('ecofit-store-ready');
  const hash=decodeURIComponent(location.hash.slice(1));
  if(hash==='shop-products'){location.replace('/san-pham/ao-ecofit/');return true;}
  if(['shop-products','ecofit-white-in-motion','ecofit-fabric-journey','ecofit-materials','ecofit-lookbook','ecofit-motion-journal','ecofit-stories'].includes(hash))requestAnimationFrame(()=>{
    const target=document.getElementById(hash);
    if(!target)return;
    if(hash==='ecofit-white-in-motion')window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top,behavior:'instant'});
    else target.scrollIntoView({behavior:'instant',block:'start'});
  });
  return true;
}
if(!mount()){
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
  observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
}

