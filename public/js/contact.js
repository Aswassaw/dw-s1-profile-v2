document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let subject = document.getElementById("subject").value;
  let message = document.getElementById("message").value;

  if (name == "") {
    return alert("Nama diperlukan!");
  } else if (email == "") {
    return alert("Email diperlukan!");
  } else if (phone == "") {
    return alert("Phone diperlukan!");
  } else if (subject == "") {
    return alert("Subject diperlukan!");
  } else if (message == "") {
    return alert("Message diperlukan!");
  }

  let a = document.createElement("a");
  a.href = `mailto:${email}?subject=${subject.toUpperCase()}&body=Halo, nama saya ${name}, ${message}. Tolong hubungi saya pada nomor ${phone}. Terima kasih.`;
  a.click();
});
