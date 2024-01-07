// a turndown plugin to keep <details> tag from html
// after convert to markdown
function keepDetails(turndownService) {
  turndownService.addRule('keepDetails', {
    // filter <details>
    filter: function (node) {
      return (node.nodeName === 'DETAILS');
    },
    replacement: function (content, node, options) {
      // get <summary> node & remove its color
      let summary = node.querySelector('summary');
      if (summary !== null && summary !== undefined) {
        summary.querySelectorAll('[style*="color"]').forEach(i => {i.style.removeProperty('color');});
        summary = `<summary>${summary.innerHTML}</summary>`;
      } else {
        summary = '';
      }
      node.querySelector('summary').remove()
      
      // turn rest of contents inside <details> into markdown
      let details = node.innerHTML;
      let child_markdown = turndownService.turndown(details);
      
      // compose final html+markdown string
      return (`<details>\n${summary}\n\n${child_markdown}\n\n</details>`);
    }
  })
}

module.exports = keepDetails;