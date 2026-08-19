module.exports = (content, vars) => {
  for (const key in vars) {
    content = content.replace(new RegExp('process.env.' + key, 'g'), process.env[key]);
  }
  return content;
};
