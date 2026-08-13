"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, User, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CourseStatisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.is_staff) {
      router.push("/courses");
      return;
    }

    if (courseId) {
      fetchData();
    }
  }, [user, authLoading, router, courseId]);

  const fetchData = async () => {
    try {
      const res = await apiFetch(`/admin/statistics/courses/${courseId}/`);
      if (res.ok) {
        setData(await res.json());
      } else {
        toast.error("Ma'lumot topilmadi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div>Ma'lumot topilmadi</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          <ArrowLeft size={16} className="mr-1" /> Ortga qaytish
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{data.course.title} statistikasi</h1>
        <p className="text-gray-500 mt-2">Bu kursda o'qiyotgan barcha foydalanuvchilar va ularning natijalari.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  O'quvchi
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Holat
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Xatolar (Urinishlar)
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sertifikat
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Batafsil
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.progress_status === 'Tamomlagan' ? 'bg-green-100 text-green-800' : 
                      u.progress_status === 'Boshlamagan' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.progress_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                       <span className="text-red-600 font-bold">{u.failed_test_attempts}</span> ta xato / Jami {u.total_test_attempts} ta urinish
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.has_certificate ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <Clock className="text-gray-400 h-5 w-5" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/statistics/${courseId}/users/${u.id}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                      Ko'rish <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Ushbu kursda hozircha o'quvchilar yo'q
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
