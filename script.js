import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Telegram WebApp Initialization
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
}

// Display User Info safely
const user = tg?.initDataUnsafe?.user;
const userId = user?.id || "guest_user";
const firstName = user?.first_name || "User";

const usernameElem = document.getElementById('username');
if (usernameElem) usernameElem.innerText = firstName;

const avatarElem = document.getElementById('avatar');
if (avatarElem) {
  avatarElem.src = user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=007aff&color=fff`;
}

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

// 1. Gmail Form Submission (Saved to Firestore)
const gmailForm = document.getElementById('gmail-form');
if (gmailForm) {
  gmailForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const recovery = document.getElementById('recovery').value.trim();

    try {
      // addDoc ব্যবহার করায় যতবার সাবমিট করা হবে ততবার নতুন ডকুমেন্ট হিসেবে সেভ হবে
      await addDoc(collection(db, "allGmailHistory"), {
        userId: userId,
        email: email,
        password: password,
        recovery: recovery,
        status: "Pending",
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      });

      alert("Account submitted successfully!");
      gmailForm.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to submit account. Please try again.");
    }
  });
}

// 2. Withdraw Form Submission
const withdrawForm = document.getElementById('withdraw-form');
if (withdrawForm) {
  withdrawForm.addEventListener('submit', async function (e) {
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
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      });

      alert("Withdraw request submitted!");
      withdrawForm.reset();
    } catch (error) {
      console.error("Error submitting withdraw: ", error);
      alert("Failed to submit withdraw request.");
    }
  });
}
