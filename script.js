import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp, getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB0AdImn8AlFKA4z_j4n25xz-Py2jgmMNU",
  authDomain: "sell-156d4.firebaseapp.com",
  projectId: "sell-156d4",
  storageBucket: "sell-156d4.firebasestorage.app",
  messagingSenderId: "1:622346055495:web:ac370b08e40d6eadd0a662",
  appId: "622346055495"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Telegram Setup
const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const user = tg?.initDataUnsafe?.user;
const userId = user?.id ? user.id.toString() : "guest_user";
const firstName = user?.first_name || "User";

let userBalance = 0.00;
let existingEmails = [];
let selectedPayment = 'bKash';
let currentStep = 1;
let formData = { email: "", password: "", status: "Security Processing", statusClass: "status-red", recovery: "" };

document.getElementById('username').innerText = firstName;
document.getElementById('user-id').innerText = `ID: ${userId}`;
if (user?.photo_url) document.getElementById('avatar').src = user.photo_url;

// Toast Function
function showToast(msg) {
  const toast = document.getElementById('copy-toast');
  document.getElementById('toast-msg').innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Fetch All Submitted Emails for Duplication Check
async function loadExistingEmails() {
  const querySnapshot = await getDocs(collection(db, "allGmailHistory"));
  existingEmails = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.email) existingEmails.push(data.email.toLowerCase().trim());
    if (data.recovery) existingEmails.push(data.recovery.toLowerCase().trim());
  });
}
loadExistingEmails();

// Realtime User Balance & Submissions
onSnapshot(query(collection(db, "allGmailHistory"), where("userId", "==", userId)), (snapshot) => {
  let approvedCount = 0;
  const list = document.getElementById('history-gmail-list');
  list.innerHTML = snapshot.empty ? '<p style="font-size:11px;color:#8e8e93;">No email submitted</p>' : '';
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.status === "Approved") approvedCount++;
    list.innerHTML += `
      <div class="field-item">
        <span>${data.email}</span>
        <span class="status-${(data.status||'pending').toLowerCase()}">${data.status || 'Pending'}</span>
      </div>`;
  });

  userBalance = approvedCount * 10; // ধরে নিলাম প্রতি ইমেইলে ১০ টাকা
  document.getElementById('user-balance').innerText = userBalance.toFixed(2);
});

// Realtime Withdraw History
onSnapshot(query(collection(db, "withdrawHistory"), where("userId", "==", userId)), (snapshot) => {
  const list = document.getElementById('history-withdraw-list');
  list.innerHTML = snapshot.empty ? '<p style="font-size:11px;color:#8e8e93;">No withdraw history</p>' : '';
  snapshot.forEach((doc) => {
    const data = doc.data();
    list.innerHTML += `
      <div class="field-item">
        <span>${data.method} (${data.phone})</span>
        <span>৳${data.amount} [${data.status}]</span>
      </div>`;
  });
});

// Gmail & Recovery Field Validator
window.validateGmailField = function(field, step) {
  const input = document.getElementById(`input-${field}`);
  const indicator = document.getElementById(`${field}-indicator`);
  const errorMsg = document.getElementById(`${field}-error-msg`);
  const btn = document.getElementById(`btn-${step}`);
  const val = input.value.trim().toLowerCase();

  if (val.endsWith("@gmail.com") && val.length > 10) {
    if (existingEmails.includes(val)) {
      input.classList.remove('valid'); input.classList.add('invalid');
      indicator.classList.remove('show'); errorMsg.classList.add('show');
      btn.disabled = true;
    } else {
      input.classList.remove('invalid'); input.classList.add('valid');
      indicator.classList.add('show'); errorMsg.classList.remove('show');
      btn.disabled = false;
    }
  } else {
    input.classList.remove('valid', 'invalid');
    indicator.classList.remove('show'); errorMsg.classList.remove('show');
    btn.disabled = true;
  }
};

window.validateStandardField = function(field, minLen, step) {
  const input = document.getElementById(`input-${field}`);
  const indicator = document.getElementById(`${field}-indicator`);
  const btn = document.getElementById(`btn-${step}`);
  if (input.value.trim().length >= minLen) {
    input.classList.add('valid'); indicator.classList.add('show'); btn.disabled = false;
  } else {
    input.classList.remove('valid'); indicator.classList.remove('show'); btn.disabled = true;
  }
};

// Navigation Steps
window.nextStep = function(step) {
  if (step === 1) formData.email = document.getElementById('input-email').value.trim();
  if (step === 2) formData.password = document.getElementById('input-password').value.trim();
  if (step === 4) formData.recovery = document.getElementById('input-recovery').value.trim();

  document.getElementById(`step-${currentStep}`).classList.remove('active');
  currentStep = step + 1;
  document.getElementById(`step-${currentStep}`).classList.add('active');

  if (currentStep === 5) renderConfirmation();
};

window.skipRecovery = function() {
  formData.recovery = "Skipped";
  nextStep(4);
};

function renderConfirmation() {
  document.getElementById('confirmation-card-content').innerHTML = `
    <div class="field-item"><span>Email:</span> <b>${formData.email}</b></div>
    <div class="field-item"><span>Password:</span> <b>${formData.password}</b></div>
    <div class="field-item"><span>Status:</span> <b class="${formData.statusClass}">${formData.status}</b></div>
    <div class="field-item"><span>Recovery:</span> <b>${formData.recovery}</b></div>
    <button class="btn-proceed" style="margin-top:10px;" onclick="submitFinalData()">Confirm & Save</button>
  `;
}

window.submitFinalData = async function() {
  try {
    await addDoc(collection(db, "allGmailHistory"), {
      userId: userId, email: formData.email, password: formData.password,
      status: formData.status, recovery: formData.recovery, timestamp: serverTimestamp()
    });
    showToast("Account saved successfully!");
    location.reload();
  } catch (e) {
    showToast("Submission failed!");
  }
};

// Payment & Withdraw Validation
window.selectPaymentMethod = function(method) {
  selectedPayment = method;
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`pay-${method.toLowerCase()}`).classList.add('active');
};

window.validateWithdrawForm = function() {
  const phone = document.getElementById('withdraw-phone').value.trim();
  const amount = Number(document.getElementById('withdraw-amount').value);
  const btn = document.getElementById('btn-withdraw');
  const errorMsg = document.getElementById('withdraw-error-msg');

  if (phone.length === 11 && amount >= 20 && amount <= userBalance) {
    btn.disabled = false; errorMsg.classList.remove('show');
  } else {
    btn.disabled = true; errorMsg.classList.add('show');
  }
};

window.handleWithdrawSubmit = async function() {
  const phone = document.getElementById('withdraw-phone').value.trim();
  const amount = Number(document.getElementById('withdraw-amount').value);

  try {
    await addDoc(collection(db, "withdrawHistory"), {
      userId: userId, method: selectedPayment, phone: phone, amount: amount,
      status: "Pending", timestamp: serverTimestamp()
    });
    showToast("Withdraw requested!");
    document.getElementById('withdraw-phone').value = '';
    document.getElementById('withdraw-amount').value = '';
  } catch (e) {
    showToast("Withdraw request failed!");
  }
};

// Global Tabs Switcher
window.switchMainTab = function(tab, elem) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  elem.classList.add('active');
};

window.toggleDropdown = function() {
  document.getElementById('dropdown-menu').classList.toggle('show');
};

window.selectStatus = function(text, cls) {
  formData.status = text; formData.statusClass = cls;
  document.getElementById('selected-status-text').innerText = text;
  document.getElementById('selected-status-text').className = cls;
  window.toggleDropdown();
};
