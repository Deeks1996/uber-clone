import Link from "next/link";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-200 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">🚫 Access Denied</h1>
      <p className="text-lg mb-6">
        You do not have permission to view this page.
      </p>
      <Link href="/" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        Go Back Home
      </Link>
    </div>
  );
};

export default Unauthorized;
