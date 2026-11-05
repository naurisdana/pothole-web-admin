import { useState } from "react";

type EvidenceThumbProps = {
  src: string;
  className?: string;
};

export default function EvidenceThumb({ src, className = "h-11 w-11" }: EvidenceThumbProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-900 ${className}`}>
      {failed ? null : (
        <img
          src={src}
          alt=""
          className="h-full w-full scale-125 object-cover blur-[3px]"
          onError={() => setFailed(true)}
        />
      )}
      <span className="absolute inset-0 bg-slate-950/40" />
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tracking-wide text-white">
        Blur
      </span>
    </div>
  );
}
