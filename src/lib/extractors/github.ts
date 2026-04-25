/**
 * GitHubExtractor
 *
 * Primary path: GitHub REST API (higher quality metadata).
 * Fallback path: scrape the GitHub HTML page via Open Graph tags when the
 * API returns 403 (unauthenticated rate-limit on shared IPs like Render) or
 * any other error.
 *
 * Optional env: GITHUB_TOKEN  — raises unauthenticated limit 60 → 5000 req/hr
 */

import * as cheerio from "cheerio";
import { ContentType, ExtractedContent, GitHubMetadata } from "@/types";
import { BaseExtractor } from "./base";
import { httpClient } from "./http-client";

type GHType = "repo" | "issue" | "pr" | "file" | "gist";

interface ParsedGHUrl {
  owner: string;
  repo:  string;
  type:  GHType;
  extra: string; // issue number, PR number, file path, etc.
}

function parseGitHubUrl(url: string): ParsedGHUrl | null {
  const u = new URL(url);
  const parts = u.pathname.replace(/^\//, "").split("/");

  if (u.hostname === "gist.github.com") {
    return { owner: parts[0] ?? "", repo: parts[1] ?? "", type: "gist", extra: "" };
  }

  const [owner, repo, section, ...rest] = parts;
  if (!owner || !repo) return null;

  if (section === "issues")      return { owner, repo, type: "issue", extra: rest[0] ?? "" };
  if (section === "pull")        return { owner, repo, type: "pr",    extra: rest[0] ?? "" };
  if (section === "blob")        return { owner, repo, type: "file",  extra: rest.join("/") };
  return { owner, repo, type: "repo", extra: "" };
}

export class GitHubExtractor extends BaseExtractor {
  readonly supportedTypes = [ContentType.GITHUB];

  private get headers() {
    const token = process.env.GITHUB_TOKEN;
    return token
      ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
      : { Accept: "application/vnd.github+json" };
  }

  async extract(url: string): Promise<ExtractedContent> {
    const parsed = parseGitHubUrl(url);
    if (!parsed) throw new Error(`Cannot parse GitHub URL: ${url}`);

    try {
      switch (parsed.type) {
        case "issue": return await this.extractIssue(url, parsed);
        case "pr":    return await this.extractIssue(url, parsed); // PRs use same issues API
        case "file":  return await this.extractFile(url, parsed);
        default:      return await this.extractRepo(url, parsed);
      }
    } catch (apiErr) {
      // GitHub API returned 403 (unauthenticated rate-limit on shared server IPs)
      // or another transient error — fall back to scraping the HTML page.
      console.warn(
        `[GitHubExtractor] API failed (${String(apiErr).slice(0, 120)}), falling back to HTML scrape for ${url}`
      );
      return this.extractViaHtml(url, parsed);
    }
  }

  private async extractRepo(url: string, p: ParsedGHUrl): Promise<ExtractedContent> {
    const { data } = await httpClient.get(
      `https://api.github.com/repos/${p.owner}/${p.repo}`,
      { headers: this.headers }
    );

    const meta: GitHubMetadata = {
      owner:       p.owner,
      repo:        p.repo,
      type:        "repo",
      title:       data.full_name,
      description: data.description ?? "",
      stars:       data.stargazers_count,
      language:    data.language ?? undefined,
    };

    const rawText = this.cleanText(
      `${meta.title}\n${meta.description ?? ""}`
    );

    return {
      url,
      contentType: ContentType.GITHUB,
      title:       meta.title,
      description: meta.description,
      author:      p.owner,
      rawText,
      metadata:    meta,
      isLarge:     false,
      extractedAt: this.now(),
    };
  }

  private async extractIssue(url: string, p: ParsedGHUrl): Promise<ExtractedContent> {
    const endpoint = `https://api.github.com/repos/${p.owner}/${p.repo}/issues/${p.extra}`;
    const { data } = await httpClient.get(endpoint, { headers: this.headers });

    const meta: GitHubMetadata = {
      owner:  p.owner,
      repo:   p.repo,
      type:   p.type as "issue" | "pr",
      title:  `[${p.owner}/${p.repo}] #${p.extra}: ${data.title}`,
      body:   data.body ?? "",
      labels: data.labels?.map((l: { name: string }) => l.name) ?? [],
    };

    const rawText = this.cleanText(`${meta.title}\n\n${meta.body ?? ""}`);

    return {
      url,
      contentType: ContentType.GITHUB,
      title:       meta.title,
      description: this.truncate(meta.body ?? "", 200),
      author:      data.user?.login,
      publishedAt: data.created_at ? new Date(data.created_at) : undefined,
      rawText,
      metadata:    meta,
      isLarge:     this.isLargeContent(rawText),
      extractedAt: this.now(),
    };
  }

  private async extractFile(url: string, p: ParsedGHUrl): Promise<ExtractedContent> {
    // p.extra = "refs/heads/main/path/to/file.ts" — strip branch ref
    const pathParts = p.extra.split("/");
    const filePath  = pathParts.slice(1).join("/"); // drop branch name

    const endpoint = `https://api.github.com/repos/${p.owner}/${p.repo}/contents/${filePath}`;
    const { data } = await httpClient.get(endpoint, { headers: this.headers });

    const content = data.encoding === "base64"
      ? Buffer.from(data.content, "base64").toString("utf-8")
      : data.content ?? "";

    const meta: GitHubMetadata = {
      owner: p.owner,
      repo:  p.repo,
      type:  "file",
      title: `${p.owner}/${p.repo}: ${filePath}`,
      body:  content,
    };

    const rawText = this.cleanText(content);

    return {
      url,
      contentType: ContentType.GITHUB,
      title:       meta.title,
      description: `File: ${filePath}`,
      rawText,
      metadata:    meta,
      isLarge:     this.isLargeContent(rawText),
      extractedAt: this.now(),
    };
  }

  /**
   * Fallback: scrape the GitHub HTML page and read Open Graph / meta tags.
   * GitHub sets og:title, og:description, og:image on every public page.
   * Works without a token and is not rate-limited like the REST API.
   */
  private async extractViaHtml(url: string, p: ParsedGHUrl): Promise<ExtractedContent> {
    const { data: html } = await httpClient.get<string>(url, {
      headers: {
        // Use a browser-like Accept to get the full HTML, not a JSON API response
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      maxContentLength: 3 * 1024 * 1024,
    });

    const $ = cheerio.load(html);

    const og = (prop: string) =>
      $(`meta[property="og:${prop}"]`).attr("content") ??
      $(`meta[name="og:${prop}"]`).attr("content") ??
      "";

    const title =
      og("title") ||
      $("title").text().replace("· GitHub", "").trim() ||
      `${p.owner}/${p.repo}`;

    const description =
      og("description") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const thumbnail = og("image") || undefined;

    // README preview — GitHub renders it inside a specific container
    const readmeText = this.cleanText(
      $("#readme").text() ||
      $('[data-target="readme-toc.content"]').text() ||
      ""
    );

    // About text from the sidebar
    const aboutText = this.cleanText(
      $(".f4.my-3").text() || $('[itemprop="about"]').text() || description
    );

    const rawText = this.cleanText(
      `${title}\n\n${aboutText}\n\n${readmeText}` || url
    );

    const meta: GitHubMetadata = {
      owner:       p.owner,
      repo:        p.repo ?? "",
      type:        p.type,
      title,
      description: description || undefined,
    };

    return {
      url,
      contentType: ContentType.GITHUB,
      title,
      description: description || undefined,
      thumbnail,
      author:      p.owner,
      rawText,
      metadata:    meta,
      isLarge:     this.isLargeContent(rawText),
      extractedAt: this.now(),
    };
  }
}
