const useUserData = () => {
  const currentUser = useCookie("user");

  const setUserData = (user) => {
    currentUser.value = currentUser.value || user;
  };

  return {
    currentUser,
    setUserData,
  };
};

export default useUserData;
