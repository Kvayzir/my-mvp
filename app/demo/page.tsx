import CardWrapper from "../ui/demo/cardWrapper";

export default function Page() {
  return (
    <main className="flex flex-col md:flex-row h-screen">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Demo Page</h1>
        <CardWrapper />
      </div>
    </main>
  );
}
