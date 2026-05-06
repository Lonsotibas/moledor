interface UserData {
  _id: string;
  nombre: string;
  [key: string]: unknown;
}

const useUserData = () => {
  const currentUser = useCookie<UserData | null>("user");

  const setUserData = (user: UserData | null) => {
    currentUser.value = user;
  };

  return {
    currentUser,
    setUserData,
  };
};

export default useUserData;
