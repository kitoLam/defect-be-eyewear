#!/usr/bin/env node

/**
 * AI-Powered Secret Scanner - Detects hardcoded secrets in code using Claude AI
 * This script uses Claude AI for intelligent secret detection with minimal false positives
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
  '.env.template',
  // DO scan .env files because they shouldn't be in git!
  // If .env is properly gitignored, the scanner won't see it
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
    this.aiClient = null;
    this.initializeAI();
  }

  initializeAI() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn(`${colors.yellow}⚠️  Warning: ANTHROPIC_API_KEY not found. Falling back to regex-only mode.${colors.reset}\n`);
      return;
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      this.aiClient = new Anthropic({ apiKey });
    } catch (error) {
      console.warn(`${colors.yellow}⚠️  Warning: @anthropic-ai/sdk not installed. Falling back to regex-only mode.${colors.reset}`);
      console.warn(`${colors.yellow}   Run: npm install @anthropic-ai/sdk${colors.reset}\n`);
    }
  }

  shouldExclude(filePath) {
    return EXCLUDED_PATTERNS.some((pattern) => filePath.includes(pattern));
  }

  isWhitelisted(content) {
    return WHITELISTED_PATTERNS.some((pattern) => pattern.test(content));
  }

  async analyzeWithAI(fileContent, filePath) {
    if (!this.aiClient) {
      // Fallback to regex patterns if AI not available
      return this.regexScan(fileContent, filePath);
    }

    try {
      const prompt = `You are a security expert analyzing code for hardcoded secrets and sensitive information.

Analyze the following code file and identify ANY hardcoded secrets, API keys, passwords, or sensitive credentials.

File: ${filePath}

\`\`\`
${fileContent}
\`\`\`

CRITICAL INSTRUCTIONS:
1. Look for REAL secrets that could cause security breaches if exposed
2. IGNORE false positives like:
   - Environment variable placeholders (process.env.X, $\{VAR})
   - Localhost/127.0.0.1 connections
   - Example/placeholder values
   - Test data with obvious fake values
   - Variable names themselves (without actual values)
3. Flag these as CRITICAL:
   - Real API keys (AWS, payment gateways, cloud services)
   - Real database credentials with passwords
   - Private keys
   - Real JWT secrets with actual values
4. Consider context: Is this test data or production code?

Respond in JSON format ONLY:
{
  "hasSecrets": true/false,
  "findings": [
    {
      "type": "MongoDB URI",
      "severity": "CRITICAL",
      "line": 42,
      "description": "MongoDB connection string with embedded credentials",
      "value": "mongodb+srv://user:password@...",
      "recommendation": "Move to environment variable MONGODB_URI"
    }
  ]
}

If NO real secrets found, return: {"hasSecrets": false, "findings": []}`;

      const message = await this.aiClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: 0,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].text;
      const result = JSON.parse(responseText);

      return result;
    } catch (error) {
      console.warn(`${colors.yellow}⚠️  AI analysis failed for ${filePath}: ${error.message}${colors.reset}`);
      console.warn(`${colors.yellow}   Falling back to regex-based scanning...${colors.reset}`);
      return this.regexScan(fileContent, filePath);
    }
  }

  regexScan(content, filePath) {
    const findings = [];

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

        findings.push({
          type: secretPattern.name,
          severity: secretPattern.severity,
          line: lineNumber,
          description: secretPattern.description,
          value: matchedText.substring(0, 50) + (matchedText.length > 50 ? '...' : ''),
          recommendation: 'Move to environment variable'
        });
      }
    });

    return {
      hasSecrets: findings.length > 0,
      findings
    };
  }

  async scanFile(filePath) {
    if (this.shouldExclude(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.scannedFiles++;

      // Use AI for intelligent analysis
      const result = await this.analyzeWithAI(content, filePath);

      if (result.hasSecrets && result.findings.length > 0) {
        result.findings.forEach(finding => {
          this.findings.push({
            file: filePath,
            ...finding
          });
        });
      }
    } catch (error) {
      // Skip files that can't be read
      if (error.code !== 'EISDIR') {
        console.warn(`Warning: Could not scan ${filePath}: ${error.message}`);
      }
    }
  }

  async scanDirectory(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else {
          await this.scanFile(fullPath);
        }
      }
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
    console.log(`🔐 AI-Powered Secret Scanner Report`);
    console.log(`==================================================${colors.reset}\n`);

    console.log(`Files scanned: ${this.scannedFiles}`);
    console.log(`AI Engine: ${this.aiClient ? `${colors.green}✓ Claude 3.5 Sonnet${colors.reset}` : `${colors.yellow}✗ Regex fallback${colors.reset}`}`);
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
        console.log(`\n${index + 1}. ${colors.bold}${finding.type}${colors.reset}`);
        console.log(`   File: ${finding.file}:${finding.line}`);
        console.log(`   Description: ${finding.description}`);
        console.log(`   Found: ${colors.yellow}${finding.value}${colors.reset}`);
        if (finding.recommendation) {
          console.log(`   ${colors.cyan}💡 Fix: ${finding.recommendation}${colors.reset}`);
        }
      });
    }

    if (high.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  HIGH (${high.length}):${colors.reset}`);
      high.forEach((finding, index) => {
        console.log(`\n${index + 1}. ${colors.bold}${finding.type}${colors.reset}`);
        console.log(`   File: ${finding.file}:${finding.line}`);
        console.log(`   Description: ${finding.description}`);
        console.log(`   Found: ${colors.yellow}${finding.value}${colors.reset}`);
        if (finding.recommendation) {
          console.log(`   ${colors.cyan}💡 Fix: ${finding.recommendation}${colors.reset}`);
        }
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
    console.log(`${colors.cyan}🔍 Starting AI-powered secret scan...${colors.reset}\n`);

    let filesToScan;

    if (scanMode === 'changed') {
      filesToScan = this.getChangedFiles();
    }

    if (filesToScan && filesToScan.length > 0) {
      console.log(`Scanning ${filesToScan.length} changed files...\n`);
      for (const file of filesToScan) {
        if (fs.existsSync(file)) {
          await this.scanFile(file);
        }
      }
    } else {
      console.log('Scanning all files...\n');
      await this.scanDirectory(process.cwd());
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
