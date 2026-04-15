// src/pages/Quizzes.jsx
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Bug,
  Layers,
  Brain,
  Lock,
} from "lucide-react";

const QUIZ_CARDS = [
  {
    id: "rapid-fire",
    label: "Rapid Fire",
    subtitle: "3 sections · Choose level",
    icon: Zap,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    shadow: "shadow-purple-300/50",
    ring: "ring-purple-300/40",
    btnText: "text-purple-700",
    iconBg: "bg-white/25",
    disabled: false,
  },
  {
    id: "code-debug",
    label: "Code Debug",
    subtitle: "3 sections · Choose level",
    icon: Bug,
    gradient: "from-sky-400 via-blue-500 to-cyan-400",
    shadow: "shadow-blue-300/50",
    ring: "ring-blue-300/40",
    btnText: "text-blue-700",
    iconBg: "bg-white/25",
    disabled: false,
  },
  {
    id: "system-design",
    label: "System Design",
    subtitle: "3 sections · Choose level",
    icon: Layers,
    gradient: "from-amber-400 via-orange-400 to-yellow-400",
    shadow: "shadow-amber-300/50",
    ring: "ring-amber-300/40",
    btnText: "text-amber-700",
    iconBg: "bg-white/25",
    disabled: false,
  },
  {
    id: "aptitude",
    label: "Aptitude",
    subtitle: "3 sections · Choose level",
    icon: Brain,
    gradient: "from-emerald-400 via-green-400 to-teal-400",
    shadow: "shadow-emerald-300/50",
    ring: "ring-emerald-300/40",
    btnText: "text-emerald-700",
    iconBg: "bg-white/25",
    disabled: false,
  },
  {
    id: "placement-guarantee",
    label: "Placement Guarantee",
    subtitle: "3 sections · Choose level",
    icon: Lock,
    gradient: "from-gray-300 via-gray-200 to-gray-100",
    shadow: "shadow-gray-200/50",
    ring: "ring-gray-200/40",
    btnText: "text-gray-400",
    iconBg: "bg-gray-300/50",
    disabled: true,
  },
];

export default function Quizzes() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quizzes</h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">
          Engineering — IQ + EQ + RQ
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {QUIZ_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`
                relative rounded-2xl bg-gradient-to-br ${card.gradient}
                shadow-xl ${card.shadow}
                ring-1 ${card.ring}
                p-6 flex flex-col gap-4
                transition-all duration-300 ease-out
                ${card.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03] hover:shadow-2xl"}
              `}
              onClick={() => !card.disabled && navigate(`/dashboard/quiz/${card.id}`)}
            >
              {/* Icon Badge */}
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} backdrop-blur-sm flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{card.label}</h2>
                <p className="text-white/75 text-sm mt-0.5">{card.subtitle}</p>
              </div>

              {/* Button */}
              <button
                disabled={card.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!card.disabled) navigate(`/dashboard/quiz/${card.id}`);
                }}
                className={`
                  w-full py-3 rounded-xl font-semibold text-sm
                  bg-white/90 hover:bg-white transition-all duration-200
                  ${card.btnText}
                  ${card.disabled ? "cursor-not-allowed opacity-60" : "hover:shadow-md active:scale-[0.98]"}
                `}
              >
                {card.disabled ? "Coming Soon" : "Start Quiz"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
