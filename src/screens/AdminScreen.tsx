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
  ActivityIndicator,
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
import ProfileImage from '../components/ProfileImage';
import OptimizedImage from '../components/OptimizedImage';
import { getUploadReadyImage } from '../utils/imageUpload';

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
  const homeownersPaymentStatus = useQuery(api.fees.getAllHomeownersPaymentStatus) ?? [];
  const allFeesFromDatabase = useQuery(api.fees.getAll) ?? [];
  const allFinesFromDatabase = useQuery(api.fees.getAllFines) ?? [];
  const polls = useQuery(api.polls.getAll) ?? [];
  const pendingVenmoPayments = useQuery(api.payments.getPendingVenmoPayments) ?? [];
  const pets = useQuery(api.pets.getAll) ?? [];
  const hoaInfo = useQuery(api.hoaInfo.get) ?? null;

  // Load HOA info into form when it's available
  useEffect(() => {
    if (hoaInfo) {
      setHoaInfoForm({
        name: hoaInfo.name || '',
        address: hoaInfo.address || '',
        phone: hoaInfo.phone || '',
        email: hoaInfo.email || '',
        website: hoaInfo.website || '',
        officeHours: hoaInfo.officeHours || '',
        emergencyContact: hoaInfo.emergencyContact || '',
        eventText: (hoaInfo as any).eventText || '',
      });
    }
  }, [hoaInfo]);
  
  // Mutations
  const setBlockStatus = useMutation(api.residents.setBlockStatus);
  const deleteCovenant = useMutation(api.covenants.remove);
  const deleteCommunityPost = useMutation(api.communityPosts.remove);
  const deleteBoardMember = useMutation(api.boardMembers.remove);
  const deleteComment = useMutation(api.communityPosts.removeComment);
  const createBoardMember = useMutation(api.boardMembers.create);
  const updateBoardMember = useMutation(api.boardMembers.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  // Fee management mutations
  const createYearFeesForAllHomeowners = useMutation(api.fees.createYearFeesForAllHomeowners);
  const addFineToProperty = useMutation(api.fees.addFineToProperty);
  
  // Covenant management mutations
  const createCovenant = useMutation(api.covenants.create);
  const updateCovenant = useMutation(api.covenants.update);
  
  // Poll management mutations
  const createPoll = useMutation(api.polls.create);
  const updatePoll = useMutation(api.polls.update);
  const deletePoll = useMutation(api.polls.remove);
  const togglePollActive = useMutation(api.polls.toggleActive);
  
  // Payment management mutations
  const verifyVenmoPayment = useMutation(api.payments.verifyVenmoPayment);
  
  // Pet management mutations
  const deletePet = useMutation(api.pets.remove);
  const updatePet = useMutation(api.pets.update);
  
  // HOA Info management mutation
  const upsertHoaInfo = useMutation(api.hoaInfo.upsert);
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'SheltonHOA' | 'residents' | 'board' | 'covenants' | 'Community' | 'fees'>('SheltonHOA');
  const [postsSubTab, setPostsSubTab] = useState<'posts' | 'comments' | 'polls' | 'pets' | 'complaints'>('posts');
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
    category: 'General' as 'Architecture' | 'Landscaping' | 'Minutes' | 'Caveats' | 'General',
    lastUpdated: new Date().toLocaleDateString('en-US'),
    pdfUrl: '',
  });
  
  // HOA Info form state
  const [hoaInfoForm, setHoaInfoForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    officeHours: '',
    emergencyContact: '',
    eventText: '',
  });

  // Poll modal state
  const [showPollModal, setShowPollModal] = useState(false);
  const [isEditingPoll, setIsEditingPoll] = useState(false);
  const [pollForm, setPollForm] = useState({
    title: '',
    description: '',
    options: ['', ''],
    allowMultipleVotes: false,
    expiresAt: '',
  });

  // Animation values
  const blockModalOpacity = useRef(new Animated.Value(0)).current;
  const blockModalTranslateY = useRef(new Animated.Value(300)).current;
  const deleteModalOpacity = useRef(new Animated.Value(0)).current;
  const deleteModalTranslateY = useRef(new Animated.Value(300)).current;
  const boardMemberModalOpacity = useRef(new Animated.Value(0)).current;
  const boardMemberModalTranslateY = useRef(new Animated.Value(300)).current;
  const yearFeeModalOpacity = useRef(new Animated.Value(0)).current;
  const yearFeeModalTranslateY = useRef(new Animated.Value(300)).current;
  const addFineModalOpacity = useRef(new Animated.Value(0)).current;
  const addFineModalTranslateY = useRef(new Animated.Value(300)).current;
  const covenantModalOpacity = useRef(new Animated.Value(0)).current;
  const covenantModalTranslateY = useRef(new Animated.Value(300)).current;
  const pollModalOpacity = useRef(new Animated.Value(0)).current;
  const pollModalTranslateY = useRef(new Animated.Value(300)).current;
  const categoryDropdownOpacity = useRef(new Animated.Value(0)).current;
  const categoryDropdownScale = useRef(new Animated.Value(0.95)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start at 0 for individual item animations
  const scrollViewRef = useRef<ScrollView>(null);

  // Check if current user is a board member
  const isBoardMember = user?.isBoardMember && user?.isActive;

  // Modern animation functions
  const animateIn = (modalType: 'block' | 'delete' | 'boardMember' | 'yearFee' | 'addFine' | 'covenant' | 'poll') => {
    const opacity = modalType === 'block' ? blockModalOpacity : 
                   modalType === 'delete' ? deleteModalOpacity :
                   modalType === 'boardMember' ? boardMemberModalOpacity : 
                   modalType === 'yearFee' ? yearFeeModalOpacity : 
                   modalType === 'addFine' ? addFineModalOpacity :
                   modalType === 'covenant' ? covenantModalOpacity :
                   pollModalOpacity;
    const translateY = modalType === 'block' ? blockModalTranslateY : 
                      modalType === 'delete' ? deleteModalTranslateY:
                      modalType === 'boardMember' ? boardMemberModalTranslateY : 
                      modalType === 'yearFee' ? yearFeeModalTranslateY : 
                      modalType === 'addFine' ? addFineModalTranslateY :
                      modalType === 'covenant' ? covenantModalTranslateY :
                      pollModalTranslateY;
    
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

  const animateOut = (modalType: 'block' | 'delete' | 'boardMember' | 'yearFee' | 'addFine' | 'covenant' | 'poll', callback: () => void) => {
    const opacity = modalType === 'block' ? blockModalOpacity : 
                   modalType === 'delete' ? deleteModalOpacity :
                   modalType === 'boardMember' ? boardMemberModalOpacity : 
                   modalType === 'yearFee' ? yearFeeModalOpacity : 
                   modalType === 'addFine' ? addFineModalOpacity :
                   modalType === 'covenant' ? covenantModalOpacity :
                   pollModalOpacity;
    const translateY = modalType === 'block' ? blockModalTranslateY : 
                      modalType === 'delete' ? deleteModalTranslateY :
                      modalType === 'boardMember' ? boardMemberModalTranslateY : 
                      modalType === 'yearFee' ? yearFeeModalTranslateY : 
                      modalType === 'addFine' ? addFineModalTranslateY :
                      modalType === 'covenant' ? covenantModalTranslateY :
                      pollModalTranslateY;
    
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
        case 'pet':
          await deletePet({ id: selectedItem._id });
          Alert.alert('Success', 'Pet registration deleted successfully.');
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

  // HOA Info handler
  const handleSaveHoaInfo = async () => {
    try {
      await upsertHoaInfo({
        name: hoaInfoForm.name.trim() || '',
        address: hoaInfoForm.address.trim() || '',
        phone: hoaInfoForm.phone.trim() || '',
        email: hoaInfoForm.email.trim() || '',
        website: hoaInfoForm.website.trim() || undefined,
        officeHours: hoaInfoForm.officeHours.trim() || '',
        emergencyContact: hoaInfoForm.emergencyContact.trim() || '',
        eventText: hoaInfoForm.eventText.trim() || undefined,
      });

      Alert.alert('Success', 'HOA information updated successfully.');
    } catch (error) {
      console.error('Error saving HOA info:', error);
      Alert.alert('Error', 'Failed to save HOA information. Please try again.');
    }
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

  // Poll management handlers
  const handleCreatePoll = async () => {
    try {
      if (!pollForm.title || pollForm.options.filter(opt => opt.trim()).length < 2) {
        Alert.alert('Error', 'Please provide a title and at least 2 options.');
        return;
      }

      const validOptions = pollForm.options.filter(opt => opt.trim());
      
      await createPoll({
        title: pollForm.title,
        description: pollForm.description || undefined,
        options: validOptions,
        allowMultipleVotes: pollForm.allowMultipleVotes,
        expiresAt: pollForm.expiresAt ? new Date(pollForm.expiresAt).getTime() : undefined,
        createdBy: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      });

      Alert.alert('Success', 'Poll created successfully!');
      
      setShowPollModal(false);
      setIsEditingPoll(false);
      setSelectedItem(null);
      setPollForm({
        title: '',
        description: '',
        options: ['', ''],
        allowMultipleVotes: false,
        expiresAt: '',
      });
      animateOut('poll', () => {});
    } catch (error) {
      console.error('Error creating poll:', error);
      Alert.alert('Error', 'Failed to create poll. Please try again.');
    }
  };

  const handleEditPoll = (poll: any) => {
    setSelectedItem(poll);
    setIsEditingPoll(true);
    setPollForm({
      title: poll.title,
      description: poll.description || '',
      options: poll.options,
      allowMultipleVotes: poll.allowMultipleVotes,
      expiresAt: poll.expiresAt ? new Date(poll.expiresAt).toISOString().split('T')[0] : '',
    });
    setShowPollModal(true);
    animateIn('poll');
  };

  const handleUpdatePoll = async () => {
    try {
      if (!pollForm.title || pollForm.options.filter(opt => opt.trim()).length < 2) {
        Alert.alert('Error', 'Please provide a title and at least 2 options.');
        return;
      }

      const validOptions = pollForm.options.filter(opt => opt.trim());
      
      await updatePoll({
        id: selectedItem._id,
        title: pollForm.title,
        description: pollForm.description || undefined,
        options: validOptions,
        allowMultipleVotes: pollForm.allowMultipleVotes,
        expiresAt: pollForm.expiresAt ? new Date(pollForm.expiresAt).getTime() : undefined,
      });

      Alert.alert('Success', 'Poll updated successfully!');
      
      setShowPollModal(false);
      setIsEditingPoll(false);
      setSelectedItem(null);
      setPollForm({
        title: '',
        description: '',
        options: ['', ''],
        allowMultipleVotes: false,
        expiresAt: '',
      });
      animateOut('poll', () => {});
    } catch (error) {
      console.error('Error updating poll:', error);
      Alert.alert('Error', 'Failed to update poll. Please try again.');
    }
  };

  const handleDeletePoll = (poll: any) => {
    setSelectedItem(poll);
    setShowDeleteModal(true);
    animateIn('delete');
  };

  const handleTogglePollActive = async (poll: any) => {
    try {
      await togglePollActive({ id: poll._id });
      Alert.alert('Success', `Poll ${poll.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error toggling poll status:', error);
      Alert.alert('Error', 'Failed to update poll status. Please try again.');
    }
  };

  const handleCancelPoll = () => {
    setShowPollModal(false);
    setIsEditingPoll(false);
    setSelectedItem(null);
    setPollForm({
      title: '',
      description: '',
      options: ['', ''],
      allowMultipleVotes: false,
      expiresAt: '',
    });
    animateOut('poll', () => {});
  };

  const addPollOption = () => {
    if (pollForm.options.length < 10) {
      setPollForm(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removePollOption = (index: number) => {
    if (pollForm.options.length > 2) {
      setPollForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    setPollForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
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
      const { blob, mimeType } = await getUploadReadyImage(imageUri);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': mimeType },
        body: blob,
      });

      const { storageId } = await uploadResponse.json();
      return storageId;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Helper component for pet images
  const PetImage = ({ storageId }: { storageId: string }) => (
    <OptimizedImage
      storageId={storageId}
      style={styles.petCardImage}
      contentFit="cover"
      priority="high"
      placeholderContent={
        <View style={styles.petImageLoading}>
          <Ionicons name="paw" size={32} color="#cbd5e1" />
        </View>
      }
    />
  );

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
      case 'SheltonHOA':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shelton HOA Information</Text>
            </View>
            
            <View style={styles.hoaInfoContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>HOA Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={hoaInfoForm.name}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, name: text })}
                  placeholder="e.g., Shelton Homeowners Association"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={hoaInfoForm.address}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, address: text })}
                  placeholder="e.g., 123 Main Street, Shelton, CT 06484"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={hoaInfoForm.phone}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, phone: text })}
                  placeholder="e.g., (203) 555-1234"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={hoaInfoForm.email}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, email: text })}
                  placeholder="e.g., info@sheltonhoa.org"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.textInput}
                  value={hoaInfoForm.website}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, website: text })}
                  placeholder="e.g., https://www.sheltonhoa.org"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Office Hours</Text>
                <TextInput
                  style={styles.textInput}
                  value={hoaInfoForm.officeHours}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, officeHours: text })}
                  placeholder="e.g., Monday-Friday 9:00 AM - 5:00 PM"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact</Text>
                <TextInput
                  style={styles.textInput}
                  value={hoaInfoForm.emergencyContact}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, emergencyContact: text })}
                  placeholder="e.g., (203) 555-9999 or emergency@sheltonhoa.org"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Upcoming Events Text</Text>
                <TextInput
                  style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                  value={hoaInfoForm.eventText}
                  onChangeText={(text) => setHoaInfoForm({ ...hoaInfoForm, eventText: text })}
                  placeholder={"e.g.,\n📅 Board Meeting - Next Tuesday at 7:00 PM\n🏠 Community Cleanup - This Saturday 9:00 AM"}
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>
              
              <TouchableOpacity
                style={[styles.adminFeeButton, { backgroundColor: '#8b5cf6', marginTop: 20 }]}
                onPress={handleSaveHoaInfo}
              >
                <Ionicons name="save" size={16} color="#ffffff" />
                <Text style={styles.adminFeeButtonText}>Save HOA Information</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'residents':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Residents</Text>
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
              numColumns={2}
              scrollEnabled={false}
              nestedScrollEnabled={false}
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
                        <ProfileImage 
                          source={item.profileImage} 
                          size={48}
                          initials={`${item.firstName.charAt(0)}${item.lastName.charAt(0)}`}
                          style={{ marginRight: 8 }}
                        />
                        
                        <View style={styles.residentGridDetails}>
                          {/* Name and Role Row */}
                          <View style={styles.residentGridNameRow}>
                            <Text style={styles.residentGridName} numberOfLines={1}>
                              {item.firstName} {item.lastName}
                            </Text>
                            <View style={styles.residentGridRoleBadgesContainer}>
                              <View style={[styles.residentGridRoleBadge, { backgroundColor: roleColor + '20' }]}>
                                <Ionicons name={roleIcon as any} size={Platform.OS === 'web' ? 12 : 13} color={roleColor} />
                                <Text style={[styles.residentGridRoleText, { color: roleColor }]} numberOfLines={1}>
                                  {primaryRole}
                                </Text>
                              </View>
                              {/* Additional indicators for board members */}
                              {item.isBoardMember && item.isResident && (
                                <View style={[styles.residentGridRoleBadge, { backgroundColor: '#10b98120' }]}>
                                  <Ionicons name="people" size={Platform.OS === 'web' ? 10 : 11} color="#10b981" />
                                  <Text style={[styles.residentGridRoleText, { color: '#10b981' }]} numberOfLines={1}>
                                    Resident
                                  </Text>
                                </View>
                              )}
                              {item.isBoardMember && item.isRenter && (
                                <View style={[styles.residentGridRoleBadge, { backgroundColor: '#3b82f620' }]}>
                                  <Ionicons name="home" size={Platform.OS === 'web' ? 10 : 11} color="#3b82f6" />
                                  <Text style={[styles.residentGridRoleText, { color: '#3b82f6' }]} numberOfLines={1}>
                                    Renter
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                          
                          {/* Email */}
                          <Text style={styles.residentGridEmail} numberOfLines={2}>
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
                  style={[styles.addButton, { backgroundColor: '#eab308' }]}
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
                        <ProfileImage 
                          source={item.image} 
                          size={48}
                          initials={item.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                          style={{ marginRight: 8 }}
                        />
                        
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
                          <Text style={styles.residentGridEmail} numberOfLines={2}>
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
                  style={[styles.addButton, { backgroundColor: '#22c55e' }]}
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
                } else if (item.category === 'Minutes') {
                  covenantIcon = 'clipboard';
                  covenantColor = '#06b6d4';
                } else if (item.category === 'Caveats') {
                  covenantIcon = 'warning';
                  covenantColor = '#f59e0b';
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
      
      case 'Community':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Community Posts</Text>
            </View>
            
            {/* Posts Sub-tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.subTabsContainer}
              contentContainerStyle={styles.subTabsContent}
            >
              <TouchableOpacity
                style={[styles.subTab, postsSubTab === 'complaints' && styles.activeSubTab]}
                onPress={() => setPostsSubTab('complaints')}
              >
                <Ionicons name="warning" size={18} color={postsSubTab === 'complaints' ? '#ef4444' : '#6b7280'} />
                <Text style={[styles.subTabText, postsSubTab === 'complaints' && styles.activeSubTabText]}>
                  Complaints ({communityPosts.filter((p: any) => p.category === 'Complaint').length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.subTab, postsSubTab === 'posts' && styles.activeSubTab]}
                onPress={() => setPostsSubTab('posts')}
              >
                <Ionicons name="chatbubbles" size={18} color={postsSubTab === 'posts' ? '#3b82f6' : '#6b7280'} />
                <Text style={[styles.subTabText, postsSubTab === 'posts' && styles.activeSubTabText]}>
                  Posts ({communityPosts.filter((p: any) => p.category !== 'Complaint').length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.subTab, postsSubTab === 'comments' && styles.activeSubTab]}
                onPress={() => setPostsSubTab('comments')}
              >
                <Ionicons name="chatbox" size={18} color={postsSubTab === 'comments' ? '#3b82f6' : '#6b7280'} />
                <Text style={[styles.subTabText, postsSubTab === 'comments' && styles.activeSubTabText]}>
                  Comments ({comments.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.subTab, postsSubTab === 'polls' && styles.activeSubTab]}
                onPress={() => setPostsSubTab('polls')}
              >
                <Ionicons name="bar-chart" size={18} color={postsSubTab === 'polls' ? '#3b82f6' : '#6b7280'} />
                <Text style={[styles.subTabText, postsSubTab === 'polls' && styles.activeSubTabText]}>
                  Polls ({polls.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.subTab, postsSubTab === 'pets' && styles.activeSubTab]}
                onPress={() => setPostsSubTab('pets')}
              >
                <Ionicons name="paw" size={18} color={postsSubTab === 'pets' ? '#3b82f6' : '#6b7280'} />
                <Text style={[styles.subTabText, postsSubTab === 'pets' && styles.activeSubTabText]}>
                  Pets ({pets.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            {postsSubTab === 'posts' && (
            <FlatList
              data={communityPosts.filter((p: any) => p.category !== 'Complaint')}
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
                      <ProfileImage 
                        source={item.authorProfileImage} 
                        size={48}
                        style={{ marginRight: 12 }}
                      />
                      
                      <View style={styles.residentGridDetails}>
                        {/* Title */}
                        <Text style={styles.postTitleText}>
                          {item.title}
                        </Text>
                        
                        {/* Date */}
                        <Text style={styles.postDateText}>
                          {formatDate(item.createdAt)}
                        </Text>
                        
                        {/* Author */}
                        <Text style={styles.residentGridEmail} numberOfLines={1}>
                          By: {item.author}
                        </Text>
                        
                        {/* Content */}
                        <Text style={styles.postContentText}>
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
            )}
            
            {postsSubTab === 'comments' && (
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
                        <ProfileImage 
                          source={item.authorProfileImage} 
                          size={48}
                          style={{ marginRight: 12 }}
                        />
                        
                        <View style={styles.residentGridDetails}>
                          {/* Post Title */}
                          <Text style={styles.postTitleText}>
                            {item.postTitle}
                          </Text>
                          
                          {/* Date */}
                          <Text style={styles.postDateText}>
                            {formatDate(item.createdAt)}
                          </Text>
                          
                          {/* Author */}
                          <Text style={styles.residentGridEmail} numberOfLines={1}>
                            By: {item.author}
                          </Text>
                          
                          {/* Comment Content */}
                          <Text style={styles.postContentText}>
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
            )}
            
            {postsSubTab === 'polls' && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Community Polls</Text>
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                      style={[styles.adminFeeButton, { backgroundColor: '#3b82f6' }]}
                      onPress={() => {
                        animateButtonPress();
                        setShowPollModal(true);
                        animateIn('poll');
                      }}
                    >
                      <Ionicons name="add" size={16} color="#ffffff" />
                      <Text style={styles.adminFeeButtonText}>Create Poll</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
                
                {/* Polls List */}
                <FlatList
                  data={polls}
                  keyExtractor={(item) => item._id}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                  }
                  renderItem={({ item }) => {
                    const poll = item as any;
                    return (
                      <Animated.View 
                        key={poll._id} 
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
                        <View style={styles.postHeader}>
                          <View style={styles.postAuthor}>
                            <View style={styles.avatar}>
                              <Ionicons name="bar-chart" size={20} color="#2563eb" />
                            </View>
                            <View>
                              <Text style={styles.authorName}>{poll.title}</Text>
                              <Text style={styles.postTime}>
                                {new Date(poll.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.categoryBadge}>
                            <Ionicons 
                              name={poll.isActive ? "checkmark-circle" : "close-circle"} 
                              size={12} 
                              color={poll.isActive ? "#10b981" : "#ef4444"} 
                            />
                            <Text style={[styles.categoryText, { color: poll.isActive ? "#10b981" : "#ef4444" }]}>
                              {poll.isActive ? "Active" : "Inactive"}
                            </Text>
                          </View>
                        </View>
                        
                        {poll.description && (
                          <Text style={styles.postContent}>{poll.description}</Text>
                        )}
                        
                        {/* Poll Options */}
                        <View style={styles.pollOptionsContainer}>
                          {poll.options.map((option: string, index: number) => {
                            const isWinningOption = !poll.isActive && poll.winningOption && poll.winningOption.tiedIndices?.includes(index);
                            const isTied = isWinningOption && poll.winningOption?.isTied;
                            return (
                              <View key={index} style={[
                                styles.pollOption,
                                isWinningOption && styles.pollWinningOption
                              ]}>
                                <View style={styles.pollOptionContent}>
                                  <Text style={[
                                    styles.pollOptionText,
                                    isWinningOption && styles.pollWinningOptionText
                                  ]}>
                                    {option}
                                  </Text>
                                  <Text style={[
                                    styles.pollVoteCount,
                                    isWinningOption && styles.pollWinningVoteCount
                                  ]}>
                                    {poll.optionVotes?.[index] || 0} votes
                                    {isWinningOption && ` (${poll.winningOption.percentage.toFixed(1)}%)`}
                                  </Text>
                                </View>
                                {isWinningOption && (
                                  <View style={styles.winningBadge}>
                                    <Ionicons name="trophy" size={16} color="#ffffff" />
                                    <Text style={styles.winningBadgeText}>
                                      {isTied ? 'Tied' : 'Most Voted'}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            );
                          })}
                        </View>
                        
                        <View style={styles.postFooter}>
                          <View style={styles.boardActionButtons}>
                            <TouchableOpacity
                              style={[styles.boardActionButton, styles.editButton]}
                              onPress={() => handleEditPoll(poll)}
                            >
                              <Ionicons name="create" size={16} color="#2563eb" />
                              <Text style={styles.residentGridActionText}>Edit</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[styles.boardActionButton, poll.isActive ? styles.deactivateButton : styles.activateButton]}
                              onPress={() => handleTogglePollActive(poll)}
                            >
                              <Ionicons 
                                name={poll.isActive ? "pause-circle" : "play-circle"} 
                                size={16} 
                                color={poll.isActive ? "#f59e0b" : "#10b981"} 
                              />
                              <Text style={[styles.residentGridActionText, { color: poll.isActive ? "#f59e0b" : "#10b981" }]}>
                                {poll.isActive ? "Deactivate" : "Activate"}
                              </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[styles.boardActionButton, styles.blockButton]}
                              onPress={() => handleDeletePoll(poll)}
                            >
                              <Ionicons name="trash" size={16} color="#ef4444" />
                              <Text style={styles.residentGridActionText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Animated.View>
                    );
                  }}
                />
              </>
            )}
            
            {postsSubTab === 'pets' && (
              <FlatList
                data={pets}
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
                        {/* Pet Image - Centered */}
                        <View style={styles.petCardImageContainer}>
                          <View style={styles.petImageAvatar}>
                            <PetImage storageId={item.image} />
                          </View>
                        </View>
                        
                        {/* Text Content - Underneath Image */}
                        <View style={styles.petCardTextContent}>
                          {/* Pet Name and Date Row */}
                          <View style={styles.petCardNameRow}>
                            <Text style={styles.petCardName} numberOfLines={2}>
                              {item.name}
                            </Text>
                            <Text style={styles.petCardDate} numberOfLines={1}>
                              {formatDate(item.createdAt)}
                            </Text>
                          </View>
                          
                          {/* Owner */}
                          <Text style={styles.petCardOwner} numberOfLines={1}>
                            Owner: {item.residentName || 'Unknown'}
                          </Text>
                          
                          {/* Address */}
                          <Text style={styles.petCardAddress} numberOfLines={2}>
                            {item.residentAddress || ''}
                          </Text>
                        </View>
                        
                        {/* Action Button */}
                        <View style={styles.residentGridActions}>
                          <TouchableOpacity
                            style={[styles.residentGridActionButton, styles.blockButton]}
                            onPress={() => handleDeleteItem(item, 'pet')}
                          >
                            <Ionicons name="trash" size={16} color="#ef4444" />
                            <Text style={styles.residentGridActionText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Animated.View>
                  )
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="paw-outline" size={48} color="#9ca3af" />
                    <Text style={styles.emptyStateText}>No pet registrations found</Text>
                  </View>
                }
              />
            )}
            
            {postsSubTab === 'complaints' && (
              <FlatList
                data={communityPosts.filter((p: any) => p.category === 'Complaint')}
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
                        <ProfileImage 
                          source={item.authorProfileImage} 
                          size={48}
                          style={{ marginRight: 12 }}
                        />
                        
                        <View style={styles.residentGridDetails}>
                          {/* Title */}
                          <Text style={styles.postTitleText}>
                            {item.title}
                          </Text>
                          
                          {/* Date */}
                          <Text style={styles.postDateText}>
                            {formatDate(item.createdAt)}
                          </Text>
                          
                          {/* Author */}
                          <Text style={styles.residentGridEmail} numberOfLines={1}>
                            By: {item.author}
                          </Text>
                          
                          {/* Content */}
                          <Text style={styles.postContentText}>
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
                    <Ionicons name="warning-outline" size={48} color="#9ca3af" />
                    <Text style={styles.emptyStateText}>No complaints found</Text>
                  </View>
                }
              />
            )}
          </View>
        );
      
      case 'fees':
        return (
          <View style={styles.tabContent}>
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

            {/* Pending Venmo Payments Section */}
            {pendingVenmoPayments.length > 0 && (
              <View style={styles.pendingPaymentsSection}>
                <View style={styles.pendingPaymentsHeader}>
                  <Ionicons name="cash" size={20} color="#f59e0b" />
                  <Text style={styles.pendingPaymentsTitle}>
                    Pending Venmo Payments ({pendingVenmoPayments.length})
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {pendingVenmoPayments.map((payment: any) => {
                    const resident = residents.find((r: any) => r._id === payment.userId);
                    const paymentDate = new Date(payment.createdAt).toLocaleDateString();
                    
                    return (
                      <View key={payment._id} style={styles.compactPaymentCard}>
                        <View style={styles.compactPaymentHeader}>
                          <Text style={styles.compactPaymentName}>
                            {resident ? `${resident.firstName} ${resident.lastName}` : 'Unknown'}
                          </Text>
                          <Text style={styles.compactPaymentAmount}>
                            ${payment.amount.toFixed(2)}
                          </Text>
                        </View>
                        <Text style={styles.compactPaymentFee}>{payment.feeType}</Text>
                        <Text style={styles.compactPaymentVenmo}>
                          @{payment.venmoUsername}
                        </Text>
                        <Text style={styles.compactPaymentDate}>
                          {paymentDate}
                        </Text>
                        {(payment.transactionId || payment.venmoTransactionId) && (
                          <Text style={styles.compactPaymentTransactionId} numberOfLines={2}>
                            ID: {payment.transactionId || payment.venmoTransactionId}
                          </Text>
                        )}
                        <View style={styles.compactPaymentActions}>
                          <TouchableOpacity
                            style={styles.compactRejectButton}
                            onPress={async () => {
                              try {
                                await verifyVenmoPayment({
                                  paymentId: payment._id,
                                  status: "Overdue",
                                  verificationStatus: "Rejected",
                                });
                                Alert.alert('Success', 'Payment rejected.');
                                // Refresh data to update homeowner grid
                                await handleRefresh();
                              } catch (error) {
                                Alert.alert('Error', 'Failed to reject payment.');
                              }
                            }}
                          >
                            <Ionicons name="close-circle" size={14} color="#ef4444" />
                            <Text style={styles.compactButtonText}>Reject</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.compactVerifyButton}
                            onPress={async () => {
                              try {
                                await verifyVenmoPayment({
                                  paymentId: payment._id,
                                  status: "Paid",
                                  verificationStatus: "Verified",
                                });
                                Alert.alert('Success', 'Payment verified successfully!');
                                // Refresh data to update homeowner grid
                                await handleRefresh();
                              } catch (error) {
                                Alert.alert('Error', 'Failed to verify payment.');
                              }
                            }}
                          >
                            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                            <Text style={styles.compactButtonText}>Verify</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
            
            {/* Fees and Fines Status Grid */}
            <View style={isMobileDevice || screenWidth < 768 ? styles.feesGridContainerMobile : {}}>
              <FlatList
                key={`fees-grid-${isMobileDevice || screenWidth < 768 ? 1 : 2}`}
                data={homeownersPaymentStatus.filter((item: any) => {
                  // Only show homeowners who have fees or fines
                  const hasFees = allFeesFromDatabase.some((fee: any) => fee.userId === item._id);
                  const hasFines = allFinesFromDatabase.some((fine: any) => fine.residentId === item._id);
                  return hasFees || hasFines;
                })}
                keyExtractor={(item) => item._id}
                numColumns={isMobileDevice || screenWidth < 768 ? 1 : 2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => {
                const homeowner = item as any;
                // Get fees and fines for this homeowner
                const homeownerFees = allFeesFromDatabase.filter((fee: any) => fee.userId === homeowner._id);
                const homeownerFines = allFinesFromDatabase.filter((fine: any) => fine.residentId === homeowner._id);
                  const isSingleColumn = isMobileDevice || screenWidth < 768;
                  return (
                    <Animated.View 
                      style={[
                        styles.gridCard,
                        isSingleColumn && {
                          marginHorizontal: 16,
                          marginVertical: 12,
                          borderRadius: 12,
                          borderTopWidth: 0,
                          borderBottomWidth: 0,
                          borderWidth: 1,
                          borderColor: '#e5e7eb',
                          maxWidth: '100%',
                          alignSelf: 'center',
                          width: screenWidth < 400 ? screenWidth - 32 : Math.min(screenWidth - 40, 600),
                        },
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
                      <View style={[
                        styles.gridCardContent,
                        isSingleColumn && {
                          padding: 16,
                        }
                      ]}>
                        <View style={[
                          styles.gridProfileSection,
                          isSingleColumn && {
                            marginBottom: 16,
                          }
                        ]}>
                          <ProfileImage 
                            source={homeowner.profileImage} 
                            size={56}
                            initials={`${homeowner.firstName.charAt(0)}${homeowner.lastName.charAt(0)}`}
                            style={{ marginRight: 8 }}
                          />
                          <View style={styles.gridProfileInfo}>
                            <Text style={[
                              styles.gridName,
                              isSingleColumn && {
                                fontSize: 16,
                                marginBottom: 4,
                              }
                            ]} numberOfLines={1}>
                              {homeowner.firstName} {homeowner.lastName}
                            </Text>
                            <Text style={[
                              styles.gridRole,
                              isSingleColumn && {
                                fontSize: 13,
                                marginBottom: 4,
                              }
                            ]} numberOfLines={1}>
                              {homeowner.userType === 'board-member' ? 'Board Member' : 'Homeowner'}
                            </Text>
                            <Text style={[
                              styles.gridAddress,
                              isSingleColumn && {
                                fontSize: 12,
                              }
                            ]} numberOfLines={2}>
                              {homeowner.address} {homeowner.unitNumber && `Unit ${homeowner.unitNumber}`}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Show fees for this homeowner */}
                        {homeownerFees.length > 0 ? (
                          <View style={[
                            styles.gridFeeSection,
                            isSingleColumn && {
                              paddingTop: 12,
                              marginTop: 12,
                            }
                          ]}>
                            <Text style={[
                              styles.gridFeeAmount,
                              isSingleColumn && {
                                fontSize: 20,
                                marginBottom: 4,
                              }
                            ]}>
                              ${homeownerFees.reduce((sum: number, fee: any) => sum + fee.amount, 0).toFixed(2)}
                            </Text>
                            <Text style={[
                              styles.gridFeeLabel,
                              isSingleColumn && {
                                fontSize: 12,
                                marginBottom: 8,
                              }
                            ]}>
                              {homeownerFees.length === 1 ? 'Fee' : `Fees (${homeownerFees.length})`}
                            </Text>
                            <View style={[
                              styles.gridStatusBadge,
                              homeownerFees.every((f: any) => f.status === 'Paid') 
                                ? styles.gridPaidBadge 
                                : styles.gridPendingBadge,
                              isSingleColumn && {
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                              }
                            ]}>
                              <Ionicons 
                                name={homeownerFees.every((f: any) => f.status === 'Paid') ? "checkmark-circle" : "time"} 
                                size={isSingleColumn ? 16 : 14} 
                                color={homeownerFees.every((f: any) => f.status === 'Paid') ? "#10b981" : "#f59e0b"} 
                              />
                              <Text style={[
                                styles.gridStatusText,
                                { 
                                  color: homeownerFees.every((f: any) => f.status === 'Paid') ? "#10b981" : "#f59e0b" 
                                },
                                isSingleColumn && {
                                  fontSize: 12,
                                }
                              ]}>
                                {homeownerFees.every((f: any) => f.status === 'Paid') ? 'Paid' : 'Pending'}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <View style={[
                            styles.gridFeeSection,
                            isSingleColumn && {
                              paddingTop: 12,
                              marginTop: 12,
                            }
                          ]}>
                            <Text style={[
                              styles.gridFeeAmount,
                              isSingleColumn && {
                                fontSize: 20,
                                marginBottom: 4,
                              }
                            ]}>$0</Text>
                            <Text style={[
                              styles.gridFeeLabel,
                              isSingleColumn && {
                                fontSize: 12,
                                marginBottom: 8,
                              }
                            ]}>No Fees</Text>
                            <View style={[
                              styles.gridStatusBadge, 
                              styles.gridNoFeeBadge,
                              isSingleColumn && {
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                              }
                            ]}>
                              <Ionicons name="card" size={isSingleColumn ? 16 : 14} color="#6b7280" />
                              <Text style={[
                                styles.gridStatusText, 
                                { color: "#6b7280" },
                                isSingleColumn && {
                                  fontSize: 12,
                                }
                              ]}>
                                Clear
                              </Text>
                            </View>
                          </View>
                        )}
                        
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
                                    <Text style={styles.gridFineTitle} numberOfLines={2}>
                                      {fine.violation}
                                    </Text>
                                    <Text style={styles.gridFineDate} numberOfLines={1}>
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
            </View>
          </View>
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
          showsHorizontalScrollIndicator={Platform.OS === 'web'}
          scrollEnabled={true}
          bounces={true}
          alwaysBounceHorizontal={true}
          style={styles.folderTabs}
          contentContainerStyle={styles.folderTabsContent}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[
              styles.folderTab, 
              activeTab === 'SheltonHOA' && styles.activeFolderTab,
              activeTab === 'SheltonHOA' && { borderColor: '#ef4444' }
            ]}
            onPress={() => setActiveTab('SheltonHOA')}
          >
            <Ionicons name="business" size={20} color={activeTab === 'SheltonHOA' ? '#ef4444' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'SheltonHOA' && styles.activeFolderTabText, activeTab === 'SheltonHOA' && { color: '#ef4444' }]}>
              SheltonHOA
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.folderTab, 
              activeTab === 'residents' && styles.activeFolderTab,
              activeTab === 'residents' && { borderColor: '#f97316' }
            ]}
            onPress={() => setActiveTab('residents')}
          >
            <Ionicons name="people" size={20} color={activeTab === 'residents' ? '#f97316' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'residents' && styles.activeFolderTabText, activeTab === 'residents' && { color: '#f97316' }]}>
              Residents ({residents.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.folderTab, 
              activeTab === 'board' && styles.activeFolderTab,
              activeTab === 'board' && { borderColor: '#eab308' }
            ]}
            onPress={() => setActiveTab('board')}
          >
            <Ionicons name="shield" size={20} color={activeTab === 'board' ? '#eab308' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'board' && styles.activeFolderTabText, activeTab === 'board' && { color: '#eab308' }]}>
              Board ({boardMembers.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.folderTab, 
              activeTab === 'covenants' && styles.activeFolderTab,
              activeTab === 'covenants' && { borderColor: '#22c55e' }
            ]}
            onPress={() => setActiveTab('covenants')}
          >
            <Ionicons name="document-text" size={20} color={activeTab === 'covenants' ? '#22c55e' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'covenants' && styles.activeFolderTabText, activeTab === 'covenants' && { color: '#22c55e' }]}>
              Covenants ({covenants.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.folderTab, 
              activeTab === 'Community' && styles.activeFolderTab,
              activeTab === 'Community' && { borderColor: '#3b82f6' }
            ]}
            onPress={() => setActiveTab('Community')}
          >
            <Ionicons name="chatbubbles" size={20} color={activeTab === 'Community' ? '#3b82f6' : '#6b7280'} />
            <Text style={[styles.folderTabText, activeTab === 'Community' && styles.activeFolderTabText, activeTab === 'Community' && { color: '#3b82f6' }]}>
              Community ({communityPosts.length + comments.length + polls.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.folderTab, 
              activeTab === 'fees' && styles.activeFolderTab,
              activeTab === 'fees' && { borderColor: '#ec4899' }
            ]}
            onPress={() => setActiveTab('fees')}
          >
            <Ionicons name="card" size={20} color={activeTab === 'fees' ? '#ec4899' : '#6b7280'} />
              <Text style={[styles.folderTabText, activeTab === 'fees' && styles.activeFolderTabText, activeTab === 'fees' && { color: '#ec4899' }]}>
                Fees & Payments ({allFeesFromDatabase.length + allFinesFromDatabase.length})
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

        {/* Year Fee Modal */}
        <Modal
          visible={showYearFeeModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => animateOut('yearFee', () => setShowYearFeeModal(false))}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.formModalContent,
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
              styles.formModalContent,
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
                      {['Architecture', 'Landscaping', 'Minutes', 'Caveats', 'General'].map((category, index) => (
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

        {/* Poll Modal */}
        <Modal
          visible={showPollModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCancelPoll}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[
              styles.boardMemberModalContent,
              {
                opacity: pollModalOpacity,
                transform: [{ translateY: pollModalTranslateY }],
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditingPoll ? 'Edit Poll' : 'Create Poll'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancelPoll}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Poll Title *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter poll title"
                    value={pollForm.title}
                    onChangeText={(text) => setPollForm(prev => ({ ...prev, title: text }))}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter poll description (optional)"
                    value={pollForm.description}
                    onChangeText={(text) => setPollForm(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Poll Options *</Text>
                  {pollForm.options.map((option, index) => (
                    <View key={index} style={styles.pollOptionInput}>
                      <TextInput
                        style={[styles.textInput, styles.pollOptionTextInput]}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChangeText={(text) => updatePollOption(index, text)}
                      />
                      {pollForm.options.length > 2 && (
                        <TouchableOpacity
                          style={styles.removeOptionButton}
                          onPress={() => removePollOption(index)}
                        >
                          <Ionicons name="close-circle" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  
                  {pollForm.options.length < 10 && (
                    <TouchableOpacity
                      style={styles.addOptionButton}
                      onPress={addPollOption}
                    >
                      <Ionicons name="add-circle" size={20} color="#2563eb" />
                      <Text style={styles.addOptionText}>Add Option</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Settings</Text>
                  
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setPollForm(prev => ({ ...prev, allowMultipleVotes: !prev.allowMultipleVotes }))}
                  >
                    <View style={[styles.checkbox, pollForm.allowMultipleVotes && styles.checkboxChecked]}>
                      {pollForm.allowMultipleVotes && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Allow multiple votes</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Expiration Date (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    value={pollForm.expiresAt}
                    onChangeText={(text) => setPollForm(prev => ({ ...prev, expiresAt: text }))}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelPoll}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={isEditingPoll ? handleUpdatePoll : handleCreatePoll}
                >
                  <Text style={styles.confirmButtonText}>
                    {isEditingPoll ? 'Update Poll' : 'Create Poll'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
          
          {/* Additional content to ensure scrollable content */}
          <View style={styles.spacer} />
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
    maxHeight: 60,
    marginTop: 15,
    paddingBottom: 0,
    ...(Platform.OS === 'web' && {
      overflowX: 'auto' as any,
      overflowY: 'hidden' as any,
      WebkitOverflowScrolling: 'touch' as any,
    }),
  },
  folderTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 4,
    paddingRight: 40,
    alignItems: 'center',
    minHeight: 45,
    flexGrow: 0,
    ...(Platform.OS === 'web' && {
      minWidth: 'max-content' as any,
    }),
  },
  folderTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6, // Reduced from 8
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 100, // Reduced minimum width for better fit
    flexShrink: 0, // Prevent tabs from shrinking
  },
  activeFolderTab: {
    backgroundColor: '#ffffff',
  },
  folderTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  // Sub-tab styles for posts section
  subTabsContainer: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 50, // Limit height
  },
  subTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  subTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8, 
    marginRight: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeSubTab: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  activeSubTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  activeFolderTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    padding: 20,
    paddingTop: 0, // Reduce top padding to match CommunityScreen
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
    marginRight: 12,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hoaInfoContainer: {
    padding: 20,
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
    backgroundColor: '#6366f1',
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
  // Form modal styles
  formModalContent: {
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
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Fees grid container for mobile/ narrow desktop
  feesGridContainerMobile: {
    // No negative margin needed - cards have their own margins
  },
  // Grid layout styles
  gridCard: {
    backgroundColor: '#ffffff',
    // Default desktop styles
    ...(Platform.OS === 'web' 
      ? { 
          flex: 1,
          margin: 6, 
          borderRadius: 12,
          maxWidth: '47%',
        }
      : {
          flex: 1,
        }
    ),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridCardContent: {
    padding: 12,
  },
  gridProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    lineHeight: 12,
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
  gridNoFeeBadge: {
    backgroundColor: '#f3f4f6',
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
    backgroundColor: '#ec4899',
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
  gridFeesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  gridFeesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridFeesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 4,
  },
  gridFeesList: {
    gap: 6,
  },
  gridFeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  gridFeeItemLast: {
    borderBottomWidth: 0,
  },
  gridFeeLeft: {
    flex: 1,
    marginRight: 8,
  },
  gridFeeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  gridFeeDue: {
    fontSize: 11,
    color: '#9ca3af',
  },
  gridFeeRight: {
    alignItems: 'flex-end',
  },
  gridFeeItemAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  gridFeeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gridFeeStatusPaid: {
    backgroundColor: '#d1fae5',
  },
  gridFeeStatusPending: {
    backgroundColor: '#fef3c7',
  },
  gridFeeStatusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
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
    alignItems: 'flex-start',
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
    minHeight: 50,
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
    lineHeight: 13,
  },
  gridFineDate: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '400',
    lineHeight: 11,
  },
  gridFineRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 65,
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
    fontSize: 9,
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
    padding: 12,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  residentGridMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  residentGridDetails: {
    flex: 1,
  },
  residentGridNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    minHeight: Platform.OS === 'web' ? 32 : 36,
    flexWrap: 'wrap',
  },
  residentGridName: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: Platform.OS === 'web' ? 8 : 6,
    lineHeight: Platform.OS === 'web' ? 15 : 16,
    minWidth: 0, // Allow text to shrink on mobile
  },
  residentGridRoleBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 4 : 3,
    marginTop: Platform.OS !== 'web' ? 2 : 0,
    maxWidth: '100%', // Prevent overflow on mobile
  },
  residentGridRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 6 : 5,
    paddingVertical: Platform.OS === 'web' ? 2 : 3,
    borderRadius: Platform.OS === 'web' ? 6 : 8,
    gap: Platform.OS === 'web' ? 3 : 2,
    alignSelf: 'flex-start',
    marginBottom: Platform.OS !== 'web' ? 2 : 0, // Add bottom margin on mobile for wrapped badges
  },
  residentGridRoleText: {
    fontSize: Platform.OS === 'web' ? 9 : 10,
    fontWeight: '600',
    lineHeight: Platform.OS === 'web' ? 12 : 14,
  },
  residentGridEmail: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
    lineHeight: 13,
  },
  residentGridAddress: {
    fontSize: 9,
    color: '#9ca3af',
    marginBottom: 4,
    lineHeight: 11,
  },
  residentGridAvatar: {
    marginRight: 8,
  },
  postAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  postAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  postAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTitleText: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: Platform.OS === 'web' ? 18 : 20,
    marginBottom: 4,
  },
  postDateText: {
    fontSize: Platform.OS === 'web' ? 10 : 11,
    color: '#9ca3af',
    marginBottom: 6,
    lineHeight: Platform.OS === 'web' ? 14 : 16,
  },
  postContentText: {
    fontSize: Platform.OS === 'web' ? 12 : 13,
    color: '#374151',
    lineHeight: Platform.OS === 'web' ? 18 : 20,
    marginTop: 4,
    marginBottom: 8,
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
  activateButton: {
    backgroundColor: '#dcfce7',
  },
  deactivateButton: {
    backgroundColor: '#fef3c7',
  },
  // Pet image styles
  petImageAvatar: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#e5e7eb',
    alignSelf: 'center',
  },
  petCardImage: {
    width: '100%',
    height: '100%',
  },
  petImageLoading: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCardImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  petCardTextContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  petCardNameRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  petCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  petCardDate: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  petCardOwner: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  petCardAddress: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Poll styles
  pollOptionsContainer: {
    marginVertical: 12,
  },
  pollOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  pollOptionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  pollVoteCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  pollWinningOption: {
    backgroundColor: '#fef3c7',
    borderLeftColor: '#f59e0b',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  pollWinningOptionText: {
    color: '#92400e',
    fontWeight: '700',
  },
  pollWinningVoteCount: {
    color: '#92400e',
    fontWeight: '700',
  },
  pollOptionContent: {
    flex: 1,
  },
  winningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  winningBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 4,
  },
  pollOptionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionTextInput: {
    flex: 1,
    marginRight: 8,
  },
  removeOptionButton: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  // Post card styles (for poll display)
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
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  // Payment verification styles
  paymentList: {
    padding: 8,
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentResidentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentFeeType: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  paymentDetails: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  paymentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDetailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  paymentCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 6,
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 6,
  },
  // Compact payment styles for Fees tab
  pendingPaymentsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: Platform.OS === 'web' ? 16 : 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingPaymentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingPaymentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350f',
    marginLeft: 8,
  },
  compactPaymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 180,
    maxWidth: 250,
    width: Platform.OS === 'web' ? 220 : Dimensions.get('window').width * 0.75,
    borderWidth: 1,
    borderColor: '#fef3c7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  compactPaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  compactPaymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  compactPaymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  compactPaymentFee: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  compactPaymentVenmo: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  compactPaymentDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  compactPaymentTransactionId: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  compactPaymentActions: {
    flexDirection: 'row',
    gap: 6,
  },
  compactRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  compactVerifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  compactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  spacer: {
    height: 50,
  },
});

export default AdminScreen;