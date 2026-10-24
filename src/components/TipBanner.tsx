export default function TipBanner({ tip }: { tip: string }) {
  return (
    <p className="rounded-lg bg-secondary px-6 py-[22px] text-center text-[14px] font-medium leading-[1.6] text-secondary-foreground">
      {tip}
    </p>
  );
}
