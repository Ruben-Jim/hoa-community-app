import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import BoardMemberIndicator from '../components/BoardMemberIndicator';
import DeveloperIndicator from '../components/DeveloperIndicator';
import CustomTabBar from '../components/CustomTabBar';
import MobileTabBar from '../components/MobileTabBar';

const ResidentNotificationsScreen = () => {
  const { user } = useAuth();
  const convex = useConvex();
  const notifications = useQuery(api.residentNotifications.getAllActive);
  const residents = useQuery(api.residents.getAll);
  const createNotification = useMutation(api.residentNotifications.create);
  const updateNotification = useMutation(api.residentNotifications.update);
  const deleteNotification = useMutation(api.residentNotifications.remove);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  // Helper component to render images with Convex storage ID
  const HouseImage = ({ storageId, isFullScreen = false }: { storageId: string; isFullScreen?: boolean }) => {
    const imageUrl = useQuery(api.storage.getUrl, { storageId: storageId as any });
    
    if (imageUrl === undefined) {
      return (
        <View style={isFullScreen ? styles.fullImageLoading : styles.imageLoading}>
          <Ionicons name="image" size={24} color="#9ca3af" />
        </View>
      );
    }
    
    if (!imageUrl) {
      return null;
    }
    
    return (
      <Image 
        source={{ uri: imageUrl }} 
        style={isFullScreen ? styles.fullImage : styles.cardHouseImage}
        resizeMode={isFullScreen ? "contain" : "cover"}
      />
    );
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedImageStorageId, setSelectedImageStorageId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
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

  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';
  const showMobileNav = isMobileDevice || screenWidth < 1024;
  const showDesktopNav = !isMobileDevice && screenWidth >= 1024;

  const [formData, setFormData] = useState({
    residentId: '',
    type: 'Selling' as 'Selling' | 'Moving',
    listingDate: '',
    closingDate: '',
    realtorInfo: '',
    newResidentName: '',
    isRental: false,
    additionalInfo: '',
    houseImage: null as string | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatDateInput = (text: string): string => {
    // Remove any non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    // Format as DD-MM-YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4, 8)}`;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPreviewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    try {
      const uploadUrl = await generateUploadUrl();
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': blob.type },
        body: blob,
      });
      
      const { storageId } = await uploadResponse.json();
      
      return storageId;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handleAddNotification = () => {
    setFormData({
      residentId: '',
      type: 'Selling',
      listingDate: '',
      closingDate: '',
      realtorInfo: '',
      newResidentName: '',
      isRental: false,
      additionalInfo: '',
      houseImage: null,
    });
    setPreviewImage(null);
    setShowAddModal(true);
    animateModalIn();
  };

  const handleEditNotification = (notification: any) => {
    setSelectedNotification(notification);
    setFormData({
      residentId: notification.residentId,
      type: notification.type,
      listingDate: notification.listingDate || '',
      closingDate: notification.closingDate || '',
      realtorInfo: notification.realtorInfo || '',
      newResidentName: notification.newResidentName || '',
      isRental: notification.isRental || false,
      additionalInfo: notification.additionalInfo || '',
      houseImage: notification.houseImage || null,
    });
    setPreviewImage(null);
    setShowEditModal(true);
    animateModalIn();
  };

  const animateModalIn = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(modalTranslateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const animateModalOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(modalTranslateY, {
        toValue: 300,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(callback);
  };

  const handleSubmit = async () => {
    if (!formData.residentId) {
      Alert.alert('Error', 'Please select a resident');
      return;
    }

    try {
      let houseImageId: string | undefined;
      
      // Upload image if preview exists
      if (previewImage) {
        houseImageId = await uploadImage(previewImage);
      }

      if (showEditModal && selectedNotification) {
        await updateNotification({
          id: selectedNotification._id,
          listingDate: formData.listingDate || undefined,
          closingDate: formData.closingDate || undefined,
          realtorInfo: formData.realtorInfo || undefined,
          newResidentName: formData.newResidentName || undefined,
          isRental: formData.isRental || undefined,
          additionalInfo: formData.additionalInfo || undefined,
          houseImage: houseImageId || formData.houseImage || undefined,
        });
        Alert.alert('Success', 'Notification updated successfully');
      } else {
        await createNotification({
          residentId: formData.residentId as any,
          type: formData.type,
          listingDate: formData.listingDate || undefined,
          closingDate: formData.closingDate || undefined,
          realtorInfo: formData.realtorInfo || undefined,
          newResidentName: formData.newResidentName || undefined,
          isRental: formData.isRental,
          additionalInfo: formData.additionalInfo || undefined,
          houseImage: houseImageId,
        });
        Alert.alert('Success', 'Notification created successfully');
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedNotification(null);
      setPreviewImage(null);
      setFormData({
        ...formData,
        houseImage: null,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save notification');
    }
  };

  const handleDelete = async (notificationId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification({ id: notificationId as any });
              Alert.alert('Success', 'Notification deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const getResidentInfo = (residentId: any) => {
    const resident = residents?.find((r: any) => r._id === residentId);
    if (!resident) return { name: 'Unknown', address: '' };
    return {
      name: `${resident.firstName} ${resident.lastName}`,
      address: `${resident.address}${resident.unitNumber ? ` #${resident.unitNumber}` : ''}`,
    };
  };

  const notificationCards = notifications?.map((notification: any) => {
    const residentInfo = getResidentInfo(notification.residentId);
    return { ...notification, ...residentInfo };
  }).filter((notification: any) => {
    if (!selectedType) return true;
    return notification.type === selectedType;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Mobile Navigation */}
        {showMobileNav && (
          <MobileTabBar 
            isMenuOpen={isMenuOpen}
            onMenuClose={() => setIsMenuOpen(false)}
          />
        )}
        
        <ScrollView 
          ref={scrollViewRef}
          style={[styles.scrollContainer, Platform.OS === 'web' && styles.webScrollContainer]}
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
          {/* Header with ImageBackground */}
          <Animated.View style={{ opacity: fadeAnim }}>
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
                    <Text style={styles.headerTitle}>Residents Moving/Leaving</Text>
                  </View>
                  <Text style={styles.headerSubtitle}>
                    Community housing updates and transitions
                  </Text>
                  <View style={styles.indicatorsContainer}>
                    <DeveloperIndicator />
                    <BoardMemberIndicator />
                  </View>
                </View>
              </View>
            </ImageBackground>
          </Animated.View>

          {/* Custom Tab Bar - Only when screen is wide enough */}
          {showDesktopNav && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <CustomTabBar />
            </Animated.View>
          )}

          {/* Type Filter */}
          <Animated.View style={[
            styles.typeFilterContainer,
            { opacity: fadeAnim }
          ]}>
            <View style={styles.typeFilterRow}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeFilterContent}
                style={styles.typeFilterScrollView}
              >
                <TouchableOpacity
                  style={[
                    styles.typeFilterButton,
                    !selectedType && styles.typeFilterButtonActive
                  ]}
                  onPress={() => setSelectedType(null)}
                >
                  <Text style={[
                    styles.typeFilterButtonText,
                    !selectedType && styles.typeFilterButtonTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeFilterButton,
                    selectedType === 'Selling' && styles.typeFilterButtonActive
                  ]}
                  onPress={() => setSelectedType('Selling')}
                >
                  <Text style={[
                    styles.typeFilterButtonText,
                    selectedType === 'Selling' && styles.typeFilterButtonTextActive
                  ]}>
                    Selling
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeFilterButton,
                    selectedType === 'Moving' && styles.typeFilterButtonActive
                  ]}
                  onPress={() => setSelectedType('Moving')}
                >
                  <Text style={[
                    styles.typeFilterButtonText,
                    selectedType === 'Moving' && styles.typeFilterButtonTextActive
                  ]}>
                    Moving
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              
              {/* Add Notification Button - Desktop Only */}
              {showDesktopNav && (
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={styles.addNotificationButton}
                    onPress={handleAddNotification}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                    <Text style={styles.addNotificationButtonText}>Add Notification</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Content */}
          <View style={styles.contentWrapper}>
            {notificationCards && notificationCards.length > 0 ? (
              <View style={[
                styles.cardsContainer,
                showMobileNav && styles.cardsContainerMobile
              ]}>
                {notificationCards.map((notification: any) => {
                  const typeColor = notification.type === 'Selling' ? '#10b981' : '#f59e0b';
                  return (
                    <Animated.View 
                      key={notification._id} 
                      style={[
                        styles.card,
                        showMobileNav && styles.cardMobile,
                        {
                          opacity: contentAnim,
                          transform: [{
                            translateY: contentAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [50, 0],
                            })
                          }]
                        }
                      ]}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.cardMainInfo}>
                          <View style={styles.cardAvatar}>
                            {notification.profileImage ? (
                              <Image 
                                source={{ uri: notification.profileImage }} 
                                style={styles.cardAvatarImage} 
                              />
                            ) : (
                              <View style={styles.cardAvatarPlaceholder}>
                                <Text style={styles.cardAvatarText}>
                                  {notification.residentName ? notification.residentName.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2) : '?'}
                                </Text>
                              </View>
                            )}
                          </View>
                          
                        <View style={styles.cardDetails}>
                          <TouchableOpacity
                            onPress={() => handleEditNotification(notification)}
                            style={styles.editButtonTopRight}
                          >
                            <Ionicons name="create-outline" size={18} color="#6b7280" />
                          </TouchableOpacity>
                          
                          <Text style={styles.cardType} numberOfLines={1}>
                            {notification.type}
                          </Text>
                          
                          <Text style={styles.cardEmail} numberOfLines={1}>
                            {notification.residentName || 'Unknown'}
                          </Text>
                          
                          <Text style={styles.cardAddress} numberOfLines={1}>
                            {notification.residentAddress || ''}
                          </Text>
                        </View>
                      </View>

                        {/* House Image */}
                        {notification.houseImage && (
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedImageStorageId(notification.houseImage);
                              setShowImageModal(true);
                            }}
                            activeOpacity={0.9}
                          >
                            <View style={styles.houseImageContainer}>
                              <HouseImage storageId={notification.houseImage} />
                              <View style={styles.imageOverlay}>
                                <Ionicons name="expand" size={20} color="#ffffff" />
                                <Text style={styles.viewImageText}>Tap to View</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        )}

                        {/* Additional Details Section */}
                        <View style={styles.cardDetailsSection}>
                          {/* Dates Row */}
                          {(notification.listingDate || notification.closingDate) && (
                            <View style={styles.dateRow}>
                              {notification.listingDate && (
                                <View style={styles.dateItem}>
                                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                                  <Text style={styles.dateLabel}>Listing:</Text>
                                  <Text style={styles.dateValue}>{notification.listingDate}</Text>
                                </View>
                              )}
                              {notification.closingDate && (
                                <View style={styles.dateItem}>
                                  <Ionicons name="calendar" size={16} color="#6b7280" />
                                  <Text style={styles.dateLabel}>Closing:</Text>
                                  <Text style={styles.dateValue}>{notification.closingDate}</Text>
                                </View>
                              )}
                            </View>
                          )}

                          {/* Realtor Info */}
                          {notification.realtorInfo && (
                            <View style={styles.infoBlock}>
                              <View style={styles.infoHeader}>
                                <Ionicons name="business" size={14} color="#2563eb" />
                                <Text style={styles.infoBlockTitle}>Realtor Contact</Text>
                              </View>
                              <Text style={styles.infoBlockContent}>{notification.realtorInfo}</Text>
                            </View>
                          )}

                          {/* New Resident Info */}
                          {notification.newResidentName && (
                            <View style={styles.infoBlock}>
                              <View style={styles.infoHeader}>
                                <Ionicons
                                  name={notification.isRental ? 'key-outline' : 'person-outline'}
                                  size={14}
                                  color={notification.isRental ? '#f59e0b' : '#10b981'}
                                />
                                <Text style={styles.infoBlockTitle}>
                                  New {notification.isRental ? 'Renter' : 'Owner'}
                                </Text>
                              </View>
                              <Text style={styles.infoBlockContent}>{notification.newResidentName}</Text>
                            </View>
                          )}

                          {/* Additional Info */}
                          {notification.additionalInfo && (
                            <View style={styles.infoBlock}>
                              <View style={styles.infoHeader}>
                                <Ionicons name="chatbubble-outline" size={14} color="#6b7280" />
                                <Text style={styles.infoBlockTitle}>Additional Details</Text>
                              </View>
                              <Text style={styles.infoBlockContent}>{notification.additionalInfo}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="home-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyStateText}>No notifications yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Residents can submit information when selling or moving
                </Text>
              </View>
            )}
          </View>
          
          {/* Spacer for better scrolling */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Floating Action Button for Mobile */}
        {showMobileNav && (
          <TouchableOpacity
            style={styles.floatingActionButton}
            onPress={handleAddNotification}
          >
            <Ionicons name="add" size={28} color="#ffffff" />
          </TouchableOpacity>
        )}

        {/* Add/Edit Modal */}
        <Modal
          visible={showAddModal || showEditModal}
          animationType="none"
          transparent={true}
          onRequestClose={() => {
            animateModalOut(() => {
              setShowAddModal(false);
              setShowEditModal(false);
            });
          }}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalWrapper}
            >
              <Animated.View 
                style={[
                  styles.modalContainer,
                  {
                    opacity: modalOpacity,
                    transform: [{ translateY: modalTranslateY }],
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {showEditModal ? 'Edit Notification' : 'Add Notification'}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      animateModalOut(() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                      });
                    }}
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Resident *</Text>
                  <ScrollView style={styles.picker} nestedScrollEnabled>
                    {residents?.map((resident: any) => (
                      <TouchableOpacity
                        key={resident._id}
                        style={[
                          styles.pickerOption,
                          formData.residentId === resident._id && styles.pickerOptionSelected,
                        ]}
                        onPress={() => setFormData({ ...formData, residentId: resident._id })}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.residentId === resident._id && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {resident.firstName} {resident.lastName} - {resident.address}
                          {resident.unitNumber ? ` #${resident.unitNumber}` : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Type *</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        formData.type === 'Selling' && styles.typeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, type: 'Selling' })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.type === 'Selling' && styles.typeButtonTextSelected,
                        ]}
                      >
                        Selling
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        formData.type === 'Moving' && styles.typeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, type: 'Moving' })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.type === 'Moving' && styles.typeButtonTextSelected,
                        ]}
                      >
                        Moving
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Listing Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD-MM-YYYY"
                    value={formData.listingDate}
                    onChangeText={(text) => {
                      const formatted = formatDateInput(text);
                      setFormData({ ...formData, listingDate: formatted });
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Closing Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD-MM-YYYY"
                    value={formData.closingDate}
                    onChangeText={(text) => {
                      const formatted = formatDateInput(text);
                      setFormData({ ...formData, closingDate: formatted });
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Realtor Information</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Realtor name and contact info"
                    value={formData.realtorInfo}
                    onChangeText={(text) => setFormData({ ...formData, realtorInfo: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Owner/Renter Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name of new occupant"
                    value={formData.newResidentName}
                    onChangeText={(text) => setFormData({ ...formData, newResidentName: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Is this a rental?</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        formData.isRental === true && styles.typeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, isRental: true })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.isRental === true && styles.typeButtonTextSelected,
                        ]}
                      >
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        formData.isRental === false && styles.typeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, isRental: false })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.isRental === false && styles.typeButtonTextSelected,
                        ]}
                      >
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>House Image (Optional)</Text>
                  {previewImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: previewImage }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setPreviewImage(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="image-outline" size={24} color="#6b7280" />
                      <Text style={styles.imagePickerText}>Add House Image</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Additional Information</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any additional information"
                    value={formData.additionalInfo}
                    onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>
                      {showEditModal ? 'Update' : 'Create'} Notification
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </KeyboardAvoidingView>
          </Animated.View>
        </Modal>

        {/* Image Viewer Modal */}
        <Modal
          visible={showImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.imageModalOverlay}>
            <TouchableOpacity 
              style={styles.imageModalClose}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={32} color="#ffffff" />
            </TouchableOpacity>
            {selectedImageStorageId && (
              <HouseImage storageId={selectedImageStorageId} isFullScreen={true} />
            )}
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  webScrollContainer: {
    ...(Platform.OS === 'web' && {
      cursor: 'grab' as any,
      userSelect: 'none' as any,
      WebkitUserSelect: 'none' as any,
      MozUserSelect: 'none' as any,
      msUserSelect: 'none' as any,
      overflow: 'auto' as any,
      height: '100vh' as any,
      maxHeight: '100vh' as any,
      position: 'relative' as any,
    }),
  },
  webScrollContent: {
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
      flexGrow: 1,
      paddingBottom: 100 as any,
    }),
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
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    marginTop: 4,
  },
  contentContainer: {
    padding: 16,
  },
  contentWrapper: {
    flex: 1,
  },
  spacer: {
    height: Platform.OS === 'web' ? 200 : 100,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
    gap: 12,
  },
  cardsContainerMobile: {
    flexDirection: 'column',
    gap: 16,
    padding: 15,
  },
  cardMobile: {
    minWidth: '100%',
    maxWidth: '100%',
  },
  card: {
    flex: 1,
    minWidth: '47%',
    maxWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
  },
  cardMainInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardAvatar: {
    marginRight: 10,
  },
  cardAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  cardDetails: {
    flex: 1,
    position: 'relative',
  },
  editButtonTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
  cardType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 4,
  },
  cardEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  cardDetailsSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: '45%',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  infoBlock: {
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoBlockTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBlockContent: {
    fontSize: 12,
    color: '#1f2937',
    lineHeight: 16,
  },
  cardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDetailText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 220 : 100,
    right: 20,
    backgroundColor: '#2563eb',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    marginLeft: 4,
  },
  picker: {
    maxHeight: 150,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeButtonTextSelected: {
    color: '#2563eb',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
  },
  viewImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  viewImageButtonText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  viewImageText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 4,
  },
  houseImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  cardHouseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '90%',
    height: '80%',
    alignSelf: 'center',
    marginTop: 100,
  },
  imageLoading: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  fullImageLoading: {
    width: '90%',
    height: '80%',
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 100,
  },
  typeFilterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  typeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  typeFilterScrollView: {
    flex: 1,
  },
  typeFilterContent: {
    paddingHorizontal: 0,
  },
  typeFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  typeFilterButtonActive: {
    backgroundColor: '#2563eb',
  },
  typeFilterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  typeFilterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  addNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addNotificationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 100,
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
});

export default ResidentNotificationsScreen;

