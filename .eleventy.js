const moment = require('moment');
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');
 
moment.locale('zh-cn');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('css')
  eleventyConfig.addPassthroughCopy('js')
  eleventyConfig.addPassthroughCopy('images')
  eleventyConfig.addPassthroughCopy('admin')
  eleventyConfig.addPassthroughCopy('_email_templates')
  eleventyConfig.addPlugin(lazyImagesPlugin)

  //add date filter
  eleventyConfig.addFilter('dateIso', date => {
    return moment(date).toISOString();
  });
 
  eleventyConfig.addFilter('dateReadable', date => {
    return moment(date).format("YYYY年M月D日 Ah点mm分");  
  });

  return {
    passthroughFileCopy: true
  }
}