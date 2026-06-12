export default function GridLogo({ size = 32 }) {
  return (
    <span
      className="relative shrink-0 overflow-hidden rounded-lg"
      style={{ width: size, height: size }}
    >
      <img
        src="/ielts-buddy-logo.png"
        alt="IELTS Buddy"
        className="absolute left-1/2 top-[39%] h-[185%] w-[185%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    </span>
  );
}
