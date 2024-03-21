export async function loader({}) {
  const resp = `# *
User-agent: *
Allow: /
   
# Host
Host: https://www.superbindex.com
    
# Sitemaps
Sitemap: https://www.superbindex.com/sitemap.xml`;
  return new Response(resp, { headers: { "content-type": "text/plain" } });
}
