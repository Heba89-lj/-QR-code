export default async function handler(req, res) {
  console.log("✅ Function started"); // للتأكد إن الدالة اشتغلت

  try {
    const { nationalId } = req.query;
    console.log("📩 Received nationalId:", nationalId);

    if (!nationalId) {
      console.log("⚠️ Missing nationalId");
      return res.status(400).json({ success: false, message: "من فضلك أدخل الرقم القومي." });
    }

    const SHEET_ID = process.env.SHEET_ID;
    const API_KEY = process.env.API_KEY;

    console.log("🧩 SHEET_ID:", SHEET_ID ? "Loaded ✅" : "❌ Missing");
    console.log("🧩 API_KEY:", API_KEY ? "Loaded ✅" : "❌ Missing");

    if (!SHEET_ID || !API_KEY) {
      throw new Error("Missing environment variables SHEET_ID or API_KEY");
    }

    const url = https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?alt=json&key=${API_KEY};
    console.log("🌐 Fetching URL:", url);

    const response = await fetch(url);
    console.log("📡 Google Sheets status:", response.status);

    if (!response.ok) {
      throw new Error(Google Sheets API returned ${response.status});
    }

    const data = await response.json();
    console.log("📄 Sheets response keys:", Object.keys(data));

    if (!data.values) {
      throw new Error("No 'values' property found in Google Sheets response");
    }

    const rows = data.values;
    console.log("🧾 Total rows fetched:", rows.length);

    // نبحث عن الرقم القومي في العمود الثالث (index = 2)
    const match = rows.find(row => row[2]?.trim() === nationalId.trim());
    console.log("🔍 Match found:", !!match);

    if (!match) {
      console.log("🚫 No matching record found");
      return res.status(404).json({ success: false, message: "لم يتم العثور على بيانات." });
    }

    const formatted = {
      testNumber: match[0],
      year: match[1],
      name: match[4],
    };

    console.log("✅ Formatted result:", formatted);

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}
