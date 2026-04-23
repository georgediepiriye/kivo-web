// @/components/create-event/FormElements.tsx
import { motion } from "framer-motion";

export const StepHeader = ({
  step,
  totalSteps,
  title,
}: {
  step: number;
  totalSteps: number;
  title: string;
}) => (
  <div className="mb-8 md:mb-12 flex justify-between items-end">
    <div>
      <p className="text-[10px] font-black uppercase text-[#715800]">
        Step {step} of {totalSteps}
      </p>
      <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
        {title}
      </h1>
    </div>
    <div className="h-1.5 w-24 md:w-32 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        animate={{ width: `${(step / totalSteps) * 100}%` }}
        className="h-full bg-[#715800]"
      />
    </div>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InputGroup = ({ label, children, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
      {Icon && <Icon size={10} />} {label}
    </label>
    {children}
  </div>
);
