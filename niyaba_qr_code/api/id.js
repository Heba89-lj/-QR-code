export default async function handler(req, res) {
  const { nationalId } = req.query;

  if (!nationalId || nationalId.length !== 14) {
    return res.status(400).json({
      success: false,
      message: "من فضلك أدخل الرقم القومي المكون من 14 رقمًا فقط.",
    });
  }

  try {
    const SHEET_ID = process.env.SHEET_ID;
    const API_KEY = process.env.API_KEY;

    const url = 'https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?alt=json&key=${API_KEY}';

    const response = await fetch(url);
    const json = await response.text();

    const rows = json.values || [];
    const results = rows.filter(r => r[2]?.trim() === nationalId.trim()); // العمود الثالث = الرقم القومي

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على بيانات لهذا الرقم القومي.",
      });
    }

    // الأعمدة بالترتيب: رقم الفحص | السنة | الرقم القومي | رقم القضية | اسم مقدم الطلب | حالة الفحص | ما تم | ملاحظات
    const formatted = results.map(r => ({
      testNumber: r[0],
      year: r[1],
      name: r[4],
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "خطأ في قراءة البيانات." });
  }

}
