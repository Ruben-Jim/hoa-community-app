import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const CovenantsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['Architecture', 'Landscaping', 'Parking', 'Pets', 'General'];
  const covenants = useQuery(api.covenants.getAll) ?? [];

  const filteredCovenants = covenants.filter((covenant: any) => {
    const matchesSearch = covenant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         covenant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || covenant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Architecture':
        return 'home';
      case 'Landscaping':
        return 'leaf';
      case 'Parking':
        return 'car';
      case 'Pets':
        return 'paw';
      case 'General':
        return 'document-text';
      default:
        return 'document-text';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Architecture':
        return '#3b82f6';
      case 'Landscaping':
        return '#10b981';
      case 'Parking':
        return '#f59e0b';
      case 'Pets':
        return '#8b5cf6';
      case 'General':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search covenants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
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

      {/* Covenants List */}
      <View style={styles.covenantsContainer}>
        {filteredCovenants.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No covenants found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          filteredCovenants.map((covenant: any) => (
            <View key={covenant._id} style={styles.covenantCard}>
              <View style={styles.covenantHeader}>
                <View style={styles.covenantIcon}>
                  <Ionicons 
                    name={getCategoryIcon(covenant.category) as any} 
                    size={24} 
                    color={getCategoryColor(covenant.category)} 
                  />
                </View>
                <View style={styles.covenantInfo}>
                  <Text style={styles.covenantTitle}>{covenant.title}</Text>
                  <Text style={styles.covenantCategory}>{covenant.category}</Text>
                </View>
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => Alert.alert('Covenant Details', covenant.description)}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.covenantDescription} numberOfLines={3}>
                {covenant.description}
              </Text>
              
              <View style={styles.covenantFooter}>
                <Text style={styles.covenantDate}>
                  Last updated: {formatDate(covenant.lastUpdated)}
                </Text>
                {covenant.pdfUrl && (
                  <TouchableOpacity style={styles.pdfButton}>
                    <Ionicons name="document" size={16} color="#2563eb" />
                    <Text style={styles.pdfButtonText}>View PDF</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About Covenants</Text>
        <Text style={styles.infoText}>
          Covenants, Conditions, and Restrictions (CC&Rs) are the rules and regulations that govern our community. 
          All residents are required to follow these guidelines to maintain the quality and appearance of our neighborhood.
        </Text>
        <Text style={styles.infoText}>
          If you have questions about any covenant or need to request approval for modifications, 
          please contact the architectural committee or HOA board.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
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
  covenantsContainer: {
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
  covenantCard: {
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
  covenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  covenantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  covenantInfo: {
    flex: 1,
  },
  covenantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  covenantCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  covenantDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  covenantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  covenantDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  pdfButtonText: {
    fontSize: 12,
    color: '#2563eb',
    marginLeft: 4,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default CovenantsScreen; 