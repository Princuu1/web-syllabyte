import React, { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { NoiseBackground } from "@/components/ui/noise-background";

export default function Login() {
  const { session, rollNo, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && session) {
      setLocation(rollNo ? "/home" : "/onboarding");
    }
  }, [session, rollNo, isLoading, setLocation]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  const HERO_BG = "/syllabyte1.png";

  if (isLoading || session) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-white">
      <div
        className={[
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        ].join(" ")}
      />

      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 py-4">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center">
          <div className="mb-4 flex w-full justify-center sm:mb-5 md:mb-6">
            <img
              src={HERO_BG}
              alt="Login illustration"
              draggable={false}
              className="h-auto w-full max-w-[240px] select-none object-contain pointer-events-none sm:max-w-[300px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[430px]"
            />
          </div>

          <div className="flex w-full flex-col items-center justify-center">
            <h1 className="mx-auto max-w-[23ch] text-center text-[1.6rem] font-bold leading-[1.05] text-[#2d3640] md:text-[4.5vw]">
              Welcome to the new way to
            </h1>

            <h2 className="mx-auto mt-1 max-w-[23ch] text-center text-[1.6rem] font-bold leading-[1.05] text-[#2d3640] md:mt-2 md:text-[4.5vw]">
              <span className="text-[#2f6cf6]">practice</span>{" "}
              <span className="text-[#2d3640]">&amp; </span>
              <span className="text-[#2f6cf6]">learn</span>
            </h2>
          </div>

          <div className="mt-6 flex w-full flex-col items-center justify-center sm:mt-7 md:mt-8">
            <NoiseBackground
              containerClassName="w-fit p-2 rounded-full mx-auto"
              gradientColors={[
                "rgb(255, 100, 150)",
                "rgb(100, 150, 255)",
                "rgb(255, 200, 100)",
              ]}
            >
              <button
                onClick={handleLogin}
                className="flex h-13 w-full max-w-[420px] items-center justify-center gap-3 rounded-full bg-white px-5 text-[15px] font-semibold text-[#2d3640] shadow-[0px_2px_0px_0px_#f5f5f5_inset,0px_1px_4px_rgba(0,0,0,.08)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] sm:h-14 sm:px-6 sm:text-base"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                  alt="Google"
                  className="h-5 w-5"
                />
                <span>Login With Google &rarr;</span>
              </button>
            </NoiseBackground>

      <p className="mt-3 text-center text-xs text-gray-500">
  By continuing, you agree to our{" "}
  <a
    href="/terms-and-conditions"
    className="font-medium text-primary hover:underline"
  >
    Terms of Service
  </a>{" "}
  and{" "}
  <a
    href="/privacy-policy"
    className="font-medium text-primary hover:underline"
  >
    Privacy Policy
  </a>
  .
</p>
          </div>
        </div>
      </div>
    </div>
  );
}