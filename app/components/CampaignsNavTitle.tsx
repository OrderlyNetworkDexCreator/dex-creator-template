import { getRuntimeConfig } from "@/utils/runtime-config";
import { cn } from "@orderly.network/ui";
import { SVGProps, useId } from "react";

export function buildCampaignsUrl(): string {
  const brokerId = getRuntimeConfig("VITE_ORDERLY_BROKER_ID") ?? "";
  return `https://app.orderly.network/campaigns/?utm_source=${encodeURIComponent(
    brokerId
  )}&utm_medium=navbar`;
}

export function CampaignsNavTitle({ title }: { title: string }) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1 px-2 w-full h-8",
        "rounded-md md:hover:bg-[rgb(var(--oui-color-base-7))]"
      )}
      onClick={() => {
        window.open(buildCampaignsUrl(), "_blank", "noopener");
      }}
    >
      <span
        className="inline-flex size-[20px] shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <CampaignsFlameIcon className="size-5" />
      </span>
      <span className="text-base-contrast text-base md:text-sm">{title}</span>
      <span className="inline-flex size-[12px] shrink-0 items-center justify-center">
        <CampaignsExternalArrowIcon className="oui-text-base-contrast size-[6.5px]" />
      </span>
    </button>
  );
}

function CampaignsFlameIcon(props: SVGProps<SVGSVGElement>) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.383 11.815c-.008-1.316.462-2.482 1.305-3.52.471-.578 1.011-1.096 1.51-1.65.399-.446.764-.913.988-1.472a3 3 0 0 0 .163-1.637l-.009-.05c-.004-.052-.02-.106.04-.14.054-.03.093.002.134.028q.474.296.875.68c.738.706 1.201 1.547 1.342 2.554.071.513.004 1.011-.105 1.51-.06.276-.113.556-.054.838.105.511.623.913 1.156.908a1.19 1.19 0 0 0 1.15-.928 1.6 1.6 0 0 0 .022-.402c-.003-.062-.03-.138.057-.167.086-.03.115.05.153.098a5.1 5.1 0 0 1 .9 1.827c.38 1.39.277 2.73-.496 3.978-.836 1.35-2.06 2.163-3.672 2.361-2.532.311-4.94-1.442-5.38-3.891a4.7 4.7 0 0 1-.079-.925m4.335-1.229.034-.546c.003-.055.002-.107-.059-.132-.056-.024-.092.014-.127.047-.402.376-.784.769-1.095 1.222-.517.75-.755 1.575-.595 2.469.17.951.757 1.601 1.702 1.887.96.291 1.821.056 2.509-.655.684-.707.848-1.548.532-2.472-.059-.174-.101-.18-.25-.059-.81.66-2.017.395-2.458-.539-.184-.39-.188-.806-.193-1.222"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1={15.224}
          y1={15.37}
          x2={5.383}
          y2={15.341}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#48bdff" />
          <stop offset={0.479} stopColor="#786cff" />
          <stop offset={1} stopColor="#bd00ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CampaignsExternalArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 6.5 6.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M0.5 0V1H4.795L0 5.795L0.705 6.5L5.5 1.705V6H6.5V0H0.5Z"
        fill="currentColor"
        fillOpacity={0.98}
      />
    </svg>
  );
}
