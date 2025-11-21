module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow detailed commit messages (ignore body length)
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
    // Allow longer subject lines for detailed commits
    'subject-max-length': [2, 'always', 200],
    // Still enforce conventional commit types
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
  },
}
