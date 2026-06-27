import axios from 'axios';
import * as cheerio from 'cheerio';

export const fetchMetadata = async (url: string) => {
  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);

    const title = $('title').text() || $('meta[property="og:title"]').attr('content');
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content');
    
    // Attempt to get favicon
    let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = `${urlObj.origin}${favicon.startsWith('/') ? '' : '/'}${favicon}`;
    }

    return { title, description, favicon };
  } catch (err) {
    return { title: null, description: null, favicon: null };
  }
};