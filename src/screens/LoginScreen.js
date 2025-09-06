import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';


let server_api_base_url = "http://192.168.167.234/textiepro/apis/";
const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setFError] = useState("");

  const handleLogin = async () => {
    if (email.length === 0) {
      setFError("Email field is empty");
      return;
    }
    if (password.length === 0) {
      setFError("Password field is empty");
      return;
    }

    setFError("");

    try {
      const response = await axios.post(
        server_api_base_url + "login.php",
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server Response:", response.data);

      if (response.data.status === "success") {
        const user_id = response.data.user_id;
        await SecureStore.setItemAsync('id', user_id);
        navigation.navigate("Home", { user: response.data });

      } else if (response.data === "wrong-password") {
        setFError("Incorrect password");
      } else if (response.data === "error-1") {
        setFError("Email not found");
      } else {
        setFError("Login failed");
      }
    } catch (err) {
      console.error("Request error:", err);
      setFError("Network error, please try again.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/bg.jpg")}
      style={{ flex: 1, width, height }}
      resizeMode="cover"
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center", padding: 10 }}
          className="px-2"
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 30,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
            className="px-4"
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                marginBottom: 20,
                textAlign: "center",
                color: "#333",
              }}
            >
              Login
            </Text>

            {error.length !== 0 && (
              <View className="border p-2 px-4 rounded-xl mb-4 bg-red-50 border-red-300">
                <Text className="text-red-500">{error}</Text>
              </View>
            )}

            <TextInput
              placeholder="Email"
              className="text-gray-700"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                backgroundColor: "#fff",
              }}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="text-gray-700"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                backgroundColor: "#fff",
              }}
            />

            <View className="flex flex-row justify-end px-1 mb-4">
              <TouchableOpacity>
                <Text
                  style={{ textAlign: "center" }}
                  className="text-gray-400"
                >
                  Forgot password
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={{
                backgroundColor: "#007bff",
                paddingVertical: 15,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Login
              </Text>
            </TouchableOpacity>

            <View className="mb-4">
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("register");
                }}
              >
                <Text style={{ color: "#007bff", textAlign: "center" }}>
                  Don't have an account? Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
