
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-finance-blue mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! We couldn't find the page you're looking for.
        </p>
        <div className="space-y-3">
          <p className="text-gray-500 mb-6">
            The page might have been moved, deleted, or never existed.
          </p>
          <Button asChild className="w-full bg-finance-teal hover:bg-teal-600">
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full mt-2">
            <Link to="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
