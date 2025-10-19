import { Tabs } from "expo-router";
import { Calendar, Settings, DollarSign, CalendarDays, CalendarCheck, Eye, EyeOff, Briefcase, Home } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

import Colors from "@/constants/colors";
import { usePrivacy } from "@/contexts/PrivacyContext";

export default function TabLayout() {
  const { isMoneyBlurred, toggleMoneyBlur } = usePrivacy();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={toggleMoneyBlur}
            style={{
              marginRight: 16,
              padding: 8,
              backgroundColor: isMoneyBlurred ? Colors.light.tint : '#F3F4F6',
              borderRadius: 8,
            }}
          >
            {isMoneyBlurred ? (
              <EyeOff size={20} color="#FFFFFF" />
            ) : (
              <Eye size={20} color={Colors.light.tint} />
            )}
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8D7C3',
        },
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => <CalendarDays size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Economics",
          tabBarIcon: ({ color }) => <DollarSign size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => <Briefcase size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: "Availability",
          tabBarIcon: ({ color }) => <CalendarCheck size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
