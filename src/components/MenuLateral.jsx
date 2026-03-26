import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; // Importante para la navegación profesional
import logo from '../assets/logo.png';

// icons
import { MdMenuOpen, MdUploadFile } from "react-icons/md";
import { IoHomeOutline, IoLogoBuffer, IoSchoolSharp } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { LuSchool } from "react-icons/lu";

const menuItems = [
  { icons: <IoHomeOutline size={28} />, label: 'Inicio', path: '/' },
  { type: 'divider' }, 
  { icons: <IoLogoBuffer size={28} />, label: 'Mi Expediente', path: '/expediente' },
  { icons: <IoSchoolSharp size={28} />, label: 'Formatos UT', path: '/formatos' },
  { icons: <LuSchool size={28} />, label: 'Academia', path: '/academia' },
  { type: 'divider' },
  { icons: <CiSettings size={28} />, label: 'Configuración', path: '/configuracion' },
]

const MenuLateral = () => {
  const [open, setOpen] = useState(true);

  return (
    // 🔥 Se agregó "z-50" aquí para que el sidebar quede por encima de los z-index de la sección principal
    <nav className={`shadow-2xl h-screen p-2 flex flex-col duration-500 bg-emerald-950 text-white sticky top-0 z-50 ${open ? 'w-64' : 'w-20'}`}>

      {/* Header */}
      <div className='px-3 py-2 h-20 flex justify-between items-center'>
        <div className={`overflow-hidden transition-all duration-500 flex items-center gap-2 ${open ? 'w-32' : 'w-0'}`}>
          <img src={logo} alt="Logo" className="w-10" />
          <span className="text-xs font-bold leading-tight border-l border-emerald-700 pl-2">UT <br/> NAYARIT</span>
        </div>
        <MdMenuOpen 
          size={34} 
          className={`duration-500 cursor-pointer hover:text-emerald-400 ${!open && 'rotate-180'}`} 
          onClick={() => setOpen(!open)} 
        />
      </div>

      {/* Body */}
      <ul className='flex-1 mt-4'>
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <hr key={index} className="my-4 border-emerald-800/50 mx-2" />;
          }

          return (
            <NavLink 
              to={item.path}
              key={index} 
              className={({ isActive }) => `
                px-3 py-2 my-2 flex items-center gap-3 cursor-pointer relative group duration-300 rounded-md
                ${isActive 
                  ? 'bg-emerald-500 text-emerald-950 font-bold shadow-lg' 
                  : 'text-emerald-300 hover:bg-emerald-900/50 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                  )}
                  
                  <div className="min-w-[28px]">{item.icons}</div>
                  
                  <p className={`whitespace-nowrap duration-500 ${!open && 'opacity-0 translate-x-28 overflow-hidden'}`}>
                    {item.label}
                  </p>

                  {/* Tooltip Pro (Solo cuando está cerrado) */}
                  {!open && (
                    <div className="absolute left-full rounded-md px-3 py-1.5 ml-6 bg-white text-emerald-900 text-sm font-bold shadow-xl invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap border-l-4 border-emerald-500">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </ul>

      {/* Footer - Perfil de Usuario */}
      <div className='flex items-center gap-3 px-3 py-4 border-t border-emerald-900/50'>
        <div className="relative flex-shrink-0">
          <FaUserCircle size={35} className="text-emerald-200" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-emerald-950 rounded-full"></div>
        </div>
        
        <div className={`leading-5 duration-500 overflow-hidden ${!open && 'w-0 opacity-0'}`}>
          <p className="font-bold text-sm truncate text-emerald-50">Gael Zamora</p>
          <span className='text-[10px] text-emerald-400 block truncate font-medium'>tic-310009@utnay.edu.mx</span>
        </div>
      </div>

    </nav>
  )
}

export default MenuLateral;