const moment = require('moment');
 
moment.locale('zh-cn');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('css')
  eleventyConfig.addPassthroughCopy('js')
  eleventyConfig.addPassthroughCopy('images')
  eleventyConfig.addPassthroughCopy('admin')
  eleventyConfig.addPassthroughCopy('_email_templates')

  //add date filter
  eleventyConfig.addFilter('dateIso', date => {
    return moment(date).toISOString();
  });
 
  eleventyConfig.addFilter('dateReadable', date => {
    return moment(date).format('LLLL');
  });

  return {
    passthroughFileCopy: true
  }
}