import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    }).setView([14.5943, 121.1866], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin@123') {
      setError('');
      navigate('/admin');
      return;
    }

    if (username === 'assigner@redplanet.com' && password === 'assigner@123') {
      setError('');
      navigate('/assigner');
      return;
    }

    if (username === 'user@redplanet.com' && password === 'user@123') {
      setError('');
      navigate('/user');
      return;
    }

    setError('Invalid username or password');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans bg-[#eef2f4]">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 z-10 bg-white/72 backdrop-blur-[2px]" />

      <div className="relative z-20 flex h-full w-full items-center justify-center px-3 sm:px-4">
        {/* Reduced max-w from 320px→288px (mobile) and md→~360px (desktop), shifted up slightly */}
        <div className={`flex w-full flex-col items-center ${isMobile ? 'max-w-[288px]' : 'max-w-[360px] -translate-y-[8%]'}`}>

          {/* Logo section — always rendered, uses onError fallback text */}
          <div className={`${isMobile ? 'mb-2.5' : 'mb-4'} flex flex-col items-center`}>
            <img
              src="https://redplanetgrp.com/wp-content/uploads/2025/04/Redplanet-Solutions.webp"
              alt="Redplanet Solutions"
              className={`${isMobile ? 'h-9 mb-1' : 'h-[86px] mb-1'} w-auto object-contain`}
              /* Fallback: if image fails, show a styled text logo */
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.textContent = 'Redplanet Solutions';
                fallback.style.cssText =
                  'font-size:20px;font-weight:700;color:#c0392b;letter-spacing:-0.5px;margin-bottom:4px;';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            <p className={`${isMobile ? 'text-[11px]' : 'text-[13.5px]'} text-[#555]`}>
              Sign in to your account
            </p>
          </div>

          {/* Sign-in card — ~10% smaller padding/radii/heights vs original */}
          <div
            className={`w-full border border-white/60 bg-white/86 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl ${
              isMobile ? 'rounded-[20px] p-3.5' : 'rounded-[27px] p-[25px]'
            }`}
          >
            <form onSubmit={handleSubmit} className={isMobile ? 'space-y-2.5' : 'space-y-[18px]'}>
              <div>
                <label className={`block font-medium text-[#374151] ${isMobile ? 'mb-1 text-[10px]' : 'mb-1.5 text-[12px]'}`}>
                  Username or email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-[18px] border border-gray-200 px-3.5 text-[13px] outline-none focus:border-[#3F9AAE] ${
                    isMobile ? 'h-8' : 'h-[40px] sm:h-[43px]'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium text-[#374151] ${isMobile ? 'mb-1 text-[10px]' : 'mb-1.5 text-[12px]'}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-[18px] border border-gray-200 px-3.5 pr-11 text-[13px] outline-none focus:border-[#3F9AAE] ${
                      isMobile ? 'h-8' : 'h-[40px] sm:h-[43px]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 ${isMobile ? 'text-[11px]' : 'text-[14px]'}`}
                  >
                    {showPassword ? '✕' : '👁'}
                  </button>
                </div>
              </div>

              {error && <div className="text-[12px] text-red-600">{error}</div>}

              <button
                type="submit"
                className={`w-full rounded-[18px] bg-[#111] font-semibold text-white transition-all hover:bg-[#222] ${
                  isMobile ? 'h-9 text-[13px]' : 'h-[40px] sm:h-[43px] text-[13.5px]'
                }`}
              >
                Sign In
              </button>
            </form>

            <div className={`${isMobile ? 'mt-3.5 text-[10px]' : 'mt-5 text-[12px]'} text-center text-gray-600`}>
              Admin: <b>admin</b> / <b>admin@123</b>
              <br />
              Assigner: <b>assigner@redplanet.com</b> / <b>assigner@123</b>
              <br />
              User: <b>user@redplanet.com</b> / <b>user@123</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const mapRef = useRef<HTMLDivElement | null>(null);
//   const mapInstance = useRef<L.Map | null>(null);

//   const [username, setUsername] = useState('admin');
//   const [password, setPassword] = useState('admin@123');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 640);
//     check();
//     window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   useEffect(() => {
//     if (!mapRef.current || mapInstance.current) return;

//     const map = L.map(mapRef.current, {
//       zoomControl: false,
//       attributionControl: false,
//       dragging: false,
//       scrollWheelZoom: false,
//       doubleClickZoom: false,
//       boxZoom: false,
//       keyboard: false,
//       touchZoom: false,
//     }).setView([14.5943, 121.1866], 13);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       maxZoom: 19,
//     }).addTo(map);

//     mapInstance.current = map;

//     return () => {
//       map.remove();
//       mapInstance.current = null;
//     };
//   }, []);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (username === 'admin' && password === 'admin@123') {
//       setError('');
//       navigate('/admin');
//       return;
//     }

//     if (username === 'assigner@redplanet.com' && password === 'assigner@123') {
//       setError('');
//       navigate('/assigner');
//       return;
//     }

//     if (username === 'user@redplanet.com' && password === 'user@123') {
//       setError('');
//       navigate('/user');
//       return;
//     }

//     setError('Invalid username or password');
//   };

//   return (
//     <div className="relative h-screen w-screen overflow-hidden font-sans bg-[#eef2f4]">
//       <div ref={mapRef} className="absolute inset-0 z-0" />
//       <div className="absolute inset-0 z-10 bg-white/72 backdrop-blur-[2px]" />

//       <div className="relative z-20 flex h-full w-full items-center justify-center px-3 sm:px-4">
//         {/* Reduced max-w from 320px→288px (mobile) and md→~360px (desktop), shifted up slightly */}
//         <div className={`flex w-full flex-col items-center ${isMobile ? 'max-w-[288px]' : 'max-w-[360px] -translate-y-[18%]'}`}>

//           {/* Logo section — always rendered, uses onError fallback text */}
//           <div className={`${isMobile ? 'mb-2.5' : 'mb-4'} flex flex-col items-center`}>
//             <img
//               src="https://redplanetgrp.com/wp-content/uploads/2025/04/Redplanet-Solutions.webp"
//               alt="Redplanet Solutions"
//               className={`${isMobile ? 'h-9 mb-1' : 'h-[86px] mb-1'} w-auto object-contain`}
//               /* Fallback: if image fails, show a styled text logo */
//               onError={(e) => {
//                 const target = e.currentTarget;
//                 target.style.display = 'none';
//                 const fallback = document.createElement('div');
//                 fallback.textContent = 'Redplanet Solutions';
//                 fallback.style.cssText =
//                   'font-size:20px;font-weight:700;color:#c0392b;letter-spacing:-0.5px;margin-bottom:4px;';
//                 target.parentNode?.insertBefore(fallback, target);
//               }}
//             />
//             <p className={`${isMobile ? 'text-[11px]' : 'text-[13.5px]'} text-[#555]`}>
//               Sign in to your account
//             </p>
//           </div>

//           {/* Sign-in card — ~10% smaller padding/radii/heights vs original */}
//           <div
//             className={`w-full border border-white/60 bg-white/86 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl ${
//               isMobile ? 'rounded-[20px] p-3.5' : 'rounded-[27px] p-[25px]'
//             }`}
//           >
//             <form onSubmit={handleSubmit} className={isMobile ? 'space-y-2.5' : 'space-y-[18px]'}>
//               <div>
//                 <label className={`block font-medium text-[#374151] ${isMobile ? 'mb-1 text-[10px]' : 'mb-1.5 text-[12px]'}`}>
//                   Username or email
//                 </label>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className={`w-full rounded-[18px] border border-gray-200 px-3.5 text-[13px] outline-none focus:border-[#3F9AAE] ${
//                     isMobile ? 'h-8' : 'h-[40px] sm:h-[43px]'
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block font-medium text-[#374151] ${isMobile ? 'mb-1 text-[10px]' : 'mb-1.5 text-[12px]'}`}>
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className={`w-full rounded-[18px] border border-gray-200 px-3.5 pr-11 text-[13px] outline-none focus:border-[#3F9AAE] ${
//                       isMobile ? 'h-8' : 'h-[40px] sm:h-[43px]'
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((p) => !p)}
//                     className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 ${isMobile ? 'text-[11px]' : 'text-[14px]'}`}
//                   >
//                     {showPassword ? '✕' : '👁'}
//                   </button>
//                 </div>
//               </div>

//               {error && <div className="text-[12px] text-red-600">{error}</div>}

//               <button
//                 type="submit"
//                 className={`w-full rounded-[18px] bg-[#111] font-semibold text-white transition-all hover:bg-[#222] ${
//                   isMobile ? 'h-9 text-[13px]' : 'h-[40px] sm:h-[43px] text-[13.5px]'
//                 }`}
//               >
//                 Sign In
//               </button>
//             </form>

//             <div className={`${isMobile ? 'mt-3.5 text-[10px]' : 'mt-5 text-[12px]'} text-center text-gray-600`}>
//               Admin: <b>admin</b> / <b>admin@123</b>
//               <br />
//               Assigner: <b>assigner@redplanet.com</b> / <b>assigner@123</b>
//               <br />
//               User: <b>user@redplanet.com</b> / <b>user@123</b>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const mapRef = useRef<HTMLDivElement | null>(null);
//   const mapInstance = useRef<L.Map | null>(null);

//   const [username, setUsername] = useState('admin');
//   const [password, setPassword] = useState('admin@123');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 640);
//     check();
//     window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   useEffect(() => {
//     if (!mapRef.current || mapInstance.current) return;

//     const map = L.map(mapRef.current, {
//       zoomControl: false,
//       attributionControl: false,
//       dragging: false,
//       scrollWheelZoom: false,
//       doubleClickZoom: false,
//       boxZoom: false,
//       keyboard: false,
//       touchZoom: false,
//     }).setView([14.5943, 121.1866], 13);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       maxZoom: 19,
//     }).addTo(map);

//     mapInstance.current = map;

//     return () => {
//       map.remove();
//       mapInstance.current = null;
//     };
//   }, []);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (username === 'admin' && password === 'admin@123') {
//       setError('');
//       navigate('/admin');
//       return;
//     }

//     if (username === 'assigner@redplanet.com' && password === 'assigner@123') {
//       setError('');
//       navigate('/assigner');
//       return;
//     }

//     if (username === 'user@redplanet.com' && password === 'user@123') {
//       setError('');
//       navigate('/user');
//       return;
//     }

//     setError('Invalid username or password');
//   };

//   return (
//     <div className="relative h-screen w-screen overflow-hidden font-sans bg-[#eef2f4]">
//       <div ref={mapRef} className="absolute inset-0 z-0" />
//       <div className="absolute inset-0 z-10 bg-white/72 backdrop-blur-[2px]" />

//       <div className="relative z-20 flex h-full w-full items-center justify-center px-3 sm:px-4">
//         <div className={`flex w-full flex-col items-center ${isMobile ? 'max-w-[320px]' : 'max-w-md -translate-y-[18%]'}`}>
//           <div className={`${isMobile ? 'mb-3' : 'mb-5'} flex flex-col items-center`}>
//             <img
//               src="https://redplanetgrp.com/wp-content/uploads/2025/04/Redplanet-Solutions.webp"
//               alt="Logo"
//               className={`${isMobile ? 'h-10 mb-1' : 'h-24 mb-1'} w-auto object-contain`}
//             />
//             <p className={`${isMobile ? 'text-[12px]' : 'text-[15px]'} text-[#555]`}>
//               Sign in to your account
//             </p>
//           </div>

//           <div
//             className={`w-full border border-white/60 bg-white/86 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl ${
//               isMobile ? 'rounded-[22px] p-4' : 'rounded-[30px] p-7'
//             }`}
//           >
//             <form onSubmit={handleSubmit} className={isMobile ? 'space-y-3' : 'space-y-5'}>
//               <div>
//                 <label className={`block font-medium text-[#374151] ${isMobile ? 'mb-1.5 text-[11px]' : 'mb-2 text-[13px]'}`}>
//                   Username or email
//                 </label>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className={`w-full rounded-2xl border border-gray-200 px-4 text-[14px] outline-none focus:border-[#3F9AAE] ${
//                     isMobile ? 'h-9' : 'h-11 sm:h-12'
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block font-medium text-[#374151] ${isMobile ? 'mb-1.5 text-[11px]' : 'mb-2 text-[13px]'}`}>
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className={`w-full rounded-2xl border border-gray-200 px-4 pr-12 text-[14px] outline-none focus:border-[#3F9AAE] ${
//                       isMobile ? 'h-9' : 'h-11 sm:h-12'
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((p) => !p)}
//                     className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 ${isMobile ? 'text-[12px]' : 'text-base'}`}
//                   >
//                     {showPassword ? '✕' : '👁'}
//                   </button>
//                 </div>
//               </div>

//               {error && <div className="text-sm text-red-600">{error}</div>}

//               <button
//                 type="submit"
//                 className={`w-full rounded-2xl bg-[#111] font-semibold text-white transition-all hover:bg-[#222] ${
//                   isMobile ? 'h-10 text-[14px]' : 'h-11 sm:h-12 text-[15px]'
//                 }`}
//               >
//                 Sign In
//               </button>
//             </form>

//             <div className={`${isMobile ? 'mt-4 text-[11px]' : 'mt-6 text-[13px]'} text-center text-gray-600`}>
//               Admin: <b>admin</b> / <b>admin@123</b>
//               <br />
//               Assigner: <b>assigner@redplanet.com</b> / <b>assigner@123</b>
//               <br />
//               User: <b>user@redplanet.com</b> / <b>user@123</b>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }