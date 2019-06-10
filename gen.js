'use strict'
const fs = require('fs');

let template,
    numImg;

console.log('starting generator...');

console.log('reading template...')
fs.readFile('input/template-page.html', 'utf8', function(err, contents) {
  if (err) throw err
  template = contents;
  console.log('loading image list...');
  fs.readFile('input/images.json', 'utf8', function(err, images) {
    if (err) throw err;
    images = JSON.parse(images);

    //set last page buttons
    numImg = images.length;
    template = insertContent(template, '<!-- LATEST -->', `${numImg}.html`);

    //write individual pages
    console.log('parsing images...')
    images.forEach(function(img) {
      let imgPos = images.indexOf(img) + 1;
      fs.writeFileSync(`output/${imgPos}.html`, writePage(img, imgPos));
      console.log(`created page ${imgPos} of ${images.length}`);
      fs.copyFileSync(`input/img/${img.img}`, `output/img/${img.img}`);
      console.log(`copied over image ${imgPos} of ${images.length}`);
    });

    //copy over the stylesheet
    fs.copyFile('input/style.css', 'output/style.css', function(err) {
      if (err) throw err;
      console.log('copied over stylesheet');
    });
  });
});

function writePage(img, index) {
  let page = template;
  //insert title and image
  page = insertContent(page, '<!-- TITLE -->', img.title);
  page = insertContent(page, '<!-- IMG -->', `<img src="img/${img.img}">`);
  //set previous button
  let prevPage = index === 1 ? '1.html' : `${index - 1}.html`;
  page = insertContent(page, '<!-- PREVIOUS -->', prevPage);
  //set next button
  let nextPage = index === numImg ? `${index}.html` : `${index + 1}.html`;
  page = insertContent(page, '<!-- NEXT -->', nextPage);
  //check for desc and render if present
  if (img.desc) {
    page = insertContent(page, '<!-- DESC -->', img.desc);
  }
  return page;
}

function insertContent(page, breakpoint, content) {
  page = page.split(breakpoint);
  return page[0] + content + page[1];
}
