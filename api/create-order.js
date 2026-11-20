const Razorpay = require("razorpay");

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
      customer,
      items
    } = req.body || {};

    if (
      !customer?.name ||
      !customer?.phone ||
      !customer?.email
    ) {
      return json(res, 400, {
        error:
          "Name, phone and email are required."
      });
    }

    if (
      !Array.isArray(items) ||
      !items.length
    ) {
      return json(res, 400, {
        error: "Cart is empty."
      });
    }

    let subtotal = 0;
    let totalQty = 0;

    for (const item of items) {

      if (
        !PRODUCTS[item.id] ||
        !Number.isInteger(item.qty) ||
        item.qty < 1 ||
        item.qty > 50
      ) {
        return json(res, 400, {
          error:
            "Invalid cart item."
        });
      }

      subtotal +=
        PRODUCTS[item.id] *
        item.qty;

      totalQty += item.qty;
    }

    const discount =
      subtotal *
      (
        DISCOUNTS[
          Math.min(totalQty, 5)
        ] || 0.15
      );

    const total =
      Math.round(
        subtotal - discount
      );

    const razorpay =
      new Razorpay({
        key_id:
          process.env.RAZORPAY_KEY_ID,

        key_secret:
          process.env.RAZORPAY_KEY_SECRET
      });

    const order =
      await razorpay.orders.create({
        amount:
          total * 100,

        currency:
          "INR",

        receipt:
          `vsh_${Date.now()}`,

        notes: {
          customer_name:
            String(
              customer.name
            ).slice(0, 80),

          customer_phone:
            String(
              customer.phone
            ).slice(0, 30)
        }
      });

    return json(res, 200, {
      key:
        process.env.RAZORPAY_KEY_ID,

      order_id:
        order.id,

      amount:
        order.amount,

      currency:
        order.currency
    });

  } catch (error) {

    console.error(error);

    return json(res, 500, {
      error:
        "Could not create secure payment order."
    });
  }
};
