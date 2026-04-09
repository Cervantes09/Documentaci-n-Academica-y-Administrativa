import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useSession } from '../context/dataSesionUsuario';

// Icons con clases responsivas
import { MdMenuOpen, MdOutlineManageAccounts, MdOutlineMoveToInbox } from "react-icons/md";
import { IoHomeOutline, IoLogoBuffer, IoSchoolSharp, IoLogOutOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { LuSchool } from "react-icons/lu";

const MenuLateral = () => {
  const [open, setOpen] = useState(true);
  const { datosUsuario, sesion, cerrarSesion } = useSession();
  const rol = datosUsuario?.tipousuario;

  const allItems = [

    // VISTAS EXCLUSIVAS

    // EXCLUSIVO DOCENTE
    { icons: <IoHomeOutline className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Inicio', path: '/', roles: ['docente'] },
    
    // EXCLUSIVO Director (Usuarios)
    { icons: <MdOutlineManageAccounts className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Usuarios y Backups', path: '/', roles: ['director'] },
    
    // Gestión Docs (Ahora Administrativo y Director)
    { icons: <MdOutlineMoveToInbox className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Administración', path: '/gestion-documentos', roles: ['administrativo', 'director'] },

    { type: 'divider', roles: ['docente', 'director', 'administrativo'] }, 

    //VISTAS GENERICAS

    // Academia (Todos)
    { icons: <LuSchool className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Academia', path: rol === 'docente' ? '/academia' : '/academia', roles: ['administrativo', 'director', 'docente'] },
    
    // Mi Expediente (Docente y Director)
    { icons: <IoLogoBuffer className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Expediente', path: '/expediente', roles: ['administrativo', 'director', 'docente'] },


    // Formatos UT (Todos)
    { icons: <IoSchoolSharp className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Formatos UT', path: '/formatos', roles: ['docente', 'administrativo', 'director'] },
    
    { type: 'divider', roles: ['docente', 'director', 'administrativo'] },
    
    // Configuración (Todos)
    { icons: <CiSettings className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Configuración', path: '/configuracion', roles: ['docente', 'director', 'administrativo'] },
  ];

  const menuItems = allItems.filter(item => item.roles?.includes(rol));

  return (
    // 🛠️ FIX: overflow-hidden general para evitar cualquier scroll accidental
    <nav className={`shadow-2xl h-screen flex flex-col duration-500 bg-emerald-950 text-white sticky top-0 z-50 overflow-hidden ${open ? 'w-64 p-2 sm:p-3' : 'w-20 p-2'}`}>

      {/* Header */}
      <div className='px-3 py-1 h-16 flex justify-between items-center flex-shrink-0'>
        <div className={`overflow-hidden transition-all duration-500 flex items-center gap-2 ${open ? 'w-32' : 'w-0'}`}>
          <img src={logo} alt="Logo" className="w-8 sm:w-10 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold leading-tight border-l border-emerald-700 pl-2 uppercase tracking-tighter whitespace-nowrap">
            UT <br/> NAYARIT
          </span>
        </div>
        <MdMenuOpen 
          className={`duration-500 cursor-pointer hover:text-emerald-400 w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 ${!open && 'rotate-180'}`} 
          onClick={() => setOpen(!open)} 
        />
      </div>

      {/* Body - Navegación */}
      {/* 🛠️ FIX: overflow-x-hidden aquí es vital para el scroll que viste */}
      <ul className='flex-1 mt-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-1'>
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <hr key={index} className="my-3 border-emerald-800/30 mx-1" />;
          }

          return (
            <NavLink 
              to={item.path}
              key={index} 
              className={({ isActive }) => `
                px-2.5 py-2 flex items-center gap-3 cursor-pointer relative group duration-300 rounded-xl
                ${isActive 
                  ? 'bg-emerald-500 text-emerald-950 font-bold shadow-lg shadow-emerald-900/20' 
                  : 'text-emerald-300 hover:bg-emerald-900/40 hover:text-white'}
              `}
            >
              <div className="min-w-[24px] flex justify-center text-current flex-shrink-0">{item.icons}</div>
              <p className={`text-xs sm:text-sm font-medium whitespace-nowrap duration-500 ${!open ? 'opacity-0 translate-x-20 w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.label}
              </p>

              {!open && (
                <div className="absolute left-full rounded-md px-3 py-2 ml-6 bg-white text-emerald-900 text-xs font-bold shadow-xl invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap border-l-4 border-emerald-500">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </ul>

      {/* Footer - Perfil y Logout */}
      {/* 🛠️ FIX: Eliminamos px dinámicos que causaban ruido visual y pusimos overflow-hidden */}
      <div className='pt-3 border-t border-emerald-900/50 mb-4 flex-shrink-0 overflow-hidden'>
        
        <div className="flex flex-col gap-3">
          
          {/* Fila del Perfil */}
          <div className={`flex items-center gap-3 px-2 duration-500 ${!open ? 'justify-center' : ''}`}>
            <div className="relative flex-shrink-0">
              <FaUserCircle className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-400/80" />
              <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-emerald-950 rounded-full"></div>
            </div>
            
            <div className={`leading-3.5 duration-500 overflow-hidden ${!open ? 'w-0 opacity-0' : 'w-32 opacity-100'}`}>
              <p className="font-bold text-[12px] sm:text-[13px] truncate text-emerald-50 tracking-tight">
                {datosUsuario?.nombre || 'Usuario'}
              </p>
              <span className='text-[9px] sm:text-[10px] text-emerald-500 block truncate font-medium'>
                {sesion?.email}
              </span>
            </div>
          </div>

          {/* Fila de Logout - Animada */}
          <div className={`px-2 duration-500 transition-all ${!open ? 'h-0 opacity-0 pointer-events-none translate-y-4' : 'h-10 opacity-100 translate-y-0'}`}>
            <button 
              onClick={cerrarSesion} // 🔥 Ahora sí la va a encontrar
              className="group flex w-full items-center justify-center gap-2.5 p-2 rounded-xl bg-emerald-900/30 text-emerald-300 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 cursor-pointer border border-transparent hover:border-rose-500/20"
              >
            <IoLogOutOutline className="w-5 h-5 flex-shrink-0" />
            <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap duration-500 ${!open ? 'w-0 opacity-0' : 'w-auto'}`}>
              Salir del Sistema
            </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuLateral;