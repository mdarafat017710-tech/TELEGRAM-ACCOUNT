const tg = window.Telegram.WebApp;
tg.expand();

// Display User Info
document.getElementById('username').innerText = tg.initDataUnsafe.user.first_name;
document.getElementById('avatar').src = `https://ui-avatars.com/api/?name=${tg.initDataUnsafe.user.first_name}&background=random`;

// Firebase configuration (Replace with your actual Firebase config)
const firebaseConfig = {
 apiKey: "AIzaSyB0AdImn8AlFKA4z_j4n25xz-Py2jgmMNU",
 authDomain: "sell-156d4.firebaseapp.com",
 projectId: "sell-156d4",
 storageBucket: "sell-156d4.firebasestorage.app",
 messagingSenderId: "1:622346055495:web:ac370b08e40d6eadd0a662",
 appId: "622346055495"
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
