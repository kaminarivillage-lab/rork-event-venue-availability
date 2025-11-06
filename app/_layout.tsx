import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { VenueProvider } from "@/contexts/VenueContext";
import { EventProvider } from "@/contexts/EventContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { PlannerProvider } from "@/contexts/PlannerContext";
import { VendorProvider } from "@/contexts/VendorContext";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="calendar-embed" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <PrivacyProvider>
          <AuthProvider>
            <VenueProvider>
              <PlannerProvider>
                <VendorProvider>
                  <EventProvider>
                    <ExpenseProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                    </ExpenseProvider>
                  </EventProvider>
                </VendorProvider>
              </PlannerProvider>
            </VenueProvider>
          </AuthProvider>
        </PrivacyProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
