const tg = window.Telegram.WebApp;
tg.expand();

// Display User Info
document.getElementById('username').innerText = tg.initDataUnsafe.user.first_name;
document.getElementById('avatar').src = `https://ui-avatars.com/api/?name=${tg.initDataUnsafe.user.first_name}&background=random`;

// Firebase configuration (Replace with your actual Firebase config)
const firebaseConfig = {
 apiKey: "YOUR_API_KEY",
 authDomain: "YOUR_AUTH_DOMAIN",
 projectId: "YOUR_PROJECT_ID",
 storageBucket: "YOUR_STORAGE_BUCKET",
 messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
 appId: "YOUR_APP_ID"
};

// Initialize Firebase SDKs can be added here.
// For now, let's keep the frontend logic ready.

document.getElementById('gmail-form').addEventListener('submit', function(e) {
 e.preventDefault();
 const email = document.getElementById('email').value;
 const password = document.getElementById('password').value;
 const recovery = document.getElementById('recovery').value;
 const userId = tg.initDataUnsafe.user.id;

 // Here you will send this data to Firebase Firestore
 console.log("Submitting:", { email, password, recovery, userId });
 alert("Account submitted successfully!");
 this.reset();
});

document.getElementById('withdraw-form').addEventListener('submit', function(e) {
 e.preventDefault();
 const method = document.getElementById('method').value;
 const phone = document.getElementById('phone').value;
 const amount = document.getElementById('amount').value;

 console.log("Withdrawing:", { method, phone, amount });
 alert("Withdraw request submitted!");
 this.reset();
});
