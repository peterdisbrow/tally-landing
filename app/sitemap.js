import { BLOG_POSTS } from '../lib/blog';

export default function sitemap() {
  const baseUrl = 'https://tallyconnect.app';

  const staticPages = [
    { url: baseUrl,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${baseUrl}/es`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/signup`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/es/signup`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/hardware`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${baseUrl}/help`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/terms`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${baseUrl}/privacy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    // /portal is intentionally excluded — it redirects to an external domain
    // and wastes crawl budget without surfacing indexable content
  ];

  const blogPages = BLOG_POSTS.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
