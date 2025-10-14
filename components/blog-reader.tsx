"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Edit } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  createdAt: string
  updatedAt: string
  published: boolean
}

interface BlogReaderProps {
  post: BlogPost
  isAuthenticated: boolean
  onBack: () => void
  onEdit: (post: BlogPost) => void
}

export function BlogReader({ post, isAuthenticated, onBack, onEdit }: BlogReaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(" ").length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readingTime} min read`
  }

  const formatContent = (text: string) => {
    return text.split("\n").map((line, index) => (
      <p key={index} className="mb-4 last:mb-0 leading-relaxed text-foreground">
        {line || <br />}
      </p>
    ))
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>

          {isAuthenticated && (
            <Button variant="outline" onClick={() => onEdit(post)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Post
            </Button>
          )}
        </div>

        {/* Article */}
        <article>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-6">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-foreground leading-tight">{post.title}</h1>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {getReadingTime(post.content)}
                  </div>
                  {!post.published && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Draft
                    </Badge>
                  )}
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="text-lg leading-relaxed">{formatContent(post.content)}</div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  )
}
