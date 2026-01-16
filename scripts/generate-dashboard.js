const fs = require('fs');
const path = require('path');

const previewsDir = path.join(process.cwd(), 'previews');
const outputFile = path.join(previewsDir, 'index.html');

// Create previews directory if it doesn't exist (e.g. first run)
if (!fs.existsSync(previewsDir)) {
  fs.mkdirSync(previewsDir);
}

// Get list of directories in previews
const getDirectories = (source) =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

let branches = [];
try {
  branches = getDirectories(previewsDir);
} catch (error) {
  console.log('No previews found or directory does not exist yet.');
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Branch Previews - Candidate Schedule</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 10px 0; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; transition: transform 0.2s; }
        li:hover { transform: translateX(5px); border-color: #adb5bd; }
        a { display: block; padding: 15px; text-decoration: none; color: #0d6efd; font-weight: 500; }
        a:hover { color: #0a58ca; }
        .empty { font-style: italic; color: #6c757d; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #6c757d; text-decoration: none; font-size: 0.9em; }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <a href="/candidate-schedule/" class="back-link">← Back to Main App</a>
    <h1>Branch Previews</h1>
    ${branches.length === 0
      ? '<p class="empty">No active previews found.</p>'
      : `<ul>${branches.map(branch => `<li><a href="./${branch}/">${branch}</a></li>`).join('')}</ul>`
    }
    <p style="margin-top: 40px; font-size: 0.8em; color: #999;">Generated at ${new Date().toISOString()}</p>
</body>
</html>`;

fs.writeFileSync(outputFile, htmlContent);
console.log(`Dashboard generated at ${outputFile} with ${branches.length} branches.`);
