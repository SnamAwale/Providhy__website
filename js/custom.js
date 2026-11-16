const modal = document.getElementById("modal");
const form = document.getElementById("modalForm");
const dd = document.getElementById("dd");
const ddBtn = document.getElementById("ddBtn");
const ddValue = document.getElementById("ddValue");
const ddHidden = document.getElementById("ddHidden");
const ddItems = dd.querySelectorAll("li");
const otherWrap = document.getElementById("otherWrap");
const otherText = document.getElementById("otherText");

const resetDropdown = () => {
  ddItems.forEach((i) => i.classList.remove("selected"));
  ddValue.textContent = "Select an option";
  ddValue.classList.add("dd-placeholder");
  ddHidden.value = "";
  dd.classList.remove("open");
  otherWrap.style.display = "none";
  otherText.removeAttribute("required");
  otherText.value = "";
};

ddBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dd.classList.toggle("open");
});

ddItems.forEach((item) => {
  item.addEventListener("click", () => {
    ddItems.forEach((i) => i.classList.remove("selected"));
    item.classList.add("selected");
    ddValue.textContent = item.textContent;
    ddValue.classList.remove("dd-placeholder");
    ddHidden.value = item.dataset.value;
    dd.classList.remove("open");

    // Show textarea only for "Others" (option-5)
    if (item.dataset.value === "option-5") {
      otherWrap.style.display = "block";
      otherText.setAttribute("required", "true");
    } else {
      otherWrap.style.display = "none";
      otherText.removeAttribute("required");
      otherText.value = "";
    }
  });
});

document.addEventListener("click", (e) => {
  if (!dd.contains(e.target)) dd.classList.remove("open");
});

document
  .getElementById("closeBtn")
  .addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});
modal.addEventListener("close", () => {
  form.reset();
  resetDropdown();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!ddHidden.value) {
    alert("Please select an option.");
    return;
  }
  if (ddHidden.value === "option-5" && !otherText.value.trim()) {
    alert("Please specify your option.");
    return;
  }
  // Handle the submitted values here, e.g. send to a server
  console.log({
    name: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    option: ddValue.textContent,
    otherDetail: ddHidden.value === "option-5" ? otherText.value.trim() : null,
  });
  modal.close();
});

modal.showModal();
