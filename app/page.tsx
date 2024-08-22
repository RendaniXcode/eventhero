import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-4">
      <Image src="/logo.png" alt="EventHero Logo" width={150} height={150} className="mb-8" />
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Coming Soon</h1>
      <p className="text-lg md:text-2xl mb-8">Your gateway to unforgettable events is almost here.</p>
      <div className="flex flex-col md:flex-row items-center justify-center">
        <input
          type="email"
          placeholder="Enter your email to stay updated"
          className="px-4 py-2 rounded-md text-black mb-4 md:mb-0 md:mr-4"
        />
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">
          Notify Me
        </button>
      </div>
    </div>
  );
}
