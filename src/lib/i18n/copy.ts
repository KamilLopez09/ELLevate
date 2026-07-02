import type { CampCopy, Locale } from "@/lib/i18n/types";

const EN: CampCopy = {
  intake: {
    welcomeLabel: "Welcome, artist!",
    title: "Let's set up your canvas",
    subtitle: "Tell us a little about you, then we'll start painting with words.",
    firstName: "First name",
    lastInitial: "Last initial",
    lastInitialHint: "Enter your last name; only the first letter is saved.",
    ageBracket: "How old are you?",
    ageBracketPlaceholder: "Pick your age group",
    ageBracketLabels: {
      "5-9": "Ages 5–9",
      "10-14": "Ages 10–14",
    },
    homeLanguage: "Home language",
    homeLanguagePlaceholder: "Pick your language",
    campGroup: "Camp group",
    privacyTitle: "Privacy on this device",
    privacyBody: (ttlHours) =>
      `We save your first name, last initial, age group, language, and camp group on this tablet for up to ${ttlHours} hours so you can keep your progress. We do not ask for your full last name or email. When you pass a week, a summary score may be sent to camp organizers.`,
    privacyCounselor:
      "Counselors: tap New camper (reset this device) on the menu before the next child uses this tablet.",
    continue: "Continue →",
    resumeLink: "I have a resume code",
    errors: {
      incomplete: "Please fill in every box so we can set up your canvas!",
      invalidGroup: "Your camp group should be a single letter (like A).",
      invalidName: "Please use letters or numbers in your name.",
    },
  },
  menu: {
    loading: "Loading your camp weeks…",
    journeyLabel: "8-Week Camp Journey",
    greeting: (name) => `Hi, ${name}!`,
    subtitle: "Pick a week to watch, paint, and unlock the next adventure.",
    weeksPassed: (passed, total) => `${passed}/${total} weeks passed`,
    totalPoints: (points) => `${points} total points`,
    resetDevice: "New camper (reset this device)",
    resumeCode: "Get resume code",
    footer: "Completely free · Built for campers ages 5–14",
    counselorHint: "Counselors: press and hold this footer to quick-reset.",
    weekOf: (week, total) => `Week ${week} of ${total}`,
    passedReplay: "Passed · Replay",
    start: "Start →",
    unlockHint: (prevWeek) => `Finish Week ${prevWeek} to unlock`,
    lockedSoon: "Locked",
  },
  lesson: {
    loading: "Loading this week's lesson…",
    backToMenu: "← Menu",
    weekTheme: (week, theme) => `Week ${week} · ${theme}`,
    watchIntro:
      "Watch the clip — it matches this week's main lesson. Then tap Ready to Practice.",
    promptCount: (count) =>
      `${count} painting prompt${count === 1 ? "" : "s"} waiting`,
    modeLabel: "Mode:",
    modeDragMatch: "Drag & Match",
    modeClickPaint: "Click to Paint",
    readyToPractice: "Ready to Practice! →",
    watchGateHint: (secondsLeft) =>
      secondsLeft > 0
        ? `Keep watching… ${secondsLeft}s left (or check the box below).`
        : "You can continue when you're ready.",
    watchedCheckbox: "I watched the video",
    watchGateReady: "You're ready to practice!",
  },
  practice: {
    loading: "Setting up your canvas…",
    noPrompts: (week, ageGroup) =>
      `No Week ${week} prompts found for age group ${ageGroup}.`,
    paintModeTitle: "Paint Mode",
    paintModeHint: "Tap answers to build sentences",
    paintedProgress: (done, total) => `${done} / ${total} painted`,
    reviewFlashcard: "Review · Flashcard Drill",
    practiceBuilder: "Practice · Sentence Builder",
    noCurriculum: (week, ageGroup) =>
      `No curriculum found for week ${week}, age ${ageGroup}.`,
    telemetryWarning:
      "Your score is saved on this device. Connect Supabase env vars to share camp telemetry.",
  },
  retry: {
    title: "Let's Practice Again!",
    body: (correct, total, threshold) =>
      `You got ${correct} out of ${total}. You need ${threshold} to move on. You can do it!`,
    tryAgain: "Try Again",
    tryAgainAria: "Try the lesson again",
  },
  celebration: {
    weekComplete: "Week complete!",
    passedWeek: (week) => `You passed Week ${week}!`,
    summary: (theme, correct, total, threshold) =>
      `${theme} — ${correct} of ${total} first-try wins (you needed ${threshold}).`,
    seeScore: "See your score →",
  },
  scoreboard: {
    greatWork: "Great work!",
    pointsEarned: (points) => `You earned ${points} points this round`,
    persistence: " — nice persistence!",
    basePoints: "Base points",
    firstTryBonuses: "First-try bonuses",
    speedBonuses: "Speed bonuses",
    accuracy: "Accuracy",
    returnToMenu: "Return to Main Menu",
    returnToMenuAria: "Return to main menu",
    saving: "Saving…",
    gameModes: {
      flashcard_drill: "Flashcard Drill",
      sentence_builder: "Sentence Builder",
      match_blitz: "Match Blitz",
      rapid_fire: "Rapid Fire",
    },
  },
  reset: {
    title: "Start over for a new camper?",
    body: "This clears name, week progress, and scores on this device. Use this on shared camp tablets before the next child begins.",
    confirm: "Yes, reset device",
    cancel: "Cancel",
  },
  resume: {
    haveCode: "I have a resume code",
    backToIntake: "← Back to sign-up",
    restoreTitle: "Continue on this device",
    restoreBody:
      "Enter the 6-character code from your other tablet. Your week progress and points will load here.",
    codePlaceholder: "ABC123",
    restoreButton: "Load my progress",
    restoring: "Loading…",
    createTitle: "Your resume code",
    createBody:
      "Write this down or give it to a counselor. Enter it on another camp tablet to continue where you left off.",
    creating: "Creating code…",
    codeLabel: "Resume code",
    expires: (dateLabel) => `Valid until ${dateLabel}`,
    copyCode: "Copy code",
    close: "Done",
    getCode: "Get resume code",
    errors: {
      invalidCode: "Enter the full 6-character code.",
      notFound: "Invalid or expired code.",
      network: "Could not reach camp servers. Try again when online.",
    },
  },
  counselor: {
    label: "Counselor",
    title: "Quick reset",
    body: "Enter the camp PIN to clear this tablet for the next camper without using the menu.",
    pinLabel: "Counselor PIN",
    confirm: "Reset device",
    cancel: "Cancel",
    verifying: "Checking…",
    wrongPin: "Wrong PIN. Try again.",
    invalidPin: "Enter the counselor PIN.",
  },
  gameModes: {
    chooseStyle: "Choose Your Style",
    pickMode: "Pick a game mode",
    autoTitle: "Recommended (Auto)",
    autoDescription:
      "Review prompts use flashcards. Core and challenge prompts use sentence builder.",
    pointsPerPrompt: (max) => `Up to ${max} pts / prompt`,
    currentStyle: (label) => `Game style: ${label}`,
    changeStyle: "Change game style",
    useAuto: "Use recommended style",
    lockedPreview: "Coming soon — finish the previous week to unlock",
    speedTimerLabel: "Speed bonus",
    speedTimerHot: "Fast start — max speed bonus!",
    speedTimerWarm: "Keep going — quick answers still earn points.",
    speedTimerAria: (elapsedMs) =>
      `Elapsed ${(elapsedMs / 1000).toFixed(1)} seconds`,
    noDragMatchPrompt: "This prompt needs a picture-match week for Match Blitz.",
    noClickPaintPrompt: "This prompt needs fill-in-the-blank for Rapid Fire.",
  },
  skipLink: "Skip to main content",
};

const ES: CampCopy = {
  intake: {
    welcomeLabel: "¡Bienvenido, artista!",
    title: "Preparemos tu lienzo",
    subtitle:
      "Cuéntanos un poco de ti y empezaremos a pintar con palabras.",
    firstName: "Nombre",
    lastInitial: "Inicial del apellido",
    lastInitialHint:
      "Escribe tu apellido; solo guardamos la primera letra.",
    ageBracket: "¿Cuántos años tienes?",
    ageBracketPlaceholder: "Elige tu grupo de edad",
    ageBracketLabels: {
      "5-9": "5–9 años",
      "10-14": "10–14 años",
    },
    homeLanguage: "Idioma en casa",
    homeLanguagePlaceholder: "Elige tu idioma",
    campGroup: "Grupo del campamento",
    privacyTitle: "Privacidad en este dispositivo",
    privacyBody: (ttlHours) =>
      `Guardamos tu nombre, inicial del apellido, edad, idioma y grupo en esta tablet hasta ${ttlHours} horas para que puedas seguir tu progreso. No pedimos tu apellido completo ni correo. Cuando pasas una semana, un resumen puede enviarse a los organizadores.`,
    privacyCounselor:
      "Consejeros: toquen Nuevo campista (reiniciar) en el menú antes de que use la tablet el siguiente niño.",
    continue: "Continuar →",
    resumeLink: "Tengo un código de continuación",
    errors: {
      incomplete: "Por favor llena todas las casillas para preparar tu lienzo.",
      invalidGroup: "Tu grupo debe ser una sola letra (como A).",
      invalidName: "Por favor usa letras o números en tu nombre.",
    },
  },
  menu: {
    loading: "Cargando tus semanas del campamento…",
    journeyLabel: "Viaje de 8 semanas",
    greeting: (name) => `¡Hola, ${name}!`,
    subtitle:
      "Elige una semana para ver, pintar y desbloquear la siguiente aventura.",
    weeksPassed: (passed, total) => `${passed}/${total} semanas completadas`,
    totalPoints: (points) => `${points} puntos en total`,
    resetDevice: "Nuevo campista (reiniciar dispositivo)",
    resumeCode: "Obtener código de continuación",
    footer: "Totalmente gratis · Para campistas de 5 a 14 años",
    counselorHint: "Consejeros: mantén presionado este pie de página para reinicio rápido.",
    weekOf: (week, total) => `Semana ${week} de ${total}`,
    passedReplay: "Aprobada · Repetir",
    start: "Empezar →",
    unlockHint: (prevWeek) => `Termina la semana ${prevWeek} para desbloquear`,
    lockedSoon: "Bloqueada",
  },
  lesson: {
    loading: "Cargando la lección de esta semana…",
    backToMenu: "← Menú",
    weekTheme: (week, theme) => `Semana ${week} · ${theme}`,
    watchIntro:
      "Mira el video — va con la lección de esta semana. Luego toca Listo para practicar.",
    promptCount: (count) =>
      `${count} actividad${count === 1 ? "" : "es"} de pintura esperando`,
    modeLabel: "Modo:",
    modeDragMatch: "Arrastrar y emparejar",
    modeClickPaint: "Tocar para pintar",
    readyToPractice: "¡Listo para practicar! →",
    watchGateHint: (secondsLeft) =>
      secondsLeft > 0
        ? `Sigue mirando… faltan ${secondsLeft}s (o marca la casilla abajo).`
        : "Puedes continuar cuando quieras.",
    watchedCheckbox: "Ya vi el video",
    watchGateReady: "¡Ya puedes practicar!",
  },
  practice: {
    loading: "Preparando tu lienzo…",
    noPrompts: (week, ageGroup) =>
      `No hay actividades de la semana ${week} para el grupo ${ageGroup}.`,
    paintModeTitle: "Modo pintura",
    paintModeHint: "Toca las respuestas para armar oraciones",
    paintedProgress: (done, total) => `${done} / ${total} pintadas`,
    reviewFlashcard: "Repaso · Tarjetas",
    practiceBuilder: "Práctica · Armar oraciones",
    noCurriculum: (week, ageGroup) =>
      `No hay lección para la semana ${week}, edad ${ageGroup}.`,
    telemetryWarning:
      "Tu puntaje se guarda en este dispositivo. Conecta Supabase para compartir datos del campamento.",
  },
  retry: {
    title: "¡Practiquemos otra vez!",
    body: (correct, total, threshold) =>
      `Tienes ${correct} de ${total}. Necesitas ${threshold} para avanzar. ¡Tú puedes!`,
    tryAgain: "Intentar de nuevo",
    tryAgainAria: "Intentar la lección otra vez",
  },
  celebration: {
    weekComplete: "¡Semana completa!",
    passedWeek: (week) => `¡Pasaste la semana ${week}!`,
    summary: (theme, correct, total, threshold) =>
      `${theme} — ${correct} de ${total} aciertos al primer intento (necesitabas ${threshold}).`,
    seeScore: "Ver tu puntaje →",
  },
  scoreboard: {
    greatWork: "¡Buen trabajo!",
    pointsEarned: (points) => `Ganaste ${points} puntos en esta ronda`,
    persistence: " — ¡qué persistencia!",
    basePoints: "Puntos base",
    firstTryBonuses: "Bonos primer intento",
    speedBonuses: "Bonos de velocidad",
    accuracy: "Precisión",
    returnToMenu: "Volver al menú",
    returnToMenuAria: "Volver al menú principal",
    saving: "Guardando…",
    gameModes: {
      flashcard_drill: "Tarjetas de repaso",
      sentence_builder: "Armar oraciones",
      match_blitz: "Emparejar rápido",
      rapid_fire: "Respuesta rápida",
    },
  },
  reset: {
    title: "¿Empezar de nuevo para otro campista?",
    body: "Esto borra nombre, progreso y puntajes en este dispositivo. Úsalo en tablets compartidas antes del siguiente niño.",
    confirm: "Sí, reiniciar",
    cancel: "Cancelar",
  },
  resume: {
    haveCode: "Tengo un código de continuación",
    backToIntake: "← Volver al registro",
    restoreTitle: "Continuar en este dispositivo",
    restoreBody:
      "Escribe el código de 6 caracteres de tu otra tablet. Tu progreso y puntos se cargarán aquí.",
    codePlaceholder: "ABC123",
    restoreButton: "Cargar mi progreso",
    restoring: "Cargando…",
    createTitle: "Tu código de continuación",
    createBody:
      "Anótalo o dáselo a un consejero. Escríbelo en otra tablet del campamento para continuar donde lo dejaste.",
    creating: "Creando código…",
    codeLabel: "Código",
    expires: (dateLabel) => `Válido hasta ${dateLabel}`,
    copyCode: "Copiar código",
    close: "Listo",
    getCode: "Obtener código",
    errors: {
      invalidCode: "Escribe el código completo de 6 caracteres.",
      notFound: "Código inválido o expirado.",
      network: "No pudimos conectar con el campamento. Intenta cuando tengas internet.",
    },
  },
  counselor: {
    label: "Consejero",
    title: "Reinicio rápido",
    body: "Escribe el PIN del campamento para limpiar esta tablet para el siguiente campista sin usar el menú.",
    pinLabel: "PIN del consejero",
    confirm: "Reiniciar dispositivo",
    cancel: "Cancelar",
    verifying: "Verificando…",
    wrongPin: "PIN incorrecto. Intenta de nuevo.",
    invalidPin: "Escribe el PIN del consejero.",
  },
  gameModes: {
    chooseStyle: "Elige tu estilo",
    pickMode: "Elige un modo de juego",
    autoTitle: "Recomendado (Auto)",
    autoDescription:
      "Las repasos usan tarjetas. Las actividades principales usan armar oraciones.",
    pointsPerPrompt: (max) => `Hasta ${max} pts / actividad`,
    currentStyle: (label) => `Estilo: ${label}`,
    changeStyle: "Cambiar estilo de juego",
    useAuto: "Usar estilo recomendado",
    lockedPreview: "Próximamente — termina la semana anterior para desbloquear",
    speedTimerLabel: "Bono de velocidad",
    speedTimerHot: "¡Buen inicio — bono máximo de velocidad!",
    speedTimerWarm: "Sigue — respuestas rápidas aún suman puntos.",
    speedTimerAria: (elapsedMs) =>
      `Transcurrieron ${(elapsedMs / 1000).toFixed(1)} segundos`,
    noDragMatchPrompt:
      "Esta actividad necesita una semana de emparejar imágenes para Match Blitz.",
    noClickPaintPrompt:
      "Esta actividad necesita completar espacios para Rapid Fire.",
  },
  skipLink: "Saltar al contenido principal",
};

const COPY: Record<Locale, CampCopy> = { en: EN, es: ES };

export function getCopy(locale: Locale): CampCopy {
  return COPY[locale];
}
