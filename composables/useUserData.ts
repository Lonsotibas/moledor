
const useUserData = () => {
    const currentUser = useState('user', () => {})

    const setUserData = (user) => {
        currentUser.value = user
    }

    return {
        currentUser,
        setUserData
    }
}

export default useUserData
