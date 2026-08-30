import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const user = tg?.initDataUnsafe?.user;
const userId = user?.id ? user.id.toString() : "guest_user";
const firstName = user?.first_name || "User";

let userBalance = 0.00;
let existingEmails = [];
let selectedPayment = 'bKash';
let currentStep = 1;
let formData = { email: "", password: "", recovery: "" };

document.getElementById('username').innerText = firstName;
document.getElementById('user-id').innerText = `ID: ${userId}`;
if (user?.photo_url) document.getElementById('avatar').src = user.photo_url;

function showToast(msg) {
  const toast = document.getElementById('copy-toast');
  document.getElementById('toast-msg').innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// User ID and Generic Content Copy
window.copyUserId = function(btn) {
  navigator.clipboard.writeText(userId);
  showToast("ID Copied successfully!");
};

async function loadExistingEmails() {
  try {
    const querySnapshot = await getDocs(collection(db, "allGmailHistory"));
    existingEmails = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email) existingEmails.push(data.email.toLowerCase().trim());
      if (data.recovery) existingEmails.push(data.recovery.toLowerCase().trim());
    });
  } catch (error) {
    console.error("Error loading emails:", error);
  }
}
loadExistingEmails();

// Search Filter Feature (Search across Submit and Withdraw Histories)
window.filterContent = function() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return;

  const cards = activeTab.querySelectorAll('.account-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(input) ? "block" : "none";
  });
};

// Story Card Selector Feature
document.querySelectorAll('.story-card').forEach(story => {
  story.addEventListener('click', () => {
    document.querySelectorAll('.story-card').forEach(s => s.classList.remove('active'));
    story.classList.add('active');
    const title = story.querySelector('span').innerText;
    showToast(`${title} clicked`);
  });
});

// Realtime Email History & Balance
onSnapshot(query(collection(db, "allGmailHistory"), where("userId", "==", userId)), (snapshot) => {
  let completedCount = 0;
  const list = document.getElementById('gmail-history-container');
  list.innerHTML = snapshot.empty ? '<p style="font-size:12px;color:#8e8e93;text-align:center;">No history found</p>' : '';
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    const status = data.status || 'Pending';
    if (status === "Completed") completedCount++;

    const dateStr = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString("bn-BD") : "N/A";
    const statusClass = `status-${status.toLowerCase()}`;

    list.innerHTML += `
      <div class="account-card studio-card">
        <div class="field-item"><span>Email:</span> <b>${data.email}</b></div>
        <div class="field-item"><span>Password:</span> <b>${data.password}</b></div>
        <div class="field-item"><span>Recovery:</span> <b>${data.recovery}</b></div>
        <div class="field-item"><span>Date:</span> <b>${dateStr}</b></div>
        <div class="field-item"><span>Status:</span> <b class="${statusClass}">${status}</b></div>
      </div>`;
  });

  userBalance = completedCount * 10;
  document.getElementById('user-balance').innerText = userBalance.toFixed(2);
});

// Realtime Withdraw History
onSnapshot(query(collection(db, "withdrawHistory"), where("userId", "==", userId)), (snapshot) => {
  const list = document.getElementById('withdraw-history-container');
  list.innerHTML = snapshot.empty ? '<p style="font-size:12px;color:#8e8e93;text-align:center;">No withdraw history</p>' : '';
  snapshot.forEach((doc) => {
    const data = doc.data();
    const status = data.status || 'Pending';
    const dateStr = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString("bn-BD") : "N/A";
    const statusClass = `status-${status.toLowerCase()}`;

    list.innerHTML += `
      <div class="account-card studio-card">
        <div class="field-item"><span>Amount:</span> <b>৳${data.amount}</b></div>
        <div class="field-item"><span>Payment Method:</span> <b>${data.method} (${data.phone})</b></div>
        <div class="field-item"><span>Date:</span> <b>${dateStr}</b></div>
        <div class="field-item"><span>Status:</span> <b class="${statusClass}">${status}</b></div>
      </div>`;
  });
});

// Input Box Validation with Shadow & Tick Indicator
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

window.nextStep = function(step) {
  if (step === 1) formData.email = document.getElementById('input-email').value.trim();
  if (step === 2) formData.password = document.getElementById('input-password').value.trim();
  if (step === 3) formData.recovery = document.getElementById('input-recovery').value.trim();

  document.getElementById(`step-${currentStep}`).classList.remove('active');
  currentStep = step + 1;
  document.getElementById(`step-${currentStep}`).classList.add('active');

  if (currentStep === 4) renderConfirmation();
};

function renderConfirmation() {
  document.getElementById('confirmation-card-content').innerHTML = `
    <div class="field-item"><span>Email:</span> <b>${formData.email}</b></div>
    <div class="field-item"><span>Password:</span> <b>${formData.password}</b></div>
    <div class="field-item"><span>Recovery:</span> <b>${formData.recovery}</b></div>
    <button class="btn-proceed" style="margin-top:10px;" onclick="submitFinalData()">Confirm & Save</button>
  `;
}

window.submitFinalData = async function() {
  try {
    await addDoc(collection(db, "allGmailHistory"), {
      userId: userId, email: formData.email, password: formData.password,
      recovery: formData.recovery, status: "Pending", timestamp: serverTimestamp()
    });
    showToast("Submitted successfully!");
    location.reload();
  } catch (e) {
    showToast("Submission failed!");
  }
};

window.selectPaymentMethod = function(method) {
  selectedPayment = method;
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`pay-${method.toLowerCase()}`).classList.add('active');
};

window.validateWithdrawForm = function() {
  const phoneInput = document.getElementById('withdraw-phone');
  const phoneIndicator = document.getElementById('withdraw-phone-indicator');
  const amountInput = document.getElementById('withdraw-amount');
  const amountIndicator = document.getElementById('withdraw-amount-indicator');
  
  const phone = phoneInput.value.trim();
  const amount = Number(amountInput.value);
  const btn = document.getElementById('btn-withdraw');
  const errorMsg = document.getElementById('withdraw-error-msg');

  let phoneValid = phone.length === 11;
  let amountValid = amount >= 20 && amount <= userBalance;

  if (phoneValid) {
    phoneInput.classList.add('valid'); phoneIndicator.classList.add('show');
  } else {
    phoneInput.classList.remove('valid'); phoneIndicator.classList.remove('show');
  }

  if (amountValid) {
    amountInput.classList.add('valid'); amountIndicator.classList.add('show');
  } else {
    amountInput.classList.remove('valid'); amountIndicator.classList.remove('show');
  }

  if (phoneValid && amountValid) {
    btn.disabled = false; errorMsg.classList.remove('show');
  } else {
    btn.disabled = true;
    if (amount > 0 && !amountValid) errorMsg.classList.add('show');
    else errorMsg.classList.remove('show');
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
    validateWithdrawForm();
  } catch (e) {
    showToast("Withdraw request failed!");
  }
};

window.switchMainTab = function(tab, elem) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  elem.classList.add('active');

  // Clear search field when switching tabs
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    window.filterContent();
  }
};
