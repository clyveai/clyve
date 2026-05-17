import { notFound } from "next/navigation"
import ExclusiveSkillsClient from "@/components/skills/ExclusiveSkillsClient"
import { EXCLUSIVE_CONTENT, type SecretSlug } from "@/constants/skills-data"

interface SkillsSlugPageProps {
  params: Promise<{
    slug: string
  }>
}

function isSecretSlug(slug: string): slug is SecretSlug {
  return slug in EXCLUSIVE_CONTENT
}

export default async function SkillsSlugPage({ params }: SkillsSlugPageProps) {
  const { slug } = await params

  if (!isSecretSlug(slug)) {
    notFound()
  }

  const categories: Record<string, (typeof EXCLUSIVE_CONTENT)[SecretSlug]> = {}

  if (slug === "pro-80880") {
    categories.professional = EXCLUSIVE_CONTENT["pro-80880"]
  } else {
    categories.current = EXCLUSIVE_CONTENT[slug]
  }

  return <ExclusiveSkillsClient categories={categories} />
}