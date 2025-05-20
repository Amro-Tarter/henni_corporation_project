import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import { Search, Filter, User, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import DashboardLayout from "../../components/dashboard/DashboardLayout";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [elementFilter, setElementFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [displayedUsers, setDisplayedUsers] = useState([]);

  const elementGradients = {
    fire: 'bg-gradient-to-r from-rose-700 via-amber-550 to-yellow-500',
    water: 'bg-gradient-to-r from-indigo-500 via-blue-400 to-teal-300',
    earth: 'bg-gradient-to-r from-lime-700 via-amber-600 to-stone-400',
    air: 'bg-gradient-to-r from-white via-sky-200 to-indigo-100',
    metal: 'bg-gradient-to-r from-zinc-300 via-slate-00 to-neutral-700',
  };

  const elementIcons = {
    fire: faFire,
    water: faWater,
    earth: faLeaf,
    air: faWind,
    metal: faHammer
  };

  const elementColors = {
    fire: 'text-red-500',
    water: 'text-blue-500',
    earth: 'text-green-500',
    air: 'text-cyan-500',
    metal: 'text-neutral-500'
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes float {
        0% { transform: translateY(0) rotate(0deg) scale(1); }
        50% { transform: translateY(-25px) rotate(8deg) scale(1.05); }
        100% { transform: translateY(0) rotate(0deg) scale(1); }
      }
      .animate-float-1 { animation: float 8s ease-in-out infinite; }
      .animate-float-2 { animation: float 9s ease-in-out 1s infinite; }
      .animate-float-3 { animation: float 10s ease-in-out 2s infinite; }
      .animate-float-4 { animation: float 11s ease-in-out 3s infinite; }
      .animate-float-5 { animation: float 12s ease-in-out 4s infinite; }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          
        );
        
        const querySnapshot = await getDocs(q);
        const usersData = [];
        
        // Get all user documents
        for (const doc of querySnapshot.docs) {
          const userData = { id: doc.id, ...doc.data() };
          
          // Get profile document for each user
          try {
            const profileQuery = query(
              collection(db, "profiles"),
              where("associated_id", "==", doc.id)
            );
            const profileSnapshot = await getDocs(profileQuery);
            
            if (!profileSnapshot.empty) {
              userData.profile = profileSnapshot.docs[0].data();
            }
            
            usersData.push(userData);
          } catch (err) {
            console.error("Error fetching profile:", err);
          }
        }
        
        setUsers(usersData);
        setDisplayedUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("אירעה שגיאה בטעינת המשתמשים");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term, element filter, and location filter
    const filtered = users.filter(user => {
      const matchesSearch = searchTerm === "" || 
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.profile?.displayName && user.profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesElement = elementFilter === "" || user.element === elementFilter;
      
      const matchesLocation = locationFilter === "" || 
        (user.location && user.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
      return matchesSearch && matchesElement && matchesLocation;
    });
    
    setDisplayedUsers(filtered);
  }, [searchTerm, elementFilter, locationFilter, users]);

  const clearFilters = () => {
    setSearchTerm("");
    setElementFilter("");
    setLocationFilter("");
  };

  return (<DashboardLayout>
   

      <div className="w-full max-w-6xl mx-auto bg-white backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-8 z-10">
       
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">קהילת משתמשי הניני</h2>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">חיפוש משתמשים</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חפש לפי שם משתמש..."
                className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סנן לפי אלמנט</label>
            <div className="relative">
              <select
                value={elementFilter}
                onChange={(e) => setElementFilter(e.target.value)}
                className={`appearance-none rounded-md w-full px-3 py-3 pr-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right ${elementGradients[elementFilter] || "bg-white"}`}
              >
                <option value="">כל האלמנטים</option>
                <option value="fire">אש</option>
                <option value="water">מים</option>
                <option value="earth">אדמה</option>
                <option value="air">אוויר</option>
                <option value="metal">מתכת</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סנן לפי מיקום</label>
            <div className="relative">
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="הזן מיקום..."
                className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={clearFilters}
              className="py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              נקה סינון
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : displayedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedUsers.map((user) => (
              <Link 
                to={`/profile/${user.id}`} 
                key={user.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`h-4 ${elementGradients[user.element] || "bg-gray-300"}`}></div>
                <div className="p-5">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <img 
                        src={user.profile?.photoURL || "/api/placeholder/100/100"} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/100/100";
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">{user.profile?.displayName || user.username}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                      <User size={14} />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <FontAwesomeIcon 
                        icon={elementIcons[user.element] || faLeaf} 
                        className={`${elementColors[user.element] || "text-gray-400"}`} 
                      />
                      <span className="text-sm capitalize">
                        {user.element === "fire" && "אש"}
                        {user.element === "water" && "מים"}
                        {user.element === "earth" && "אדמה"}
                        {user.element === "air" && "אוויר"}
                        {user.element === "metal" && "מתכת"}
                        {!user.element && "לא מוגדר"}
                      </span>
                    </div>
                    
                    {user.location && (
                      <p className="text-sm text-gray-500 mt-1">{user.location}</p>
                    )}
                    {/** i may remove this thing */}
                    {user.profile?.followersCount > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-sm text-indigo-600">
                        <Star size={14} />
                        <span>{user.profile.followersCount} עוקבים</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔎</div>
            <h3 className="text-xl font-medium text-gray-700">לא נמצאו משתמשים</h3>
            <p className="text-gray-500">נסה לשנות את פרמטרי החיפוש שלך</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Users;