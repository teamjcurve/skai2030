export default function Loading() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white px-6">
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-violet-400 animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
        </div>

        <div className="text-center flex flex-col gap-2">
          <p className="text-lg font-bold text-slate-100">
            나의 생존 캐릭터를 분석 중입니다
          </p>
          <p className="text-sm text-slate-400 animate-pulse">
            잠시만 기다려주세요...
          </p>
        </div>
      </div>
    </div>
  );
}
