const useSpectator = () => {
  const { currentUser } = useUserData();
  const isSpectator = computed(() => !!(currentUser.value as any)?.isSpectator || !!(currentUser.value as any)?.isSim);
  return { isSpectator };
};

export default useSpectator;
