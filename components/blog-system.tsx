"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BlogAuth } from "./blog-auth"
import { BlogEditor } from "./blog-editor"
import { BlogPostCard } from "./blog-post-card"
import { BlogReader } from "./blog-reader"
import { Plus, BookOpen, Lock, Unlock } from "lucide-react"

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

export function BlogSystem() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>()
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>()

  // Load posts and auth state on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem("blog-posts")
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      // Add some demo posts
      const demoPosts: BlogPost[] = [
        {
          id: "1",
          title: "Building Modern Web Applications",
          content:
            "In today's fast-paced digital world, creating modern web applications requires a deep understanding of both frontend and backend technologies.\n\nReact has revolutionized how we think about user interfaces, providing a component-based architecture that makes building complex UIs more manageable. When combined with Next.js, we get server-side rendering, static site generation, and many other powerful features out of the box.\n\nThe key to building successful web applications lies in understanding your users' needs and creating intuitive, performant experiences that solve real problems.",
          excerpt:
            "In today's fast-paced digital world, creating modern web applications requires a deep understanding of both frontend and backend technologies...",
          tags: ["React", "Next.js", "Web Development"],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
          published: true,
        },
        {
          id: "2",
          title: "The Future of Mobile Development",
          content:
            "Mobile development has come a long way since the early days of iOS and Android. With the introduction of SwiftUI and Jetpack Compose, building native mobile applications has become more declarative and intuitive.\n\nSwiftUI, in particular, has changed how iOS developers approach UI development. Its declarative syntax makes it easier to create complex animations and responsive layouts.\n\nAs we look to the future, cross-platform solutions like React Native and Flutter continue to evolve, offering developers the ability to write once and deploy everywhere.",
          excerpt:
            "Mobile development has come a long way since the early days of iOS and Android. With the introduction of SwiftUI and Jetpack Compose...",
          tags: ["SwiftUI", "Mobile", "iOS", "React Native"],
          createdAt: "2024-01-10T14:30:00Z",
          updatedAt: "2024-01-10T14:30:00Z",
          published: true,
        },
      ]
      setPosts(demoPosts)
      localStorage.setItem("blog-posts", JSON.stringify(demoPosts))
    }

    // Check auth state
    const authState = localStorage.getItem("blog-auth")
    const authTimestamp = localStorage.getItem("blog-auth-timestamp")

    if (authState === "true" && authTimestamp) {
      const timeDiff = Date.now() - Number.parseInt(authTimestamp)
      const oneHour = 60 * 60 * 1000

      if (timeDiff < oneHour) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("blog-auth")
        localStorage.removeItem("blog-auth-timestamp")
      }
    }
  }, [])

  const handleSavePost = (postData: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()

    if (editingPost) {
      // Update existing post
      const updatedPost = {
        ...editingPost,
        ...postData,
        updatedAt: now,
      }

      const updatedPosts = posts.map((p) => (p.id === editingPost.id ? updatedPost : p))
      setPosts(updatedPosts)
      localStorage.setItem("blog-posts", JSON.stringify(updatedPosts))
    } else {
      // Create new post
      const newPost: BlogPost = {
        id: Date.now().toString(),
        ...postData,
        createdAt: now,
        updatedAt: now,
      }

      const updatedPosts = [newPost, ...posts]
      setPosts(updatedPosts)
      localStorage.setItem("blog-posts", JSON.stringify(updatedPosts))
    }

    setShowEditor(false)
    setEditingPost(undefined)
  }

  const handleDeletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const updatedPosts = posts.filter((p) => p.id !== id)
      setPosts(updatedPosts)
      localStorage.setItem("blog-posts", JSON.stringify(updatedPosts))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("blog-auth")
    localStorage.removeItem("blog-auth-timestamp")
    setIsAuthenticated(false)
  }

  const publishedPosts = posts.filter((post) => post.published)
  const allPosts = isAuthenticated ? posts : publishedPosts

  // Show auth modal
  if (showAuth) {
    return (
      <BlogAuth
        onAuthenticated={() => {
          setIsAuthenticated(true)
          setShowAuth(false)
        }}
        onCancel={() => setShowAuth(false)}
      />
    )
  }

  // Show editor
  if (showEditor) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleSavePost}
        onCancel={() => {
          setShowEditor(false)
          setEditingPost(undefined)
        }}
      />
    )
  }

  // Show reader
  if (selectedPost) {
    return (
      <BlogReader
        post={selectedPost}
        isAuthenticated={isAuthenticated}
        onBack={() => setSelectedPost(undefined)}
        onEdit={(post) => {
          setEditingPost(post)
          setSelectedPost(undefined)
          setShowEditor(true)
        }}
      />
    )
  }

  // Main blog view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Blog</h2>
          <p className="text-muted-foreground mt-2">Thoughts on software development, technology, and life</p>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button onClick={() => setShowEditor(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <Unlock className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setShowAuth(true)} className="gap-2">
              <Lock className="h-4 w-4" />
              Admin Login
            </Button>
          )}
        </div>
      </div>

      {/* Posts */}
      {allPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allPosts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              isAuthenticated={isAuthenticated}
              onEdit={(post) => {
                setEditingPost(post)
                setShowEditor(true)
              }}
              onDelete={handleDeletePost}
              onClick={setSelectedPost}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-border/50 border-dashed">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No blog posts yet</p>
            <p className="text-muted-foreground/70 text-sm mt-2">
              {isAuthenticated ? "Create your first post to get started" : "Check back soon for new content"}
            </p>
            {isAuthenticated && (
              <Button onClick={() => setShowEditor(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
