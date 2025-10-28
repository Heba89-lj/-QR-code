export default async function handler(req, res) {
  try {
    const { nationalId } = req.query;

    if (!nationalId) {
      return res.status(400).json({ success: false, message: "برجاء إدخال الرقم القومي." });
    }

    const sheetId = process.env.SHEET_ID;
    const apiKey = process.env.API_KEY;

    const url = https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?alt=json&key=${apiKey};
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("حدث خطأ أثناء الاتصال بجدول Google Sheets");
    }

    const data = await response.json();

    // هنا بتحليل البيانات حسب التنسيق بتاعك
    const rows = data.values || [];
    const headers = rows[0];
    const result = rows.slice(1).find(row => row[0] === nationalId);

    if (!result) {
      return res.status(404).json({ success: false, message: "الرقم غير موجود." });
    }

    const output = {};
    headers.forEach((h, i) => {
      output[h] = result[i];
    });

    return res.status(200).json({ success: true, data: output });
  } catch (error) {
    console.error("خطأ:", error.message);
    return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر." });
  }
}
