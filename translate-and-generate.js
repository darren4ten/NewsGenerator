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
      execSync(`git config  --global user.name "${authorName}"`);
      execSync(`git config  --global user.email "${authorEmail}"`);

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
  var aiRes = null;
  await fetch('https://api.cohere.com/v1/chat', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
    .then(async response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // aiRes = await response.json();
      // console.log(aiRes)
      // return Response.json(aiRes);
    })
    .then(data => {
      aiRes = data;
      console.log('Response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });

  return `<p class="trans-content">${aiRes?.text}</p>`;
}

// 从命令行参数中获取 newsList.json 文件的路径
const newsListPath = process.argv[2];
translateNews(newsListPath);
