import ChatInterface from "./chat_interface";
import NavBar from "./NavBar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NavBar></NavBar>
      <ChatInterface />
    </main>
  );
}
