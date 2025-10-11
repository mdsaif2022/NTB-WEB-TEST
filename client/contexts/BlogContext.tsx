import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { blogService } from "@/lib/firebaseServices";

export interface BlogPost {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
    avatar: string | null;
  };
  content: string;
  excerpt: string;
  status: "pending" | "approved" | "rejected" | "draft";
  submissionDate: string;
  publishDate?: string;
  rejectionReason?: string;
  category: string;
  readTime: string;
  likes: number;
  comments: number;
  views: number;
  images: string[];
  tags: string[];
}

interface BlogContextType {
  blogPosts: BlogPost[];
  loading: boolean;
  error: string | null;
  addBlogPost: (post: Omit<BlogPost, "id" | "submissionDate">) => Promise<BlogPost | null>;
  updateBlogPost: (id: number, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: number) => Promise<void>;
  approveBlogPost: (id: number, adminNotes?: string) => Promise<void>;
  rejectBlogPost: (id: number, reason: string, adminNotes?: string) => Promise<void>;
  getBlogPostById: (id: number) => BlogPost | undefined;
  getPendingPosts: () => BlogPost[];
  getApprovedPosts: () => BlogPost[];
  getRejectedPosts: () => BlogPost[];
  clearError: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const initialBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "My Journey Through the Sundarbans",
    author: {
      name: "John Doe",
      email: "john@email.com",
      avatar: null,
    },
    content:
      "The Sundarbans mangrove forest was truly a magical experience. From the moment we entered the boat, I knew this was going to be special. The dense mangrove canopy created natural tunnels as we navigated through the narrow channels...",
    excerpt:
      "An unforgettable experience spotting Bengal tigers and exploring the world's largest mangrove forest.",
    status: "approved",
    submissionDate: "2024-01-15",
    publishDate: "2024-01-16",
    category: "Adventure",
    readTime: "5 min read",
    likes: 45,
    comments: 12,
    views: 387,
    images: ["sundarbans1.jpg", "sundarbans2.jpg"],
    tags: ["Sundarbans", "Wildlife", "Adventure", "Bengal Tiger"],
  },
  {
    id: 2,
    title: "Tea Gardens and Morning Mist in Srimangal",
    author: {
      name: "Jane Smith",
      email: "jane@email.com",
      avatar: null,
    },
    content:
      "Waking up at dawn in Srimangal to witness the morning mist rolling over the tea gardens is something that will stay with me forever. The rolling hills covered in emerald green tea bushes...",
    excerpt:
      "Walking through the rolling hills of tea gardens while learning about local tea culture.",
    status: "pending",
    submissionDate: "2024-01-14",
    category: "Culture",
    readTime: "4 min read",
    likes: 0,
    comments: 0,
    views: 0,
    images: ["tea1.jpg"],
    tags: ["Srimangal", "Tea", "Culture", "Nature"],
  },
  {
    id: 3,
    title: "Cox's Bazar Sunset Experience",
    author: {
      name: "Mike Johnson",
      email: "mike@email.com",
      avatar: null,
    },
    content:
      "The world's longest natural sea beach offers some of the most spectacular sunsets I've ever witnessed. As the golden hour approached, the entire beach transformed into a canvas of colors...",
    excerpt:
      "Witnessing the golden sunrise over the world's longest natural beach was truly magical.",
    status: "approved",
    submissionDate: "2024-01-13",
    publishDate: "2024-01-13",
    category: "Beach",
    readTime: "3 min read",
    likes: 24,
    comments: 8,
    views: 156,
    images: ["coxsbazar1.jpg", "coxsbazar2.jpg", "coxsbazar3.jpg"],
    tags: ["Cox's Bazar", "Beach", "Sunset", "Photography"],
  },
  {
    id: 4,
    title: "Exploring Old Dhaka's Hidden Gems",
    author: {
      name: "Sarah Ahmed",
      email: "sarah@email.com",
      avatar: null,
    },
    content:
      "Old Dhaka is a treasure trove of history, culture, and architectural marvels. Walking through the narrow lanes of Old Dhaka feels like traveling back in time...",
    excerpt:
      "Discovering ancient architecture, vibrant markets, and rich Mughal heritage in Old Dhaka.",
    status: "approved",
    submissionDate: "2024-01-10",
    publishDate: "2024-01-11",
    category: "History",
    readTime: "6 min read",
    likes: 42,
    comments: 15,
    views: 298,
    images: ["olddhaka1.jpg", "olddhaka2.jpg"],
    tags: ["Dhaka", "History", "Architecture", "Culture"],
  },
  {
    id: 5,
    title: "Inappropriate Content Test",
    author: {
      name: "Bad User",
      email: "bad@email.com",
      avatar: null,
    },
    content:
      "This is a test post with inappropriate content that should be rejected...",
    excerpt: "Test post that should be rejected",
    status: "rejected",
    submissionDate: "2024-01-12",
    rejectionReason: "Inappropriate content and language",
    category: "Other",
    readTime: "1 min read",
    likes: 0,
    comments: 0,
    views: 0,
    images: [],
    tags: [],
  },
  {
    id: 6,
    title: "Food Adventures in Bangladesh",
    author: {
      name: "Maria Rodriguez",
      email: "maria@email.com",
      avatar: null,
    },
    content:
      "Bangladesh cuisine is a delightful journey of flavors and spices. From street food to traditional dishes, every meal tells a story...",
    excerpt:
      "Exploring the rich culinary heritage of Bangladesh through local markets and traditional recipes.",
    status: "approved",
    submissionDate: "2024-01-09",
    publishDate: "2024-01-10",
    category: "Food",
    readTime: "7 min read",
    likes: 38,
    comments: 12,
    views: 234,
    images: ["food1.jpg", "food2.jpg"],
    tags: ["Food", "Culture", "Street Food", "Traditional"],
  },
];

const BLOGS_STORAGE_KEY = "echoForgeBlogPosts";

const loadBlogPostsFromStorage = (): BlogPost[] => {
  try {
    const saved = localStorage.getItem(BLOGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { console.error("Error loading blog posts from storage", e); }
  return initialBlogPosts;
};

export function BlogProvider({ children }: { children: ReactNode }) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load blog posts from Firebase Realtime Database
  useEffect(() => {
    const loadBlogs = async () => {
      console.log('BlogContext: Starting to load blogs...');
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('BlogContext: Timeout reached, using localStorage fallback');
        const localBlogs = loadBlogPostsFromStorage();
        setBlogPosts(localBlogs);
        setLoading(false);
      }, 5000); // 5 second timeout
      
      try {
        const firebaseBlogs = await blogService.getAllBlogs();
        clearTimeout(timeoutId);
        console.log('BlogContext: Firebase blogs loaded:', firebaseBlogs.length);
        if (firebaseBlogs.length > 0) {
          setBlogPosts(firebaseBlogs);
        } else {
          // Fallback to localStorage if no Firebase data
          console.log('BlogContext: No Firebase data, using localStorage fallback');
          const localBlogs = loadBlogPostsFromStorage();
          setBlogPosts(localBlogs);
          // Save to Firebase for future use
          localBlogs.forEach(blog => {
            blogService.addBlog(blog);
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('BlogContext: Error loading blogs:', error);
        setError(error instanceof Error ? error.message : 'Failed to load blogs');
        // Fallback to localStorage
        const localBlogs = loadBlogPostsFromStorage();
        setBlogPosts(localBlogs);
      } finally {
        console.log('BlogContext: Loading completed, setting loading to false');
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  // Listen to Firebase Realtime Database changes
  useEffect(() => {
    const unsubscribe = blogService.onBlogsChange((firebaseBlogs) => {
      if (firebaseBlogs.length > 0) {
        setBlogPosts(firebaseBlogs);
        // Also save to localStorage as backup
        try {
          const blogsData = JSON.stringify(firebaseBlogs);
          if (blogsData.length > 5 * 1024 * 1024) { // 5MB limit
            console.warn("Blogs data too large for localStorage, skipping save");
          } else {
            localStorage.setItem(BLOGS_STORAGE_KEY, blogsData);
          }
        } catch (e) { 
          console.error("Error saving blog posts to storage", e);
          if (e instanceof Error && e.name === 'QuotaExceededError') {
            try {
              localStorage.removeItem(BLOGS_STORAGE_KEY);
              console.log("Cleared old blogs data due to quota exceeded");
            } catch (clearError) {
              console.error("Error clearing localStorage:", clearError);
            }
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  const addBlogPost = async (newPost: Omit<BlogPost, "id" | "submissionDate">) => {
    try {
      const postData = {
        ...newPost,
        submissionDate: new Date().toISOString().split("T")[0],
      };
      
      const addedPost = await blogService.addBlog(postData);
      if (addedPost) {
        // Firebase listener will update the state automatically
        return addedPost;
      }
      return null;
    } catch (error) {
      console.error('Error adding blog post:', error);
      return null;
    }
  };

  const updateBlogPost = async (id: number, updatedPost: Partial<BlogPost>) => {
    try {
      const success = await blogService.updateBlog(id.toString(), updatedPost);
      if (success) {
        // Firebase listener will update the state automatically
        console.log("Blog post updated successfully");
      } else {
        console.error("Failed to update blog post");
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
    }
  };

  const deleteBlogPost = async (id: number) => {
    try {
      const success = await blogService.deleteBlog(id.toString());
      if (success) {
        // Firebase listener will update the state automatically
        console.log("Blog post deleted successfully");
      } else {
        console.error("Failed to delete blog post");
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const approveBlogPost = async (id: number, adminNotes?: string) => {
    try {
      const success = await blogService.approveBlog(id.toString());
      if (success) {
        // Firebase listener will update the state automatically
        console.log("Blog post approved successfully");
      } else {
        console.error("Failed to approve blog post");
      }
    } catch (error) {
      console.error('Error approving blog post:', error);
    }
  };

  const rejectBlogPost = async (id: number, reason: string, adminNotes?: string) => {
    try {
      const success = await blogService.rejectBlog(id.toString());
      if (success) {
        // Firebase listener will update the state automatically
        console.log("Blog post rejected successfully");
      } else {
        console.error("Failed to reject blog post");
      }
    } catch (error) {
      console.error('Error rejecting blog post:', error);
    }
  };

  const getBlogPostById = (id: number) => {
    if (!Array.isArray(blogPosts)) return undefined;
    return blogPosts.find((post) => post?.id === id);
  };

  const getPendingPosts = () => {
    if (!Array.isArray(blogPosts)) return [];
    return blogPosts.filter((post) => post?.status === "pending");
  };

  const getApprovedPosts = () => {
    if (!Array.isArray(blogPosts)) return [];
    return blogPosts.filter((post) => post?.status === "approved");
  };

  const getRejectedPosts = () => {
    if (!Array.isArray(blogPosts)) return [];
    return blogPosts.filter((post) => post?.status === "rejected");
  };

  const clearError = () => {
    setError(null);
  };

  const value: BlogContextType = {
    blogPosts,
    loading,
    error,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    approveBlogPost,
    rejectBlogPost,
    getBlogPostById,
    getPendingPosts,
    getApprovedPosts,
    getRejectedPosts,
    clearError,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlogs() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlogs must be used within a BlogProvider");
  }
  return context;
}
