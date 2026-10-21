import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedView, ThemedText } from '@/components/ThemedComponents';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '哎呀！' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">此页面不存在。</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">返回首页！</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});