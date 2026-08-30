import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0AdImn8AlFKA4z_j4n25xz-Py2jgmMNU",
  authDomain: "sell-156d4.firebaseapp.com",
  projectId: "sell-156d4",
  storageBucket: "sell-156d4.firebasestorage.app",
  messagingSenderId: "1:622346055495:web:ac370b08e40d6eadd0a662",
  appId: "622346055495"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Telegram WebApp Integration
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
}

const user = tg?.initDataUnsafe?.user;
const userId = user?.id ? user.id.toString() : "test_user_123";
const firstName = user?.first_name || "Guest User";

// Setup Profile Header
document.getElementById('username').innerText = firstName;
document.getElementById('user-id').innerText = `ID: ${userId}`;

if (user?.photo_url) {
  document.getElementById('avatar').src = user.photo_url;
} else {
  document.getElementById('avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=007aff&color=fff`;
}

// Navigation Tab Switcher
window.switchTab = function(tabName, element) {
  document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active-page'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  document.getElementById('page-' + tabName).classList.add('active-page');
  element.classList.add('active');
};

// 1. Submit Gmail Account
document.getElementById('gmail-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const recovery = document.getElementById('recovery').value.trim();

  try {
    await addDoc(collection(db, "allGmailHistory"), {
      userId: userId,
      email: email,
      password: password,
      recovery: recovery,
      status: "Pending",
      timestamp: serverTimestamp()
    });

    alert("Account submitted successfully!");
    this.reset();
  } catch (error) {
    console.error("Error submitting account: ", error);
    alert("Submission failed. Try again.");
  }
});

// 2. Realtime Fetch Gmail History
const gmailQuery = query(
  collection(db, "allGmailHistory"),
  where("userId", "==", userId)
);

onSnapshot(gmailQuery, (snapshot) => {
  const container = document.getElementById('gmail-history-list');
  if (snapshot.empty) {
    container.innerHTML = '<p class="loading-text">No accounts submitted yet.</p>';
    return;
  }

  container.innerHTML = '';
  snapshot.forEach((doc) => {
    const data = doc.data();
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="item-left">
        <span class="item-title">${data.email}</span>
        <span class="item-sub">Pass: ${data.password}</span>
      </div>
      <span class="status-badge status-${(data.status || 'pending').toLowerCase()}">${data.status || 'Pending'}</span>
    `;
    container.appendChild(item);
  });
});

// 3. Submit Withdraw Request
document.getElementById('withdraw-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const method = document.getElementById('method').value;
  const phone = document.getElementById('phone').value.trim();
  const amount = document.getElementById('amount').value.trim();

  try {
    await addDoc(collection(db, "withdrawHistory"), {
      userId: userId,
      method: method,
      phone: phone,
      amount: Number(amount),
      status: "Pending",
      timestamp: serverTimestamp()
    });

    alert("Withdrawal request submitted!");
    this.reset();
  } catch (error) {
    console.error("Error submitting withdrawal: ", error);
    alert("Withdrawal failed. Try again.");
  }
});

// 4. Realtime Fetch Withdraw History
const withdrawQuery = query(
  collection(db, "withdrawHistory"),
  where("userId", "==", userId)
);

onSnapshot(withdrawQuery, (snapshot) => {
  const container = document.getElementById('withdraw-history-list');
  if (snapshot.empty) {
    container.innerHTML = '<p class="loading-text">No withdrawal history found.</p>';
    return;
  }

  container.innerHTML = '';
  snapshot.forEach((doc) => {
    const data = doc.data();
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="item-left">
        <span class="item-title">${data.method} (${data.phone})</span>
        <span class="item-sub">Amount: ৳${data.amount}</span>
      </div>
      <span class="status-badge status-${(data.status || 'pending').toLowerCase()}">${data.status || 'Pending'}</span>
    `;
    container.appendChild(item);
  });
});
