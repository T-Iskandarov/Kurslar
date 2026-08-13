"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { BookOpen, Users, Activity, PlayCircle, User, Phone, ChevronRight, FileCheck, XCircle, CheckCircle2, Calendar } from "lucide-react";
import Link from "next/link";
import { format, differenceInYears } from "date-fns";
import { uz } from "date-fns/locale";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<any>(null);
  const [coursesStats, setCoursesStats] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "active_users" | "courses" | "lessons">("courses");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_staff) {
      router.push("/courses");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, coursesStatsRes] = await Promise.all([
          apiFetch("/admin/dashboard/"),
          apiFetch("/admin/users/"),
          apiFetch("/admin/statistics/courses/")
        ]);

        if (statsRes.ok && usersRes.ok && coursesStatsRes.ok) {
          setStats(await statsRes.json());
          const usersData = await usersRes.json();
          setUsersList(Array.isArray(usersData) ? usersData : (usersData.results || []));
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, tabKey }: any) => (
    <div 
      onClick={() => setActiveTab(tabKey)}
      className={`rounded-2xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
        activeTab === tabKey ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500" : "bg-white border-gray-100 hover:bg-gray-50"
      }`}
    >
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Statistika va Boshqaruv</h1>
        <p className="text-gray-500 mt-2">Tizimning umumiy holati va foydalanuvchilar statistikasi.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Umumiy o'quvchilar" 
          value={stats?.total_users || 0} 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600"
          tabKey="users"
        />
        <StatCard 
          title="Faol o'quvchilar" 
          value={stats?.total_active_users || 0} 
          icon={Activity} 
          colorClass="bg-green-100 text-green-600"
          tabKey="active_users"
        />
        <StatCard 
          title="Kurslar soni" 
          value={stats?.total_courses || 0} 
          icon={BookOpen} 
          colorClass="bg-purple-100 text-purple-600"
          tabKey="courses"
        />
        <StatCard 
          title="Darslar soni" 
          value={stats?.total_lessons || 0} 
          icon={PlayCircle} 
          colorClass="bg-orange-100 text-orange-600"
          tabKey="lessons"
        />
      </div>

      {(activeTab === "courses" || activeTab === "lessons") && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
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
                  O'qiyotganlar
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tamomlaganlar
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Batafsil
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
                {usersList
                  .filter((u: any) => activeTab === "active_users" ? u.is_active : true)
                  .map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
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
                      {u.gender || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {u.birth_date ? differenceInYears(new Date(), new Date(u.birth_date)) : "—"} yosh
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
            
            {usersList.filter((u: any) => activeTab === "active_users" ? u.is_active : true).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Ma'lumot topilmadi
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
