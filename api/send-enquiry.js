const { Resend } = require("resend");

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).json({
      error:
        "Method not allowed"
    });
  }

  try {

    const data =
      req.body || {};

    if (
      !data.name ||
      !data.phone ||
      !data.message
    ) {
      return res.status(400).json({
        error:
          "Name, phone and message are required."
      });
    }

    const resend =
      new Resend(
        process.env.RESEND_API_KEY
      );

    await resend.emails.send({

      from:
        process.env.FROM_EMAIL,

      to: [
        process.env.ADMIN_EMAIL
      ],

      subject:
        `VSH enquiry — ${String(
          data.name
        ).slice(0, 60)}`,

      html: `
        <h2>
          New VSH enquiry
        </h2>

        <p>
          <b>Name:</b>
          ${data.name}
        </p>

        <p>
          <b>Phone:</b>
          ${data.phone}
        </p>

        <p>
          <b>Email:</b>
          ${data.email || "Not provided"}
        </p>

        <p>
          <b>Message:</b>
          ${data.message}
        </p>
      `
    });

    return res.status(200).json({
      ok: true
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        "Could not send enquiry right now."
    });
  }
};
