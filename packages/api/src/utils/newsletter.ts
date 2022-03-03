import { Readability } from '@omnivore/readability';
import { DOMWindow } from 'jsdom'


// Attempt to determine if an HTML blob is a newsletter
// based on it's contents. 
export const isProbablyNewsletter = (dom: DOMWindow): boolean => {
  const article = new Readability(document, {
    debug: false,
    keepTables: true,
  }).parse()

  if (!article || !article.content) {
    return false
  }

  // Maybe it is a substack newsletter
  const body =  dom.document.querySelector('.email-body-container')
  if (body?.querySelector('.post-meta') || body?.querySelector('.post-cta')) {
    return true
  }

  return false
};

