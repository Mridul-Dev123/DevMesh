export const getSocketServerUrl = () => {
    const apiBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
};
