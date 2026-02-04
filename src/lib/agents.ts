import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Agent, AgentCard, AgentFrontmatter, Category } from '@/types/agent';

const agentsDirectory = path.join(process.cwd(), 'agents');

function getAgentFiles(): { filePath: string; category: Category }[] {
  const categories: Category[] = ['design', 'development', 'automation', 'writing', 'business'];
  const files: { filePath: string; category: Category }[] = [];

  for (const category of categories) {
    const categoryPath = path.join(agentsDirectory, category);

    if (!fs.existsSync(categoryPath)) {
      continue;
    }

    const categoryFiles = fs.readdirSync(categoryPath);

    for (const file of categoryFiles) {
      if (file.endsWith('.md')) {
        files.push({
          filePath: path.join(categoryPath, file),
          category,
        });
      }
    }
  }

  return files;
}

export function getAllAgents(): AgentCard[] {
  const files = getAgentFiles();

  const agents = files.map(({ filePath }) => {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    return {
      ...(data as AgentFrontmatter),
      rawContent: fileContents,
    };
  });

  // Sort by updated date, most recent first
  return agents.sort((a, b) =>
    new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );
}

export function getAgentBySlug(slug: string): Agent | null {
  const files = getAgentFiles();

  for (const { filePath } of files) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    if (data.slug === slug) {
      return {
        ...(data as AgentFrontmatter),
        content,
        rawContent: fileContents,
      };
    }
  }

  return null;
}

export function getAgentsByCategory(category: Category): AgentCard[] {
  const allAgents = getAllAgents();
  return allAgents.filter(agent => agent.category === category);
}

export function getCategories(): Category[] {
  const allAgents = getAllAgents();
  const categories = new Set<Category>();

  for (const agent of allAgents) {
    categories.add(agent.category);
  }

  return Array.from(categories);
}

export function getAllSlugs(): string[] {
  const allAgents = getAllAgents();
  return allAgents.map(agent => agent.slug);
}

export function getRawAgentContent(slug: string): string | null {
  const files = getAgentFiles();

  for (const { filePath } of files) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    if (data.slug === slug) {
      return fileContents;
    }
  }

  return null;
}
