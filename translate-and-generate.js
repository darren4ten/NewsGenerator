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
    const githubToken = process.env.G_AI_NEWS;
    // 提交生成的文件到 GitHub 仓库的 news 目录下
    const authorName = 'darren4ten';
    const authorEmail = 'darren4ten@163.com';


    lg("githubToken:" + githubToken.length);
    lg("newsListPath:" + newsListPath);
    // 读取 newsList.json 文件
    const newsList = JSON.parse(fs.readFileSync(newsListPath, 'utf-8'));

    for (const newsItem of newsList) {
      const startTime = startTimer();
      lg("process url:" + newsItem.url);
      // 使用 fetch 获取新闻网页内容
      const response = await fetch(newsItem.url);
      const html = await response.text();

      // 使用 JSDOM 解析 HTML
      const dom = new JSDOM(html);

      // 获取文章主要内容
      const mainArticle = dom.window.document.querySelector('.article__main');
      const articleText = mainArticle.textContent.trim();

      lg("articleText :" + articleText.length);
      lg("Begin call translateWithThirdPartyAPI");

      // 调用第三方 API 进行翻译，这里使用假设的 API 接口
      const translatedText = await translateWithThirdPartyAPI(articleText);
      lg("End call translateWithThirdPartyAPI");

      // 生成静态 HTML 文件
      const staticHTML = `<html><body><h1>Translated Article</h1><p>${translatedText}</p></body></html>`;

      // 将生成的 HTML 写入文件
      lg("Begin write file---");
      const filename = `news/article_${newsItem.id}_${parseInt(Math.random() * 1000)}.html`;
      fs.writeFileSync(filename, staticHTML);
      lg("End write file---");
      lg(`Translated article saved to ${newsItem.id}`);

      // 设置用户信息
      execSync(`git config  --global user.name "${authorName}"`);
      execSync(`git config  --global user.email "${authorEmail}"`);
      lg("Begin add file to local repo---");
      // 执行提交
      execSync(`git add ${filename}`);
      lg("End add file to local repo---");
      const elapsedTime = stopTimer(startTime);
      lg(`Translate file${filename} cost ${elapsedTime} ms`);
      const commitMessage = `Add translated articles.`;
      execSync(`git commit -m "${commitMessage}"`);
      lg(`Committed ${filename} to GitHub repository`);
      lg("Begin push file to remote repo---");
      execSync(`git push https://${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git HEAD:main`);
    }

    lg("End push file to remote repo---");
    lg('Translation process completed successfully.');
  } catch (error) {
    console.error('Error during translation:', error);
    process.exit(1);
  }
}
///////工具方法
function lg(msg) {
  console.log(`[${formatDateTime(new Date())}]${msg}.`);
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function pad2(number) {
  return (number < 10 ? '0' : '') + number;
}
function startTimer() {
  return process.hrtime();
}

function stopTimer(startTime) {
  const [seconds, nanoseconds] = process.hrtime(startTime);
  const elapsedTimeInNanoseconds = seconds * 1e9 + nanoseconds; // 纳秒
  const elapsedTimeInMilliseconds = elapsedTimeInNanoseconds / 1e6; // 毫秒
  return elapsedTimeInMilliseconds;
}
///////工具方法

async function translateWithThirdPartyAPI(text) {
  // 设置请求的头部信息
  const headers = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'Authorization': 'bearer SUxHsADip5WwlDdqSeVFQiaAdfadzJWHqIBPAmsd'
  };

  // 准备发送的数据
  const data = {
    message: text,
    model: 'command-r-plus',
    preamble: '作为一个专业的翻译大师，请根据我的内容帮忙翻译成中文.文章的内容大多来自CNN.'
  };

  // 发送 POST 请求
  try {
    var aiRes = await fetch('https://api.cohere.com/v1/chat', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    if (!aiRes.ok) {
      throw new Error('AI Network response was not ok');
    }
    var result = aiRes.json();
    return `<p class="trans-content">${result?.text}</p>`;

  } catch (error) {
    lg("TransalateApi error:" + error);
  }
  return "--not transalted--";
}

// 从命令行参数中获取 newsList.json 文件的路径
const newsListPath = process.argv[2];
translateNews(newsListPath);
