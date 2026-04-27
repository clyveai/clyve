import { notFound } from "next/navigation"
import ExclusiveBlogClient from "@/components/blog/ExclusiveBlogClient"
import { EXCLUSIVE_CONTENT, type SecretSlug } from "@/constants/blog-data"

interface BlogSlugPageProps {
  params: Promise<{
    slug: string
  }>
}

function isSecretSlug(slug: string): slug is SecretSlug {
  return slug in EXCLUSIVE_CONTENT
}

export default async function BlogSlugPage({ params }: BlogSlugPageProps) {
  const { slug } = await params

  if (!isSecretSlug(slug)) {
    notFound()
  }

  const categories: Record<string, (typeof EXCLUSIVE_CONTENT)[SecretSlug]> = {}

  if (slug === "pro-80880") {
    categories.professional = EXCLUSIVE_CONTENT["pro-80880"]
    categories.student = EXCLUSIVE_CONTENT["student-10125"]
    categories.creator = EXCLUSIVE_CONTENT["creator-36924"]
  } else {
    categories.current = EXCLUSIVE_CONTENT[slug]
  }

  return <ExclusiveBlogClient categories={categories} />
}