module.exports = async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (!code) {
      return res.status(400).send("Facebook authorization code missing");
    }

    const cookies = Object.fromEntries(
      (req.headers.cookie || "")
        .split("; ")
        .filter(Boolean)
        .map(c => {
          const i = c.indexOf("=");
          return [c.slice(0, i), c.slice(i + 1)];
        })
    );

    if (!state || state !== cookies.ig_oauth_state) {
      return res.status(403).send("Invalid OAuth state");
    }

    const redirectUri = `https://${req.headers.host}/api/callback`;

    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: redirectUri,
      code: code
    });

    const response = await fetch(
      "https://graph.facebook.com/v23.0/oauth/access_token?" + params.toString()
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      return res.status(400).json(data);
    }

    res.setHeader("Set-Cookie", [
      "ig_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      `fb_access_token=${data.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
    ]);

    return res.redirect("/");
  } catch (error) {
    return res.status(500).send("Facebook login failed");
  }
};