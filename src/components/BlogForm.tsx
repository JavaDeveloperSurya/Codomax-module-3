'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { BLOG_CATEGORIES, COVER_THEMES, COVER_THEME_LABELS } from '@/lib/taxonomy';
import type { BlogDTO } from '@/lib/serialize';
import Markdown from './Markdown';

type Props = {
  mode: 'create' | 'edit';
  initial?: BlogDTO;
};

export default function BlogForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [category, setCategory] = useState<string>(initial?.category ?? BLOG_CATEGORIES[0]);
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [coverTheme, setCoverTheme] = useState<string>(initial?.coverTheme ?? 'violet');
  const [published, setPublished] = useState(initial ? initial.published === 'published' : true);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tagList = Array.from(
      new Set(
        tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    ).slice(0, 8);

    const body = {
      title,
      excerpt,
      content,
      category,
      tags: tagList,
      coverTheme,
      published: published ? 'published' : 'draft',
    };

    try {
      const url = mode === 'create' ? '/api/blogs' : `/api/blogs/${initial?.slug}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'Could not save the post.');
        return;
      }
      router.push(`/blog/${json.data.blog.slug}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="editor">
      <div className="editor-main">
        <label className="field">
          <span>Title</span>
          <input
            className="input-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A clear, specific title"
            required
            minLength={3}
            maxLength={140}
          />
          <small>{title.length}/140</small>
        </label>

        <label className="field">
          <span>Excerpt (optional)</span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary shown on the blog feed. If left empty, one is generated from the content."
            rows={2}
            maxLength={300}
          />
          <small>{excerpt.length}/300</small>
        </label>

        <div className="field">
          <div className="field-row">
            <span>Content (Markdown)</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview((v) => !v)}>
              {preview ? 'Write' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div className="preview-box">
              <Markdown content={content || '*Nothing to preview yet.*'} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={'## Start with a heading\n\nWrite your post here. Markdown is supported: **bold**, lists, links, and code blocks.'}
              rows={16}
              required
              minLength={50}
            />
          )}
          <small>{content.trim().split(/\s+/).filter(Boolean).length} words · minimum 50 characters</small>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="editor-actions">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : mode === 'create' ? 'Publish post' : 'Save changes'}
          </button>
          <label className="checkbox">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span>Published (uncheck to save as draft)</span>
          </label>
        </div>
      </div>

      <aside className="editor-side">
        <div className="panel">
          <h3>Post settings</h3>
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Tags (comma separated)</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="nextjs, mongodb, tutorial" />
            <small>Up to 8 tags</small>
          </label>

          <div className="field">
            <span>Cover theme</span>
            <div className="theme-swatches">
              {COVER_THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`swatch cover-${theme} ${coverTheme === theme ? 'swatch-active' : ''}`}
                  onClick={() => setCoverTheme(theme)}
                  aria-label={COVER_THEME_LABELS[theme]}
                  title={COVER_THEME_LABELS[theme]}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="panel panel-soft">
          <h3>Module 3 checklist</h3>
          <ul className="checklist">
            <li>Stored in MongoDB</li>
            <li>Author linked to your account</li>
            <li>Validated with Zod</li>
            <li>Rendered on feed + detail page</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
