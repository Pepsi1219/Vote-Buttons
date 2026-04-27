// ป้องกันไม่ให้แอปเด้งกลับหน้าแรกตอนที่กรรมการเพิ่งเปิดแอปครั้งแรกสุด
let isFirstSettingsLoad = true;


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
// 2. Global State
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

function checkAuth() {
  // ดึงข้อมูลจากความจำเบราว์เซอร์
  const savedVoter = localStorage.getItem('voter_session');
  if (savedVoter) {
    currentJudge = JSON.parse(savedVoter);
    console.log("Found existing session for:", currentJudge.name);
  } else {
    currentJudge = null;
    console.log("No session found. Forcing Setup Screen.");
    // บังคับไปหน้าแรก
    showScreen('screen-setup'); 
  }
}

/* TRANSLATIONS — ภาษาไทย & อังกฤษ*/
const i18n = {
  th: {
    appTitle:       "Shopfloor Best Practice Competition",
    setupSubtitle:  "ระบบประเมินผล",
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
    viewChart:      "📈 ดูกราฟ",
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
    homeText: "กลับหน้าแรก",
    confirmJudgeName: "ยืนยันว่าคุณคือ: ",
    warningNoEdit: "\n\n*หากกดยืนยันแล้ว คุณจะไม่สามารถแก้ไขชื่อได้ภายหลัง",
    confirmPass: 'ยืนยันการให้ผล "ผ่าน"',
    confirmFail: 'ยืนยันการให้ผล "ไม่ผ่าน"',
    modalReview: "กรุณาทบทวนเกณฑ์การประเมินดังต่อไปนี้:",
    chkProcess: "ขั้นตอนการทำงานถูกต้อง",
    chkPic: "บุคคลที่รับผิดชอบได้รับการระบุอย่างชัดเจนและถูกต้อง",
    chkOutput: "ผลลัพธ์ของแต่ละกระบวนการถูกต้อง",
    chkSystem: "ระบบถูกใช้งานอย่างถูกต้องในทุกขั้นตอนของกระบวนการ",
    chkLeadtime: "ระยะเวลาของแต่ละกระบวนการถูกต้อง",
    note: "หมายเหตุ:",
    modalWarningDesc: 'ผู้รับการประเมินต้องปฏิบัติได้ถูกต้องครบถ้วนทั้ง 5 หัวข้อ จึงจะพิจารณาให้ผลเป็น "ผ่าน"',
    cancelBtn: "ยกเลิก",
    confirmVoteBtn: "ยืนยันการโหวต",
    showChartBtn: "📊 เปิดปุ่มดูกราฟ",
    hideChartBtn: "📊 ปิดปุ่มดูกราฟ",
    muteMusicBtn: "🔊 ปิดระบบเพลง (Mute)",
    unmuteMusicBtn: "🔇 เปิดระบบเพลง",
    chartShownMsg: "เปิดปุ่มดูกราฟให้ทุกคนแล้ว",
    chartHiddenMsg: "ซ่อนปุ่มดูกราฟแล้ว",
    musicMutedMsg: "🔇 ปิดระบบเพลง BGM แล้ว",
    musicUnmutedMsg: "🔊 เปิดระบบเพลง BGM ให้ทุกคนแล้ว",
    fskTitle: "กรรมการพิเศษ (FSK)",
    fskSelectName: "กรุณาเลือกชื่อของท่าน",
    fskLoadingSelect: "-- เลื่อนเพื่อเลือกชื่อ --",
    fskEnterBtn: "เข้าสู่หน้าประเมิน",
    fskSubmitBtn: "ยืนยันการให้คะแนน (FSK)",
  },
  en: {
    appTitle:       "Shopfloor Best Practice Competition",
    setupSubtitle:  "Evaluation System",
    loading:        "Loading...",
    setupHint:      "Please select your name before starting",
    teamLabel:      "Team",
    back:           "Back",
    adminTitle:     "⚙️ System Settings",
    currentStatus:  "Current Status",
    inactive:       "Inactive",
    active:         "Active",
    activateRound:  "🚀 Activate Current Round",
    resetAll:       "🔄 Reset All",
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
    viewChart:      "📈 View Charts",
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
    homeText: "Home",
    confirmJudgeName: "Confirm that you are: ",
    warningNoEdit: "\n\n*Once confirmed, you cannot change your name later.",
    confirmPass: 'Confirm "Pass" Result',
    confirmFail: 'Confirm "Fail" Result',
    modalReview: "Please review the following evaluation criteria:",
    chkProcess: "Work process is correct",
    chkPic: "The responsible person is clearly identified and correct",
    chkOutput: "Results of the steps are correct",
    chkSystem: "The system is used correctly at each step of the process",
    chkLeadtime: "The process duration complies with the standard",
    note: "Note:",
    modalWarningDesc: 'The evaluatee must meet all 5 criteria correctly to be considered as "Pass"',
    cancelBtn: "Cancel",
    confirmVoteBtn: "Confirm Vote",
    showChartBtn: "📊 Show Chart Button",
    hideChartBtn: "📊 Hide Chart Button",
    muteMusicBtn: "🔊 Mute BGM",
    unmuteMusicBtn: "🔇 Unmute BGM",
    chartShownMsg: "Chart button is now visible.",
    chartHiddenMsg: "Chart button is hidden.",
    musicMutedMsg: "🔇 BGM has been muted.",
    musicUnmutedMsg: "🔊 BGM unmuted for everyone.",
    fskTitle: "Special Judge (FSK)",
    fskSelectName: "Please select your name",
    fskLoadingSelect: "-- Scroll to select name --",
    fskEnterBtn: "Enter Evaluation",
    fskSubmitBtn: "Confirm Scores (FSK)",
  }
};

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

async function playVoteSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // --- ส่วนที่ 1: เสียงเบส (Deep Impact) ---
    const bassGain = audioCtx.createGain();
    const bassOsc = audioCtx.createOscillator();
    
    bassGain.connect(audioCtx.destination);
    bassGain.gain.setValueAtTime(0.6, now); // เพิ่มความดังขึ้น
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // ลากเสียงยาวขึ้นนิดนึง

    bassOsc.type = 'triangle'; // ใช้ triangle เพื่อให้เสียงมีความหนา
    bassOsc.frequency.setValueAtTime(80, now); // ความถี่ต่ำ (เสียงเบส)
    bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.5); // เสียงค่อยๆ ต่ำลง (Drop)
    bassOsc.connect(bassGain);

    // --- ส่วนที่ 2: เสียงกระทบ (High Click) ---
    const clickGain = audioCtx.createGain();
    const clickOsc = audioCtx.createOscillator();
    
    clickGain.connect(audioCtx.destination);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    clickOsc.type = 'square'; // ใช้ square เพื่อความคมชัด
    clickOsc.frequency.setValueAtTime(800, now);
    clickOsc.connect(clickGain);

    // เริ่มและหยุดพร้อมกัน
    bassOsc.start(now);
    bassOsc.stop(now + 0.5);
    
    clickOsc.start(now);
    clickOsc.stop(now + 0.1);

  } catch (e) {
    console.error("Audio Error:", e);
  }
}

/* ระบบเสียงเพลงะหว่างรอโหวต (HTML5 Audio) */

// โหลดไฟล์เสียง BGM จาก GitHub
const waitingBgm = new Audio('https://raw.githubusercontent.com/Pepsi1219/Vote-Buttons/main/waiting-bgm.mp3'); 
waitingBgm.loop = true; // เล่นวนลูป
waitingBgm.volume = 0.4; // ความดัง

// ฟังก์ชันสั่งเล่นเสียง
function playWaitingBgm() {
  // 📌 ดึงสถานะการเปิด/ปิดเพลงจากคำสั่ง Admin ในฐานข้อมูล
  // (ถ้าแอดมินยังไม่เคยตั้งค่า ให้ถือว่าเปิดอยู่เป็นค่าเริ่มต้น)
  const isMusicEnabled = sessionData?.musicEnabled !== false;
  
  // ถ้าแอดมินเปิดสวิตช์อยู่ และเพลงยังหยุดอยู่ ถึงจะยอมให้เล่น
  if (isMusicEnabled && waitingBgm.paused) {
    waitingBgm.play().catch(err => console.log("รอการคลิกจากผู้ใช้ก่อนเล่นเสียง", err));
  }
}

// ฟังก์ชันสั่งหยุดเสียง
function stopWaitingBgm() {
  if (!waitingBgm.paused) {
    waitingBgm.pause();
    waitingBgm.currentTime = 0; // กรอเพลงกลับไปวินาทีที่ 0
  }
}

// ฟังก์ชันสลับเปิด/ปิดเสียง
function toggleMusic() {
  isMusicEnabled = !isMusicEnabled; // สลับสถานะ (true -> false -> true)
  
  if (!isMusicEnabled) {
    stopWaitingBgm(); // ถ้าสวิตช์ปิด ให้หยุดเพลงทันที
    if (typeof showToast === 'function') showToast("🔇 ปิดเพลง BGM แล้ว", "info");
  } else {
    // ถ้าสวิตช์เปิด ให้ลองเช็คว่าตอนนี้แอดมินเปิดรอบอยู่ไหม ถ้าเปิดอยู่ให้เพลงดังเลย
    if (sessionData && sessionData.isActive && !myVoteForCurrentSlot) {
       playWaitingBgm();
    }
    if (typeof showToast === 'function') showToast("🔊 เปิดเพลง BGM แล้ว", "info");
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
  // 1. สลับตัวแปรภาษา
  currentLang = currentLang === 'th' ? 'en' : 'th';

  // 2. 🚀 อัปเดตข้อความบนปุ่มเปลี่ยนภาษาทุกปุ่มในแอป
  // ถ้าตอนนี้เป็นภาษาไทย ปุ่มจะโชว์คำว่า 'EN' (เพื่อให้กดเปลี่ยนเป็นอังกฤษ)
  const labelText = currentLang === 'th' ? 'EN' : 'TH';
  const langLabels = document.querySelectorAll('.lang-label-text');
  langLabels.forEach(label => {
    label.textContent = labelText;
  });

  // 3. เรียกฟังก์ชันแปลภาษาหลัก
  applyTranslations();

  // 4. อัพเดต dynamic content ที่ render แล้ว
  if (sessionData) updateJudgeScreen();
  if (sessionData && settings) updateStatusBanner();
  
  // 5. แจ้งเตือน Pop-up ด้านล่าง
  showToast(currentLang === 'th' ? 'เปลี่ยนเป็นภาษาไทย' : 'Switched to English', 'info');
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

      // 🚨 โลจิกใหม่: ดึงทุกคนกลับไปหน้าแรกเมื่อแอดมินกด Save การตั้งค่าใหม่
      if (!isFirstSettingsLoad) {
        // ตรวจสอบว่ามีคนล็อกอินอยู่ (currentJudge ไม่ว่าง) และ หน้าจอที่เปิดอยู่ ไม่ใช่หน้า Admin
        if (typeof currentJudge !== 'undefined' && currentJudge !== null && !isAdminOpen()) {
          
          // 1. ล้างข้อมูลกรรมการในแรมและ LocalStorage
          currentJudge = null;
          localStorage.removeItem('voter_session');
          
          // 2. ดึงกลับหน้าแรก
          showScreen('screen-setup');
          
          // 3. แจ้งเตือนให้กรรมการรู้ตัว (รองรับ 2 ภาษา)
          const lang = (typeof currentLang !== 'undefined') ? currentLang : 'th';
          const msg = lang === 'th' 
            ? '⚠️ แอดมินตั้งค่าระบบใหม่ กรุณาเลือกชื่อเพื่อเข้าสู่ระบบอีกครั้ง' 
            : '⚠️ System settings updated. Please select your name again.';
            
          showToast(msg, 'info');
        }
      }
      
      // เปลี่ยนสถานะเพื่อบอกว่าผ่านการโหลดครั้งแรกมาแล้ว จะได้ไม่ทำงานตอนเพิ่งเปิดแอป
      isFirstSettingsLoad = false;

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
    
    // สำคัญ: เมื่อสถานะเปลี่ยน (เช่น Admin กดข้ามทีม หรือเปิด/ปิดโหวต) ให้ทำงานทันที
    handleSessionChange();
  }, error => {
    console.error("❌ Firestore Session Error:", error);
  });
}

/* CORE LOGIC */
function handleSessionChange() {
  // 1. 🛡️ เช็คชื่อกรรมการ (ถ้าไม่มี ต้องอยู่หน้าแรกเท่านั้น)
  if (!currentJudge) {
    // ป้องกันการรัน showScreen ซ้ำซากถ้าอยู่หน้าแรกอยู่แล้ว
    if (getActiveScreen() !== 'screen-setup') {
      showScreen('screen-setup');
    }
    return; 
  }

  // 2. ถ้าข้อมูลพื้นฐานยังไม่มา ให้รอ (แต่ไม่ต้องดีดกลับหน้าแรกแล้วเพราะมีชื่อแล้ว)
  if (!settings || !sessionData) return;


  // เช็คปุ่มดูกราฟตรงนี้เลย! (ก่อนที่โค้ดจะถูกสั่ง return หนีไป) //
  const btnChart = document.getElementById('btn-go-to-chart');
  if (btnChart) {
    const isChartVisible = sessionData?.showChartButton || false;
    btnChart.style.display = isChartVisible ? 'inline-block' : 'none';
  }

  const isMusicEnabled = sessionData?.musicEnabled !== false;
  if (!isMusicEnabled && typeof stopWaitingBgm === 'function') {
    stopWaitingBgm();
  }

  // 3. ถ้าจบการประเมินแล้ว -> ไปหน้าสรุป
  if (sessionData.isCompleted) {
    if (getActiveScreen() !== 'screen-summary') {
      showScreen('screen-summary');
    }
    return;
  }

  // 4. 🚀 จัดการสลับหน้าจอ (Navigation)
  const activeScreen = getActiveScreen();

  /**
   * แก้ไขจุดนี้: ถ้ากรรมการเลือกชื่อแล้ว (ผ่านข้อ 1 มาได้) 
   * และเขายังค้างอยู่หน้าแรก (screen-setup) 
   * เราควรพาเขาไปหน้าตัดสิน (screen-judge) ทันที! 
   * ไม่ว่า Admin จะเริ่มระบบแล้ว (isActive) หรือยังไม่เริ่มก็ตาม
   */
  if (activeScreen === 'screen-setup') {
    showScreen('screen-judge');
    console.log("✅ Judge ready: Moving to judge screen.");
  }

  // 5. 🔄 อัปเดตข้อมูล UI ตามลำดับ
  
  // อัปเดตหน้าโหวต (ทีม/รอบ/สถานะรอแอดมิน)
  if (typeof updateJudgeScreen === 'function') updateJudgeScreen();
  
  // อัปเดตสถานะแอดมิน (ถ้าเปิดหน้าแอดมินทิ้งไว้)
  if (typeof updateAdminStatus === 'function') updateAdminStatus();
  
  // โหลดคะแนนเดิมที่เคยบันทึกไว้
  if (typeof loadMyVoteForCurrentSlot === 'function') loadMyVoteForCurrentSlot();
  
  // 6. 🎧 เริ่มฟังคะแนนแบบ Real-time
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
    
    // 🎵 สั่งให้ดนตรีบิ้วอารมณ์ดังขึ้น! (ถ้าเพลงยังไม่เล่น)
    if (typeof playWaitingBgm === 'function') playWaitingBgm();
  } 
  else if (!isActive) {
    // ⏳ รอแอดมิน: แสดง Overlay และข้อความรอเปิดรอบ
    if (overlay) overlay.classList.remove('hidden');
    if (overlayMsg) overlayMsg.textContent = t('waitingActive');
    if (btnPass) btnPass.disabled = true;
    if (btnFail) btnFail.disabled = true;
    
    // 🔇 ปิดเพลง (เพราะรอบยังไม่เปิด หรือปิดรอบไปแล้ว)
    if (typeof stopWaitingBgm === 'function') stopWaitingBgm();
  } 
  else {
    // ✅ โหวตไปแล้ว: แสดง Overlay และข้อความรอกรรมการท่านอื่น
    if (overlay) overlay.classList.remove('hidden');
    if (overlayMsg) overlayMsg.textContent = t('waitingOthers');
    if (btnPass) btnPass.disabled = true;
    if (btnFail) btnFail.disabled = true;
    
    // 🔇 ปิดเพลง (เพราะกรรมการโหวตเสร็จแล้ว ภารกิจจบ)
    if (typeof stopWaitingBgm === 'function') stopWaitingBgm();
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
  // 1. ดึงจำนวนกรรมการที่ต้องใช้จาก Settings โดยตรงเพื่อให้เป็นค่าที่นิ่งที่สุด
  const requiredVotes = settings.judges ? settings.judges.length : (judgeCount || 0);
  
  if (requiredVotes === 0) return;

  // นับจำนวนคนโหวตจากข้อมูลจริงใน Firestore Snapshot
  const votedCount = Object.keys(voteData).filter(key => !isNaN(key)).length;

  console.log(`🔍 ตรวจสอบคะแนน [${ri}_${ti}]: มาแล้ว ${votedCount}/${requiredVotes}`);

  // 2. 🔥 [จุดตาย] ถ้ายังไม่ครบ ห้ามไปต่อเด็ดขาด 
  // และห้ามใช้เงื่อนไข >= ให้ใช้ == หรือเช็คอย่างเข้มงวดเพื่อป้องกันการสั่งจบเร็วเกินไป
  if (votedCount < requiredVotes) {
    return; 
  }

  // 3. [สำคัญมาก] เช็คสถานะ isActive 
  // ถ้า isActive เป็น false อยู่แล้ว แปลว่ามีเครื่องอื่นสั่งปิดระบบไปแล้ว ให้หยุดทำงานทันที
  if (!sessionData || !sessionData.isActive) {
    return;
  }

  const slotKey = `${ri}_${ti}`;

  try {
    console.log(`✅ ครบ ${requiredVotes} คนแล้ว! กำลังเตรียมบันทึกผลรอบ ${slotKey}...`);

    // 4. บันทึกประวัติลง completedSessions
    // ใช้ .set แบบปกติ แต่ระบุจำนวน votedCount ที่นับได้จริง
    await db.collection('completedSessions').doc(slotKey).set({ 
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      roundIndex: ri,
      teamIndex: ti,
      totalVotes: votedCount // จะต้องเท่ากับ requiredVotes แน่นอน
    });

    // 5. คำนวณ Slot ถัดไป
    const teamCount  = settings.teams?.length  || 1;
    const roundCount = settings.rounds?.length || 1;

    let nextTi = ti + 1;
    let nextRi = ri;

    if (nextTi >= teamCount) {
      nextTi = 0;
      nextRi = ri + 1;
    }

    const sessionRef = db.collection('config').doc('session');

    // 6. 🚀 อัปเดตสถานะ Session เพื่อเปลี่ยนรอบ
    if (nextRi >= roundCount) {
      // จบการประเมินทั้งหมด
      await sessionRef.update({ 
        isCompleted: true, 
        isActive: false 
      });
      console.log("🏆 การประเมินทั้งหมดเสร็จสิ้น!");
      if (typeof showToast === 'function') showToast(t('allDone'), 'info');
    } else {
      // เปลี่ยนทีม/รอบถัดไป และปิด isActive เพื่อรอ Admin สั่งเริ่มใหม่
      await sessionRef.update({
        currentTeamIndex: nextTi,
        currentRoundIndex: nextRi,
        isActive: false 
      });
      
      const msg = nextTi === 0 ? t('nextRound') : t('nextTeam');
      if (typeof showToast === 'function') showToast(msg, 'info');
      console.log(`➡️ เปลี่ยนเป็นรอบ: ${nextRi} ทีม: ${nextTi}`);
    }

  } catch (error) {
    console.error("❌ Error in checkAllVoted:", error);
  }
}

/* CAST VOTE — กรรมการกดปุ่ม */

let pendingVoteType = null;

/* 1. CAST VOTE — กรรมการกดปุ่ม (เปิด Popup ตรวจสอบก่อน) */
function castVote(choice) {
  // ตรวจสอบสิทธิ์และสถานะการเปิดรอบ
  if (!currentJudge || !sessionData?.isActive) return;
  
  if (myVoteForCurrentSlot) {
    // ป้องกัน Error กรณีตัวแปร t โหลดไม่ทัน
    const msg = (typeof t === 'function') ? t('alreadyVoted') : 'คุณโหวตไปแล้ว';
    if (typeof showToast === 'function') showToast(msg, 'info');
    return;
  }

  // เก็บค่าโหวตไว้ชั่วคราว
  pendingVoteType = choice;

  // เตรียมหน้าตา Popup
  const titleEl = document.getElementById('modal-vote-title');
  const confirmBtn = document.getElementById('btn-confirm-vote');
  
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'th';

  // 🚨 [แก้ไขจุดที่ทำให้โค้ดพัง]: ใช้ typeof เพื่อเช็คว่ามีตัวแปร i18n อยู่จริงไหม
  const hasI18n = (typeof i18n !== 'undefined' && i18n[lang]);

  if (choice === 'pass') {
    const txt = (hasI18n && i18n[lang].confirmPass) 
      ? i18n[lang].confirmPass 
      : 'ยืนยันการให้ผล "ผ่าน"';
    
    if (titleEl) titleEl.innerHTML = `🟢 ${txt}`;
    if (confirmBtn) confirmBtn.style.background = '#15803d';
  } else {
    const txt = (hasI18n && i18n[lang].confirmFail) 
      ? i18n[lang].confirmFail 
      : 'ยืนยันการให้ผล "ไม่ผ่าน"';
      
    if (titleEl) titleEl.innerHTML = `🔴 ${txt}`;
    if (confirmBtn) confirmBtn.style.background = '#dc2626';
  }

  // เปิด Popup
  const modal = document.getElementById('vote-confirm-modal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    console.error("❌ หา HTML id 'vote-confirm-modal' ไม่เจอครับ");
  }
}

/* 2. ปิด Popup เมื่อกดยกเลิก */
function closeVoteModal() {
  const modal = document.getElementById('vote-confirm-modal');
  if (modal) modal.style.display = 'none';
  pendingVoteType = null; // เคลียร์ค่าที่เก็บไว้
}

/* 3. ยืนยันและส่งคะแนนขึ้น Firebase */
async function executeVote() {
  // เช็คความชัวร์อีกรอบก่อนส่ง
  if (!currentJudge || !sessionData?.isActive || !pendingVoteType) return;

  const choice = pendingVoteType;
  const { currentRoundIndex: ri, currentTeamIndex: ti } = sessionData;
  const slotKey = `${ri}_${ti}`;
  const judgeIndex = currentJudge.index.toString();
  const teamName = settings.teams?.[ti] || '—';

  // ปิด Popup
  closeVoteModal();

  try {
    // บันทึกคะแนนลง Firestore
    await db.collection('votes').doc(slotKey).set({
      [judgeIndex]: choice,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // บันทึกในเครื่อง
    myVoteForCurrentSlot = choice;

    // แสดงข้อความแจ้งเตือน (ป้องกัน Error กรณีตัวแปร t โหลดไม่ทัน)
    let msg = '';
    if (typeof t === 'function') {
      msg = choice === 'pass' ? t('youVotedPass', teamName) : t('youVotedFail', teamName);
    } else {
      msg = choice === 'pass' ? `บันทึกผล "ผ่าน" สำเร็จ` : `บันทึกผล "ไม่ผ่าน" สำเร็จ`;
    }
    
    if (typeof showToast === 'function') showToast(msg, choice === 'pass' ? 'success' : 'info');

    // อัปเดตหน้าจอ
    if (typeof updateJudgeScreen === 'function') updateJudgeScreen();

    console.log(`✅ Vote saved for ${currentJudge.name} on slot ${slotKey}`);

  } catch (error) {
    console.error("❌ Firestore Vote Error:", error);
    if (typeof showToast === 'function') showToast("เกิดข้อผิดพลาด: " + error.message, "fail");
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

/* แสดงข้อความเมื่อยังไม่มีการตั้งค่าข้อมูล */
function renderJudgeListEmpty() {
  const listEl = document.getElementById('judge-list');
  if (listEl) {
    listEl.innerHTML = `
      <div class="no-data-state" style="text-align: center;">
        <div class="loading-pulse">${t('noSettings')}</div>
        <p style="font-size: 0.8rem; opacity: 0.2; margin-top: 75px;">
          (Admin: Please configure judges in settings)
        </p>
      </div>
    `;
  }
}

/* SELECT JUDGE — เลือกกรรมการ */
function selectJudge(index, name) {
  if (index === undefined || !name) return;

  // 1. ตรวจสอบภาษาปัจจุบัน (ตรวจสอบจากตัวแปรที่คุณใช้เก็บ เช่น currentLang หรือดึงจาก <html>)
  const lang = (typeof currentLang !== 'undefined') ? currentLang : (document.documentElement.lang || 'th');

  // 2. ดึงข้อความจาก i18n โดยระบุ Key ที่พงศธรต้องไปเพิ่มในตัวแปร i18n นะครับ
  // ถ้าหา Key ไม่เจอ จะใช้ข้อความภาษาไทยเป็นค่าเริ่มต้น (Fallback)
  const msgPrefix = (i18n[lang] && i18n[lang].confirmJudgeName) 
                    ? i18n[lang].confirmJudgeName 
                    : "ยืนยันว่าคุณคือ: ";
                    
  const msgWarning = (i18n[lang] && i18n[lang].warningNoEdit) 
                     ? i18n[lang].warningNoEdit 
                     : "\n\n*หากกดยืนยันแล้ว คุณจะไม่สามารถแก้ไขชื่อได้ภายหลัง";

  const fullMsg = `${msgPrefix} "${name}"? ${msgWarning}`;

  // 3. แสดงหน้าต่างยืนยันของ Browser
  if (!window.confirm(fullMsg)) {
    return; // ถ้ากดยกเลิก ไม่ต้องทำอะไรต่อ
  }

  // --- ส่วนทำงานเดิมของพงศธร ---
  currentJudge = { index: parseInt(index), name: name };
  localStorage.setItem('voter_session', JSON.stringify(currentJudge));

  if (typeof showToast === 'function') {
    showToast(`สวัสดีคุณ ${name}`, 'info');
  }

  handleSessionChange();
}

/*ฟังก์ชันสำหรับดึงข้อมูลเดิมกลับมา (เรียกใช้ตอน init)*/
function restoreSession() {
  const saved = localStorage.getItem('voter_session');
  if (saved) {
    try {
      currentJudge = JSON.parse(saved);
      console.log("✅ Restored session for:", currentJudge.name);
      return true;
    } catch (e) {
      console.error("❌ Data error:", e);
      localStorage.removeItem('voter_session'); // ล้างทิ้งถ้าข้อมูลพัง
      return false;
    }
  }
  return false;
}

/* ADMIN — เปิด/ปิด Admin Panel */
function openAdmin() {
  // 🔓 ปิดการตรวจสอบรหัสผ่านชั่วคราว
  /*
  // 1. ถามรหัสผ่านก่อนเข้าถึงหน้า Admin
  const password = prompt("กรุณากรอกรหัสผ่านผู้ดูแลระบบ (Admin Password):");

  // 2. ตรวจสอบรหัสผ่าน
  if (password === "Admin1219") {
  */
    
    // ✅ ถ้ารหัสถูกต้อง ให้รัน Logic เดิมทั้งหมด
    showScreen('screen-admin');
    
    if (typeof renderAdminInputs === 'function') {
      renderAdminInputs();
    }
    
    if (typeof updateAdminStatus === 'function') {
      updateAdminStatus();
    }
    
    // เลื่อนหน้าจอขึ้นบนสุดเพื่อให้เห็นเมนูตั้งค่าชัดเจน
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log("🔐 Admin Access Granted");
  /*
  } 
  else if (password !== null) {
    // ❌ ถ้ารหัสผิด (และไม่ได้กด Cancel) ให้แจ้งเตือน
    alert("❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
  }
  */
}

/* ควบคุมการแสดงปุ่มดูกราฟ */
async function toggleChartVisibility() {
  if (!sessionData) return;
  
  // เช็คสถานะปัจจุบัน (ถ้าไม่มีค่า ให้ถือว่าปิดอยู่ false)
  const isCurrentlyVisible = sessionData.showChartButton || false;
  
  try {
    // สลับค่า (ถ้าปิดอยู่ให้เปิด ถ้าเปิดอยู่ให้ปิด)
    await db.collection('config').doc('session').set({
      showChartButton: !isCurrentlyVisible
    }, { merge: true });
    
    // 📌 ใช้คำสั่ง t() ดึงคำแปลมาใช้แสดงผล Toast
    const msg = !isCurrentlyVisible ? t('chartShownMsg') : t('chartHiddenMsg');
    showToast(msg, "info");
    
  } catch (error) {
    console.error("Error toggling chart:", error);
    showToast("เกิดข้อผิดพลาดในการเปลี่ยนตั้งค่า", "fail");
  }
}

/* ควบคุมการเปิด/ปิดเสียง BGM  */
async function toggleGlobalMusic() {
  if (!sessionData) return;
  
  // เช็คสถานะปัจจุบัน (ถ้าแอดมินยังไม่เคยตั้งค่า ให้ถือว่า "เปิดอยู่" เป็นค่าเริ่มต้น)
  const isMusicEnabled = sessionData.musicEnabled !== false; 
  
  try {
    // สลับค่าแล้วส่งขึ้น Firebase
    await db.collection('config').doc('session').set({
      musicEnabled: !isMusicEnabled
    }, { merge: true });
    
    // 📌 ใช้คำสั่ง t() ดึงคำแปลมาใช้แสดงผล Toast
    const msg = !isMusicEnabled ? t('musicUnmutedMsg') : t('musicMutedMsg');
    showToast(msg, "info");
    
  } catch (error) {
    console.error("Error toggling music:", error);
    showToast("เกิดข้อผิดพลาดในการเปลี่ยนตั้งค่า", "fail");
  }
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

/* ดึงค่าจาก Input ทั้งหมดออกมาเป็น Array เพื่อเตรียมบันทึกลง Firestore */
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
    showToast('⚠️ กรุณากรอกข้อมูลให้ครบทุกหมวด', 'info');
    return;
  }

  try {
    // 1. บันทึก Settings ลง Firestore
    await db.collection('config').doc('settings').set({ 
      judges, 
      teams, 
      rounds,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // 2. 💥 สำคัญ: รีเซ็ต Session ให้กลับไปจุดเริ่มต้นด้วย
    // เพื่อดึงสถานะกลับมาเป็น รอบที่ 1, ทีมที่ 1 และปิดการโหวตอยู่
    await db.collection('config').doc('session').set({
      currentRoundIndex: 0,
      currentTeamIndex: 0,
      isActive: false,
      isCompleted: false,
      forceResetAt: firebase.firestore.FieldValue.serverTimestamp() // สร้างจุดสังเกต
    });
    
    // พยายามดึงค่าใหม่เข้าตัวแปร local ทันทีหลังบันทึก
    settings = { judges, teams, rounds }; 
    
    // แสดงข้อความ (ถ้ามี i18n ก็ใช้ t('settingsSaved') ได้เลย)
    const msg = (typeof t === 'function') ? t('settingsSaved') : 'บันทึกการตั้งค่าและรีเซ็ตระบบเรียบร้อย';
    showToast(msg, 'info');
    console.log("✅ Settings & Session saved successfully");
    
  } catch (error) {
    console.error("❌ Save Settings Error:", error);
    showToast("ไม่สามารถบันทึกได้: " + error.message, "fail");
  }
}

async function activateRound() {
  console.log("Checking activation requirements...");

  // 1. เช็คแค่ฐานข้อมูล ถ้ามี db คือไปต่อได้
  if (!db) {
    showToast("❌ เชื่อมต่อฐานข้อมูลไม่ได้", "fail");
    return;
  }

  // 2. เช็คกรณีจบการแข่งขัน (ใช้ Optional Chaining ?. ป้องกัน Error)
  if (sessionData?.isCompleted) {
    showToast("⚠️ จบการประเมินแล้ว กรุณา Reset ก่อน", "info");
    return;
  }

  try {
    // 3. ใช้ .set แบบ merge เพื่อป้องกัน Error กรณีไม่มีเอกสาร session อยู่ก่อน
    await db.collection('config').doc('session').set({ 
      isActive: true,
      activatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    showToast(t('activated'), 'info');
    console.log("🚀 Round Activated!");

  } catch (error) {
    console.error("❌ Activate Round Error:", error);
    showToast("ไม่สามารถเปิดรอบได้: " + error.message, "fail");
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

  // ปุ่มเปิด/ปิดกราฟ
  const btnToggleChart = document.getElementById('btn-toggle-chart');
  if (btnToggleChart) {
    const isChartVisible = sessionData?.showChartButton || false;
    // ใช้คำสั่ง t() ดึงภาษาที่เลือกอยู่มาแสดง
    btnToggleChart.textContent = isChartVisible ? t('hideChartBtn') : t('showChartBtn');
    btnToggleChart.style.background = isChartVisible ? '#10b981' : ''; 
    btnToggleChart.style.color = isChartVisible ? '#fff' : '';
  }

  // ปุ่มเปิด/ปิดเสียงเพลง
  const btnToggleMusic = document.getElementById('btn-toggle-music');
  if (btnToggleMusic) {
    const isMusicEnabled = sessionData?.musicEnabled !== false; 
    // ใช้คำสั่ง t() ดึงภาษาที่เลือกอยู่มาแสดง
    btnToggleMusic.innerHTML = isMusicEnabled ? t('muteMusicBtn') : t('unmuteMusicBtn');
    btnToggleMusic.style.background = isMusicEnabled ? '#10b981' : ''; 
    btnToggleMusic.style.color = isMusicEnabled ? '#fff' : '';
  }
}

/* RESET ALL  */
async function resetAll() {
  if (!confirm("⚠️ ยืนยันการล้างข้อมูล config/session และ config/settings รวมทั้งคะแนน FSK?")) return;

  try {
    const batch = db.batch();

    // 1. ล้างข้อมูลใน /config/session (เขียนทับด้วยค่าว่าง หรือค่าเริ่มต้นใหม่)
    const sessionRef = db.collection('config').doc('session');
    batch.set(sessionRef, {
      currentRoundIndex: 0,
      currentTeamIndex: 0,
      isActive: false,
      isCompleted: false,
      resetAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 2. ล้างข้อมูลใน /config/settings (เขียนทับด้วยค่าว่างไปเลย)
    const settingsRef = db.collection('config').doc('settings');
    // เราจะใช้ .set แบบไม่ merge เพื่อให้ข้อมูลเดิม (judges, teams, rounds) หายไปทั้งหมด
    batch.set(settingsRef, {
      clearedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 3. กวาดล้าง Root Collection อื่นๆ (เผื่อมีค้าง)
    const votesSnap = await db.collection('votes').get();
    votesSnap.forEach(doc => batch.delete(doc.ref));

    const compSnap = await db.collection('completedSessions').get();
    compSnap.forEach(doc => batch.delete(doc.ref));

    // 🚀 4. [เพิ่มใหม่] กวาดล้างคะแนนของกรรมการพิเศษ FSK
    const fskSnap = await db.collection('fskVotes').get();
    fskSnap.forEach(doc => batch.delete(doc.ref));

    // ยืนยันการทำงานทั้งหมดพร้อมกัน
    await batch.commit();
    
    showToast("🧹 ล้างข้อมูล config และคะแนนทั้งหมดเรียบร้อยแล้ว", "info");
    
    // บังคับรีโหลดเพื่อให้แอปกลับไปหน้า Setup ใหม่
    setTimeout(() => location.reload(), 1000);

  } catch (error) {
    console.error("❌ Reset Error:", error);
    showToast("Error: " + error.message, "fail");
  }
}

/* SUMMARY — หน้าสรุปผล (Real-time) */

let summaryAllVotes = {};
let summaryFskVotesList = [];
let summaryAudienceVotesData = {};
let summaryListeners = [];

function buildSummary() {
  if (!settings || !currentJudge) return;

  // 1. แสดงชื่อกรรมการที่หน้าสรุป
  const judgeNameEl = document.getElementById('summary-judge-name');
  if (judgeNameEl) judgeNameEl.textContent = currentJudge.name;

  // 2. เคลียร์ Listener เก่าทิ้งก่อน ป้องกันการโหลดกราฟเบิ้ลเวลาเข้า-ออกหน้านี้หลายครั้ง
  summaryListeners.forEach(unsub => unsub());
  summaryListeners = [];

  try {
    // 3. ฟังข้อมูล votes ทั้งหมดแบบ Real-time
    const unsubVotes = db.collection('votes').onSnapshot(snap => {
      summaryAllVotes = {};
      snap.forEach(doc => {
        summaryAllVotes[doc.id] = doc.data();
      });
      refreshSummaryUI(); // เรียกอัปเดตหน้าจอทันทีที่มีคนโหวต
    });
    summaryListeners.push(unsubVotes);

    // 4. 🚀 ฟังข้อมูล fskVotes แบบ Real-time
    const unsubFsk = db.collection('fskVotes').onSnapshot(snap => {
      summaryFskVotesList = [];
      snap.forEach(doc => {
        summaryFskVotesList.push(doc.data());
      });
      refreshSummaryUI();
    });
    summaryListeners.push(unsubFsk);

    // 5. 🚀 ฟังข้อมูล Audience Votes แบบ Real-time
    const unsubAudience = db.collection('audience_votes').onSnapshot(snap => {
      summaryAudienceVotesData = {};
      snap.forEach(doc => {
        // ดึงยอดโหวต count มาเก็บไว้ โดยใช้ doc.id (เช่น "0", "1") เป็น key
        summaryAudienceVotesData[doc.id] = doc.data().count || 0;
      });
      refreshSummaryUI();
    });
    summaryListeners.push(unsubAudience);

  } catch (error) {
    console.error("❌ Error building summary:", error);
    if (typeof showToast === 'function') showToast("ไม่สามารถโหลดสรุปผลได้", "fail");
  }
}

// 🚀 ฟังก์ชันตัวกลางสำหรับสั่งอัปเดต UI ทั้งหมด (ต้องมีไว้เพื่อรับข้อมูลจาก onSnapshot)
function refreshSummaryUI() {
  // สร้างตารางผลโหวตเฉพาะของเราเอง
  if (typeof buildMyVotesTable === 'function') buildMyVotesTable(summaryAllVotes);
  
  // สร้างกราฟสรุปผลรวม (ส่ง FSK เข้าไปแอบบวกด้วย)
  if (typeof buildCharts === 'function') buildCharts(summaryAllVotes, summaryFskVotesList);

  // สร้างตารางผู้ชนะรายรอบ (ส่ง FSK เข้าไปแอบบวกด้วย)
  if (typeof renderRoundWinners === 'function') renderRoundWinners(summaryAllVotes, summaryFskVotesList, summaryAudienceVotesData);

  // เรียกฟังก์ชันวาดกราฟ Audience โชว์ลงในหน้าจอ
  if (typeof renderAudienceSummary === 'function') renderAudienceSummary(summaryAudienceVotesData);
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
      <div class="vote-row-team">Team: ${teamName}</div>
      <div class="vote-row-rounds">${roundBadges}</div>
    `;
    container.appendChild(row);
  });
}

// 🚀 ฟังก์ชันช่วยสร้างสีแบบสุ่มหรือกำหนดชุดสี (Palettes)
function getTeamColor(index, isBorder = false) {
  const colors = [
    { bg: 'rgba(54, 162, 235, 0.7)',  border: 'rgba(54, 162, 235, 1)' },   // Blue
    { bg: 'rgba(75, 192, 192, 0.7)',  border: 'rgba(75, 192, 192, 1)' },   // Teal
    { bg: 'rgba(255, 159, 64, 0.7)',  border: 'rgba(255, 159, 64, 1)' },   // Orange
    { bg: 'rgba(255, 99, 132, 0.7)',  border: 'rgba(255, 99, 132, 1)' },   // Red
    { bg: 'rgba(153, 102, 255, 0.7)', border: 'rgba(153, 102, 255, 1)' },  // Purple
    { bg: 'rgba(255, 206, 86, 0.7)',  border: 'rgba(255, 206, 86, 1)' }    // Yellow
  ];

  // ถ้าจำนวนทีมเกินจำนวนสีที่มี ให้วนกลับมาใช้สีแรก (Using Modulo)
  const colorIndex = index % colors.length;
  const selectedColor = colors[colorIndex];

  return isBorder ? selectedColor.border : selectedColor.bg;
}

function buildCharts(allVotes, fskVotesList = []) {
  const teams  = settings.teams  || [];
  const rounds = settings.rounds || [];

  // 🔥 จุดหลอมรวมคะแนน: Pass ปกติ + FSK
  const passData = teams.map((_, ti) => {
    let p = 0; 
    rounds.forEach((_, ri) => {
      const slot = allVotes[`${ri}_${ti}`] || {};
      Object.values(slot).forEach(v => { if (v === 'pass') p++; });
      
      const fskSlotId = `r${ri}_t${ti}`;
      fskVotesList.forEach(fskDoc => {
        if (fskDoc.scores && fskDoc.scores[fskSlotId]) { p += fskDoc.scores[fskSlotId]; }
      });
    });
    return p; 
  });

  // 🚀 สร้าง Array ของสีพื้นหลังและสีขอบ สำหรับแต่ละทีม
  const backgroundColors = teams.map((_, index) => typeof getTeamColor === 'function' ? getTeamColor(index) : 'rgba(54, 162, 235, 0.7)');
  const borderColors = teams.map((_, index) => typeof getTeamColor === 'function' ? getTeamColor(index, true) : 'rgba(54, 162, 235, 1)');

  // (failData, totalPass, totalFail สำหรับ Pie Chart)
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

  // --- การวาด Bar Chart (ฉบับ Real-time Smooth Update) ---
  const barCanvas = document.getElementById('bar-chart');
  if (barCanvas) { 
    if (barChartInst) {
      // ✅ ถ้ามีกราฟอยู่แล้ว ให้อัปเดตแค่ข้อมูล (กราฟจะขยับขึ้นลงเนียนๆ ไม่กระพริบ)
      barChartInst.data.labels = teams;
      barChartInst.data.datasets[0].data = passData;
      barChartInst.data.datasets[0].backgroundColor = backgroundColors;
      barChartInst.data.datasets[0].borderColor = borderColors;
      barChartInst.update(); // สั่งให้อัปเดต UI
    } else {
      // ✅ สร้างกราฟใหม่เฉพาะตอนเปิดหน้าจอครั้งแรก
      const barCtx = barCanvas.getContext('2d');
      barChartInst = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: teams,
          datasets: [{
            label: 'คะแนนรวม (Points)', 
            data: passData, 
            backgroundColor: backgroundColors, 
            borderColor: borderColors,
            borderWidth: 2,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false } 
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
          }
        }
      });
    }
  }

  // --- การวาด Pie Chart (ฉบับ Real-time Smooth Update) ---
  const pieCanvas = document.getElementById('pie-chart');
  if (pieCanvas) {
    if (pieChartInst) {
      // ✅ ถ้ามีกราฟอยู่แล้ว ให้อัปเดตแค่ข้อมูล
      pieChartInst.data.datasets[0].data = [totalPass, totalFail];
      pieChartInst.update();
    } else {
      // ✅ สร้างกราฟใหม่ครั้งแรก
      const pieCtx = pieCanvas.getContext('2d');
      pieChartInst = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: [(typeof t === 'function' ? t('pass') : 'ผ่าน'), (typeof t === 'function' ? t('fail') : 'ไม่ผ่าน')],
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
              labels: { color: '#94a3b8', font: { family: "'Noto Sans Thai', sans-serif" }, padding: 16 },
              position: 'bottom'
            }
          }
        }
      });
    }
  }
}

/* SWIPE — ปัดหน้าจอในหน้า Summary */
let swipeSummaryPage = 1; // 1 = ตาราง My Votes, 2 = กราฟสรุปผลรวม
let touchStartX = 0;

// ฟังก์ชันนี้รับค่า 3 ตัวแล้วนะครับ (allVotes, fskVotesList, audienceVotesData)
async function renderRoundWinners(allVotes, fskVotesList = [], audienceVotesData = {}) {
  const container = document.getElementById('winners-list');
  const grandContainer = document.getElementById('grand-champion-container');
  if (!container || !grandContainer || !settings) return;

  // เคลียร์พื้นที่ก่อนวาดใหม่
  container.innerHTML = ''; 
  grandContainer.innerHTML = '';

  // ตัวแปรเก็บคะแนนรวมฝั่งกรรมการ (เผื่ออนาคตอยากเอาไปใช้ต่อ)
  const totalScores = {};
  settings.teams.forEach(team => totalScores[team] = 0);

  // ส่วนที่ 1: วาดผู้ชนะรายรอบ (กรรมการ + FSK) 
  settings.rounds.forEach((roundName, ri) => {
    let topScore = -1;
    let winners = [];

    settings.teams.forEach((teamName, ti) => {
      const slotKey = `${ri}_${ti}`;
      const votes = allVotes[slotKey] || {};
      
      // 1. นับคะแนนปกติจากกรรมการ (Pass = 1)
      let points = Object.values(votes).filter(v => v === 'pass').length;

      // 2. หลอมรวมคะแนน FSK ในรอบนี้
      const fskSlotId = `r${ri}_t${ti}`;
      fskVotesList.forEach(fskDoc => {
        if (fskDoc.scores && fskDoc.scores[fskSlotId]) {
          points += fskDoc.scores[fskSlotId];
        }
      });

      // สะสมคะแนนรวมให้แต่ละทีม
      totalScores[teamName] += points;

      // เช็คหาทีมที่คะแนนสูงสุดในรอบนั้นๆ
      if (points > topScore) {
        topScore = points;
        winners = [teamName];
      } else if (points === topScore && topScore > 0) {
        winners.push(teamName);
      }
    });

    // วาดกล่องผู้ชนะของรอบนั้น <div class="winner-score">${topScore > 0 ? topScore : 0} Pts</div> ซ๋อนป้ายคะแนนไว้
    const row = document.createElement('div');
    row.className = 'winner-row';
    const winnerDisplay = (topScore > 0) ? `🥇 ${winners.join(' | ')}` : '-';
    row.innerHTML = `
      <div class="winner-info">
        <small>${ri + 1}. ${roundName.toUpperCase()}</small>
        <div class="winner-name">${winnerDisplay}</div>
      </div>
      
    `;
    container.appendChild(row);
  });

  // ส่วนที่ 2: รางวัล Presentation & Creative (จาก Audience Vote) 
  let maxAudienceVotes = -1;
  let popularChampions = [];

  // วนลูปเช็คคะแนนโหวตทางบ้านของแต่ละทีม
  settings.teams.forEach((teamName, index) => {
    // ดึงคะแนนจาก audienceVotesData โดยใช้ index ของทีม (เช่น "0", "1")
    const votes = audienceVotesData[index.toString()] || 0;

    if (votes > maxAudienceVotes) {
      maxAudienceVotes = votes;
      popularChampions = [teamName];
    } else if (votes === maxAudienceVotes && maxAudienceVotes > 0) {
      // กรณีมีทีมได้โหวตสูงสุดเท่ากัน
      popularChampions.push(teamName);
    }
  });

  // ถ้ายอดโหวตสูงสุดมากกว่า 0 ให้สร้างการ์ดโชว์แชมป์มหาชน
  if (maxAudienceVotes > 0) {
    const grandCard = document.createElement('div');
    grandCard.className = 'grand-champion-card';
    grandCard.innerHTML = `
      <div class="grand-header" >
        Presentation & Creative
      </div>
      <div class="grand-content">
        <div class="grand-names">${popularChampions.join(' & ')}</div>
        <div class="grand-score">Total: ${maxAudienceVotes.toLocaleString()} Votes</div>
      </div>
    `;
    grandContainer.appendChild(grandCard);
  }
}

// ประกาศตัวแปรเก็บกราฟ Audience ไว้ด้านบน เพื่อให้ลบกราฟเก่าทิ้งได้เวลารีเฟรช
let audienceChartInst = null;

function renderAudienceSummary(audienceVotesData) {
  const container = document.getElementById('audience-summary-container');
  if (!container || !settings || !settings.teams) return;

  const teams = settings.teams;
  let totalVotes = 0;
  
  // เตรียมข้อมูลคะแนนโหวต
  const data = teams.map((_, i) => {
    const count = audienceVotesData[i.toString()] || 0;
    totalVotes += count;
    return count;
  });

  // 1. สร้างโครงสร้าง HTML ให้เป๊ะตาม CSS ที่พงศธรต้องการ
  container.innerHTML = `
    <div class="live-score-section">
      <div class="live-score-header">
        <span class="live-dot"></span>
        <span data-i18n="liveScore">AUDIENCE VOTE (เรียลไทม์)</span>
        <span id="total-votes-display" class="total-votes">${totalVotes.toLocaleString()} โหวต</span>
      </div>
      <div class="chart-container">
        <canvas id="audience-bar-chart"></canvas>
      </div>
    </div>
  `;

  // 2. ใช้ Chart.js วาดกราฟลงใน Canvas
  const ctx = document.getElementById('audience-bar-chart').getContext('2d');
  
  // ถ้ามีกราฟเก่าอยู่ให้ทำลายทิ้งก่อน ป้องกันกราฟซ้อนกัน
  if (audienceChartInst) audienceChartInst.destroy();

  // ดึงชุดสีที่เราสร้างไว้ (ฟังก์ชัน getTeamColor ที่ทำไว้ตอนทำกราฟกรรมการ)
  // ถ้าไม่มีฟังก์ชันนี้ สามารถเปลี่ยนเป็น Array สีธรรมดา เช่น ['#3b82f6', '#10b981', ...] ได้ครับ
  const bgColors = teams.map((_, i) => typeof getTeamColor === 'function' ? getTeamColor(i) : 'rgba(54, 162, 235, 0.7)');
  const borderColors = teams.map((_, i) => typeof getTeamColor === 'function' ? getTeamColor(i, true) : 'rgba(54, 162, 235, 1)');

  audienceChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: teams,
      datasets: [{
        label: 'โหวตจากผู้ชม',
        data: data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false } // ปิดป้ายชื่อกราฟให้ดูคลีนๆ
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, // ซ่อนเส้นตารางแนวตั้งให้เหมือนต้นฉบับ
        y: { 
          ticks: { color: '#94a3b8', stepSize: 1 }, 
          grid: { color: 'rgba(255,255,255,0.05)' }, 
          beginAtZero: true 
        }
      }
    }
  });
}

/* ฟังก์ชันเปลี่ยนหน้าสรุปผล */
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





/* GO HOME */
function goHome() {
  const confirmMsg = currentLang === 'th' ? 
    "คุณต้องการออกจากหน้านี้เพื่อเลือกชื่อกรรมการใหม่ใช่หรือไม่?" : 
    "Are you sure you want to go back to the setup screen?";

  if (confirm(confirmMsg)) {
    currentJudge = null;
    localStorage.removeItem('voter_session'); 
    showScreen('screen-setup');
    
    // 3. แจ้งเตือนเล็กน้อย
    showToast(currentLang === 'th' ? "กลับสู่หน้าหลัก" : "Back to Home", "info");
    
    // 4. สั่งให้วาดรายชื่อกรรมการรอไว้เลย
    if (typeof renderJudgeList === 'function') renderJudgeList();
  }
}

window.goHome = goHome;


// Chanhe mode 
function toggleTheme() {
  const body = document.body;
  
  // 1. หาไอคอนทั้งหมดที่มี class="theme-icon" (จะได้มาทั้งหน้าแรกและหน้าโหวต)
  const icons = document.querySelectorAll('.theme-icon');
  let newIconText = '';

  // 2. ตรวจสอบและสลับโหมด
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    newIconText = '🌙';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.add('light-mode');
    newIconText = '☀️';
    localStorage.setItem('theme', 'light');
  }

  // 3. วนลูปสั่งให้ "ทุกไอคอน" เล่น Animation และเปลี่ยนรูป
  icons.forEach(icon => {
    icon.classList.remove('rotate-icon');
    void icon.offsetWidth; // Trigger reflow เพื่อให้รัน animation ซ้ำได้
    icon.classList.add('rotate-icon');
    icon.textContent = newIconText;
  });
}

// เช็คธีมตอนโหลดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  // หาไอคอนทั้งหมดเช่นกัน
  const icons = document.querySelectorAll('.theme-icon');
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    // เปลี่ยนรูปทุกไอคอนเป็นพระอาทิตย์ตั้งแต่เปิดแอป
    icons.forEach(icon => {
      icon.textContent = '☀️';
    });
  }
});


// ฟังก์ชันตรวจสอบรหัสผ่านก่อนเข้าหน้า FSK
function checkFskPassword() {
  // สร้างกล่องเด้งขึ้นมาให้กรอกรหัสผ่าน
  const password = prompt("🔒 กรุณากรอกรหัสผ่านสำหรับกรรมการพิเศษ (FSK):");

  // ตรวจสอบรหัสผ่าน
  if (password === "FSK2026") {
    // ถ้ารหัสถูก ให้เปิดหน้า FSK ได้เลย
    openFskScreen();
  } else if (password === null) {
    // ถ้ากดยกเลิก (Cancel) ก็ไม่ต้องทำอะไร ปล่อยผ่านไป
    return;
  } else {
    // ถ้ากรอกรหัสผิด แจ้งเตือนแล้วเด้งออก
    alert("❌ รหัสผ่านไม่ถูกต้องครับ ไม่สามารถเข้าสู่ระบบ FSK ได้");
  }
}

// ฟังก์ชันเปิดหน้า FSK
let currentFskJudgeName = "";

// รายชื่อกรรมการ FSK 
const fskJudgeList = ["Jettana Wattanarongkup",
                      "Katekan Tongthong", 
                      "Jutatip Kamklan",
                      "Worada Sanerjai",
                      "Natthasasi Chotichanawong",
                      "Pongsathon Sukjarernjit",
                     ];

// 1. ฟังก์ชันเปิดหน้า FSK
function openFskScreen() {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById('screen-fsk').classList.add('active');
  
  // รีเซ็ตหน้าจอ ให้โชว์หน้าเลือกชื่อ และซ่อนหน้าโหวต
  document.getElementById('fsk-login-area').style.display = 'block';
  document.getElementById('fsk-content-area').style.display = 'none';
  
  // สร้าง Dropdown รายชื่อกรรมการ
  const select = document.getElementById('fsk-judge-select');
  select.innerHTML = `<option value="">${t('fskLoadingSelect')}</option>`;
  
  // ดึงจาก settings.fskJudges ได้ ถ้ามีการตั้งค่าไว้ในระบบ
  const judges = (settings && settings.fskJudges) ? settings.fskJudges : fskJudgeList;
  judges.forEach(name => {
    select.innerHTML += `<option value="${name}">${name}</option>`;
  });
}

// 2. ฟังก์ชันตรวจสอบสิทธิ์เมื่อกด "เข้าสู่หน้าประเมิน"
async function startFskEvaluation() {
  const selectEl = document.getElementById('fsk-judge-select');
  const selectedName = selectEl.value;

  if (!selectedName) {
    alert("กรุณาเลือกชื่อกรรมการก่อนครับ");
    return;
  }

  // เปลี่ยนข้อความปุ่มเพื่อบอกว่ากำลังโหลด
  const btn = document.querySelector('#fsk-login-area .fsk-submit-btn');
  const oldText = btn.textContent;
  btn.textContent = "กำลังตรวจสอบข้อมูล...";
  btn.disabled = true;

  try {
    // 🚀 เปลี่ยนมาใช้คำสั่งแบบดั้งเดิม ให้ตรงกับโปรเจกต์ของคุณ
    const fskDocRef = db.collection('fskVotes').doc(selectedName);
    const fskDocSnap = await fskDocRef.get();

    // เช็คว่าเคยโหวตไปแล้วหรือยัง (สังเกตว่า exists ไม่มีวงเล็บครับ)
    if (fskDocSnap.exists) {
      alert(`คุณ ${selectedName} ได้ทำการประเมินและส่งคะแนนไปเรียบร้อยแล้ว ไม่สามารถให้คะแนนซ้ำได้ครับ!`);
      btn.textContent = oldText;
      btn.disabled = false;
      return; // เตะเบรก ไม่ให้เข้าหน้า 1-5
    }

    // --- ผ่านด่านตรวจสอบ ---
    currentFskJudgeName = selectedName; // บันทึกชื่อไว้ใช้ตอนส่งคะแนน

    // ซ่อนหน้า Login และโชว์หน้าให้คะแนน
    document.getElementById('fsk-login-area').style.display = 'none';
    document.getElementById('fsk-content-area').style.display = 'block';
    
    // เรียกฟังก์ชันสร้างปุ่ม 1-5
    loadFskData(); 

  } catch (error) {
    console.error("Error checking FSK judge:", error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูลครับ กรุณาลองใหม่");
  } finally {
    // คืนค่าปุ่มกลับมาเหมือนเดิม
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

// ฟังก์ชันปิดหน้า FSK (กลับไปหน้า Setup)
function closeFskScreen() {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById('screen-setup').classList.add('active');
}

// 1. ฟังก์ชันดึงข้อมูลมาสร้างหน้าจอ (เรียกใช้ตอนกดเปิดหน้า FSK)
let fskDraftScores = {};

function loadFskData() {
  const container = document.getElementById('fsk-content-area');
  
  // 1. เช็คว่ามีข้อมูล settings หรือยัง
  if (!settings || !settings.rounds || !settings.teams) {
    container.innerHTML = '<div class="setup-hint" style="text-align:center; padding:20px;">กำลังรอข้อมูลจากระบบ หรือยังไม่มีการตั้งค่า...</div>';
    return;
  }

  fskDraftScores = {}; // รีเซ็ตคะแนนทุกครั้งที่เปิดหน้า
  let html = '';

  // 2. ลูปสร้างกล่องตามจำนวน "รอบ" (ใช้ rIndex เป็นตัวอ้างอิง)
  settings.rounds.forEach((roundName, rIndex) => {
    html += `<div class="fsk-round-block">`;
    html += `<h3 class="fsk-round-title">${roundName || 'รอบที่ ' + (rIndex + 1)}</h3>`;

    // 3. ลูปสร้างรายชื่อ "ทีม" ไว้ข้างในรอบนั้นๆ (ใช้ tIndex เป็นตัวอ้างอิง)
    settings.teams.forEach((teamName, tIndex) => {
      // 🔑 สร้าง Key รูปแบบ "r0_t0" (รอบที่ 0 ทีมที่ 0) เพื่อใช้เป็นฐานข้อมูล
      const scoreKey = `r${rIndex}_t${tIndex}`; 
      
      html += `
        <div class="fsk-team-row">
          <div class="fsk-team-name">${teamName || 'ทีม ' + (tIndex + 1)}</div>
          <div class="fsk-score-group" id="fsk-group-${scoreKey}">
            ${[1, 2, 3, 4, 5].map(score => `
              <button class="fsk-score-btn" 
                      onclick="selectFskScore('${scoreKey}', ${score})">
                ${score}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    });
    
    html += `</div>`; // ปิดกล่องรอบ
  });

  // เพิ่มปุ่มกดยืนยันส่งข้อมูลด้านล่างสุด
  html += `
    <button class="fsk-submit-btn" onclick="submitFskToFirebase()">
      ${t('fskSubmitBtn')}
    </button>
  `;

  container.innerHTML = html;
}

// 2. ฟังก์ชันจัดการเมื่อกรรมการกดปุ่มคะแนน
function selectFskScore(scoreKey, score) {
  // บันทึกคะแนนลงในตัวแปร Draft
  fskDraftScores[scoreKey] = score;

  // อัปเดต UI ให้ปุ่มเปลี่ยนสี
  const group = document.getElementById(`fsk-group-${scoreKey}`);
  const buttons = group.querySelectorAll('.fsk-score-btn');
  
  // ล้างสีปุ่มเก่าออกทั้งหมด แล้วใส่สีปุ่มที่เพิ่งกด
  buttons.forEach(btn => btn.classList.remove('selected'));
  buttons[score - 1].classList.add('selected'); // score - 1 เพราะ array เริ่มที่ 0
}

// 3. ฟังก์ชันสำหรับส่งขึ้น Firebase (เฟสต่อไป)
function selectFskScore(scoreKey, score) {
  fskDraftScores[scoreKey] = score;

  const group = document.getElementById(`fsk-group-${scoreKey}`);
  const buttons = group.querySelectorAll('.fsk-score-btn');
  
  buttons.forEach(btn => btn.classList.remove('selected'));
  buttons[score - 1].classList.add('selected');
}

async function submitFskToFirebase() {
  // 1. ตรวจสอบว่าให้คะแนนครบทุกช่องหรือยัง
  const totalExpected = settings.rounds.length * settings.teams.length;
  if (Object.keys(fskDraftScores).length < totalExpected) {
    alert(`กรุณาให้คะแนนให้ครบทุกช่องครับ (ตอนนี้ให้ไปแล้ว ${Object.keys(fskDraftScores).length}/${totalExpected})`);
    return;
  }

  // ป้องกันการกดซ้ำซ้อน: เปลี่ยนข้อความปุ่มและปิดการกดชั่วคราว
  const submitBtn = document.querySelector('#fsk-content-area .fsk-submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "กำลังบันทึกข้อมูล...";
  submitBtn.disabled = true;

  try {
    // 2. เตรียมก้อนข้อมูล (Payload) ที่จะส่งขึ้นไปเก็บ
    const payload = {
      judgeName: currentFskJudgeName,
      scores: fskDraftScores,
      submittedAt: new Date().toISOString() // แอบเก็บเวลาที่กดยืนยันไว้ด้วย
    };

    // 3. ยิงข้อมูลขึ้น Firebase ไปที่ Collection: fskVotes -> Document: (ชื่อกรรมการ)
    await db.collection('fskVotes').doc(currentFskJudgeName).set(payload);

    // 4. บันทึกสำเร็จ!
    alert("บันทึกคะแนน FSK เรียบร้อยแล้ว ขอบคุณครับ!");
    
    // เคลียร์ค่าตัวแปรให้สะอาด และสลับกลับไปหน้าแรก
    fskDraftScores = {}; 
    currentFskJudgeName = "";
    closeFskScreen();

  } catch (error) {
    console.error("Error submitting FSK scores:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    
    // คืนค่าปุ่มให้กลับมากดใหม่ได้
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

