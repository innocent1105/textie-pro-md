import React from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";


const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Textie Pro",
    description:
      "The One-Tap Chat Platform. Discover new people, interact instantly, and share meaningful moments all in one place. Messaging made effortless.",
  },
  {
    id: 2,
    title: "Quality Moments For Quality Memories",
    description:
      "Easily share photos, videos, and updates with friends or the world. Turn everyday experiences into lasting memories that truly matter.",
  },
  {
    id: 3,
    title: "Get Started",
    description:
      "Join Textie Pro today and experience fast, secure, and fun conversations. Discover, share, and interact like never before.",
  },
];


export default function OnboardingScreen() {
  const navigation = useNavigation(); 

  return (
    <ImageBackground
      source={require("../../assets/images/bg.jpg")}
      style={{ flex: 2, width }}
      className=" "
      resizeMode="cover"
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Carousel
          loop={true}
          autoPlay        
          autoPlayInterval={3000} 
          width={width}
          height={height * 0.75}
          data={slides}
          renderItem={({ item }) => (
            <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 44,
                  fontWeight: "bold",
                  marginBottom: 20,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  lineHeight: 26,
                }}
              >
                {item.description}
              </Text>
            </View>
          )}
        />

        {/* CTA Button */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={ ()=> {navigation.replace("Login")}}
            style={{
              backgroundColor: "#007bff",
              paddingVertical: 15,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
