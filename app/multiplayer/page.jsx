import MultiplayerGame from "../../features/multiplayer/MultiplayerGame.jsx";

export const metadata = {
  title: "Online Multiplayer — 3D Chess",
  description: "Create a room and play 3D chess online with a friend anywhere.",
};

export default function MultiplayerPage() {
  return <MultiplayerGame />;
}