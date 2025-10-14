"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit, Trash2 } from "lucide-react"

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

interface BlogPostCardProps {
  post: BlogPost
  isAuthenticated: boolean
  onEdit: (post: BlogPost) => void
  onDelete: (id: string) => void
  onClick: (post: BlogPost) => void
}

export function BlogPostCard({ post, isAuthenticated, onEdit, onDelete, onClick }: BlogPostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(" ").length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readingTime} min read`
  }

  return (
    <Card className="shadow-sm border-border/50 hover:shadow-md transition-all duration-300 hover:border-border group cursor-pointer">
      <CardContent className="p-6" onClick={() => onClick(post)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                {post.title}
              </h3>
              {!post.published && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground shrink-0">
                  Draft
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                  +{post.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getReadingTime(post.content)}
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(post)
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(post.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
