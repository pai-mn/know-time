import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import markdownit from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取markdown文件
const markdownContent = fs.readFileSync(path.join(__dirname, 'presentation.md'), 'utf-8');

// 配置markdown解析器
const md = markdownit({
  html: true,
  breaks: true,
  linkify: true
});

// 将markdown转换为HTML
const htmlContent = md.render(markdownContent);

// 创建完整的HTML页面
const fullHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>时间与知识管理 - PPT</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
        }

        .slide-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .slide {
            padding: 60px;
            min-height: 800px;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .slide:last-child {
            page-break-after: avoid;
        }

        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
        }

        h2 {
            color: #34495e;
            font-size: 2em;
            margin: 25px 0 20px 0;
            border-left: 5px solid #3498db;
            padding-left: 15px;
        }

        h3 {
            color: #2c3e50;
            font-size: 1.5em;
            margin: 20px 0 15px 0;
        }

        p, li {
            line-height: 1.8;
            margin-bottom: 12px;
            font-size: 1.1em;
        }

        ul, ol {
            margin-left: 30px;
            margin-bottom: 20px;
        }

        strong {
            color: #2c3e50;
            font-weight: bold;
        }

        img {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 0.95em;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }

        blockquote {
            font-style: italic;
            background: #f1f3f4;
            padding: 20px;
            border-left: 4px solid #3498db;
            margin: 20px 0;
            font-size: 1.1em;
        }

        hr {
            border: none;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            margin: 40px 0;
            page-break-after: always;
        }

        .center-text {
            text-align: center;
        }

        .book-info {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 5px solid #e74c3c;
        }

        .highlight-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }

        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
        }

        a {
            color: #3498db;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="slide-container">
        ${htmlContent}
    </div>
</body>
</html>
`;

// 保存临时HTML文件
const tempHTMLPath = path.join(__dirname, 'temp-presentation.html');
fs.writeFileSync(tempHTMLPath, fullHTML);

// 生成PDF
async function generatePDF() {
    console.log('正在启动浏览器...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('正在加载HTML内容...');
    await page.goto(`file://${tempHTMLPath}`, { waitUntil: 'networkidle0' });
    
    console.log('正在生成PDF...');
    await page.pdf({
        path: path.join(__dirname, 'ppt.pdf'),
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            bottom: '20px',
            left: '20px',
            right: '20px'
        },
        preferCSSPageSize: true
    });
    
    await browser.close();
    
    // 删除临时文件
    fs.unlinkSync(tempHTMLPath);
    
    console.log('PDF生成完成！文件已保存为 ppt.pdf');
}

// 运行生成PDF
generatePDF().catch(console.error);