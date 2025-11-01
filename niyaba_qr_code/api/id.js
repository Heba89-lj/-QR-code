// import fetch from "node-fetch";

// export default async function handler(req, res) {
//   const { id } = req.query;
//    const sheetId = process.env.SHEET_ID;
//   const apiKey = process.env.GOOGLE_API_KEY;


//   if (!sheetId || !apiKey) {
//     return res.status(500).json({ error: "API key or Sheet ID missing" });
//   }

  
//   try {
//     const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
//     const response = await fetch(url);
//     const data = await response.json();

//     if (!data.values) return res.status(404).json([]);

//     // إزالة صف العناوين
//     const rows = data.values.slice(1);

//     // البحث عن الصفوف اللي تحتوي على الرقم القومي
//     const matches = rows.filter(row => row[2] && row[2].trim() === id.trim());

//     // رجّع الأعمدة المطلوبة فقط (رقم الفحص - السنة - اسم مقدم الطلب)
//     const result = matches.map(row => [row[0], row[1], row[4]]);

//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error fetching data" });
//   }
// }




// ده المعدل
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { id } = req.query;
  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  // التحقق من وجود متغيرات البيئة
  if (!sheetId || !apiKey) {
    return res.status(500).json({ error: "API key or Sheet ID missing" });
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const response = await fetch(url);

    // قراءة الرد كـ نص خام أولًا
    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText); // محاولة تحويل النص إلى JSON
    } catch {
      return res.status(500).json({
        error: "رد غير صالح من Google Sheets",
      });
    }

    // التحقق من حالة الاستجابة أو وجود خطأ في JSON
    if (!response.ok || data.error) {
      return res.status(500).json({
        error: "خطأ في الوصول إلى Google Sheet",
      });
    }

    if (!data.values || data.values.length <= 1) {
      return res.status(404).json([]);
    }

    // إزالة صف العناوين
    const rows = data.values.slice(1);

    // البحث عن الصفوف التي تحتوي على الرقم القومي
    const matches = rows.filter(row => row[2] && row[2].trim() === id.trim());

    // إرجاع الأعمدة المطلوبة فقط (رقم الفحص - السنة - اسم مقدم الطلب)
    const result = matches.map(row => [row[0], row[1], row[4]]);

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
}
