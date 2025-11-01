import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { addCrop } from '../../store/slices/cropsSlice';
import { RootState } from '../../store/types';
import { theme } from '../../constants/theme';

interface CropFormData {
  name: string;
  variety: string;
  quantity: string;
  unit: string;
  price_per_unit: string;
  quality_grade: string;
  harvest_date: string;
  location_address: string;
  images: string[];
}

const PostHarvestScreen = () => {
  const [formData, setFormData] = useState<CropFormData>({
    name: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    quality_grade: 'A',
    harvest_date: new Date().toISOString().split('T')[0],
    location_address: '',
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const cropTypes = [
    'Teff', 'Wheat', 'Barley', 'Maize', 'Sorghum', 
    'Coffee', 'Sesame', 'Lentils', 'Chickpeas', 'Beans'
  ];

  const qualityGrades = ['A', 'B', 'C'];
  const units = ['kg', 'tons', 'quintal'];

  const handleInputChange = (field: keyof CropFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please select a crop type');
      return false;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return false;
    }
    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.location_address.trim()) {
      Alert.alert('Error', 'Please enter the harvest location');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cropData = {
        name: formData.name,
        variety: formData.variety || undefined,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price_per_unit: parseFloat(formData.price_per_unit),
        quality_grade: formData.quality_grade,
        harvest_date: formData.harvest_date,
        location: {
          latitude: 9.1450, // Default Ethiopia coordinates
          longitude: 40.4897,
          address: formData.location_address,
        },
        farmer_id: user?.id || '',
        status: 'available' as const,
        images: formData.images,
      };

      await dispatch(addCrop(cropData)).unwrap();
      
      Alert.alert(
        'Success',
        'Your crop has been posted successfully!',
        [
          { text: 'OK', onPress: () => navigation.goBack() },
          { text: 'Post Another', onPress: () => resetForm() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to post crop');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      variety: '',
      quantity: '',
      unit: 'kg',
      price_per_unit: '',
      quality_grade: 'A',
      harvest_date: new Date().toISOString().split('T')[0],
      location_address: '',
      images: [],
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Crop Information</Text>
      
      <Text style={styles.label}>Crop Type *</Text>
      <View style={styles.cropTypeContainer}>
        {cropTypes.map((crop) => (
          <TouchableOpacity
            key={crop}
            style={[
              styles.cropTypeButton,
              formData.name === crop && styles.cropTypeButtonSelected,
            ]}
            onPress={() => handleInputChange('name', crop)}
          >
            <Text style={[
              styles.cropTypeText,
              formData.name === crop && styles.cropTypeTextSelected,
            ]}>
              {crop}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Variety (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., White Teff, Durum Wheat"
        value={formData.variety}
        onChangeText={(value) => handleInputChange('variety', value)}
      />

      <Text style={styles.label}>Quality Grade</Text>
      <View style={styles.gradeContainer}>
        {qualityGrades.map((grade) => (
          <TouchableOpacity
            key={grade}
            style={[
              styles.gradeButton,
              formData.quality_grade === grade && styles.gradeButtonSelected,
            ]}
            onPress={() => handleInputChange('quality_grade', grade)}
          >
            <Text style={[
              styles.gradeText,
              formData.quality_grade === grade && styles.gradeTextSelected,
            ]}>
              Grade {grade}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Quantity & Pricing</Text>
      
      <Text style={styles.label}>Quantity *</Text>
      <View style={styles.quantityContainer}>
        <TextInput
          style={[styles.input, styles.quantityInput]}
          placeholder="0"
          value={formData.quantity}
          onChangeText={(value) => handleInputChange('quantity', value)}
          keyboardType="numeric"
        />
        <View style={styles.unitSelector}>
          {units.map((unit) => (
            <TouchableOpacity
              key={unit}
              style={[
                styles.unitButton,
                formData.unit === unit && styles.unitButtonSelected,
              ]}
              onPress={() => handleInputChange('unit', unit)}
            >
              <Text style={[
                styles.unitText,
                formData.unit === unit && styles.unitTextSelected,
              ]}>
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.label}>Price per Unit (ETB) *</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={formData.price_per_unit}
        onChangeText={(value) => handleInputChange('price_per_unit', value)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Harvest Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => {
          // In a real app, you'd show a date picker here
          Alert.alert('Date Picker', 'Date picker functionality would be implemented here');
        }}
      >
        <Text style={styles.dateText}>{formData.harvest_date}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location</Text>
      
      <Text style={styles.label}>Harvest Location Address *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter the harvest location address"
        value={formData.location_address}
        onChangeText={(value) => handleInputChange('location_address', value)}
        multiline
        numberOfLines={3}
      />

      <View style={styles.locationPreview}>
        <Text style={styles.locationPreviewText}>
          📍 Location will be automatically detected
        </Text>
      </View>

      <TouchableOpacity style={styles.addPhotoButton}>
        <Text style={styles.addPhotoText}>📷 Add Photos</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.stepDot,
            currentStep >= step && styles.stepDotActive,
          ]}
        >
          <Text style={[
            styles.stepDotText,
            currentStep >= step && styles.stepDotTextActive,
          ]}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Post Harvest</Text>
        <Text style={styles.subtitle}>List your crop for sale</Text>
      </View>

      {renderStepIndicator()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={prevStep}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < 3 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={nextStep}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Post Crop</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.large,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: 'white',
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.large,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.small,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepDotText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  stepDotTextActive: {
    color: 'white',
  },
  stepContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.large,
    ...theme.shadows.small,
  },
  stepTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontWeight: '600',
  },
  cropTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium,
  },
  cropTypeButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.small,
    marginBottom: theme.spacing.small,
    minWidth: '45%',
  },
  cropTypeButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cropTypeText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cropTypeTextSelected: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    fontSize: theme.typography.body.fontSize,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.medium,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gradeButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
    marginHorizontal: theme.spacing.small,
  },
  gradeButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  gradeText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  gradeTextSelected: {
    color: 'white',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    marginRight: theme.spacing.medium,
  },
  unitSelector: {
    flexDirection: 'row',
  },
  unitButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.small,
    marginLeft: theme.spacing.small,
  },
  unitButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  unitText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  unitTextSelected: {
    color: 'white',
  },
  dateButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
  },
  dateText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  locationPreview: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.medium,
    alignItems: 'center',
  },
  locationPreviewText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  addPhotoButton: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.medium,
  },
  addPhotoText: {
    color: 'white',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.small,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
  },
});

export default PostHarvestScreen;
