// server.js - Code Manipulation API
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

// ============================================
// READ CODE
// ============================================

/**
 * Read file content
 * GET /api/code/read?path=D:/project/file.js
 */
app.get('/api/code/read', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'path parameter required' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    res.json({
      success: true,
      content: content,
      lines: lines,
      lineCount: lines.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to read file',
      details: error.message 
    });
  }
});

// ============================================
// WRITE CODE
// ============================================

/**
 * Write/Create file with content
 * POST /api/code/write
 * Body: { "path": "D:/project/file.js", "content": "code here" }
 */
app.post('/api/code/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ 
        error: 'path and content required' 
      });
    }

    // Create directory if needed
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write the file
    await fs.writeFile(filePath, content, 'utf-8');

    res.json({
      success: true,
      message: 'File written successfully',
      path: filePath,
      size: content.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to write file',
      details: error.message 
    });
  }
});

// ============================================
// INSERT CODE
// ============================================

/**
 * Insert code at specific line
 * POST /api/code/insert
 * Body: { "path": "D:/file.js", "line": 5, "code": "console.log('new');" }
 */
app.post('/api/code/insert', async (req, res) => {
  try {
    const { path: filePath, line, code } = req.body;
    
    if (!filePath || line === undefined || code === undefined) {
      return res.status(400).json({ 
        error: 'path, line, and code required' 
      });
    }

    // Read existing content
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Insert the new code
    lines.splice(line, 0, code);

    // Write back
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');

    res.json({
      success: true,
      message: `Code inserted at line ${line}`,
      newLineCount: lines.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to insert code',
      details: error.message 
    });
  }
});

// ============================================
// REPLACE CODE
// ============================================

/**
 * Replace specific lines
 * POST /api/code/replace
 * Body: { 
 *   "path": "D:/file.js", 
 *   "startLine": 5, 
 *   "endLine": 7, 
 *   "code": "new code" 
 * }
 */
app.post('/api/code/replace', async (req, res) => {
  try {
    const { path: filePath, startLine, endLine, code } = req.body;
    
    if (!filePath || startLine === undefined || endLine === undefined || code === undefined) {
      return res.status(400).json({ 
        error: 'path, startLine, endLine, and code required' 
      });
    }

    // Read existing content
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Replace lines
    const codeLines = code.split('\n');
    lines.splice(startLine, endLine - startLine + 1, ...codeLines);

    // Write back
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');

    res.json({
      success: true,
      message: `Lines ${startLine}-${endLine} replaced`,
      newLineCount: lines.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to replace code',
      details: error.message 
    });
  }
});

// ============================================
// DELETE CODE
// ============================================

/**
 * Delete specific lines
 * POST /api/code/delete
 * Body: { "path": "D:/file.js", "startLine": 5, "endLine": 7 }
 */
app.post('/api/code/delete', async (req, res) => {
  try {
    const { path: filePath, startLine, endLine } = req.body;
    
    if (!filePath || startLine === undefined || endLine === undefined) {
      return res.status(400).json({ 
        error: 'path, startLine, and endLine required' 
      });
    }

    // Read existing content
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Delete lines
    lines.splice(startLine, endLine - startLine + 1);

    // Write back
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');

    res.json({
      success: true,
      message: `Lines ${startLine}-${endLine} deleted`,
      newLineCount: lines.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete lines',
      details: error.message 
    });
  }
});

// ============================================
// APPEND CODE
// ============================================

/**
 * Append code to end of file
 * POST /api/code/append
 * Body: { "path": "D:/file.js", "code": "console.log('end');" }
 */
app.post('/api/code/append', async (req, res) => {
  try {
    const { path: filePath, code } = req.body;
    
    if (!filePath || code === undefined) {
      return res.status(400).json({ 
        error: 'path and code required' 
      });
    }

    // Append to file
    await fs.appendFile(filePath, '\n' + code, 'utf-8');

    // Get updated content
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    res.json({
      success: true,
      message: 'Code appended successfully',
      newLineCount: lines.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to append code',
      details: error.message 
    });
  }
});

// ============================================
// FIND & REPLACE
// ============================================

/**
 * Find and replace text in file
 * POST /api/code/find-replace
 * Body: { 
 *   "path": "D:/file.js", 
 *   "find": "oldText", 
 *   "replace": "newText",
 *   "all": true 
 * }
 */
app.post('/api/code/find-replace', async (req, res) => {
  try {
    const { path: filePath, find, replace, all = true } = req.body;
    
    if (!filePath || find === undefined || replace === undefined) {
      return res.status(400).json({ 
        error: 'path, find, and replace required' 
      });
    }

    // Read existing content
    let content = await fs.readFile(filePath, 'utf-8');

    // Replace
    let count = 0;
    if (all) {
      // Replace all occurrences
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      count = matches ? matches.length : 0;
      content = content.replace(regex, replace);
    } else {
      // Replace first occurrence
      if (content.includes(find)) {
        content = content.replace(find, replace);
        count = 1;
      }
    }

    // Write back
    await fs.writeFile(filePath, content, 'utf-8');

    res.json({
      success: true,
      message: `Replaced ${count} occurrence(s)`,
      replacements: count
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to find and replace',
      details: error.message 
    });
  }
});

// ============================================
// UTILITY
// ============================================

/**
 * Check if file exists
 * GET /api/code/exists?path=D:/file.js
 */
app.get('/api/code/exists', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'path parameter required' });
    }

    try {
      await fs.access(filePath);
      res.json({ success: true, exists: true });
    } catch {
      res.json({ success: true, exists: false });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to check file',
      details: error.message 
    });
  }
});

/**
 * Delete file
 * DELETE /api/code/delete-file
 * Body: { "path": "D:/file.js" }
 */
app.delete('/api/code/delete-file', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'path required' });
    }

    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete file',
      details: error.message 
    });
  }
});

// ============================================
// CLI EXECUTION - SIMPLE & GENERAL
// ============================================

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Execute ANY CLI command
 * POST /api/cli
 * Body: { 
 *   "command": "git push origin main",
 *   "cwd": "D:/DESKTOP/intern/subspace/subspace-intern/backend/vscode-expressapi"
 * }
 */
app.post('/api/cli', async (req, res) => {
  try {
    const { command, cwd } = req.body;
    
    if (!command) {
      return res.status(400).json({ 
        error: 'command is required',
        example: {
          "command": "git status",
          "cwd": "D:/your/project/path"
        }
      });
    }

    const options = {
      cwd: cwd || process.cwd(),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large outputs
    };

    console.log(`Executing: ${command}`);
    console.log(`Directory: ${options.cwd}`);

    const { stdout, stderr } = await execPromise(command, options);

    res.json({
      success: true,
      command: command,
      output: stdout,
      error: stderr || null,
      cwd: options.cwd
    });

  } catch (error) {
    // Even if command fails, we still return output
    res.json({ 
      success: false,
      command: req.body.command,
      output: error.stdout || '',
      error: error.stderr || error.message,
      cwd: req.body.cwd || process.cwd(),
      exitCode: error.code
    });
  }
});

//

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  Code Manipulation API                    ║
║  http://localhost:${PORT}                    ║
║  No editor needed - Pure code control!    ║
╚═══════════════════════════════════════════╝

📝 Available endpoints:
   - Read code
   - Write code
   - Insert lines
   - Replace lines
   - Delete lines
   - Append code
   - Find & replace
   
Ready to manipulate your code! 🚀
  `);
});