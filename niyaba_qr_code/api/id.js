export default async function handler(req, res) {
  const { nationalId } = req.query;

  // ✅ التحقق من أن الرقم القومي 14 رقم فقط (عربي أو إنجليزي)
  if (!nationalId || !/^[0-9٠-٩]{14}$/.test(nationalId)) {
    return res.status(400).json({
      success: false,
      message: "من فضلك أدخل الرقم القومي المكون من 14 رقمًا فقط (عربي أو إنجليزي).",
    });
  }

  try {
    const sheetId = process.env.SHEET_ID;
    const apiKey = process.env.API_KEY;

    if (!sheetId || !apiKey) {
      return res.status(500).json({
        success: false,
        message: "⚙️ لم يتم العثور على متغيرات البيئة (SHEET_ID أو API_KEY).",
      });
    }

    // 👇 رابط Google Sheets API
    const sheetUrl = 'https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?alt=json&key=${apiKey}';
    const response = await fetch(sheetUrl);
    const data = await response.json();

    const rows = data.values || [];

    // 🔍 البحث عن الصفوف التي تحتوي على الرقم القومي
    const results = rows.filter(r => r[2]?.trim() === nationalId.trim());

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على بيانات لهذا الرقم القومي.",
      });
    }

    // 📋 ترتيب الأعمدة في الشيت كالتالي:
    // رقم الفحص | السنة | الرقم القومي | رقم القضية | اسم مقدم الطلب | حالة الفحص | ما تم في الفحص | ملاحظات
    // نعرض فقط: رقم الفحص - السنة - الاسم
    const formatted = results.map(r => ({
      testNumber: r[0],
      year: r[1],
      name: r[4],
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء قراءة البيانات." });
  }
}