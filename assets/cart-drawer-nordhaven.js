let cartDrawer = document.getElementById("CartDrawer");
let cartDrawerClose = document.getElementById("CartDrawerClose");
let cartDrawerOverlay = document.querySelector(".cart-drawer__overlay");
let cartIcon = document.getElementById("cart-icon-bubble");
const increaseButtons = document.querySelectorAll(".cart-item__increase");
const decreaseButtons = document.querySelectorAll(".cart-item__decrease");
const removeButtons = document.querySelectorAll(".cart-item__remove");

function initializeCartDrawer() {
  cartDrawer = document.getElementById("CartDrawer");
  cartDrawerClose = document.getElementById("CartDrawerClose");
  cartDrawerOverlay = document.querySelector(".cart-drawer__overlay");
  cartIcon = document.getElementById("cart-icon-bubble");
  cartIcon.addEventListener("click", handleCartIconClick);
  cartDrawerClose.addEventListener("click", closeCartDrawer);
  cartDrawerOverlay.addEventListener("click", closeCartDrawer);

  const increaseButtons = document.querySelectorAll(".cart-item__increase");
  const decreaseButtons = document.querySelectorAll(".cart-item__decrease");
  increaseButtons.forEach((button) => {
    button.addEventListener("click", handleIncreaseClick);
  });

  decreaseButtons.forEach((button) => {
    button.addEventListener("click", handleDecreaseClick);
  });
  removeButtons.forEach((button) => {
    button.addEventListener("click", handleRemoveItem);
  });
}
initializeCartDrawer();

function handleCartIconClick(event) {
  event.preventDefault();
  openCartDrawer();
}

function openCartDrawer() {
  document.getElementById("CartDrawer").classList.add("is-open");
}

function closeCartDrawer() {
  document.getElementById("CartDrawer").classList.remove("is-open");
}

async function renderCartDrawer() {
  try {
    const response = await fetch("/?sections=cart-drawer-nordhaven");
    if (!response.ok) {
      throw new Error("Failed to render cart drawer.");
    }
    const sections = await response.json();
    const parser = new DOMParser();
    const html = parser.parseFromString(
      sections["cart-drawer-nordhaven"],
      "text/html",
    );
    const newDrawer = html.querySelector("#CartDrawer");
    const currentDrawer = document.getElementById("CartDrawer");
    currentDrawer.replaceWith(newDrawer);
    initializeCartDrawer();
    //console.log(sections);
  } catch (error) {
    console.log(error);
  }
}

async function updateCartItem(line, quantity) {
  try {
    const response = await fetch("/cart/change.js", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        line,
        quantity,
      }),
    });

    if (!response.ok) {
      console.log(response.status);

      console.log(await response.text());
      throw new Error("Unable to update cart.");
    }

    await updateCartCount();

    await renderCartDrawer();

    openCartDrawer();
  } catch (error) {
    console.error(error);
  }
}
// increaseButtons.forEach((button) => {
//   button.addEventListener("click", handleIncreaseClick);
// });
// decreaseButtons.forEach((button) => {
//   button.addEventListener("click", handleDecreaseClick);
// });
async function handleIncreaseClick(event) {
  console.log("Increase");
  const line = Number(event.currentTarget.dataset.line);
  const quantityElement = event.currentTarget.previousElementSibling;
  const quantity = Number(quantityElement.textContent);
  await updateCartItem(line, quantity + 1);
  console.log({
    line,
    quantity,
  });
}
async function handleDecreaseClick(event) {
  const line = Number(event.currentTarget.dataset.line);
  const quantityElement = event.currentTarget.nextElementSibling;
  const quantity = Number(quantityElement.textContent);
  await updateCartItem(line, quantity - 1);
}
async function handleRemoveItem(event) {
  const line = Number(event.currentTarget.dataset.line);

  await updateCartItem(line, 0);
}
