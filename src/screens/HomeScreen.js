// UserMap.js
import React, { useEffect, useRef,useMemo, useState } from "react";
import { View, Platform, Text,ScrollView, Image,Dimensions,Modal } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { TextInput } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserMap() {
  const navigation = useNavigation();
  let server_api_base_url = "http://textie.atwebpages.com/";

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState("none");

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const [user_id, setUserId] = useState("");
  const loadUser = async () => {
    const id = await SecureStore.getItemAsync('id');

    if (id) setUserId(id);
  };


  useEffect(() => {
    loadUser();
  }, []);

  const { width } = Dimensions.get("window");

  const placeImages = [
    "https://picsum.photos/200/200?random=1",
    "https://picsum.photos/200/200?random=2",
    "https://picsum.photos/200/200?random=3",
    "https://picsum.photos/200/200?random=4",
    "https://picsum.photos/200/200?random=5",
  ];


  const webviewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [users, setUsers] = useState([]);

  const [pins, setPins] = useState([]);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await axios.post(`${server_api_base_url}get_pins.php`, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (ReactNative)"
          },
        });

        if (res.headers["content-type"]?.includes("application/json")) {
          setPins(res.data);
          // console.log("Fetched pins:", res.data);
        } else {
          console.warn("Unexpected response type:", res.headers["content-type"]);
        }
        console.log(res.data)
        // setPins(response);
      } catch (err) {
        console.error("Fetch error -2:", err);
      }
    };
    
  
    fetchPins();
  
    const interval = setInterval(fetchPins, 100000);
  
    return () => clearInterval(interval);
  }, []);
  

  const pinsJS = pins
  .map(
    (pin) => {
     
      const angle = (Math.random() * 40 - 10).toFixed(2);
      let scale = (Math.random() * 70).toFixed(2);

      if(scale < 30){
        scale = 70;
      }

      return `
        const icon${pin.id} = L.divIcon({
          className: 'custom-marker',
          html: '<style>.pinUserImage : hover{tranform: scale(1.5);}</style><div class="pinUserImage" style="width: ${scale}px; height: ${scale}px; border-radius: 8px; overflow: hidden; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transform: rotate(${angle}deg);"><img src="${server_api_base_url}view_image.php?file=${pin.images}" style="width:100%; height:100%; object-fit:cover;" /></div>',
          iconSize: [50, 50],
          iconAnchor: [25, 25],
          popupAnchor: [0, -25]
        });

        L.marker([${pin.lat}, ${pin.lng}], { icon: icon${pin.id} })
          .addTo(map)
          .bindPopup("<b>${pin.name}</b><br>${pin.description}");
      `;
    }
  ).join("\n");




  const usersJson = JSON.stringify(users);

  const getUsersUrl = server_api_base_url + "geo_users.php";
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.post(getUsersUrl, { user_id });
        if (res.data && Array.isArray(res.data)) {
          setUsers(res.data);
          // console.log("fetched users")
        }
      } catch (err) {
        console.log("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);


  

// inside your component
const leafletHTML = useMemo(() => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <style>
        html,body,#map { height:100%; margin:0; padding:0; }
        #map { width:100%; height:100vh; }

        .avatar-marker { background: transparent; border: none; }
        .avatar-badge {
          width: 48px; height: 48px; border-radius: 50%;
          overflow: hidden; border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        }
        .avatar-badge img { width:100%; height:100%; object-fit:cover; display:block; }

        .you-marker .you-dot {
          width:25px; height:25px; border-radius:50%;
          background:#4D4DFF;
          box-shadow: 0 0 0 6px rgba(42,82,190,0.25);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        (function(){
          const _origConsole = console.log.bind(console);
          function forwardLog() {
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', payload: Array.from(arguments) }));
            } catch (e) {}
            _origConsole.apply(null, arguments);
          }
          console.log = forwardLog;

          const map = L.map('map').setView([-25.2, 30.7785195], 3);
          map.on("dragstart", ()=>{ map._userMoved = true; });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const users = ${JSON.stringify(users)};
          const avatarIcon = (url) => L.divIcon({
            className: 'avatar-marker',
            html: '<div class="avatar-badge"><img src="http://textie.atwebpages.com/view_pp.php?file='+url+'" /></div>',
            iconSize: [48,48],
            iconAnchor: [24,24],
            popupAnchor: [0,-26]
          });

          users.forEach(user => {
            try {
              const marker = L.marker(user.position, { icon: avatarIcon(user.avatar) }).addTo(map);
              marker.bindPopup("<b>" + user.name + "</b><br>" + user.email);
              marker.on("click", () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'user', payload: user }));
              });
            } catch (e) {
              console.log('marker error', e);
            }
          });

          let youMarker = null;
          function setCurrentLocation(lat, lng) {
            try {
              if (youMarker) map.removeLayer(youMarker);
              youMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                  className: 'you-marker',
                  html: '<div class="you-dot"></div>',
                  iconSize: [16,16],
                  iconAnchor: [8,8]
                })
              }).addTo(map).bindPopup("You are here");

              if (!map._userMoved) {
                map.setView([lat, lng], 14);
              }
            } catch (e) {
              console.log('setCurrentLocation error', e);
            }
          }
          window.setRNLocation = setCurrentLocation;

          document.addEventListener('message', e => {
            try {
              const data = JSON.parse(e.data);
              if(data?.type === 'location' && data.lat && data.lng){
                setCurrentLocation(data.lat, data.lng);
              }
            } catch(e){}
          });
          window.addEventListener('message', e => {
            try {
              const data = JSON.parse(e.data);
              if(data?.type === 'location' && data.lat && data.lng){
                setCurrentLocation(data.lat, data.lng);
              }
            } catch(e){}
          });

          map.whenReady(() => {
            try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' })); } catch (e) {}
          });

          ${pinsJS}

          let currentPin = null;
          map.on("click", function (e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            if (currentPin) map.removeLayer(currentPin);
            currentPin = L.marker([lat, lng]).addTo(map)
              .bindPopup("Pin this location")
              .openPopup();
            currentPin.addEventListener("click", ()=>{
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: "mapClick", payload: { lat, lng } })
              );
            });
          });

        })();
      </script>
    </body>
  </html>
`, [users, pinsJS]); 
  const [address, setAddress] = useState(null);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted"){
          console.warn("Location permission denied");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  
        const { latitude, longitude } = loc.coords;
        setPendingLocation({ latitude, longitude });

        setLng(longitude)
        setLat(latitude) 


        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (!mounted) return;
  
        if (geo.length > 0) {
          setAddress({
            user_id: user_id,
            country: geo[0].country,
            province: geo[0].region,
            region: geo[0].region,
            city: geo[0].city,
            postalCode: geo[0].postalCode,
            street: geo[0].street,
            lng : longitude,
            lat : latitude
          });
          

          if(latitude !== null){
            try{
              const response = await axios.post(
                server_api_base_url + "save_coordinates.php",{
                  "address" : address
                },{
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
  
              console.log(response.data)
            }catch(err){
              console.log("error :", err)
            }
          }

          console.log(address)
        }

      } catch (e) {
        console.warn("Location error:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);




  useEffect(() => {
    if (mapReady && pendingLocation && webviewRef.current) {
      const { latitude, longitude } = pendingLocation;
      try {
        const js = `window.setRNLocation(${latitude}, ${longitude}); true;`;
        webviewRef.current.injectJavaScript(js);
      } catch (e) {
        // fallback: send as postMessage (some RN/WebView versions prefer this)
        try {
          webviewRef.current.postMessage(JSON.stringify({ type: 'location', lat: latitude, lng: longitude }));
        } catch (err) {
          console.warn("Could not send location to WebView", err);
        }
      }
    }
  }, [mapReady, pendingLocation]);




  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (!data || !data.type) return;

      if (data.type === "mapReady") {
        setMapReady(true);
      } else if (data.type === "user") {
        console.log("User clicked (from web):", data.payload);
      } else if (data.type === "log") {
        console.log("WEB:", ...data.payload);
      }
    } catch (e) {
      console.warn("onMessage parse error:", e);
    }
  };

  const [placeName, setPlaceName] = useState(null);
  const [description, setDescription] = useState(null);
  const [tags, setTags] = useState(null);

  const handlePinLocation = async (lat, lng) => {

 
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
  
      if (results.length > 0) {
        const place = results[0];
        console.log("Place details:", place);
  
       
        setPinnedPlace({
          city: place.city,
          region: place.region,
          country: place.country,
          street: place.street,
        });

        setDescription(place.city);
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
    }
  };

  const [pinSaved, setPinSaved] = useState(false);
  const [formError, setPinFormError] = useState("")
  const savePin = async (formData) => {
    console.log("saving")
    try {
      const res = await axios.post(`${server_api_base_url}pins.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPinFormError("")
      console.log(res.data)
    } catch (err) {
      console.error("Save Pin Error:", err);
    }
  };


  const handleSubmit = async () => {
    if(!placeName || !description || !image){
      console.log("cant submit");
      setPinFormError("Add all details and an image")
      return;
    }

    setPinFormError("")


    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("name", placeName);
      formData.append("des", description);
      formData.append("lat", lat?.toString());
      formData.append("lng", lng?.toString());
      
      formData.append("tag", tags);
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "pin.jpg",
      });

      await savePin(formData)

      setPinSaved(true);

      setPinnedLocation(null)
      setPlaceName(null)
      setDescription(null)
      setTags(null)
      setImage(null);

      setTimeout(()=>{
        setPinSaved(false);
        setVisible(false)
      }, 2000)
      
    } catch (error) {
      console.error("Error submitting pin:", error);
      alert("Failed to save pin");
    } finally {
      setLoading(false);
    }
  };

  const [clickedUser, setCUser] = useState(null)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
     <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white w-full rounded-t-3xl p-6 shadow-lg max-h-[80%]">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="font-bold text-lg text-gray-800">
              Pin Location
            </Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <AntDesign name="close" size={22} color="black" />
            </TouchableOpacity>
          </View>

          {pinSaved && (
            <View className=" border border-green-500 bg-green-50 rounded-lg p-2 px-4 mb-2">
              <Text className=" text-green-600 font-bold">Location has been pinned</Text>
            </View>
          )}

          {formError.length != 0 ? (
            <View className=" border border-red-500 bg-red-50 rounded-lg p-2 px-4 mb-2">
              <Text className=" text-red-600 font-bold">{formError}</Text>
            </View>
          ) : (
            <View></View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-gray-700 mb-1">Location name</Text>
            <TextInput
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="e.g. Coffee Shop"
              className="border border-gray-300 rounded-xl px-3 py-2 mb-4 text-gray-800"
            />

            <Text className="text-gray-700 mb-1">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Write something about this place..."
              multiline
              className="border border-gray-300 rounded-xl px-3 py-2 mb-4 text-gray-800 h-16"
            />

            <Text className="text-gray-700 mb-1">Tags</Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="e.g. food, coffee, wifi"
              className="border border-gray-300 rounded-xl px-3 py-2 mb-4 text-gray-800"
            />

            <Text className="text-gray-700 mb-2">Image</Text>
            {image ? (
              <View className ="  rounded-xl">
                <View className=" absolute w-full p-4 z-40 flex flex-row justify-end">
                  <TouchableOpacity onPress={()=>{setImage(null)}} className =" bg-black/50 rounded-lg p-2">
                    <AntDesign name="close" size={16} color="#ccc" />
                  </TouchableOpacity>
                </View>
                <Image
                  source={{ uri: image }}
                  className="w-full h-40 rounded-xl mb-3"
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                className="border-2 border-dashed border-gray-300 rounded-xl h-32 items-center justify-center mb-4"
              >
                <AntDesign name="plus" size={28} color="gray" />
                <Text className="text-gray-500 mt-2">Upload Image</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={()=>{handleSubmit()}} className="bg-blue-600 py-3 rounded-2xl mt-2">
              <Text className="text-white text-center font-bold text-lg">
                Post
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>

      <WebView
        className=" "
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        javaScriptEnabled={true}
        geolocationEnabled={true}
        mixedContentMode="always"
      
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);

          if (data.type === "mapClick") {
            const { lat, lng } = data.payload;
            console.log("Pinned coords:", lat, lng);

            handlePinLocation(lat, lng);
            setVisible(true);
          }

          // this part here 
          if (data.type === "user") {
            console.log("User clicked marker:", data.payload);
            setCUser(data.payload)
          }
        }}
        style={{ flex: 1 }}
      />

      <View className=" absolute flex flex-row justify-between left-0 right-0 top-0 bg-white p-4 pb-0 pt-10">
        <Text className =" text-xl font-bold">Discover</Text>
        <View className=" flex flex-row justify-end">
          <TouchableOpacity onPress={()=>{}} className="p-2 rounded-md">
            <View className="  absolute p-1 ml-6 mt-2 rounded-full bg-red-500 z-40">
            </View>

            <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
          </TouchableOpacity>
       
          <TouchableOpacity className=" p-2 rounded-md">
            <View className="  absolute p-1 ml-6 mt-2 rounded-full bg-red-500 z-40">
            </View>
            <Feather name="bell" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>{navigation.navigate("Login")}} className=" p-2 rounded-md">
            {/* <View className="  absolute p-1 ml-6 mt-2 rounded-full bg-red-500 z-40">
            </View> */}
            <Feather name="settings" size={24} color="#111" />
          </TouchableOpacity>

        </View>

      </View>


      <View className=" absolute rounded-2xl flex flex-col left-2 top-24 overflow-hidden">
          <TouchableOpacity onPress={()=>{setVisible(true)}} className =" rounded-2xl flex flex-row bg-white p-3">
            <Feather name="plus" size={24} color="black" />
            {/* <Text className=" font-bold text-gray-700 text-sm">weuibf wefb</Text> */}
          </TouchableOpacity>
          <View className=" ">
            <View className =" rounded-2xl mt-1 bg-white p-3">
              <Feather name="search" size={24} color="black" />
            </View>
          </View>
      </View>

          
      <View className=" absolute left-0 bottom-10 right-0 px-2 ">
        <View className=" w-full flex flex-row right-0 py-1">
          <View className="  mr-1 flex flex-row rounded-full bg-white p-2">
            <Feather name="map-pin" size={24} color="#4D4DFF" />
            <Text className=" font-bold px-1 pt-1 text-blue-700 text-sm">Pins</Text>
          </View>

          <View className=" mr-1 flex flex-row rounded-full bg-white p-2">
            <Feather name="user" size={24} color="#6495ED" />
            <Text className=" font-bold px-1 pt-1 text-blue-400 text-sm">Near me</Text>
          </View>
          {/* <View className=" mr-1 flex flex-row rounded-full bg-white p-2">
            <Ionicons name="balloon-outline" size={24} color="#008B8B" />
            <Text className=" font-bold px-1 pt-1 text-green-600 text-sm">Memories</Text>
          </View> */}
        </View>
        
        {tab == "pins" && (
          <View className=" rounded-3xl bg-white flex-1">
          <Text className="font-bold text-lg text-gray-800 p-4 pb-0">Pins and moments</Text>

          <ScrollView
            className="p-4 after:rounded-3xl overflow-hidden"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {pins.map((pin, index) => (
              <View key={index}>
                <View
                  className="rounded-2xl overflow-hidden mr-4"
                  style={{ width: width * 0.6, height: 130 }}
                >
                  <Image
                    source={{ uri: `${server_api_base_url}view_image.php?file=${pin.images}` }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
                <View className="mt-4 mr-4">
                  <View className="flex flex-row justify-between">
                    <Text className="pl-2 font-bold px-2 py-2 rounded-full">
                      {pin.name}
                    </Text>
                    <Text className="pl-2 text-blue-500 font-bold border-2 border-blue-200 bg-blue-100 px-4 py-2 rounded-full">
                      Now Open
                    </Text>
                  </View>
                  <View>
                    <View style={{ width: width * 0.6 }}>
                      <Text className="my-2 px-2">
                        {pin.description}
                      </Text>
                    </View>

                    <View className="flex flex-row px-2">
                      <AntDesign name="star" size={14} color="#FEBE10" />
                      <Text className =" text-gray-400 text-xs px-1">
                        Reviews
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

        </View>
        )}

        {clickedUser && (
          <View  className=" rounded-3xl bg-white flex-1 p-4 pb-20">
          <Text className="font-bold text-lg text-gray-800 pb-2">Profile</Text>

            <View className=" flex flex-row justify-between">
              <View className=" flex flex-row ">
                <View className =" rounded-xl overflow-hidden">
                  <Image
                    source={{ uri: `${server_api_base_url}view_pp.php?file=${clickedUser.avatar}` }}
                    className=" w-16 h-16"
                    resizeMode="cover" 
                  />
                </View>
                <View className="  mx-2">
                  <Text className =" text-lg text-gray-700 font-semibold">{clickedUser.name}</Text>
                  <Text className =" text-sm text-gray-500">Lives in {clickedUser.city}</Text>
                </View>
              </View>

              <View className=" ">
                <TouchableOpacity className="bg-blue-700 p-6 py-2 rounded-md">
                  <Text className=" text-white text-lg font-bold ">Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

       
      </View>

      


    </GestureHandlerRootView>
  );
}
