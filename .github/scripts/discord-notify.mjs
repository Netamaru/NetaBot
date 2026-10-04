#!/usr/bin/env node

/**
 * Discord notification for GitHub Actions (NetaBot).
 * Usage: node .github/scripts/discord-notify.mjs <status> [stage]
 */

const status = (process.argv[2] || "success").toLowerCase();
const stage = process.argv[3] || "";

const webhookUrl = process.env.DISCORD_WEBHOOK;
if (!webhookUrl) {
  console.log("DISCORD_WEBHOOK is not set. Skipping Discord notification.");
  process.exit(0);
}

const repo = process.env.GITHUB_REPOSITORY || "Netamaru/NetaBot";
const sha = process.env.GITHUB_SHA || "";
const shortSha = sha ? sha.slice(0, 7) : "latest";
const branch = process.env.GITHUB_REF_NAME || "main";
const actor = process.env.GITHUB_ACTOR || "Netamaru";
const runId = process.env.GITHUB_RUN_ID || "";
const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
const runUrl = runId
  ? `${serverUrl}/${repo}/actions/runs/${runId}`
  : `${serverUrl}/${repo}/actions`;
const commitUrl = sha ? `${serverUrl}/${repo}/commit/${sha}` : `${serverUrl}/${repo}`;
const actorUrl = `https://github.com/${actor}`;
const actorAvatar = `https://github.com/${actor}.png?size=96`;
const repoUrl = `${serverUrl}/${repo}`;

const rawCommitMessage = process.env.COMMIT_MESSAGE || "";
const commitMessage =
  rawCommitMessage.split("\n")[0].slice(0, 100) || "Automated trigger";

const config = {
  started: {
    title: "[NetaBot] Build Started",
    color: 0xf59e0b,
    description: `Pipeline triggered for branch \`${branch}\`.`,
    statusText: "In Progress",
  },
  success: {
    title: "[NetaBot] Deploy Succeeded",
    color: 0x57f287,
    description: "Discord bot process reloaded on production.",
    statusText: "Success",
  },
  failure: {
    title: `[NetaBot] ${stage || "Pipeline"} Failed`,
    color: 0xef4444,
    description: `An error occurred during stage **${stage || "Build & Deploy"}**.`,
    statusText: "Failed",
  },
  cancelled: {
    title: "[NetaBot] Pipeline Cancelled",
    color: 0x94a3b8,
    description: "The workflow execution was cancelled.",
    statusText: "Cancelled",
  },
};

const current = config[status] || config.success;

const fields = [
  {
    name: "Commit",
    value: commitUrl
      ? `[\`${shortSha}\`](${commitUrl}) ${commitMessage}`
      : `\`${shortSha}\` ${commitMessage}`,
    inline: false,
  },
  { name: "Branch", value: `\`${branch}\``, inline: true },
  { name: "Author", value: `[@${actor}](${actorUrl})`, inline: true },
  { name: "Status", value: current.statusText, inline: true },
];

if (status === "success") {
  fields.push({
    name: "Repository",
    value: `[${repo}](${repoUrl})`,
    inline: true,
  });
}

fields.push({
  name: "GitHub Action",
  value: `[View Run](${runUrl})`,
  inline: true,
});

const embed = {
  author: {
    name: `${actor} • GitHub Actions`,
    icon_url: actorAvatar,
    url: actorUrl,
  },
  title: current.title,
  url: status === "success" ? repoUrl : runUrl,
  color: current.color,
  description: current.description,
  fields,
  footer: {
    text: "NetaBot • CI/CD",
    icon_url: "https://github.githubassets.com/favicons/favicon.png",
  },
  timestamp: new Date().toISOString(),
};

const payload = {
  username: "NetaBot CI/CD",
  embeds: [embed],
};

async function sendNotification() {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`Discord notification sent successfully (${status}).`);
    } else {
      const text = await res.text();
      console.warn(`Discord webhook responded with HTTP ${res.status}: ${text}`);
    }
  } catch (err) {
    console.warn("Network error sending Discord webhook:", err.message);
  }
}

sendNotification();
