/**
 * notify.js — Discord notifications for the editorial pipeline
 */

const https = require('https');

class Notifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send a Discord webhook message
   */
  async send(content, embeds = []) {
    if (!this.webhookUrl) {
      console.log(`[NOTIFY] ${content}`);
      return;
    }

    const url = new URL(this.webhookUrl);
    const body = JSON.stringify({
      username: 'LOWEND NYC Pipeline',
      avatar_url: 'https://lowend-nyc.vercel.app/favicon-32x32.png',
      content,
      embeds,
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  // ─── Notification Types ───

  async newTopic(topic, angle, row) {
    await this.send(null, [{
      title: '📝 New Topic Added',
      description: `**${topic}**\nAngle: ${angle}`,
      color: 0xFF2B2B,
      fields: [
        { name: 'Row', value: `#${row}`, inline: true },
        { name: 'Action', value: 'Approve or deny in Google Sheet', inline: true },
      ],
      timestamp: new Date().toISOString(),
    }]);
  }

  async topicApproved(topic, writer) {
    await this.send(null, [{
      title: '✅ Topic Approved',
      description: `**${topic}**\nAssigned to: ${writer}`,
      color: 0x00CC00,
      timestamp: new Date().toISOString(),
    }]);
  }

  async draftReady(topic, slug, row) {
    await this.send(null, [{
      title: '📄 Draft Ready for Review',
      description: `**${topic}**`,
      color: 0xFFAA00,
      fields: [
        { name: 'Slug', value: slug, inline: true },
        { name: 'Row', value: `#${row}`, inline: true },
        { name: 'Action', value: 'Review draft, then set status to SCHEDULED or REVISION', inline: false },
      ],
      timestamp: new Date().toISOString(),
    }]);
  }

  async articlePublished(topic, slug) {
    await this.send(null, [{
      title: '🚀 Article Published',
      description: `**${topic}**`,
      color: 0x00CC00,
      fields: [
        { name: 'URL', value: `https://lowend-nyc.vercel.app/articles/${slug}`, inline: false },
      ],
      timestamp: new Date().toISOString(),
    }]);
  }

  async pipelineError(step, error) {
    await this.send(null, [{
      title: '❌ Pipeline Error',
      description: `Error in **${step}**`,
      color: 0xFF0000,
      fields: [
        { name: 'Error', value: error.substring(0, 200), inline: false },
      ],
      timestamp: new Date().toISOString(),
    }]);
  }

  async dailySummary(stats) {
    const fields = [
      { name: 'Ideas', value: `${stats.ideas}`, inline: true },
      { name: 'Writing', value: `${stats.writing}`, inline: true },
      { name: 'Pending Review', value: `${stats.pendingApproval}`, inline: true },
      { name: 'Scheduled', value: `${stats.scheduled}`, inline: true },
      { name: 'Published Today', value: `${stats.publishedToday}`, inline: true },
      { name: 'Total Published', value: `${stats.totalPublished}`, inline: true },
    ];

    await this.send(null, [{
      title: '📊 Daily Pipeline Summary',
      color: 0xFF2B2B,
      fields,
      timestamp: new Date().toISOString(),
    }]);
  }
}

module.exports = { Notifier };
