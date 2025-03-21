#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Format the current date to ISO string format
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().replace(/\.\d{3}Z$/, '+08:00');
};

// Convert title to kebab-case for filename
const titleToFilename = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Generate frontmatter for the blog post
const generateFrontmatter = (title) => {
  const currentDate = getCurrentDate();
  
  return `---
title: "${title}"
pubDatetime: ${currentDate}
modDatetime: ${currentDate}
categories:
  - ""
tags:
  - ""
description: ""
draft: true
---

`;
};

// Main function to create a new blog post
const createNewBlogPost = (title) => {
  const filename = titleToFilename(title);
  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const filePath = path.join(blogDir, `${filename}.md`);
  
  // Ensure the blog directory exists
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.error(`Error: A blog post with the filename "${filename}.md" already exists.`);
    process.exit(1);
  }
  
  // Create the file with frontmatter
  fs.writeFileSync(filePath, generateFrontmatter(title));
  
  console.log(`✅ Blog post created successfully: ${filePath}`);
};

// Prompt the user for the title
rl.question('Enter blog post title: ', (title) => {
  if (!title.trim()) {
    console.error('Error: Title cannot be empty.');
    process.exit(1);
  }
  
  createNewBlogPost(title);
  rl.close();
});