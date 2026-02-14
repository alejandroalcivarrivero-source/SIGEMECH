import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, BarChart2, LifeBuoy, Search, RefreshCw, AlertTriangle, CheckCircle, Clock, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import FormularioAdmisionMaestra from '../components/FormularioAdmisionMaestra';

// Mock function para simular la obtención de datos del usuario
// En una implementación real, esto vendría de un Context o Redux store
// Ahora también leeremos del localStorage si está disponible para hacerlo un poco más realista
const useAuth = () => {
    const [user, setUser] = useState({
        name: 'Usuario Demo',
        role: 'usuario',
        roles: []
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                // Mapear roles para compatibilidad
                // Si tiene rol 'Soporte TI' (ID 6), le damos acceso a soporte
                const roles = parsedUser.roles || [];
                let mainRole = 'usuario';
                
                // Mapeo simple de roles a permisos del frontend
                if (roles.some(r => r.includes('Admin'))) mainRole = 'admin';
                else if (roles.some(r => r.includes('Soporte'))) mainRole = 'soporte';
                
                setUser({
                    ...parsedUser,
                    name: parsedUser.nombres + ' ' + parsedUser.apellidos,
                    role: mainRole, // Rol principal para lógica simple
                    roles: roles     // Todos los roles para lógica compleja
                });
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Error parsing user data", e);
                setIsAuthenticated(false);
            }
        } else {
            // Si no hay token, redirigir a login (excepto en dev si se desea)
            setIsAuthenticated(false);
        }
    }, []);

    return { user, isAuthenticated };
};

const Header = ({ logoPath, onLogout, user, toggleSidebar, isSidebarOpen }) => {
    return (
        <header className="bg-blue-700 text-white p-4 flex justify-between items-center shadow-md z-10 sticky top-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="p-1 rounded-md hover:bg-blue-600 transition-colors focus:outline-none"
                    title={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <img src={logoPath} alt="SIGEMECH Logo" className="h-10 w-auto bg-white rounded-full p-1" />
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">SIGEMECH <span className="text-blue-200 font-normal">Dashboard</span></h1>
                <h1 className="text-xl font-bold tracking-tight sm:hidden">SIGEMECH</h1>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <div className="text-right hidden md:block">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-blue-200 text-xs uppercase">{user.roles.join(', ') || user.role}</p>
                </div>
                <button 
                    onClick={onLogout}
                    className="bg-blue-800 hover:bg-blue-900 p-2 rounded-full transition-colors"
                    title="Cerrar Sesión"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
};

const Sidebar = ({ userRole, activeView, setActiveView, isOpen, toggleSidebar }) => {
    const navItems = [
        { id: 'dashboard', name: 'Dashboard Principal', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'usuario'] },
        { id: 'admision-maestra', name: 'Admisión de Pacientes (001)', icon: FileText, roles: ['admin', 'usuario'] },
        { id: 'estadistica', name: 'Estadística', icon: BarChart2, roles: ['admin', 'supervisor'] },
        { id: 'soporte', name: 'Supervisión de Auditoría', icon: LifeBuoy, roles: ['soporte', 'admin'] }, // Prioridad a soporte
    ];

    // Verificar si el usuario tiene alguno de los roles permitidos
    const canView = (allowedRoles) => {
        if (userRole === 'admin') return true; // Admin ve todo por defecto
        if (allowedRoles.includes(userRole)) return true;
        return false;
    };

    return (
        <>
            {/* Overlay para cerrar al hacer click fuera (visible en móvil y desktop cuando está abierto) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20"
                    onClick={toggleSidebar}
                />
            )}
            
            <aside
                className={`
                    fixed inset-y-0 left-0 z-30
                    bg-slate-900 text-slate-300 flex-shrink-0 h-full overflow-y-auto flex flex-col
                    transition-transform duration-300 ease-in-out w-64
                    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                `}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <span className="font-bold text-white">Menú Principal</span>
                    <button onClick={toggleSidebar} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 pt-2 flex-1">
                    {isOpen && (
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2 animate-fade-in">
                            Menú Principal
                        </p>
                    )}
                    <nav>
                        <ul className="space-y-2">
                            {navItems.map((item) => (
                                canView(item.roles) && (
                                    <li key={item.id} title={!isOpen ? item.name : ''}>
                                        <button
                                            onClick={() => {
                                                setActiveView(item.id);
                                                toggleSidebar(); // Siempre cerrar al seleccionar
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                                ${activeView === item.id
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                                    : 'hover:bg-slate-800 hover:text-white'
                                                }
                                            `}
                                        >
                                            <item.icon className={`h-5 w-5 flex-shrink-0 ${activeView === item.id ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="block whitespace-nowrap overflow-hidden">
                                                {item.name}
                                            </span>
                                        </button>
                                    </li>
                                )
                            ))}
                        </ul>
                    </nav>
                </div>
                
                <div className={`p-4 border-t border-slate-800 ${!isOpen ? 'md:items-center md:flex md:justify-center' : ''}`}>
                    {isOpen ? (
                        <p className="text-xs text-center text-slate-600 whitespace-nowrap">© 2026 SIGEMECH v1.0</p>
                    ) : (
                        <span className="text-xs text-slate-600 font-bold">v1.0</span>
                    )}
                </div>
            </aside>
        </>
    );
};

// Componente para la vista de Soporte TI (Auditoría)
const SoporteView = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ logs_hoy: 0, usuarios_activos: 0, admisiones_hoy: 0, triajes_hoy: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', usuario_id: '' });

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
            
            // Construir query string limpiando valores vacíos
            const params = new URLSearchParams();
            if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
            if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
            if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id);
            
            // Fetch Logs
            const resLogs = await fetch(`http://localhost:3002/api/soporte/logs?${params.toString()}`, { headers });
            
            if (!resLogs.ok) {
                if (resLogs.status === 403) throw new Error('Acceso denegado: Se requiere rol de Soporte TI.');
                throw new Error('Error al cargar logs del servidor.');
            }
            
            const dataLogs = await resLogs.json();
            // El backend devuelve directamente un array, no un objeto { logs: [] }
            setLogs(Array.isArray(dataLogs) ? dataLogs : []);

            // Fetch Stats
            const resStats = await fetch('http://localhost:3002/api/soporte/stats', { headers });
            if (resStats.ok) {
                 const dataStats = await resStats.json();
                 setStats(dataStats);
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'No se pudieron cargar los datos de auditoría.');
             // Mock data para demostración si falla backend
             if (process.env.NODE_ENV === 'development' && !err.message.includes('Acceso denegado')) {
                setLogs([
                    { id: 1, fecha: new Date().toISOString(), accion: 'Error de conexión simulado', nombres: 'Sistema', apellidos: 'Test', ip_origen: '127.0.0.1' }
                ]);
             }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []); // Cargar al inicio

    const handleFilterChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Supervisión de Auditoría</h2>
                    <p className="text-slate-500">Monitoreo de logs del sistema y actividad de usuarios.</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                        <RefreshCw className="h-4 w-4" /> Actualizar
                    </button>
                </div>
            </div>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Logs Generados Hoy</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.logs_hoy || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <FileText className="h-6 w-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Admisiones (Audit)</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.admisiones_hoy || 0}</p>
                    </div>
                     <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Triajes (Audit)</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.triajes_hoy || 0}</p>
                    </div>
                     <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Fecha Inicio</label>
                        <input 
                            type="date" 
                            name="fecha_inicio"
                            value={filtros.fecha_inicio}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Fecha Fin</label>
                        <input 
                            type="date" 
                            name="fecha_fin"
                            value={filtros.fecha_fin}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                     <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-700 mb-1">ID Usuario (Opcional)</label>
                        <input 
                            type="text" 
                            name="usuario_id"
                            placeholder="Ej: 15"
                            value={filtros.usuario_id}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors h-10 flex items-center gap-2">
                        <Search className="h-4 w-4" /> Filtrar
                    </button>
                </form>
            </div>

            {/* Tabla de Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">ID Log</th>
                                <th className="px-6 py-4 font-bold">Fecha / Hora</th>
                                <th className="px-6 py-4 font-bold">Usuario</th>
                                <th className="px-6 py-4 font-bold">Acción</th>
                                <th className="px-6 py-4 font-bold">IP Origen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Cargando registros...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-red-500">{error}</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No se encontraron registros de auditoría.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">#{log.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                {new Date(log.fecha).toLocaleString('es-EC')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{log.nombres} {log.apellidos}</div>
                                            <div className="text-xs text-slate-400">{log.cedula}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-md truncate" title={log.accion}>
                                            {log.accion}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.ip}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                 {!loading && logs.length > 0 && (
                    <div className="p-4 border-t border-slate-100 text-center">
                         <button className="text-blue-600 text-sm font-medium hover:underline">Cargar más registros</button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    
    const logoPath = '/SIGEMECH_LOGO.png';

    // Ajustar sidebar inicial - Queremos que empiece cerrada siempre o controlada por el usuario
    // Eliminamos el efecto que la abre automáticamente en desktop

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        // Limpiar token y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Si no hay usuario autenticado (aunque aquí usamos mock, en real se valida token)
    if (!isAuthenticated) {
        // Esto normalmente no se renderiza si hay rutas protegidas, pero por seguridad:
        return <div className="p-10 text-center">Verificando sesión...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <Header
                logoPath={logoPath}
                onLogout={handleLogout}
                user={user}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
            />
            
            {/* Contenido principal: Sidebar + Main Content */}
            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar
                    userRole={user.role}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
                
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 transition-all duration-300 w-full">
                    <div className="max-w-7xl mx-auto">
                        {activeView === 'dashboard' && (
                            <div className="animate-fade-in">
                                <h2 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido de nuevo, {user.name.split(' ')[0]}</h2>
                                <p className="text-slate-500 mb-8">Resumen de actividad del centro de salud.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-slate-600">Pacientes Hoy</h3>
                                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserIcon /></span>
                                        </div>
                                        <p className="text-4xl font-bold text-slate-800">124</p>
                                        <p className="text-sm text-green-600 flex items-center mt-2">↑ 12% vs ayer</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-slate-600">Emergencias</h3>
                                            <span className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertIcon /></span>
                                        </div>
                                        <p className="text-4xl font-bold text-slate-800">8</p>
                                        <p className="text-sm text-slate-400 mt-2">2 Críticas</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-slate-600">Médicos Activos</h3>
                                            <span className="p-2 bg-green-100 text-green-600 rounded-lg"><ActivityIcon /></span>
                                        </div>
                                        <p className="text-4xl font-bold text-slate-800">12</p>
                                        <p className="text-sm text-slate-400 mt-2">Turno matutino</p>
                                    </div>
                                </div>
                                
                                <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
                                    </div>
                                    <div className="p-6">
                                        <ul className="space-y-4">
                                            {[1, 2, 3].map((i) => (
                                                <li key={i} className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">JP</div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">Juan Pérez registrado en Admisión</p>
                                                        <p className="text-xs text-slate-500">Hace 15 minutos • Por Dra. Ana Lopez</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeView === 'admision-maestra' && (
                            <div className="animate-fade-in">
                                 <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">Admisión Maestra de Pacientes</h2>
                                    <p className="text-slate-500">Registro completo de filiación según Formulario 001 MSP.</p>
                                 </div>
                                 <FormularioAdmisionMaestra />
                            </div>
                        )}

                        {activeView === 'estadistica' && (
                            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                                 <BarChart2 className="h-16 w-16 mb-4 opacity-20" />
                                 <h2 className="text-xl font-semibold">Módulo de Estadísticas</h2>
                                 <p>En construcción...</p>
                            </div>
                        )}

                        {activeView === 'soporte' && (
                            <SoporteView />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Iconos simples para el dashboard (placeholders si no se quiere importar más de lucide)
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);
