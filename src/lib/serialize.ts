export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
};

export type BlogDTO = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverTheme: string;
  published: 'draft' | 'published';
  author: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  readingTime: number;
};

export function toUserDTO(user: any): UserDTO {
  return {
    id: String(user._id ?? user.id),
    name: user.name,
    email: user.email,
    role: user.role ?? 'user',
    createdAt: new Date(user.createdAt ?? Date.now()).toISOString(),
  };
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function toBlogDTO(blog: any): BlogDTO {
  const populatedAuthor =
    blog.author && typeof blog.author === 'object' && 'name' in blog.author
      ? blog.author
      : null;

  return {
    id: String(blog._id ?? blog.id),
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    category: blog.category ?? 'Web Development',
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    coverTheme: blog.coverTheme ?? 'violet',
    published: blog.published === 'draft' ? 'draft' : 'published',
    author: populatedAuthor
      ? { id: String(populatedAuthor._id ?? populatedAuthor.id), name: populatedAuthor.name }
      : { id: String(blog.author), name: 'Codomax Author' },
    createdAt: new Date(blog.createdAt ?? Date.now()).toISOString(),
    updatedAt: new Date(blog.updatedAt ?? blog.createdAt ?? Date.now()).toISOString(),
    readingTime: readingTime(blog.content ?? ''),
  };
}

export function makeExcerpt(content: string, max = 220): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-[\]()!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
