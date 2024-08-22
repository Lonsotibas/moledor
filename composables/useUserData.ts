const useUserData = () => {
  const currentUser = useCookie("user");

  const setUserData = (user) => {
    if (!user) {
      currentUser.value = null;
      return;
    }
    currentUser.value = currentUser.value || user;
  };

  return {
    currentUser,
    setUserData,
  };
};

export default useUserData;
