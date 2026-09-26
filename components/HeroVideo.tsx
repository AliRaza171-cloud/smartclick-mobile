import { View, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

const videoSource = require("../assets/videos/hero-bg.mp4");

export default function HeroVideo() {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      <View style={styles.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 220, position: "relative", overflow: "hidden" },
  video: { width: "100%", height: "100%" },
  tint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#8A8A82",
    opacity: 0.35,
  },
});