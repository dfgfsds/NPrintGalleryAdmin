import { Link, useLocation, useNavigate } from 'react-router-dom';
import {  ArrowLeft, Store, UserCircle } from 'lucide-react';
import Logo from '../assets/image/Logo.png'

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
const userId=localStorage.getItem('userId');
  const handleSignOut = async () => {
    // await signOut();
    localStorage.clear();
    navigate('/');
  };

  if (location.pathname === '/') {
    return null;
  }
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div  className="flex items-center">
              <img  src={Logo}  className="h-14 w-full"/>
            </div>
          </div>

          <div className="flex items-center">
            {userId ? (
              <>
                {/* <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link> */}
                <button
                  onClick={handleSignOut}
                  className="ml-4 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
                <UserCircle className="h-8 w-8 text-gray-400 ml-4" />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}