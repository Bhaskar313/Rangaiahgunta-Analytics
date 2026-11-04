const crypto = require("crypto");

module.exports = (req, res) => {
  const appId = process.env.META_APP_ID;

  if (!appId) {
    return res.status(500).send("Meta App ID missing");
  }

  const state = crypto.randomBytes(16).toString("hex");

  res.setHeader(
    "Set-Cookie",
    `ig_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );

  const redirectUri = `https://${req.headers.host}/api/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
    state: state
  });

  res.redirect(
    `https://www.facebook.com/dialog/oauth?${params.toString()}`
  );
};