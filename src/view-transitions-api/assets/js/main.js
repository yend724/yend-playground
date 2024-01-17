const cssCache = new Map();

const links = document.querySelectorAll('link');
links.forEach(link => {
  cssCache.set(new URL(link.href).pathname, link);
});

const createLink = url => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  return link;
};
const setCssCache = url => {
  if (!cssCache.has(url)) {
    const link = createLink(url);
    cssCache.set(url, link);
    return link;
  }
  return null;
};
const insertCSS = pathname => {
  if (pathname === '/view-transitions-api/') {
    return setCssCache('/view-transitions-api/assets/css/index.css');
  }
  if (pathname.startsWith('/view-transitions-api/detail/')) {
    return setCssCache('/view-transitions-api/assets/css/detail.css');
  }
};

const parser = new DOMParser();
const parseHTML = html => {
  return parser.parseFromString(html, 'text/html');
};
const getHTML = async url => {
  return fetch(url).then(res => res.text());
};
const swap = async toHtml => {
  return document.startViewTransition(() => {
    const to = toHtml.querySelector('*[data-transition-wrapper]');
    const from = document.querySelector('*[data-transition-wrapper]');
    from.replaceWith(to);
  }).updateCallbackDone;
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
  const pathname = url.pathname;

  const loadNextPage = async () => {
    const htmlString = await getHTML(url.href);
    const parsedHTML = parseHTML(htmlString);

    const linkElement = insertCSS(pathname);
    if (linkElement) {
      linkElement.addEventListener('load', async () => {
        await swap(parsedHTML);
        document.title = parsedHTML.title;
      });
      return;
    }

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
