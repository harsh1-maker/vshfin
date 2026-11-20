const VSH = {
  phone: "9599057079",
  wa: "https://wa.me/919599057079"
};

const PRODUCTS = [
  {
    id: "oh-500",
    type: "Overhead",
    capacity: "500 L",
    price: 499
  },
  {
    id: "oh-1000",
    type: "Overhead",
    capacity: "1000 L",
    price: 649
  },
  {
    id: "oh-1500",
    type: "Overhead",
    capacity: "1500 L",
    price: 799
  },
  {
    id: "oh-2000",
    type: "Overhead",
    capacity: "2000 L",
    price: 999
  },
  {
    id: "ug-5000",
    type: "Underground",
    capacity: "5000 L",
    price: 1499
  },
  {
    id: "ug-10000",
    type: "Underground",
    capacity: "10,000 L",
    price: 2299
  },
  {
    id: "ug-20000",
    type: "Underground",
    capacity: "20,000 L",
    price: 3499
  },
  {
    id: "ug-30000",
    type: "Underground",
    capacity: "30,000 L",
    price: 4999
  }
];

const DISCOUNTS = {
  1: 0,
  2: 0.10,
  3: 0.12,
  4: 0.14,
  5: 0.15
};

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("vshCart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("vshCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const quantity = getCart().reduce(
    (sum, item) => sum + item.qty,
    0
  );

  document
    .querySelectorAll("[data-cart-count]")
    .forEach(element => {
      element.textContent = quantity;
    });
}

function discountForQty(quantity) {
  return DISCOUNTS[Math.min(quantity, 5)] || 0.15;
}

function addToCart(id, quantity = 1) {

  const product = PRODUCTS.find(
    item => item.id === id
  );

  if (!product) return;

  const cart = getCart();

  const index = cart.findIndex(
    item => item.id === id
  );

  if (index >= 0) {
    cart[index].qty += quantity;
  } else {
    cart.push({
      ...product,
      qty: quantity
    });
  }

  saveCart(cart);

  toast("Added to cart");
}

function updateItem(id, quantity) {

  let cart = getCart();

  cart = cart
    .map(item =>
      item.id === id
        ? {
            ...item,
            qty: Math.max(0, quantity)
          }
        : item
    )
    .filter(item => item.qty > 0);

  saveCart(cart);

  renderCart();
}

function cartTotals() {

  const cart = getCart();

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  const quantity = cart.reduce(
    (sum, item) =>
      sum + item.qty,
    0
  );

  const discount =
    subtotal * discountForQty(quantity);

  const total =
    Math.round(subtotal - discount);

  return {
    subtotal,
    quantity,
    discount,
    total
  };
}

function renderCart() {

  const element =
    document.querySelector("#cart-items");

  if (!element) return;

  const cart = getCart();

  if (!cart.length) {

    element.innerHTML = `
      <div class="notice">
        Your cart is empty.
        Add a tank cleaning service to continue.
      </div>
    `;

    renderSummary();

    return;
  }

  element.innerHTML = cart.map(item => `
    <div class="cart-item">

      <div>
        <h3>
          ${item.type} Tank Cleaning — ${item.capacity}
        </h3>

        <small>
          ₹${item.price.toLocaleString("en-IN")}
          per tank
        </small>
      </div>

      <div class="cart-qty">

        <button
          onclick="updateItem('${item.id}',${item.qty - 1})">
          −
        </button>

        <span>
          ${item.qty}
        </span>

        <button
          onclick="updateItem('${item.id}',${item.qty + 1})">
          +
        </button>

      </div>

      <button
        class="remove"
        onclick="updateItem('${item.id}',0)">
        Remove
      </button>

    </div>
  `).join("");

  renderSummary();
}

function renderSummary() {

  const element =
    document.querySelector("#cart-summary");

  if (!element) return;

  const totals = cartTotals();

  element.innerHTML = `

    <h2>
      Order summary
    </h2>

    <div class="sum-row">
      <span>Subtotal</span>
      <strong>
        ₹${totals.subtotal.toLocaleString("en-IN")}
      </strong>
    </div>

    <div class="sum-row">
      <span>Multi-tank discount</span>
      <strong>
        −₹${Math.round(
          totals.discount
        ).toLocaleString("en-IN")}
      </strong>
    </div>

    <div class="sum-row">
      <span>Taxes</span>
      <strong>
        Included where applicable
      </strong>
    </div>

    <div class="sum-row total">
      <span>Total</span>
      <strong>
        ₹${totals.total.toLocaleString("en-IN")}
      </strong>
    </div>

    <button
      class="btn btn-primary"
      onclick="openCheckout()">
      Proceed to payment
    </button>

    <a
      class="btn btn-outline"
      target="_blank"
      href="${VSH.wa}"
      style="margin-top:10px">
      Book on WhatsApp
    </a>
  `;
}

function toast(message) {

  let element =
    document.querySelector("#toast");

  if (!element) {

    element =
      document.createElement("div");

    element.id = "toast";

    element.style.cssText = `
      position:fixed;
      left:50%;
      bottom:24px;
      transform:translateX(-50%);
      background:#0f172a;
      color:#fff;
      padding:11px 16px;
      border-radius:999px;
      z-index:200;
      font-size:13px
    `;

    document.body.appendChild(element);
  }

  element.textContent = message;

  element.style.opacity = 1;

  clearTimeout(element._timeout);

  element._timeout =
    setTimeout(() => {
      element.style.opacity = 0;
    }, 2200);
}

function setupNav() {

  const button =
    document.querySelector(".menu-toggle");

  const nav =
    document.querySelector(".mobile-nav");

  if (button && nav) {

    button.onclick = () => {
      nav.classList.toggle("open");
    };
  }

  updateCartCount();

  document
    .querySelectorAll(".reveal")
    .forEach(element => {

      const observer =
        new IntersectionObserver(
          entries => {

            entries.forEach(entry => {

              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
              }

            });

          },
          {
            threshold: 0.08
          }
        );

      observer.observe(element);
    });
}

function waMessage(customer = {}) {

  const cart = getCart();
  const totals = cartTotals();

  const items = cart
    .map(item =>
      `${item.type} ${item.capacity} x ${item.qty}`
    )
    .join(", ");

  return `Hello VSH Tank Cleaning,

I want to book tank cleaning.

Customer: ${customer.name || "Not provided"}
Phone: ${customer.phone || "Not provided"}
Email: ${customer.email || "Not provided"}

Services:
${items || "Not selected"}

Total: ₹${totals.total}

Payment/Order status:
${customer.status || "Booking enquiry"}

Booking details:
${customer.details || "Please confirm a suitable slot."}`;
}

function openCheckout() {

  if (!getCart().length) {
    toast("Your cart is empty");
    return;
  }

  const modal =
    document.querySelector("#checkout-modal");

  if (modal) {
    modal.hidden = false;
  }
}

function closeCheckout() {

  const modal =
    document.querySelector("#checkout-modal");

  if (modal) {
    modal.hidden = true;
  }
}

async function payNow(event) {

  event.preventDefault();

  const form = event.target;

  const button =
    form.querySelector(
      'button[type="submit"]'
    );

  const data =
    Object.fromEntries(
      new FormData(form).entries()
    );

  const cart = getCart();

  if (!cart.length) {
    return;
  }

  button.disabled = true;
  button.textContent =
    "Creating secure order…";

  try {

    const response =
      await fetch(
        "/api/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            customer: data,
            items: cart
          })
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
        "Unable to create order"
      );
    }

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay Checkout did not load."
      );
    }

    const razorpay =
      new Razorpay({
        key: result.key,
        order_id: result.order_id,
        amount: result.amount,
        currency: "INR",
        name: "VSH Tank Cleaning",
        description:
          "Water tank cleaning booking",

        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone
        },

        handler: async response => {

          try {

            const verification =
              await fetch(
                "/api/verify-payment",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json"
                  },
                  body: JSON.stringify({
                    ...response,
                    customer: data,
                    items: cart,
                    amount: result.amount,
                    order_id:
                      result.order_id
                  })
                }
              );

            const verificationData =
              await verification.json();

            if (!verification.ok) {
              throw new Error(
                verificationData.error ||
                "Payment verification failed"
              );
            }

            localStorage.removeItem(
              "vshCart"
            );

            updateCartCount();

            form.innerHTML = `
              <div class="notice success">
                <strong>
                  Payment verified.
                </strong>

                <br>

                Your booking has been confirmed.

                <br>

                Order ID:
                ${verificationData.order_id ||
                  result.order_id}
              </div>

              <a
                class="btn btn-primary"
                target="_blank"
                href="${VSH.wa}?text=${encodeURIComponent(
                  waMessage({
                    ...data,
                    status: "Paid",
                    details:
                      "Order ID: " +
                      (
                        verificationData.order_id ||
                        result.order_id
                      )
                  })
                )}">
                Send confirmation on WhatsApp
              </a>
            `;

            renderCart();

          } catch (error) {

            showPayError(
              error.message
            );
          }
        },

        modal: {
          ondismiss: () => {

            button.disabled = false;

            button.textContent =
              "Pay securely";
          }
        }
      });

    razorpay.open();

  } catch (error) {

    showPayError(
      error.message
    );
  }
}

function showPayError(message) {

  const error =
    document.querySelector(
      "#payment-error"
    );

  if (error) {

    error.hidden = false;
    error.textContent = message;
  }

  const button =
    document.querySelector(
      '#checkout-form button[type="submit"]'
    );

  if (button) {

    button.disabled = false;
    button.textContent =
      "Pay securely";
  }
}

function bookWhatsApp() {

  const type =
    document.querySelector(
      ".type-tab.active strong"
    )?.textContent ||
    "Overhead tank";

  const capacity =
    document.querySelector(
      ".cap-option.active strong"
    )?.textContent ||
    "500 L";

  const quantity =
    Number(
      document.querySelector(
        "#qty-display"
      )?.textContent || 1
    );

  const product =
    PRODUCTS.find(
      item =>
        item.capacity === capacity &&
        item.type ===
          type.split(" ")[0]
    );

  const total =
    (product?.price || 499) *
    quantity *
    (1 - discountForQty(quantity));

  const message = `Hello VSH Tank Cleaning,

I want to book ${quantity} x ${type} (${capacity}).

Estimated total:
₹${Math.round(total)}

Please confirm availability.`;

  window.open(
    `${VSH.wa}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

function initCalculator() {

  const options =
    document.querySelector(
      "#capacity-options"
    );

  if (!options) return;

  let type = "Overhead";
  let quantity = 1;

  function render() {

    const products =
      PRODUCTS.filter(
        product =>
          product.type === type
      );

    options.innerHTML =
      products.map(
        (product, index) => `
          <div
            class="cap-option ${index === 0 ? "active" : ""}"
            data-id="${product.id}"
            onclick="selectCap(this)"
          >

            <div class="cap-info">

              <strong>
                ${product.capacity}
              </strong>

              <div class="price-row">
                ₹${product.price}

                <del>
                  ₹${Math.round(
                    product.price * 1.15
                  )}
                </del>
              </div>

            </div>

            <span class="save-badge">
              Book now
            </span>

          </div>
        `
      ).join("");

    window._calcId =
      products[0].id;

    document.querySelector(
      "#qty-display"
    ).textContent = quantity;

    updateBook();
  }

  window.setTankType =
    (selectedType, element) => {

      type =
        selectedType === "overhead"
          ? "Overhead"
          : "Underground";

      document
        .querySelectorAll(".type-tab")
        .forEach(tab =>
          tab.classList.remove("active")
        );

      element.classList.add("active");

      render();
    };

  window.selectCap =
    element => {

      document
        .querySelectorAll(".cap-option")
        .forEach(option =>
          option.classList.remove(
            "active"
          )
        );

      element.classList.add("active");

      window._calcId =
        element.dataset.id;

      updateBook();
    };

  window.updateQty =
    change => {

      quantity =
        Math.max(
          1,
          quantity + change
        );

      document.querySelector(
        "#qty-display"
      ).textContent =
        quantity;

      updateBook();
    };

  function updateBook() {

    const product =
      PRODUCTS.find(
        item =>
          item.id ===
          window._calcId
      );

    const total =
      Math.round(
        product.price *
        quantity *
        (1 -
          discountForQty(
            quantity
          ))
      );

    document.querySelector(
      "#book-btn"
    ).textContent =
      `Book ${quantity} tank${
        quantity > 1 ? "s" : ""
      } — ₹${total.toLocaleString(
        "en-IN"
      )} on WhatsApp`;
  }

  window.checkPincode =
    () => {

      const input =
        document.querySelector(
          "#pincode-input"
        );

      const status =
        document.querySelector(
          "#pincode-status"
        );

      const pin =
        input.value.trim();

      const valid =
        /^\d{6}$/.test(pin);

      status.textContent =
        valid
          ? "PIN looks valid. We'll confirm exact coverage on booking."
          : "Enter a valid 6-digit PIN code.";

      status.style.color =
        valid
          ? "var(--green)"
          : "#b91c1c";
    };

  render();
}

async function submitEnquiry(event) {

  event.preventDefault();

  const form = event.target;

  const data =
    Object.fromEntries(
      new FormData(form).entries()
    );

  const button =
    form.querySelector(
      "button"
    );

  button.disabled = true;
  button.textContent =
    "Sending…";

  try {

    const response =
      await fetch(
        "/api/send-enquiry",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(data)
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
        "Unable to send"
      );
    }

    form.reset();

    toast(
      "Enquiry sent successfully"
    );

  } catch (error) {

    toast(
      error.message
    );

  } finally {

    button.disabled = false;
    button.textContent =
      "Send enquiry";
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupNav();

    initCalculator();

    renderCart();

    const enquiryForm =
      document.querySelector(
        "#enquiry-form"
      );

    if (enquiryForm) {
      enquiryForm.addEventListener(
        "submit",
        submitEnquiry
      );
    }

    const checkoutForm =
      document.querySelector(
        "#checkout-form"
      );

    if (checkoutForm) {
      checkoutForm.addEventListener(
        "submit",
        payNow
      );
    }

  }
);
