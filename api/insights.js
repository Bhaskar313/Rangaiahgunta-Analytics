module.exports = async (req, res) => {
  try {
    const cookies = Object.fromEntries(
      (req.headers.cookie || "")
        .split(";")
        .filter(Boolean)
        .map(c => {
          const i = c.indexOf("=");
          return [c.slice(0, i).trim(), c.slice(i + 1).trim()];
        })
    );

    const token = cookies.fb_access_token;

    if (!token) {
      return res.status(401).json({
        error: "Please connect Facebook first"
      });
    }

    const url = new URL(
      "https://graph.facebook.com/v23.0/me/accounts"
    );

    url.searchParams.set(
      "fields",
      "id,name,instagram_business_account{id,username,followers_count,media_count}"
    );

    url.searchParams.set("access_token", token);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json(data);
    }

    const page = (data.data || []).find(
      p => p.instagram_business_account
    );

    if (!page) {
      return res.status(404).json({
        error: "Instagram account not found on selected Facebook Page",
        pages: data.data || []
      });
    }

    return res.status(200).json({
      connected: true,
      page_name: page.name,
      instagram: page.instagram_business_account
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};