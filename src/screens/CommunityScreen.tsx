import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';

const CommunityScreen = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General' as any,
  });

  // Convex queries
  const posts = useQuery(api.communityPosts.getAll) ?? [];

  // Convex mutations
  const createPost = useMutation(api.communityPosts.create);
  const addComment = useMutation(api.communityPosts.addComment);
  const likePost = useMutation(api.communityPosts.like);

  const categories = ['General', 'Event', 'Complaint', 'Suggestion', 'Lost & Found'];
  const COMMENTS_PREVIEW_LIMIT = 2; // Show only 2 comments initially

  const filteredPosts = posts.filter((post: any) =>
    !selectedCategory || post.category === selectedCategory
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost({ id: postId as any });
    } catch (error) {
      // Silently handle like errors
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentPress = (post: any) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to comment');
      return;
    }
    setSelectedPostForComment(post);
    setShowCommentModal(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!selectedPostForComment) {
      Alert.alert('Error', 'No post selected');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to comment');
      return;
    }

    try {
      await addComment({
        postId: selectedPostForComment._id as any,
        author: `${user.firstName} ${user.lastName}`,
        content: newComment.trim(),
      });

      // Auto-expand comments for the post that just got a new comment
      setExpandedComments(prev => new Set(prev).add(selectedPostForComment._id));

      setNewComment('');
      setShowCommentModal(false);
      setSelectedPostForComment(null);
    } catch (error) {
      // Silently handle comment errors
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to create a post');
      return;
    }

    try {
      await createPost({
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        author: `${user.firstName} ${user.lastName}`,
      });

      setNewPost({ title: '', content: '', category: 'General' });
      setShowNewPostModal(false);
    } catch (error) {
      // Silently handle post creation errors
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Event':
        return 'calendar';
      case 'Complaint':
        return 'warning';
      case 'Suggestion':
        return 'bulb';
      case 'Lost & Found':
        return 'search';
      default:
        return 'chatbubble';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Event':
        return '#3b82f6';
      case 'Complaint':
        return '#ef4444';
      case 'Suggestion':
        return '#f59e0b';
      case 'Lost & Found':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Header with New Post Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Community Forum</Text>
          <BoardMemberIndicator />
        </View>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setShowNewPostModal(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.newPostButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <SafeAreaView style={styles.categoryContainer}>
        <ScrollView 
<<<<<<< HEAD
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(null)}
=======
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
>>>>>>> PC/Experiments
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              !selectedCategory && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryButtonText,
              !selectedCategory && styles.categoryButtonTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
<<<<<<< HEAD
        ))}
=======
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
>>>>>>> PC/Experiments
        </ScrollView>
      </SafeAreaView>

      {/* Posts List */}
      <ScrollView style={styles.postsContainer}>
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No posts found</Text>
            <Text style={styles.emptyStateSubtext}>
              Be the first to start a conversation!
            </Text>
          </View>
        ) : (
          filteredPosts.map((post: any) => (
            <View key={post._id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAuthor}>
                  <View style={styles.avatar}>
                    {post.authorProfileImage ? (
                      <Image 
                        source={{ uri: post.authorProfileImage }} 
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={20} color="#6b7280" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.postTime}>{formatDate(new Date(post.createdAt).toISOString())}</Text>
                  </View>
                </View>
                <View style={styles.categoryBadge}>
                  <Ionicons 
                    name={getCategoryIcon(post.category) as any} 
                    size={12} 
                    color={getCategoryColor(post.category)} 
                  />
                  <Text style={[styles.categoryText, { color: getCategoryColor(post.category) }]}>
                    {post.category}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
              
              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(post._id)}
                >
                  <Ionicons name="heart" size={16} color="#6b7280" />
                  <Text style={styles.actionText}>{post.likes ?? 0}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleCommentPress(post)}
                >
                  <Ionicons name="chatbubble" size={16} color="#6b7280" />
                  <Text style={styles.actionText}>{post.comments?.length ?? 0}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share" size={16} color="#6b7280" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>

              {/* Comments */}
              {post.comments && post.comments.length > 0 && (
                <View style={styles.commentsSection}>
                  <View style={styles.commentsHeader}>
                    <Text style={styles.commentsTitle}>
                      Comments ({post.comments.length})
                    </Text>
                    {post.comments.length > COMMENTS_PREVIEW_LIMIT && (
                      <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => toggleComments(post._id)}
                      >
                        <Text style={styles.viewAllButtonText}>
                          {expandedComments.has(post._id) ? 'Show Less' : 'View All'}
                        </Text>
                        <Ionicons 
                          name={expandedComments.has(post._id) ? 'chevron-up' : 'chevron-down'} 
                          size={16} 
                          color="#2563eb" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Preview Comments (always visible) */}
                  {post.comments.slice(0, COMMENTS_PREVIEW_LIMIT).map((comment: any, index: number) => (
                    <View key={comment._id ?? index} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <View style={styles.commentAuthorInfo}>
                          <View style={styles.commentAvatar}>
                            {comment.authorProfileImage ? (
                              <Image 
                                source={{ uri: comment.authorProfileImage }} 
                                style={styles.commentAvatarImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <Ionicons name="person" size={16} color="#6b7280" />
                            )}
                          </View>
                          <Text style={styles.commentAuthor}>{comment.author}</Text>
                        </View>
                        <Text style={styles.commentTime}>
                          {formatDate(comment.createdAt ? new Date(comment.createdAt).toISOString() : comment.timestamp || new Date().toISOString())}
                        </Text>
                      </View>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>
                  ))}
                  
                  {/* Expanded Comments (when toggled) */}
                  {expandedComments.has(post._id) && post.comments.length > COMMENTS_PREVIEW_LIMIT && (
                    <View style={styles.expandedComments}>
                      <View style={styles.commentsDivider} />
                      <ScrollView 
                        style={styles.expandedCommentsScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {post.comments.slice(COMMENTS_PREVIEW_LIMIT).map((comment: any, index: number) => (
                          <View key={comment._id ?? `expanded-${index}`} style={styles.commentItem}>
                            <View style={styles.commentHeader}>
                              <View style={styles.commentAuthorInfo}>
                                <View style={styles.commentAvatar}>
                                  {comment.authorProfileImage ? (
                                    <Image 
                                      source={{ uri: comment.authorProfileImage }} 
                                      style={styles.commentAvatarImage}
                                      resizeMode="cover"
                                    />
                                  ) : (
                                    <Ionicons name="person" size={16} color="#6b7280" />
                                  )}
                                </View>
                                <Text style={styles.commentAuthor}>{comment.author}</Text>
                              </View>
                              <Text style={styles.commentTime}>
                                {formatDate(comment.createdAt ? new Date(comment.createdAt).toISOString() : comment.timestamp || new Date().toISOString())}
                              </Text>
                            </View>
                            <Text style={styles.commentContent}>{comment.content}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TouchableOpacity onPress={() => setShowNewPostModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categorySelector}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    newPost.category === category && styles.categoryOptionActive
                  ]}
                  onPress={() => setNewPost(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    newPost.category === category && styles.categoryOptionTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter post title..."
              value={newPost.title}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, title: text }))}
            />

            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[styles.textInput, styles.contentInput]}
              placeholder="Write your post content..."
              value={newPost.content}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, content: text }))}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowNewPostModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.createButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.commentModalOverlay}>
          <View style={styles.commentModalContainer}>
            <View style={styles.commentModalHeader}>
              <View style={styles.commentModalHeaderContent}>
                <Text style={styles.modalTitle}>Add Comment</Text>
                {selectedPostForComment && (
                  <Text style={styles.commentPostTitle}>
                    on "{selectedPostForComment.title}"
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.commentModalContent}>
              <Text style={styles.inputLabel}>Comment</Text>
              <TextInput
                style={[styles.textInput, styles.commentInput]}
                placeholder="Write your comment..."
                value={newComment}
                onChangeText={(text) => setNewComment(text)}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.commentModalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAddComment}
              >
                <Text style={styles.createButtonText}>Add Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newPostButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingBottom: -20,
<<<<<<< HEAD
    paddingTop: -40

=======
    paddingTop: -40, 
>>>>>>> PC/Experiments
  },
  categoryContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  postsContainer: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  postTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewAllButtonText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginRight: 4,
  },
  expandedComments: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  commentsDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  expandedCommentsScroll: {
    maxHeight: 200, // Limit height for scrollable expanded comments
  },
  commentItem: {
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  commentAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  commentContent: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  commentTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  categoryOptionActive: {
    backgroundColor: '#2563eb',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#ffffff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  contentInput: {
    height: 120,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  commentModalHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  commentPostTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  commentInput: {
    height: 100, // Adjust height for comment input
  },
  commentModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 20,
    maxHeight: '50%', // Limit to half screen height
    minHeight: 300, // Ensure minimum height for usability
  },
  commentModalHeaderContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  commentModalContent: {
    marginTop: 20,
    flex: 1,
  },
  commentModalFooter: {
    flexDirection: 'row',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 20,
  },
});

export default CommunityScreen; 