import { useQuery } from "@tanstack/react-query";

export function useDashboard(email: string) {
  return useQuery({
    queryKey: ["dashboard", email],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?email=${email}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}