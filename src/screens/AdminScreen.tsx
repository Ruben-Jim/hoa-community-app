import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';

const AdminScreen = () => {
  const { user } = useAuth();
  
  // Data queries
  const residents = useQuery(api.residents.getAll) ?? [];
  const boardMembers = useQuery(api.boardMembers.getAll) ?? [];
  const covenants = useQuery(api.covenants.getAll) ?? [];
  const communityPosts = useQuery(api.communityPosts.getAll) ?? [];
  const comments = useQuery(api.communityPosts.getAllComments) ?? [];
  
  // Mutations
  const setBlockStatus = useMutation(api.residents.setBlockStatus);
  const deleteCovenant = useMutation(api.covenants.remove);
  const deleteCommunityPost = useMutation(api.communityPosts.remove);
  const deleteBoardMember = useMutation(api.boardMembers.remove);
  const deleteComment = useMutation(api.communityPosts.removeComment);
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'residents' | 'board' | 'covenants' | 'posts' | 'comments'>('residents');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [blockReason, setBlockReason] = useState('');

  // Check if current user is a board member
  const isBoardMember = user?.isBoardMember && user?.isActive;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBlockResident = (resident: any) => {
    setSelectedItem(resident);
    setBlockReason('');
    setShowBlockModal(true);
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
      setShowBlockModal(false);
      setSelectedItem(null);
      setBlockReason('');
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
        default:
          Alert.alert('Error', 'Unknown item type.');
      }
      setShowDeleteModal(false);
      setSelectedItem(null);
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
          <FlatList
            data={residents}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.rowSubtitle}>{item.email}</Text>
                  <View style={styles.badges}>
                    {item.isBoardMember && (
                      <View style={styles.boardMemberBadge}>
                        <Text style={styles.badgeText}>Board</Text>
                      </View>
                    )}
                    {item.isBlocked && (
                      <View style={styles.blockedBadge}>
                        <Text style={styles.badgeText}>Blocked</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.rowActions}>
                  {item.isBlocked ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleUnblockResident(item)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleBlockResident(item)}
                    >
                      <Ionicons name="ban" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        );
      
      case 'board':
        return (
          <FlatList
            data={boardMembers}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowSubtitle}>{item.position}</Text>
                  <Text style={styles.rowDetail}>{item.email}</Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteItem(item, 'board')}
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        );
      
      case 'covenants':
        return (
          <FlatList
            data={covenants}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.category}</Text>
                  <Text style={styles.rowDetail} numberOfLines={2}>{item.description}</Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteItem(item, 'covenant')}
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        );
      
      case 'posts':
        return (
          <FlatList
            data={communityPosts}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>By: {item.author}</Text>
                  <Text style={styles.rowDetail} numberOfLines={2}>{item.content}</Text>
                  <Text style={styles.rowDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteItem(item, 'post')}
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        );
      
      case 'comments':
        return (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>Comment by: {item.author}</Text>
                  <Text style={styles.rowSubtitle}>On: {item.postTitle}</Text>
                  <Text style={styles.rowDetail} numberOfLines={3}>{item.content}</Text>
                  <Text style={styles.rowDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteItem(item, 'comment')}
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Manage community content and residents
          </Text>
        </View>

        {/* Folder Tabs */}
        <View style={styles.folderTabs}>
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
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {renderTabContent()}
        </View>

        {/* Block Modal */}
        <Modal
          visible={showBlockModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowBlockModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
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
                  onPress={() => setShowBlockModal(false)}
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
            </View>
          </View>
        </Modal>

        {/* Delete Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
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
                  onPress={() => setShowDeleteModal(false)}
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
            </View>
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  folderTabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  folderTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFolderTab: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  folderTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 8,
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
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
});

export default AdminScreen;
