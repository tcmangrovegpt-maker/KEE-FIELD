const DATA = window.APP_DATA;
const $ = (selector) => document.querySelector(selector);
let program = 'all';
let query = '';
let year = 'all';
let province = 'all';
let officer = 'all';
let progress = 'all';
const safe = (text) => String(text ?? '—').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const pc = (value) => `${Math.max(0, Math.min(100, Number(value || 0))).toLocaleString('th-TH', {maximumFractionDigits: 1})}%`;
const yearLabel = (value) => Number(value) === 1 ? 'ปีที่ 1 (แปลงปี 66)' : `ปีที่ ${value}`;
const records = () => DATA.records.filter(x =>
  (program === 'all' || x.program === program) &&
  (year === 'all' || String(x.year) === year) &&
  (province === 'all' || x.province === province) &&
  (officer === 'all' || x.officer === officer) &&
  (progress === 'all' || (progress === 'complete' && x.completion >= 99.95) || (progress === 'progress' && x.completion > 0 && x.completion < 99.95) || (progress === 'not-started' && x.completion <= 0)) &&
  `${x.plot} ${x.province} ${x.stcToRokContract} ${x.rokToContractorContract} ${x.contractor} ${x.officer}`.toLowerCase().includes(query)
);
function renderList() {
  const items = records();
  $('#count').textContent = `${items.length.toLocaleString('th-TH')} รายการ`;
  $('#list').innerHTML = items.length ? items.map((x, i) => `<button class="plot-card" data-index="${DATA.records.indexOf(x)}">
    <div><div class="card-top"><span class="tag">${safe(x.program)}</span><span class="year">${yearLabel(x.year)}</span></div><div class="plot">${safe(x.plot)}</div><div class="meta">${safe(x.province || 'ไม่ระบุจังหวัด')} · ${x.area ? Number(x.area).toLocaleString('th-TH',{maximumFractionDigits:2})+' ไร่' : '—'}</div><div class="work-summary">ทั้งหมด ${x.totalInstallments} งวด · ${x.latestWork ? `ดำเนินถึงงวดที่ ${safe(x.latestWork.name.replace(/\D/g, ''))}` : 'ยังไม่เริ่มงวดงาน'}</div><div class="contract-summary"><span>เจ้าหน้าที่: ${safe(x.officer)}</span><span>ผรม. ${safe(x.contractor)}</span><span>STC to ROK: ${safe(x.stcToRokContract)}</span><span>ROK–ผู้รับเหมา: ${safe(x.rokToContractorContract)}</span></div></div>
    <div class="work-number"><small>ทั้งหมด</small>${x.totalInstallments}<small>งวด</small></div></button>`).join('') : '<div class="empty">ไม่พบแปลงที่ค้นหา</div>';
  document.querySelectorAll('.plot-card').forEach(button => {
    const x = DATA.records[button.dataset.index];
    const location = button.querySelector('.meta');
    if (location && (x.province || x.district)) location.textContent = [x.province, x.district].filter(Boolean).join(' • ');
    button.addEventListener('click', () => show(x));
  });
}
function stages(items, fallback) { const source = items.length ? items : fallback; return source.map(x => `<div class="stage"><span class="stage-label">${safe(x.name)}</span><div class="stage-bar"><i style="width:${x.percent}%"></i></div><span class="stage-value">${pc(x.percent)}</span></div>`).join(''); }
function legacyWorkPlan(x) {
  const current = x.latestWork ? Number(x.latestWork.name.replace(/\D/g, '')) : 0;
  const plans = {
    '37': ['ตรวจเช็คหมุดแปลง ป้าย แนวเขต และทางตรวจการณ์; ตรวจอัตราการรอดตาย; เตรียมกล้าไม้และกำจัดศัตรูพืช; จัดทำแผนงานปีถัดไป', 'ปลูกซ่อม/ปลูกเสริมตามจุดที่กำหนด; แผ้วถางวัชพืช ศัตรูพืช และลิดกิ่ง; ดูแลแปลงตัวอย่าง Baseline (ถ้ามี); ลาดตระเวนและประเมินความเสี่ยงพื้นที่เข้าไม่ถึง', 'นับอัตราการรอดตายทั้งแปลง; แผ้วถางและลิดกิ่ง (ถ้ามี); ติดตามรายงาน ปอ.4'],
    A: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ซ่อมแซมสิ่งชำรุด; ตรวจอัตราการรอดตาย', 'เตรียมกล้าไม้; แผ้วถางวัชพืช/ศัตรูพืชและลิดกิ่ง; ปลูกซ่อม/ปลูกเสริมตามจุดที่กำหนด', 'นับอัตราการรอดตาย; ติดตามรายงาน ปอ.4; ถ่ายภาพจุดลาดตระเวนในพื้นที่เข้าไม่ถึง'],
    B: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ตรวจอัตราการรอดตาย; ดูแลแปลงตัวอย่าง Baseline', 'เตรียมกล้าไม้; แผ้วถางวัชพืช/ศัตรูพืชและลิดกิ่ง; ปลูกซ่อม/ปลูกเสริม; ดูแล Baseline', 'นับอัตราการรอดตาย; ติดตามรายงาน ปอ.4; ถ่ายภาพจุดเข้าไม่ถึง; ดูแลแปลง Baseline'],
    C: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ซ่อมแซมสิ่งชำรุด; ตรวจอัตราการรอดตาย', 'เตรียมกล้าไม้; แผ้วถางวัชพืช/ศัตรูพืชและลิดกิ่ง; ปลูกซ่อม/ปลูกเสริมตามจุดที่กำหนด', 'นับอัตราการรอดตาย และติดตามรายงาน ปอ.4'],
    D: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ตรวจอัตราการรอดตาย', 'เตรียมกล้าไม้และปลูกซ่อม/ปลูกเสริมตามจุดที่กำหนด; ถ่ายภาพจุดลาดตระเวนในพื้นที่เข้าไม่ถึง', 'นับอัตราการรอดตาย; ติดตามรายงาน ปอ.4; ถ่ายภาพพื้นที่เข้าไม่ถึง'],
    E: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ตรวจอัตราการรอดตาย; ดูแลแปลงตัวอย่าง Baseline', 'เตรียมกล้าไม้และปลูกซ่อม/ปลูกเสริม; ถ่ายภาพพื้นที่เข้าไม่ถึง; ดูแล Baseline', 'นับอัตราการรอดตาย; ติดตามรายงาน ปอ.4; ถ่ายภาพจุดเข้าไม่ถึง; ดูแลแปลง Baseline'],
    F: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ซ่อมแซมสิ่งชำรุด; ตรวจอัตราการรอดตาย', 'เตรียมกล้าไม้และปลูกซ่อม/ปลูกเสริมตามจุดที่กำหนด', 'นับอัตราการรอดตาย และติดตามรายงาน ปอ.4'],
    G: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ตรวจอัตราการรอดตาย', 'ลาดตระเวนและถ่ายภาพจุดที่เข้าไม่ถึงตามจุดที่กำหนด (ไม่มีปลูกซ่อม)', 'ติดตามรายงาน ปอ.4 และบันทึกภาพพื้นที่เข้าไม่ถึง'],
    H: ['ตรวจเช็คหมุดแปลง ป้าย และแนวเขต; ซ่อมแซมสิ่งชำรุด; ตรวจอัตราการรอดตาย', 'ปลูกซ่อม/ปลูกเสริม (ถ้ามี); นับอัตราการรอดตายในแปลงตัวอย่างและจุดที่กำหนด']
  };
  const yearThreeTasks = plans[x.planGroup] || Array.from({ length: x.totalInstallments }, () => 'ดำเนินงานตามแผนงวดของแปลง');
  return Array.from({ length: x.totalInstallments }, (_, index) => {
    const number = index + 1;
    const task = x.year === 3 ? (yearThreeTasks[index] || 'ดำเนินงานตามแผนงวดของแปลง') : 'ดำเนินงานตามแผนงวดของแปลง';
    const state = number <= current ? 'ดำเนินการแล้ว' : 'รอดำเนินการ';
    return `<div class="plan-item ${number <= current ? 'done' : ''}"><span class="plan-number">${number}</span><div><b>งวดงานที่ ${number}</b><small>${safe(task)}</small></div><em>${state}</em></div>`;
  }).join('');
}
function workPlan(x) {
  const current = x.latestWork ? Number(x.latestWork.name.replace(/\D/g, '')) : 0;
  const stages = Array.isArray(x.planTasks) ? x.planTasks : [];
  const dates = Array.isArray(x.planDates) ? x.planDates : [];
  const fallback = Array.from({ length: x.totalInstallments }, () => []);
  const planStages = stages.length ? stages : fallback;
  return planStages.map((headings, index) => {
    const number = index + 1;
    const state = number <= current ? 'ดำเนินการแล้ว' : 'รอดำเนินการ';
    const items = headings.length
      ? `<ul class="plan-topics">${headings.map(item => `<li>${safe(item)}</li>`).join('')}</ul>`
      : '<small>ไม่พบหัวข้องานหลักในตารางแผน</small>';
    const date = dates[index];
    const schedule = x.year !== 3 ? '' : date && date.start && date.end
      ? `<small class="plan-date">วันเริ่มต้น–สิ้นสุด: ${safe(date.start)} – ${safe(date.end)}</small>`
      : '<small class="plan-date muted">วันเริ่มต้น–สิ้นสุด: ไม่ระบุในตารางสรุป</small>';
    return `<div class="plan-item ${number <= current ? 'done' : ''}"><span class="plan-number">${number}</span><div><b>งวดงานที่ ${number}</b>${schedule}${items}</div><em>${state}</em></div>`;
  }).join('');
}
function yearOnePlanSection(x) {
  if (x.year !== 1 || !Array.isArray(x.planTasks) || !x.planTasks.length) return '';
  return `<h3 class="section-title">รายละเอียดงวดงาน ปีที่ 1 (แปลงปี 66)</h3><p class="plan-note">รายการตามตารางงวดงานโครงการปี 2566</p><div class="work-plan">${workPlan(x)}</div>`;
}
function show(x) {
  const latest = x.latestPayment ? `${x.latestPayment.name} · ดำเนินการแล้ว ${pc(x.latestPayment.percent)}` : 'ยังไม่พบรายการเบิกจ่าย';
  const latestWork = x.latestWork ? `ทั้งหมด ${x.totalInstallments} งวด · ดำเนินงานถึงงวดที่ ${x.latestWork.name.replace(/\D/g, '')}` : `ทั้งหมด ${x.totalInstallments} งวด · ยังไม่เริ่มงวดงาน`;
  $('#detail').innerHTML = `<p class="detail-kicker">${safe(x.program)} · ${yearLabel(x.year)}</p><h2 class="detail-title" id="detail-title">${safe(x.plot)}</h2><p class="detail-meta">${safe(x.province || 'ไม่ระบุจังหวัด')} ${x.status ? '· '+safe(x.status) : ''}</p>
  <div class="latest work-latest"><small>ดำเนินงานแล้วเสร็จถึง</small><strong>${safe(latestWork)}</strong></div>
  ${x.year === 3 ? `<h3 class="section-title">${x.planGroup === '37' ? 'แผนกลุ่ม 37 แปลง' : `แผนกลุ่ม ${safe(x.planGroup || 'ไม่ระบุ')}`}</h3><p class="plan-note">รายการงวดงานตามตารางแผนปีที่ 3</p><h3 class="section-title">รายการงวดงานทั้งหมด (${x.totalInstallments} งวด)</h3><div class="work-plan">${workPlan(x)}</div>` : ''}
  <div class="latest"><small>สถานะการจ่ายเงินงวดล่าสุด</small><strong>${safe(latest)}</strong></div>
  <h3 class="section-title">ข้อมูลแปลง</h3><div class="info-grid"><div class="info"><small>เนื้อที่</small><b>${x.area ? Number(x.area).toLocaleString('th-TH',{maximumFractionDigits:2})+' ไร่' : '—'}</b></div><div class="info"><small>ผู้รับเหมา</small><b>${safe(x.contractor)}</b></div><div class="info full"><small>เจ้าหน้าที่ประจำแปลง</small><b>${safe(x.officer)}</b></div><div class="info full"><small>เลขที่สัญญา STC to ROK</small><b>${safe(x.stcToRokContract)}</b></div><div class="info full"><small>เลขที่สัญญา ROK–ผู้รับเหมา</small><b>${safe(x.rokToContractorContract)}</b></div></div>`;
  const yearOnePlan = yearOnePlanSection(x);
  if (yearOnePlan) $('#detail').querySelector('.work-latest').insertAdjacentHTML('afterend', yearOnePlan);
  const locationInfo = [
    x.province ? `<div class="info"><small>จังหวัด</small><b>${safe(x.province)}</b></div>` : '',
    x.district ? `<div class="info"><small>อำเภอ</small><b>${safe(x.district)}</b></div>` : ''
  ].join('');
  if (locationInfo) $('#detail').querySelector('.info-grid').insertAdjacentHTML('afterbegin', locationInfo);
  const period = x.contractPeriod;
  if (period && (period.start || period.end)) {
    const contractInfo = [...$('#detail').querySelectorAll('.info')].find(info => info.querySelector('small')?.textContent.includes('ROK–ผู้รับเหมา'));
    if (contractInfo) contractInfo.insertAdjacentHTML('afterend', `<div class="info full contract-period"><small>ระยะเวลาสัญญา ROK–ผู้รับเหมา</small><b>เริ่มต้น ${safe(period.start || 'ไม่ระบุ')} · สิ้นสุด ${safe(period.end || 'ไม่ระบุ')}</b></div>`);
  }
  if (Array.isArray(x.kmzLinks)) {
    const links = x.kmzLinks.length
      ? x.kmzLinks.map((link, index) => `<a class="kmz-link" href="${encodeURI(link)}" target="_blank" rel="noopener">เปิด KMZ เฉพาะแปลงนี้${x.kmzLinks.length > 1 ? ` (${index + 1})` : ''}</a>`).join('')
      : '<small class="kmz-missing">ไม่พบไฟล์ KMZ ของแปลงนี้ในข้อมูลต้นทาง</small>';
    $('#detail').querySelector('.info-grid').insertAdjacentHTML('beforebegin', `<div class="kmz-links"><small>แผนที่ขอบเขตแปลง (KMZ)</small>${links}</div>`);
  }
  $('#sheet').hidden = false; document.body.style.overflow = 'hidden';
}
function close() { $('#sheet').hidden = true; document.body.style.overflow = ''; }
$('#updated').textContent = DATA.updated;
const provinceSelect = $('#province-filter');
[...new Set(DATA.records.map(x => x.province).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'th')).forEach(name => provinceSelect.insertAdjacentHTML('beforeend', `<option value="${safe(name)}">${safe(name)}</option>`));
const officerSelect = $('#officer-filter');
[...new Set(DATA.records.map(x => x.officer).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'th')).forEach(name => officerSelect.insertAdjacentHTML('beforeend', `<option value="${safe(name)}">${safe(name)}</option>`));
$('#search').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); renderList(); });
document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => { program = btn.dataset.program; document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === btn)); renderList(); }));
$('#year-filter').addEventListener('change', e => { year = e.target.value; renderList(); });
provinceSelect.addEventListener('change', e => { province = e.target.value; renderList(); });
officerSelect.addEventListener('change', e => { officer = e.target.value; renderList(); });
$('#progress-filter').addEventListener('change', e => { progress = e.target.value; renderList(); });
$('#close').addEventListener('click', close); $('#sheet').addEventListener('click', e => { if (e.target === $('#sheet')) close(); });
renderList();
