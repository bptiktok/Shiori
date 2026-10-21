import { StyleSheet, View, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme, Portal, Modal, Card } from 'react-native-paper';
import Animated, { 
  FadeIn, 
  FadeOut, 
  FadeInDown, 
  FadeOutUp,
  SlideInRight, 
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { memo, useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { 
  ArrowRight2, 
  Android,
  DocumentText1,
  TickCircle,
  CloseCircle,
  Heart,
  Discover,
  Category,
  ShieldSecurity,
  Star
} from 'iconsax-react-nativejs';
import { Platform } from 'react-native';

// Constants for version tracking - must match _layout.tsx
const CURRENT_APP_VERSION = '1.0.0';
const ONBOARDING_VERSION_KEY = 'onboardingCompletedForVersion';

type AnimationName = 'welcome' | 'search' | 'document' | 'confetti';

type OnboardingStep = {
  title: string;
  subtitle: string;
  description: string;
  lottie: AnimationName;
  gradientColors: readonly [string, string];
  showAgreement?: boolean;
};

const { width, height } = Dimensions.get('window');

// Memoized animation component
const LottieAnimation = memo(({ animationName }: { animationName: AnimationName }) => {
  const animations = {
    welcome: require('../assets/animations/welcome.json'),
    search: require('../assets/animations/search.json'),
    document: require('../assets/animations/document.json'),
    confetti: require('../assets/animations/confetti.json')
  };

  return (
    <LottieView
      source={animations[animationName]}
      autoPlay
      loop
      style={styles.lottie}
    />
  );
});

// Memoized indicator component
const StepIndicator = memo(({ active, index, total, theme }: { 
  active: boolean, 
  index: number, 
  total: number,
  theme: any 
}) => {
  const width = useSharedValue(active ? 28 : 8);
  const opacity = useSharedValue(active ? 1 : 0.4);
  const scale = useSharedValue(active ? 1 : 0.85);
  const translateY = useSharedValue(active ? 0 : 0);
  
  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      width.value = withSpring(28, {
        mass: 0.6,
        damping: 10,
        stiffness: 120,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.85, { duration: 200 });
      width.value = withSpring(8, {
        mass: 0.6,
        damping: 10,
        stiffness: 120
      });
      opacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [active]);
  
  return (
    <View style={styles.indicatorContainer}>
      <Animated.View
        style={[
          styles.indicator,
          {
            width: width,
            opacity: opacity,
            transform: [{ scale: scale }],
            backgroundColor: active 
              ? theme.colors.primary 
              : theme.dark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
          }
        ]}
      />
    </View>
  );
});

const OnboardingScreen = () => {
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [agreementVisible, setAgreementVisible] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const slideDirection = useSharedValue(1);
  const contentOpacity = useSharedValue(1);
  const contentScale = useSharedValue(1);
  const contentTranslateX = useSharedValue(0);
  const backgroundProgress = useSharedValue(1);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Check onboarding status on initial mount
  useEffect(() => {
    let isMounted = true;
    const checkOnboardingStatus = async () => {
      try {
        const completedVersion = await AsyncStorage.getItem(ONBOARDING_VERSION_KEY);
        if (completedVersion === CURRENT_APP_VERSION) {
          router.replace('/(tabs)');
          return;
        }
      } catch (error) {
        console.error('Error reading onboarding status:', error);
      } finally {
        if (isMounted) {
          setLoadingCheck(false);
        }
      }
    };

    checkOnboardingStatus();
    return () => { isMounted = false; };
  }, []);

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback) {
      console.log("Haptic feedback triggered");
    }
  }, [hapticFeedback]);

  const playSound = useCallback((soundName: string) => {
    if (soundEffects) {
      console.log(`Playing sound: ${soundName}`);
    }
  }, [soundEffects]);

  // Polished Modern Steps
  const onboardingSteps: OnboardingStep[] = [
    {
      title: '欢迎来到 Shiori',
      subtitle: '精选壁纸',
      description: '让屏幕沉浸在来自全球顶尖艺术家创作的惊艳作品中，每天都有新灵感。',
      lottie: 'welcome',
      gradientColors: theme.dark 
        ? ['#0F0F12', '#1B1C2A'] as const
        : ['#FFFFFF', '#F0F3F8'] as const
    },
    {
      title: '发现与个性化',
      subtitle: '无限探索',
      description: '按超高清分辨率、丰富的色板和精选合集轻松筛选。',
      lottie: 'search',
      gradientColors: theme.dark 
        ? ['#0F0F12', '#122538'] as const
        : ['#FFFFFF', '#EBF3FE'] as const
    },
    {
      title: '服务条款',
      subtitle: '透明与安全',
      description: '我们尊重您的隐私。请查看并接受我们的条款，以创建您的个性化空间。',
      lottie: 'document',
      gradientColors: theme.dark 
        ? ['#0F0F12', '#1E1B33'] as const
        : ['#FFFFFF', '#F3F0FF'] as const,
      showAgreement: true
    },
    {
      title: "一切就绪！",
      subtitle: '准备开始',
      description: '设置完成。现在就进来，改造你的手机屏幕体验吧。',
      lottie: 'confetti',
      gradientColors: theme.dark 
        ? ['#0F0F12', '#0A2925'] as const
        : ['#FFFFFF', '#E6F9F4'] as const
    }
  ];

  const handleSkip = useCallback(async () => {
    triggerHaptic();
    playSound('skip');
    try {
      await AsyncStorage.setItem(ONBOARDING_VERSION_KEY, CURRENT_APP_VERSION);
    } catch (error) {
      console.error('Error setting AsyncStorage in handleSkip:', error);
    }
    router.replace('/(tabs)');
  }, [triggerHaptic, playSound]);

  const transitionToNextStep = useCallback((nextStep: number) => {
    setCurrentStep(nextStep);
    setIsAnimating(false);
    
    backgroundProgress.value = withSequence(
      withTiming(0.5, { duration: 150 }),
      withTiming(1, { duration: 350 })
    );
    
    contentOpacity.value = withTiming(1, { duration: 300 });
    contentScale.value = withTiming(1, { duration: 300 });
    contentTranslateX.value = withTiming(0, { duration: 300 });
  }, [backgroundProgress, contentOpacity, contentScale, contentTranslateX]);

  const handleNext = useCallback(async () => {
    if (isAnimating) return;
    
    triggerHaptic();
    playSound('next');
    
    if (currentStep === 2 && !agreementAccepted) {
      setAgreementVisible(true);
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      slideDirection.value = 1;
      
      contentOpacity.value = withTiming(0, { duration: 250 });
      contentScale.value = withTiming(0.95, { duration: 250 });
      contentTranslateX.value = withTiming(-width * 0.15, { duration: 250 });
      
      setTimeout(() => {
        transitionToNextStep(currentStep + 1);
      }, 250);
    } else {
      triggerHaptic();
      playSound('success');
      try {
        await AsyncStorage.setItem(ONBOARDING_VERSION_KEY, CURRENT_APP_VERSION);
      } catch (error) {
        console.error('Error setting AsyncStorage in handleNext:', error);
      }
      router.replace('/(tabs)');
    }
  }, [currentStep, agreementAccepted, isAnimating, onboardingSteps.length, slideDirection, contentOpacity, contentScale, contentTranslateX, transitionToNextStep, triggerHaptic, playSound]);

  const handleBack = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    
    triggerHaptic();
    playSound('back');
    
    setIsAnimating(true);
    slideDirection.value = -1;
    
    contentOpacity.value = withTiming(0, { duration: 250 });
    contentScale.value = withTiming(0.95, { duration: 250 });
    contentTranslateX.value = withTiming(width * 0.15, { duration: 250 });
    
    setTimeout(() => {
      transitionToNextStep(currentStep - 1);
    }, 250);
  }, [currentStep, isAnimating, slideDirection, contentOpacity, contentScale, contentTranslateX, transitionToNextStep, triggerHaptic, playSound]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      { scale: contentScale.value },
      { translateX: contentTranslateX.value }
    ]
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      backgroundProgress.value,
      [0, 0.5, 1],
      [1, 0.8, 1],
      Extrapolate.CLAMP
    )
  }));

  const buttonScaleAnim = useSharedValue(1);
  
  const handlePressIn = useCallback(() => {
    buttonScaleAnim.value = withTiming(0.96, { duration: 100 });
  }, [buttonScaleAnim]);
  
  const handlePressOut = useCallback(() => {
    buttonScaleAnim.value = withTiming(1, { duration: 100 });
  }, [buttonScaleAnim]);
  
  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScaleAnim.value }]
  }));

  const canGoBack = currentStep > 0;

  if (loadingCheck) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <Animated.View style={[styles.backgroundContainer, animatedBackgroundStyle]}>
        <LinearGradient
          colors={onboardingSteps[currentStep].gradientColors}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {theme.dark && (
          <View style={styles.patternOverlay} pointerEvents="none">
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <View key={`row-${rowIndex}`} style={{ flexDirection: 'row' }}>
                {Array.from({ length: 8 }).map((_, colIndex) => (
                  <View 
                    key={`dot-${rowIndex}-${colIndex}`} 
                    style={{
                      width: 2,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      margin: 24
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </Animated.View>
      
      <View style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
        {/* Header navigation */}
        <View style={styles.headerNav}>
          <View style={styles.headerLeft}>
            {canGoBack && (
              <Animated.View entering={FadeIn.duration(300)}>
                <Button
                  mode="text"
                  onPress={handleBack}
                  textColor={theme.dark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)'}
                  labelStyle={{ fontFamily: 'Nunito-SemiBold', fontSize: 14 }}
                  icon={({ size, color }) => (
                    <ArrowRight2 size={18} color={color} variant="Broken" style={{ transform: [{ rotate: '180deg' }] }} />
                  )}
                  compact
                >
                  上一步
                </Button>
              </Animated.View>
            )}
          </View>
          
          <View style={styles.headerRight}>
            <Animated.View entering={FadeIn.duration(300)}>
              <Button
                mode="text"
                onPress={() => setSettingsVisible(true)}
                textColor={theme.dark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)'}
                labelStyle={{ fontFamily: 'Nunito-SemiBold', fontSize: 14 }}
                icon={({ size, color }) => (
                  <DocumentText1 size={18} color={color} variant="Broken" />
                )}
                compact
              >
                设置
              </Button>
            </Animated.View>

            {currentStep < onboardingSteps.length - 1 && (
              <Animated.View entering={FadeIn.duration(400)}>
                <Button
                  mode="text"
                  onPress={handleSkip}
                  textColor={theme.colors.primary}
                  labelStyle={{ fontFamily: 'Nunito-Bold', fontSize: 14 }}
                  compact
                >
                  跳过
                </Button>
              </Animated.View>
            )}
          </View>
        </View>
        
        {/* Main content */}
        <View style={styles.mainContentWrapper}>
          <Animated.View 
            style={[styles.mainContent, animatedContentStyle]}
            entering={FadeIn.duration(400)}
          >
            <View style={styles.animationContainer}>
              <LottieAnimation animationName={onboardingSteps[currentStep].lottie} />
            </View>
            
            <View style={[
              styles.textContainer,
              { 
                backgroundColor: theme.dark 
                  ? 'rgba(22, 22, 30, 0.75)' 
                  : 'rgba(255, 255, 255, 0.85)',
                borderColor: theme.dark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderWidth: 1
              }
            ]}>
              <Text variant="labelMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
                {onboardingSteps[currentStep].subtitle}
              </Text>

              <Text variant="headlineMedium" style={[styles.title, { 
                color: theme.dark ? '#FFFFFF' : '#1A1A1A',
                fontFamily: 'Nunito-Bold'
              }]}>
                {onboardingSteps[currentStep].title}
              </Text>
              
              <Text variant="bodyLarge" style={[styles.description, {
                color: theme.dark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)',
                fontFamily: 'Nunito-Regular'
              }]}>
                {onboardingSteps[currentStep].description}
              </Text>
              
              {onboardingSteps[currentStep].showAgreement && !agreementAccepted && (
                <Button
                  mode="outlined"
                  onPress={() => setAgreementVisible(true)}
                  style={[styles.termsButton, { borderColor: theme.colors.primary }]}
                  labelStyle={{ fontFamily: 'Nunito-Bold', fontSize: 13 }}
                  icon={({ size, color }) => (
                    <DocumentText1 size={18} color={color} variant="Broken" />
                  )}
                >
                  查看条款与条件
                </Button>
              )}
              
              {onboardingSteps[currentStep].showAgreement && agreementAccepted && (
                <View style={styles.acceptedContainer}>
                  <TickCircle
                    size={20}
                    color={theme.colors.primary}
                    variant="Broken"
                  />
                  <Text style={{ color: theme.colors.primary, fontFamily: 'Nunito-Bold', fontSize: 13 }}>
                    条款已接受
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.indicators}>
            {onboardingSteps.map((_, index) => (
              <StepIndicator
                key={index}
                active={currentStep === index}
                index={index}
                total={onboardingSteps.length}
                theme={theme}
              />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <Animated.View style={[styles.buttonContainer, buttonAnimStyle]}>
              <Button
                mode="contained"
                onPress={handleNext}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
                labelStyle={{
                  fontSize: 16,
                  fontFamily: 'Nunito-Bold',
                  letterSpacing: 0.3
                }}
                icon={({ size, color }) => 
                  currentStep === onboardingSteps.length - 1 ? (
                    <Star size={20} color={color} variant="Broken" />
                  ) : (
                    <ArrowRight2 size={20} color={color} variant="Broken" />
                  )
                }
              >
                {currentStep === onboardingSteps.length - 1 ? '开始使用' : '继续'}
              </Button>
            </Animated.View>
          </Animated.View>
          
          <Animated.View 
            entering={FadeIn.delay(200).duration(400)}
            style={styles.progressTextContainer}
          >
            <Text style={[styles.progressText, { 
              color: theme.dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
              fontFamily: 'Nunito-SemiBold'
            }]}>
              第 {currentStep + 1} 步，共 {onboardingSteps.length} 步
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Terms and Conditions Modal */}
      <Portal>
        <Modal
          visible={agreementVisible}
          onDismiss={() => setAgreementVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Card style={styles.modalCard}>
            <Card.Title 
              title="条款与条件" 
              titleStyle={{ fontFamily: 'Nunito-Bold', fontSize: 18 }}
              left={(props) => <DocumentText1 size={24} color={theme.colors.primary} variant="Broken" />}
            />
            <Card.Content>
              <ScrollView style={styles.agreementScroll} showsVerticalScrollIndicator={false}>
                <Text style={{ 
                  lineHeight: 22,
                  fontFamily: 'Nunito-Regular',
                  color: theme.colors.onSurface,
                  fontSize: 14
                }}>
                  1. 条款接受{'\n\n'}
                  使用 Shiori 即表示您同意这些条款与条件。这些条款适用于本应用的所有用户。
                  {'\n\n'}
                  2. 壁纸内容{'\n\n'}
                  • 所有壁纸均来自 Wallhaven，并受其各自许可协议约束。{'\n'}
                  • 部分壁纸可能需要 Wallhaven API 密钥才能访问。{'\n'}
                  • 用户必须遵守内容分级与访问限制。
                  {'\n\n'}
                  3. 用户责任{'\n\n'}
                  • 您同意仅将本应用用于个人、非商业目的。{'\n'}
                  • 您不得尝试绕过任何内容限制。{'\n'}
                  • 使用本应用产生的任何数据费用由您自行承担。
                  {'\n\n'}
                  4. 隐私与数据{'\n\n'}
                  • 我们仅收集应用功能所必需的最少数据。{'\n'}
                  • 您提供的 Wallhaven API 密钥将安全存储在您的设备上。{'\n'}
                  • 我们不会与第三方共享任何个人信息。
                  {'\n\n'}
                  5. 内容限制{'\n\n'}
                  • NSFW 内容需要年龄验证以及有效的 Wallhaven API 密钥。{'\n'}
                  • 用户必须遵守当地有关内容访问的法律法规。
                  {'\n\n'}
                  6. 条款变更{'\n\n'}
                  我们保留随时修改这些条款的权利。继续使用本应用即表示接受任何变更。
                </Text>
              </ScrollView>
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              <Button 
                onPress={() => setAgreementVisible(false)}
                textColor={theme.colors.error}
                labelStyle={{ fontFamily: 'Nunito-Bold' }}
                icon={({ size, color }) => (
                  <CloseCircle size={18} color={color} variant="Broken" />
                )}
              >
                拒绝
              </Button>
              <Button 
                mode="contained"
                onPress={() => {
                  setAgreementAccepted(true);
                  setAgreementVisible(false);
                  triggerHaptic();
                  playSound('success');
                }}
                style={{ backgroundColor: theme.colors.primary, borderRadius: 12 }}
                labelStyle={{ fontFamily: 'Nunito-Bold' }}
                icon={({ size, color }) => (
                  <TickCircle size={18} color={color} variant="Broken" />
                )}
              >
                接受
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
      
      {/* Settings Modal */}
      <Portal>
        <Modal
          visible={settingsVisible}
          onDismiss={() => setSettingsVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Card style={styles.modalCard}>
            <Card.Title 
              title="偏好设置" 
              titleStyle={{ fontFamily: 'Nunito-Bold', fontSize: 18 }}
            />
            <Card.Content>
              <View style={styles.settingsRow}>
                <Text style={{ 
                  fontFamily: 'Nunito-SemiBold',
                  color: theme.colors.onSurface,
                  fontSize: 15
                }}>振动反馈</Text>
                <Button
                  mode={hapticFeedback ? "contained" : "outlined"}
                  onPress={() => setHapticFeedback(!hapticFeedback)}
                  style={[styles.toggleButton, hapticFeedback ? { backgroundColor: theme.colors.primary } : {}]}
                  labelStyle={{ fontFamily: 'Nunito-Bold' }}
                  compact
                >
                  {hapticFeedback ? '开' : '关'}
                </Button>
              </View>
              
              <View style={styles.settingsRow}>
                <Text style={{ 
                  fontFamily: 'Nunito-SemiBold',
                  color: theme.colors.onSurface,
                  fontSize: 15
                }}>音效</Text>
                <Button
                  mode={soundEffects ? "contained" : "outlined"}
                  onPress={() => setSoundEffects(!soundEffects)}
                  style={[styles.toggleButton, soundEffects ? { backgroundColor: theme.colors.primary } : {}]}
                  labelStyle={{ fontFamily: 'Nunito-Bold' }}
                  compact
                >
                  {soundEffects ? '开' : '关'}
                </Button>
              </View>
              
              <View style={styles.settingsInfo}>
                <Heart size={18} color={theme.colors.primary} variant="Broken" />
                <Text style={{ 
                  fontFamily: 'Nunito-Regular',
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 13,
                  marginLeft: 10,
                  flex: 1
                }}>
                  这些设置将应用于您的 Shiori 使用体验。
                </Text>
              </View>
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              <Button 
                mode="contained"
                onPress={() => setSettingsVisible(false)}
                style={{ backgroundColor: theme.colors.primary, borderRadius: 12, width: '100%' }}
                labelStyle={{ fontFamily: 'Nunito-Bold' }}
              >
                完成
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicatorContainer: {
    padding: 3,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    backgroundColor: 'transparent',
    justify: 'space-around',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifySpaceBetween: 'space-between',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 44,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mainContentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    height: height * 0.32,
    width: width * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  subtitle: {
    letterSpacing: 1.5,
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 22,
    lineHeight: 28,
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  termsButton: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 2,
  },
  acceptedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 200, 120, 0.12)',
  },
  footer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 16,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 18,
    width: '100%',
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
  },
  buttonContent: {
    height: 52,
    flexDirection: 'row-reverse',
  },
  progressTextContainer: {
    alignItems: 'center',
    marginTop: -4,
  },
  progressText: {
    fontSize: 12,
  },
  modal: {
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalCard: {
    borderRadius: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  agreementScroll: {
    maxHeight: 360,
    marginVertical: 12,
  },
  modalActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  toggleButton: {
    borderRadius: 14,
    minWidth: 70,
  },
  settingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    borderRadius: 14,
  },
});

export default OnboardingScreen;