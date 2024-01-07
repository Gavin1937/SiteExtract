module.exports = {
  
  // process html document received from website
  preprocess: async function(doc, options) {
    
    // rm <script> & <style> tags
    doc.querySelectorAll('script').forEach(script => {
      script.remove();
    })
    doc.querySelectorAll('style').forEach(style => {
      style.remove();
    })
    
    // handle options
    if ('no_img' in options && options.no_img === true) {
      doc.querySelectorAll('img').forEach(img => {
        let p = doc.createElement('p');
        p.textContent = `[${img.getAttribute('alt')}]`;
        img.replaceWith(p);
      });
    }
    
    if ('no_link' in options && options.no_link === true) {
      doc.querySelectorAll('a[href]').forEach(a => {
        let p = doc.createElement('p');
        p.textContent = a.textContent;
        a.replaceWith(p);
      });
    }
    
    return doc;
  },
  
  // process markdown string received from website
  postprocess: async function(markdown, options) {
    return markdown + '\n';
  }
  
};