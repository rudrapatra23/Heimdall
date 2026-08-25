// 'use client';

// import Spline from '@splinetool/react-spline/next';

// export default function OrbGlam() {
//   return (
//     <div className="relative w-full aspect-square">
//       {/* Glow */}
//       <div
//         className="absolute inset-0 rounded-full blur-3xl opacity-50 pointer-events-none"
//         style={{
//           background:
//             'radial-gradient(circle, rgba(200,240,77,0.35) 0%, rgba(120,80,255,0.15) 40%, transparent 70%)',
//         }}
//       />

//       <div
//         className="absolute -inset-6 rounded-full blur-3xl opacity-30 pointer-events-none"
//         style={{
//           background:
//             'radial-gradient(circle, rgba(200,240,77,0.2) 0%, transparent 60%)',
//         }}
//       />

//       {/* Spline */}
//       <div className="relative w-full h-full">
//         <Spline
//           scene="https://prod.spline.design/0awO6kXV4B2CpD-0/scene.splinecode"
//         />
//       </div>

//       {/* Vignette */}
//       <div
//         className="absolute inset-0 rounded-[2rem] pointer-events-none"
//         style={{
//           boxShadow:
//             'inset 0 0 80px rgba(200,240,77,0.07), 0 0 60px rgba(200,240,77,0.1)',
//           border: '1px solid rgba(200,240,77,0.15)',
//         }}
//       />
//     </div>
//   );
// }