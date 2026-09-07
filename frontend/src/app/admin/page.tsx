"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { format, differenceInYears } from "date-fns";
import { uz } from "date-fns/locale";
import Link from "next/link";
import { Users, BookOpen, PlayCircle, Activity, ChevronRight, User, Phone, Calendar, FileCheck } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [coursesStats, setCoursesStats] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "active_users" | "courses" | "lessons">("users");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_staff) {
      router.push("/courses");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsRes, coursesStatsRes] = await Promise.all([
          apiFetch("/admin/dashboard/"),
          apiFetch("/admin/statistics/courses/")
        ]);

        if (statsRes.ok && coursesStatsRes.ok) {
          setStats(await statsRes.json());
          const coursesData = await coursesStatsRes.json();
          setCoursesStats(Array.isArray(coursesData) ? coursesData : (coursesData.results || []));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [user, authLoading, router]);

  // Fetch users whenever page or activeTab changes
  useEffect(() => {
    if (authLoading || !user || !user.is_staff) return;
    
    const fetchUsers = async () => {
      try {
        let url = `/admin/users/?page=${usersPage}`;
        if (activeTab === "active_users") {
          url += "&is_active=true";
        }
        
        const res = await apiFetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUsersList(data);
            setUsersTotalPages(1);
          } else {
            setUsersList(data.results || []);
            setUsersTotalPages(Math.ceil((data.count || 1) / 20));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    // Only fetch users if activeTab is one of the user tabs
    if (activeTab === "users" || activeTab === "active_users") {
      fetchUsers();
    }
  }, [usersPage, activeTab, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Statistika va Boshqaruv</h1>
        <p className="mt-2 text-gray-500">Tizimning umumiy holati va foydalanuvchilar statistikasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Umumiy o'quvchilar */}
        <div 
          onClick={() => { setActiveTab("users"); setUsersPage(1); }}
          className={`bg-white rounded-2xl p-6 border ${activeTab === 'users' ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'} shadow-sm cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Umumiy o'quvchilar</p>
              <div className="text-3xl font-bold mt-2 text-gray-900">
                {stats ? stats.total_users : 0}
              </div>
            </div>
          </div>
        </div>

        {/* Faol o'quvchilar */}
        <div 
          onClick={() => { setActiveTab("active_users"); setUsersPage(1); }}
          className={`bg-white rounded-2xl p-6 border ${activeTab === 'active_users' ? 'border-green-500 ring-4 ring-green-50' : 'border-gray-100'} shadow-sm cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Faol o'quvchilar</p>
              <div className="text-3xl font-bold mt-2 text-gray-900">
                {stats ? stats.active_users : 0}
              </div>
            </div>
          </div>
        </div>

        {/* Kurslar soni */}
        <div 
          onClick={() => setActiveTab("courses")}
          className={`bg-white rounded-2xl p-6 border ${activeTab === 'courses' ? 'border-purple-500 ring-4 ring-purple-50' : 'border-gray-100'} shadow-sm cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-xl">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Kurslar soni</p>
              <div className="text-3xl font-bold mt-2 text-gray-900">
                {stats ? stats.total_courses : 0}
              </div>
            </div>
          </div>
        </div>

        {/* Darslar soni */}
        <div 
          onClick={() => setActiveTab("lessons")}
          className={`bg-white rounded-2xl p-6 border ${activeTab === 'lessons' ? 'border-orange-500 ring-4 ring-orange-50' : 'border-gray-100'} shadow-sm cursor-pointer hover:shadow-md transition-all`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-xl">
              <PlayCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Darslar soni</p>
              <div className="text-3xl font-bold mt-2 text-gray-900">
                {stats ? stats.total_lessons : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "courses" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Kurslar bo'yicha statistika</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kurs
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  O'quvchilar
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sertifikatlar
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">Harakatlar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {coursesStats.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{c.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{c.students_enrolled} ta o'quvchi</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                        <FileCheck className="text-green-600 h-4 w-4"/> {c.students_completed} ta sertifikat
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/statistics/${c.id}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                      Ko'rish <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {coursesStats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Kurslar topilmadi
            </div>
          )}
        </div>
      </div>
      )}

      {(activeTab === "users" || activeTab === "active_users") && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === "users" ? "Barcha o'quvchilar ro'yxati" : "Faol o'quvchilar ro'yxati"}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    T/R
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    O'quvchi
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Jinsi
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Yosh
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kurslardagi holati
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    A'zo bo'lgan sana
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {usersList.map((u: any, index: number) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(usersPage - 1) * 20 + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          <User size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.full_name}</div>
                          <div className="text-sm text-gray-500">{u.is_staff ? "Admin" : "Talaba"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone size={14} className="mr-2 text-gray-400" />
                        {u.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {u.gender || "?"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {u.birth_date ? differenceInYears(new Date(), new Date(u.birth_date)) : "?"} yosh
                    </td>
                    <td className="px-6 py-4">
                      {u.courses_progress && u.courses_progress.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {u.courses_progress.map((prog: string, idx: number) => {
                            const isCompleted = prog.includes("Tamomlagan");
                            return (
                              <span key={idx} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {prog}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Hech qanday kursda emas</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {format(new Date(u.date_joined), "d MMM, yyyy", { locale: uz })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {usersList.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Ma'lumot topilmadi
              </div>
            )}
            
            {usersList.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Jami {usersTotalPages} ta sahifadan {usersPage}-sahifa
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                    className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Oldingi
                  </button>
                  <button 
                    onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                    disabled={usersPage === usersTotalPages}
                    className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
      
    </div>
  );
}
