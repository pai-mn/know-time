import fs from 'fs';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

const markdownContent = fs.readFileSync('./presentation-content.md', 'utf-8');

// 将markdown转换为HTML，并添加PPT样式
const htmlContent = `
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
            font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            color: #333;
        }

        .slide {
            width: 210mm;
            height: 148.5mm;
            margin: 20px auto;
            padding: 40px;
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
        }

        .slide:last-child {
            page-break-after: avoid;
        }

        h1 {
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
        }

        h2 {
            color: #34495e;
            font-size: 1.8em;
            margin: 25px 0 20px 0;
            border-left: 5px solid #3498db;
            padding-left: 15px;
        }

        h3 {
            color: #2c3e50;
            font-size: 1.4em;
            margin: 20px 0 15px 0;
        }

        p, li {
            line-height: 1.6;
            margin-bottom: 10px;
            font-size: 1em;
        }

        ul, ol {
            margin-left: 20px;
            margin-bottom: 15px;
        }

        strong {
            color: #2c3e50;
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 0.9em;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }

        .book-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #e74c3c;
        }

        .highlight-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }

        .quote {
            font-style: italic;
            background: #f1f3f4;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 15px 0;
        }

        .center-text {
            text-align: center;
        }

        .cover-slide {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }

        .cover-slide h1 {
            color: white;
            border-bottom: 3px solid white;
        }

        hr {
            display: none; /* 隐藏markdown的分隔符 */
        }

        /* 打印样式 */
        @media print {
            body {
                background: white;
            }
            .slide {
                box-shadow: none;
                margin: 0;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    ${marked(markdownContent)}
</body>
</html>
`;

// 将markdown的---分隔符转换为slide div
const processedHtml = htmlContent
    .replace(/<hr>/g, '</div><div class="slide">')
    .replace(/<div class="slide"><\/div>/g, '');

// 添加封面样式
const finalHtml = processedHtml
    .replace('<div class="slide">\n<h1>时间与知识管理</h1>', '<div class="slide cover-slide">\n<h1>时间与知识管理</h1>');

// 保存HTML文件
fs.writeFileSync('presentation.html', finalHtml);

console.log('正在生成PDF...');

// 使用Puppeteer生成PDF
(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 设置页面大小为A5横向
    await page.setViewport({
        width: 1485, // A5横向宽度 (mm * 10)
        height: 1050, // A5横向高度 (mm * 10)
        deviceScaleFactor: 2
    });
    
    await page.goto(`file://${process.cwd()}/presentation.html`, {
        waitUntil: 'networkidle0'
    });
    
    // 等待所有内容加载完成
    await page.evaluate(() => {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    });
    
    // 生成PDF
    await page.pdf({
        path: 'ppt.pdf',
        format: 'A5',
        landscape: true,
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        },
        printBackground: true
    });
    
    await browser.close();
    
    console.log('PDF生成完成：ppt.pdf');
    
    // 清理临时文件
    fs.unlinkSync('presentation.html');
    
})().catch(console.error);