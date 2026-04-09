'use strict';

// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAD809uwf9ZcMml-bbDXtJw8vaWFjvLOQg",
  authDomain: "vote-buttons-13652.firebaseapp.com",
  projectId: "vote-buttons-13652",
  storageBucket: "vote-buttons-13652.firebasestorage.app",
  messagingSenderId: "910772982997",
  appId: "1:910772982997:web:2bb50708d47710c420be5c",
  measurementId: "G-D71WMNXZ8F"
};
// 2. Global State (ประกาศตัวแปรเพียงครั้งเดียว)
if (typeof db === 'undefined') {
  var db; 
}

let currentLang = 'th';
let currentJudge = null;
let settings = null;
let sessionData = null;
let myVoteForCurrentSlot = null;
let barChartInst = null;
let pieChartInst = null;
let votesUnsubscribe = null;
let audioCtx = null;

/* TRANSLATIONS — ภาษาไทย & อังกฤษ*/
const i18n = {
  th: {
    appTitle:       "Vote Buttons",
    setupSubtitle:  "ระบบประเมินผลกรรมการ",
    selectJudge:    "เลือกกรรมการของคุณ",
    loading:        "กำลังโหลด...",
    setupHint:      "กรุณาเลือกชื่อของคุณก่อนเริ่มประเมิน",
    teamLabel:      "ทีม",
    back:           "กลับ",
    adminTitle:     "⚙️ ตั้งค่าระบบ",
    currentStatus:  "สถานะปัจจุบัน",
    inactive:       "ไม่ได้ใช้งาน",
    active:         "กำลังประเมิน",
    activateRound:  "🚀 เปิดรอบปัจจุบัน",
    resetAll:       "🔄 Reset ทั้งหมด",
    judges:         "กรรมการ",
    addJudge:       "เพิ่มกรรมการ",
    persons:        "คน",
    teams:          "ทีม",
    addTeam:        "เพิ่มทีม",
    teams2:         "ทีม",
    rounds:         "ช่วงการประเมิน",
    addRound:       "เพิ่มช่วง",
    rounds2:        "ช่วง",
    saveSettings:   "บันทึกการตั้งค่า",
    pass:           "ผ่าน",
    fail:           "ไม่ผ่าน",
    waitingActive:  "รอ Admin เปิดรอบการประเมิน...",
    waitingOthers:  "รอกรรมการท่านอื่น...",
    judgesVoted:    "กรรมการกดแล้ว",
    outOf:          "จาก",
    persons2:       "คน",
    youVotedPass:   (team) => `คุณประเมิน ${team} ✅ ผ่าน`,
    youVotedFail:   (team) => `คุณประเมิน ${team} ❌ ไม่ผ่าน`,
    nextTeam:       "ไปทีมถัดไป...",
    nextRound:      "ขึ้นช่วงถัดไป...",
    allDone:        "ประเมินครบทุกทีมแล้ว!",
    summaryTitle:   "📊 สรุปผลการประเมิน",
    swipeHint:      "← ปัดซ้ายเพื่อดูกราฟสรุป",
    viewChart:      "ดูกราฟ →",
    myVotes:        "ผลของฉัน",
    allTeamsChart:  "📈 กราฟสรุปทุกทีม",
    barChart:       "จำนวนคะแนน ผ่าน/ไม่ผ่าน ต่อทีม",
    pieChart:       "สัดส่วน ผ่าน vs ไม่ผ่าน (รวมทุกทีม)",
    settingsSaved:  "✅ บันทึกการตั้งค่าเรียบร้อย",
    resetConfirm:   "ยืนยันการ Reset ข้อมูลทั้งหมด?",
    resetDone:      "🔄 Reset เรียบร้อยแล้ว",
    activated:      "🚀 เปิดรอบแล้ว!",
    noSettings:     "ยังไม่มีการตั้งค่า กรุณาตั้งค่าก่อน",
    roundOf:        (r, total) => `ช่วงที่ ${r}/${total}`,
    teamOf:         (t, total) => `ทีมที่ ${t}/${total}`,
    notVoted:       "ยังไม่ได้ประเมิน",
    alreadyVoted:   "คุณโหวตไปแล้ว",
  },
  en: {
    appTitle:       "Vote Buttons",
    setupSubtitle:  "Judge Evaluation System",
    selectJudge:    "Select Your Name",
    loading:        "Loading...",
    setupHint:      "Please select your name before starting",
    teamLabel:      "Team",
    back:           "Back",
    adminTitle:     "⚙️ System Settings",
    currentStatus:  "Current Status",
    inactive:       "Inactive",
    active:         "Active",
    activateRound:  "🚀 Activate Current Round",
    resetAll:       "🔄 Reset Everything",
    judges:         "Judges",
    addJudge:       "Add Judge",
    persons:        "judges",
    teams:          "Teams",
    addTeam:        "Add Team",
    teams2:         "teams",
    rounds:         "Evaluation Rounds",
    addRound:       "Add Round",
    rounds2:        "rounds",
    saveSettings:   "Save Settings",
    pass:           "Pass",
    fail:           "Fail",
    waitingActive:  "Waiting for Admin to activate...",
    waitingOthers:  "Waiting for others...",
    judgesVoted:    "Judges voted",
    outOf:          "of",
    persons2:       "",
    youVotedPass:   (team) => `You rated ${team} ✅ Pass`,
    youVotedFail:   (team) => `You rated ${team} ❌ Fail`,
    nextTeam:       "Moving to next team...",
    nextRound:      "Moving to next round...",
    allDone:        "All evaluations complete!",
    summaryTitle:   "📊 Evaluation Summary",
    swipeHint:      "← Swipe left for charts",
    viewChart:      "View Charts →",
    myVotes:        "My Votes",
    allTeamsChart:  "📈 All Teams Chart",
    barChart:       "Pass / Fail count per Team",
    pieChart:       "Pass vs Fail ratio (all teams)",
    settingsSaved:  "✅ Settings saved",
    resetConfirm:   "Confirm reset all data?",
    resetDone:      "🔄 Reset complete",
    activated:      "🚀 Round activated!",
    noSettings:     "No settings found. Please configure first.",
    roundOf:        (r, total) => `Round ${r}/${total}`,
    teamOf:         (t, total) => `Team ${t}/${total}`,
    notVoted:       "Not voted",
    alreadyVoted:   "Already voted",
  }
};

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

async function playVoteSound() {
  try {
    // 1. สร้างหรือดึง AudioContext เดิมมาใช้
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 2. เบราว์เซอร์ส่วนใหญ่จะบล็อกเสียงจนกว่าจะมีการกดปุ่ม (ต้อง Resume)
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // 3. สร้างระบบเสียง (Oscillator + Gain Node)
    const gainNode = audioCtx.createGain();
    const oscillator = audioCtx.createOscillator();

    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    oscillator.type = 'sine'; // เสียงนุ่มๆ
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.connect(gainNode);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    console.error("Audio Error:", e);
  }
}

/* เปลี่ยนภาษา */
function t(key, ...args) {
  const val = i18n[currentLang][key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}

function applyTranslations() {
  // เปลี่ยนข้อความทุก element ที่มี data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = i18n[currentLang][key];
    if (val && typeof val === 'string') el.textContent = val;
  });
  // อัพเดต label ปุ่มภาษา
  document.getElementById('lang-label').textContent = currentLang === 'th' ? 'EN' : 'ไทย';
  // อัพเดต html lang attribute
  document.documentElement.lang = currentLang === 'th' ? 'th' : 'en';
}

// ฟังก์ชันสลับภาษา — ถูกเรียกจาก onclick ใน HTML
function toggleLanguage() {
  currentLang = currentLang === 'th' ? 'en' : 'th';
  applyTranslations();
  // อัพเดต dynamic content ที่ render แล้ว
  if (sessionData) updateJudgeScreen();
  if (sessionData && settings) updateStatusBanner();
  showToast(currentLang === 'th' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English', 'info');
}

/* FIREBASE & INITIALIZATION */
function init() {
  applyTranslations(); // ตั้งค่าภาษาไทย/อังกฤษก่อน
  initFirebase();      // เริ่มเชื่อมต่อ Cloud Firestore

  // ตรวจสอบว่าเคย Login ไว้หรือไม่
  if (restoreSession()) {
    // ถ้าเคยเลือกชื่อไว้แล้ว ให้ไปหน้าตัดสินทันที
    showScreen('screen-judge');
  } else {
    // ถ้ายังไม่เคย ให้ไปหน้าแรกเพื่อเลือกชื่อ
    showScreen('screen-setup');
  }
}

function initFirebase() {
  // 1. ป้องกันการ Initialize ซ้ำ (กรณี Refresh หรือ Hot Reload)
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // 2. เชื่อมต่อ Firestore (ใช้ db ที่ประกาศไว้ด้านบนสุด)
  db = firebase.firestore();

  // 3. ฟังการตั้งค่า (Settings) แบบ Realtime
  db.collection('config').doc('settings').onSnapshot(doc => {
    if (doc.exists) {
      settings = doc.data();
      renderJudgeList(); // วาดรายชื่อกรรมการในหน้าแรก
      if (isAdminOpen()) renderAdminInputs(); // ถ้าหน้า Admin เปิดอยู่ให้วาด Input ใหม่
    } else {
      console.warn("⚠️ ไม่พบข้อมูลการตั้งค่าใน Firestore (config/settings)");
      renderJudgeListEmpty();
    }
  }, error => {
    console.error("❌ Firestore Settings Error:", error);
    // กรณีไม่มีสิทธิ์เข้าถึง (Rules) จะแจ้งเตือนที่นี่
  });

  // 4. ฟังสถานะการแข่งขัน (Session) แบบ Realtime
  db.collection('config').doc('session').onSnapshot(doc => {
    const data = doc.data();
    sessionData = data || {
      currentRoundIndex: 0,
      currentTeamIndex: 0,
      isActive: false,
      isCompleted: false
    };
    
    // สำคัญ: เมื่อสถานะเปลี่ยน (เช่น Admin กดข้ามทีม) ให้ทำงานทันที
    handleSessionChange();
  }, error => {
    console.error("❌ Firestore Session Error:", error);
  });
}

/* CORE LOGIC */
function handleSessionChange() {
  // 1. ถ้ายังไม่เลือกกรรมการ หรือยังโหลด Settings ไม่เสร็จ ให้หยุดรอที่หน้าแรก
  if (!currentJudge || !settings) return;

  // 2. ถ้าจบการประเมินทั้งหมดแล้ว (isCompleted: true)
  if (sessionData.isCompleted) {
    showScreen('screen-summary');
    if (typeof buildSummary === 'function') buildSummary();
    return;
  }

  // 3. จัดการสลับหน้าจออัตโนมัติ 
  // หาก Admin เริ่มเปิดระบบ และเราเลือกชื่อแล้ว แต่ยังค้างหน้า Setup ให้เด้งไปหน้าตัดสิน
  const activeScreen = getActiveScreen();
  if (activeScreen === 'screen-setup' || activeScreen === 'screen-admin') {
    // กรณีไม่ได้เปิดหน้า Admin ค้างไว้ ให้พาไปหน้าตัดสิน
    if (activeScreen !== 'screen-admin') showScreen('screen-judge');
  }

  // 4. อัปเดตข้อมูลบนหน้าจอตัดสิน (ทีมปัจจุบัน/รอบปัจจุบัน/แถบ Progress)
  if (typeof updateJudgeScreen === 'function') updateJudgeScreen();
  
  // 5. อัปเดตสถานะในหน้า Admin (ถ้าเปิดทิ้งไว้)
  if (typeof updateAdminStatus === 'function') updateAdminStatus();
  
  // 6. โหลดคะแนนเดิมที่เราเคยกดไว้ (ป้องกันการกดซ้ำในทีมเดิม)
  if (typeof loadMyVoteForCurrentSlot === 'function') loadMyVoteForCurrentSlot();
  
  // 7. เริ่มฟังคะแนนของกรรมการทุกคน (จุดไข่ปลา) ในทีมปัจจุบัน
  listenToVotesForSlotFirestore();
}

function listenToVotesForSlotFirestore() {
  // ตรวจสอบความพร้อมของข้อมูลก่อนเริ่มฟัง
  if (!sessionData || !settings || !db) return;
  
  const { currentRoundIndex: ri, currentTeamIndex: ti } = sessionData;
  const slotKey = `${ri}_${ti}`; // คีย์สำหรับเอกสาร เช่น "0_0"
  const judgeCount = (settings.judges || []).length;

  // 🔥 [สำคัญ] หยุดฟังข้อมูล (Listener) ของทีมเก่าก่อน เพื่อป้องกัน Memory Leak และประหยัดการอ่านข้อมูล
  if (typeof votesUnsubscribe === 'function') {
    votesUnsubscribe();
    votesUnsubscribe = null;
  }

  // เริ่มฟังข้อมูลคะแนนแบบ Real-time ของทีมปัจจุบัน
  votesUnsubscribe = db.collection('votes').doc(slotKey).onSnapshot(doc => {
    const voteData = doc.data() || {};
    
    // วาดจุดไข่ปลาสถานะกรรมการ
    if (typeof renderJudgeDots === 'function') {
      renderJudgeDots(voteData, judgeCount);
    }
    
    // ตรวจสอบว่าโหวตครบทุกคนหรือยัง (ถ้าคุณต้องการให้เปลี่ยนทีมอัตโนมัติ)
    if (typeof checkAllVoted === 'function') {
      checkAllVoted(voteData, judgeCount, ri, ti);
    }
  }, error => {
    console.error("❌ Votes listener error:", error);
  });
}

/* JUDGE SCREEN */
function updateJudgeScreen() {
  // 1. Check ความพร้อมของข้อมูล
  if (!settings || !sessionData) return;

  const { currentRoundIndex: ri, currentTeamIndex: ti, isActive } = sessionData;
  const teamName  = settings.teams?.[ti]  || '—';
  const roundName = settings.rounds?.[ri] || '—';
  const judgeCount = (settings.judges || []).length;

  // 2. อัปเดตชื่อทีมและช่วงการประเมิน
  const teamEl = document.getElementById('current-team-name');
  const roundEl = document.getElementById('current-round-name');
  if (teamEl) teamEl.textContent = teamName;
  if (roundEl) roundEl.textContent = roundName;

  // 3. คำนวณความคืบหน้า (Progress Bar)
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const totalSteps = (settings.teams?.length || 1) * (settings.rounds?.length || 1);
    const currentStep = ri * (settings.teams?.length || 1) + ti;
    const pct = Math.round((currentStep / totalSteps) * 100);
    progressBar.style.width = pct + '%';
  }

  // 4. ควบคุมการแสดงผล Overlay และปุ่มกด (Active / Waiting State)
  const overlay = document.getElementById('vote-overlay');
  const overlayMsg = document.getElementById('overlay-msg');
  const btnPass = document.getElementById('btn-pass');
  const btnFail = document.getElementById('btn-fail');

  if (isActive && !myVoteForCurrentSlot) {
    // ✅ พร้อมให้โหวต: ปิด Overlay และเปิดใช้งานปุ่ม
    if (overlay) overlay.classList.add('hidden');
    if (btnPass) btnPass.disabled = false;
    if (btnFail) btnFail.disabled = false;
  } 
  else if (!isActive) {
    // ⏳ รอแอดมิน: แสดง Overlay และข้อความรอเปิดรอบ
    if (overlay) overlay.classList.remove('hidden');
    if (overlayMsg) overlayMsg.textContent = t('waitingActive');
    if (btnPass) btnPass.disabled = true;
    if (btnFail) btnFail.disabled = true;
  } 
  else {
    // ✅ โหวตไปแล้ว: แสดง Overlay และข้อความรอกรรมการท่านอื่น
    if (overlay) overlay.classList.remove('hidden');
    if (overlayMsg) overlayMsg.textContent = t('waitingOthers');
    if (btnPass) btnPass.disabled = true;
    if (btnFail) btnFail.disabled = true;
  }

  // 5. อัปเดต Banner สถานะสรุป (จุดไข่ปลาและจำนวนคนโหวต)
  if (typeof updateStatusBanner === 'function') updateStatusBanner();
  
  // 🔥 [แก้ไขจุดสำคัญ]: เปลี่ยนชื่อฟังก์ชันให้ตรงกับที่ใช้ Firestore
  if (typeof listenToVotesForSlotFirestore === 'function') {
    listenToVotesForSlotFirestore();
  }
}

/* STATUS BANNER */
function updateStatusBanner() {
  // 1. ป้องกันการทำงานหากข้อมูลยังไม่พร้อม
  if (!settings || !sessionData) return;

  const banner = document.getElementById('status-banner');
  const text   = document.getElementById('status-text');
  if (!banner || !text) return; // ป้องกัน Error หากไม่มี ID ใน HTML

  const { currentRoundIndex: ri, currentTeamIndex: ti, isActive } = sessionData;
  const teamName = settings.teams?.[ti] || '—';

  // 2. เคลียร์คลาสเดิมออกก่อนเพื่ออัปเดตสถานะใหม่
  banner.className = 'status-banner';

  // 3. จัดลำดับเงื่อนไขการแสดงผล (Priority Logic)
  if (myVoteForCurrentSlot === 'pass') {
    // กรณีที่โหวตผ่านแล้ว
    text.textContent = t('youVotedPass', teamName);
    banner.classList.add('voted'); // CSS ควรเปลี่ยนเป็นสีเขียว
  } 
  else if (myVoteForCurrentSlot === 'fail') {
    // กรณีที่โหวตไม่ผ่าน
    text.textContent = t('youVotedFail', teamName);
    banner.classList.add('voted-fail'); // CSS ควรเปลี่ยนเป็นสีแดง
  } 
  else if (!isActive) {
    // กรณีรอ Admin เปิดรอบ
    text.textContent = t('waitingActive');
    // คุณสามารถเพิ่ม banner.classList.add('waiting') เพื่อให้เป็นสีเหลืองหรือเทาได้
  } 
  else {
    // 💡 กรณีปกติ: แสดง "ช่วงที่ x/y · ทีมที่ x/y"
    const roundInfo = t('roundOf', ri + 1, settings.rounds?.length || 0);
    const teamInfo = t('teamOf', ti + 1, settings.teams?.length || 0);
    text.textContent = `${roundInfo} · ${teamInfo}`;
  }
}

/* VOTE DOTS — แสดงจุดสถานะกรรมการ */
function listenToVotesForSlotFirestore() {
  if (!sessionData || !settings || !db) return;
  
  const { currentRoundIndex: ri, currentTeamIndex: ti } = sessionData;
  const slotKey = `${ri}_${ti}`;
  const judgeCount = (settings.judges || []).length;

  // 🔥 หยุดตัวเก่าก่อนเริ่มตัวใหม่ เพื่อป้องกัน Listener ซ้อนกันมหาศาล
  if (typeof votesUnsubscribe === 'function') {
    votesUnsubscribe();
  }

  // เริ่มฟังข้อมูลจาก Firestore
  votesUnsubscribe = db.collection('votes').doc(slotKey).onSnapshot(doc => {
    const voteData = doc.data() || {};
    renderJudgeDots(voteData, judgeCount);
    
    // ตรวจสอบว่าโหวตครบทุกคนหรือยัง (ถ้ามีฟังก์ชันนี้)
    if (typeof checkAllVoted === 'function') {
      checkAllVoted(voteData, judgeCount, ri, ti);
    }
  }, error => {
    console.error("❌ Dots Listener Error:", error);
  });
}

/**
 * ฟังก์ชันวาดจุดไข่ปลากรรมการบนหน้าจอ
 */
function renderJudgeDots(voteData, judgeCount) {
  const dotsEl  = document.getElementById('judge-dots');
  const countEl = document.getElementById('judge-count-text');
  
  if (!dotsEl || !countEl) return;

  dotsEl.innerHTML = ''; // ล้างจุดเดิมออกก่อนวาดใหม่
  let votedCount = 0;

  for (let i = 0; i < judgeCount; i++) {
    const voteStatus = voteData[i]; // "pass", "fail", หรือ undefined
    if (voteStatus) votedCount++;

    const dot = document.createElement('div');
    
    // สร้าง Class: judge-dot + (pass/fail) + (me ถ้าเป็นตัวเราเอง)
    let dotClass = 'judge-dot';
    if (voteStatus === 'pass') dotClass += ' pass';
    if (voteStatus === 'fail') dotClass += ' fail';
    if (currentJudge && i === currentJudge.index) dotClass += ' me';
    
    dot.className = dotClass;
    
    // ใส่ Tooltip ชื่อกรรมการ (ถ้าเอาเมาส์ไปชี้)
    const judgeName = settings?.judges?.[i] || `Judge ${i + 1}`;
    dot.title = judgeName;

    // ถ้าเป็นจุดของเราเอง ให้ใส่สัญลักษณ์ดาวเพื่อให้แยกออกง่าย
    if (currentJudge && i === currentJudge.index) {
      dot.textContent = '★';
    }

    dotsEl.appendChild(dot);
  }

  // อัปเดตข้อความจำนวนคน เช่น "3 / 5"
  countEl.textContent = `${votedCount} / ${judgeCount}`;
}

/* CHECK ALL VOTED — ตรวจสอบว่าครบแล้วหรือยัง */
async function checkAllVoted(voteData, judgeCount, ri, ti) {
  // 1. ตรวจสอบว่าโหวตครบทุกคนหรือยัง
  const votedCount = Object.keys(voteData).length;
  if (votedCount === 0 || votedCount < judgeCount) return;

  // 2. ป้องกันการรันซ้ำซ้อน (เลือกเฉพาะแอดมินเท่านั้นที่เป็นคนสั่งเปลี่ยนรอบ)
  // หรือถ้าคุณต้องการให้แอปขยับเองอัตโนมัติ ให้รันต่อได้เลย
  const slotKey = `${ri}_${ti}`;

  try {
    // 3. บันทึกประวัติว่าทีมนี้ประเมินเสร็จแล้ว (Firestore Style)
    await db.collection('completedSessions').doc(slotKey).set({ 
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      roundIndex: ri,
      teamIndex: ti,
      totalVotes: votedCount
    });

    // 4. คำนวณ Slot ถัดไป
    const teamCount  = settings.teams?.length  || 1;
    const roundCount = settings.rounds?.length || 1;

    let nextTi = ti + 1;
    let nextRi = ri;

    if (nextTi >= teamCount) {
      nextTi = 0;
      nextRi = ri + 1;
    }

    // 5. อัปเดตสถานะ Session ใน Firestore
    const sessionRef = db.collection('config').doc('session');

    if (nextRi >= roundCount) {
      // --- จบการประเมินทั้งหมด ---
      await sessionRef.update({ 
        isCompleted: true, 
        isActive: false 
      });
      showToast(t('allDone'), 'info');
    } else {
      // --- ไปทีมถัดไป หรือ ช่วงถัดไป ---
      // เราจะตั้ง isActive เป็น false เพื่อให้ Admin เป็นคนกดเริ่มใหม่ในทีมถัดไป
      await sessionRef.update({
        currentTeamIndex: nextTi,
        currentRoundIndex: nextRi,
        isActive: false 
      });

      const msg = nextTi === 0 ? t('nextRound') : t('nextTeam');
      showToast(msg, 'info');
      
      if (typeof animateTeamChange === 'function') {
        animateTeamChange();
      }
    }
  } catch (error) {
    console.error("❌ Error in checkAllVoted:", error);
  }
}

/* CAST VOTE — กรรมการกดปุ่ม */
async function castVote(choice) {
  // 1. Check: ต้องเลือกชื่อแล้ว และแอดมินต้องเปิดรอบการประเมินอยู่ (isActive)
  if (!currentJudge || !sessionData?.isActive) return;

  // 2. Check: ถ้าเคยโหวตในทีมนี้ไปแล้ว ห้ามกดซ้ำ
  if (myVoteForCurrentSlot) {
    showToast(t('alreadyVoted'), 'info');
    return;
  }

  // 3. Feedback: เล่นเสียงปุ่มกด (เรียกฟังก์ชันที่เราปรับปรุงใหม่)
  if (typeof playVoteSound === 'function') {
    playVoteSound();
  }

  const { currentRoundIndex: ri, currentTeamIndex: ti } = sessionData;
  const slotKey = `${ri}_${ti}`;
  const teamName = settings.teams?.[ti] || '—';

  try {
    // 4. บันทึกลง Firestore: ใช้ [index] เป็น key เพื่อแยกคะแนนกรรมการแต่ละคน
    // { merge: true } สำคัญมาก เพื่อไม่ให้ทับคะแนนของกรรมการท่านอื่นในทีมเดียวกัน
    await db.collection('votes').doc(slotKey).set({
      [currentJudge.index]: choice
    }, { merge: true });

    // 5. อัปเดต State ภายในเครื่อง
    myVoteForCurrentSlot = choice;

    // 6. แสดง Toast แจ้งเตือน (เช่น "คุณประเมิน ทีม A ผ่าน")
    const msg = choice === 'pass' ? t('youVotedPass', teamName) : t('youVotedFail', teamName);
    showToast(msg, choice);
    
    // 7. UI Animation: ทำให้ปุ่มดูเหมือนถูกกดจริง
    const btnId = choice === 'pass' ? 'btn-pass' : 'btn-fail';
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 400);
    }

    // 8. สั่งให้หน้าจออัปเดต UI (เพื่อแสดง Overlay "รอกรรมการท่านอื่น")
    if (typeof updateJudgeScreen === 'function') {
      updateJudgeScreen();
    }

  } catch (error) {
    console.error("❌ Cast Vote Error:", error);
    showToast("Error saving vote. Please check your connection.", "fail");
  }
}

/* LOAD MY VOTE — โหลด vote ของตัวเองสำหรับ slot ปัจจุบัน */
async function loadMyVoteForCurrentSlot() {
  // 1. ถ้ายังไม่ได้เลือกชื่อ หรือไม่มีข้อมูล Session ให้หยุดทำงาน
  if (!currentJudge || !sessionData) return;

  const { currentRoundIndex: ri, currentTeamIndex: ti } = sessionData;
  const slotKey = `${ri}_${ti}`;

  try {
    // 💡 เคลียร์ค่าเดิมในเครื่องก่อน (ป้องกันค่าจากทีมเก่าค้างอยู่ชั่วขณะ)
    myVoteForCurrentSlot = null;

    // 2. ดึงข้อมูลเอกสารจากคอลเลกชัน 'votes' ตาม Slot (รอบ_ทีม)
    const doc = await db.collection('votes').doc(slotKey).get();

    if (doc.exists) {
      // 3. ดึงคะแนนโดยใช้ Index ของกรรมการคนนั้นๆ
      const data = doc.data();
      myVoteForCurrentSlot = data[currentJudge.index] || null;
    } else {
      // 4. ถ้าไม่มีเอกสารนี้ แสดงว่ายังไม่มีใครโหวตเลยในรอบนี้
      myVoteForCurrentSlot = null;
    }

    // 5. สั่งอัปเดตหน้าจอทันทีเมื่อได้ข้อมูลแล้ว
    // เพื่อให้ Overlay แสดงผล "รอกรรมการท่านอื่น" หรือเปิดให้ "กดโหวต" ได้ถูกต้อง
    if (typeof updateJudgeScreen === 'function') {
      updateJudgeScreen();
    }

  } catch (error) {
    console.error("❌ Error loading my vote:", error);
    // หาก Error ให้รีเซ็ตสถานะเป็น null ไว้ก่อนเพื่อความปลอดภัย
    myVoteForCurrentSlot = null;
    if (typeof updateJudgeScreen === 'function') updateJudgeScreen();
  }
}

/* JUDGE LIST */
function renderJudgeList() {
  const listEl = document.getElementById('judge-list');
  if (!listEl) return;

  // 1. ตรวจสอบว่ามีข้อมูลกรรมการใน Settings หรือยัง
  if (!settings?.judges || settings.judges.length === 0) {
    renderJudgeListEmpty();
    return;
  }

  // 2. ล้างค่าเดิมและเริ่มสร้างรายการใหม่
  listEl.innerHTML = '';

  settings.judges.forEach((name, idx) => {
    // สร้าง Card สำหรับกรรมการแต่ละคน
    const card = document.createElement('div');
    card.className = 'judge-card';
    
    // ปรับแต่ง UI: ใช้ตัวอักษรแรกเป็น Avatar และแสดงชื่อ
    const firstChar = name ? name.trim().charAt(0).toUpperCase() : '?';
    
    card.innerHTML = `
      <div class="judge-avatar">${firstChar}</div>
      <div class="judge-info">
        <div class="judge-name">${name}</div>
      </div>
      <div class="judge-arrow">›</div>
    `;

    // 3. Event Listeners: รองรับทั้ง Click และ Touch
    card.addEventListener('click', (e) => {
      e.preventDefault();
      // เรียกฟังก์ชันเลือกกรรมการ (ที่บันทึก Session)
      if (typeof selectJudge === 'function') {
        selectJudge(idx, name);
      }
    });

    // เพิ่ม Touch feedback สำหรับมือถือ
    card.addEventListener('touchstart', () => {
      card.style.opacity = '0.7';
    }, { passive: true });

    card.addEventListener('touchend', () => {
      card.style.opacity = '1';
    }, { passive: true });

    listEl.appendChild(card);
  });
}

/**
 * แสดงข้อความเมื่อยังไม่มีการตั้งค่าข้อมูล
 */
function renderJudgeListEmpty() {
  const listEl = document.getElementById('judge-list');
  if (listEl) {
    listEl.innerHTML = `
      <div class="no-data-state">
        <div class="loading-pulse">${t('noSettings')}</div>
        <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 10px;">
          (Admin: Please configure judges in settings)
        </p>
      </div>
    `;
  }
}

/* SELECT JUDGE — เลือกกรรมการ */
function selectJudge(index, name) {
  // 1. ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก
  if (index === undefined || !name) {
    console.error("❌ ข้อมูลกรรมการไม่ครบถ้วน");
    return;
  }

  // 2. อัปเดต Global State ในเครื่อง
  currentJudge = { index: parseInt(index), name: name };

  // 3. บันทึกข้อมูลลงใน Storage
  // แนะนำ: เปลี่ยนจาก sessionStorage เป็น localStorage 
  // เพื่อให้หากแอปเผลอปิดไป หรือเครื่องดับ แล้วเปิดใหม่ ไม่ต้องเลือกชื่อซ้ำอีกครั้งครับ
  localStorage.setItem('judgeIndex', index);
  localStorage.setItem('judgeName', name);

  // 4. แสดง Toast ต้อนรับ (เพิ่มความเป็นมิตรให้แอป)
  showToast(`สวัสดีคุณ ${name}`, 'info');

  // 5. เปลี่ยนหน้าจอและเริ่มฟังข้อมูลจาก Database
  showScreen('screen-judge');
  
  // 6. บังคับให้โหลดข้อมูลล่าสุดทันที
  if (typeof handleSessionChange === 'function') {
    handleSessionChange();
  }
}

/*ฟังก์ชันสำหรับดึงข้อมูลเดิมกลับมา (เรียกใช้ตอน init)*/
function restoreSession() {
  const savedIndex = localStorage.getItem('judgeIndex');
  const savedName = localStorage.getItem('judgeName');

  if (savedIndex !== null && savedName !== null) {
    currentJudge = { index: parseInt(savedIndex), name: savedName };
    return true; // พบข้อมูลเดิม
  }
  return false; // ไม่พบข้อมูลเดิม
}

/* ADMIN — เปิด/ปิด Admin Panel */
function openAdmin() {
  showScreen('screen-admin');
  if (typeof renderAdminInputs === 'function') {
    renderAdminInputs();
  }
  if (typeof updateAdminStatus === 'function') {
    updateAdminStatus();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeAdmin() {
  if (currentJudge) {
    showScreen('screen-judge');
    if (typeof updateJudgeScreen === 'function') updateJudgeScreen();
  } else {
    showScreen('screen-setup');
    if (typeof renderJudgeList === 'function') renderJudgeList();
  }
}

function isAdminOpen() {
  const activeScreen = getActiveScreen();
  return activeScreen === 'screen-admin';
}

/* ADMIN INPUTS */
/* ============================================================
    📝 ADMIN INPUTS — จัดการหน้าจอตั้งค่าแบบ Dynamic
   ============================================================ */

/**
 * วาดช่อง Input ทั้งหมด (กรรมการ, ทีม, รอบ)
 */
function renderAdminInputs() {
  renderDynamicInputs('judges-inputs', settings?.judges || [''], 'judge-count-display', t('persons'));
  renderDynamicInputs('teams-inputs',  settings?.teams  || [''], 'team-count-display',  t('teams2'));
  renderDynamicInputs('rounds-inputs', settings?.rounds || [''], 'round-count-display', t('rounds2'));
}

/**
 * ฟังก์ชันกลางสำหรับวาดกลุ่ม Input
 */
function renderDynamicInputs(containerId, items, countId, unit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  items.forEach((val, idx) => {
    container.appendChild(createInputItem(idx + 1, val, containerId));
  });
  updateCountDisplay(containerId, countId, unit);
}

/**
 * สร้าง HTML สำหรับแต่ละแถวของ Input
 * ปรับปรุง: ใช้ textContent เพื่อป้องกัน XSS หากมีข้อมูลแปลกปลอมในชื่อ
 */
function createInputItem(num, val, containerId) {
  const row = document.createElement('div');
  row.className = 'input-item';
  
  // ใช้ createElement แทน innerHTML บางส่วนเพื่อความปลอดภัย
  row.innerHTML = `
    <span class="input-num">${num}</span>
    <input class="dynamic-input" type="text" placeholder="..." />
    <button class="remove-btn" onclick="removeInputItem(this, '${containerId}')">×</button>
  `;
  
  // กำหนดค่า value แยกต่างหากเพื่อป้องกันการหลุดของ Tag HTML
  const input = row.querySelector('input');
  input.value = val || '';
  
  return row;
}

/* ฟังก์ชัน Helper สำหรับปุ่ม Add */
function addJudge() { addInputItem('judges-inputs', 'judge-count-display', t('persons')); }
function addTeam()  { addInputItem('teams-inputs',  'team-count-display',  t('teams2')); }
function addRound() { addInputItem('rounds-inputs', 'round-count-display', t('rounds2')); }

function addInputItem(containerId, countId, unit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const num = container.children.length + 1;
  const newItem = createInputItem(num, '', containerId);
  container.appendChild(newItem);
  
  updateCountDisplay(containerId, countId, unit);

  // Focus ไปที่ช่องใหม่ทันทีเพื่อให้พิมพ์ต่อได้เลย
  const lastInput = newItem.querySelector('input');
  if (lastInput) lastInput.focus();
}

/**
 * ลบแถว Input และจัดลำดับตัวเลขใหม่
 */
function removeInputItem(btn, containerId) {
  const row = btn.closest('.input-item');
  if (!row) return;

  row.remove();

  // จัดลำดับเลข (1, 2, 3...) ใหม่ให้ถูกต้องหลังการลบ
  const container = document.getElementById(containerId);
  container.querySelectorAll('.input-num').forEach((el, i) => {
    el.textContent = i + 1;
  });

  // อัปเดตตัวเลขสรุปด้านบน
  const config = {
    'judges-inputs': ['judge-count-display', t('persons')],
    'teams-inputs':  ['team-count-display',  t('teams2')],
    'rounds-inputs': ['round-count-display', t('rounds2')]
  };
  const [countId, unit] = config[containerId] || ['', ''];
  updateCountDisplay(containerId, countId, unit);
}

function updateCountDisplay(containerId, countId, unit) {
  const container = document.getElementById(containerId);
  const countEl   = document.getElementById(countId);
  if (!container || !countEl) return;
  countEl.innerHTML = `${container.children.length} <span>${unit}</span>`;
}

/**
 * ดึงค่าจาก Input ทั้งหมดออกมาเป็น Array เพื่อเตรียมบันทึกลง Firestore
 * ปรับปรุง: กรองเอาเฉพาะค่าที่มีตัวอักษรจริงๆ (ไม่เอาช่องว่าง)
 */
function getInputValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  return Array.from(container.querySelectorAll('.dynamic-input'))
    .map(inp => inp.value.trim())
    .filter(v => v !== ""); // กรองค่าว่างออก
}

/* SAVE SETTINGS */
async function saveSettings() {
  const judges = getInputValues('judges-inputs');
  const teams  = getInputValues('teams-inputs');
  const rounds = getInputValues('rounds-inputs');
  if (!judges.length || !teams.length || !rounds.length) {
    showToast('⚠️ กรุณากรอกข้อมูลให้ครบอย่างน้อย 1 รายการในทุกหมวด', 'info');
    return;
  }

  try {
    await db.collection('config').doc('settings').set({ 
      judges, 
      teams, 
      rounds,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp() // เก็บเวลาที่แก้ไขล่าสุด
    });
    showToast(t('settingsSaved'), 'info');
  } catch (error) {
    console.error("❌ Save Settings Error:", error);
    showToast("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่", "fail");
  }
}

async function activateRound() {
  // 1. ตรวจสอบความพร้อมของข้อมูล
  if (!settings || !sessionData) {
    showToast("⚠️ ข้อมูลระบบไม่พร้อม", "fail");
    return;
  }

  // 2. ถ้าสถานะคือจบการแข่งขันไปแล้ว (isCompleted) ห้ามกด Activate
  if (sessionData.isCompleted) {
    showToast("⚠️ การประเมินจบลงแล้ว กรุณา Reset ก่อนเริ่มใหม่", "info");
    return;
  }

  try {
    // 3. อัปเดตสถานะ isActive เป็น true ใน Firestore
    await db.collection('config').doc('session').update({ 
      isActive: true,
      activatedAt: firebase.firestore.FieldValue.serverTimestamp() // เก็บเวลาที่กดเริ่ม
    });

    // 4. แสดง Toast แจ้งเตือนแอดมิน
    showToast(t('activated'), 'info');

  } catch (error) {
    console.error("❌ Activate Round Error:", error);
    showToast("ไม่สามารถเปิดรอบได้ กรุณาลองใหม่", "fail");
  }
}

/*  UPDATE ADMIN STATUS  */
function updateAdminStatus() {
  // 1. ถ้าไม่ได้เปิดหน้าแอดมินอยู่ ไม่ต้องรัน (ประหยัดทรัพยากร)
  if (!isAdminOpen()) return;

  const dot      = document.getElementById('admin-status-dot');
  const text     = document.getElementById('admin-status-text');
  const info     = document.getElementById('admin-current-info');
  const isActive = sessionData?.isActive;

  // 2. แสดงไฟสถานะ (Active = เขียว / Inactive = เทาหรือแดง)
  if (dot) {
    dot.className = `status-indicator${isActive ? ' active' : ''}`;
  }

  // 3. แสดงข้อความสถานะ (ใช้ระบบแปลภาษา)
  if (text) {
    text.textContent = isActive ? t('active') : t('inactive');
  }

  // 4. แสดงข้อมูลว่าปัจจุบันอยู่ที่ รอบไหน / ทีมอะไร
  if (info && settings) {
    const ri = sessionData?.currentRoundIndex ?? 0;
    const ti = sessionData?.currentTeamIndex  ?? 0;
    
    const roundName = settings.rounds?.[ri] || '—';
    const teamName  = settings.teams?.[ti]  || '—';
    
    info.textContent = `${roundName} · ${teamName}`;
  }
}

/* RESET ALL  */
async function resetAll() {
  // 1. ถามเพื่อความชัวร์
  if (!confirm(t('resetConfirm'))) return;
  
  try {
    // 2. ล้างค่าโหวตในเครื่องตัวเองก่อน
    myVoteForCurrentSlot = null;

    // 3. รีเซ็ตสถานะ Session ใน Firestore ให้กลับไปเริ่มที่ 0
    await db.collection('config').doc('session').set({
      currentRoundIndex: 0,
      currentTeamIndex: 0,
      isActive: false,
      isCompleted: false,
      resetAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 4. 🔥 ล้างคะแนนโหวตทั้งหมดในฐานข้อมูล (Batch Delete)
    // เพื่อไม่ให้คะแนนเก่าโผล่มาตอนเริ่มรอบ 1 ใหม่
    const votesSnapshot = await db.collection('votes').get();
    if (!votesSnapshot.empty) {
      const batch = db.batch();
      votesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log("🧹 ข้อมูลการโหวตทั้งหมดถูกล้างเรียบร้อย");
    }

    showToast(t('resetDone'), 'info');

    // 5. อัปเดตหน้าจอแอดมินให้เป็นสถานะล่าสุด
    if (typeof updateAdminStatus === 'function') {
      updateAdminStatus();
    }

  } catch (error) {
    console.error("❌ Reset Error:", error);
    showToast("เกิดข้อผิดพลาดในการรีเซ็ต", "fail");
  }
}

/* SUMMARY — หน้าสรุปผล */
async function buildSummary() {
  if (!settings || !currentJudge) return;

  // 1. แสดงชื่อกรรมการที่หน้าสรุป
  const judgeNameEl = document.getElementById('summary-judge-name');
  if (judgeNameEl) judgeNameEl.textContent = currentJudge.name;

  try {
    // 2. 🔥 แก้ไข: โหลด votes ทั้งหมดจาก Firestore (เปลี่ยนจาก .ref() เป็น .collection())
    const snap = await db.collection('votes').get();
    const allVotes = {};
    
    // แปลงข้อมูลจาก Firestore Snapshot ให้เป็น Object ที่โค้ดเดิมเข้าใจ
    snap.forEach(doc => {
      allVotes[doc.id] = doc.data();
    });

    // 3. สร้างตารางผลโหวตเฉพาะของเราเอง
    buildMyVotesTable(allVotes);
    
    // 4. สร้างกราฟสรุปผลรวม (ใช้ Chart.js)
    buildCharts(allVotes);

  } catch (error) {
    console.error("❌ Error building summary:", error);
    showToast("ไม่สามารถโหลดสรุปผลได้", "fail");
  }
}

function buildMyVotesTable(allVotes) {
  const container = document.getElementById('my-votes-table');
  if (!container) return;
  container.innerHTML = '';

  (settings.teams || []).forEach((teamName, ti) => {
    const row = document.createElement('div');
    row.className = 'vote-row';
    // เพิ่ม Stagger Animation ให้ดูหรูหรา
    row.style.animationDelay = `${ti * 0.05}s`;

    const roundBadges = (settings.rounds || []).map((roundName, ri) => {
      const slotKey = `${ri}_${ti}`;
      const v = allVotes[slotKey]?.[currentJudge.index];
      
      const cls = v === 'pass' ? 'pass' : v === 'fail' ? 'fail' : 'none';
      const icon = v === 'pass' ? '✓' : v === 'fail' ? '✗' : '?';
      const label = v === 'pass' ? t('pass') : v === 'fail' ? t('fail') : t('notVoted');
      
      return `<span class="round-badge ${cls}">${icon} ${roundName}: ${label}</span>`;
    }).join('');

    row.innerHTML = `
      <div class="vote-row-team">🏆 ${teamName}</div>
      <div class="vote-row-rounds">${roundBadges}</div>
    `;
    container.appendChild(row);
  });
}

function buildCharts(allVotes) {
  const teams  = settings.teams  || [];
  const rounds = settings.rounds || [];

  // --- การคำนวณคะแนน (ส่วนนี้ของคุณดีมากอยู่แล้ว ไม่ต้องแก้) ---
  const passData = teams.map((_, ti) => {
    let p = 0;
    rounds.forEach((_, ri) => {
      const slot = allVotes[`${ri}_${ti}`] || {};
      Object.values(slot).forEach(v => { if (v === 'pass') p++; });
    });
    return p;
  });

  const failData = teams.map((_, ti) => {
    let f = 0;
    rounds.forEach((_, ri) => {
      const slot = allVotes[`${ri}_${ti}`] || {};
      Object.values(slot).forEach(v => { if (v === 'fail') f++; });
    });
    return f;
  });

  const totalPass = passData.reduce((a, b) => a + b, 0);
  const totalFail = failData.reduce((a, b) => a + b, 0);

  // --- การวาด Bar Chart ---
  const barCanvas = document.getElementById('bar-chart');
  if (barCanvas) { // เช็คก่อนว่ามี Canvas นี้ไหม
    const barCtx = barCanvas.getContext('2d');
    if (barChartInst) barChartInst.destroy();
    barChartInst = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: teams,
        datasets: [
          {
            label: t('pass'),
            data: passData,
            backgroundColor: 'rgba(16,185,129,0.75)',
            borderColor: '#10b981',
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: t('fail'),
            data: failData,
            backgroundColor: 'rgba(239,68,68,0.75)',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            labels: { 
              color: '#94a3b8', 
              font: { family: "'Noto Sans Thai', sans-serif" } 
            } 
          } 
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { 
            ticks: { color: '#94a3b8', stepSize: 1 }, 
            grid: { color: 'rgba(255,255,255,0.05)' }, 
            beginAtZero: true 
          }
        }
      }
    });
  }

  // --- การวาด Pie Chart (Doughnut) ---
  const pieCanvas = document.getElementById('pie-chart');
  if (pieCanvas) {
    const pieCtx = pieCanvas.getContext('2d');
    if (pieChartInst) pieChartInst.destroy();
    pieChartInst = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: [t('pass'), t('fail')],
        datasets: [{
          data: [totalPass, totalFail],
          backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
          borderColor: ['#10b981', '#ef4444'],
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { 
              color: '#94a3b8', 
              font: { family: "'Noto Sans Thai', sans-serif" }, 
              padding: 16 
            },
            position: 'bottom'
          }
        }
      }
    });
  }
}

/* SWIPE — ปัดหน้าจอในหน้า Summary */
let swipeSummaryPage = 1; // 1 = ตาราง My Votes, 2 = กราฟสรุปผลรวม
let touchStartX = 0;

/**
 * ฟังก์ชันเปลี่ยนหน้าสรุปผล
 * @param {number} page - เลขหน้า (1 หรือ 2)
 */
function goToPage(page) {
  const swipe = document.getElementById('summary-swipe');
  if (!swipe) return;

  swipeSummaryPage = page;
  
  // ปรับการคำนวณ: 
  // หน้า 1: translateX(0%)
  // หน้า 2: translateX(-50%) -> กรณี Container กว้าง 200%
  swipe.style.transform = `translateX(${-(page - 1) * 50}%)`;

  // อัปเดตสถานะปุ่ม Indicator (ถ้าคุณมีจุดกลมๆ ด้านล่าง)
  updateSwipeDots(page);
}


function goToPage(page) {
  const swipe = document.getElementById('summary-swipe');
  if (!swipe) return;

  swipeSummaryPage = page;
  
  // ปรับการคำนวณ: 
  // หน้า 1: translateX(0%)
  // หน้า 2: translateX(-50%) -> กรณี Container กว้าง 200%
  swipe.style.transform = `translateX(${-(page - 1) * 50}%)`;

  // อัปเดตสถานะปุ่ม Indicator (ถ้าคุณมีจุดกลมๆ ด้านล่าง)
  updateSwipeDots(page);
}

/**
 * เริ่มต้นระบบดักจับการปัดหน้าจอ (Swipe)
 */
function initSummarySwipe() {
  const swipe = document.getElementById('summary-swipe');
  if (!swipe) return;

  // 1. เก็บตำแหน่งเริ่มจิ้ม
  swipe.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  // 2. คำนวณระยะที่ปัดเมื่อปล่อยนิ้ว
  swipe.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const dx = touchEndX - touchStartX;

    // ปัดซ้าย (ไปหน้าถัดไป)
    if (dx < -60 && swipeSummaryPage === 1) {
      goToPage(2);
    }
    // ปัดขวา (ย้อนกลับ)
    else if (dx > 60 && swipeSummaryPage === 2) {
      goToPage(1);
    }
  }, { passive: true });
}

/**
 * อัปเดตจุด Indicator ด้านล่าง (Optional: เพื่อให้ User รู้ว่ามีกี่หน้า)
 */
function updateSwipeDots(page) {
  const dot1 = document.getElementById('dot-page-1');
  const dot2 = document.getElementById('dot-page-2');
  if (dot1 && dot2) {
    dot1.classList.toggle('active', page === 1);
    dot2.classList.toggle('active', page === 2);
  }
}

/* SCREEN MANAGEMENT  */
function showScreen(id) {
  const screens = document.querySelectorAll('.screen');
  const target = document.getElementById(id);

  if (!target) {
    console.error(`❌ ไม่พบหน้าจอ ID: ${id}`);
    return;
  }
  screens.forEach(s => s.classList.remove('active'));
  target.classList.add('active');
  if (id === 'screen-summary') {
    if (typeof buildSummary === 'function') buildSummary();
  }
  if (id === 'screen-setup') {
    if (typeof renderJudgeList === 'function') renderJudgeList();
  }

  window.scrollTo(0, 0);
}

function getActiveScreen() {
  const activeScreen = document.querySelector('.screen.active');
  return activeScreen ? activeScreen.id : null;
}

/* TOAST — แสดงข้อความแจ้งเตือน */
let toastTimer = null; // ตัวแปรสำหรับเก็บสถานะเวลา

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (toastTimer) {
    clearTimeout(toastTimer);
    toast.classList.remove('show');
  }

  toast.textContent = msg;
  toast.className = `toast ${type} show`;


  toastTimer = setTimeout(() => {
    toast.className = 'toast';
    toastTimer = null;
  }, 2800);
}

/* ผูกฟังก์ชันกับ Window เพื่อให้ HTML เรียกใช้งานได้*/

window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
window.castVote = castVote;
window.saveSettings = saveSettings;
window.activateRound = activateRound;
window.resetAll = resetAll;
window.toggleLanguage = toggleLanguage;

// ฟังก์ชันสำหรับจัดการข้อมูลแบบ Dynamic ในหน้า Admin (เพื่อให้ปุ่ม + ทำงานได้)
window.addJudge = addJudge;
window.addTeam = addTeam;
window.addRound = addRound;
window.removeInputItem = removeInputItem;

// ฟังก์ชันสำหรับหน้าสรุปผล
window.goToPage = goToPage;
window.buildSummary = buildSummary;

// เริ่มต้นระบบเมื่อโหลด DOM เสร็จสิ้น
document.addEventListener('DOMContentLoaded', init);

/* ANIMATE TEAM CHANGE  */
function animateTeamChange() {
  const topBar = document.querySelector('.top-bar-info');
  if (!topBar) return;
  topBar.classList.add('team-changing');
  setTimeout(() => {
    topBar.classList.remove('team-changing');
  }, 700);
}

/* RESTORE SESSION */
function restoreSession() {
  // เปลี่ยนมาใช้ localStorage เพื่อความทนทานของข้อมูลครับ
  const idx  = localStorage.getItem('judgeIndex');
  const name = localStorage.getItem('judgeName');

  // ตรวจสอบว่ามีข้อมูลครบทั้ง Index และ Name หรือไม่
  if (idx !== null && name) {
    // ใช้ parseInt พร้อมระบุเลขฐาน 10 เพื่อความแม่นยำ
    currentJudge = { 
      index: parseInt(idx, 10), 
      name: name 
    };
    return true; // กู้คืนสำเร็จ
  }

  return false; // ไม่พบข้อมูลเดิม (ต้องไปหน้า Setup)
}

/* INIT — เริ่มต้นระบบ */
function init() {
  applyTranslations();
  if (typeof initSummarySwipe === 'function') {
    initSummarySwipe();
  }

  if (!firebaseConfig || firebaseConfig.apiKey === 'YOUR_API_KEY') {
    console.warn('⚠️ กรุณาตั้งค่า firebaseConfig ให้ถูกต้องก่อนใช้งาน');
    if (typeof renderDemoMode === 'function') renderDemoMode();
    return;
  }
  initFirebase();

  if (restoreSession()) {
    // ถ้าเคยเลือกชื่อไว้แล้ว ให้พาไปหน้าตัดสิน
    showScreen('screen-judge');

  } else {
    // ถ้าเป็นผู้ใช้ใหม่ ให้ไปหน้าเลือกชื่อกรรมการ
    showScreen('screen-setup');
  }
}

/* DEMO MODE — แสดงผลโดยไม่ต้องใช้ Firebase (เพื่อ preview) */
function renderDemoMode() {
  // 1. จำลองข้อมูล Settings และ Session
  settings = {
    judges: ['สมชาย', 'สมหญิง', 'สมศักดิ์'],
    teams:  ['ทีม Alpha', 'ทีม Beta', 'ทีม Gamma'],
    rounds: ['ช่วงที่ 1: ความถูกต้อง', 'ช่วงที่ 2: ความคิดสร้างสรรค์']
  };
  
  sessionData = {
    currentRoundIndex: 0,
    currentTeamIndex:  0,
    isActive:          false, // ใน Demo จะล็อกปุ่มไว้ก่อน
    isCompleted:       false
  };

  // 2. แสดงหน้าแรกและวาดรายชื่อกรรมการจำลอง
  showScreen('screen-setup');
  renderJudgeList();

  /**
   * 🛠️ Override selectJudge เฉพาะตอนอยู่ใน Demo
   * เพื่อให้กดเลือกกรรมการแล้วเปลี่ยนหน้าได้โดยไม่ต้องรอ Firebase
   */
  window.selectJudge = function(index, name) {
    currentJudge = { index, name };
    
    // เปลี่ยนหน้าไปที่หน้าตัดสิน
    showScreen('screen-judge');
    
    // วาดข้อมูลจำลองลงในหน้าจอตัดสิน
    const teamEl  = document.getElementById('current-team-name');
    const roundEl = document.getElementById('current-round-name');
    const countEl = document.getElementById('judge-count-text');
    const statusEl = document.getElementById('status-text');

    if (teamEl)  teamEl.textContent = settings.teams[0];
    if (roundEl) roundEl.textContent = settings.rounds[0];
    if (countEl) countEl.textContent = '0 / 3';

    // แสดงสถานะว่ากำลังรอแอดมิน (เพราะ isActive = false)
    if (statusEl) statusEl.textContent = t('waitingActive');
    
    // อัปเดตแถบสีสถานะ
    updateStatusBanner();

    showToast(`✅ ${currentLang === 'th' ? 'เข้าสู่ระบบเป็น' : 'Logged in as'} ${name}`, 'info');
    
    console.warn('⚠️ คุณอยู่ใน Demo Mode ข้อมูลจะไม่ถูกบันทึกลงฐานข้อมูลจริง');
  };

  console.info('🚀 Vote Buttons — Demo Mode Activated');
}

document.addEventListener('DOMContentLoaded', init);
