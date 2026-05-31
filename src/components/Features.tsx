import { features } from '../data';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Features() {
  return (
    <section className="py-32 bg-[#020617] relative overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#020617] to-[#020617] -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm mb-6">
                 <ShieldCheck size={16} /> Why Choose Us
               </div>
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight text-white">
                 Committed To <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Excellence</span>
               </h2>
               <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-lg font-medium leading-relaxed">
                  We bring a modern edge to traditional services, ensuring speed, security, and absolute reliability for every client.
               </p>
             </motion.div>
             <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    key={idx} 
                    className="flex items-start gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors"
                  >
                     <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg shrink-0 mt-0.5 border border-blue-500/20">
                        <CheckCircle2 size={20} />
                     </div>
                     <span className="font-semibold text-slate-200 leading-snug">{feature}</span>
                  </motion.div>
                ))}
             </div>
          </div>
          
          <div className="relative flex justify-center lg:justify-end">
             <div className="aspect-square w-full max-w-lg relative rounded-[3rem] overflow-hidden border border-white/10 p-1 flex flex-col items-center justify-center text-center group">
                {/* Glowing ring animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent animate-[spin_4s_linear_infinite] opacity-20" />
                
                <div className="absolute inset-1 bg-[#0a0f1c] rounded-[2.9rem] z-10 overflow-hidden flex flex-col items-center justify-center p-12">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-10 group-hover:bg-blue-500/20 transition-colors duration-700"></div>
                   
                   <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }}
                     whileInView={{ scale: 1, opacity: 1 }}
                     viewport={{ once: true }}
                     className="mb-8"
                   >
                     <div className="w-32 h-32 rounded-full border-4 border-blue-500/30 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-4 border-blue-400 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="text-5xl font-display font-bold text-white">100<span className="text-3xl text-blue-400">%</span></span>
                     </div>
                   </motion.div>
                   
                   <h3 className="relative z-10 text-3xl font-display font-bold mb-4 text-white">Client Satisfaction</h3>
                   <p className="relative z-10 text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                     Our relentless pursuit of quality ensures your projects and applications exceed expectations.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
