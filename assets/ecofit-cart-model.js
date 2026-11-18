export const CART_KEY='ecofit:cart:v2';
export const LEGACY_KEY='ecofit:cart:white-tee:v1';
export const MAX_QUANTITY=99;
export const cartKeyForUser=id=>id?`ecofit:cart:user:${id}:v2`:CART_KEY;
export const itemKey=item=>JSON.stringify([item.id,item.size||'']);
export const sellableProducts=products=>products.filter(p=>!p.draft&&p.id&&p.name&&p.image&&p.href);

export function normalizeCart(value,products){
  const raw=Array.isArray(value)?value:value?.version===2?value.items:[];
  if(!Array.isArray(raw))return [];
  const available=new Map(sellableProducts(products).map(p=>[p.id,p]));
  const result=new Map();
  for(const row of raw.slice(0,500)){
    const product=available.get(row?.id);
    if(!product||typeof row.quantity!=='number'||!Number.isFinite(row.quantity)||row.quantity<1)continue;
    const size=typeof row.size==='string'?row.size:'';
    if(size&&!(product.sizes||[]).includes(size))continue;
    const item={id:product.id,size,quantity:Math.min(MAX_QUANTITY,Math.floor(row.quantity))};
    const key=itemKey(item),previous=result.get(key);
    if(previous)previous.quantity=Math.min(MAX_QUANTITY,previous.quantity+item.quantity);
    else result.set(key,item);
  }
  return [...result.values()];
}

export function addItem(items,id,size,quantity,products){
  const product=sellableProducts(products).find(p=>p.id===id);
  if(!product||((product.sizes||[]).length&&!product.sizes.includes(size)))return items;
  if(typeof quantity!=='number'||!Number.isFinite(quantity)||quantity<1)return items;
  return normalizeCart([...items,{id,size:size||'',quantity}],products);
}

export function updateQuantity(items,key,quantity){
  if(typeof quantity!=='number'||!Number.isFinite(quantity))return items;
  if(Math.floor(quantity)<=0)return items.filter(item=>itemKey(item)!==key);
  return items.map(item=>itemKey(item)===key?{...item,quantity:Math.min(MAX_QUANTITY,Math.floor(quantity))}:item);
}

export function updateSize(items,key,size,products){
  const item=items.find(row=>itemKey(row)===key),product=products.find(p=>p.id===item?.id);
  if(!product||!(product.sizes||[]).includes(size))return items;
  return normalizeCart(items.map(row=>itemKey(row)===key?{...row,size}:row),products);
}

export function summarizeCart(items,products){
  let quantity=0,subtotal=0,hasUnpriced=false,needsSize=false;
  for(const item of items){
    const product=products.find(p=>p.id===item.id);
    if(!product)continue;
    quantity+=item.quantity;
    if(typeof product.price==='number'&&Number.isFinite(product.price)&&product.price>=0)subtotal+=product.price*item.quantity;
    else hasUnpriced=true;
    if(product.sizes?.length&&!item.size)needsSize=true;
  }
  return {quantity,subtotal,hasUnpriced,needsSize};
}

export function saveCart(storage,items,key=CART_KEY){
  try{if(!storage)return false;storage.setItem(key,JSON.stringify({version:2,items}));return true;}catch{return false;}
}

export function loadCart(storage,products,key=CART_KEY){
  try{
    if(!storage)return [];
    const raw=storage.getItem(key);
    if(raw!==null){try{return normalizeCart(JSON.parse(raw),products);}catch{return [];}}
    if(key!==CART_KEY)return [];
    const quantity=JSON.parse(storage.getItem(LEGACY_KEY)||'0');
    const migrated=normalizeCart([{id:'bamboo-prime',size:'',quantity}],products);
    if(saveCart(storage,migrated)){try{storage.removeItem(LEGACY_KEY);}catch{}}
    return migrated;
  }catch{return [];}
}

export function claimGuestCart(storage,products,userId){
  const key=cartKeyForUser(userId);
  if(key===CART_KEY)return {items:loadCart(storage,products),saved:true};
  const items=normalizeCart([...loadCart(storage,products,key),...loadCart(storage,products)],products);
  const saved=saveCart(storage,items,key);
  if(saved)saveCart(storage,[]);
  return {items,saved};
}
