import axios from 'axios';
import { useAuth } from '@/stores/useAuth';
const api = axios.create({
    baseURL: '/api', // dev proxied to :3000; prod same-origin
    withCredentials: true, // OK for cookie auth; harmless otherwise
});
api.interceptors.request.use((cfg) => {
    const t = useAuth.getState().token;
    if (t)
        cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});
export default api; // ← default export
// import axios from 'axios';
// export const api = axios.create({ baseURL: '/api', withCredentials: true });
