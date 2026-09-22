// Loads the YAML files in src/data/ and validates them, so a typo in a data
// file fails the build with a readable message instead of rendering garbage.
import { parse } from 'yaml';
import { z } from 'astro/zod';

import lineageRaw from '../data/lineage.yaml?raw';
import publicationsRaw from '../data/publications.yaml?raw';
import projectsRaw from '../data/projects.yaml?raw';

const optionalText = z.string().nullish().transform((v) => (v ? v : undefined));

const lineageSchema = z.array(
  z.object({
    role: z.string(),
    place: z.string(),
    advisor: optionalText,
    dates: optionalText,
    short: optionalText,
    logos: z.array(z.string()).nullish().transform((v) => v ?? []),
    url: optionalText,
    focus: optionalText,
  }),
);

const mediaSchema = z.object({ video: optionalText, image: optionalText });
const linksSchema = z.object({
  paper: optionalText,
  code: optionalText,
  website: optionalText,
  video: optionalText,
  bibtex: optionalText,
});

const publicationSchema = z.array(
  z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    award: optionalText,
    media: mediaSchema.nullish().transform((v) => v ?? mediaSchema.parse({})),
    links: linksSchema.nullish().transform((v) => v ?? linksSchema.parse({})),
  }),
);

const projectSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    tag: optionalText,
    image: optionalText,
    video: optionalText,
    code: optionalText,
  }),
);

function load<S extends z.ZodType>(raw: string, schema: S, file: string): z.output<S> {
  const parsed = parse(raw) ?? [];
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid data in src/data/${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const lineage = load(lineageRaw, lineageSchema, 'lineage.yaml');
export const publications = load(publicationsRaw, publicationSchema, 'publications.yaml');
export const projects = load(projectsRaw, projectSchema, 'projects.yaml');

export type LineageEntry = (typeof lineage)[number];
export type Publication = (typeof publications)[number];
export type Project = (typeof projects)[number] & { external?: boolean };
