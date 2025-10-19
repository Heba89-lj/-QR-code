// const express = require('express');
// const XLSX = require('xlsx');
// const path = require('path');
// const fs = require('fs');
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.static(__dirname));  

// // endpoint لصفحة البحث
// app.get('/', (req, res) => {
//   const pagePath = path.join(__dirname, 'index.html'); // صفحة البحث
//   fs.readFile(pagePath, 'utf8', (err, data) => {
//     if(err) return res.status(500).send('Error loading page');
//     res.send(data);
//   });
// });

// // دالة قراءة Excel
// function readExcel() {
//   try {
//     const workbook = XLSX.readFile(path.join(__dirname, 'data.xlsx'));
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName] || {});

//     // طباعة البيانات في الترمنال للتأكد
//     console.log("بيانات الشيت المقروءة:", sheetData);

//     // تجاهل الصفوف الفاضية
//     return sheetData.filter(item => item != null);
//   } catch (err) {
//     console.error("Error reading Excel:", err);
//     return [];
//   }
// }

// // endpoint للبحث
// app.get('/search', (req, res) => {
//   let examNumber = req.query.examNumber;
//   let year = req.query.year;

//   if (!examNumber || !year) {
//     return res.status(400).json({ error: "ادخلي رقم الفحص وسنة الفحص" });
//   }

//   examNumber = examNumber.toString().trim();
//   year = year.toString().trim();

//   const sheetData = readExcel();

//   const result = sheetData.find(item => {
//     const itemExam = (item.ExamNumber || item['رقم الفحص'] || '').toString().trim();
//     const itemYear = (item.Year || item['السنة'] || '').toString().trim();
//     return itemExam === examNumber && itemYear === year;
//   });

//   if (result) {
//     res.json(result);
//   } else {
//     res.status(404).json({ error: "لا توجد بيانات" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });








const express = require('express');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ السطر ده لازم يكون هنا
app.use(express.static(__dirname));

// endpoint لصفحة البحث
app.get('/', (req, res) => {
  const pagePath = path.join(__dirname, 'index.html'); // نفتح صفحة الرئيسية بدل search
  fs.readFile(pagePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading page');
    res.send(data);
  });
});

// دالة قراءة Excel
function readExcel() {
  try {
    const workbook = XLSX.readFile(path.join(__dirname, 'data.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName] || {});
    console.log("بيانات الشيت المقروءة:", sheetData);
    return sheetData.filter(item => item != null);
  } catch (err) {
    console.error("Error reading Excel:", err);
    return [];
  }
}

// endpoint للبحث
app.get('/search', (req, res) => {
  let examNumber = req.query.examNumber;
  let year = req.query.year;

  if (!examNumber || !year) {
    return res.status(400).json({ error: "ادخلي رقم الفحص وسنة الفحص" });
  }

  examNumber = examNumber.toString().trim();
  year = year.toString().trim();

  const sheetData = readExcel();

  const result = sheetData.find(item => {
    const itemExam = (item.ExamNumber || item['رقم الفحص'] || '').toString().trim();
    const itemYear = (item.Year || item['السنة'] || '').toString().trim();
    return itemExam === examNumber && itemYear === year;
  });

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: "لا توجد بيانات" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
