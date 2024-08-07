//const fs = require('fs');
//const fetch = require('node-fetch');
//const { JSDOM } = require('jsdom');
import fs from 'fs';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { execSync } from 'child_process';

async function translateNews(newsListPath) {
  try {
    // 获取 GitHub Token 作为环境变量传入
    const githubToken = process.env.GH_TOKEN;
    console.log("githubToken:" + githubToken.length);
    console.log("newsListPath:" + newsListPath);
    // 读取 newsList.json 文件
    const newsList = JSON.parse(fs.readFileSync(newsListPath, 'utf-8'));

    for (const newsItem of newsList) {

      console.log("process url:" + newsItem.url);
      // 使用 fetch 获取新闻网页内容
      const response = await fetch(newsItem.url);
      const html = await response.text();

      // 使用 JSDOM 解析 HTML
      const dom = new JSDOM(html);

      // 获取文章主要内容
      const mainArticle = dom.window.document.querySelector('.article__main');
      const articleText = mainArticle.textContent.trim();

      console.log("articleText :" + articleText.length);
      // 调用第三方 API 进行翻译，这里使用假设的 API 接口
      const translatedText = await translateWithThirdPartyAPI(articleText);

      // 生成静态 HTML 文件
      const staticHTML = `<html><body><h1>Translated Article</h1><p>${translatedText}</p></body></html>`;

      // 将生成的 HTML 写入文件
      const filename = `news/article_${newsItem.id}.html`;
      fs.writeFileSync(filename, staticHTML);

      console.log(`Translated article saved to ${newsItem.id}`);
      // 提交生成的文件到 GitHub 仓库的 news 目录下
      const commitMessage = `Add translated article ${filename}`;
      // execSync(`-c "user.name=darren4ten" -c "user.email=darren4ten@163.com"`);

      const authorName = 'darren4ten';
      const authorEmail = 'darren4ten@163.com';
      // 设置用户信息
      execSync(`git config user.name "${authorName}"`);
      execSync(`git config user.email "${authorEmail}"`);

      // 执行提交
      execSync(`git add ${filename}`);
      execSync(`git commit -m "${commitMessage}"`);
      // execSync(`git push origin HEAD`);
      execSync(`git push https://${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git HEAD:main`);
      console.log(`Committed ${filename} to GitHub repository`);
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
