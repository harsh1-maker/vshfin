const { Resend } = require("resend");

async function sendEmails({
  customer,
  items,
  total,
  order_id,
  payment_id
}) {

  const resend =
    new Resend(
      process.env.RESEND_API_KEY
    );

  const rows =
    (items || [])
      .map(
        item => `
          <tr>
            <td>
              ${item.type}
              ${item.capacity}
            </td>

            <td>
              ${item.qty}
            </td>

            <td>
              ₹${item.price}
            </td>
          </tr>
        `
      )
      .join("");

  const html = `
    <div
      style="
        font-family:Arial,sans-serif;
        max-width:640px;
        margin:auto
      "
    >

      <h2 style="color:#1a66ff">
        VSH Tank Cleaning
      </h2>

      <p>
        Booking confirmation
      </p>

      <p>
        <b>Customer:</b>
        ${customer.name}

        <br>

        <b>Phone:</b>
        ${customer.phone}

        <br>

        <b>Email:</b>
        ${customer.email}
      </p>

      <table
        cellpadding="8"
        cellspacing="0"
        border="1"
        style="
          border-collapse:collapse;
          width:100%
        "
      >

        <tr>
          <th>
            Service
          </th>

          <th>
            Qty
          </th>

          <th>
            Unit price
          </th>
        </tr>

        ${rows}

      </table>

      <p>
        <b>Total:</b>
        ₹${total}
      </p>

      <p>
        <b>Razorpay Order:</b>
        ${order_id}

        <br>

        <b>Payment ID:</b>
        ${payment_id}
      </p>

      <p>
        Our team will contact you
        to confirm the service slot.
      </p>

    </div>
  `;

  await resend.emails.send({
    from:
      process.env.FROM_EMAIL,

    to: [
      customer.email
    ],

    subject:
      "VSH Tank Cleaning — Booking confirmed",

    html
  });

  await resend.emails.send({
    from:
      process.env.FROM_EMAIL,

    to: [
      process.env.ADMIN_EMAIL
    ],

    subject:
      `New VSH booking — ${order_id}`,

    html
  });
}

module.exports = {
  sendEmails
};
