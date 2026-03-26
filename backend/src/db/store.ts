import fs from "fs";
import path from "path";
import { ScoredPost } from "../types/post";
import { UserProfile } from "../types/friends";

// ─── Data directory ───

const DATA_DIR = path.join(__dirname, "..", "data");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJsonFile(filename, fallback);
    return fallback;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Posts store ───

export function getPosts(): ScoredPost[] {
  return readJsonFile<ScoredPost[]>("posts.json", []);
}

export function savePosts(posts: ScoredPost[]): void {
  writeJsonFile("posts.json", posts);
}

export function addPost(post: ScoredPost): void {
  const posts = getPosts();
  const existingIndex = posts.findIndex((p) => p.post.id === post.post.id);
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.push(post);
  }
  savePosts(posts);
}

export function getPostById(id: string): ScoredPost | null {
  const posts = getPosts();
  return posts.find((p) => p.post.id === id) ?? null;
}

// ─── Users store ───

export function getUsers(): UserProfile[] {
  return readJsonFile<UserProfile[]>("users.json", []);
}

export function saveUsers(users: UserProfile[]): void {
  writeJsonFile("users.json", users);
}

export function getMainUser(): UserProfile | null {
  const users = getUsers();
  return users.find((u) => u.isMainUser) ?? null;
}

export function getFriends(): UserProfile[] {
  const users = getUsers();
  return users.filter((u) => !u.isMainUser);
}

export function updateUserCookedScore(userId: string, brainrotScore: number): void {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  user.postsConsumed += 1;
  // Rolling average: blend new score into existing cooked score
  const weight = 0.3; // new post contributes 30%
  user.cookedScore = Math.round(
    user.cookedScore * (1 - weight) + brainrotScore * weight
  );
  user.cookedScore = Math.min(100, Math.max(0, user.cookedScore));

  saveUsers(users);
}
