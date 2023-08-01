import 'destyle.css';
import '../css/style.css';

const getHTML = async href => {
  return fetch(href).then(res => res.text());
};
const parser = new DOMParser();
const parseHTML = html => {
  return parser.parseFromString(html, 'text/html');
};
const swap = async toHtml => {
  return document.startViewTransition(() => {
    const to = toHtml.querySelector('*[data-transition-wrapper]');
    const from = document.querySelector('*[data-transition-wrapper]');
    from.replaceWith(to);
  }).finished;
};

const init = () => {
  document.addEventListener('click', async e => {
    e.preventDefault();
    let linkElement = e.target;
    if (linkElement instanceof HTMLElement && linkElement.tagName !== 'A') {
      linkElement = linkElement.closest('a');
    }
    if (linkElement) {
      const htmlString = await getHTML(linkElement.href);
      const parsedHTML = parseHTML(htmlString);
      await swap(parsedHTML);
      history.pushState({}, '', linkElement.href);
    }
  });
};

const handlePopState = async e => {
  const { target } = e;
  const htmlString = await getHTML(target.location.href);
  const parsedHTML = parseHTML(htmlString);
  await swap(parsedHTML);
};

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('popstate', handlePopState);
