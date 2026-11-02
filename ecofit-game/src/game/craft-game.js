import { clamp, distance, quality, stars, totalQuality, pointSegmentDistance, tensionStep, weaveGrade, weightTotal } from './craft-rules.js'

const $ = (id) => document.getElementById(id)
const field = $('playfield')
const stages = [
  { name: 'Cân', title: 'Đủ một mẻ. Không dư.', goal: 'Cân đúng khối lượng trên phiếu.', image: 'cafe-handoff-bg.webp', instruction: 'Kéo túi lên cân hoặc chạm để thêm. Chạm túi trên đĩa cân để lấy bớt. Chỉ đóng mẻ khi đúng khối lượng.', keys: '1 / 2 / 3 thêm túi · Backspace bỏ túi cuối' },
  { name: 'Lọc', title: 'Giữ lại điều có ích.', goal: 'Phân loại hết 10 vật trên khay.', image: 'cleaning-room-bg.webp', instruction: 'Kéo hạt nâu vào khay nguyên liệu; lá, đá và giấy vào khay tạp chất. Hoặc chọn một vật rồi chọn khay. Xếp sai làm giảm chất lượng.', keys: 'Tab, Enter chọn vật · ← giữ lại · → loại bỏ' },
  { name: 'Kéo', title: 'Tìm nhịp của sợi.', goal: 'Giữ lực trong vùng chuẩn đủ 8 giây.', image: 'spinning-room-bg.webp', instruction: 'Giữ bàn đạp để tăng lực, thả để giảm. Bám theo vùng chuẩn đang dịch chuyển. Kéo quá căng làm đứt sợi. Chùng sợi thì máy không cuộn.', keys: 'Giữ Space hoặc bàn đạp · Thả để giảm lực' },
  { name: 'Dệt', title: 'Qua lại, thành tấm vải.', goal: 'Dệt 8 hàng, luân phiên hai phía.', image: 'weaving-room-bg.webp', instruction: 'Chờ vạch vào vùng có vân rồi kéo thoi sang đầu bên kia. Lượt sau đổi chiều. Canh đúng tâm để có hàng vải đẹp; trượt nhịp mất chuỗi.', keys: 'Kéo thoi · Hoặc ← / → theo chiều mũi tên' },
  { name: 'May', title: 'Dẫn kim, thành chiếc áo.', goal: 'May hết 15 đoạn đường viền.', image: 'sewing-room-bg.webp', instruction: 'Giữ và rê từ chấm sáng theo đường nét đứt, lần lượt qua các điểm. Tránh cắt góc. Nhấc tay rồi đặt lại ở đầu đường màu hồng để tiếp tục.', keys: 'Giữ và rê kim · Hoặc giữ phím mũi tên' },
]
const state = { stage: 0, scores: [], relaxed: false, running: false, done: false, elapsed: 0, sound: false, selected: null, holding: false, keys: new Set(), feedbackUntil: 0, lastPenalty: -10 }
let task = {}
let drag
let dispose
let pointerId
let lastFrame = performance.now()
let audio
let raf
const text = (id, value) => { if ($(id) && $(id).textContent !== value) $(id).textContent = value }
const active = () => state.running && !state.done && !document.querySelector('dialog[open]') && !document.hidden
const starText = (score) => '★'.repeat(stars(score)) + '☆'.repeat(3 - stars(score))
function feedback(message, bad = false) {
  text('feedback', message)
  $('feedback').classList.toggle('is-error', bad)
  state.feedbackUntil = state.elapsed + 2
  if (bad) tone(150)
}
function tone(frequency = 650) {
  if (!state.sound) return
  try {
    audio ||= new AudioContext()
    audio.resume().catch(() => {})
    const oscillator = audio.createOscillator(), gain = audio.createGain()
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(.04, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .12)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start(); oscillator.stop(audio.currentTime + .12)
  } catch { /* Visual feedback is always present. */ }
}
function release() {
  state.holding = false; state.keys.clear()
  task.dragging = false; task.stitching = false
  if (pointerId !== undefined && field.hasPointerCapture(pointerId)) field.releasePointerCapture(pointerId)
  pointerId = undefined
  if (drag) { drag.node.style.transform = ''; drag.node.classList.remove('is-dragging'); drag = null }
  field.classList.remove('is-holding')
}
function open(id) { release(); $(id).showModal() }
function close(id) { $(id).close(); lastFrame = performance.now() }
function metrics(items) { $('stage-metrics').innerHTML = items.map(([label, value]) => '<div><span>' + label + '</span><strong>' + value + '</strong></div>').join('') }
function penalty(message) {
  if (state.elapsed - state.lastPenalty < .7) return
  state.lastPenalty = state.elapsed; task.mistakes++
  field.classList.remove('had-mistake'); void field.offsetWidth; field.classList.add('had-mistake')
  feedback(message, true)
}
function begin(index) {
  release(); dispose?.(); dispose = null
  state.stage = index; state.elapsed = 0; state.lastPenalty = -10; state.done = false; state.selected = null; state.running = true
  task = { mistakes: 0 }
  field.innerHTML = ''; field.dataset.stage = index
  const stage = stages[index]
  $('workshop-background').style.backgroundImage = 'url(/images/game/' + stage.image + ')'
  text('stage-eyebrow', 'CÔNG ĐOẠN 0' + (index + 1) + ' / 05')
  text('stage-title', stage.title); text('stage-objective', stage.instruction); text('stage-goal', stage.goal)
  text('bench-label', '0' + (index + 1) + ' / ' + ['QUẦY NGUYÊN LIỆU', 'BÀN PHÂN LOẠI', 'MÁY KÉO SỢI', 'KHUNG DỆT', 'BÀN MAY'][index])
  text('bench-status', state.relaxed ? 'NHỊP THƯ GIÃN' : 'THỬ THÁCH')
  text('input-hint', stage.keys); feedback(stage.instruction)
  $('stage-rail').innerHTML = stages.map((stage, i) => '<span class="stage-node ' + (i === index ? 'is-active' : i < index ? 'is-complete' : '') + '"' + (i === index ? ' aria-current="step"' : '') + '><i>' + (i < index ? '✓' : '0' + (i + 1)) + '</i><b>' + stage.name + '</b></span>').join('<span class="rail-line"></span>')
  ;[buildScale, buildSorting, buildSpinning, buildWeaving, buildSewing][index]()
  text('session-quality', state.scores.length ? 'CHẤT LƯỢNG / ' + totalQuality(state.scores) + ' ĐIỂM' : 'HOÀN THÀNH 5 BÀN ĐỂ GIAO ÁO')
}
function complete(score, detail) {
  if (state.done) return
  state.done = true; release(); tone(880)
  task.score = Math.round(clamp(score, 0, 100))
  text('result-eyebrow', 'BÀN 0' + (state.stage + 1) + ' ĐÃ HOÀN TẤT')
  text('result-title', task.score >= 90 ? 'Một mẻ thật chỉn chu.' : task.score >= 70 ? 'Tay nghề đang lên.' : 'Còn có thể tốt hơn.')
  text('result-stars', starText(task.score)); $('result-stars').setAttribute('aria-label', stars(task.score) + ' trên 3 sao')
  text('result-copy', detail)
  $('result-details').innerHTML = '<strong>' + task.score + '<small>/100</small></strong><span>CHẤT LƯỢNG CÔNG ĐOẠN<br />' + Math.floor(state.elapsed) + ' giây thực hiện</span>'
  text('next-stage', state.stage === 4 ? 'Giao chiếc áo →' : 'Qua bàn tiếp →')
  open('result-dialog')
}
const bagArt = (weight) => '<svg viewBox="0 0 100 110" aria-hidden="true"><path d="M31 15 24 6 73 6 66 15 79 40 84 94Q50 107 16 94L21 40Z" fill="#cfa779" stroke="#8d6948" stroke-width="2"/><path d="M29 17H69M25 23H73" stroke="#816244" stroke-width="3"/><ellipse cx="50" cy="52" rx="9" ry="13" fill="#624735" transform="rotate(30 50 52)"/><path d="M53 42Q44 54 49 63" fill="none" stroke="#d1ae83" stroke-width="2"/><text x="50" y="85" text-anchor="middle" fill="#463a2a" font-size="16" font-weight="700">' + weight + ' g</text></svg>'
function buildScale() {
  task.target = [225, 275, 325, 375][Math.floor(Math.random() * 4)]; task.weights = []
  field.innerHTML = '<div class="order-slip"><span>PHIẾU NHẬN / MẺ 01</span><b>' + task.target + '<small>g</small></b><p>NGUYÊN LIỆU ĐÃ ĐỂ RIÊNG</p></div><div class="scale-zone" id="scale-zone"><div class="scale-bags" id="scale-bags"></div><div class="scale-pan"></div><div class="scale-base"><span>KHỐI LƯỢNG</span><output id="scale-reading">0 g</output><i id="scale-indicator"></i></div></div><div class="bag-shelf">' + [25, 50, 100].map((weight, i) => '<button type="button" class="material-bag" data-weight="' + weight + '" aria-label="Thêm túi ' + weight + ' gam">' + bagArt(weight) + '<kbd>' + (i + 1) + '</kbd></button>').join('') + '</div><button type="button" class="primary-button bench-submit" id="seal-batch">Đóng mẻ nguyên liệu →</button>'
  field.querySelectorAll('[data-weight]').forEach((button) => button.onclick = () => { if (active() && !button.dataset.dragged) addWeight(Number(button.dataset.weight)) })
  $('seal-batch').onclick = seal
  installDrag('.material-bag', (node, x, y) => { if (inside($('scale-zone'), x, y)) addWeight(Number(node.dataset.weight)); else feedback('Đặt túi vào đĩa cân giữa bàn.') })
  updateScale()
}
function addWeight(weight) {
  if (!active()) return
  if (task.weights.length >= 12) { feedback('Cân đầy. Chạm túi trên cân để lấy bớt.', true); return }
  task.weights.push(weight); tone(350 + weight * 2); updateScale()
}
function updateScale() {
  const total = weightTotal(task.weights)
  text('scale-reading', total + ' g')
  $('scale-indicator').className = total === task.target ? 'is-balanced' : total > task.target ? 'is-over' : ''
  $('scale-bags').innerHTML = task.weights.map((weight, i) => '<button type="button" class="weighed-bag" data-remove="' + i + '" aria-label="Bỏ túi ' + weight + ' gam khỏi cân">' + bagArt(weight) + '</button>').join('')
  $('scale-bags').querySelectorAll('button').forEach((node) => node.onclick = () => { if (active()) { task.weights.splice(Number(node.dataset.remove), 1); updateScale() } })
  metrics([['Phiếu yêu cầu', task.target + ' g'], ['Đang trên cân', total + ' g'], ['Độ lệch', (total > task.target ? '+' : '') + (total - task.target) + ' g']])
  if (total === task.target) feedback('Cân đã cân bằng. Đóng mẻ để chuyển sang phân loại.')
  else if (total > task.target) feedback('Dư ' + (total - task.target) + ' g. Chạm túi trên cân để lấy bớt.', true)
}
function seal() {
  if (!active()) return
  if (weightTotal(task.weights) !== task.target) { penalty('Chưa đúng phiếu. Cân lại trước khi đóng mẻ.'); updateScale(); return }
  complete(quality(task.mistakes, 12), 'Cân đủ ' + task.target + ' g. ' + (task.mistakes ? task.mistakes + ' lần đóng mẻ khi cân chưa đúng.' : 'Đóng mẻ chính xác ngay lần đầu.'))
}
const bean = '<svg viewBox="0 0 70 70" aria-hidden="true"><ellipse cx="35" cy="35" rx="20" ry="27" fill="#74503a" stroke="#472f24" stroke-width="2" transform="rotate(30 35 35)"/><path d="M43 14C20 27 49 43 27 56" fill="none" stroke="#c69d72" stroke-width="4"/></svg>'
function debris(type) {
  if (type === 'lá') return '<svg viewBox="0 0 70 70" aria-hidden="true"><path d="M13 54Q5 15 56 10Q69 60 13 54" fill="#a39c60" stroke="#626a40" stroke-width="2"/><path d="M11 61 50 20M25 44 21 28M34 36 51 36" stroke="#59633e" stroke-width="2"/></svg>'
  if (type === 'đá') return '<svg viewBox="0 0 70 70" aria-hidden="true"><path d="m13 24 27-12 19 18-2 24-32 5-16-17Z" fill="#a1a19b" stroke="#696f68" stroke-width="2"/><path d="m13 24 23 12 21 18M36 36l4-24" stroke="#c2c3b9" fill="none" stroke-width="3"/></svg>'
  return '<svg viewBox="0 0 70 70" aria-hidden="true"><path d="m17 9 40 5 4 44-11-6-8 8-12-7-12 4Z" fill="#efe6cc" stroke="#a89c7f" stroke-width="2"/><path d="m28 24 21 3m-19 7 18 3m-16 7 13 2" stroke="#aeaa91" stroke-width="2"/></svg>'
}
function buildSorting() {
  task.items = ['cà phê','cà phê','cà phê','cà phê','cà phê','cà phê','cà phê','lá','đá','giấy'].map((type) => ({ type, random: Math.random() })).sort((a,b) => a.random - b.random)
  task.sorted = 0
  field.innerHTML = '<div class="sorting-tray"><span class="tray-caption">MẺ NGUYÊN LIỆU / CHỌN VÀ PHÂN LOẠI</span>' + task.items.map((item,i) => '<button type="button" class="sort-item" data-item="' + i + '" aria-label="Vật ' + (i+1) + ': ' + item.type + '">' + (item.type === 'cà phê' ? bean : debris(item.type)) + '</button>').join('') + '</div><div class="sorting-bins"><button type="button" id="keep-bin" class="sort-bin keep-bin" data-bin="keep"><span>↙</span><b>Nguyên liệu</b><small>Giữ lại hạt nâu</small><i id="keep-count">0</i></button><button type="button" id="discard-bin" class="sort-bin discard-bin" data-bin="discard"><span>↘</span><b>Tạp chất</b><small>Lá · đá · giấy</small><i id="discard-count">0</i></button></div>'
  field.querySelectorAll('[data-item]').forEach((node) => node.onclick = () => {
    if (!active() || node.dataset.dragged) return
    field.querySelectorAll('.is-selected').forEach((n) => n.classList.remove('is-selected'))
    node.classList.add('is-selected'); state.selected = Number(node.dataset.item); feedback('Đã cầm vật. Chọn khay phù hợp.')
  })
  field.querySelectorAll('[data-bin]').forEach((node) => node.onclick = () => sort(state.selected, node.dataset.bin))
  installDrag('.sort-item', (node,x,y) => { const bin = [...field.querySelectorAll('[data-bin]')].find((n) => inside(n,x,y)); if (bin) sort(Number(node.dataset.item),bin.dataset.bin); else feedback('Thả vật vào một trong hai khay bên dưới.') })
  updateSorting()
}
function sort(index, bin) {
  if (!active() || index === null || !task.items[index] || task.items[index].sorted) return
  const item = task.items[index], keep = item.type === 'cà phê'
  if (bin !== (keep ? 'keep' : 'discard')) { penalty(keep ? 'Hạt nâu vẫn dùng được. Giữ trong khay nguyên liệu.' : 'Đây là ' + item.type + '. Bỏ vào khay tạp chất.'); updateSorting(); return }
  item.sorted = true; task.sorted++; state.selected = null
  field.querySelector('[data-item="' + index + '"]').hidden = true
  tone(keep ? 580 : 420); feedback(keep ? 'Đã giữ lại nguyên liệu.' : 'Đã loại tạp chất.'); updateSorting()
  if (task.sorted === 10) complete(quality(task.mistakes,9), 'Giữ 7 phần nguyên liệu, loại 3 tạp chất. ' + task.mistakes + ' lần xếp nhầm.')
}
function updateSorting() {
  text('keep-count', String(task.items.filter((i) => i.sorted && i.type === 'cà phê').length))
  text('discard-count', String(task.items.filter((i) => i.sorted && i.type !== 'cà phê').length))
  metrics([['Đã phân loại', task.sorted + ' / 10'], ['Xếp nhầm', String(task.mistakes)], ['Chất lượng', quality(task.mistakes,9) + ' / 100']])
}
function buildSpinning() {
  Object.assign(task, { tension:25, progress:0, breakCooldown:0, started:false, workTime:0, stressTime:0 })
  field.innerHTML = '<div class="spinning-machine"><svg viewBox="0 0 800 260" aria-hidden="true"><path d="M70 220H730" stroke="#8c7051" stroke-width="12" stroke-linecap="round"/><path d="M130 216V90M650 216V90" stroke="#b78b60" stroke-width="17"/><ellipse cx="140" cy="95" rx="50" ry="73" fill="#e1d2b0" stroke="#8d7654" stroke-width="5"/><path id="fiber-thread" d="M185 93Q400 80 608 93" fill="none" stroke="#92734e" stroke-width="4"/><g id="spool-wheel" transform="translate(650 95)"><circle r="76" fill="#c69e6c" stroke="#70563f" stroke-width="7"/><circle r="53" fill="#f1e4c9" stroke="#9f8057" stroke-width="3"/><path d="M-68 0H68M0-68V68M-48-48 48 48M48-48-48 48" stroke="#8f6d4c" stroke-width="7"/><circle r="13" fill="#6e553d"/></g><text x="400" y="192" text-anchor="middle" fill="#81745c" font-size="12" letter-spacing="3">ECOFIT / MÁY KÉO SỢI 03</text></svg></div><div class="tension-control"><div class="meter-label"><span>LỰC KÉO</span><b id="tension-reading">25%</b></div><div class="tension-meter"><span id="tension-zone" class="tension-zone"><small>CHUẨN</small></span><i id="tension-needle"></i></div><div class="meter-ends"><span>Chùng sợi</span><span>Đứt sợi</span></div></div><div class="spool-progress"><span id="spool-fill"></span></div><button type="button" id="spinning-pedal" class="pedal"><span>↓</span> GIỮ BÀN ĐẠP <small>thả để giảm lực</small></button>'
  $('spinning-pedal').onpointerdown = (event) => { if (active() && event.button === 0) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); task.started = true; state.holding = true; field.classList.add('is-holding') } }
  for (const name of ['pointerup','pointercancel','lostpointercapture']) $('spinning-pedal').addEventListener(name, () => { state.holding = false; field.classList.remove('is-holding') })
  metrics([['Đã cuộn','0 / 8 giây'],['Đứt sợi','0 lần'],['Chất lượng','100 / 100']])
}
function tickSpinning(dt) {
  if (!task.started) return
  task.workTime += dt
  task.tension = tensionStep(task.tension,state.holding,dt,state.relaxed)
  const center = 51 + Math.sin(task.workTime * (state.relaxed ? .38 : .65)) * 13, width = state.relaxed ? 34 : 24
  const good = Math.abs(task.tension-center) <= width/2
  $('tension-zone').style.left = center-width/2 + '%'; $('tension-zone').style.width = width + '%'
  $('tension-needle').style.left = task.tension + '%'; text('tension-reading',Math.round(task.tension)+'%')
  field.classList.toggle('is-in-zone',good)
  if (good) { task.progress += dt; $('spool-wheel').setAttribute('transform','translate(650 95) rotate('+task.progress*130+')') }
  $('fiber-thread').setAttribute('d','M185 93Q400 '+(good ? 80 : 95+(100-task.tension)*.7)+' 608 93')
  if (task.tension >= 96 && state.elapsed > task.breakCooldown) { task.breakCooldown=state.elapsed+2; task.tension=35; penalty('Kéo quá căng! Sợi đã được nối lại. Nhả bàn đạp sớm hơn.') }
  $('spool-fill').style.width = task.progress/8*100+'%'
  if (task.tension < 15 || task.tension > 82) task.stressTime += dt
  const score = quality(task.mistakes + task.stressTime / 6, 9)
  metrics([['Đã cuộn',Math.min(8,task.progress).toFixed(1)+' / 8 giây'],['Đứt sợi',task.mistakes+' lần'],['Chất lượng',score+' / 100']])
  if (state.elapsed > state.feedbackUntil) text('feedback',good ? 'Lực vừa đủ. Sợi đang cuộn đều…' : task.tension<center ? 'Sợi đang chùng. Giữ bàn đạp để tăng lực.' : 'Đang quá căng. Nhả bàn đạp để giảm lực.')
  if (task.progress>=8) complete(score,'Tự điều khiển lực kéo đủ một cuộn sợi. '+task.mistakes+' lần đứt sợi; '+Math.floor(state.elapsed)+' giây thực hiện.')
}
function buildWeaving() {
  Object.assign(task,{ rows:0,combo:0,maxCombo:0,grades:[],phase:0,clock:.1,target:.5,shuttleX:110 })
  const warp = Array.from({length:29},(_,i)=>'<path d="M'+(180+i*16)+' 45V275" stroke="'+(i%2?'#d9c9a2':'#f6ecd4')+'" stroke-width="5"/>').join('')
  field.innerHTML = '<svg id="loom-board" class="loom-board" viewBox="0 0 800 330" aria-label="Khung dệt, kéo thoi qua lại"><defs><pattern id="cloth-grain" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 3H12M3 0V12" stroke="#bb9d74" stroke-width="1"/></pattern></defs><rect x="130" y="18" width="540" height="286" rx="14" fill="#ad8155" stroke="#79583b" stroke-width="7"/><rect x="163" y="42" width="476" height="236" rx="3" fill="#5e5642"/>'+warp+'<rect id="woven-cloth" x="164" y="278" width="474" height="0" fill="#e8d6b3"/><rect id="woven-texture" x="164" y="278" width="474" height="0" fill="url(#cloth-grain)"/><path d="M164 245H638" stroke="#7b5940" stroke-width="6"/><path id="shuttle-thread" d="M110 242H180" stroke="#e9d9b4" stroke-width="3"/><g id="loom-shuttle" tabindex="0" role="button" aria-label="Thoi dệt, kéo theo mũi tên" transform="translate(110 242)"><path d="M-50 0-25-18H30L53 0 30 18H-25Z" fill="#855731" stroke="#e3b378" stroke-width="3"/><rect x="-17" y="-9" width="35" height="18" rx="8" fill="#eedabc"/><path d="M-8-8V8M0-8V8M8-8V8" stroke="#b79c73"/></g><text id="loom-direction" x="400" y="323" text-anchor="middle" fill="#6f604c" font-size="16">KÉO THOI SANG PHẢI →</text></svg><div class="weave-rhythm"><span>NHỊP ĐƯA THOI</span><div class="rhythm-meter"><i id="weave-zone" class="weave-zone"></i><b id="weave-needle"></b></div><small>Chờ vạch vào vùng có vân, rồi đưa thoi.</small></div><div class="weave-key-buttons"><button type="button" id="shuttle-left" aria-label="Đưa thoi sang trái">←</button><b id="weave-combo">CHUỖI 0</b><button type="button" id="shuttle-right" aria-label="Đưa thoi sang phải">→</button></div>'
  $('shuttle-left').onclick = ()=>weave(-1); $('shuttle-right').onclick = ()=>weave(1)
  $('loom-shuttle').onpointerdown = (event)=>{ if(!active())return; event.preventDefault(); pointerId=event.pointerId; field.setPointerCapture(pointerId); task.dragging=true }
  field.onpointermove=(event)=>{
    if(!active()||!task.dragging||event.pointerId!==pointerId)return
    task.shuttleX=clamp(svgPoint($('loom-board'),event).x,110,690); renderShuttle()
  }
  field.onpointerup=(event)=>{
    if(!task.dragging||event.pointerId!==pointerId)return
    task.dragging=false
    const dir=task.rows%2===0?1:-1
    if(dir===1?task.shuttleX>640:task.shuttleX<160)weave(dir)
    else feedback('Đưa thoi hết sang đầu bên kia để tạo một hàng vải.')
    resetShuttle(); release()
  }
  field.onpointercancel=()=>{resetShuttle();release()}
  dispose=()=>{field.onpointermove=field.onpointerup=field.onpointercancel=null}
  updateWeave()
}
function renderShuttle(){ $('loom-shuttle')?.setAttribute('transform','translate('+task.shuttleX+' 242)'); $('shuttle-thread')?.setAttribute('d','M'+task.shuttleX+' 242H'+(task.rows%2===0?180:620)) }
function resetShuttle(){task.shuttleX=task.rows%2===0?110:690;renderShuttle()}
function weave(direction){
  if(!active())return
  if(direction!==(task.rows%2===0?1:-1)){penalty('Đổi chiều mỗi lượt. Đi theo mũi tên trên khung.');updateWeave();return}
  const grade=weaveGrade(task.phase,task.target,state.relaxed ? .2 : .13)
  if(!grade){task.combo=0;penalty('Lệch nhịp. Chờ vạch vào vùng có vân rồi đưa thoi.');resetShuttle();updateWeave();return}
  task.rows++;task.grades.push(grade);task.combo++;task.maxCombo=Math.max(task.maxCombo,task.combo);task.clock=0;task.target=[.43,.56,.48,.62][task.rows%4]
  feedback(grade===100?'Đúng tâm nhịp! Hàng vải đều và chắc.':'Đã thêm một hàng. Canh sát tâm để có chất lượng cao hơn.');tone(480+task.combo*65);updateWeave();resetShuttle()
  if(task.rows===8)complete(totalQuality(task.grades)-task.mistakes*4,'Dệt 8 hàng. Chuỗi dài nhất: '+task.maxCombo+'. '+task.mistakes+' lần trượt hoặc sai chiều.')
}
function updateWeave(){
  const height=task.rows/8*190
  for(const id of ['woven-cloth','woven-texture']){$(id).setAttribute('y',278-height);$(id).setAttribute('height',height)}
  text('loom-direction',task.rows%2===0?'KÉO THOI SANG PHẢI →':'← KÉO THOI SANG TRÁI');text('weave-combo','CHUỖI '+task.combo)
  $('shuttle-left').disabled=task.rows%2===0;$('shuttle-right').disabled=task.rows%2!==0
  metrics([['Hàng vải',task.rows+' / 8'],['Chuỗi cao nhất',String(task.maxCombo)],['Trượt nhịp',String(task.mistakes)]])
}
function tickWeaving(dt){
  task.clock+=dt; const cycle=state.relaxed?3.6:2.7;task.phase=(task.clock%cycle)/cycle
  const tolerance=state.relaxed ? .2 : .13
  $('weave-needle').style.left=task.phase*100+'%';$('weave-zone').style.left=(task.target-tolerance)*100+'%';$('weave-zone').style.width=tolerance*200+'%'
  $('weave-zone').classList.toggle('is-open',Math.abs(task.phase-task.target)<=tolerance)
}
const seam=[{x:307,y:101},{x:240,y:125},{x:177,y:197},{x:225,y:236},{x:274,y:193},{x:273,y:357},{x:527,y:357},{x:526,y:193},{x:575,y:236},{x:623,y:197},{x:560,y:125},{x:493,y:101},{x:452,y:143},{x:400,y:171},{x:348,y:143},{x:307,y:101}]
function buildSewing(){
  task.node=1;task.cursor={...seam[0]}
  const path=seam.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ')
  field.innerHTML='<svg id="sewing-board" class="sewing-board" viewBox="0 0 800 430" role="img" aria-label="Đường may chiếc áo, giữ và rê từ chấm sáng"><defs><pattern id="cutting-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#a5b598" stroke-opacity=".45"/></pattern></defs><rect x="55" y="20" width="690" height="390" rx="12" fill="#cad2bc"/><rect x="55" y="20" width="690" height="390" rx="12" fill="url(#cutting-grid)"/><path d="M300 87 230 111 158 200 224 256 258 224V372H542V224L576 256 642 200 570 111 500 87Q400 139 300 87Z" fill="#faf4e5" stroke="#b5a386" stroke-width="3"/><path d="m239 121-62 76m73-72-60 76m371-80 62 76m-73-72 60 76" fill="none" stroke="#d28f91" stroke-width="5"/><path d="'+path+'" fill="none" stroke="#92947c" stroke-width="3" stroke-dasharray="6 7"/><path id="finished-seam" fill="none" stroke="#9d4254" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+seam.slice(0,-1).map((p,i)=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="4" fill="#b9b79c" data-seam-node="'+i+'"/>').join('')+'<circle id="seam-target" r="12" fill="#eec782" stroke="#846033" stroke-width="3"/><circle id="sewing-cursor" r="5" fill="#ad445a" stroke="#fff8e7" stroke-width="2"/><text x="400" y="395" text-anchor="middle" fill="#6b765e" font-size="10" letter-spacing="3">ECOFIT / ĐƯỜNG KIM CỦA BẠN</text></svg><div class="sewing-progress"><span id="seam-progress-fill"></span></div><span class="sewing-note">NÉT ĐỨT → ĐƯỜNG MAY CỦA BẠN</span>'
  field.addEventListener('pointerdown',sewDown);field.addEventListener('pointermove',sewMove);field.addEventListener('pointerup',sewUp);field.addEventListener('pointercancel',sewUp)
  dispose=()=>{field.removeEventListener('pointerdown',sewDown);field.removeEventListener('pointermove',sewMove);field.removeEventListener('pointerup',sewUp);field.removeEventListener('pointercancel',sewUp)}
  renderSeam()
}
function svgPoint(board,event){
  const point=board.createSVGPoint();point.x=event.clientX;point.y=event.clientY
  return point.matrixTransform(board.getScreenCTM().inverse())
}
function sewingPoint(event){return svgPoint($('sewing-board'),event)}
function sewDown(event){
  if(!active()||event.button!==0)return
  event.preventDefault();const point=sewingPoint(event)
  if(distance(point,task.cursor)>(state.relaxed?48:36)){feedback('Đặt kim ở chấm sáng hoặc đầu đường đã may để tiếp tục.');return}
  task.stitching=true;pointerId=event.pointerId;field.setPointerCapture(pointerId);task.previousPointer={...task.cursor}
}
function sewMove(event){
  if(!active()||!task.stitching||event.pointerId!==pointerId)return
  const point=sewingPoint(event),previous=task.previousPointer||task.cursor,count=Math.ceil(distance(previous,point)/6)
  for(let i=1;i<=Math.min(count,250)&&!state.done;i++){if(!stitch({x:previous.x+(point.x-previous.x)*i/count,y:previous.y+(point.y-previous.y)*i/count}))break}
  task.previousPointer={...task.cursor}
}
function sewUp(){release()}
function stitch(point){
  const a=seam[task.node-1],b=seam[task.node];if(!b)return false
  if(pointSegmentDistance(point,a,b)>(state.relaxed?30:21)){penalty('Kim lệch đường. Đặt lại ở đầu đường màu hồng để tiếp tục.');renderSeam();return false}
  task.cursor={...point}
  if(distance(point,b)<=(state.relaxed?22:16)){task.cursor={...b};task.node++;tone();feedback('Đường kim chắc tay. Tiếp tục theo chấm sáng.')}
  renderSeam()
  if(task.node>=seam.length)complete(quality(task.mistakes,6),'Tự dẫn kim quanh 15 đoạn của chiếc áo. '+task.mistakes+' lần lệch đường may.')
  return true
}
function renderSeam(){
  $('finished-seam').setAttribute('d',[...seam.slice(0,task.node),task.cursor].map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' '))
  const target=task.node===1&&distance(task.cursor,seam[0])<2?seam[0]:seam[task.node]||seam[0]
  $('seam-target').setAttribute('cx',target.x);$('seam-target').setAttribute('cy',target.y);$('sewing-cursor').setAttribute('cx',task.cursor.x);$('sewing-cursor').setAttribute('cy',task.cursor.y)
  field.querySelectorAll('[data-seam-node]').forEach(n=>n.setAttribute('fill',Number(n.dataset.seamNode)<task.node?'#9d4254':'#b9b79c'))
  $('seam-progress-fill').style.width=(task.node-1)/15*100+'%'
  metrics([['Đoạn đã may',Math.min(15,task.node-1)+' / 15'],['Lệch đường',task.mistakes+' lần'],['Chất lượng',quality(task.mistakes,6)+' / 100']])
}
function tickSewing(dt){
  const dx=(state.keys.has('ArrowRight')?1:0)-(state.keys.has('ArrowLeft')?1:0),dy=(state.keys.has('ArrowDown')?1:0)-(state.keys.has('ArrowUp')?1:0),length=Math.hypot(dx,dy)
  if(length)stitch({x:task.cursor.x+dx/length*dt*(state.relaxed?90:120),y:task.cursor.y+dy/length*dt*(state.relaxed?90:120)})
}
function inside(node,x,y){const r=node.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom}
function installDrag(selector,drop){
  const down=(event)=>{const node=event.target.closest(selector);if(!node||!active()||event.button!==0)return;drag={node,x:event.clientX,y:event.clientY,moved:false};node.setPointerCapture(event.pointerId)}
  const move=(event)=>{if(!drag||!active())return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>8)drag.moved=true;if(drag.moved){drag.node.classList.add('is-dragging');drag.node.style.transform='translate('+dx+'px,'+dy+'px) scale(1.08)'}}
  const up=(event)=>{if(!drag)return;const item=drag;drag=null;item.node.classList.remove('is-dragging');item.node.style.transform='';if(item.moved){item.node.dataset.dragged='true';if(active())drop(item.node,event.clientX,event.clientY);setTimeout(()=>{delete item.node.dataset.dragged},0)}}
  const cancel=()=>release()
  field.addEventListener('pointerdown',down);field.addEventListener('pointermove',move);field.addEventListener('pointerup',up);field.addEventListener('pointercancel',cancel)
  dispose=()=>{field.removeEventListener('pointerdown',down);field.removeEventListener('pointermove',move);field.removeEventListener('pointerup',up);field.removeEventListener('pointercancel',cancel)}
}
function pause(){if(state.running&&!state.done&&!document.querySelector('dialog[open]')&&$('finish-screen').hidden)open('pause-dialog')}
function newRun(){
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());state.scores=[];state.running=false;$('finish-screen').hidden=true;begin(0);state.running=false;open('intro-dialog')
}
function finish(){
  state.running=false;dispose?.();release()
  const score=totalQuality(state.scores),key='ecofit-craft-best-'+(state.relaxed?'relaxed':'standard')
  let best=score
  try{best=Math.max(score,Number(localStorage.getItem(key))||0);localStorage.setItem(key,String(best))}catch{/* Optional local record. */}
  text('finish-stars',starText(score));text('finish-summary',score+'/100 điểm chất lượng · '+(state.relaxed?'Nhịp thư giãn. ':'Nhịp thử thách. ')+(score>=90?'Một chiếc áo mang dấu ấn của người thợ chắc tay.':'Đã hoàn thành đơn hàng. Thử lại để những đường sợi đều hơn.'))
  $('finish-breakdown').innerHTML=stages.map((s,i)=>'<div><span>0'+(i+1)+' / '+s.name+'</span><b>'+state.scores[i]+'<small>/100</small></b></div>').join('')
  text('personal-best','KỶ LỤC CỦA BẠN / '+best+' ĐIỂM');$('finish-screen').hidden=false;$('restart-game').focus()
}
$('start-game').onclick=()=>{state.relaxed=document.querySelector('input[name="mode"]:checked').value==='relaxed';close('intro-dialog');begin(0)}
$('retry-stage').onclick=()=>{close('result-dialog');begin(state.stage)}
$('next-stage').onclick=()=>{state.scores[state.stage]=task.score;close('result-dialog');if(state.stage===4)finish();else begin(state.stage+1)}
$('pause-button').onclick=pause;$('resume-game').onclick=()=>close('pause-dialog');$('restart-run').onclick=newRun;$('restart-game').onclick=newRun
$('help-button').onclick=()=>{if(!active())return;text('help-title',stages[state.stage].title);text('help-copy',stages[state.stage].instruction+' '+stages[state.stage].keys);open('help-dialog')}
$('close-help').onclick=()=>close('help-dialog')
$('sound-button').onclick=()=>{state.sound=!state.sound;$('sound-button').setAttribute('aria-pressed',String(state.sound));text('sound-button',state.sound?'Âm thanh: bật':'Âm thanh: tắt');tone()}
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',event=>{event.preventDefault();if(['pause-dialog','help-dialog'].includes(d.id))close(d.id)}))
window.addEventListener('keydown',event=>{
  if(event.code==='Escape'){event.preventDefault();if($('pause-dialog').open)close('pause-dialog');else if($('help-dialog').open)close('help-dialog');else pause();return}
  if(!active())return
  if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Backspace'].includes(event.code))event.preventDefault()
  state.keys.add(event.code)
  if(state.stage===2&&event.code==='Space'){task.started=true;state.holding=true;field.classList.add('is-holding')}
  if(event.repeat)return
  if(state.stage===0){if(/^Digit[123]$/.test(event.code))addWeight([25,50,100][Number(event.code.slice(-1))-1]);if(event.code==='Backspace'){task.weights.pop();updateScale()}}
  if(state.stage===1&&state.selected!==null&&['ArrowLeft','ArrowRight'].includes(event.code))sort(state.selected,event.code==='ArrowLeft'?'keep':'discard')
  if(state.stage===3&&['ArrowLeft','ArrowRight'].includes(event.code))weave(event.code==='ArrowLeft'?-1:1)
})
window.addEventListener('keyup',event=>{state.keys.delete(event.code);if(event.code==='Space'){state.holding=false;field.classList.remove('is-holding')}})
window.addEventListener('blur',()=>{release();pause()})
document.addEventListener('visibilitychange',()=>{if(document.hidden){release();pause()}})
function frame(now){
  const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now
  if(active()){state.elapsed+=dt;if(state.stage===2)tickSpinning(dt);if(state.stage===3)tickWeaving(dt);if(state.stage===4)tickSewing(dt)}
  raf=requestAnimationFrame(frame)
}
begin(0);state.running=false;open('intro-dialog');raf=requestAnimationFrame(frame)
if(import.meta.hot)import.meta.hot.dispose(()=>{cancelAnimationFrame(raf);dispose?.();release()})

