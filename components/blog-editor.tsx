"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, X, Eye, Calendar } from "lucide-react"

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

interface BlogEditorProps {
  post?: BlogPost
  onSave: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [tags, setTags] = useState(post?.tags.join(", ") || "")
  const [published, setPublished] = useState(post?.published || false)
  const [isPreview, setIsPreview] = useState(false)

  const generateExcerpt = (content: string) => {
    return content.slice(0, 150).trim() + (content.length > 150 ? "..." : "")
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return

    const postData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: generateExcerpt(content.trim()),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      published,
    }

    onSave(postData)
  }

  const formatContent = (text: string) => {
    return text.split("\n").map((line, index) => (
      <p key={index} className="mb-4 last:mb-0 leading-relaxed">
        {line || <br />}
      </p>
    ))
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">{post ? "Edit Post" : "New Post"}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || !content.trim()} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save {published ? "& Publish" : "Draft"}
            </Button>
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="grid grid-cols-1 gap-6">
          {!isPreview ? (
            // Editor Mode
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-8 space-y-6">
                <div>
                  <Input
                    placeholder="Post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Start writing your post..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] border-none p-0 bg-transparent resize-none focus-visible:ring-0 text-base leading-relaxed placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="border-t border-border/50 pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Tags (comma separated)</label>
                    <Input
                      placeholder="react, javascript, tutorial"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm font-medium">Publish immediately</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Preview Mode
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-foreground leading-tight">{title || "Untitled Post"}</h1>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <Badge variant={published ? "default" : "secondary"}>{published ? "Published" : "Draft"}</Badge>
                  </div>

                  {tags && (
                    <div className="flex flex-wrap gap-2">
                      {tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
                <div className="text-foreground leading-relaxed">
                  {content ? formatContent(content) : <p className="text-muted-foreground italic">No content yet...</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
