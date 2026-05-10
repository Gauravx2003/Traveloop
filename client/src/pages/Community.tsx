import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  Image as ImageIcon,
  Send,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: number;
  content: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

const CommentItem: React.FC<{
  comment: Comment;
  allComments: Comment[];
  level: number;
  onReply: (commentId: number, userName: string) => void;
}> = ({ comment, allComments, level, onReply }) => {
  const replies = allComments.filter((r) => r.parentId === comment.id);
  const isReply = level > 0;

  return (
    <div className={`space-y-4 ${isReply ? "ml-6 sm:ml-8" : ""}`}>
      <div className="flex gap-3 group">
        <div
          className={`rounded-full flex items-center justify-center shrink-0 border overflow-hidden shadow-sm ${
            isReply
              ? "w-7 h-7 bg-indigo-50 text-indigo-400 border-indigo-100"
              : "w-8 h-8 bg-gray-100 text-gray-500 border-gray-50"
          }`}
        >
          {comment.user.profilePhoto ? (
            <img
              src={comment.user.profilePhoto}
              alt={comment.user.firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-bold">
              {comment.user.firstName[0]}
              {comment.user.lastName[0]}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div
            className={`rounded-2xl px-4 py-3 border ${
              isReply
                ? "bg-indigo-50/30 border-indigo-100/50"
                : "bg-gray-50/50 border-gray-100/50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-900">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {comment.content}
            </p>
          </div>
          <button
            onClick={() => onReply(comment.id, comment.user.firstName)}
            className="mt-1 ml-2 text-[11px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors"
          >
            Reply
          </button>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              level={level + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  // New post state
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comment State
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [postComments, setPostComments] = useState<{
    [postId: number]: Comment[];
  }>({});
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    commentId: number;
    userName: string;
  } | null>(null);

  const { user } = useAuth();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category && category !== "All") params.append("category", category);
      params.append("sortBy", sortBy);

      const { data } = await api.get(`/community?${params.toString()}`);
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (postId: number) => {
    setIsFetchingComments(true);
    try {
      const { data } = await api.get(`/community/${postId}/comments`);
      setPostComments((prev) => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const handlePostComment = async (postId: number, parentId?: number) => {
    if (!newCommentContent.trim()) return;
    try {
      const { data } = await api.post("/community/comments", {
        postId,
        content: newCommentContent,
        parentId: parentId || null,
      });

      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data],
      }));
      setNewCommentContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to add comment", error);
      alert("Failed to post comment");
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchPosts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, sortBy]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", newContent);
      formData.append("category", newCategory);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await api.post("/community/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts([data, ...posts]);
      setNewContent("");
      setNewCategory("General");
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
          Community
        </h1>
        <p className="text-gray-500 mt-2">
          Share your experiences, ask questions, and connect with other
          travelers.
        </p>
      </div>

      {/* Create Post Section */}
      <div className="glass-card rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 rounded-full bg-indigo-50 blur-3xl opacity-60"></div>
        <form
          onSubmit={handleSubmitPost}
          className="relative z-10 flex flex-col gap-4"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 overflow-hidden">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Share an experience or ask a question..."
              className="w-full p-4 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none min-h-[100px]"
              required
            />
          </div>

          {previewUrl && (
            <div className="pl-16">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between pl-16 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button
                  type="button"
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg border border-gray-200"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Photo</span>
                </button>
              </div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Tips">Tips & Advice</option>
                <option value="Review">Review</option>
                <option value="Question">Question</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newContent.trim()}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-70 w-full sm:w-auto justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Post</span>
            </button>
          </div>
        </form>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-8 justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search community..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Group / Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shrink-0">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer border-none p-0 focus:ring-0"
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Tips">Tips & Advice</option>
              <option value="Review">Review</option>
              <option value="Question">Question</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shrink-0">
            <Clock className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer border-none p-0 focus:ring-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No posts found.</p>
            <p className="text-sm text-gray-400 mt-1">
              Be the first to share an experience!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden shrink-0 border border-gray-200">
                    {post.user.profilePhoto ? (
                      <img
                        src={post.user.profilePhoto}
                        alt={`${post.user.firstName} ${post.user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-sm">
                        {post.user.firstName[0]}
                        {post.user.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {post.user.firstName} {post.user.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>

              {post.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img
                    src={post.imageUrl}
                    alt="Post attachment"
                    className="w-full max-h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-6">
                <button
                  onClick={() => {
                    if (expandedPostId === post.id) {
                      setExpandedPostId(null);
                    } else {
                      setExpandedPostId(post.id);
                      if (!postComments[post.id]) {
                        fetchComments(post.id);
                      }
                    }
                  }}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    expandedPostId === post.id
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-indigo-600"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </button>
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <div className="mt-6 pt-6 border-t border-gray-50 animate-in slide-in-from-top-4 duration-300">
                  {/* Comment Input */}
                  <div className="flex gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs uppercase border border-white shadow-sm">
                      {user?.firstName[0]}
                      {user?.lastName[0]}
                    </div>
                    <div className="flex-1">
                      {replyingTo && (
                        <div className="mb-2 flex items-center justify-between bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                          <p className="text-xs text-indigo-700 font-medium">
                            Replying to{" "}
                            <span className="font-bold">
                              @{replyingTo.userName}
                            </span>
                          </p>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="text-indigo-400 hover:text-indigo-600 p-0.5"
                          >
                            <User className="w-3 h-3 rotate-45" />
                          </button>
                        </div>
                      )}
                      <div className="relative">
                        <textarea
                          placeholder={
                            replyingTo
                              ? "Write a reply..."
                              : "Write a comment..."
                          }
                          value={newCommentContent}
                          onChange={(e) => setNewCommentContent(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                          rows={2}
                        />
                        <button
                          onClick={() =>
                            handlePostComment(post.id, replyingTo?.commentId)
                          }
                          disabled={!newCommentContent.trim()}
                          className="absolute right-3 bottom-3 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {isFetchingComments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      </div>
                    ) : (postComments[post.id]?.length || 0) === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-4">
                        No comments yet. Start the conversation!
                      </p>
                    ) : (
                      // Render top-level comments recursively
                      postComments[post.id]
                        ?.filter((c) => !c.parentId)
                        .map((comment) => (
                          <CommentItem
                            key={comment.id}
                            comment={comment}
                            allComments={postComments[post.id]}
                            level={0}
                            onReply={(commentId, userName) =>
                              setReplyingTo({ commentId, userName })
                            }
                          />
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
