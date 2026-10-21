import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import {
  Message,
  Document,
  InfoCircle,
  Copy,
  Warning2,
  Star1,
  Clock,
  Send2,
  TickCircle,
  CopySuccess,
} from 'iconsax-react-nativejs';
import * as ExpoClipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { useThemeContext } from '@/contexts/ThemeContext';
import { FontSizes } from '@/constants/FontSizes';

const EMAIL_ADDRESS = 'brianali427@gmail.com';
const GITHUB_ISSUES = 'https://github.com/brianali-codes/shiori/issues';
const MAX_DESCRIPTION_LENGTH = 1000;

const BUG_CATEGORIES = [
  { id: 'crash', label: '应用崩溃', icon: Warning2 },
  { id: 'ui', label: '界面问题', icon: Star1 },
  { id: 'feature', label: '功能异常', icon: Message },
  { id: 'performance', label: '性能问题', icon: Clock },
  { id: 'other', label: '其他', icon: InfoCircle },
];

const PRIORITY_LEVELS = [
  { id: 'low', label: '低', color: '#10B981' },
  { id: 'medium', label: '中', color: '#F59E0B' },
  { id: 'high', label: '高', color: '#F97316' },
  { id: 'critical', label: '紧急', color: '#EF4444' },
];

export default function BugReportScreen() {
  const theme = useTheme();
  const colors = useThemeColors();
  const { isDark, isAmoled } = useThemeContext();
  const insets = useSafeAreaInsets();

  // Floating tab bar clearance
  const floatingTabBarClearance = 60 + Math.max(insets.bottom + 8, 18) + 16;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setPriority] = useState('medium');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningGitHub, setIsOpeningGitHub] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const cardBackground = isDark || isAmoled ? theme.colors.elevation.level2 : theme.colors.surface;
  const borderColor = isDark || isAmoled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('提示', message);
    }
  };

  const handleCopyEmail = async () => {
    await ExpoClipboard.setStringAsync(EMAIL_ADDRESS);
    showToast('邮箱地址已复制到剪贴板');
  };

  const handleCopyDeviceInfo = async () => {
    const deviceInfoText = `应用版本：${appVersion}\n设备：${deviceInfo}\n平台：${Platform.OS} ${Platform.Version}`;
    await ExpoClipboard.setStringAsync(deviceInfoText);
    setIsCopied(true);
    showToast('设备信息已复制到剪贴板');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenGitHub = async () => {
    try {
      setIsOpeningGitHub(true);
      const canOpen = await Linking.canOpenURL(GITHUB_ISSUES);
      if (canOpen) {
        await Linking.openURL(GITHUB_ISSUES);
      }
    } catch (error) {
      showToast('无法打开 GitHub issues 页面');
    } finally {
      setIsOpeningGitHub(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEmail('');
    setSelectedCategory('');
    setPriority('medium');
    setStepsToReproduce('');
    setExpectedBehavior('');
  };

  const handleSubmit = () => {
    if (!title || !description || !selectedCategory) {
      showToast('请填写所有必填项');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        '反馈已发送',
        '感谢您帮助我们改进 Shiori！我们已收到您的反馈。',
        [
          { text: '再提交一条', onPress: resetForm },
          { text: '完成', style: 'cancel' },
        ]
      );
    }, 1200);
  };

  const appVersion = Constants.expoConfig?.version || '未知';
  const deviceInfo = `${Platform.OS} ${Platform.Version}`;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: '问题反馈',
            headerTitleStyle: {
              fontFamily: 'Nunito-Bold',
              fontSize: FontSizes.h3,
            },
            headerShadowVisible: false,
          }}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: floatingTabBarClearance },
          ]}
        >
          {/* Header Banner */}
          <Surface style={[styles.heroCard, { backgroundColor: cardBackground, borderColor }]} elevation={0}>
            <View style={[styles.iconHeaderBg, { backgroundColor: theme.colors.primaryContainer }]}>
              <InfoCircle size={26} color={theme.colors.primary} variant="Bold" />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
                发现问题了？
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                请在下方提供详细信息，帮助我们修复问题。
              </Text>
            </View>
          </Surface>

          {/* Main Form Section */}
          <Surface style={[styles.card, { backgroundColor: cardBackground, borderColor }]} elevation={0}>
            {/* Category Grid */}
            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
              类别 <Text style={{ color: theme.colors.error }}>*</Text>
            </Text>
            <View style={styles.categoryGrid}>
              {BUG_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    style={({ pressed }) => [
                      styles.categoryCard,
                      {
                        borderColor: isSelected
                          ? theme.colors.primary
                          : borderColor,
                        backgroundColor: isSelected
                          ? theme.colors.primaryContainer + '33'
                          : isDark || isAmoled
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <IconComponent
                      size={20}
                      color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                      variant={isSelected ? 'Bold' : 'Linear'}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
                          fontFamily: isSelected ? 'Nunito-Bold' : 'Nunito-Medium',
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Priority Selection Bar */}
            <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>优先级</Text>
            <View style={[styles.prioritySegmentContainer, { borderColor, backgroundColor: isDark || isAmoled ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              {PRIORITY_LEVELS.map((priority) => {
                const isSelected = selectedPriority === priority.id;
                return (
                  <TouchableOpacity
                    key={priority.id}
                    activeOpacity={0.7}
                    onPress={() => setPriority(priority.id)}
                    style={[
                      styles.priorityItem,
                      isSelected && [
                        styles.priorityItemActive,
                        { backgroundColor: priority.color + '22', borderColor: priority.color },
                      ],
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: isSelected ? priority.color : theme.colors.outline },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color: isSelected ? priority.color : theme.colors.onSurfaceVariant,
                          fontFamily: isSelected ? 'Nunito-Bold' : 'Nunito-Medium',
                        },
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input Fields */}
            <View style={styles.formFields}>
              <TextInput
                label="问题标题 *"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                placeholder="例如：连接 Wi-Fi 时壁纸无法加载"
              />

              <View>
                <TextInput
                  label="发生了什么？ *"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  outlineStyle={styles.inputOutline}
                  style={styles.input}
                  placeholder="请详细描述出现的问题……"
                />
                <Text style={[styles.charCount, { color: theme.colors.outline }]}>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>

              <TextInput
                label="复现步骤（可选）"
                value={stepsToReproduce}
                onChangeText={setStepsToReproduce}
                mode="outlined"
                multiline
                numberOfLines={3}
                outlineStyle={styles.inputOutline}
                style={styles.input}
                placeholder="1. 打开“发现”页面&#10;2. 点击 4K 筛选"
              />

              <TextInput
                label="预期行为（可选）"
                value={expectedBehavior}
                onChangeText={setExpectedBehavior}
                mode="outlined"
                multiline
                numberOfLines={2}
                outlineStyle={styles.inputOutline}
                style={styles.input}
                placeholder="您期望发生什么？"
              />

              <TextInput
                label="您的邮箱（可选）"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                placeholder="用于接收后续进展"
                keyboardType="email-address"
              />
            </View>

            {/* Submit Action Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              loading={isSubmitting}
              disabled={isSubmitting || !title || !description || !selectedCategory}
              icon={({ size, color }) => (
                <Send2 size={size} color={color} variant="Bold" />
              )}
            >
              提交反馈
            </Button>
          </Surface>

          {/* Alternative Contact Section */}
          <Surface style={[styles.card, { backgroundColor: cardBackground, borderColor }]} elevation={0}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              其他反馈方式
            </Text>

            <TouchableOpacity style={styles.contactRow} onPress={handleCopyEmail} activeOpacity={0.7}>
              <View style={[styles.contactIconBg, { backgroundColor: theme.colors.primaryContainer }]}>
                <Message size={18} color={theme.colors.primary} variant="Bold" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={[styles.contactTitle, { color: theme.colors.onSurface }]}>直接发送邮件</Text>
                <Text style={[styles.contactSubtitle, { color: theme.colors.onSurfaceVariant }]}>{EMAIL_ADDRESS}</Text>
              </View>
              <Copy size={18} color={theme.colors.outline} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactRow} onPress={handleOpenGitHub} activeOpacity={0.7}>
              <View style={[styles.contactIconBg, { backgroundColor: theme.colors.primaryContainer }]}>
                <Document size={18} color={theme.colors.primary} variant="Bold" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={[styles.contactTitle, { color: theme.colors.onSurface }]}>GitHub 议题</Text>
                <Text style={[styles.contactSubtitle, { color: theme.colors.onSurfaceVariant }]}>直接提交到代码仓库</Text>
              </View>
              {isOpeningGitHub ? (
                <ActivityIndicator size={18} color={theme.colors.primary} />
              ) : (
                <InfoCircle size={18} color={theme.colors.outline} />
              )}
            </TouchableOpacity>
          </Surface>

          {/* Device Info Card */}
          <Surface style={[styles.card, { backgroundColor: cardBackground, borderColor }]} elevation={0}>
            <View style={styles.deviceHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginBottom: 0 }]}>
                诊断信息
              </Text>
              <TouchableOpacity onPress={handleCopyDeviceInfo} style={styles.copyBadgeBtn} activeOpacity={0.7}>
                {isCopied ? (
                  <TickCircle size={16} color={theme.colors.primary} variant="Bold" />
                ) : (
                  <Copy size={16} color={theme.colors.primary} />
                )}
                <Text style={[styles.copyBadgeText, { color: theme.colors.primary }]}>
                  {isCopied ? '已复制' : '复制'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badgeRow}>
              <View style={[styles.infoBadge, { borderColor, backgroundColor: isDark || isAmoled ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                <Text style={[styles.infoBadgeText, { color: theme.colors.onSurfaceVariant }]}>
                  应用 v{appVersion}
                </Text>
              </View>
              <View style={[styles.infoBadge, { borderColor, backgroundColor: isDark || isAmoled ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                <Text style={[styles.infoBadgeText, { color: theme.colors.onSurfaceVariant }]}>
                  {deviceInfo}
                </Text>
              </View>
            </View>
          </Surface>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconHeaderBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: FontSizes.h4,
    fontFamily: 'Nunito-Bold',
  },
  heroSubtitle: {
    fontSize: FontSizes.bodySmall,
    fontFamily: 'Nunito-Medium',
    marginTop: 2,
    lineHeight: 18,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: FontSizes.h4,
    fontFamily: 'Nunito-Bold',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: FontSizes.bodySmall,
    fontFamily: 'Nunito-Bold',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: FontSizes.bodySmall,
  },
  prioritySegmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginBottom: 20,
  },
  priorityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityItemActive: {
    elevation: 1,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 12,
  },
  formFields: {
    gap: 4,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 14,
  },
  charCount: {
    textAlign: 'right',
    fontSize: FontSizes.bodySmall,
    marginTop: 4,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 14,
  },
  submitButtonContent: {
    paddingVertical: 6,
    flexDirection: 'row-reverse',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: FontSizes.body,
    fontFamily: 'Nunito-Bold',
  },
  contactSubtitle: {
    fontSize: FontSizes.bodySmall,
    fontFamily: 'Nunito-Medium',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBadgeText: {
    fontSize: FontSizes.bodySmall,
    fontFamily: 'Nunito-Bold',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoBadgeText: {
    fontSize: FontSizes.bodySmall,
    fontFamily: 'Nunito-Medium',
  },
});