const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(value,start,end)=>{const t=clamp((value-start)/(end-start));return t*t*(3-2*t);};
const THREAD_SEGMENT_COUNT=64;
const THREAD_REVEAL_END=.42;
const galleryFiles=['ecofit-collection.webp','ecofit-athleisure.webp','ecofit-green-sportswear.webp'];
const galleryNames=['Bộ ảnh thương hiệu Ecofit','Cảm hứng athleisure Ecofit','Ecofit Green Sportswear'];
const shirtSeam='M 448 50 C 420 54 399 66 383 80 C 352 98 322 111 299 120 C 260 142 228 174 204 200 C 178 231 166 264 159 280 C 145 307 126 340 113 360 C 89 400 66 439 58 460 C 55 481 69 498 89 510 C 132 549 207 596 268 620 L 234 1258 C 233 1270 238 1278 255 1281 C 360 1292 830 1292 944 1281 C 961 1278 968 1270 967 1258 L 933 620 C 994 596 1067 549 1110 510 C 1130 498 1144 481 1141 460 C 1133 439 1110 400 1083 360 C 1070 340 1051 307 1038 280 C 1031 264 1019 231 994 200 C 970 174 938 142 900 120 C 877 111 847 98 816 80 C 800 66 779 54 751 50 C 710 67 678 148 600 274 C 522 148 490 67 448 50 Z';
const shirtDetails='M 432 78 C 476 137 532 219 600 275 C 668 219 724 137 768 78 M 418 72 C 358 105 284 132 226 176 C 177 213 144 268 124 322 C 106 369 88 414 74 435 M 402 101 C 345 124 278 158 238 191 C 203 220 186 263 173 309 C 158 359 134 408 106 440 M 781 72 C 841 105 915 132 973 176 C 1022 213 1055 268 1075 322 C 1093 369 1111 414 1125 435 M 797 101 C 854 124 921 158 961 191 C 996 220 1013 263 1026 309 C 1041 359 1065 408 1093 440';
function buildThreadSegments(measurePath,container){
  if(!measurePath||!container)return [];
  const total=measurePath.getTotalLength();
  if(!Number.isFinite(total)||total<=0)return [];
  const svgNS='http://www.w3.org/2000/svg';
  const segments=[];
  for(let index=0;index<THREAD_SEGMENT_COUNT;index++){
    const start=total*index/THREAD_SEGMENT_COUNT;
    const end=total*(index+1)/THREAD_SEGMENT_COUNT;
    const samples=Math.max(3,Math.ceil((end-start)/8));
    let d='';
    for(let sample=0;sample<=samples;sample++){
      const point=measurePath.getPointAtLength(start+(end-start)*sample/samples);
      d+=`${sample?' L':'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }
    const segment=document.createElementNS(svgNS,'g');
    segment.setAttribute('class','ecofit-thread-segment');
    const rangeStart=THREAD_REVEAL_END*100*index/THREAD_SEGMENT_COUNT;
    const rangeEnd=THREAD_REVEAL_END*100*(index+1)/THREAD_SEGMENT_COUNT;
    segment.style.setProperty('animation-range',`contain ${rangeStart.toFixed(4)}% contain ${rangeEnd.toFixed(4)}%`);
    const underlay=document.createElementNS(svgNS,'path');
    underlay.setAttribute('class','ecofit-thread-segment-underlay');
    underlay.setAttribute('d',d);
    const stitch=document.createElementNS(svgNS,'path');
    stitch.setAttribute('class','ecofit-thread-segment-stitch');
    stitch.setAttribute('d',d);
    stitch.style.strokeDashoffset=String(-start);
    segment.append(underlay,stitch);
    container.append(segment);
    segments.push(segment);
  }
  measurePath.remove();
  return segments;
}
const journalCopy=[
  {label:'THE ECOFIT EDIT',title:'Một tinh thần.<br> <em>Nhiều cách<br> thể hiện.</em>',description:'Một góc nhìn về Ecofit: thể thao, đời sống và cá tính trong cùng một nhịp chuyển động.'},
  {label:'EVERYDAY ATHLEISURE',title:'Từ nhịp sống,<br> <em>đến<br> nhịp riêng.</em>',description:'Cảm hứng thể thao bước ra phố. Tự do chuyển động, tự do thể hiện phong cách của bạn.'},
  {label:'MOVE GREENER',title:'Chuyển động.<br> <em>Theo cách<br> của bạn.</em>',description:'Câu chuyện về chất liệu, cảm hứng sống xanh và những chuyển động mỗi ngày cùng Ecofit.'}
];

function journalStage(){
  return `<div class="ecofit-journal-art" aria-hidden="true"><span>In motion.</span><i></i></div>
    <div class="ecofit-journal-deck" aria-label="Bộ ảnh Ecofit">
      ${galleryFiles.map((file,i)=>`<button class="ecofit-journal-card${i===0?' is-current':''}" type="button" data-journal-card="${i}" aria-label="${i+1}. ${galleryNames[i]}" aria-current="${i===0?'true':'false'}" style="--card-aspect:${i===2?'1672 / 941':'1086 / 1448'}"><span class="ecofit-journal-paper"><img src="/images/${file}" width="${i===2?1672:1086}" height="${i===2?941:1448}" loading="lazy" decoding="async" draggable="false" alt="${galleryNames[i]}"></span></button>`).join('')}
    </div>
    <div class="ecofit-journal-editorial">
      <span class="ecofit-journal-number" aria-hidden="true">01</span>
      ${journalCopy.map((copy,i)=>`<div class="ecofit-journal-copy${i===0?' is-current':''}" data-journal-copy="${i}" aria-hidden="${i===0?'false':'true'}"><p class="ecofit-journal-kicker">${copy.label}</p><h3>${copy.title}</h3><p class="ecofit-journal-description">${copy.description}</p></div>`).join('')}
      <span class="ecofit-journal-signature" aria-hidden="true">The art of moving.</span>
    </div>
    <span class="ecofit-journal-edition">ECOFIT JOURNAL — VOL. 01</span>`;
}

function createChapter(scene,id,eyebrow,title,description){
  const section=document.createElement('section');
  section.className='ecofit-cinematic';section.id=id;section.dataset.cinematicScene=scene;
  section.setAttribute('aria-labelledby',`${id}-title`);
  let fallback;
  if(scene==='stage')fallback=`<strong aria-hidden="true">ECOFIT</strong><img class="ecofit-cinematic-fabric" src="/images/ecofit-white-fabric-layer.webp" srcset="/images/ecofit-white-fabric-384.webp 384w, /images/ecofit-white-fabric-640.webp 640w, /images/ecofit-white-fabric-960.webp 960w, /images/ecofit-white-fabric-layer.webp 1774w" sizes="75vw" width="1774" height="887" loading="lazy" decoding="async" alt=""><div class="ecofit-shirt-composition" data-shirt-composition><img class="ecofit-cinematic-shirt" src="/images/ecofit-white-tee-layer.webp" srcset="/images/ecofit-white-tee-384.webp 384w, /images/ecofit-white-tee-640.webp 640w, /images/ecofit-white-tee-960.webp 960w, /images/ecofit-white-tee-layer.webp 1199w" sizes="(max-width: 700px) 64vw, (max-width: 1100px) 40vw, 43vw" width="1199" height="1312" loading="lazy" decoding="async" alt="Áo Ecofit trắng gạo cổ tim với hai sọc hồng nhạt"><svg class="ecofit-thread-artwork" data-thread-artwork viewBox="0 0 1199 1312" preserveAspectRatio="none" aria-hidden="true"><path class="ecofit-thread-measure" data-thread-measure d="${shirtSeam}"/><g class="ecofit-thread-segments" data-thread-segments></g><path class="ecofit-thread-detail" data-thread-detail d="${shirtDetails}"/></svg></div>`;
  else if(scene==='weave')fallback='<img class="ecofit-cinematic-poster" src="/images/ecofit-tee-material.webp" width="1122" height="1402" loading="lazy" decoding="async" alt="Cận cổ tim, hai sọc vai hồng và vải trắng gạo Ecofit">';
  else fallback='';
  const isJournal=scene==='journal';
  section.innerHTML=`<div class="ecofit-cinematic-heading"><p class="ecofit-cinematic-eyebrow">${eyebrow}</p><h2 id="${id}-title">${title}</h2><p>${description}</p></div>
    <div class="ecofit-cinematic-scroll"><div class="ecofit-cinematic-sticky"><div class="ecofit-cinematic-frame">
      ${isJournal?journalStage():`<div class="ecofit-cinematic-fallback">${fallback}</div>`}
      <img class="ecofit-cinematic-mark" src="/images/ecofit-logo.png" width="110" height="58" alt="Ecofit" loading="lazy">
      <span class="ecofit-cinematic-frame-label">${scene==='stage'?'WHITE IN MOTION':scene==='weave'?'BAMBOO PRIME':'ECOFIT JOURNAL'}</span>
      ${scene==='stage'?'<div class="ecofit-cinematic-story" data-stage-story><p>BAMBOO PRIME / ECOFIT WHITE EDITION</p><h3>Mềm mại.<br><em>Thoáng khí.</em></h3><span>Dễ chịu trong từng chuyển động.</span></div>':''}
      ${scene==='stage'?'<div class="ecofit-cinematic-caption"><span>ECOFIT / BAMBOO PRIME</span><strong>CHẤT RIÊNG.<br>CHUYỂN ĐỘNG RIÊNG.</strong></div>':''}
    </div><div class="ecofit-cinematic-bottom">
      ${isJournal?'<div class="ecofit-cinematic-gallery-controls"><button type="button" data-gallery-prev aria-label="Ảnh trước">←</button><span class="ecofit-cinematic-gallery-count" aria-live="polite">01 / 03</span><button type="button" data-gallery-next aria-label="Ảnh tiếp theo">→</button><button type="button" data-open-gallery>Xem ảnh ↗</button></div>':'<a href="/san-pham/ao-ecofit/">Xem áo Ecofit ↗</a>'}
      <div class="ecofit-cinematic-cue" ${isJournal?'':'data-scroll-cue'}>${isJournal?'<span>Kéo ngang để đổi góc nhìn ↔</span>':'<span class="ecofit-thread-step" data-thread-step aria-live="polite">01 / MỞ LỚP VẢI</span><span>Cuộn để khám phá ↓</span>'}<span class="ecofit-cinematic-progress" aria-hidden="true"></span></div>
    </div></div></div>`;
  if(scene==='stage')section.querySelector('.ecofit-cinematic-sticky')?.prepend(section.querySelector('.ecofit-cinematic-heading'));
  return section;
}

function integrateStories(stories,detailChapter){
  if(stories.dataset.cinematicReady==='true')return null;
  const inner=stories.querySelector('.ecofit-stories-inner');
  const bamboo=inner?.querySelector('.ecofit-bamboo-group');
  const feature=inner?.querySelector('.ecofit-tee-feature');
  const collection=inner?.querySelector('.ecofit-collection-grid');
  if(!inner||!feature||!collection)return null;
  stories.dataset.cinematicReady='true';
  const first=createChapter('stage','ecofit-white-in-motion','01 / ECOFIT WHITE EDITION','Trắng gạo. <em>Chất riêng.</em>','Cổ tim gọn, hai sọc hồng nhạt và sắc trắng gạo. Một thiết kế Ecofit cho những chuyển động mỗi ngày.');
  const second=detailChapter;
  const third=createChapter('journal','ecofit-motion-journal','03 / THE ECOFIT JOURNAL','Chất riêng, <em>không giới hạn.</em>','Một tuyển tập hình ảnh về phong cách và cảm hứng thể thao Ecofit.');
  feature.before(first);
  const interlude=inner.querySelector('.ecofit-bamboo-interlude');
  const secondBamboo=inner.querySelector('.ecofit-bamboo-image--second');
  if(bamboo&&interlude&&secondBamboo){const note=document.createElement('div');note.className='ecofit-cinematic-note';note.append(interlude,secondBamboo);bamboo.after(note);}
  feature.replaceWith(second);
  inner.querySelector('.ecofit-collection-heading')?.remove();
  inner.querySelector('.ecofit-cinematic-specs')?.remove();
  collection.replaceWith(third);
  inner.querySelector('.ecofit-closing-banner')?.remove();
  return [first,third];
}

function startMotion(chapters){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const entries=chapters.map(section=>({section,area:section.querySelector('.ecofit-cinematic-scroll'),frame:section.querySelector('.ecofit-cinematic-frame'),mode:section.dataset.cinematicScene,progress:0}));
  const stage=entries.find(entry=>entry.mode==='stage');
  const thread=stage?.frame.querySelector('[data-thread-artwork]');
  const threadMeasure=thread?.querySelector('[data-thread-measure]');
  const threadSegmentsContainer=thread?.querySelector('[data-thread-segments]');
  const nativeMotion=!reduced&&Boolean(window.CSS?.supports?.('animation-timeline: view()')&&window.CSS?.supports?.('animation-range: contain'));
  const threadSegmentNodes=buildThreadSegments(threadMeasure,threadSegmentsContainer);
  let lastThreadSegmentCount=-1;
  function updateThreadSegments(progress,force=false){
    if((nativeMotion&&!force)||!threadSegmentNodes.length)return;
    const count=Math.floor(clamp(progress/THREAD_REVEAL_END)*threadSegmentNodes.length+.00001);
    if(count===lastThreadSegmentCount)return;
    if(lastThreadSegmentCount<0){
      threadSegmentNodes.forEach((segment,index)=>segment.classList.toggle('is-revealed',index<count));
    }else{
      const low=Math.min(lastThreadSegmentCount,count),high=Math.max(lastThreadSegmentCount,count);
      for(let index=low;index<high;index++)threadSegmentNodes[index].classList.toggle('is-revealed',index<count);
    }
    lastThreadSegmentCount=count;
  }
  if(stage)stage.section.dataset.nativeMotion=String(nativeMotion);
  const threadStep=stage?.section.querySelector('[data-thread-step]');
  const stageComposition=stage?.frame.querySelector('[data-shirt-composition]');
  const stageShirt=stage?.frame.querySelector('.ecofit-cinematic-shirt');
  const stageFabric=stage?.frame.querySelector('.ecofit-cinematic-fabric');
  const stageWord=stage?.frame.querySelector('.ecofit-cinematic-fallback>strong');
  const stageHeading=stage?.section.querySelector('.ecofit-cinematic-heading');
  const stageBottom=stage?.section.querySelector('.ecofit-cinematic-bottom');
  const stageCaption=stage?.frame.querySelector('.ecofit-cinematic-caption');
  const stageStory=stage?.frame.querySelector('[data-stage-story]');
  if(reduced&&stage){
    updateThreadSegments(1,true);
    stage.section.dataset.threadComplete='true';
    if(stageComposition)stageComposition.style.transform='translate3d(calc(-50% + var(--shirt-shift-x, 0px)),0,0)';
    if(stageShirt)stageShirt.style.opacity='1';
    if(stageFabric)stageFabric.style.opacity='0';
    if(stageWord)stageWord.style.opacity='0';
    if(stageStory)stageStory.style.opacity='1';
  }
  let lastThreadStep=-1;
  let stageScrollTop=0,stageScrollRange=1,stageScrollHeight=0;
  const gallery=entries.find(entry=>entry.mode==='journal');
  const pointer={x:0,y:0};
  const header=document.querySelector('header.ecofit-header');
  let raf=0,visible=!document.hidden,drag=null,lastIndex=-1,stageInView=false,galleryInView=false,galleryAnimating=false;
  let galleryVisual=0,lastTick=0,ignoreClick=false,headerHeight=header?.offsetHeight||0,lastImmersive=null;
  function setImmersive(open){
    const next=Boolean(open);
    if(next===lastImmersive)return;
    header?.classList.toggle('ecofit-immersive-open',next);
    lastImmersive=next;
  }
  function updateNativeStageSignals(){
    if(!stage||!nativeMotion)return;
    const scrollY=window.scrollY;
    stage.progress=clamp((scrollY-stageScrollTop)/stageScrollRange);
    const complete=stage.progress>=THREAD_REVEAL_END;
    if(stage.section.dataset.threadComplete!==String(complete))stage.section.dataset.threadComplete=String(complete);
    const step=stage.progress<.30?0:stage.progress<.76?1:2;
    if(step!==lastThreadStep&&threadStep){
      threadStep.textContent=['01 / MỞ LỚP VẢI','02 / LỘ PHOM ÁO','03 / ĐƯỜNG MAY HOÀN TẤT'][step];
      lastThreadStep=step;
    }
    setImmersive(scrollY>=stageScrollTop-headerHeight&&scrollY<stageScrollTop+stageScrollHeight);
  }
  function measureStage(){
    if(!stage)return;
    const areaRect=stage.area.getBoundingClientRect();
    const frameRect=stage.frame.getBoundingClientRect();
    stageScrollTop=areaRect.top+window.scrollY;
    stageScrollRange=Math.max(1,areaRect.height-frameRect.height);
    stageScrollHeight=areaRect.height;
    updateNativeStageSignals();
  }
  const cards=[...gallery.frame.querySelectorAll('[data-journal-card]')];
  const copies=[...gallery.frame.querySelectorAll('[data-journal-copy]')];
  const deck=gallery.frame.querySelector('.ecofit-journal-deck');
  let deckWidth=deck.clientWidth,renderedDeckWidth=-1,renderedGallery=NaN,renderedPointerX=NaN,renderedPointerY=NaN;
  gallery.frame.setAttribute('tabindex','0');
  gallery.frame.setAttribute('role','region');
  gallery.frame.setAttribute('aria-label','Bộ ảnh Ecofit. Dùng phím trái, phải để đổi ảnh.');
  let startBodyOverflow='';
  const dialog=document.createElement('dialog');dialog.className='ecofit-cinematic-dialog';
  dialog.innerHTML='<button type="button" aria-label="Đóng ảnh">Đóng ×</button><img alt="">';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.style.overflow=startBodyOverflow;});
  function openGallery(){
    const index=Math.round(gallery.progress*2);const img=dialog.querySelector('img');img.src=`/images/${galleryFiles[index]}`;img.alt=galleryNames[index];
    startBodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();
  }
  gallery.section.querySelector('[data-open-gallery]').addEventListener('click',openGallery);
  function galleryTo(index){gallery.progress=((index+3)%3)/2;schedule();}
  gallery.section.querySelector('[data-gallery-prev]').addEventListener('click',()=>galleryTo(Math.round(gallery.progress*2)-1));
  gallery.section.querySelector('[data-gallery-next]').addEventListener('click',()=>galleryTo(Math.round(gallery.progress*2)+1));
  gallery.frame.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();galleryTo(Math.round(gallery.progress*2)+(event.key==='ArrowRight'?1:-1));
    }
  });
  cards.forEach((card,index)=>card.addEventListener('click',()=>{
    if(ignoreClick){ignoreClick=false;return;}
    if(index===Math.round(gallery.progress*2))openGallery();else galleryTo(index);
  }));
  entries.forEach(entry=>{
    entry.frame.addEventListener('pointermove',event=>{
      const rect=entry.frame.getBoundingClientRect();
      pointer.x=(event.clientX-rect.left)/rect.width*2-1;pointer.y=(event.clientY-rect.top)/rect.height*2-1;
      if(drag?.id===event.pointerId&&entry.mode==='journal'){
        const delta=event.clientX-drag.x,vertical=event.clientY-drag.y;
        if(!drag.axis&&Math.max(Math.abs(delta),Math.abs(vertical))>7)drag.axis=Math.abs(delta)>Math.abs(vertical)?'x':'y';
        if(drag.axis==='x'){
          entry.frame.setPointerCapture(event.pointerId);
          const now=performance.now();drag.velocity=(event.clientX-drag.lastX)/Math.max(8,now-drag.time);
          drag.lastX=event.clientX;drag.time=now;drag.moved=true;
          gallery.progress=clamp(drag.progress-delta/(rect.width*.65));
          gallery.frame.classList.add('is-dragging');
        }
      }
      schedule();
    });
    entry.frame.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;schedule();});
  });
  deck.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    ignoreClick=false;drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,time:performance.now(),velocity:0,progress:gallery.progress,axis:null,moved:false};
  });
  const release=event=>{
    if(drag?.id!==event.pointerId)return;
    if(drag.moved){
      const recent=performance.now()-drag.time<100?drag.velocity:0;
      const projected=clamp(gallery.progress-recent*.12);
      gallery.progress=Math.round(projected*2)/2;ignoreClick=true;
    }
    drag=null;gallery.frame.classList.remove('is-dragging');
    if(gallery.frame.hasPointerCapture(event.pointerId))gallery.frame.releasePointerCapture(event.pointerId);
    schedule();
  };
  gallery.frame.addEventListener('pointerup',release);gallery.frame.addEventListener('pointercancel',release);
  function schedule(force=false){if(!raf&&visible&&(force||(!nativeMotion&&!reduced&&stageInView)||galleryInView||galleryAnimating))raf=requestAnimationFrame(tick);}
  const motionObserver=new IntersectionObserver(records=>{
    records.forEach(record=>{
      if(record.target===stage.area)stageInView=record.isIntersecting;
      else if(record.target===gallery.frame)galleryInView=record.isIntersecting;
    });
    schedule(true);
  },{rootMargin:'140px 0px'});
  motionObserver.observe(stage.area);motionObserver.observe(gallery.frame);
  function tick(now){
    raf=0;if(!visible)return;
    const dt=Math.min(40,Math.max(1,now-(lastTick||now-16.7)));lastTick=now;
    let immersive=lastImmersive;
    if(!nativeMotion&&!reduced&&stage){
      stage.progress=clamp((window.scrollY-stageScrollTop)/stageScrollRange);
      stage.section.style.setProperty('--cin-progress',stage.progress);
      updateThreadSegments(stage.progress);
      const complete=stage.progress>=THREAD_REVEAL_END;
      if(stage.section.dataset.threadComplete!==String(complete))stage.section.dataset.threadComplete=String(complete);
      const shirtReveal=smooth(stage.progress,.24,.48);
      const shirtSettle=smooth(stage.progress,.56,.7);
      if(stageComposition)stageComposition.style.transform=`translate3d(calc(-50% + var(--shirt-shift-x, 0px)),${(1-shirtReveal)*36-shirtSettle*14}px,0) rotate(${-4+4*shirtReveal}deg) scale(${.95+.05*shirtReveal+.02*shirtSettle})`;
      if(stageShirt)stageShirt.style.opacity=String(shirtReveal);
      if(stageFabric){
        const fabricIn=smooth(stage.progress,.1,.28),fabricOut=smooth(stage.progress,.44,.58);
        stageFabric.style.opacity=String(.5*fabricIn*(1-fabricOut));
        stageFabric.style.transform=`translate3d(0,${(1-fabricIn)*32-fabricOut*24}px,0)`;
      }
      if(stageWord){
        const wordOut=smooth(stage.progress,.36,.56);
        stageWord.style.opacity=String(.24*(1-wordOut));
        stageWord.style.transform=`translate3d(0,${-wordOut*18}px,0) scale(${1+.035*wordOut})`;
      }
      if(stageHeading)stageHeading.style.opacity=String(1-smooth(stage.progress,.1,.22));
      if(stageBottom)stageBottom.style.opacity=String(1-smooth(stage.progress,.62,.76));
      if(stageCaption)stageCaption.style.opacity=String(1-smooth(stage.progress,.54,.7));
      if(stageStory){const storyReveal=smooth(stage.progress,.34,.52);stageStory.style.opacity=String(storyReveal);stageStory.style.transform=`translate3d(0,${(1-storyReveal)*22}px,0) translateY(-50%)`;}
      const step=stage.progress<.30?0:stage.progress<.76?1:2;
      if(step!==lastThreadStep&&threadStep){
        threadStep.textContent=['01 / MỞ LỚP VẢI','02 / LỘ PHOM ÁO','03 / ĐƯỜNG MAY HOÀN TẤT'][step];
        lastThreadStep=step;
      }
      immersive=window.scrollY>=stageScrollTop-headerHeight&&window.scrollY<stageScrollTop+stageScrollHeight;
    }
      if(reduced&&stageStory)stageStory.style.opacity='1';
    const index=Math.round(gallery.progress*2);
    if(index!==lastIndex){
      gallery.section.querySelector('.ecofit-cinematic-gallery-count').textContent=`0${index+1} / 03`;
      gallery.frame.querySelector('.ecofit-journal-number').textContent=`0${index+1}`;
      cards.forEach((card,i)=>{card.classList.toggle('is-current',i===index);card.setAttribute('aria-current',String(i===index));});
      copies.forEach((copy,i)=>{copy.classList.toggle('is-current',i===index);copy.setAttribute('aria-hidden',String(i!==index));});
      lastIndex=index;
    }
    const galleryDelta=gallery.progress-galleryVisual;
    galleryAnimating=Math.abs(galleryDelta)>.0002;
    gallery.frame.classList.toggle('is-gallery-moving',galleryAnimating);
    galleryVisual=reduced?gallery.progress:galleryVisual+galleryDelta*(1-Math.exp(-dt/(drag?.moved?45:130)));
    if(Math.abs(galleryDelta)<.0002)galleryVisual=gallery.progress;
    if(galleryVisual!==renderedGallery||deckWidth!==renderedDeckWidth||pointer.x!==renderedPointerX||pointer.y!==renderedPointerY){
      cards.forEach((card,i)=>{
        const d=i-galleryVisual*2,side=clamp(d,-1.3,1.3),depth=Math.min(1.6,Math.abs(d));
        card.style.transform=`translate(-50%,-50%) translate3d(${side*deckWidth*.25}px,${depth*30}px,${-depth*260}px) rotateY(${-side*19}deg) rotateZ(${side*8}deg) scale(${1-depth*.07})`;
        card.style.opacity=String((1-Math.min(1,depth)*.18)*(1-clamp((depth-1.12)/.35)));
        card.style.zIndex=String(10-Math.round(depth*3));
      });
      gallery.frame.style.setProperty('--journal-shift',`${(galleryVisual-.5)*-70}px`);
      gallery.frame.style.setProperty('--journal-pointer-x',`${pointer.x*7}px`);
      gallery.frame.style.setProperty('--journal-pointer-y',`${pointer.y*5}px`);
      renderedGallery=galleryVisual;renderedDeckWidth=deckWidth;renderedPointerX=pointer.x;renderedPointerY=pointer.y;
    }
    if(!nativeMotion)setImmersive(immersive);
    if(galleryAnimating)schedule();
  }
  window.addEventListener('scroll',()=>{updateNativeStageSignals();schedule();},{passive:true});
  window.addEventListener('resize',()=>{deckWidth=deck.clientWidth;headerHeight=header?.offsetHeight||0;measureStage();schedule(true);},{passive:true});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)schedule(true);else{cancelAnimationFrame(raf);raf=0;}});
  const revealObserver=new IntersectionObserver(records=>records.forEach(record=>{
    if(record.isIntersecting){record.target.classList.add('is-in-view');revealObserver.unobserve(record.target);}
  }),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  chapters.forEach(chapter=>revealObserver.observe(chapter));
  const resizeObserver=new ResizeObserver(()=>{deckWidth=deck.clientWidth;headerHeight=header?.offsetHeight||0;measureStage();schedule();});
  resizeObserver.observe(chapters[0]);resizeObserver.observe(stage.area);resizeObserver.observe(stage.frame);resizeObserver.observe(gallery.frame);if(header)resizeObserver.observe(header);
  measureStage();
  schedule(true);
}

export function initializeCinematic(stories,detailChapter){
  if(stories.dataset.cinematicReady==='true')return true;
  const chapters=integrateStories(stories,detailChapter);
  if(!chapters)return false;
  startMotion(chapters);
  return true;
}
