import qrcode from "qrcode-terminal"

const url = "exp://192.168.100.8:8081"

console.log("\n========================================================")
console.log("📱 EXPO GO QR CODE (exp://192.168.100.8:8081)")
console.log("========================================================\n")

qrcode.generate(url, { small: true }, (qr) => {
  console.log(qr)
})

console.log("\n1. Ensure your mobile device is on the same Wi-Fi (192.168.100.x)")
console.log("2. Open Expo Go app on your phone and scan the QR code above.")
console.log("========================================================\n")
