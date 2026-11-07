import fs from 'fs';
import path from 'path';
import assert from 'assert';

const root = process.cwd();

// 1. Verify AGENTS.md & 5 required Skills exist
const requiredFiles = [
  'AGENTS.md',
  '.agents/rules/hcmute-brand-guard.md',
  '.agents/rules/code-standards.md',
  '.agents/skills/hcmute-terminology/SKILL.md',
  '.agents/skills/hcmute-ui-system/SKILL.md',
  '.agents/skills/vtvl-excel-engine/SKILL.md',
  '.agents/skills/vtvl-audit-engine/SKILL.md',
  '.agents/skills/quality-assurance/SKILL.md',
  'public/mau/manifest.json'
];

for (const rel of requiredFiles) {
  const full = path.join(root, rel);
  assert.ok(fs.existsSync(full), `Missing required file: ${rel}`);
}

// 2. Verify each SKILL.md contains A, B, C, D sections
const skillDirs = [
  'hcmute-terminology',
  'hcmute-ui-system',
  'vtvl-excel-engine',
  'vtvl-audit-engine',
  'quality-assurance'
];

for (const dir of skillDirs) {
  const content = fs.readFileSync(path.join(root, '.agents/skills', dir, 'SKILL.md'), 'utf8');
  assert.ok(content.includes('## A. Thông tin Skill'), `${dir} missing section A`);
  assert.ok(content.includes('## B. Quy trình thực hiện'), `${dir} missing section B`);
  assert.ok(content.includes('## C. Quy tắc kiểm tra'), `${dir} missing section C`);
  assert.ok(content.includes('## D. Giới hạn'), `${dir} missing section D`);
}

console.log('PASS: All HCM-UTE VTVL 360 skills, rules, and templates verified.');

