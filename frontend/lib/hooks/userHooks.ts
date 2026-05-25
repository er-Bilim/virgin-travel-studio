import {useQuery} from "@tanstack/react-query";
import {getUsers} from "@/services/user";

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};
