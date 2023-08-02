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

const shouldNotIntercept = navigationEvent => {
  // 参考: https://developer.chrome.com/docs/web-platform/navigation-api/#deciding-how-to-handle-a-navigation
  return (
    !navigationEvent.canIntercept ||
    navigationEvent.hashChange ||
    navigationEvent.downloadRequest ||
    navigationEvent.formData
  );
};
navigation.addEventListener('navigate', e => {
  if (shouldNotIntercept(e)) return;
  const url = new URL(e.destination.url);
  const loadNextPage = async () => {
    const htmlString = await getHTML(url.href);
    const parsedHTML = parseHTML(htmlString);
    await swap(parsedHTML);
    document.title = parsedHTML.title;
  };
  e.intercept({ handler: loadNextPage });
});
navigation.addEventListener('navigatesuccess', e => {
  console.log(e);
});
navigation.addEventListener('navigateerror', e => {
  console.error(e);
});
