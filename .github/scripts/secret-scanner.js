#!/usr/bin/env node

/**
 * Secret Scanner - Detects hardcoded secrets in code
 * This script scans for common patterns of sensitive information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Patterns to detect secrets (ordered by severity)
const SECRET_PATTERNS = [
  // MongoDB Connection Strings
  {
    name: 'MongoDB URI',
    pattern: /mongodb(\+srv)?:\/\/[^\s'"]+/gi,
    severity: 'CRITICAL',
    description: 'MongoDB connection string with credentials',
  },
  // Redis Connection Strings
  {
    name: 'Redis URL',
    pattern: /redis:\/\/[^\s'"]+/gi,
    severity: 'CRITICAL',
    description: 'Redis connection string with credentials',
  },
  // Generic Database URLs with credentials
  {
    name: 'Database URL with credentials',
    pattern: /(postgres|mysql|mariadb):\/\/[^:]+:[^@]+@[^\s'"]+/gi,
    severity: 'CRITICAL',
    description: 'Database connection string with username and password',
  },
  // Neo4j
  {
    name: 'Neo4j URI',
    pattern: /neo4j(\+s)?:\/\/[^\s'"]+/gi,
    severity: 'CRITICAL',
    description: 'Neo4j connection string',
  },
  // AWS Keys
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    description: 'AWS Access Key ID',
  },
  {
    name: 'AWS Secret Key',
    pattern: /aws_secret_access_key\s*=\s*["']?[A-Za-z0-9/+=]{40}["']?/gi,
    severity: 'CRITICAL',
    description: 'AWS Secret Access Key',
  },
  // API Keys (generic patterns)
  {
    name: 'Generic API Key',
    pattern: /(api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*["']?[A-Za-z0-9_\-]{20,}["']?/gi,
    severity: 'HIGH',
    description: 'Generic API key pattern',
  },
  // JWT Secrets
  {
    name: 'JWT Secret',
    pattern: /(jwt[_-]?secret|jwt[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-+/=]{32,}["']?/gi,
    severity: 'HIGH',
    description: 'JWT secret key',
  },
  // Cloudinary
  {
    name: 'Cloudinary API Secret',
    pattern: /cloudinary:\/\/[0-9]+:[A-Za-z0-9_\-]+@[a-z0-9\-]+/gi,
    severity: 'HIGH',
    description: 'Cloudinary API credentials',
  },
  // Private Keys
  {
    name: 'Private Key',
    pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'CRITICAL',
    description: 'Private key in PEM format',
  },
  // Email/Password in code
  {
    name: 'Email Password',
    pattern: /(mail[_-]?pass|email[_-]?password|smtp[_-]?password)\s*[:=]\s*["'][^"']{8,}["']/gi,
    severity: 'HIGH',
    description: 'Email/SMTP password',
  },
  // Payment Gateway Keys (PayOS, Stripe, etc.)
  {
    name: 'Payment API Key',
    pattern: /(payos|stripe|payment)[_-]?(api[_-]?key|secret[_-]?key|client[_-]?key)\s*[:=]\s*["'][^"']{20,}["']/gi,
    severity: 'CRITICAL',
    description: 'Payment gateway API key',
  },
  // Generic passwords in code
  {
    name: 'Hardcoded Password',
    pattern: /(password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/gi,
    severity: 'HIGH',
    description: 'Hardcoded password',
  },
];

// Files and directories to exclude from scanning
const EXCLUDED_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'test-results',
  'playwright-report',
  '.env.example',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '.jpg',
  '.png',
  '.gif',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

// Whitelist patterns (false positives)
const WHITELISTED_PATTERNS = [
  /mongodb:\/\/localhost/i,
  /mongodb:\/\/127\.0\.0\.1/i,
  /redis:\/\/localhost/i,
  /redis:\/\/127\.0\.0\.1/i,
  /example\.com/i,
  /your-secret-here/i,
  /change-me/i,
  /todo:.*change/i,
  /\$\{.*\}/g, // Environment variable placeholders
  /process\.env\./g, // Environment variable access
];

class SecretScanner {
  constructor() {
    this.findings = [];
    this.scannedFiles = 0;
  }

  shouldExclude(filePath) {
    return EXCLUDED_PATTERNS.some((pattern) => filePath.includes(pattern));
  }

  isWhitelisted(content) {
    return WHITELISTED_PATTERNS.some((pattern) => pattern.test(content));
  }

  scanFile(filePath) {
    if (this.shouldExclude(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.scannedFiles++;

      SECRET_PATTERNS.forEach((secretPattern) => {
        const matches = content.matchAll(secretPattern.pattern);

        for (const match of matches) {
          const matchedText = match[0];

          // Skip if whitelisted
          if (this.isWhitelisted(matchedText)) {
            continue;
          }

          // Get line number
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;

          // Get the line content
          const lines = content.split('\n');
          const lineContent = lines[lineNumber - 1].trim();

          this.findings.push({
            file: filePath,
            line: lineNumber,
            pattern: secretPattern.name,
            severity: secretPattern.severity,
            description: secretPattern.description,
            matched: matchedText.substring(0, 50) + (matchedText.length > 50 ? '...' : ''),
            lineContent: lineContent.substring(0, 100) + (lineContent.length > 100 ? '...' : ''),
          });
        }
      });
    } catch (error) {
      // Skip files that can't be read
      if (error.code !== 'EISDIR') {
        console.warn(`Warning: Could not scan ${filePath}: ${error.message}`);
      }
    }
  }

  scanDirectory(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      entries.forEach((entry) => {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          this.scanDirectory(fullPath);
        } else {
          this.scanFile(fullPath);
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
    }
  }

  getChangedFiles() {
    try {
      // Get list of changed files in git
      const output = execSync('git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only --cached 2>/dev/null || echo ""', {
        encoding: 'utf8',
      }).trim();

      if (output) {
        return output.split('\n').filter(Boolean);
      }
    } catch (error) {
      console.warn('Warning: Could not get changed files from git, scanning all files...');
    }
    return null;
  }

  printReport() {
    console.log(`\n${colors.bold}${colors.cyan}=================================================`);
    console.log(`🔐 Secret Scanner Report`);
    console.log(`==================================================${colors.reset}\n`);

    console.log(`Files scanned: ${this.scannedFiles}`);
    console.log(`Potential secrets found: ${this.findings.length}\n`);

    if (this.findings.length === 0) {
      console.log(`${colors.green}${colors.bold}✅ No secrets detected!${colors.reset}\n`);
      return true;
    }

    // Group by severity
    const critical = this.findings.filter((f) => f.severity === 'CRITICAL');
    const high = this.findings.filter((f) => f.severity === 'HIGH');

    if (critical.length > 0) {
      console.log(`${colors.red}${colors.bold}🚨 CRITICAL (${critical.length}):${colors.reset}`);
      critical.forEach((finding, index) => {
        console.log(`\n${index + 1}. ${colors.bold}${finding.pattern}${colors.reset}`);
        console.log(`   File: ${finding.file}:${finding.line}`);
        console.log(`   Description: ${finding.description}`);
        console.log(`   Found: ${colors.yellow}${finding.matched}${colors.reset}`);
        console.log(`   Line: ${finding.lineContent}`);
      });
    }

    if (high.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  HIGH (${high.length}):${colors.reset}`);
      high.forEach((finding, index) => {
        console.log(`\n${index + 1}. ${colors.bold}${finding.pattern}${colors.reset}`);
        console.log(`   File: ${finding.file}:${finding.line}`);
        console.log(`   Description: ${finding.description}`);
        console.log(`   Found: ${colors.yellow}${finding.matched}${colors.reset}`);
        console.log(`   Line: ${finding.lineContent}`);
      });
    }

    console.log(`\n${colors.red}${colors.bold}❌ Secret scan failed!${colors.reset}`);
    console.log(`\n${colors.cyan}💡 Recommendations:${colors.reset}`);
    console.log(`   1. Remove hardcoded secrets from code`);
    console.log(`   2. Use environment variables instead`);
    console.log(`   3. Add sensitive files to .gitignore`);
    console.log(`   4. Use a secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)`);
    console.log(`   5. Rotate any exposed credentials immediately\n`);

    return false;
  }

  async run(scanMode = 'changed') {
    console.log(`${colors.cyan}🔍 Starting secret scan...${colors.reset}\n`);

    let filesToScan;

    if (scanMode === 'changed') {
      filesToScan = this.getChangedFiles();
    }

    if (filesToScan && filesToScan.length > 0) {
      console.log(`Scanning ${filesToScan.length} changed files...\n`);
      filesToScan.forEach((file) => {
        if (fs.existsSync(file)) {
          this.scanFile(file);
        }
      });
    } else {
      console.log('Scanning all files...\n');
      this.scanDirectory(process.cwd());
    }

    const passed = this.printReport();
    return passed;
  }
}

// Main execution
(async () => {
  const scanner = new SecretScanner();
  const scanMode = process.argv[2] || 'changed'; // 'changed' or 'all'

  const passed = await scanner.run(scanMode);
  process.exit(passed ? 0 : 1);
})();
