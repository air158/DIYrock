import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  /** 小数位数 */
  decimals?: number;
  /** 持续时间 ms */
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/** 数字 count-up 滚动 */
export default function CountUp({
  value, decimals = 0, duration = 360, className, prefix = '', suffix = '',
}: Props) {
  const [v, setV] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = v;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const animate = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      // ease-out cubic
      const e = 1 - Math.pow(1 - t, 3);
      const cur = fromRef.current + (value - fromRef.current) * e;
      setV(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const display = v.toFixed(decimals);
  return <span className={`tabular ${className ?? ''}`}>{prefix}{display}{suffix}</span>;
}
