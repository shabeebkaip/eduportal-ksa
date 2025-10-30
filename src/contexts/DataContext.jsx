import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useToast } from "@/components/ui/use-toast.js";
import { supabase } from "@/lib/customSupabaseClient.js";
import { useAuth } from "@/contexts/SupabaseAuthContext.jsx";
import { useAcademicYear } from "@/contexts/AcademicYearContext.jsx";
import { useTerm } from "@/contexts/TermContext.jsx";
import { useDataManagement } from "@/hooks/useDataManagement.js";

const DataContext = createContext(null);
const SCHOOL_ADMIN_ROLES = [
  "school-admin",
  "academic-director",
  "head-of-section",
  "subject-coordinator",
];

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export function DataProvider({ children }) {
  const [schools, setSchools] = useState([]);
  const [currentSchool, setCurrentSchool] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_students: 0,
    total_teachers: 0,
    active_assessments: 0,
    average_performance: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const {
    academicYear,
    loading: yearLoading,
    refetchAvailableYears,
  } = useAcademicYear();
  const { term, loading: termLoading } = useTerm();

  const determineRoles = useCallback(
    async (user) => {
      if (!user) {
        setAvailableRoles([]);
        setActiveRole(null);
        return;
      }

      let roles = new Set();
      const userMetadataRole = user.user_metadata?.role;
      if (userMetadataRole) {
        roles.add(userMetadataRole);
      }

      if (
        userMetadataRole !== "super-admin" &&
        userMetadataRole !== "student" &&
        userMetadataRole !== "parent"
      ) {
        const { data: teacherProfile } = await supabase
          .from("teachers")
          .select("role, assignments")
          .eq("user_id", user.id)
          .maybeSingle();

        if (teacherProfile?.role && Array.isArray(teacherProfile.role)) {
          teacherProfile.role.forEach((r) => roles.add(r));
        }

        if (teacherProfile?.assignments) {
          Object.keys(teacherProfile.assignments).forEach((roleKey) => {
            if (
              Array.isArray(teacherProfile.assignments[roleKey]) &&
              teacherProfile.assignments[roleKey].length > 0
            ) {
              roles.add(roleKey);
            } else if (
              typeof teacherProfile.assignments[roleKey] === "object" &&
              teacherProfile.assignments[roleKey] !== null
            ) {
              if (
                Array.isArray(teacherProfile.assignments[roleKey].classes) &&
                teacherProfile.assignments[roleKey].classes.length > 0
              ) {
                roles.add(roleKey);
              }
              if (
                Array.isArray(teacherProfile.assignments[roleKey].majors) &&
                teacherProfile.assignments[roleKey].majors.length > 0
              ) {
                roles.add(roleKey);
              }
            }
          });
        }
      }

      const roleHierarchy = [
        "super-admin",
        "school-admin",
        "academic-director",
        "head-of-section",
        "subject-coordinator",
        "teacher",
        "student",
        "parent",
      ];
      const sortedRoles = Array.from(roles).sort(
        (a, b) => roleHierarchy.indexOf(a) - roleHierarchy.indexOf(b)
      );

      setAvailableRoles(sortedRoles);

      const savedRole = sessionStorage.getItem("activeRole");
      const currentActiveRole = user.user_metadata?.active_role;

      let newActiveRole = null;
      if (currentActiveRole && sortedRoles.includes(currentActiveRole)) {
        newActiveRole = currentActiveRole;
      } else if (savedRole && sortedRoles.includes(savedRole)) {
        newActiveRole = savedRole;
      } else if (sortedRoles.length > 0) {
        newActiveRole = sortedRoles[0];
      }

      if (newActiveRole && newActiveRole !== activeRole) {
        setActiveRole(newActiveRole);
        sessionStorage.setItem("activeRole", newActiveRole);
        if (newActiveRole !== currentActiveRole) {
          await supabase.auth.updateUser({
            data: { active_role: newActiveRole },
          });
        }
      } else if (!newActiveRole) {
        setActiveRole(null);
      }
    },
    [activeRole]
  );

  const switchActiveRole = async (newRole) => {
    if (availableRoles.includes(newRole)) {
      setActiveRole(newRole);
      sessionStorage.setItem("activeRole", newRole);

      const { error } = await supabase.auth.updateUser({
        data: { active_role: newRole },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Role Switch Failed",
          description:
            "Could not update your active session role. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    determineRoles(user);
  }, [user, determineRoles]);

  const fetchData = useCallback(async () => {
    if (authLoading || !user || !activeRole) {
      setLoading(true);
      return;
    }

    setLoading(true);

    try {
      const schoolId = user?.user_metadata?.school_id;

      if (schoolId) {
        const { data: schoolData, error: schoolError } = await supabase
          .from("schools")
          .select("*")
          .eq("id", schoolId)
          .single();
        if (schoolError) throw schoolError;
        setCurrentSchool(schoolData);
      }

      if (activeRole === "super-admin") {
        const [schoolsRes, subsRes, adminsRes] = await Promise.all([
          supabase.from("schools").select("*"),
          supabase.from("subscriptions").select("*, schools(name)"),
          supabase.from("admins").select("*, schools(name)"),
        ]);

        console.log("[DataContext] Raw schools response:", schoolsRes);
        console.log("[DataContext] Schools data:", schoolsRes.data);
        console.log("[DataContext] Schools error:", schoolsRes.error);

        if (schoolsRes.error) throw schoolsRes.error;
        if (subsRes.error) throw subsRes.error;
        if (adminsRes.error) throw adminsRes.error;

        // Fetch counts for each school
        const schoolsWithCounts = await Promise.all(
          (schoolsRes.data || []).map(async (school) => {
            const [studentsCount, teachersCount] = await Promise.all([
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("school_id", school.id),
              supabase
                .from("teachers")
                .select("id", { count: "exact", head: true })
                .eq("school_id", school.id),
            ]);

            return {
              ...school,
              students_count: studentsCount.count || 0,
              teachers_count: teachersCount.count || 0,
              status: school.status || "Active",
            };
          })
        );

        console.log(
          "[DataContext] Fetched schools with counts:",
          schoolsWithCounts
        );
        setSchools(schoolsWithCounts);
        setSubscriptions(subsRes.data);
        setAdmins(adminsRes.data);
      }

      const schoolRoles = [...SCHOOL_ADMIN_ROLES, "teacher"];
      if (schoolRoles.includes(activeRole) && schoolId) {
        const [adminsRes, teachersRes, subjectsRes] = await Promise.all([
          supabase.from("admins").select("*").eq("school_id", schoolId),
          supabase
            .from("teachers")
            .select("*, user_id")
            .eq("school_id", schoolId),
          supabase.from("subjects").select("*").eq("school_id", schoolId),
        ]);

        if (adminsRes.error) throw adminsRes.error;
        if (teachersRes.error) throw teachersRes.error;
        if (subjectsRes.error) throw subjectsRes.error;

        setAdmins(adminsRes.data);
        setTeachers(teachersRes.data);
        setSubjects(subjectsRes.data);
      }
    } catch (error) {
      console.error("[DataContext] Base data fetch error:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch critical data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, activeRole, authLoading, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchYearDependentData = useCallback(async () => {
    if (!user || !activeRole || !academicYear || !user.user_metadata.school_id)
      return;
    setLoading(true);
    try {
      const schoolId = user.user_metadata.school_id;
      const [studentsRes, statsRes] = await Promise.all([
        supabase
          .from("students")
          .select("*")
          .eq("school_id", schoolId)
          .eq("academic_year", academicYear),
        supabase.rpc("get_school_dashboard_stats", {
          p_school_id: schoolId,
          p_academic_year: academicYear,
        }),
      ]);
      if (studentsRes.error) throw studentsRes.error;
      if (statsRes.error) throw statsRes.error;
      setStudents(studentsRes.data);
      setDashboardStats(statsRes.data);
    } catch (error) {
      console.error("[DataContext] Year dependent fetch error:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch academic year data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, activeRole, academicYear, toast]);

  useEffect(() => {
    fetchYearDependentData();
  }, [fetchYearDependentData]);

  const fetchTermDependentData = useCallback(async () => {
    if (
      !user ||
      !activeRole ||
      !academicYear ||
      !term ||
      !user.user_metadata.school_id
    )
      return;
    setLoading(true);
    try {
      const schoolId = user.user_metadata.school_id;
      const { data, error } = await supabase
        .from("teacher_assignments")
        .select("*, subjects(*)")
        .eq("school_id", schoolId)
        .eq("academic_year", academicYear);
      if (error) throw error;
      setTeacherAssignments(data);
    } catch (error) {
      console.error("[DataContext] Term dependent fetch error:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch term data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, activeRole, academicYear, term, toast]);

  useEffect(() => {
    fetchTermDependentData();
  }, [fetchTermDependentData]);

  const managementActions = useDataManagement(fetchData, admins);

  const value = useMemo(
    () => ({
      schools,
      currentSchool,
      activeRole,
      availableRoles,
      switchActiveRole,
      subscriptions,
      admins,
      teachers,
      students,
      subjects,
      teacherAssignments,
      loading: loading || authLoading || yearLoading || termLoading,
      dashboardStats,
      refetchData: fetchData,
      refetchAvailableYears,
      ...managementActions,
    }),
    [
      schools,
      currentSchool,
      activeRole,
      availableRoles,
      switchActiveRole,
      subscriptions,
      admins,
      teachers,
      students,
      subjects,
      teacherAssignments,
      loading,
      authLoading,
      yearLoading,
      termLoading,
      dashboardStats,
      fetchData,
      refetchAvailableYears,
      managementActions,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
