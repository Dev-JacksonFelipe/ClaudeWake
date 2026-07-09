// "Quarto do Claude" — arte do painel esquerdo da tela de login, com uma
// animação leve em loop (18s): o robozinho dorme (soltando "z" um a um), o
// despertador toca, ele levanta, caminha até o computador, a tela reage
// (acende + mensagem, simulando que ele está mexendo no Claude), volta pra
// cama e deita de novo. Tudo em SVG + CSS.
export default function LoginBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 640 820"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        .lr-robot, .lr-bob, .lr-eye, .lr-z, .lr-alarm, .lr-msg, .lr-screenglow {
          transform-box: fill-box;
        }
        /* Robô: deitado -> levanta -> anda até o PC -> volta -> deita */
        .lr-robot {
          transform-origin: bottom center;
          transform: translate(150px,505px) rotate(-62deg);
          animation: lr-robot 18s ease-in-out infinite;
        }
        @keyframes lr-robot {
          0%, 44%  { transform: translate(150px,505px) rotate(-62deg); }
          49%      { transform: translate(150px,598px) rotate(0deg); }
          53%      { transform: translate(150px,598px) rotate(0deg); }
          60%      { transform: translate(430px,598px) rotate(0deg); }
          72%      { transform: translate(430px,598px) rotate(0deg); }
          79%      { transform: translate(150px,598px) rotate(0deg); }
          83%      { transform: translate(150px,598px) rotate(0deg); }
          87%,100% { transform: translate(150px,505px) rotate(-62deg); }
        }
        /* Respiração/passos sutis */
        .lr-bob {
          transform-origin: bottom center;
          animation: lr-bob 2.4s ease-in-out infinite;
        }
        @keyframes lr-bob {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-2px); }
        }
        /* Olhos: fechados dormindo -> abertos acordado */
        .lr-eye {
          transform-origin: center;
          transform: scaleY(0.22);
          animation: lr-eyeOpen 18s ease-in-out infinite;
        }
        @keyframes lr-eyeOpen {
          0%, 44%   { transform: scaleY(0.22); }
          49%       { transform: scaleY(1); }
          84%       { transform: scaleY(1); }
          88%, 100% { transform: scaleY(0.22); }
        }
        /* Zzz saindo um por um enquanto dorme */
        .lr-zzz { animation: lr-zzzFade 18s ease-in-out infinite; }
        @keyframes lr-zzzFade {
          0%, 42%  { opacity: 1; }
          46%      { opacity: 0; }
          88%      { opacity: 0; }
          92%,100% { opacity: 1; }
        }
        .lr-z {
          transform-origin: center;
          opacity: 0;
          animation: lr-float 3s ease-out infinite;
        }
        .lr-z:nth-of-type(2) { animation-delay: 1s; }
        .lr-z:nth-of-type(3) { animation-delay: 2s; }
        @keyframes lr-float {
          0%   { opacity: 0; transform: translate(0, 8px) scale(0.7); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: translate(10px, -30px) scale(1.1); }
        }
        /* Despertador: toca antes de ele levantar */
        .lr-alarm {
          transform-origin: center;
          opacity: 0;
          animation: lr-alarm 18s ease-in-out infinite;
        }
        @keyframes lr-alarm {
          0%, 41%  { opacity: 0; transform: scale(0.5); }
          44%      { opacity: 1; transform: scale(1) rotate(0deg); }
          45%      { transform: scale(1) rotate(-12deg); }
          46%      { transform: scale(1) rotate(12deg); }
          47%      { transform: scale(1) rotate(-10deg); }
          48%      { transform: scale(1) rotate(10deg); }
          49%      { transform: scale(1) rotate(-6deg); }
          50%      { transform: scale(1) rotate(0deg); }
          52%      { transform: scale(0.86) rotate(0deg); }
          55%      { opacity: 0; transform: scale(0.6); }
          100%     { opacity: 0; transform: scale(0.5); }
        }
        /* Tela do monitor reagindo quando ele chega no PC */
        .lr-screenglow {
          opacity: 0;
          animation: lr-screenglow 18s ease-in-out infinite;
        }
        @keyframes lr-screenglow {
          0%, 58%  { opacity: 0; }
          62%      { opacity: 1; }
          71%      { opacity: 1; }
          75%,100% { opacity: 0; }
        }
        .lr-msg {
          transform-origin: bottom center;
          opacity: 0;
          animation: lr-msg 18s ease-in-out infinite;
        }
        @keyframes lr-msg {
          0%, 60%  { opacity: 0; transform: translateY(6px) scale(0.85); }
          64%      { opacity: 1; transform: translateY(0) scale(1); }
          70%      { opacity: 1; transform: translateY(0) scale(1); }
          73%,100% { opacity: 0; transform: translateY(-6px) scale(0.9); }
        }
      `}</style>

      <defs>
        <linearGradient id="lr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e1524" />
          <stop offset="55%" stopColor="#0a0f1c" />
          <stop offset="100%" stopColor="#070a14" />
        </linearGradient>
        <radialGradient id="lr-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#c4cdda" />
        </radialGradient>
        <radialGradient id="lr-moonglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(226,232,240,0.28)" />
          <stop offset="100%" stopColor="rgba(226,232,240,0)" />
        </radialGradient>
        <radialGradient id="lr-screen" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#26436e" />
          <stop offset="100%" stopColor="#12233b" />
        </radialGradient>
        <radialGradient id="lr-warm" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="rgba(234,88,12,0.16)" />
          <stop offset="100%" stopColor="rgba(234,88,12,0)" />
        </radialGradient>
        <clipPath id="lr-window">
          <rect x="196" y="72" width="248" height="250" rx="8" />
        </clipPath>
      </defs>

      {/* Céu / parede noturna */}
      <rect x="0" y="0" width="640" height="820" fill="url(#lr-sky)" />
      <rect x="0" y="558" width="640" height="262" fill="#0b1020" />
      <rect x="0" y="558" width="640" height="3" fill="#18213a" />
      <rect x="0" y="400" width="640" height="420" fill="url(#lr-warm)" />

      {/* Janela + lua (a lua fica atrás das travessas, vista pelo vidro) */}
      <g>
        {/* fundo do vidro */}
        <rect x="196" y="72" width="248" height="250" rx="8" fill="#0b1220" />
        {/* lua e estrelas, recortadas dentro da janela */}
        <g clipPath="url(#lr-window)">
          <circle cx="286" cy="162" r="120" fill="url(#lr-moonglow)" />
          <circle cx="286" cy="162" r="50" fill="url(#lr-moon)" />
          <circle cx="302" cy="150" r="9" fill="#c8d2e0" opacity="0.5" />
          <circle cx="270" cy="178" r="6" fill="#c8d2e0" opacity="0.45" />
          <circle cx="392" cy="120" r="2.5" fill="#e2e8f0" opacity="0.8" />
          <circle cx="412" cy="252" r="2" fill="#e2e8f0" opacity="0.7" />
          <circle cx="228" cy="272" r="2" fill="#e2e8f0" opacity="0.6" />
        </g>
        {/* travessas + moldura por cima da lua */}
        <line x1="320" y1="72" x2="320" y2="322" stroke="#24314a" strokeWidth="5" />
        <line x1="196" y1="197" x2="444" y2="197" stroke="#24314a" strokeWidth="5" />
        <rect x="196" y="72" width="248" height="250" rx="8" fill="none" stroke="#24314a" strokeWidth="6" />
      </g>

      {/* Tapete */}
      <ellipse cx="330" cy="612" rx="250" ry="26" fill="#0e1830" opacity="0.6" />

      {/* Cama (esquerda) */}
      <g>
        <rect x="52" y="428" width="18" height="164" rx="3" fill="#2b3346" />
        <rect x="52" y="512" width="300" height="80" rx="4" fill="#222a3a" />
        <rect x="338" y="470" width="18" height="122" rx="3" fill="#2b3346" />
        <rect x="66" y="484" width="278" height="30" rx="8" fill="#8b95a8" />
        <rect x="86" y="466" width="96" height="30" rx="12" fill="#dbe1ea" />
        <rect x="196" y="480" width="148" height="34" rx="8" fill="#3f4a5e" />
        <rect x="196" y="480" width="148" height="9" rx="5" fill="#c2410c" opacity="0.7" />
      </g>

      {/* Mesa + computador (direita) */}
      <g>
        <rect x="598" y="498" width="16" height="122" rx="4" fill="#20293a" />
        <rect x="586" y="556" width="60" height="12" rx="4" fill="#20293a" />
        <rect x="404" y="540" width="220" height="14" rx="3" fill="#2b3346" />
        <rect x="418" y="554" width="12" height="70" fill="#222a3a" />
        <rect x="598" y="554" width="12" height="70" fill="#222a3a" />
        <rect x="500" y="500" width="12" height="42" fill="#1f2937" />
        <rect x="478" y="540" width="56" height="8" rx="3" fill="#1f2937" />
        <rect x="446" y="452" width="120" height="82" rx="8" fill="#111827" />
        <rect x="456" y="462" width="100" height="62" rx="4" fill="url(#lr-screen)" />
        {/* brilho quando reage */}
        <rect className="lr-screenglow" x="456" y="462" width="100" height="62" rx="4" fill="#3b6fb0" />
        <rect x="464" y="474" width="46" height="5" rx="2" fill="#f97316" opacity="0.85" />
        <rect x="464" y="486" width="70" height="5" rx="2" fill="#3b5b86" />
        <rect x="464" y="498" width="58" height="5" rx="2" fill="#3b5b86" />
        <rect x="464" y="510" width="40" height="5" rx="2" fill="#3b5b86" />
      </g>

      {/* Balão de mensagem do monitor */}
      <g className="lr-msg">
        <rect x="470" y="416" width="72" height="30" rx="8" fill="#f97316" />
        <path d="M498 446 l10 0 l-5 9 z" fill="#f97316" />
        <text x="482" y="436" fontFamily="monospace" fontSize="15" fontWeight="700" fill="#0a0a0f">&gt; oi</text>
      </g>

      {/* Despertador (toca antes de ele acordar) */}
      <g className="lr-alarm">
        <circle cx="200" cy="392" r="6" fill="none" stroke="#cbd5e1" strokeWidth="3" />
        <circle cx="220" cy="392" r="6" fill="none" stroke="#cbd5e1" strokeWidth="3" />
        <circle cx="210" cy="400" r="18" fill="#e2e8f0" />
        <circle cx="210" cy="400" r="18" fill="none" stroke="#f97316" strokeWidth="3" />
        <line x1="210" y1="400" x2="210" y2="389" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="210" y1="400" x2="218" y2="404" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M178 392 q-6 8 0 16" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M242 392 q6 8 0 16" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* Robô (deita, levanta, anda até o PC e volta) */}
      <g className="lr-robot">
        <g className="lr-bob">
          <rect x="-13" y="-12" width="9" height="12" rx="2" fill="#c2410c" />
          <rect x="4" y="-12" width="9" height="12" rx="2" fill="#c2410c" />
          <rect x="-27" y="-38" width="8" height="11" rx="2" fill="#ea580c" />
          <rect x="19" y="-38" width="8" height="11" rx="2" fill="#ea580c" />
          <rect x="-20" y="-46" width="40" height="36" rx="5" fill="#f97316" />
          <rect x="-20" y="-22" width="40" height="12" rx="4" fill="#ea580c" opacity="0.5" />
          <rect className="lr-eye" x="-12" y="-40" width="8" height="12" rx="2" fill="#0f1115" />
          <rect className="lr-eye" x="4" y="-40" width="8" height="12" rx="2" fill="#0f1115" />
        </g>
      </g>

      {/* Zzz do sono (saem um a um) */}
      <g className="lr-zzz" fill="#93a0b4" fontFamily="monospace" fontWeight="700">
        <text className="lr-z" x="150" y="452" fontSize="15">z</text>
        <text className="lr-z" x="164" y="436" fontSize="20">z</text>
        <text className="lr-z" x="180" y="418" fontSize="26">Z</text>
      </g>
    </svg>
  );
}
