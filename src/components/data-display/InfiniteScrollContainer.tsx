import { useInView } from "react-intersection-observer";

import { cn } from "@/lib/utils";

const styles = {
  hideScrollbar: "scrollbar-none overflow-y-auto",
};

type InfiniteScrollContainerProps = {
  onBottomReached: () => void;
  className?: string;
} & React.PropsWithChildren

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