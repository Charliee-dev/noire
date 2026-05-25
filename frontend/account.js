document.addEventListener("DOMContentLoaded", () => {

  const email = document.getElementById("email");
  const logoutBtn = document.getElementById("logoutBtn");

  const loginSection = document.getElementById("loginSection");
  const accountSection = document.getElementById("accountSection");

  const token = localStorage.getItem("token");

  // 🔴 NOT LOGGED IN
  if (!token) {
    loginSection.style.display = "block";
    accountSection.style.display = "none";
    return;
  }

  // 🟢 LOGGED IN
  loginSection.style.display = "none";
  accountSection.style.display = "block";

  try {
  const payload = JSON.parse(atob(token.split(".")[1]));

  // 🔥 ADD THIS
  const roleText = document.getElementById("userRole");

  if (roleText) {
    if (payload.role === "admin") {
      roleText.innerText = "Admin";
    } else {
      roleText.innerText = "Member";
    }
  }

  // ✅ SHOW EMAIL
  if (email) {
    email.innerText = payload.email || "User";
  }
  const avatarLetter = document.getElementById("avatarLetter");

if (avatarLetter && payload.email) {
  avatarLetter.innerText =
    payload.email[0].toUpperCase();
}
const welcomeName = document.getElementById("welcomeName");

if (welcomeName && payload.email) {
  welcomeName.innerText =
    `Welcome, ${payload.email.split("@")[0]}`;
}
  // ✅ ADMIN BUTTON
  const adminAccess = document.getElementById("adminAccess");

  if (adminAccess) {
    if (payload.role === "admin") {
      adminAccess.style.display = "block";
    } else {
      adminAccess.style.display = "none";
    }
  }

} catch (err) {
  localStorage.removeItem("token");
window.location.reload();
}

  // 🔥 LOGOUT (outside try — correct)
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

const changeBtn =
document.getElementById("changePasswordBtn");

if(changeBtn){

changeBtn.addEventListener("click", async()=>{

const currentPassword =
document.getElementById("currentPassword").value;

const newPassword =
document.getElementById("newPassword").value;

const confirmPassword =
document.getElementById("confirmPassword").value;

if(newPassword !== confirmPassword){
  alert("Passwords do not match");
  return;
}

const res = await fetch(
"http://localhost:5001/api/auth/change-password",
{
  method:"POST",
  headers:{
    "Content-Type":"application/json",
    "Authorization":"Bearer " + token
  },
  body:JSON.stringify({
    currentPassword,
    newPassword
  })
});

const data = await res.json();

if(data.success){
  alert("Password Updated Successfully");
}else{
  alert(data.message);
}

});

}

});