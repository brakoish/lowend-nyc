/**
 * github.js — GitHub API integration for publishing articles
 * 
 * Commits article files to the lowend-nyc repo, triggering Vercel deploy.
 */

const https = require('https');

class GitHubClient {
  constructor(token, repo, branch = 'main') {
    this.token = token;
    this.repo = repo;
    this.branch = branch;
    this.baseUrl = 'api.github.com';
  }

  /**
   * Make authenticated GitHub API request
   */
  async request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LOWEND-NYC-Pipeline/1.0',
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`GitHub API ${res.statusCode}: ${parsed.message || data}`));
            }
          } catch {
            reject(new Error(`GitHub API parse error: ${data.substring(0, 200)}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /**
   * Get file SHA (needed for updates)
   */
  async getFileSha(filePath) {
    try {
      const result = await this.request('GET',
        `/repos/${this.repo}/contents/${filePath}?ref=${this.branch}`
      );
      return result.sha;
    } catch {
      return null; // File doesn't exist
    }
  }

  /**
   * Create or update a file in the repo
   */
  async commitFile(filePath, content, message) {
    const encodedContent = Buffer.from(content).toString('base64');
    const sha = await this.getFileSha(filePath);

    const body = {
      message: message,
      content: encodedContent,
      branch: this.branch,
    };

    if (sha) {
      body.sha = sha; // Update existing file
    }

    const result = await this.request('PUT',
      `/repos/${this.repo}/contents/${filePath}`,
      body
    );

    console.log(`Committed: ${filePath} (${sha ? 'updated' : 'created'})`);
    return result;
  }

  /**
   * Publish an article by committing its .mdx file
   */
  async publishArticle(slug, content) {
    const filePath = `content/articles/${slug}.mdx`;
    const message = `Publish article: ${slug}`;
    return this.commitFile(filePath, content, message);
  }

  /**
   * Check if article already exists
   */
  async articleExists(slug) {
    const sha = await this.getFileSha(`content/articles/${slug}.mdx`);
    return sha !== null;
  }
}

module.exports = { GitHubClient };
