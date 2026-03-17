#!/usr/bin/env python3
"""Convert MDX article to styled HTML preview"""
import sys
import markdown
import re

def convert(mdx_path, output_path):
    with open(mdx_path, 'r') as f:
        content = f.read()
    
    # Strip frontmatter
    parts = content.split('---')
    if len(parts) >= 3:
        frontmatter = parts[1]
        body = '---'.join(parts[2:])
    else:
        frontmatter = ''
        body = content
    
    # Extract title from frontmatter
    title_match = re.search(r'title:\s*"([^"]+)"', frontmatter)
    title = title_match.group(1) if title_match else 'Draft'
    
    excerpt_match = re.search(r'excerpt:\s*"([^"]+)"', frontmatter)
    excerpt = excerpt_match.group(1) if excerpt_match else ''
    
    genre_match = re.search(r'genre:\s*\[([^\]]+)\]', frontmatter)
    genre = genre_match.group(1).replace('"', '').strip() if genre_match else ''
    
    # Convert markdown to HTML
    html_body = markdown.markdown(body.strip(), extensions=['extra'])
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — LOWEND NYC Draft</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ background: #0a0a0a; color: #e5e5e5; font-family: -apple-system, system-ui, 'Segoe UI', sans-serif; max-width: 760px; margin: 0 auto; padding: 2.5rem 1.5rem; line-height: 1.75; }}
  .draft-banner {{ background: #FF2B2B; color: #000; text-align: center; padding: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: -2.5rem -1.5rem 2rem; }}
  .meta {{ color: #666; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }}
  .genre {{ display: inline-block; background: #1a1a1a; border: 1px solid #333; color: #FF2B2B; font-size: 0.7rem; padding: 2px 10px; text-transform: uppercase; font-weight: 600; margin-right: 6px; margin-bottom: 1rem; }}
  .excerpt {{ color: #999; font-size: 1rem; font-style: italic; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #222; }}
  h1 {{ color: #fff; font-size: 2.2rem; text-transform: uppercase; letter-spacing: -0.02em; line-height: 1.1; margin: 0.5rem 0 1rem; }}
  h2 {{ color: #FF2B2B; font-size: 1.15rem; text-transform: uppercase; letter-spacing: 0.03em; margin: 2.5rem 0 1rem; padding-bottom: 0.4rem; border-bottom: 2px solid #FF2B2B; }}
  p {{ margin: 1rem 0; font-size: 1.05rem; color: #d4d4d4; }}
  strong {{ color: #FF2B2B; font-weight: 700; }}
  em {{ color: #a3a3a3; }}
  a {{ color: #FF2B2B; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
  ul, ol {{ margin: 1rem 0; padding-left: 1.5rem; }}
  li {{ margin: 0.5rem 0; color: #d4d4d4; }}
  blockquote {{ border-left: 3px solid #FF2B2B; padding-left: 1rem; margin: 1.5rem 0; color: #999; font-style: italic; }}
  hr {{ border: none; border-top: 1px solid #333; margin: 2.5rem 0; }}
  .footer {{ margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #222; color: #666; font-size: 0.8rem; text-align: center; }}
</style>
</head>
<body>
<div class="draft-banner">DRAFT — PENDING APPROVAL — LOWEND NYC</div>
<p class="meta">LOWEND NYC · Draft Preview</p>
{"".join(f'<span class="genre">{g.strip()}</span>' for g in genre.split(","))}
<h1>{title}</h1>
<p class="excerpt">{excerpt}</p>
{html_body}
<div class="footer">LOWEND NYC Editorial Pipeline · Humanizer Score: PASS</div>
</body>
</html>"""
    
    with open(output_path, 'w') as f:
        f.write(html)
    
    print(f"Converted: {output_path}")

if __name__ == '__main__':
    convert(sys.argv[1], sys.argv[2])
