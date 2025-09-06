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
import { ActivityIndicator } from "react-native";


let server_api_base_url = "http://192.168.167.234/textiepro/apis/";
const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation(); 


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setNumber] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("male");

  const [error, setFError] = useState("");

  const [submitting, setSubmitting] = useState(false);


  const selectGender = (gender)=>{
    setGender(gender)
  }

  const handleLogin = async () => {
    if (email.length === 0) {
      setFError("Email field is empty");
      return;
    }
    if (phoneNumber.length === 0) {
      setFError("Phone number field is empty");
      return;
    }
    if (username.length === 0) {
      setFError("Username field is empty");
      return;
    }
    if (password.length === 0) {
      setFError("Password field is empty");
      return;
    }
  
    setFError("");
    setSubmitting(true);
  
    try {
      const response = await axios.post(
        server_api_base_url + "index.php", 
        {
          email: email,
          username: username,
          phone: phoneNumber,
          gender: gender,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Server Response:", response.data);
  
      if (response.data === "success") {
        // Navigate to login or home screen
        navigation.navigate("Login");
      } else {
        setFError("Error: " + response.data);
      }
    } catch (error) {
      console.error("Request error:", error);
      setFError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
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
          className =" px-2"
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
            className=" px-4"
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
              Create account
            </Text>

              {error.length != 0 && (
                <View className =" border p-2 px-4 rounded-xl mb-4 bg-red-50 border-red-300">
                    <Text className =" text-red-500">{error}</Text>
                </View>
              )}
              

            
            <View >
                <Text className =" text-sm p-1 px-2 text-gray-500">Contact Details</Text>
            </View>
            <TextInput
              placeholder="Email"
              className =" text-gray-700"
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
              placeholder="Phone number"
              className =" text-gray-700"
              value={phoneNumber}
              onChangeText={setNumber}
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

            <View className =" mt-2">
                <Text className =" text-sm p-1 px-2 text-gray-500">Profile Details</Text>
            </View>

            <TextInput
              placeholder="Username"
              className =" text-gray-700"
              value={username}
              onChangeText={setUsername}
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

              {gender == "male" ? (
                <View className =" mb-4 flex flex-row justify-between">
                    <TouchableOpacity onPress={()=> selectGender("male")} className =" w-1/2 pr-1">
                        <View >
                            <View className =" border border-blue-300 rounded-2xl bg-blue-50 p-4">
                                <Text className =" text-center text-lg font-semibold text-blue-500">Male</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                

                    <TouchableOpacity onPress={()=> selectGender("female")} className =" w-1/2 pr-1">
                        <View >
                            <View className =" border border-gray-300 rounded-2xl bg-gray-50 p-4">
                                <Text className =" text-center text-lg font-semibold text-gray-500">Female</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
              ) : (
                <View className =" mb-4 flex flex-row justify-between">
                    <TouchableOpacity onPress={()=> selectGender("male")} className =" w-1/2 pr-1">
                        <View >
                            <View className =" border border-gray-300 rounded-2xl bg-gray-50 p-4">
                                <Text className =" text-center text-lg font-semibold text-gray-500">Male</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                

                    <TouchableOpacity onPress={()=> selectGender("female")} className =" w-1/2 pr-1">
                        <View >
                            <View className =" border border-blue-300 rounded-2xl bg-blue-50 p-4">
                                <Text className =" text-center text-lg font-semibold text-blue-500">Female</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
              )}
              






            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className =" text-gray-700"

              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                backgroundColor: "#fff",
              }}
            />

            <View className =" mb-4">
                <TouchableOpacity
                    
                >
                    <Text className=" text-gray-400 px-1" >
                    ✅ I accept the terms and conditions
                    </Text>
                </TouchableOpacity>
            </View>

            {submitting ? (
                <View
                    className =" bg-gray-400 flex flex-row justify-center"
                    style={{
                        paddingVertical: 15,
                        borderRadius: 12,
                        alignItems: "center",
                        marginBottom: 10,
                    }}
                    >
                    <ActivityIndicator size={16} color={"white"}></ActivityIndicator>
                    <Text
                        className=" mx-2"
                        style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
                    >
                        Please wait...
                    </Text>
                </View>
            ) : (
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
                        Sign up
                    </Text>
                </TouchableOpacity>
            )}
            

            <View className =" mb-1">
                <TouchableOpacity
                    onPress={()=>{ navigation.navigate("Login")}} 
                >
                    <Text style={{ color: "#007bff", textAlign: "center" }}>
                        Already have an account? Log in.
                    </Text>
                </TouchableOpacity>
            </View>

            

            
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
