const crypto = require("crypto");
const { sendEmails } = require("./_email");

const PRODUCTS = {
  "oh-500": 499,
  "oh-1000": 649,
  "oh-1500": 799,
  "oh-2000": 999,
  "ug-5000": 1499,
  "ug-10000": 2299,
  "ug-20000": 3499,
  "ug-30000": 4999
};

const DISCOUNTS = {
  1: 0,
  2: 0.10,
  3: 0.12,
  4: 0.14,
  5: 0.15
};

function json(res, status, body) {
  res.status(status).json(body);
}

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed"
    });
  }

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      items,
      amount,
      order_id
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return json(res, 400, {
        error:
          "Missing payment verification data."
      });
    }

    const expected =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(
          razorpay_signature
        )
      )
    ) {
      return json(res, 400, {
        error:
          "Payment signature verification failed."
      });
    }

    if (
      order_id !== razorpay_order_id
    ) {
      return json(res, 400, {
        error: "Order mismatch."
      });
    }

    let subtotal = 0;
    let quantity = 0;

    for (const item of items || []) {

      if (
        !PRODUCTS[item.id] ||
        !Number.isInteger(item.qty) ||
        item.qty < 1
      ) {
        return json(res, 400, {
          error:
            "Invalid order items."
        });
      }

      subtotal +=
        PRODUCTS[item.id] *
        item.qty;

      quantity += item.qty;
    }

    const discount =
      subtotal *
      (
        DISCOUNTS[
          Math.min(quantity, 5)
        ] || 0.15
      );

    const total =
      Math.round(
        subtotal - discount
      );

    if (
      Number(amount) !==
      total * 100
    ) {
      return json(res, 400, {
        error:
          "Order amount mismatch."
      });
    }

    await sendEmails({
      customer,
      items,
      total,
      order_id:
        razorpay_order_id,
      payment_id:
        razorpay_payment_id
    });

    return json(res, 200, {
      ok: true,
      order_id:
        razorpay_order_id
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error:
        "Payment verified but confirmation processing failed. Please contact VSH with your payment ID."
    });
  }
};
