import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const CommunityScreen = () => {
  const posts = useQuery(api.communityPosts.getAll) ?? [];
  const createPost = useMutation(api.communityPosts.create);
  const likePost = useMutation(api.communityPosts.like);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General' as any,
  });

  const categories = ['General', 'Event', 'Complaint', 'Suggestion', 'Lost & Found'];

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
    await likePost({ id: postId as any });
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    await createPost({
      author: 'Current User',
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
    });
    setNewPost({ title: '', content: '', category: 'General' });
    setShowNewPostModal(false);
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
    <View style={styles.container}>
      {/* Header with New Post Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Forum</Text>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setShowNewPostModal(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.newPostButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
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
      </ScrollView>

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
                    <Ionicons name="person" size={20} color="#6b7280" />
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
                  <Text style={styles.actionText}>{post.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
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
                  <Text style={styles.commentsTitle}>Comments</Text>
                  {post.comments.map((comment: any, index: number) => (
                    <View key={comment._id ?? index} style={styles.commentItem}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                      <Text style={styles.commentTime}>{formatDate(new Date(comment.createdAt).toISOString())}</Text>
                    </View>
                  ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  commentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  commentItem: {
    marginBottom: 8,
    paddingLeft: 12,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  commentContent: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
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
});

export default CommunityScreen; 