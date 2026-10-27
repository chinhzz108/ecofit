const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,p)=>a+(b-a)*p;
const smooth=(p,a=0,b=1)=>{p=clamp((p-a)/(b-a));return p*p*(3-2*p);};
export async function createCinematicEngine(canvas,initialStage,state,pointer,reduced){
let stage=initialStage;
let render3D;
const assets={shirt:'/images/ecofit-white-tee-layer.webp',fabric:'/images/ecofit-white-fabric-layer.webp',detail:'/images/ecofit-tee-material.webp'};
    const [THREE]=await Promise.all([import('./vendor/three.module.js'),document.fonts.load('italic 500 48px "Ecofit Editorial"')]);
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.2:1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.12;
    const scene=new THREE.Scene();
    scene.background=new THREE.Color('#f3efe7');
    scene.fog=new THREE.Fog('#f3efe7',24,65);
    const camera=new THREE.PerspectiveCamera(34,1,.12,100);
    scene.add(new THREE.HemisphereLight('#ffffff','#d0bca3',2.3));
    const key=new THREE.DirectionalLight('#fff6ec',3.3);key.position.set(-5,7,6);scene.add(key);
    const rim=new THREE.DirectionalLight('#ffffff',2);rim.position.set(6,2,-3);scene.add(rim);
    const loader=new THREE.TextureLoader();
    const textureEntries=await Promise.all(Object.entries(assets).map(async([k,url])=>{
      const tx=await loader.loadAsync(url);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return[k,tx];
    }));
    const tx=Object.fromEntries(textureEntries);
    const groups=[new THREE.Group(),new THREE.Group()];groups.forEach(g=>scene.add(g));
    function photo(texture,w,h,alpha=true){
      const mat=new THREE.MeshBasicMaterial({map:texture,transparent:alpha,alphaTest:alpha ? .025 : 0,side:THREE.DoubleSide,depthWrite:true,toneMapped:false});
      return new THREE.Mesh(new THREE.PlaneGeometry(w,h,1,1),mat);
    }
    function word(text,color,w,h){
      const c=document.createElement('canvas');c.width=2048;c.height=512;
      const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.textBaseline='middle';ctx.textAlign='center';ctx.font='italic 500 380px "Ecofit Editorial", Georgia, serif';
      const m=ctx.measureText(text).width;ctx.save();ctx.translate(1024,262);ctx.scale(Math.min(1,1980/m),1);ctx.fillText(text,0,0);ctx.restore();
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
      return photo(texture,w,h);
    }
    const knitCanvas=document.createElement('canvas');knitCanvas.width=256;knitCanvas.height=256;
    const k=knitCanvas.getContext('2d');k.fillStyle='#ece9e0';k.fillRect(0,0,256,256);
    for(let y=-8;y<268;y+=12){for(let x=-8;x<268;x+=10){
      k.beginPath();k.strokeStyle='#cfccc3';k.lineWidth=1;k.ellipse(x+(y%24?5:0),y,3,6,-.25,0,Math.PI*2);k.stroke();
      k.beginPath();k.strokeStyle='#fffef8';k.lineWidth=1.5;k.ellipse(x+(y%24?5:0)+1,y-1,2.5,5,-.25,0,Math.PI*2);k.stroke();
    }}
    const knit=new THREE.CanvasTexture(knitCanvas);knit.wrapS=knit.wrapT=THREE.RepeatWrapping;knit.repeat.set(3.2,2);
    const whiteMat=new THREE.MeshStandardMaterial({color:'#f9f7ee',map:knit,bumpMap:knit,bumpScale:.035,roughness:.92,metalness:0,side:THREE.DoubleSide});
    const pinkMat=new THREE.MeshStandardMaterial({color:'#e9a29f',roughness:.68,metalness:.02,side:THREE.DoubleSide});
    function cloth(w,h){
      const geometry=new THREE.PlaneGeometry(w,h,42,26);
      const mesh=new THREE.Mesh(geometry,whiteMat);
      mesh.userData.base=Float32Array.from(geometry.attributes.position.array);
      return mesh;
    }
    function wave(mesh,t,strength=.25){
      const p=mesh.geometry.attributes.position,b=mesh.userData.base;
      for(let i=0;i<p.count;i++){
        const x=b[i*3],y=b[i*3+1];
        p.setX(i,x+Math.sin(y*1.3+t*.45)*strength*.45);
        p.setY(i,y+Math.sin(x*1.1+t*.3)*strength*.18);
        p.setZ(i,strength*(Math.sin(x*2.6+t)*.62+Math.sin(y*2.1-x+t*.7)*.38));
      }
      p.needsUpdate=true;mesh.geometry.computeVertexNormals();
    }
    function band(rx,ry,z,width,offset=0){
      const vertices=[],uv=[],indices=[];
      for(let i=0;i<=112;i++){
        const a=i/112*Math.PI*2;
        for(let side=0;side<2;side++){
          vertices.push(rx*Math.cos(a),(ry+(side-.5)*width)*Math.sin(a)+offset,z+Math.sin(a)*1.15+Math.cos(a*2)*.15);
          uv.push(i/112,side);
        }
        if(i<112){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
      return new THREE.Mesh(g,pinkMat);
    }
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=128;
    const sc=shadowCanvas.getContext('2d');const gradient=sc.createRadialGradient(128,64,4,128,64,120);gradient.addColorStop(0,'rgba(86,69,53,.30)');gradient.addColorStop(1,'rgba(86,69,53,0)');sc.fillStyle=gradient;sc.fillRect(0,0,256,128);
    const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:'#f3efe7',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.22;scene.add(floor);

    const theatre={};
    theatre.word=word('ECOFIT','#ab143c',12.8,3);theatre.word.position.set(0,.65,-3.8);theatre.word.material.opacity=.24;groups[0].add(theatre.word);
    theatre.shirt=photo(tx.shirt,4.15,4.54);theatre.shirt.position.set(0,.1,.25);groups[0].add(theatre.shirt);
    theatre.shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.2),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));theatre.shadow.rotation.x=-Math.PI/2;theatre.shadow.position.set(0,-2.19,.25);groups[0].add(theatre.shadow);
    theatre.left=cloth(5.2,6);theatre.right=cloth(5.2,6);groups[0].add(theatre.left,theatre.right);
    theatre.ribbons=[band(2.8,1.2,.15,.15,-.12),band(2.8,1.2,.15,.15,.12)];theatre.ribbons.forEach(m=>groups[0].add(m));
    theatre.front=photo(tx.fabric,10,5);theatre.back=photo(tx.fabric,9,4.5);groups[0].add(theatre.front,theatre.back);

    const weave={rings:[]};
    for(let n=0;n<6;n++){
      const geo=new THREE.PlaneGeometry(1,1,96,1);const positions=geo.attributes.position;
      for(let i=0;i<positions.count;i++){
        const column=i%97;const side=i<97?-.55:.55;const a=column/96*Math.PI*2;
        const radius=2.65+side;
        positions.setXYZ(i,Math.cos(a)*radius,Math.sin(a)*radius*.77,Math.sin(a*3+n)*.32);
      }
      geo.computeVertexNormals();
      const ring=new THREE.Mesh(geo,whiteMat);ring.position.z=3.5-n*3.1;ring.rotation.z=n*.25;groups[1].add(ring);weave.rings.push(ring);
    }
    weave.word=word('BAMBOO','#ab143c',11,2.4);weave.word.position.set(0,1,-13.3);groups[1].add(weave.word);
    weave.prime=word('PRIME','#ab143c',6,1.7);weave.prime.position.set(0,-.8,-13.2);groups[1].add(weave.prime);
    weave.shirt=photo(tx.shirt,3.2,3.5);groups[1].add(weave.shirt);
    weave.detail=photo(tx.detail,3.25,4.05,false);weave.detail.position.set(0,.1,-8.5);groups[1].add(weave.detail);
    weave.seams=[band(2.1,1.7,-2,.07,-.10),band(2.1,1.7,-2,.07,.10)];weave.seams.forEach(m=>groups[1].add(m));
    weave.front=photo(tx.fabric,10,5);groups[1].add(weave.front);
    weave.threads=[];
    for(let n=0;n<12;n++){
      const points=[];for(let j=0;j<20;j++){const a=j/19*Math.PI*2;points.push(new THREE.Vector3(-4+j/19*8,(n-5.5)*.31+Math.sin(a+n*.3)*.17,Math.sin(a*2+n)*.15));}
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),52,.027,5,false),whiteMat);mesh.position.z=-3.6;groups[1].add(mesh);weave.threads.push(mesh);
    }

    const look=new THREE.Vector3();
    function positionCamera(x,y,z,tx=0,ty=0,tz=0){
      if(state.exploded){camera.position.set(7+pointer.x*.2,4.1,12);look.set(0,0,-2);}
      else{camera.position.set(x+(reduced?0:pointer.x*.5),y+(reduced?0:-pointer.y*.25),z);look.set(tx,ty,tz);}
      camera.lookAt(look);
    }
    render3D=()=>{
      const p=state.p,t=p*Math.PI*3.2,expl=state.exploded?1:0;
      groups.forEach((g,i)=>{g.visible=i===['stage','weave'].indexOf(state.scene);});
      if(state.scene==='stage'){
        const open=.60+.40*smooth(p,0,.55);
        theatre.shirt.material.opacity=smooth(p,.24,.58);
        theatre.shadow.material.opacity=smooth(p,.22,.48);
        theatre.shirt.position.set(Math.sin(t*.3)*.10,mix(-.08,.15,smooth(p,0,.6)),.25+expl*1.5);
        theatre.shirt.rotation.set(0,Math.sin(t*.4)*.06,(-.035+Math.sin(t*.6)*.025));
        theatre.shirt.scale.setScalar(1+.045*smooth(p,.3,.8));
        theatre.shadow.scale.setScalar(1-.18*smooth(p,.1,.5));
        theatre.left.position.set(-mix(3.5,6.5,open),.2,.6+expl*2);
        theatre.right.position.set(mix(3.5,6.5,open),-.05,.4+expl*2);
        theatre.left.rotation.set(.1,-.52,-.25*open);theatre.right.rotation.set(-.1,.52,.25*open);
        wave(theatre.left,t,.38);wave(theatre.right,t+1.8,.42);
        theatre.word.position.x=-.35*p;theatre.word.position.z=-3.8-expl*1.2;
        theatre.ribbons.forEach(m=>{m.rotation.set(.9,-.1,.08+Math.sin(t*.4)*.04);m.scale.setScalar(1.18);m.position.set(0,-2.15,-1.35);});
        theatre.front.position.set(-5.4+Math.sin(t*.35)*.3,-3.35,-.6);theatre.front.rotation.z=-.10+Math.sin(t*.2)*.05;
        theatre.back.position.set(5.5,3.4+.3*open,-2.4);theatre.back.rotation.z=Math.PI+.04*Math.cos(t);
        const distance=Math.max(10.6-.4*smooth(p,.08,.7),8.4/camera.aspect);
        positionCamera(Math.sin(t*.3)*.22,.18,distance,0,.05,0);
      }
      if(state.scene==='weave'){
        floor.visible=false;
        weave.rings.forEach((ring,i)=>{ring.rotation.set(Math.sin(t*.3+i)*.10,Math.cos(t*.22+i)*.12,i*.26+p*.2);ring.position.x=Math.sin(t*.4+i)*.2;ring.position.z=3.5-i*3.1-expl*i*.4;});
        weave.shirt.position.set(.15,0,1.5+expl);weave.shirt.rotation.z=-.055;weave.shirt.material.opacity=1-smooth(p,.08,.3);
        weave.shirt.visible=p<.32;
        weave.detail.visible=p>.48;weave.detail.material.transparent=true;weave.detail.material.opacity=smooth(p,.48,.8);
        weave.threads.forEach((mesh,i)=>{mesh.position.x=(i%2?1:-1)*smooth(p,.35,.82)*7.2;mesh.rotation.z=(i%2?1:-1)*p*.15;mesh.position.z=-3.6+expl*(i/12);});
        weave.seams.forEach(m=>{m.rotation.z=p*.4;m.rotation.y=.15*Math.sin(t*.4);});
        weave.front.position.set(-.8,-2.5,4+expl*2);weave.front.rotation.z=-.16+Math.sin(t*.4)*.12;
        positionCamera(Math.sin(p*Math.PI)*.35,.2,10.4-p*9.2,0,.1,-7);
      }
      if(state.scene!=='weave')floor.visible=true;
      renderer.render(scene,camera);
    };
    function resize(){
      const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();render3D();
    }
    return {render:render3D,resize,mount(target){stage=target;target.append(canvas);resize();},dispose(){renderer.dispose();}};
}
