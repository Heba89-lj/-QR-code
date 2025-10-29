export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { nationalId } = req.query;

  if (!nationalId) {
    return res
      .status(400)
      .json({ success: false, message: "من فضلك أدخل الرقم القومي" });
  }

  // ✅ تحويل الأرقام العربية إلى إنجليزية
  const normalize = (str = "") =>
    str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).trim();

  const nid = normalize(nationalId);

  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const response = await fetch(url);
    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("❌ خطأ في تحليل الرد من Google Sheets:", rawText);
      return res.status(500).json({
        success: false,
        message: "رد غير صالح من Google Sheets",
      });
    }

    if (!response.ok || data.error) {
      console.error("⚠️ Google Sheets API Error:", data.error);
      return res.status(500).json({
        success: false,
        message: "خطأ في الوصول إلى Google Sheet",
      });
    }

    const rows = data.values?.slice(1) || [];

    // ✅ البحث عن الصف الذي يحتوي الرقم القومي
    const match = rows.find((r) => normalize(r[2]).includes(nid)); // العمود الثالث للرقم القومي

    if (match) {
      return res.status(200).json({
        success: true,
        result: {
          number: match[0], // رقم الفحص
          year: match[1], // السنة
          applicant: match[4], // اسم مقدم الطلب
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على بيانات لهذا الرقم القومي",
      });
    }
  } catch (error) {
    console.error("🔥 Error fetching Google Sheet:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في السيرفر",
      error: error.message,
    });
  }
}
