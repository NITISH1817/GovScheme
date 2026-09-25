const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [target, replacement] of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
    } else {
      console.warn('Could not find target:', target);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile('src/components/SchemeModal.tsx', [
  [
    `{scheme.category}`,
    `{t(scheme.category, scheme.category)}`
  ],
  [
    `{scheme.ministry} • {scheme.department}`,
    `{t(scheme.ministry, scheme.ministry)} • {scheme.department ? t(scheme.department, scheme.department) : ''}`
  ],
  [
    `{scheme.benefitsSummary}`,
    `{t(\`\${scheme.id}_benefits\`, scheme.benefitsSummary)}`
  ],
  [
    `<strong>{scheme.deadline}</strong>`,
    `<strong>{t(scheme.deadline, scheme.deadline)}</strong>`
  ],
  [
    `<strong>{scheme.state}</strong>`,
    `<strong>{t(scheme.state, scheme.state)}</strong>`
  ],
  [
    `{t('q_question', 'Q')}: {faq.question}`,
    `{t('q_question', 'Q')}: {t(faq.question, faq.question)}`
  ],
  [
    `<p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>`,
    `<p className="text-slate-600 dark:text-slate-400">{t(faq.answer, faq.answer)}</p>`
  ]
]);

console.log('Fixed SchemeModal.tsx!');
