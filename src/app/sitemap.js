export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  let projectRoutes = [];
  try {
    const res = await fetch(`${apiUrl}/public/sitemap`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        projectRoutes = data.data.map((proj) => ({
          url: `${baseUrl}/projects/${proj.slug}`,
          lastModified: proj.updatedAt || new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8
        }));
      }
    }
  } catch {
    // Graceful fallback if backend is offline during build
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    ...projectRoutes
  ];
}
