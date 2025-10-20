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
  RefreshControl,
  FlatList,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
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

const AdminScreen = () => {
  const { user } = useAuth();
  const convex = useConvex();
  
  // State for dynamic responsive behavior (only for web/desktop)
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Dynamic responsive check - show mobile nav when screen is too narrow for desktop nav
  // On mobile, always show mobile nav regardless of screen size
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';
  const showMobileNav = isMobileDevice || screenWidth < 1024; // Always mobile on mobile devices, responsive on web
  const showDesktopNav = !isMobileDevice && screenWidth >= 1024; // Only desktop nav on web when wide enough
  
  // Listen for window size changes (only on web/desktop)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setScreenWidth(window.width);
      });

      return () => subscription?.remove();
    }
  }, []);

  // Data queries
  const residents = useQuery(api.residents.getAll) ?? [];
  const boardMembers = useQuery(api.boardMembers.getAll) ?? [];
  const covenants = useQuery(api.covenants.getAll) ?? [];
  const communityPosts = useQuery(api.communityPosts.getAll) ?? [];
  const comments = useQuery(api.communityPosts.getAllComments) ?? [];
  const emergencyAlerts = useQuery(api.emergencyNotifications.getAll) ?? [];
  const homeownersPaymentStatus = useQuery(api.fees.getAllHomeownersPaymentStatus) ?? [];
  const allFeesFromDatabase = useQuery(api.fees.getAll) ?? [];
  const allFinesFromDatabase = useQuery(api.fees.getAllFines) ?? [];
  
  // Mutations
  const setBlockStatus = useMutation(api.residents.setBlockStatus);
  const deleteCovenant = useMutation(api.covenants.remove);
  const deleteCommunityPost = useMutation(api.communityPosts.remove);
  const deleteBoardMember = useMutation(api.boardMembers.remove);
  const deleteComment = useMutation(api.communityPosts.removeComment);
  const createBoardMember = useMutation(api.boardMembers.create);
  const updateBoardMember = useMutation(api.boardMembers.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createEmergencyAlert = useMutation(api.emergencyNotifications.create);
  const updateEmergencyAlert = useMutation(api.emergencyNotifications.update);
  const deleteEmergencyAlert = useMutation(api.emergencyNotifications.remove);
  
  // Fee management mutations
  const createYearFeesForAllHomeowners = useMutation(api.fees.createYearFeesForAllHomeowners);
  const addFineToProperty = useMutation(api.fees.addFineToProperty);
  
  // Covenant management mutations
  const createCovenant = useMutation(api.covenants.create);
  const updateCovenant = useMutation(api.covenants.update);
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'residents' | 'board' | 'covenants' | 'posts' | 'comments' | 'emergency' | 'fees'>('residents');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [blockReason, setBlockReason] = useState('');
  
  // Board member modal state
  const [showBoardMemberModal, setShowBoardMemberModal] = useState(false);
  const [isEditingBoardMember, setIsEditingBoardMember] = useState(false);
  const [boardMemberForm, setBoardMemberForm] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    bio: '',
    termEnd: '',
  });
  const [boardMemberImage, setBoardMemberImage] = useState<string | null>(null);
  
  // Emergency alert modal state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    title: '',
    content: '',
    type: 'Alert' as 'Emergency' | 'Alert' | 'Info',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    category: 'Other' as 'Security' | 'Maintenance' | 'Event' | 'Lost Pet' | 'Other',
    isActive: true,
  });

  // Fee management modal state
  const [showYearFeeModal, setShowYearFeeModal] = useState(false);
  const [showAddFineModal, setShowAddFineModal] = useState(false);
  const [yearFeeForm, setYearFeeForm] = useState({
    year: new Date().getFullYear().toString(),
    amount: '300',
    description: 'Annual HOA Fee',
  });
  const [fineForm, setFineForm] = useState({
    selectedAddress: '',
    amount: '',
    reason: '',
    description: '',
  });
  
  // Covenant modal state
  const [showCovenantModal, setShowCovenantModal] = useState(false);
  const [isEditingCovenant, setIsEditingCovenant] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [covenantForm, setCovenantForm] = useState({
    title: '',
    description: '',
    category: 'General' as 'Architecture' | 'Landscaping' | 'Parking' | 'Pets' | 'General',
    lastUpdated: new Date().toLocaleDateString('en-US'),
    pdfUrl: '',
  });

  // Animation values
  const blockModalOpacity = useRef(new Animated.Value(0)).current;
  const blockModalTranslateY = useRef(new Animated.Value(300)).current;
  const deleteModalOpacity = useRef(new Animated.Value(0)).current;
  const deleteModalTranslateY = useRef(new Animated.Value(300)).current;
  const boardMemberModalOpacity = useRef(new Animated.Value(0)).current;
  const boardMemberModalTranslateY = useRef(new Animated.Value(300)).current;
  const emergencyModalOpacity = useRef(new Animated.Value(0)).current;
  const emergencyModalTranslateY = useRef(new Animated.Value(300)).current;
  const yearFeeModalOpacity = useRef(new Animated.Value(0)).current;
  const yearFeeModalTranslateY = useRef(new Animated.Value(300)).current;
  const addFineModalOpacity = useRef(new Animated.Value(0)).current;
  const addFineModalTranslateY = useRef(new Animated.Value(300)).current;
  const covenantModalOpacity = useRef(new Animated.Value(0)).current;
  const covenantModalTranslateY = useRef(new Animated.Value(300)).current;
  const categoryDropdownOpacity = useRef(new Animated.Value(0)).current;
  const categoryDropdownScale = useRef(new Animated.Value(0.95)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start at 0 for individual item animations

  // Check if current user is a board member
  const isBoardMember = user?.isBoardMember && user?.isActive;

  // Modern animation functions
  const animateIn = (modalType: 'block' | 'delete' | 'boardMember' | 'emergency' | 'yearFee' | 'addFine' | 'covenant') => {
    const opacity = modalType === 'block' ? blockModalOpacity : 
                   modalType === 'delete' ? deleteModalOpacity :
                   modalType === 'boardMember' ? boardMemberModalOpacity : 
                   modalType === 'emergency' ? emergencyModalOpacity :
                   modalType === 'yearFee' ? yearFeeModalOpacity : 
                   modalType === 'addFine' ? addFineModalOpacity :
                   covenantModalOpacity;
    const translateY = modalType === 'block' ? blockModalTranslateY : 
                      modalType === 'delete' ? deleteModalTranslateY:
                      modalType === 'boardMember' ? boardMemberModalTranslateY : 
                      modalType === 'emergency' ? emergencyModalTranslateY :
                      modalType === 'yearFee' ? yearFeeModalTranslateY : 
                      modalType === 'addFine' ? addFineModalTranslateY :
                      covenantModalTranslateY;
    
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

  const animateOut = (modalType: 'block' | 'delete' | 'boardMember' | 'emergency' | 'yearFee' | 'addFine' | 'covenant', callback: () => void) => {
    const opacity = modalType === 'block' ? blockModalOpacity : 
                   modalType === 'delete' ? deleteModalOpacity :
                   modalType === 'boardMember' ? boardMemberModalOpacity : 
                   modalType === 'emergency' ? emergencyModalOpacity :
                   modalType === 'yearFee' ? yearFeeModalOpacity : 
                   modalType === 'addFine' ? addFineModalOpacity :
                   covenantModalOpacity;
    const translateY = modalType === 'block' ? blockModalTranslateY : 
                      modalType === 'delete' ? deleteModalTranslateY :
                      modalType === 'boardMember' ? boardMemberModalTranslateY : 
                      modalType === 'emergency' ? emergencyModalTranslateY :
                      modalType === 'yearFee' ? yearFeeModalTranslateY : 
                      modalType === 'addFine' ? addFineModalTranslateY :
                      covenantModalTranslateY;
    
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
        toValue: 300,
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
    // Animate individual items
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBlockResident = (resident: any) => {
    setSelectedItem(resident);
    setBlockReason('');
    setShowBlockModal(true);
    animateIn('block');
  };

  const handleUnblockResident = async (resident: any) => {
    try {
      await setBlockStatus({
        id: resident._id,
        isBlocked: false,
        blockReason: undefined,
      });
      Alert.alert('Success', `${resident.firstName} ${resident.lastName} has been unblocked.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to unblock resident. Please try again.');
    }
  };

  const handleDeleteItem = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setShowDeleteModal(true);
    animateIn('delete');
  };

  const confirmBlockResident = async () => {
    if (!blockReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for blocking this resident.');
      return;
    }

    try {
      await setBlockStatus({
        id: selectedItem._id,
        isBlocked: true,
        blockReason: blockReason.trim(),
      });
      Alert.alert('Success', `${selectedItem.firstName} ${selectedItem.lastName} has been blocked.`);
      animateOut('block', () => {
        setShowBlockModal(false);
        setSelectedItem(null);
        setBlockReason('');
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to block resident. Please try again.');
    }
  };

  const confirmDeleteItem = async () => {
    try {
      switch (selectedItem.type) {
        case 'covenant':
          await deleteCovenant({ id: selectedItem._id });
          Alert.alert('Success', 'Covenant deleted successfully.');
          break;
        case 'post':
          await deleteCommunityPost({ id: selectedItem._id });
          Alert.alert('Success', 'Community post deleted successfully.');
          break;
        case 'board':
          await deleteBoardMember({ id: selectedItem._id });
          Alert.alert('Success', 'Board member deleted successfully.');
          break;
        case 'comment':
          await deleteComment({ id: selectedItem._id });
          Alert.alert('Success', 'Comment deleted successfully.');
          break;
        case 'emergency':
          await deleteEmergencyAlert({ id: selectedItem._id });
          Alert.alert('Success', 'Emergency alert deleted successfully.');
          break;
        default:
          Alert.alert('Error', 'Unknown item type.');
      }
      animateOut('delete', () => {
        setShowDeleteModal(false);
        setSelectedItem(null);
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item. Please try again.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Board member handlers
  const handleAddBoardMember = () => {
    setBoardMemberForm({
      name: '',
      position: '',
      email: '',
      phone: '',
      bio: '',
      termEnd: '',
    });
    setBoardMemberImage(null);
    setIsEditingBoardMember(false);
    setShowBoardMemberModal(true);
    animateIn('boardMember');
  };

  const handleEditBoardMember = (member: any) => {
    setBoardMemberForm({
      name: member.name || '',
      position: member.position || '',
      email: member.email || '',
      phone: member.phone || '',
      bio: member.bio || '',
      termEnd: member.termEnd || '',
    });
    setBoardMemberImage(member.image || null);
    setIsEditingBoardMember(true);
    setSelectedItem(member);
    setShowBoardMemberModal(true);
    animateIn('boardMember');
  };

  const handleSaveBoardMember = async () => {
    if (!boardMemberForm.name.trim() || !boardMemberForm.position.trim() || !boardMemberForm.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Position, Email).');
      return;
    }

    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (boardMemberImage) {
        console.log('📸 Uploading board member image...');
        imageUrl = await uploadImage(boardMemberImage);
        console.log('✅ Board member image uploaded:', imageUrl);
      }

      const memberData = {
        ...boardMemberForm,
        image: imageUrl,
      };

      if (isEditingBoardMember) {
        await updateBoardMember({
          id: selectedItem._id,
          ...memberData,
        });
        Alert.alert('Success', 'Board member updated successfully.');
      } else {
        await createBoardMember(memberData);
        Alert.alert('Success', 'Board member added successfully.');
      }
      
      animateOut('boardMember', () => {
        setShowBoardMemberModal(false);
        setBoardMemberForm({
          name: '',
          position: '',
          email: '',
          phone: '',
          bio: '',
          termEnd: '',
        });
        setBoardMemberImage(null);
        setSelectedItem(null);
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save board member. Please try again.');
    }
  };

  const handleCancelBoardMember = () => {
    animateOut('boardMember', () => {
      setShowBoardMemberModal(false);
      setBoardMemberForm({
        name: '',
        position: '',
        email: '',
        phone: '',
        bio: '',
        termEnd: '',
      });
      setBoardMemberImage(null);
      setSelectedItem(null);
    });
  };

  // Emergency alert handlers
  const handleAddEmergencyAlert = () => {
    setEmergencyForm({
      title: '',
      content: '',
      type: 'Alert',
      priority: 'Medium',
      category: 'Other',
      isActive: true,
    });
    setIsEditingEmergency(false);
    setShowEmergencyModal(true);
    animateIn('emergency');
  };

  const handleEditEmergencyAlert = (alert: any) => {
    setEmergencyForm({
      title: alert.title || '',
      content: alert.content || '',
      type: alert.type || 'Alert',
      priority: alert.priority || 'Medium',
      category: alert.category || 'Other',
      isActive: alert.isActive !== undefined ? alert.isActive : true,
    });
    setIsEditingEmergency(true);
    setSelectedItem(alert);
    setShowEmergencyModal(true);
    animateIn('emergency');
  };

  const handleSaveEmergencyAlert = async () => {
    if (!emergencyForm.title.trim() || !emergencyForm.content.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Content).');
      return;
    }

    try {
      if (isEditingEmergency) {
        await updateEmergencyAlert({
          id: selectedItem._id,
          ...emergencyForm,
        });
        Alert.alert('Success', 'Emergency alert updated successfully.');
      } else {
        await createEmergencyAlert(emergencyForm);
        Alert.alert('Success', 'Emergency alert created successfully.');
      }
      
      animateOut('emergency', () => {
        setShowEmergencyModal(false);
        setEmergencyForm({
          title: '',
          content: '',
          type: 'Alert',
          priority: 'Medium',
          category: 'Other',
          isActive: true,
        });
        setSelectedItem(null);
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save emergency alert. Please try again.');
    }
  };

  const handleCancelEmergencyAlert = () => {
    animateOut('emergency', () => {
      setShowEmergencyModal(false);
      setEmergencyForm({
        title: '',
        content: '',
        type: 'Alert',
        priority: 'Medium',
        category: 'Other',
        isActive: true,
      });
      setSelectedItem(null);
    });
  };

  // Fee management handlers
  const handleAddYearFees = async () => {
    try {
      const year = parseInt(yearFeeForm.year);
      const amount = parseFloat(yearFeeForm.amount);
      
      if (!year || !amount) {
        Alert.alert('Error', 'Please enter valid year and amount.');
        return;
      }

      // Call Convex mutation to create annual fees for all homeowners
      const result = await createYearFeesForAllHomeowners({
        year: year,
        amount: amount,
        description: yearFeeForm.description,
      });

      if (result.success) {
        Alert.alert(
          'Year Fees Added', 
          result.message
        );
        
        setShowYearFeeModal(false);
        setYearFeeForm({
          year: new Date().getFullYear().toString(),
          amount: '300',
          description: 'Annual HOA Fee',
        });
      } else {
        Alert.alert('Error', 'Failed to create year fees. Please try again.');
      }
    } catch (error) {
      console.error('Error adding year fees:', error);
      Alert.alert('Error', 'Failed to add year fees. Please try again.');
    }
  };

  const handleAddFine = async () => {
    try {
      const amount = parseFloat(fineForm.amount);
      
      if (!fineForm.selectedAddress || !amount || !fineForm.reason) {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }

      // Find the homeowner ID for the selected address
      const selectedHomeowner = homeownersPaymentStatus?.find(homeowner => 
        `${homeowner.address}${homeowner.unitNumber ? ` Unit ${homeowner.unitNumber}` : ''}` === fineForm.selectedAddress
      );

      if (!selectedHomeowner) {
        Alert.alert('Error', 'Could not find homeowner for selected address.');
        return;
      }

      // Call Convex mutation to add a fine to the selected address
      const result = await addFineToProperty({
        address: fineForm.selectedAddress,
        homeownerId: selectedHomeowner._id,
        amount: amount,
        reason: fineForm.reason,
        description: fineForm.description,
      });

      if (result.success) {
        Alert.alert(
          'Fine Added', 
          result.message
        );
        
        setShowAddFineModal(false);
        setFineForm({
          selectedAddress: '',
          amount: '',
          reason: '',
          description: '',
        });
      } else {
        Alert.alert('Error', 'Failed to add fine. Please try again.');
      }
    } catch (error) {
      console.error('Error adding fine:', error);
      Alert.alert('Error', 'Failed to add fine. Please try again.');
    }
  };

  // Get unique addresses for fine selection
  const getUniqueAddresses = () => {
    if (!homeownersPaymentStatus) return [];
    
    const addresses = homeownersPaymentStatus.map(homeowner => ({
      address: `${homeowner.address}${homeowner.unitNumber ? ` Unit ${homeowner.unitNumber}` : ''}`,
      fullAddress: `${homeowner.address}${homeowner.unitNumber ? ` Unit ${homeowner.unitNumber}` : ''}`,
      homeownerId: homeowner._id,
      homeownerName: `${homeowner.firstName} ${homeowner.lastName}`
    }));
    
    // Remove duplicates based on address
    const uniqueAddresses = addresses.filter((address, index, self) => 
      index === self.findIndex(a => a.address === address.address)
    );
    
    return uniqueAddresses;
  };

  // Covenant handlers
  const handleAddCovenant = async () => {
    try {
      if (!covenantForm.title || !covenantForm.description) {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }

      // Call Convex mutation to create a covenant
      const result = await createCovenant({
        title: covenantForm.title,
        description: covenantForm.description,
        category: covenantForm.category,
        lastUpdated: covenantForm.lastUpdated,
        pdfUrl: covenantForm.pdfUrl || undefined,
      });

      Alert.alert('Success', 'Covenant created successfully!');
      
      setShowCovenantModal(false);
      setShowCategoryDropdown(false);
      animateCategoryDropdownOut();
      setCovenantForm({
        title: '',
        description: '',
        category: 'General',
        lastUpdated: new Date().toLocaleDateString('en-US'),
        pdfUrl: '',
      });
    } catch (error) {
      console.error('Error creating covenant:', error);
      Alert.alert('Error', 'Failed to create covenant. Please try again.');
    }
  };

  const handleEditCovenant = (covenant: any) => {
    setCovenantForm({
      title: covenant.title,
      description: covenant.description,
      category: covenant.category,
      lastUpdated: covenant.lastUpdated,
      pdfUrl: covenant.pdfUrl || '',
    });
    setIsEditingCovenant(true);
    setSelectedItem(covenant);
    setShowCovenantModal(true);
    animateIn('covenant');
  };

  const handleUpdateCovenant = async () => {
    try {
      if (!covenantForm.title || !covenantForm.description) {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }

      // Call Convex mutation to update a covenant
      await updateCovenant({
        id: selectedItem._id,
        title: covenantForm.title,
        description: covenantForm.description,
        category: covenantForm.category,
        lastUpdated: covenantForm.lastUpdated,
        pdfUrl: covenantForm.pdfUrl || undefined,
      });

      Alert.alert('Success', 'Covenant updated successfully!');
      
      setShowCovenantModal(false);
      setIsEditingCovenant(false);
      setShowCategoryDropdown(false);
      animateCategoryDropdownOut();
      setSelectedItem(null);
      setCovenantForm({
        title: '',
        description: '',
        category: 'General',
        lastUpdated: new Date().toLocaleDateString('en-US'),
        pdfUrl: '',
      });
    } catch (error) {
      console.error('Error updating covenant:', error);
      Alert.alert('Error', 'Failed to update covenant. Please try again.');
    }
  };

  const handleCancelCovenant = () => {
    setShowCovenantModal(false);
    setIsEditingCovenant(false);
    setShowCategoryDropdown(false);
    animateCategoryDropdownOut();
    setSelectedItem(null);
    setCovenantForm({
      title: '',
      description: '',
      category: 'General',
      lastUpdated: new Date().toLocaleDateString('en-US'),
      pdfUrl: '',
    });
    animateOut('covenant', () => {});
  };

  // Category dropdown animation functions
  const animateCategoryDropdownIn = () => {
    Animated.parallel([
      Animated.timing(categoryDropdownOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(categoryDropdownScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const animateCategoryDropdownOut = () => {
    Animated.parallel([
      Animated.timing(categoryDropdownOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(categoryDropdownScale, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  // Image upload functions
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBoardMemberImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBoardMemberImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
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
      
      // Get the proper URL from Convex
      const imageUrl = await convex.query(api.storage.getUrl, { storageId });
      return imageUrl || storageId;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  if (!isBoardMember) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.accessDeniedContainer}>
            <Ionicons name="lock-closed" size={64} color="#ef4444" />
            <Text style={styles.accessDeniedTitle}>Access Denied</Text>
            <Text style={styles.accessDeniedText}>
              Only board members can access this administrative area.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'residents':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Residents</Text>
              <Text style={styles.sectionSubtitle}>
                {residents.length} total residents
              </Text>
            </View>
            
            {/* Role Statistics */}
            <View style={styles.roleStatsContainer}>
              <View style={styles.roleStatsRow}>
                <View style={styles.roleStatCard}>
                  <View style={styles.roleStatIcon}>
                    <Ionicons name="people" size={18} color="#10b981" />
                  </View>
                  <Text style={styles.roleStatNumber}>
                    {residents.filter(r => r.isResident && !r.isRenter).length}
                  </Text>
                  <Text style={styles.roleStatLabel}>Homeowners</Text>
                </View>
                
                <View style={styles.roleStatCard}>
                  <View style={styles.roleStatIcon}>
                    <Ionicons name="home" size={18} color="#3b82f6" />
                  </View>
                  <Text style={styles.roleStatNumber}>
                    {residents.filter(r => r.isRenter).length}
                  </Text>
                  <Text style={styles.roleStatLabel}>Renters</Text>
                </View>
                
                <View style={styles.roleStatCard}>
                  <View style={styles.roleStatIcon}>
                    <Ionicons name="shield" size={18} color="#f59e0b" />
                  </View>
                  <Text style={styles.roleStatNumber}>
                    {residents.filter(r => r.isBoardMember).length}
                  </Text>
                  <Text style={styles.roleStatLabel}>Board Members</Text>
                </View>
                
                <View style={styles.roleStatCard}>
                  <View style={styles.roleStatIcon}>
                    <Ionicons name="ban" size={18} color="#ef4444" />
                  </View>
                  <Text style={styles.roleStatNumber}>
                    {residents.filter(r => r.isBlocked).length}
                  </Text>
                  <Text style={styles.roleStatLabel}>Blocked</Text>
                </View>
              </View>
            </View>

            {/* Residents Grid */}
            <FlatList
              data={residents}
              keyExtractor={(item) => item._id}
              numColumns={3}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => {
                // Determine primary role
                let primaryRole = 'Resident';
                let roleIcon = 'person';
                let roleColor = '#6b7280';
                
                if (item.isBlocked) {
                  primaryRole = 'Blocked';
                  roleIcon = 'ban';
                  roleColor = '#ef4444';
                } else if (item.isBoardMember) {
                  primaryRole = 'Board Member';
                  roleIcon = 'shield';
                  roleColor = '#f59e0b';
                } else if (item.isRenter) {
                  primaryRole = 'Renter';
                  roleIcon = 'home';
                  roleColor = '#3b82f6';
                } else if (item.isResident) {
                  primaryRole = 'Homeowner';
                  roleIcon = 'people';
                  roleColor = '#10b981';
                }

                return (
                  <Animated.View 
                    style={[
                      styles.residentGridCard,
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
                    <View style={styles.residentGridCardContent}>
                      {/* Main Info Row - Avatar Left, Details Right */}
                      <View style={styles.residentGridMainInfo}>
                        <View style={styles.residentGridAvatar}>
                          {item.profileImage ? (
                            <Image source={{ uri: item.profileImage }} style={styles.residentGridAvatarImage} />
                          ) : (
                            <View style={styles.residentGridAvatarPlaceholder}>
                              <Text style={styles.residentGridAvatarText}>
                                {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.residentGridDetails}>
                          {/* Name and Role Row */}
                          <View style={styles.residentGridNameRow}>
                            <Text style={styles.residentGridName} numberOfLines={1}>
                              {item.firstName} {item.lastName}
                            </Text>
                            <View style={[styles.residentGridRoleBadge, { backgroundColor: roleColor + '20' }]}>
                              <Ionicons name={roleIcon as any} size={12} color={roleColor} />
                              <Text style={[styles.residentGridRoleText, { color: roleColor }]} numberOfLines={1}>
                                {primaryRole}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Email */}
                          <Text style={styles.residentGridEmail} numberOfLines={1}>
                            {item.email}
                          </Text>
                          
                          {/* Address */}
                          {item.address && (
                            <Text style={styles.residentGridAddress} numberOfLines={1}>
                              {item.address}{item.unitNumber && `, Unit ${item.unitNumber}`}
                            </Text>
                          )}
                          
                        </View>
                      </View>
                      
                      {/* Action Button */}
                      <View style={styles.residentGridActions}>
                        {item.isBlocked ? (
                          <TouchableOpacity
                            style={[styles.residentGridActionButton, styles.unblockButton]}
                            onPress={() => handleUnblockResident(item)}
                          >
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text style={styles.residentGridActionText}>Unblock</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.residentGridActionButton, styles.blockButton]}
                            onPress={() => handleBlockResident(item)}
                          >
                            <Ionicons name="ban" size={16} color="#ef4444" />
                            <Text style={styles.residentGridActionText}>Block</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No residents found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Residents will appear here once they register in the system
                  </Text>
                </View>
              }
            />
          </View>
        );
      
      case 'board':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Board Members</Text>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    animateButtonPress();
                    handleAddBoardMember();
                  }}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add Member</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            <FlatList
              data={boardMembers}
              keyExtractor={(item) => item._id}
              numColumns={2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => {
                // Determine role icon and color
                let roleIcon = 'person';
                let roleColor = '#6b7280';
                
                if (item.position) {
                  if (item.position.toLowerCase().includes('president')) {
                    roleIcon = 'star';
                    roleColor = '#f59e0b';
                  } else if (item.position.toLowerCase().includes('vice')) {
                    roleIcon = 'star-half';
                    roleColor = '#8b5cf6';
                  } else if (item.position.toLowerCase().includes('treasurer')) {
                    roleIcon = 'wallet';
                    roleColor = '#10b981';
                  } else if (item.position.toLowerCase().includes('secretary')) {
                    roleIcon = 'document-text';
                    roleColor = '#3b82f6';
                  } else {
                    roleIcon = 'people';
                    roleColor = '#6b7280';
                  }
                }

                return (
                  <Animated.View 
                    style={[
                      styles.residentGridCard,
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
                    <View style={styles.residentGridCardContent}>
                      {/* Main Info Row - Avatar Left, Details Right */}
                      <View style={styles.residentGridMainInfo}>
                        <View style={styles.residentGridAvatar}>
                          {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.residentGridAvatarImage} />
                          ) : (
                            <View style={styles.residentGridAvatarPlaceholder}>
                              <Text style={styles.residentGridAvatarText}>
                                {item.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.residentGridDetails}>
                          {/* Name and Role Row */}
                          <View style={styles.residentGridNameRow}>
                            <Text style={styles.residentGridName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <View style={[styles.residentGridRoleBadge, { backgroundColor: roleColor + '20' }]}>
                              <Ionicons name={roleIcon as any} size={12} color={roleColor} />
                              <Text style={[styles.residentGridRoleText, { color: roleColor }]} numberOfLines={1}>
                                {item.position || 'Board Member'}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Email */}
                          <Text style={styles.residentGridEmail} numberOfLines={1}>
                            {item.email}
                          </Text>
                          
                          {/* Phone */}
                          {item.phone && (
                            <Text style={styles.residentGridAddress} numberOfLines={1}>
                              {item.phone}
                            </Text>
                          )}
                          
                          {/* Term End */}
                          {item.termEnd && (
                            <Text style={styles.residentGridAddress} numberOfLines={1}>
                              Term: {item.termEnd}
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      {/* Action Buttons */}
                      <View style={styles.residentGridActions}>
                        <View style={styles.boardActionButtons}>
                          <TouchableOpacity
                            style={[styles.boardActionButton, styles.editButton]}
                            onPress={() => handleEditBoardMember(item)}
                          >
                            <Ionicons name="create" size={16} color="#2563eb" />
                            <Text style={styles.residentGridActionText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.boardActionButton, styles.blockButton]}
                            onPress={() => handleDeleteItem(item, 'board')}
                          >
                            <Ionicons name="trash" size={16} color="#ef4444" />
                            <Text style={styles.residentGridActionText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No board members found</Text>
                </View>
              }
            />
          </View>
        );
      
      case 'covenants':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Covenants & Rules</Text>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    animateButtonPress();
                    setShowCovenantModal(true);
                    animateIn('covenant');
                  }}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add Covenant</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            <FlatList
              data={covenants}
              keyExtractor={(item) => item._id}
              numColumns={2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => {
                // Determine covenant icon and color based on category
                let covenantIcon = 'document-text';
                let covenantColor = '#6b7280';
                
                if (item.category === 'Architecture') {
                  covenantIcon = 'home';
                  covenantColor = '#8b5cf6';
                } else if (item.category === 'Landscaping') {
                  covenantIcon = 'leaf';
                  covenantColor = '#10b981';
                } else if (item.category === 'Parking') {
                  covenantIcon = 'car';
                  covenantColor = '#3b82f6';
                } else if (item.category === 'Pets') {
                  covenantIcon = 'paw';
                  covenantColor = '#ef4444';
                } else if (item.category === 'General') {
                  covenantIcon = 'document-text';
                  covenantColor = '#6b7280';
                } else {
                  covenantIcon = 'document-text';
                  covenantColor = '#6b7280';
                }

                return (
                  <Animated.View 
                    style={[
                      styles.residentGridCard,
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
                    <View style={styles.residentGridCardContent}>
                      {/* Main Info Row - Icon Left, Details Right */}
                      <View style={styles.residentGridMainInfo}>
                        <View style={styles.residentGridAvatar}>
                          <View style={[styles.postAvatarPlaceholder, { backgroundColor: covenantColor + '20' }]}>
                            <Ionicons name={covenantIcon as any} size={24} color={covenantColor} />
                          </View>
                        </View>
                        
                        <View style={styles.residentGridDetails}>
                          {/* Title and Category Row */}
                          <View style={styles.residentGridNameRow}>
                            <Text style={styles.residentGridName} numberOfLines={2}>
                              {item.title}
                            </Text>
                            <View style={[styles.residentGridRoleBadge, { backgroundColor: covenantColor + '20' }]}>
                              <Ionicons name={covenantIcon as any} size={12} color={covenantColor} />
                              <Text style={[styles.residentGridRoleText, { color: covenantColor }]} numberOfLines={1}>
                                {item.category}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Last Updated */}
                          {item.lastUpdated && (
                            <Text style={styles.residentGridEmail} numberOfLines={1}>
                              Updated: {item.lastUpdated}
                            </Text>
                          )}
                          
                          {/* Description */}
                          <Text style={styles.residentGridAddress} numberOfLines={3}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Action Buttons */}
                      <View style={styles.residentGridActions}>
                        <View style={styles.boardActionButtons}>
                          <TouchableOpacity
                            style={[styles.boardActionButton, styles.editButton]}
                            onPress={() => handleEditCovenant(item)}
                          >
                            <Ionicons name="create" size={16} color="#2563eb" />
                            <Text style={styles.residentGridActionText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.boardActionButton, styles.blockButton]}
                            onPress={() => handleDeleteItem(item, 'covenant')}
                          >
                            <Ionicons name="trash" size={16} color="#ef4444" />
                            <Text style={styles.residentGridActionText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="document-text" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No covenants found</Text>
                </View>
              }
            />
          </View>
        );
      
      case 'posts':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Community Posts</Text>
            </View>
            <FlatList
              data={communityPosts}
              keyExtractor={(item) => item._id}
              numColumns={2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <Animated.View 
                  style={[
                    styles.residentGridCard,
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
                  <View style={styles.residentGridCardContent}>
                    {/* Main Info Row - Icon Left, Details Right */}
                    <View style={styles.residentGridMainInfo}>
                      <View style={styles.residentGridAvatar}>
                        <View style={styles.postAvatarPlaceholder}>
                          <Ionicons name="document-text" size={24} color="#6b7280" />
                        </View>
                      </View>
                      
                      <View style={styles.residentGridDetails}>
                        {/* Title and Date Row */}
                        <View style={styles.residentGridNameRow}>
                          <Text style={styles.residentGridName} numberOfLines={2}>
                            {item.title}
                          </Text>
                          <Text style={styles.residentGridRoleText} numberOfLines={1}>
                            {formatDate(item.createdAt)}
                          </Text>
                        </View>
                        
                        {/* Author */}
                        <Text style={styles.residentGridEmail} numberOfLines={1}>
                          By: {item.author}
                        </Text>
                        
                        {/* Content */}
                        <Text style={styles.residentGridAddress} numberOfLines={3}>
                          {item.content}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Action Button */}
                    <View style={styles.residentGridActions}>
                      <TouchableOpacity
                        style={[styles.residentGridActionButton, styles.blockButton]}
                        onPress={() => handleDeleteItem(item, 'post')}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                        <Text style={styles.residentGridActionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="document-text" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No posts found</Text>
                </View>
              }
            />
          </View>
        );
      
      case 'comments':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comments</Text>
            </View>
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id}
              numColumns={2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <Animated.View 
                  style={[
                    styles.residentGridCard,
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
                  <View style={styles.residentGridCardContent}>
                    {/* Main Info Row - Icon Left, Details Right */}
                    <View style={styles.residentGridMainInfo}>
                      <View style={styles.residentGridAvatar}>
                        <View style={styles.postAvatarPlaceholder}>
                          <Ionicons name="chatbubble" size={24} color="#6b7280" />
                        </View>
                      </View>
                      
                      <View style={styles.residentGridDetails}>
                        {/* Author and Date Row */}
                        <View style={styles.residentGridNameRow}>
                          <Text style={styles.residentGridName} numberOfLines={1}>
                            {item.author}
                          </Text>
                          <Text style={styles.residentGridRoleText} numberOfLines={1}>
                            {formatDate(item.createdAt)}
                          </Text>
                        </View>
                        
                        {/* Post Title */}
                        <Text style={styles.residentGridEmail} numberOfLines={1}>
                          On: {item.postTitle}
                        </Text>
                        
                        {/* Comment Content */}
                        <Text style={styles.residentGridAddress} numberOfLines={3}>
                          {item.content}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Action Button */}
                    <View style={styles.residentGridActions}>
                      <TouchableOpacity
                        style={[styles.residentGridActionButton, styles.blockButton]}
                        onPress={() => handleDeleteItem(item, 'comment')}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                        <Text style={styles.residentGridActionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubble" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No comments found</Text>
                </View>
              }
            />
          </View>
        );
      
      case 'emergency':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Alerts</Text>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    animateButtonPress();
                    handleAddEmergencyAlert();
                  }}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.addButtonText}>New Alert</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            <FlatList
              data={emergencyAlerts}
              keyExtractor={(item) => item._id}
              numColumns={2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => {
                // Determine alert icon and color based on type
                let alertIcon = 'warning';
                let alertColor = '#f59e0b';
                
                if (item.type === 'Emergency') {
                  alertIcon = 'alert-circle';
                  alertColor = '#ef4444';
                } else if (item.type === 'Alert') {
                  alertIcon = 'warning';
                  alertColor = '#f59e0b';
                } else {
                  alertIcon = 'information-circle';
                  alertColor = '#3b82f6';
                }

                return (
                  <Animated.View 
                    style={[
                      styles.residentGridCard,
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
                    <View style={styles.residentGridCardContent}>
                      {/* Main Info Row - Icon Left, Details Right */}
                      <View style={styles.residentGridMainInfo}>
                        <View style={styles.residentGridAvatar}>
                          <View style={[styles.postAvatarPlaceholder, { backgroundColor: alertColor + '20' }]}>
                            <Ionicons name={alertIcon as any} size={24} color={alertColor} />
                          </View>
                        </View>
                        
                        <View style={styles.residentGridDetails}>
                          {/* Title and Date Row */}
                          <View style={styles.residentGridNameRow}>
                            <Text style={styles.residentGridName} numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text style={styles.residentGridRoleText} numberOfLines={1}>
                              {formatDate(item.createdAt)}
                            </Text>
                          </View>
                          
                          {/* Category */}
                          <Text style={styles.residentGridEmail} numberOfLines={1}>
                            {item.category}
                          </Text>
                          
                          {/* Indicators Row - Type, Priority, and Active Status */}
                          <View style={styles.emergencyIndicatorsRow}>
                            {/* Type Badge */}
                            <View style={[styles.emergencyIndicatorBadge, { 
                              backgroundColor: item.type === 'Emergency' ? '#ef444420' : 
                                             item.type === 'Alert' ? '#f59e0b20' : '#3b82f620'
                            }]}>
                              <Ionicons 
                                name="information-circle" 
                                size={8} 
                                color={item.type === 'Emergency' ? '#ef4444' : 
                                       item.type === 'Alert' ? '#f59e0b' : '#3b82f6'} 
                              />
                              <Text style={[styles.emergencyIndicatorText, { 
                                color: item.type === 'Emergency' ? '#ef4444' : 
                                       item.type === 'Alert' ? '#f59e0b' : '#3b82f6'
                              }]} numberOfLines={1}>
                                {item.type}
                              </Text>
                            </View>
                            
                            {/* Priority Badge */}
                            <View style={[styles.emergencyIndicatorBadge, { 
                              backgroundColor: item.priority === 'High' ? '#ef444420' : 
                                             item.priority === 'Medium' ? '#f59e0b20' : '#10b98120'
                            }]}>
                              <Ionicons 
                                name="flag" 
                                size={8} 
                                color={item.priority === 'High' ? '#ef4444' : 
                                       item.priority === 'Medium' ? '#f59e0b' : '#10b981'} 
                              />
                              <Text style={[styles.emergencyIndicatorText, { 
                                color: item.priority === 'High' ? '#ef4444' : 
                                       item.priority === 'Medium' ? '#f59e0b' : '#10b981'
                              }]} numberOfLines={1}>
                                {item.priority}
                              </Text>
                            </View>
                            
                            {/* Active Status Badge */}
                            {item.isActive && (
                              <View style={[styles.emergencyIndicatorBadge, { 
                                backgroundColor: '#10b98120'
                              }]}>
                                <Ionicons 
                                  name="checkmark-circle" 
                                  size={8} 
                                  color="#10b981" 
                                />
                                <Text style={[styles.emergencyIndicatorText, { 
                                  color: '#10b981'
                                }]} numberOfLines={1}>
                                  Active
                                </Text>
                              </View>
                            )}
                          </View>
                          
                          {/* Content */}
                          <Text style={styles.residentGridAddress} numberOfLines={3}>
                            {item.content}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Action Buttons */}
                      <View style={styles.residentGridActions}>
                        <View style={styles.boardActionButtons}>
                          <TouchableOpacity
                            style={[styles.boardActionButton, styles.editButton]}
                            onPress={() => handleEditEmergencyAlert(item)}
                          >
                            <Ionicons name="create" size={16} color="#2563eb" />
                            <Text style={styles.residentGridActionText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.boardActionButton, styles.blockButton]}
                            onPress={() => handleDeleteItem(item, 'emergency')}
                          >
                            <Ionicons name="trash" size={16} color="#ef4444" />
                            <Text style={styles.residentGridActionText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="warning" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No emergency alerts found</Text>
                </View>
              }
            />
          </View>
        );
      
      case 'fees':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={true} persistentScrollbar={true}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fees Status</Text>
              <View style={styles.adminFeeButtonsContainer}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={styles.adminFeeButton}
                    onPress={() => {
                      animateButtonPress();
                      setShowYearFeeModal(true);
                      animateIn('yearFee');
                    }}
                  >
                    <Ionicons name="calendar" size={16} color="#ffffff" />
                    <Text style={styles.adminFeeButtonText}>Add Year Fees</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[styles.adminFeeButton, styles.addFineButton]}
                    onPress={() => {
                      animateButtonPress();
                      setShowAddFineModal(true);
                      animateIn('addFine');
                    }}
                  >
                    <Ionicons name="warning" size={16} color="#ffffff" />
                    <Text style={styles.adminFeeButtonText}>Add Fine</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
            
               {/* Fee Statistics */}
               <View style={styles.feeStatsContainer}>
                 <View style={styles.feeStatsSection}>
                   {/* Fees Row */}
                   <View style={styles.feeStatsRow}>
                     <View style={styles.feeStatCard}>
                       <Text style={styles.feeStatLabel}>Total Fees</Text>
                       <Text style={styles.feeStatValue}>{allFeesFromDatabase.length}</Text>
                     </View>
                     <View style={styles.feeStatCard}>
                       <Text style={styles.feeStatLabel}>Paid Fees</Text>
                       <Text style={[styles.feeStatValue, { color: '#10b981' }]}>
                         {allFeesFromDatabase.filter((fee: any) => fee.status === 'Paid').length}
                       </Text>
                     </View>
                     <View style={styles.feeStatCard}>
                       <Text style={styles.feeStatLabel}>Unpaid Fees</Text>
                       <Text style={[styles.feeStatValue, { color: '#f59e0b' }]}>
                         {allFeesFromDatabase.filter((fee: any) => fee.status !== 'Paid').length}
                       </Text>
                     </View>
                   </View>

                   {/* Fines Row */}
                   <View style={styles.feeStatsRow}>
                     <View style={styles.feeStatCard}>
                       <Text style={styles.feeStatLabel}>Total Fines</Text>
                       <Text style={styles.feeStatValue}>{allFinesFromDatabase.length}</Text>
                     </View>
                     <View style={styles.feeStatCard}>
                       <Text style={styles.feeStatLabel}>Paid Fines</Text>
                       <Text style={[styles.feeStatValue, { color: '#10b981' }]}>
                         {allFinesFromDatabase.filter((fine: any) => fine.status === 'Paid').length}
                       </Text>
                     </View>
                     <View style={styles.feeStatCard}>
                       <Text style={styles.feeStatLabel}>Unpaid Fines</Text>
                       <Text style={[styles.feeStatValue, { color: '#dc2626' }]}>
                         {allFinesFromDatabase.filter((fine: any) => fine.status !== 'Paid').length}
                       </Text>
                     </View>
                   </View>
                 </View>
               </View>

            
            {/* Fees and Fines Status Grid */}
            <FlatList
              data={homeownersPaymentStatus}
              keyExtractor={(item) => item._id}
              numColumns={2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => {
                const homeowner = item as any;
                // Get fines for this homeowner
                const homeownerFines = allFinesFromDatabase.filter((fine: any) => fine.residentId === homeowner._id);
                  return (
                    <Animated.View 
                      style={[
                        styles.gridCard,
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
                      <View style={styles.gridCardContent}>
                        <View style={styles.gridProfileSection}>
                          <View style={styles.gridProfileImage}>
                            {homeowner.profileImage ? (
                              <Image source={{ uri: homeowner.profileImage }} style={styles.gridProfileImageSrc} />
                            ) : (
                              <View style={styles.gridProfilePlaceholder}>
                                <Text style={styles.gridProfileText}>
                                  {homeowner.firstName.charAt(0)}{homeowner.lastName.charAt(0)}
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.gridProfileInfo}>
                            <Text style={styles.gridName} numberOfLines={1}>
                              {homeowner.firstName} {homeowner.lastName}
                            </Text>
                            <Text style={styles.gridRole} numberOfLines={1}>
                              {homeowner.userType === 'board-member' ? 'Board Member' : 'Homeowner'}
                            </Text>
                            <Text style={styles.gridAddress} numberOfLines={1}>
                              {homeowner.address} {homeowner.unitNumber && `Unit ${homeowner.unitNumber}`}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.gridFeeSection}>
                          <Text style={styles.gridFeeAmount}>${homeowner.annualFeeAmount}</Text>
                          <Text style={styles.gridFeeLabel}>Annual Fee</Text>
                          <View style={[
                            styles.gridStatusBadge,
                            homeowner.hasPaidAnnualFee ? styles.gridPaidBadge : styles.gridPendingBadge
                          ]}>
                            <Ionicons 
                              name={homeowner.hasPaidAnnualFee ? "checkmark-circle" : "time"} 
                              size={14} 
                              color={homeowner.hasPaidAnnualFee ? "#10b981" : "#f59e0b"} 
                            />
                            <Text style={[
                              styles.gridStatusText,
                              { color: homeowner.hasPaidAnnualFee ? "#10b981" : "#f59e0b" }
                            ]}>
                              {homeowner.hasPaidAnnualFee ? 'Paid' : 'Pending'}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Show fines for this homeowner */}
                        {homeownerFines.length > 0 && (
                          <View style={styles.gridFinesSection}>
                            <View style={styles.gridFinesHeader}>
                              <Ionicons name="warning" size={14} color="#dc2626" />
                              <Text style={styles.gridFinesLabel}>Fines ({homeownerFines.length})</Text>
                            </View>
                            <View style={styles.gridFinesList}>
                              {homeownerFines.map((fine: any, index: number) => (
                                <View key={fine._id} style={[
                                  styles.gridFineItem,
                                  index === homeownerFines.length - 1 && styles.gridFineItemLast
                                ]}>
                                  <View style={styles.gridFineLeft}>
                                    <Text style={styles.gridFineTitle} numberOfLines={1}>
                                      {fine.violation}
                                    </Text>
                                    <Text style={styles.gridFineDate}>
                                      Issued: {fine.dateIssued}
                                    </Text>
                                  </View>
                                  <View style={styles.gridFineRight}>
                                    <Text style={styles.gridFineAmount}>${fine.amount}</Text>
                                    <View style={[
                                      styles.gridFineStatusBadge,
                                      fine.status === 'Paid' ? styles.gridFineStatusPaid : styles.gridFineStatusPending
                                    ]}>
                                      <Ionicons 
                                        name={fine.status === 'Paid' ? "checkmark-circle" : "warning"} 
                                        size={10} 
                                        color={fine.status === 'Paid' ? "#10b981" : "#dc2626"} 
                                      />
                                      <Text style={[
                                        styles.gridFineStatusText,
                                        { color: fine.status === 'Paid' ? "#10b981" : "#dc2626" }
                                      ]}>
                                        {fine.status || 'Pending'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    </Animated.View>
                  );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="card" size={48} color="#9ca3af" />
                  <Text style={styles.emptyStateText}>No homeowners found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Homeowners will appear here once they are registered in the system
                  </Text>
                </View>
              }
            />



          </ScrollView>
        );
      
      default:
        return null;
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
        
        <ScrollView 
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
        >
          {/* Header with ImageBackground */}
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
                  <Text style={styles.headerTitle}>Admin Dashboard</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                  Manage community content and residents
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

        {/* Folder Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.folderTabs}
          contentContainerStyle={styles.folderTabsContent}
        >
          <TouchableOpacity
            style={[styles.folderTab, activeTab === 'residents' && styles.activeFolderTab]}
            onPress={() => setActiveTab('residents')}
          >
            <Ionicons name="people" size={20} color={activeTab === 'residents' ? '#2563eb' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'residents' && styles.activeFolderTabText]}>
              Residents ({residents.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.folderTab, activeTab === 'board' && styles.activeFolderTab]}
            onPress={() => setActiveTab('board')}
          >
            <Ionicons name="shield" size={20} color={activeTab === 'board' ? '#2563eb' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'board' && styles.activeFolderTabText]}>
              Board ({boardMembers.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.folderTab, activeTab === 'covenants' && styles.activeFolderTab]}
            onPress={() => setActiveTab('covenants')}
          >
            <Ionicons name="document-text" size={20} color={activeTab === 'covenants' ? '#2563eb' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'covenants' && styles.activeFolderTabText]}>
              Covenants ({covenants.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.folderTab, activeTab === 'posts' && styles.activeFolderTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons name="chatbubbles" size={20} color={activeTab === 'posts' ? '#2563eb' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'posts' && styles.activeFolderTabText]}>
              Posts ({communityPosts.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.folderTab, activeTab === 'comments' && styles.activeFolderTab]}
            onPress={() => setActiveTab('comments')}
          >
            <Ionicons name="chatbox" size={20} color={activeTab === 'comments' ? '#2563eb' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'comments' && styles.activeFolderTabText]}>
              Comments ({comments.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.folderTab, activeTab === 'emergency' && styles.activeFolderTab]}
            onPress={() => setActiveTab('emergency')}
          >
            <Ionicons name="warning" size={20} color={activeTab === 'emergency' ? '#2563eb' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'emergency' && styles.activeFolderTabText]}>
              Emergency ({emergencyAlerts.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.folderTab, activeTab === 'fees' && styles.activeFolderTab]}
            onPress={() => setActiveTab('fees')}
          >
            <Ionicons name="card" size={20} color={activeTab === 'fees' ? '#2563eb' : '#6b7280'} />
              <Text style={[styles.folderTabText, activeTab === 'fees' && styles.activeFolderTabText]}>
                Fees ({allFeesFromDatabase.length + allFinesFromDatabase.length})
              </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {renderTabContent()}
        </View>

        {/* Block Modal */}
        <Modal
          visible={showBlockModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => animateOut('block', () => setShowBlockModal(false))}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.modalContent,
              {
                opacity: blockModalOpacity,
                transform: [{ translateY: blockModalTranslateY }],
              }
            ]}>
              <Text style={styles.modalTitle}>Block Resident</Text>
              <Text style={styles.modalSubtitle}>
                Blocking {selectedItem?.firstName} {selectedItem?.lastName}
              </Text>
              
              <Text style={styles.inputLabel}>Reason for Blocking *</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter reason for blocking this resident..."
                value={blockReason}
                onChangeText={setBlockReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => animateOut('block', () => setShowBlockModal(false))}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmBlockResident}
                >
                  <Text style={styles.confirmButtonText}>Block Resident</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Delete Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => animateOut('delete', () => setShowDeleteModal(false))}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.modalContent,
              {
                opacity: deleteModalOpacity,
                transform: [{ translateY: deleteModalTranslateY }],
              }
            ]}>
              <Text style={styles.modalTitle}>Delete Item</Text>
              <Text style={styles.modalSubtitle}>
                Are you sure you want to delete this {selectedItem?.type}?
              </Text>
              
              <Text style={styles.warningText}>
                This action cannot be undone.
              </Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => animateOut('delete', () => setShowDeleteModal(false))}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={confirmDeleteItem}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Board Member Modal */}
        <Modal
          visible={showBoardMemberModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCancelBoardMember}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.boardMemberModalContent,
              {
                opacity: boardMemberModalOpacity,
                transform: [{ translateY: boardMemberModalTranslateY }],
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditingBoardMember ? 'Edit Board Member' : 'Add Board Member'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancelBoardMember}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter full name"
                    value={boardMemberForm.name}
                    onChangeText={(text) => setBoardMemberForm(prev => ({ ...prev, name: text }))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Profile Picture (Optional)</Text>
                  <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                      {boardMemberImage ? (
                        <View style={styles.imageWrapper}>
                          <Image 
                            source={{ uri: boardMemberImage }} 
                            style={styles.previewImage}
                            resizeMode="cover"
                          />
                          <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={() => setBoardMemberImage(null)}
                          >
                            <Ionicons name="close" size={16} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Ionicons name="person" size={40} color="#9ca3af" />
                        </View>
                      )}
                    </View>
                    <View style={styles.imageButtons}>
                      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                        <Ionicons name="image" size={20} color="#2563eb" />
                        <Text style={styles.imageButtonText}>Choose Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                        <Ionicons name="camera" size={20} color="#2563eb" />
                        <Text style={styles.imageButtonText}>Take Photo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Position *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., President, Vice President, Treasurer"
                    value={boardMemberForm.position}
                    onChangeText={(text) => setBoardMemberForm(prev => ({ ...prev, position: text }))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter email address"
                    value={boardMemberForm.email}
                    onChangeText={(text) => setBoardMemberForm(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter phone number"
                    value={boardMemberForm.phone}
                    onChangeText={(text) => setBoardMemberForm(prev => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bio (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter a brief bio or description"
                    value={boardMemberForm.bio}
                    onChangeText={(text) => setBoardMemberForm(prev => ({ ...prev, bio: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Term End (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., December 2024"
                    value={boardMemberForm.termEnd}
                    onChangeText={(text) => setBoardMemberForm(prev => ({ ...prev, termEnd: text }))}
                    autoCapitalize="words"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelBoardMember}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleSaveBoardMember}
                >
                  <Text style={styles.confirmButtonText}>
                    {isEditingBoardMember ? 'Update' : 'Add'} Member
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Emergency Alert Modal */}
        <Modal
          visible={showEmergencyModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCancelEmergencyAlert}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.emergencyModalContent,
              {
                opacity: emergencyModalOpacity,
                transform: [{ translateY: emergencyModalTranslateY }],
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditingEmergency ? 'Edit Emergency Alert' : 'Create Emergency Alert'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancelEmergencyAlert}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Title *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter alert title"
                    value={emergencyForm.title}
                    onChangeText={(text) => setEmergencyForm(prev => ({ ...prev, title: text }))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Content *</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter alert content"
                    value={emergencyForm.content}
                    onChangeText={(text) => setEmergencyForm(prev => ({ ...prev, content: text }))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Type</Text>
                  <View style={styles.radioGroup}>
                    {['Emergency', 'Alert', 'Info'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.radioButton,
                          emergencyForm.type === type && styles.radioButtonActive
                        ]}
                        onPress={() => setEmergencyForm(prev => ({ ...prev, type: type as any }))}
                      >
                        <Text style={[
                          styles.radioButtonText,
                          emergencyForm.type === type && styles.radioButtonTextActive
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Priority</Text>
                  <View style={styles.radioGroup}>
                    {['High', 'Medium', 'Low'].map((priority) => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.radioButton,
                          emergencyForm.priority === priority && styles.radioButtonActive
                        ]}
                        onPress={() => setEmergencyForm(prev => ({ ...prev, priority: priority as any }))}
                      >
                        <Text style={[
                          styles.radioButtonText,
                          emergencyForm.priority === priority && styles.radioButtonTextActive
                        ]}>
                          {priority}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.radioGroup}>
                    {['Security', 'Maintenance', 'Event', 'Lost Pet', 'Other'].map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.radioButton,
                          emergencyForm.category === category && styles.radioButtonActive
                        ]}
                        onPress={() => setEmergencyForm(prev => ({ ...prev, category: category as any }))}
                      >
                        <Text style={[
                          styles.radioButtonText,
                          emergencyForm.category === category && styles.radioButtonTextActive
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxButton,
                      emergencyForm.isActive && styles.checkboxButtonActive
                    ]}
                    onPress={() => setEmergencyForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  >
                    <Ionicons 
                      name={emergencyForm.isActive ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={emergencyForm.isActive ? "#2563eb" : "#6b7280"} 
                    />
                    <Text style={[
                      styles.checkboxText,
                      emergencyForm.isActive && styles.checkboxTextActive
                    ]}>
                      Active Alert
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEmergencyAlert}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleSaveEmergencyAlert}
                >
                  <Text style={styles.confirmButtonText}>
                    {isEditingEmergency ? 'Update' : 'Create'} Alert
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Year Fee Modal */}
        <Modal
          visible={showYearFeeModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => animateOut('yearFee', () => setShowYearFeeModal(false))}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.emergencyModalContent,
              {
                opacity: yearFeeModalOpacity,
                transform: [{ translateY: yearFeeModalTranslateY }],
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Year Fees</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => animateOut('yearFee', () => setShowYearFeeModal(false))}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Year *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter year (e.g., 2024)"
                    value={yearFeeForm.year}
                    onChangeText={(text) => setYearFeeForm(prev => ({ ...prev, year: text }))}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Amount ($) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter fee amount"
                    value={yearFeeForm.amount}
                    onChangeText={(text) => setYearFeeForm(prev => ({ ...prev, amount: text }))}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter fee description"
                    value={yearFeeForm.description}
                    onChangeText={(text) => setYearFeeForm(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => animateOut('yearFee', () => setShowYearFeeModal(false))}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleAddYearFees}
                  >
                    <Text style={styles.confirmButtonText}>Add Year Fees</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Add Fine Modal */}
        <Modal
          visible={showAddFineModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => animateOut('addFine', () => setShowAddFineModal(false))}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.emergencyModalContent,
              {
                opacity: addFineModalOpacity,
                transform: [{ translateY: addFineModalTranslateY }],
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Fine to Property</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => animateOut('addFine', () => setShowAddFineModal(false))}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Select Property Address *</Text>
                  <ScrollView style={styles.addressSelector} nestedScrollEnabled>
                    {getUniqueAddresses().map((address, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.addressOption,
                          fineForm.selectedAddress === address.address && styles.addressOptionSelected
                        ]}
                        onPress={() => setFineForm(prev => ({ ...prev, selectedAddress: address.address }))}
                      >
                        <Text style={[
                          styles.addressOptionText,
                          fineForm.selectedAddress === address.address && styles.addressOptionTextSelected
                        ]}>
                          {address.address}
                        </Text>
                        <Text style={[
                          styles.addressOptionSubtext,
                          fineForm.selectedAddress === address.address && styles.addressOptionSubtextSelected
                        ]}>
                          {address.homeownerName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Fine Amount ($) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter fine amount"
                    value={fineForm.amount}
                    onChangeText={(text) => setFineForm(prev => ({ ...prev, amount: text }))}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reason for Fine *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter reason for fine"
                    value={fineForm.reason}
                    onChangeText={(text) => setFineForm(prev => ({ ...prev, reason: text }))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter additional details"
                    value={fineForm.description}
                    onChangeText={(text) => setFineForm(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>


                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => animateOut('addFine', () => setShowAddFineModal(false))}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleAddFine}
                  >
                    <Text style={styles.confirmButtonText}>Add Fine</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Covenant Modal */}
        <Modal
          visible={showCovenantModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCancelCovenant}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.boardMemberModalContent,
              {
                opacity: covenantModalOpacity,
                transform: [{ translateY: covenantModalTranslateY }],
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditingCovenant ? 'Edit Covenant' : 'Add Covenant'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancelCovenant}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Title *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter covenant title"
                    value={covenantForm.title}
                    onChangeText={(text) => setCovenantForm(prev => ({ ...prev, title: text }))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category *</Text>
                  <TouchableOpacity
                    style={styles.categoryPicker}
                    onPress={() => {
                      if (showCategoryDropdown) {
                        setShowCategoryDropdown(false);
                        animateCategoryDropdownOut();
                      } else {
                        setShowCategoryDropdown(true);
                        animateCategoryDropdownIn();
                      }
                    }}
                  >
                    <Text style={styles.categoryPickerText}>{covenantForm.category}</Text>
                    <Ionicons 
                      name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                  
                  {showCategoryDropdown && (
                    <Animated.View 
                      style={[
                        styles.categoryDropdown,
                        {
                          opacity: categoryDropdownOpacity,
                          transform: [{ scale: categoryDropdownScale }]
                        }
                      ]}
                    >
                      {['Architecture', 'Landscaping', 'Parking', 'Pets', 'General'].map((category, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.categoryOption,
                            covenantForm.category === category && styles.categoryOptionSelected
                          ]}
                          onPress={() => {
                            setCovenantForm(prev => ({ ...prev, category: category as any }));
                            setShowCategoryDropdown(false);
                            animateCategoryDropdownOut();
                          }}
                        >
                          <Text style={[
                            styles.categoryOptionText,
                            covenantForm.category === category && styles.categoryOptionTextSelected
                          ]}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter covenant description"
                    value={covenantForm.description}
                    onChangeText={(text) => setCovenantForm(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Updated</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter last updated date"
                    value={covenantForm.lastUpdated}
                    onChangeText={(text) => setCovenantForm(prev => ({ ...prev, lastUpdated: text }))}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PDF URL (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter PDF document URL"
                    value={covenantForm.pdfUrl}
                    onChangeText={(text) => setCovenantForm(prev => ({ ...prev, pdfUrl: text }))}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelCovenant}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={isEditingCovenant ? handleUpdateCovenant : handleAddCovenant}
                  >
                    <Text style={styles.confirmButtonText}>
                      {isEditingCovenant ? 'Update Covenant' : 'Add Covenant'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </Modal>

        </ScrollView>
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
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
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
  folderTabs: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 60, // Limit height to match original design
  },
  folderTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingRight: 40, // Extra padding to ensure last tab is fully visible
    alignItems: 'center',
    minHeight: 60, // Ensure consistent height
  },
  folderTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 100, // Reduced minimum width for better fit
    flexShrink: 0, // Prevent tabs from shrinking
  },
  activeFolderTab: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  folderTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  activeFolderTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    padding: 20,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rowContent: {
    flex: 1,
  },
  residentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  residentInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  rowDetail: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  rowDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  boardMemberBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  blockedBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  rowActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Board member modal styles
  boardMemberModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    maxHeight: 400,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#eff6ff',
    marginRight: 8,
  },
  tabContent: {
    flex: 1,
  },
  // Board member display styles
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberInfo: {
    flex: 1,
  },
  bioText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Image upload styles
  imageSection: {
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  // Emergency alert styles
  emergencyModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highBadge: {
    backgroundColor: '#ef4444',
  },
  mediumBadge: {
    backgroundColor: '#f59e0b',
  },
  lowBadge: {
    backgroundColor: '#10b981',
  },
  emergencyBadge: {
    backgroundColor: '#dc2626',
  },
  alertBadge: {
    backgroundColor: '#f59e0b',
  },
  infoBadge: {
    backgroundColor: '#3b82f6',
  },
  activeBadge: {
    backgroundColor: '#10b981',
  },
  // Radio button styles
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  radioButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  radioButtonTextActive: {
    color: '#ffffff',
  },
  // Checkbox styles
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  checkboxButtonActive: {
    // Add any active state styling if needed
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  checkboxTextActive: {
    color: '#2563eb',
  },
  // Fee management styles
  feeStatsContainer: {
    marginBottom: 24,
  },
  feeStatsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feeStatsSectionTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  feeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  feeStatCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flex: 1,
  },
  feeStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  feeStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  feeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  feeAmount: {
    alignItems: 'center',
  },
  feeAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  feeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentStatusContainer: {
    alignItems: 'center',
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidBadge: {
    backgroundColor: '#d1fae5',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  paidText: {
    color: '#065f46',
  },
  pendingText: {
    color: '#92400e',
  },
  profileImageText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  rowDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  // Enhanced fee management styles
  feeHeader: {
    flex: 1,
  },
  feeDueDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  feeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    margin: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Grid layout styles
  gridCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '47%',
  },
  gridCardContent: {
    padding: 12,
  },
  gridProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridProfileImage: {
    marginRight: 8,
  },
  gridProfileImageSrc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gridProfilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridProfileText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  gridProfileInfo: {
    flex: 1,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  gridRole: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 1,
  },
  gridAddress: {
    fontSize: 10,
    color: '#9ca3af',
  },
  gridFeeSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  gridFeeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  gridFeeLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 6,
  },
  gridStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridPaidBadge: {
    backgroundColor: '#d1fae5',
  },
  gridPendingBadge: {
    backgroundColor: '#fef3c7',
  },
  gridStatusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Admin fee management buttons
  adminFeeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  adminFeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addFineButton: {
    backgroundColor: '#dc2626',
  },
  adminFeeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Address selector styles for fine modal
  addressSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  addressOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  addressOptionSelected: {
    backgroundColor: '#dbeafe',
    borderBottomColor: '#3b82f6',
  },
  addressOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  addressOptionTextSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  addressOptionSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  addressOptionSubtextSelected: {
    color: '#3b82f6',
  },
  // Category picker styles
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  categoryPickerText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  categoryDropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 200,
    overflow: 'hidden',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '400',
  },
  categoryOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  // Fee and fine list styles
  feesList: {
    maxHeight: 300,
  },
  feeItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fineItem: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  feeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  feeItemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  feeItemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  feeItemDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  // Grid fines section styles
  gridFinesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  gridFinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridFinesLabel: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  gridFinesList: {
    gap: 8,
  },
  gridFineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gridFineItemLast: {
    marginBottom: 0,
  },
  gridFineLeft: {
    flex: 1,
    marginRight: 8,
  },
  gridFineTitle: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridFineDate: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '400',
  },
  gridFineRight: {
    alignItems: 'flex-end',
  },
  gridFineAmount: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '700',
    marginBottom: 4,
  },
  gridFineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 60,
    justifyContent: 'center',
  },
  gridFineStatusPaid: {
    backgroundColor: '#d1fae5',
  },
  gridFineStatusPending: {
    backgroundColor: '#fef2f2',
  },
  gridFineStatusText: {
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Role statistics styles
  roleStatsContainer: {
    marginBottom: 16,
  },
  roleStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  roleStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  roleStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  roleStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Resident card styles
  residentCard: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  residentCardContent: {
    padding: 12,
  },
  residentMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  residentAvatar: {
    marginRight: 12,
  },
  residentAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  residentAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  residentAvatarText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  residentDetails: {
    flex: 1,
  },
  residentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  primaryRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  primaryRoleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  residentEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  residentAddress: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  secondaryRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  secondaryRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 3,
  },
  secondaryRoleText: {
    fontSize: 10,
    fontWeight: '500',
  },
  residentActions: {
    alignItems: 'flex-end',
  },
  unblockButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  blockButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    color: '#374151',
  },
  // Grid-specific resident card styles
  residentGridCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    maxWidth: '48%',
    minHeight: 140,
  },
  residentGridCardContent: {
    padding: 10,
    height: '100%',
    justifyContent: 'space-between',
  },
  residentGridMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  residentGridAvatar: {
    marginRight: 8,
  },
  residentGridAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  residentGridAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  residentGridAvatarText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  residentGridDetails: {
    flex: 1,
  },
  residentGridNameRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 4,
    minHeight: 32,
  },
  residentGridName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    width: '100%',
    marginBottom: 4,
    lineHeight: 15,
  },
  residentGridRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
    alignSelf: 'flex-start',
  },
  residentGridRoleText: {
    fontSize: 9,
    fontWeight: '600',
  },
  residentGridEmail: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
    lineHeight: 12,
  },
  residentGridAddress: {
    fontSize: 9,
    color: '#9ca3af',
    marginBottom: 4,
    lineHeight: 11,
  },
  residentGridActions: {
    alignItems: 'flex-end',
  },
  residentGridActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  residentGridActionText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#374151',
  },
  // Board-specific action button styles
  boardActionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  boardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  // Post/Comment/Emergency avatar placeholder
  postAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Emergency indicators layout
  emergencyIndicatorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: 4,
  },
  emergencyIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  emergencyIndicatorText: {
    fontSize: 8,
    fontWeight: '600',
  },
});

export default AdminScreen;