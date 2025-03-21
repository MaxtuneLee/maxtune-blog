#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Get current date and time in ISO format with timezone
const currentDate = new Date().toLocaleString('en-GB', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
}).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/, '$3-$2-$1T$4+08:00');

try {
  // Get list of staged markdown files in the content/blog directory
  const filesOutput = execSync('git diff --cached --name-only --diff-filter=ACMR -- "src/content/blog/*.md"', { encoding: 'utf8' });
  
  // Split output by lines and filter empty lines
  const files = filesOutput.split('\n').filter(file => file.trim());
  
  if (files.length === 0) {
    console.log("No markdown files were modified in src/content/blog/");
    process.exit(0);
  }
  
  for (const file of files) {
    console.log(`Updating modDatetime in ${file}`);
    
    // Read the file content
    const content = fs.readFileSync(file, 'utf8');
    
    // Create a more flexible regex that handles indentation and different spacing
    const modDatetimeRegex = /(^|\n)([ \t]*)modDatetime:[ \t]*[^\n]*/;
    
    if (modDatetimeRegex.test(content)) {
      // Update the modDatetime while preserving any indentation
      const updatedContent = content.replace(
        modDatetimeRegex,
        `$1$2modDatetime: ${currentDate}`
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(file, updatedContent);
      
      // Add the modified file back to the staging area
      execSync(`git add "${file}"`);
      console.log(`✓ Updated modDatetime to ${currentDate} in ${file}`);
    } else {
      console.log(`⚠ Warning: No modDatetime field found in ${file}`);
    }
  }
  
  console.log("✅ Blog post modDatetime update completed successfully");
} catch (error) {
  console.error('❌ Error updating modDatetime:', error.message);
  process.exit(1);
}