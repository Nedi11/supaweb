import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "/app/posts");

export function getPostsPaths() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames;
}

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      content: matterResult.content,
      ...matterResult.data,
    } as {
      id: string;
      content: string;
      featuredImage: string | null;
      readMagnet: string | null;
    } & {
      [key: string]: any;
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPost({ id }: { id: string }) {
  // Read markdown file as string
  const fullPath = path.join(postsDirectory, id + ".md");
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Combine the data with the id
  return {
    id,
    content: matterResult.content,

    ...matterResult.data,
  } as {
    id: string;
    content: string;
    featuredImage: string | null;
    readMagnet: string | null;
  } & {
    [key: string]: any;
  };
}
