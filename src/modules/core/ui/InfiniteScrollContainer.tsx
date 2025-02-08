import { useInView } from "react-intersection-observer";
import styles from "@/styles/scroll.module.css";
import { cn } from "@/lib/utils";

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

export default function InfiniteScrollContainer({
  children,
  onBottomReached,
  className,
}: InfiniteScrollContainerProps) {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached();
      }
    },
  });

  return (
    <div className={cn(styles.hideScrollbar, className)}>
      {children}
      <div ref={ref} />
    </div>
  );
}