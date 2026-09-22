// Fetches public repos tagged with a topic at build time, so project cards
// cost nothing at runtime. Fails soft: offline or rate-limited builds just
// skip the GitHub cards instead of breaking.
import type { Project } from './data';

interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  archived: boolean;
  topics?: string[];
}

function humanize(name: string): string {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getShowcaseRepos(user: string, topic: string): Promise<Project[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': `${user}-website-build`,
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`, {
      headers,
    });
    if (!res.ok) {
      console.warn(`[github] ${res.status} ${res.statusText} — skipping GitHub projects`);
      return [];
    }
    const repos = (await res.json()) as Repo[];
    return repos
      .filter((r) => !r.fork && !r.archived && r.topics?.includes(topic))
      .map((r) => ({
        title: humanize(r.name),
        description: r.description ?? '',
        tag: r.topics?.find((t) => t !== topic)?.replace(/-/g, ' '),
        code: r.html_url,
        image: undefined,
        video: undefined,
        external: true,
      }));
  } catch (err) {
    console.warn(`[github] ${(err as Error).message} — skipping GitHub projects`);
    return [];
  }
}
