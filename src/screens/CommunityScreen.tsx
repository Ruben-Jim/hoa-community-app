import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ImageBackground,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';
import DeveloperIndicator from '../components/DeveloperIndicator';
import CustomTabBar from '../components/CustomTabBar';
import MobileTabBar from '../components/MobileTabBar';

const CommunityScreen = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General' as any,
  });

  // Poll voting state
  const [selectedPollVotes, setSelectedPollVotes] = useState<{[pollId: string]: number[]}>({});
  
  // Image upload state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // State for dynamic responsive behavior (only for web/desktop)
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Dynamic responsive check - show mobile nav when screen is too narrow for desktop nav
  // On mobile, always show mobile nav regardless of screen size
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';
  const showMobileNav = isMobileDevice || screenWidth < 1024; // Always mobile on mobile devices, responsive on web
  const showDesktopNav = !isMobileDevice && screenWidth >= 1024; // Only desktop nav on web when wide enough

  // Animation values
  const postModalOpacity = useRef(new Animated.Value(0)).current;
  const postModalTranslateY = useRef(new Animated.Value(300)).current;
  const commentModalOpacity = useRef(new Animated.Value(0)).current;
  const commentModalTranslateY = useRef(new Animated.Value(400)).current;
  
  // ScrollView ref for better control
  const scrollViewRef = useRef<ScrollView>(null);

  // Listen for window size changes (only on web/desktop)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setScreenWidth(window.width);
      });

      return () => subscription?.remove();
    }
  }, []);

  // Set initial cursor and cleanup on unmount (web only)
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Set initial cursor
      document.body.style.cursor = 'grab';
      
      // Ensure scroll view is properly initialized
      setTimeout(() => {
        if (scrollViewRef.current) {
          // Force a layout update
          scrollViewRef.current.scrollTo({ y: 0, animated: false });
          
          // Debug: Log scroll view properties
          console.log('CommunityScreen ScrollView initialized for web');
          console.log('Screen width:', screenWidth);
          console.log('Show mobile nav:', showMobileNav);
          console.log('Show desktop nav:', showDesktopNav);
        }
      }, 100);
      
      return () => {
        document.body.style.cursor = 'default';
      };
    }
  }, [screenWidth, showMobileNav, showDesktopNav]);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start at 0 for individual post animations

  // Convex queries
  const posts = useQuery(api.communityPosts.getAll) ?? [];
  const polls = useQuery(api.polls.getActive) ?? [];

  // Convex mutations
  const createPost = useMutation(api.communityPosts.create);
  const addComment = useMutation(api.communityPosts.addComment);
  const likePost = useMutation(api.communityPosts.like);
  const voteOnPoll = useMutation(api.polls.vote);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const categories = ['General', 'Event', 'Complaint', 'Suggestion', 'Lost & Found'];
  const COMMENTS_PREVIEW_LIMIT = 2; // Show only 2 comments initially

  // Modern animation functions
  const animateIn = (modalType: 'post' | 'comment') => {
    const opacity = modalType === 'post' ? postModalOpacity : commentModalOpacity;
    const translateY = modalType === 'post' ? postModalTranslateY : commentModalTranslateY;
    
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const animateOut = (modalType: 'post' | 'comment', callback: () => void) => {
    const opacity = modalType === 'post' ? postModalOpacity : commentModalOpacity;
    const translateY = modalType === 'post' ? postModalTranslateY : commentModalTranslateY;
    
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: modalType === 'post' ? 300 : 400,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      callback();
    });
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const animateFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  // Initialize animations on component mount
  useEffect(() => {
    // Animate individual posts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);

  const filteredPosts = posts.filter((post: any) =>
    !selectedCategory || post.category === selectedCategory
  );

  // Combine posts and polls for display
  const allContent = [
    ...filteredPosts.map(post => ({ ...post, type: 'post' })),
    ...polls.map(poll => ({ ...poll, type: 'poll' }))
  ].sort((a, b) => b.createdAt - a.createdAt);

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
    animateIn('comment');
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
      animateOut('comment', () => {
        setShowCommentModal(false);
        setSelectedPostForComment(null);
      });
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
      // Upload images first
      const uploadedImageUrls = await uploadImages();

      await createPost({
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        author: `${user.firstName} ${user.lastName}`,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      });

      setNewPost({ title: '', content: '', category: 'General' });
      setSelectedImages([]);
      animateOut('post', () => {
        setShowNewPostModal(false);
      });
    } catch (error) {
      // Silently handle post creation errors
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleVoteOnPoll = async (pollId: string, optionIndex: number) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to vote');
      return;
    }

    try {
      const currentVotes = selectedPollVotes[pollId] || [];
      let newVotes: number[];

      if (currentVotes.includes(optionIndex)) {
        // Remove vote if already selected
        newVotes = currentVotes.filter(vote => vote !== optionIndex);
      } else {
        // Add vote
        const poll = polls.find(p => p._id === pollId);
        if (poll && !poll.allowMultipleVotes) {
          // Single vote only - replace current vote
          newVotes = [optionIndex];
        } else {
          // Multiple votes allowed - add to existing votes
          newVotes = [...currentVotes, optionIndex];
        }
      }

      setSelectedPollVotes(prev => ({
        ...prev,
        [pollId]: newVotes
      }));

      await voteOnPoll({
        pollId: pollId as any,
        userId: user._id,
        selectedOptions: newVotes,
      });
    } catch (error) {
      console.error('Error voting on poll:', error);
      Alert.alert('Error', 'Failed to vote. Please try again.');
    }
  };

  const pickImage = async () => {
    if (selectedImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images per post.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImages(prev => [...prev, imageUri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const imageUri of selectedImages) {
        const uploadUrl = await generateUploadUrl();
        
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type },
          body: blob,
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const { storageId } = await uploadResponse.json();
        uploadedUrls.push(storageId);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Error', 'Failed to upload images. Please try again.');
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  // Helper component for displaying images with URL resolution
  const PostImage = ({ storageId, index }: { storageId: string; index: number }) => {
    const imageUrl = useQuery(api.storage.getUrl, { storageId: storageId as any });

    if (imageUrl === undefined) {
      return (
        <View style={[styles.postImageWrapper, styles.imageLoading]}>
          <Ionicons name="image" size={24} color="#9ca3af" />
        </View>
      );
    }

    if (!imageUrl) {
      return null;
    }

    return (
      <View style={styles.postImageWrapper}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      </View>
    );
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
      {/* Mobile Navigation - Only when screen is narrow */}
      {showMobileNav && (
        <MobileTabBar 
          isMenuOpen={isMenuOpen}
          onMenuClose={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Header with New Post Button */}
      <ImageBackground
        source={require('../../assets/hoa-4k.jpg')}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
          <View style={styles.headerOverlay} />
          <View style={styles.headerTop}>
            {/* Hamburger Menu - Only when mobile nav is shown */}
            {showMobileNav && (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setIsMenuOpen(true)}
              >
                <Ionicons name="menu" size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
            
            <View style={styles.headerLeft}>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>Community Forum</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Connect with your neighbors and stay informed
              </Text>
              <View style={styles.indicatorsContainer}>
                <DeveloperIndicator />
                <BoardMemberIndicator />
              </View>
            </View>
          </View>
        </ImageBackground>

      {/* Custom Tab Bar - Only when screen is wide enough */}
      {showDesktopNav && (
        <CustomTabBar />
      )}

      {/* Category Filter with New Post Button */}
      <SafeAreaView style={styles.categoryContainer}>
        <View style={styles.filterRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContent}
            style={styles.categoryScrollView}
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
          
          {/* New Post Button - Desktop Only */}
          {showDesktopNav && (
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.newPostButton}
                onPress={() => {
                  animateButtonPress();
                  setShowNewPostModal(true);
                  animateIn('post');
                }}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.newPostButtonText}>New Post</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>

      {/* Posts List */}
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.postsContainer, Platform.OS === 'web' && styles.webScrollContainer]}
        contentContainerStyle={[styles.scrollContent, Platform.OS === 'web' && styles.webScrollContent]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
        alwaysBounceVertical={false}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        // Enhanced desktop scrolling
        decelerationRate="normal"
        directionalLockEnabled={true}
        canCancelContentTouches={true}
        // Web-specific enhancements
        {...(Platform.OS === 'web' && {
          onScrollBeginDrag: () => {
            if (Platform.OS === 'web') {
              document.body.style.cursor = 'grabbing';
              document.body.style.userSelect = 'none';
            }
          },
          onScrollEndDrag: () => {
            if (Platform.OS === 'web') {
              document.body.style.cursor = 'grab';
              document.body.style.userSelect = 'auto';
            }
          },
          onScroll: () => {
            // Ensure scrolling is working
          },
        })}
      >
        {allContent.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No posts found</Text>
            <Text style={styles.emptyStateSubtext}>
              Be the first to start a conversation!
            </Text>
          </View>
        ) : (
          allContent.map((item: any, index: number) => (
            <Animated.View 
              key={item._id} 
              style={[
                styles.postCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                }
              ]}
            >
              {item.type === 'post' ? (
                // Render post
                <>
                  <View style={styles.postHeader}>
                    <View style={styles.postAuthor}>
                      <View style={styles.avatar}>
                        {item.authorProfileImage ? (
                          <Image 
                            source={{ uri: item.authorProfileImage }} 
                            style={styles.avatarImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons name="person" size={20} color="#6b7280" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.authorName}>{item.author}</Text>
                        <Text style={styles.postTime}>{formatDate(new Date(item.createdAt).toISOString())}</Text>
                      </View>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Ionicons 
                        name={getCategoryIcon(item.category) as any} 
                        size={12} 
                        color={getCategoryColor(item.category)} 
                      />
                      <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.postTitle}>{item.title}</Text>
                  <Text style={styles.postContent}>{item.content}</Text>
                  
                  {/* Post Images */}
                  {item.images && item.images.length > 0 && (
                    <View style={styles.postImagesContainer}>
                      {item.images.map((imageStorageId: string, index: number) => (
                        <PostImage 
                          key={index}
                          storageId={imageStorageId} 
                          index={index} 
                        />
                      ))}
                    </View>
                  )}
                  
                  <View style={styles.postFooter}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLike(item._id)}
                    >
                      <Ionicons name="heart" size={16} color="#6b7280" />
                      <Text style={styles.actionText}>{item.likes ?? 0}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleCommentPress(item)}
                    >
                      <Ionicons name="chatbubble" size={16} color="#6b7280" />
                      <Text style={styles.actionText}>{item.comments?.length ?? 0}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share" size={16} color="#6b7280" />
                      <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Comments */}
                  {item.comments && item.comments.length > 0 && (
                    <View style={styles.commentsSection}>
                      <View style={styles.commentsHeader}>
                        <Text style={styles.commentsTitle}>
                          Comments ({item.comments.length})
                        </Text>
                        {item.comments.length > COMMENTS_PREVIEW_LIMIT && (
                          <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => toggleComments(item._id)}
                          >
                            <Text style={styles.viewAllButtonText}>
                              {expandedComments.has(item._id) ? 'Show Less' : 'View All'}
                            </Text>
                            <Ionicons 
                              name={expandedComments.has(item._id) ? 'chevron-up' : 'chevron-down'} 
                              size={16} 
                              color="#2563eb" 
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      {/* Preview Comments (always visible) */}
                      {item.comments.slice(0, COMMENTS_PREVIEW_LIMIT).map((comment: any, index: number) => (
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
                      {expandedComments.has(item._id) && item.comments.length > COMMENTS_PREVIEW_LIMIT && (
                        <View style={styles.expandedComments}>
                          <View style={styles.commentsDivider} />
                          <ScrollView 
                            style={styles.expandedCommentsScroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                          >
                            {item.comments.slice(COMMENTS_PREVIEW_LIMIT).map((comment: any, index: number) => (
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
                </>
              ) : (
                // Render poll
                <>
                  <View style={styles.postHeader}>
                    <View style={styles.postAuthor}>
                      <View style={styles.avatar}>
                        <Ionicons name="bar-chart" size={20} color="#2563eb" />
                      </View>
                      <View>
                        <Text style={styles.authorName}>Community Poll</Text>
                        <Text style={styles.postTime}>{formatDate(new Date(item.createdAt).toISOString())}</Text>
                      </View>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                      <Text style={[styles.categoryText, { color: '#10b981' }]}>
                        Poll
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.postTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.postContent}>{item.description}</Text>
                  )}
                  
                  {/* Poll Options */}
                  <View style={styles.pollOptionsContainer}>
                    {item.options.map((option: string, optionIndex: number) => {
                      const isSelected = selectedPollVotes[item._id]?.includes(optionIndex) || false;
                      const voteCount = item.optionVotes?.[optionIndex] || 0;
                      const totalVotes = item.totalVotes || 0;
                      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                      
                      return (
                        <TouchableOpacity
                          key={optionIndex}
                          style={[
                            styles.pollOption,
                            isSelected && styles.pollOptionSelected
                          ]}
                          onPress={() => handleVoteOnPoll(item._id, optionIndex)}
                        >
                          <View style={styles.pollOptionContent}>
                            <Text style={[
                              styles.pollOptionText,
                              isSelected && styles.pollOptionTextSelected
                            ]}>
                              {option}
                            </Text>
                            <Text style={styles.pollVoteCount}>
                              {voteCount} votes ({percentage.toFixed(1)}%)
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  
                  <View style={styles.postFooter}>
                    <View style={styles.actionButton}>
                      <Ionicons name="people" size={16} color="#6b7280" />
                      <Text style={styles.actionText}>{item.totalVotes || 0} total votes</Text>
                    </View>
                    
                    {item.allowMultipleVotes && (
                      <View style={styles.actionButton}>
                        <Ionicons name="checkmark-done" size={16} color="#6b7280" />
                        <Text style={styles.actionText}>Multiple votes allowed</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </Animated.View>
          ))
        )}
        
        {/* Additional content to ensure scrollable content */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Floating Action Button for Mobile */}
      {showMobileNav && (
        <TouchableOpacity
          style={styles.floatingActionButton}
          onPress={() => {
            animateButtonPress();
            setShowNewPostModal(true);
            animateIn('post');
          }}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        transparent={true}
        animationType="none"
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <Animated.View style={[
            styles.modalContainer,
            {
              opacity: postModalOpacity,
              transform: [{ translateY: postModalTranslateY }],
            }
          ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <TouchableOpacity onPress={() => animateOut('post', () => setShowNewPostModal(false))}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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

            {/* Image Upload Section */}
            <Text style={styles.inputLabel}>Images (Optional)</Text>
            <View style={styles.imageUploadContainer}>
              {selectedImages.map((imageUri, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {selectedImages.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImage}
                  disabled={uploadingImages}
                >
                  <Ionicons 
                    name="camera" 
                    size={24} 
                    color={uploadingImages ? "#9ca3af" : "#2563eb"} 
                  />
                  <Text style={[
                    styles.addImageText,
                    uploadingImages && styles.addImageTextDisabled
                  ]}>
                    {uploadingImages ? 'Uploading...' : 'Add Image'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {selectedImages.length > 0 && (
              <Text style={styles.imageLimitText}>
                {selectedImages.length}/5 images selected
              </Text>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => animateOut('post', () => setShowNewPostModal(false))}
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
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent={true}
        animationType="none"
      >
        <Animated.View style={[styles.commentModalOverlay, { opacity: overlayOpacity }]}>
          <Animated.View style={[
            styles.commentModalContainer,
            {
              opacity: commentModalOpacity,
              transform: [{ translateY: commentModalTranslateY }],
            }
          ]}>
            <View style={styles.commentModalHeader}>
              <View style={styles.commentModalHeaderContent}>
                <Text style={styles.modalTitle}>Add Comment</Text>
                {selectedPostForComment && (
                  <Text style={styles.commentPostTitle}>
                    on "{selectedPostForComment.title}"
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => animateOut('comment', () => setShowCommentModal(false))}>
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
                onPress={() => animateOut('comment', () => setShowCommentModal(false))}
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
          </Animated.View>
        </Animated.View>
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
    height: 240,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    position: 'relative',
    justifyContent: 'space-between',
  },
  headerImage: {
    borderRadius: 0,
    resizeMode: 'stretch',
    width: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  menuButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginRight: 12,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.9,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
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
  floatingActionButton: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingBottom: -20,
    paddingTop: -40, 
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  categoryScrollView: {
    flex: 1,
  },
  categoryContent: {
    paddingHorizontal: 0,
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
  webScrollContainer: {
    ...(Platform.OS === 'web' && {
      cursor: 'grab' as any,
      userSelect: 'none' as any,
      WebkitUserSelect: 'none' as any,
      MozUserSelect: 'none' as any,
      msUserSelect: 'none' as any,
    }),
  },
  scrollContent: {
    paddingBottom: 20,
  },
  webScrollContent: {
    ...(Platform.OS === 'web' && {
      paddingBottom: 100 as any,
    }),
  },
  spacer: {
    height: Platform.OS === 'web' ? 120 : 80,
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
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 0,
    width: '90%',
    maxHeight: '90%',
    minHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginRight: 24, // Account for close button width
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 16,
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
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentInput: {
    height: 140,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    maxHeight: '60%',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
  // Poll styles
  pollOptionsContainer: {
    marginVertical: 12,
  },
  pollOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  pollOptionSelected: {
    backgroundColor: '#e0e7ff',
    borderColor: '#2563eb',
  },
  pollOptionContent: {
    flex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  pollOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  pollVoteCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  // Image upload styles
  imageUploadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  addImageText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  addImageTextDisabled: {
    color: '#9ca3af',
  },
  imageLimitText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  // Post image display styles
  postImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
    gap: 8,
  },
  postImageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
});

export default CommunityScreen; 