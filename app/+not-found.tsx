import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AutumnColors } from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to calendar</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: AutumnColors.cream,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: AutumnColors.warmGray,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: AutumnColors.terracotta,
  },
});
