const fs = require('fs');
//const fetch = require('node-fetch');
//const { JSDOM } = require('jsdom');
//import fs from 'fs';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

async function translateNews(newsListPath) {
  try {
    // 读取 newsList.json 文件
    const newsList = JSON.parse(fs.readFileSync(newsListPath, 'utf-8'));

    for (const newsItem of newsList) {
      // 使用 fetch 获取新闻网页内容
      const response = await fetch(newsItem.url);
      const html = await response.text();
      
      // 使用 JSDOM 解析 HTML
      const dom = new JSDOM(html);
      
      // 获取文章主要内容
      const mainArticle = dom.window.document.querySelector('.article__main');
      const articleText = mainArticle.textContent.trim();
      
      // 调用第三方 API 进行翻译，这里使用假设的 API 接口
      const translatedText = await translateWithThirdPartyAPI(articleText);
      
      // 生成静态 HTML 文件
      const staticHTML = `<html><body><h1>Translated Article</h1><p>${translatedText}</p></body></html>`;
      
      // 保存静态 HTML 文件
      fs.writeFileSync(`translated_${newsItem.id}.html`, staticHTML, 'utf-8');
    }
    
    console.log('Translation process completed successfully.');
  } catch (error) {
    console.error('Error during translation:', error);
    process.exit(1);
  }
}

async function translateWithThirdPartyAPI(text) {
  // 实际应用中，调用第三方 API 来翻译文本
  // 这里你需要替换成实际的 API 调用方式
  return `<p class="trans-content">${text}</p>`;
}

// 从命令行参数中获取 newsList.json 文件的路径
const newsListPath = process.argv[2];
translateNews(newsListPath);
