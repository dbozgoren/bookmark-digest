import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load env from .env.local then .env
function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const projectRoot = path.resolve(__dirname, "..");
loadEnv(path.join(projectRoot, ".env.local"));
loadEnv(path.join(projectRoot, ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const bookmarksPath = (process.env.BOOKMARKS_PATH || "~/clawd/bookmarks").replace(
  "~",
  process.env.HOME || ""
);

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

interface ParsedBookmark {
  id: string;
  author: string;
  text: string;
  url: string | null;
  category: string;
  likes: number;
  starred: boolean;
}

// Parse a category markdown file into bookmark entries
function parseBookmarkFile(filePath: string, category: string): ParsedBookmark[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const bookmarks: ParsedBookmark[] = [];

  let current: Partial<ParsedBookmark> | null = null;

  for (const line of lines) {
    // Match bookmark entry: - **@author**: text  or  - ⭐ **@author**: text
    const entryMatch = line.match(/^- (?:⭐ )?\*\*(@\w+)\*\*: (.+)/);
    if (entryMatch) {
      // Save previous entry if exists
      if (current?.author && current?.text) {
        bookmarks.push(finalize(current, category));
      }
      current = {
        author: entryMatch[1],
        text: entryMatch[2],
        starred: line.includes("⭐"),
      };
      continue;
    }

    // Match URL line:   - 🔗 [url](url) | ❤️ count
    const urlMatch = line.match(
      /^\s+-\s+🔗\s+\[([^\]]*)\]\(([^)]+)\)\s*\|\s*❤️\s*(\S+)/
    );
    if (urlMatch && current) {
      current.url = urlMatch[2];
      current.likes = parseCount(urlMatch[3]);
      continue;
    }

    // Continuation text (indented, not a new entry, not a URL line)
    if (current && line.match(/^\s{2,}\S/) && !line.match(/^\s+-/)) {
      current.text = (current.text || "") + " " + line.trim();
    }
  }

  // Don't forget the last entry
  if (current?.author && current?.text) {
    bookmarks.push(finalize(current, category));
  }

  return bookmarks;
}

function parseCount(s: string): number {
  const cleaned = s.replace(/,/g, "");
  return parseInt(cleaned, 10) || 0;
}

function finalize(partial: Partial<ParsedBookmark>, category: string): ParsedBookmark {
  // Extract tweet ID from x.com URL
  const tweetIdMatch = partial.url?.match(/status\/(\d+)/);
  const id = tweetIdMatch ? tweetIdMatch[1] : generateId(partial.author!, partial.text!);

  return {
    id,
    author: partial.author!,
    text: partial.text!,
    url: partial.url || null,
    category,
    likes: partial.likes || 0,
    starred: partial.starred || false,
  };
}

function generateId(author: string, text: string): string {
  // Simple hash for bookmarks without tweet URLs
  let hash = 0;
  const str = author + text;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return `bm-${Math.abs(hash).toString(36)}`;
}

async function sync() {
  console.log(`Reading bookmarks from: ${bookmarksPath}`);

  if (!fs.existsSync(bookmarksPath)) {
    console.error(`Bookmarks directory not found: ${bookmarksPath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(bookmarksPath).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_")
  );

  console.log(`Found ${files.length} category files: ${files.join(", ")}`);

  let totalParsed = 0;
  let totalUpserted = 0;
  const allBookmarks: ParsedBookmark[] = [];

  for (const file of files) {
    const category = file.replace(".md", "");
    const parsed = parseBookmarkFile(path.join(bookmarksPath, file), category);
    console.log(`  ${category}: ${parsed.length} bookmarks`);
    totalParsed += parsed.length;
    allBookmarks.push(...parsed);
  }

  // Upsert in batches of 500
  const batchSize = 500;
  for (let i = 0; i < allBookmarks.length; i += batchSize) {
    const batch = allBookmarks.slice(i, i + batchSize);
    const rows = batch.map((bm) => ({
      id: bm.id,
      author: bm.author,
      text: bm.text,
      url: bm.url,
      category: bm.category,
      raw_json: { likes: bm.likes, starred: bm.starred },
    }));

    const { error, count } = await supabase
      .from("bookmarks")
      .upsert(rows, { onConflict: "id", count: "exact" });

    if (error) {
      console.error(`Batch ${i / batchSize + 1} error:`, error.message);
    } else {
      totalUpserted += count ?? batch.length;
    }
  }

  console.log(`\nDone: ${totalParsed} parsed, ${totalUpserted} upserted to Supabase`);
}

sync().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
