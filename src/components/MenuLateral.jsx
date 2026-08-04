import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useSession } from '../context/dataSesionUsuario';
import { useTranslation } from 'react-i18next';

// Icons con clases responsivas
import { MdMenuOpen, MdOutlineManageAccounts, MdOutlineMoveToInbox, MdClose, MdMenu } from "react-icons/md";
import { IoHomeOutline, IoLogoBuffer, IoSchoolSharp, IoLogOutOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { LuSchool } from "react-icons/lu";

const MenuLateral = () => {
  const [open, setOpen] = useState(true); // Estado para desktop (expandir/contraer)
  const [mobileOpen, setMobileOpen] = useState(false); // Estado para móvil (abrir/cerrar menú hamburguesa)
  
  const { datosUsuario, sesion, cerrarSesion } = useSession();
  const rol = datosUsuario?.tipousuario;
  
  const { t, i18n } = useTranslation();

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevoIdioma);
  };

  const allItems = [
    // VISTAS EXCLUSIVAS
    { icons: <IoHomeOutline className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('menu.inicio'), path: '/', roles: ['docente'] },
    { icons: <MdOutlineManageAccounts className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('menu.usuarios'), path: '/', roles: ['director'] },
    { icons: <MdOutlineMoveToInbox className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('menu.administracion'), path: '/gestion-documentos', roles: ['administrativo', 'director'] },

    { type: 'divider', roles: ['docente', 'director', 'administrativo'] }, 

    // VISTAS GENÉRICAS
    { icons: <LuSchool className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('menu.academia'), path: rol === 'docente' ? '/academia' : '/academia', roles: ['administrativo', 'director', 'docente'] },
    { icons: <IoLogoBuffer className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('menu.expediente'), path: '/expediente', roles: ['administrativo', 'director', 'docente'] },
    { icons: <IoSchoolSharp className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('menu.formatos'), path: '/formatos', roles: ['docente', 'administrativo', 'director'] },
    
    { type: 'divider', roles: ['docente', 'director', 'administrativo'] },
    
    { icons: <CiSettings className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('menu.configuracion'), path: '/configuracion', roles: ['docente', 'director', 'administrativo'] },
  ];

  const menuItems = allItems.filter(item => item.roles?.includes(rol));

  return (
    <>
      {/* ========================================================= */}
      {/* VISTA MÓVIL (Top Navbar con menú hamburguesa)             */}
      {/* ========================================================= */}
      <nav className="md:hidden w-full bg-emerald-950 text-white sticky top-0 z-50 shadow-xl">
        {/* Barra Superior */}
        <div className="flex justify-between items-center px-4 h-16 relative z-50 bg-emerald-950">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 flex-shrink-0" />
            <span className="text-xs font-bold leading-tight border-l border-emerald-700 pl-2 uppercase tracking-tighter">
              UT <br/> NAYARIT
            </span>
          </div>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="text-emerald-300 hover:text-white p-2 focus:outline-none"
          >
            {mobileOpen ? <MdClose className="w-7 h-7" /> : <MdMenu className="w-7 h-7" />}
          </button>
        </div>

        {/* Menú Desplegable (Dropdown) */}
        <div 
          className={`absolute left-0 w-full bg-emerald-950 border-b border-emerald-900/50 shadow-2xl transition-all duration-300 ease-in-out flex flex-col overflow-y-auto max-h-[calc(100vh-4rem)]
          ${mobileOpen ? 'opacity-100 translate-y-0 visible pb-6' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}`}
          style={{ top: '64px' }} // Altura exacta del header (h-16 = 64px)
        >
          <ul className="flex flex-col px-4 pt-2 space-y-1">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <hr key={index} className="my-3 border-emerald-800/30 mx-2" />;
              }

              return (
                <NavLink 
                  to={item.path}
                  key={index}
                  onClick={() => setMobileOpen(false)} // Cierra el menú al hacer clic
                  className={({ isActive }) => `
                    px-4 py-3 flex items-center gap-4 cursor-pointer duration-300 rounded-xl
                    ${isActive 
                      ? 'bg-emerald-500 text-emerald-950 font-bold shadow-lg shadow-emerald-900/20' 
                      : 'text-emerald-300 hover:bg-emerald-900/40 hover:text-white'}
                  `}
                >
                  <div className="flex-shrink-0">{item.icons}</div>
                  <p className="text-sm font-medium">{item.label}</p>
                </NavLink>
              );
            })}
          </ul>

          {/* Footer Móvil - Perfil y Botones */}
          <div className="mt-4 px-6 pt-4 border-t border-emerald-900/50 space-y-4">
            <div className="flex items-center gap-3">
              <FaUserCircle className="w-10 h-10 text-emerald-400/80 flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate text-emerald-50">{datosUsuario?.nombre || 'Usuario'}</p>
                <span className="text-[11px] text-emerald-500 block truncate font-medium">{sesion?.email}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={cambiarIdioma}
                className="flex items-center justify-center py-2.5 rounded-xl bg-emerald-900/30 text-emerald-300 hover:bg-blue-500/20 hover:text-blue-300 transition-colors border border-transparent text-[11px] font-bold uppercase"
              >
                {i18n.language === 'es' ? 'To English' : 'Al Español'}
              </button>
              
              <button 
                onClick={() => { cerrarSesion(); setMobileOpen(false); }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-900/30 text-emerald-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border border-transparent text-[11px] font-bold uppercase"
              >
                <IoLogOutOutline className="w-4 h-4" />
                {t('menu.salir')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* VISTA ESCRITORIO (Menú Lateral Original)                  */}
      {/* ========================================================= */}
      <nav className={`hidden md:flex flex-col h-screen duration-500 bg-emerald-950 text-white sticky top-0 z-50 shadow-2xl overflow-hidden ${open ? 'w-64 p-3' : 'w-20 p-2'}`}>
        
        {/* Header Desktop */}
        <div className='px-3 py-1 h-16 flex justify-between items-center flex-shrink-0'>
          <div className={`overflow-hidden transition-all duration-500 flex items-center gap-2 ${open ? 'w-32' : 'w-0'}`}>
            <img src={logo} alt="Logo" className="w-10 flex-shrink-0" />
            <span className="text-xs font-bold leading-tight border-l border-emerald-700 pl-2 uppercase tracking-tighter whitespace-nowrap">
              UT <br/> NAYARIT
            </span>
          </div>
          <MdMenuOpen 
            className={`duration-500 cursor-pointer hover:text-emerald-400 w-8 h-8 flex-shrink-0 ${!open && 'rotate-180'}`} 
            onClick={() => setOpen(!open)} 
          />
        </div>

        {/* Body Desktop - Navegación */}
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
                <p className={`text-sm font-medium whitespace-nowrap duration-500 ${!open ? 'opacity-0 translate-x-20 w-0 overflow-hidden' : 'opacity-100'}`}>
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

        {/* Footer Desktop - Perfil y Logout */}
        <div className='pt-3 border-t border-emerald-900/50 mb-4 flex-shrink-0 overflow-hidden'>
          <div className="flex flex-col gap-3">
            
            <div className={`flex items-center gap-3 px-2 duration-500 ${!open ? 'justify-center' : ''}`}>
              <div className="relative flex-shrink-0">
                <FaUserCircle className="w-9 h-9 text-emerald-400/80" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-emerald-950 rounded-full"></div>
              </div>
              
              <div className={`leading-3.5 duration-500 overflow-hidden ${!open ? 'w-0 opacity-0' : 'w-32 opacity-100'}`}>
                <p className="font-bold text-[13px] truncate text-emerald-50 tracking-tight">
                  {datosUsuario?.nombre || 'Usuario'}
                </p>
                <span className='text-[10px] text-emerald-500 block truncate font-medium'>
                  {sesion?.email}
                </span>
              </div>
            </div>

            <div className={`px-2 duration-500 transition-all ${!open ? 'h-0 opacity-0 pointer-events-none translate-y-4' : 'h-10 opacity-100 translate-y-0'}`}>
              <button 
                onClick={cambiarIdioma}
                className="group flex w-full items-center justify-center gap-2.5 p-2 rounded-xl bg-emerald-900/30 text-emerald-300 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-500/30"
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap duration-500 ${!open ? 'w-0 opacity-0' : 'w-auto'}`}>
                  {i18n.language === 'es' ? 'Cambiar a Ingles' : 'Switch to Spanish'}
                </span>
              </button>
            </div>

            <div className={`px-2 duration-500 transition-all ${!open ? 'h-0 opacity-0 pointer-events-none translate-y-4' : 'h-10 opacity-100 translate-y-0'}`}>
              <button 
                onClick={cerrarSesion}
                className="group flex w-full items-center justify-center gap-2.5 p-2 rounded-xl bg-emerald-900/30 text-emerald-300 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 cursor-pointer border border-transparent hover:border-rose-500/20"
              >
                <IoLogOutOutline className="w-5 h-5 flex-shrink-0" />
                <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap duration-500 ${!open ? 'w-0 opacity-0' : 'w-auto'}`}>
                  {t('menu.salir')}
                </span>
              </button>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default MenuLateral;