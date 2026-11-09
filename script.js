/* What is a positive result worth? – scroll-driven explanation of screening accuracy.
   No dependencies, no storage, no network. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg', NNBSP = ' ', N = 11;

  var TESTS = { phq9: { se: 88, sp: 85 }, whooley: { se: 96, sp: 57 }, ideal: { se: 95, sp: 95 } };
  var SETTINGS = { population: 8, gp: 20, practice: 50 };
  var GAME = [
    { setting: 'gp', p: 20, test: 'phq9' }, { setting: 'practice', p: 50, test: 'whooley' }, { setting: 'population', p: 8, test: 'ideal' },
    { setting: 'mass', p: 1, test: 'ideal' }, { setting: 'ward', p: 70, test: 'phq9' }, { setting: 'students', p: 15, test: 'whooley' }
  ];

  var I18N = {
    en: {
      htmlTitle: 'What is a positive result worth? – Screening accuracy', kicker: 'Screening accuracy', title: 'What is a positive result worth?',
      heroLead: 'A screening test comes back positive. How likely is it that the person really has the condition? The answer depends far less on the test than most people think – and far more on who was tested.',
      heroJourney: 'First the argument, in eight short steps with 100 people and one test. Then a playground, the full curves, and a game in which you guess the answer for six situations.',
      heroStart: 'Read the argument', heroGame: 'Jump to the game', heroHint: 'or just scroll',
      navArg: 'The argument', navPlay: 'Playground', navCurve: 'The curves', navGame: 'Game',
      reveal: 'Show me', check: 'Check', again: 'Play again', nextRound: 'Next round', finish: 'See result', cont: 'Continue',
      zone1: 'hardly any', zone2: 'a third', zone3: 'two thirds', zone4: 'nearly all',
      setting: 'Setting', test: 'Test', population: 'General population', gp: 'GP practice', practice: 'Psychotherapy practice',
      mass: 'Mass screening', ward: 'Inpatient ward', students: 'University counselling',
      phq9: 'PHQ-9', whooley: 'Two-question test', ideal: 'Excellent test',
      prev: 'Prevalence', prevDesc: 'share who have the condition', sens: 'Sensitivity', sensDesc: 'share of the ill who test positive', spec: 'Specificity', specDesc: 'share of the healthy who test negative',
      testPos: 'Test positive', testNeg: 'Test negative', sum: 'Total', rowSick: 'Depressed', rowHealthy: 'Not depressed',
      tpName: 'true positive', fnName: 'false negative · missed', fpName: 'false positive · false alarm', tnName: 'true negative',
      ppvF: 'true positives / all positive results', npvF: 'true negatives / all negative results',
      legSick: 'has depression', legHealthy: 'does not', legPlus: 'tests positive', legMinus: 'tests negative', rounded: 'whole people, rounded',
      secArg: 'The argument', secPlay: 'Playground', secCurve: 'The whole picture', secGame: 'Game',
      capPeople: 'people', capSick: 'have depression', capHealthy: 'do not', capPlus: 'test positive', capMinus: 'test negative',
      ofPlus: function (tp, pos) { return tp + ' of ' + pos + ' positive results are real'; },
      noPos: 'nobody tests positive', noNeg: 'nobody tests negative',
      npvRead: function (npv, tn, neg) { return 'A negative result is right ' + npv + ' of the time (' + tn + ' of ' + neg + ').'; },
      guessQ: 'Your estimate: how many of the positive results are real?',
      fbClose: function (a) { return 'True PPV ' + a + '. You were close.'; },
      fbOff: function (a, g, d, over) { return 'True PPV ' + a + '. You said ' + g + ' – ' + d + ' points too ' + (over ? 'high' : 'low') + '.'; },
      pct: '%', picPos: function (s) { return 'Step ' + s + ' of ' + N; },
      footer: 'Test properties: PHQ-9, cut-off 10 – Levis, Benedetti &amp; Thombs (2019), <em>BMJ</em>, 365, l1476. Two-question test – Whooley et al. (1997), <em>J Gen Intern Med</em>, 12, 439–445. The “excellent test” and all prevalences are illustrative. Figures are rounded to whole people; the curves use the exact formulas.',
      steps: [
        { h: '100 people come for a depression screening.',
          b: '<p>A screening test is a short questionnaire. It does not diagnose anyone. It sorts people into two groups: those who <b>test positive</b> and those who <b>test negative</b>.</p><p>The question of this page: when someone tests positive, what does that actually tell us?</p>' },
        { h: function (f) { return f.sick + ' of them actually have depression.'; },
          b: function (f) { return '<p>This share is the <b>prevalence</b>: how common the condition is in this particular group. Here it is ' + f.sick + ' in 100, a typical figure for the general population.</p><p>Nobody can tell by looking. Often the people themselves cannot either. That is what the test is for.</p>'; },
          t: '<b>Prevalence</b>How common the condition is in the group being tested. It is a property of the group, not of the test.' },
        { h: function (f) { return 'The test should find those ' + f.sick + '. It finds ' + f.tp + '.'; },
          b: function (f) { return '<p><b>Sensitivity 88%</b> means: of the people who have depression, 88% test positive. Here ' + f.tp + ' of the ' + f.sick + ' test positive.</p><p>' + f.fn + ' ' + (f.fn === 1 ? 'tests' : 'test') + ' negative and ' + (f.fn === 1 ? 'is' : 'are') + ' missed. That is a <b>false negative</b>.</p>'; },
          t: '<b>Sensitivity</b>Of all people who have the condition, the share the test catches with a positive result.' },
        { h: function (f) { return 'Of the ' + f.healthy + ' without depression, ' + f.tn + ' test negative – and ' + f.fp + ' test positive.'; },
          b: function (f) { return '<p><b>Specificity 85%</b> means: of the people without the condition, 85% correctly test negative. The other 15% test positive although nothing is wrong.</p><p>Those ' + f.fp + ' are <b>false positives</b>: false alarms, also called type I errors. Notice that there are already more of them than there are real cases.</p>'; },
          t: '<b>Specificity</b>Of all people without the condition, the share the test clears with a negative result.' },
        { h: 'Now look only at the positive results.',
          b: function (f) { return '<p>' + f.pos + ' people test positive. Some have depression, some do not, and from the outside they look the same.</p><p>Before you see it: how many of the ' + f.pos + ' actually have depression?</p>'; },
          hr: function (f) { return f.tp + ' of the ' + f.pos + ' who tested positive actually have depression.'; },
          br: function (f, ppv) { return '<p>That is the <b>positive predictive value</b>, PPV: ' + ppv + '. Most positive results are false alarms – with a test that catches 88% of cases.</p><p>Sensitivity and specificity describe the test. The PPV describes what a result means for the person holding it. They are not the same thing.</p>'; },
          t: '<b>Positive predictive value (PPV)</b>Of all people who test positive, the share who really have the condition. This is the number a patient and a clinician actually need.' },
        { h: 'Same test, different waiting room.',
          b: function (f, ppv) { return '<p>In a psychotherapy practice, every second person has depression: prevalence 50%. The PHQ-9 has not changed.</p><p>Now ' + f.tp + ' of the ' + f.pos + ' positive results are real. <b>PPV ' + ppv + '.</b> The same positive result that was mostly noise in the general population is now mostly signal.</p><p>Nothing about the test changed. Only the prevalence.</p>'; } },
        { h: 'Weak test, routine screening.',
          b: function (f, ppv) { return '<p>The two-question test is popular because it is quick. It catches 96% of cases – but it also gives a positive result to 43% of the healthy.</p><p>Used routinely in the general population: ' + f.tp + ' real cases and ' + f.fp + ' false alarms. <b>PPV ' + ppv + '.</b> Roughly ' + Math.round(f.fp / f.tp) + ' of every ' + (Math.round(f.fp / f.tp) + 1) + ' positive results are wrong.</p><p>This is what routine screening with a weak tool produces: mostly type I errors. A positive result then means almost nothing, and everyone who receives one is worried, re-tested or treated for no reason.</p>'; } },
        { h: 'Two things decide what a positive result is worth.',
          b: '<div class="takeaways"><div class="takeaway"><b>1. A good estimate of the prevalence.</b>Without knowing how common the condition is in your setting, a positive result cannot be interpreted. The same result from the same test meant 85% in one room and 17% in another.</div><div class="takeaway"><b>2. A test with known measurement properties.</b>Sensitivity and specificity have to be measured and published. A positive result from a test with unknown properties is a number without meaning – and a weak test in a low-prevalence group produces mostly false alarms.</div></div>' },
        { h: 'Try it yourself.', b: '<p>Move prevalence, sensitivity and specificity. The picture and the table update live. Try a weak test at 8%, then the same test at 50%.</p>' },
        { h: 'The whole picture: PPV and NPV across prevalence.',
          b: '<p>The solid line is the <b>PPV</b>: what a positive result is worth. It climbs steeply at low prevalence – a few percentage points of prevalence change everything there – and flattens out above 30%.</p><p>The dashed line is the <b>NPV</b>, the negative predictive value: what a negative result is worth. At low prevalence it sits near 100%. A negative result is very reassuring exactly where a positive one is nearly worthless.</p><p>Move the prevalence or switch the test to see both values at once.</p>' },
        { h: 'Guess the PPV.', b: '<p>Six situations. You see the setting and the test. Estimate how many of the positive results are real, then check.</p>' }
      ],
      tiles: [['PHQ-9 at 8%', 'general population'], ['PHQ-9 at 50%', 'psychotherapy practice'], ['Two-question test at 8%', 'general population']],
      chartRead: function (p, ppv, npv) { return 'At ' + p + ' prevalence with this test, a positive result is right ' + ppv + ' of the time and a negative result ' + npv + ' of the time.'; },
      chartPPV: 'PPV – what a positive result is worth', chartNPV: 'NPV – what a negative result is worth', axisX: 'Prevalence', axisY: 'Predictive value',
      roundLabel: function (i, n) { return 'Round ' + i + ' of ' + n; },
      scenario: function (s, p, tname, se, sp) { return '<b>' + s + '</b>, prevalence ' + p + '. <b>' + tname + '</b>, sensitivity ' + se + ', specificity ' + sp + '.'; },
      avgMiss: function (m) { return m + ' points<small>your average miss over six rounds</small>'; },
      endText: 'Most people guess too high when prevalence is low. That is the base-rate fallacy, and it is why a positive result from a routine screening deserves a second look, not a diagnosis.'
    },
    de: {
      htmlTitle: 'Was bedeutet ein positives Ergebnis? – Treffsicherheit von Screenings', kicker: 'Treffsicherheit von Screenings', title: 'Was bedeutet ein positives Ergebnis?',
      heroLead: 'Ein Screening-Test fällt positiv aus. Wie wahrscheinlich ist es, dass die Person die Störung wirklich hat? Die Antwort hängt viel weniger vom Test ab, als die meisten denken – und viel mehr davon, wer getestet wurde.',
      heroJourney: 'Zuerst das Argument, in acht kurzen Schritten mit 100 Menschen und einem Test. Dann eine Spielwiese, die vollständigen Kurven und ein Spiel, in dem Sie die Antwort für sechs Situationen schätzen.',
      heroStart: 'Zum Argument', heroGame: 'Direkt zum Spiel', heroHint: 'oder einfach scrollen',
      navArg: 'Das Argument', navPlay: 'Spielwiese', navCurve: 'Die Kurven', navGame: 'Spiel',
      reveal: 'Zeigen', check: 'Prüfen', again: 'Nochmal spielen', nextRound: 'Nächste Runde', finish: 'Ergebnis', cont: 'Weiter',
      zone1: 'kaum jemand', zone2: 'ein Drittel', zone3: 'zwei Drittel', zone4: 'fast alle',
      setting: 'Setting', test: 'Test', population: 'Allgemeinbevölkerung', gp: 'Hausärztliche Praxis', practice: 'Psychotherapiepraxis',
      mass: 'Reihenscreening', ward: 'Stationäre Aufnahme', students: 'Studierendenberatung',
      phq9: 'PHQ-9', whooley: 'Zwei-Fragen-Test', ideal: 'Exzellenter Test',
      prev: 'Prävalenz', prevDesc: 'Anteil mit der Störung', sens: 'Sensitivität', sensDesc: 'Anteil der Erkrankten mit positivem Ergebnis', spec: 'Spezifität', specDesc: 'Anteil der Gesunden mit negativem Ergebnis',
      testPos: 'Test positiv', testNeg: 'Test negativ', sum: 'Summe', rowSick: 'Depressiv', rowHealthy: 'Nicht depressiv',
      tpName: 'richtig positiv', fnName: 'falsch negativ · übersehen', fpName: 'falsch positiv · Fehlalarm', tnName: 'richtig negativ',
      ppvF: 'richtig Positive / alle positiven Ergebnisse', npvF: 'richtig Negative / alle negativen Ergebnisse',
      legSick: 'hat eine Depression', legHealthy: 'hat keine', legPlus: 'Test positiv', legMinus: 'Test negativ', rounded: 'ganze Personen, gerundet',
      secArg: 'Das Argument', secPlay: 'Spielwiese', secCurve: 'Das ganze Bild', secGame: 'Spiel',
      capPeople: 'Personen', capSick: 'haben eine Depression', capHealthy: 'haben keine', capPlus: 'Test positiv', capMinus: 'Test negativ',
      ofPlus: function (tp, pos) { return tp + ' von ' + pos + ' positiven Ergebnissen sind echt'; },
      noPos: 'niemand testet positiv', noNeg: 'niemand testet negativ',
      npvRead: function (npv, tn, neg) { return 'Ein negatives Ergebnis stimmt in ' + npv + ' der Fälle (' + tn + ' von ' + neg + ').'; },
      guessQ: 'Ihre Schätzung: Wie viele der positiven Ergebnisse sind echt?',
      fbClose: function (a) { return 'Tatsächlicher PPV ' + a + '. Nah dran.'; },
      fbOff: function (a, g, d, over) { return 'Tatsächlicher PPV ' + a + '. Sie haben ' + g + ' gesagt – ' + d + ' Punkte zu ' + (over ? 'hoch' : 'niedrig') + '.'; },
      pct: NNBSP + '%', picPos: function (s) { return 'Schritt ' + s + ' von ' + N; },
      footer: 'Testkennwerte: PHQ-9, Cut-off 10 – Levis, Benedetti &amp; Thombs (2019), <em>BMJ</em>, 365, l1476. Zwei-Fragen-Test – Whooley et al. (1997), <em>J Gen Intern Med</em>, 12, 439–445. „Exzellenter Test“ und alle Prävalenzen sind Beispielwerte. Figuren auf ganze Personen gerundet; die Kurven nutzen die exakten Formeln.',
      steps: [
        { h: '100 Menschen kommen zum Depressions-Screening.',
          b: '<p>Ein Screening-Test ist ein kurzer Fragebogen. Er stellt keine Diagnose. Er sortiert Menschen in zwei Gruppen: die mit <b>positivem</b> und die mit <b>negativem</b> Testergebnis.</p><p>Die Frage dieser Seite: Wenn jemand positiv testet – was sagt uns das eigentlich?</p>' },
        { h: function (f) { return f.sick + ' von ihnen haben tatsächlich eine Depression.'; },
          b: function (f) { return '<p>Dieser Anteil ist die <b>Prävalenz</b>: wie häufig die Störung in genau dieser Gruppe ist. Hier sind es ' + f.sick + ' von 100, ein typischer Wert für die Allgemeinbevölkerung.</p><p>Niemand sieht es ihnen an. Oft wissen es die Betroffenen selbst nicht. Dafür ist der Test da.</p>'; },
          t: '<b>Prävalenz</b>Wie häufig die Störung in der getesteten Gruppe ist. Eine Eigenschaft der Gruppe, nicht des Tests.' },
        { h: function (f) { return 'Der Test soll diese ' + f.sick + ' finden. Er findet ' + f.tp + '.'; },
          b: function (f) { return '<p><b>Sensitivität 88 %</b> heißt: Von den Menschen mit Depression testen 88 % positiv. Hier testen ' + f.tp + ' der ' + f.sick + ' positiv.</p><p>' + f.fn + ' ' + (f.fn === 1 ? 'testet' : 'testen') + ' negativ und ' + (f.fn === 1 ? 'wird' : 'werden') + ' übersehen. Das ist ein <b>falsch negatives</b> Ergebnis.</p>'; },
          t: '<b>Sensitivität</b>Von allen Menschen mit der Störung der Anteil, den der Test mit einem positiven Ergebnis erwischt.' },
        { h: function (f) { return 'Von den ' + f.healthy + ' ohne Depression testen ' + f.tn + ' negativ – und ' + f.fp + ' positiv.'; },
          b: function (f) { return '<p><b>Spezifität 85 %</b> heißt: Von den Menschen ohne die Störung testen 85 % korrekt negativ. Die anderen 15 % testen positiv, obwohl nichts ist.</p><p>Diese ' + f.fp + ' sind <b>falsch positiv</b>: Fehlalarme, auch Fehler erster Art genannt. Es sind jetzt schon mehr Fehlalarme als echte Fälle.</p>'; },
          t: '<b>Spezifität</b>Von allen Menschen ohne die Störung der Anteil, den der Test mit einem negativen Ergebnis entlastet.' },
        { h: 'Jetzt nur die positiven Ergebnisse.',
          b: function (f) { return '<p>' + f.pos + ' Menschen testen positiv. Manche haben eine Depression, manche nicht – von außen sehen sie gleich aus.</p><p>Bevor Sie es sehen: Wie viele der ' + f.pos + ' haben tatsächlich eine Depression?</p>'; },
          hr: function (f) { return f.tp + ' der ' + f.pos + ' mit positivem Ergebnis haben tatsächlich eine Depression.'; },
          br: function (f, ppv) { return '<p>Das ist der <b>positive prädiktive Wert</b>, PPV: ' + ppv + '. Die meisten positiven Ergebnisse sind Fehlalarme – bei einem Test, der 88 % der Fälle findet.</p><p>Sensitivität und Spezifität beschreiben den Test. Der PPV beschreibt, was ein Ergebnis für die Person bedeutet, die es in der Hand hält. Das ist nicht dasselbe.</p>'; },
          t: '<b>Positiver prädiktiver Wert (PPV)</b>Von allen Menschen mit positivem Ergebnis der Anteil, der die Störung wirklich hat. Die Zahl, die Patient:innen und Behandler:innen tatsächlich brauchen.' },
        { h: 'Gleicher Test, anderes Wartezimmer.',
          b: function (f, ppv) { return '<p>In einer Psychotherapiepraxis hat jede:r Zweite eine Depression: Prävalenz 50 %. Der PHQ-9 ist derselbe.</p><p>Jetzt sind ' + f.tp + ' der ' + f.pos + ' positiven Ergebnisse echt. <b>PPV ' + ppv + '.</b> Dasselbe positive Ergebnis, das in der Allgemeinbevölkerung vor allem Rauschen war, ist hier vor allem Signal.</p><p>Am Test hat sich nichts geändert. Nur die Prävalenz.</p>'; } },
        { h: 'Schwacher Test, Routine-Screening.',
          b: function (f, ppv) { return '<p>Der Zwei-Fragen-Test ist beliebt, weil er schnell geht. Er findet 96 % der Fälle – lässt aber auch 43 % der Gesunden positiv testen.</p><p>Routinemäßig in der Allgemeinbevölkerung eingesetzt: ' + f.tp + ' echte Fälle und ' + f.fp + ' Fehlalarme. <b>PPV ' + ppv + '.</b> Etwa ' + Math.round(f.fp / f.tp) + ' von ' + (Math.round(f.fp / f.tp) + 1) + ' positiven Ergebnissen sind falsch.</p><p>Das produziert Routine-Screening mit einem schwachen Instrument: vor allem Fehler erster Art. Ein positives Ergebnis bedeutet dann fast nichts – und alle, die eines bekommen, werden umsonst beunruhigt, nachgetestet oder behandelt.</p>'; } },
        { h: 'Zwei Dinge entscheiden, was ein positives Ergebnis bedeutet.',
          b: '<div class="takeaways"><div class="takeaway"><b>1. Eine gute Schätzung der Prävalenz.</b>Ohne zu wissen, wie häufig die Störung im eigenen Setting ist, lässt sich ein positives Ergebnis nicht deuten. Dasselbe Ergebnis desselben Tests bedeutete 85 % im einen Raum und 17 % im anderen.</div><div class="takeaway"><b>2. Ein Test mit bekannten Gütekriterien.</b>Sensitivität und Spezifität müssen gemessen und publiziert sein. Ein positives Ergebnis aus einem Test mit unbekannten Eigenschaften ist eine Zahl ohne Bedeutung – und ein schwacher Test in einer Gruppe mit niedriger Prävalenz produziert vor allem Fehlalarme.</div></div>' },
        { h: 'Probieren Sie es aus.', b: '<p>Prävalenz, Sensitivität und Spezifität verschieben – Bild und Tafel aktualisieren sich live. Probieren Sie einen schwachen Test bei 8 %, dann denselben Test bei 50 %.</p>' },
        { h: 'Das ganze Bild: PPV und NPV über die Prävalenz.',
          b: '<p>Die durchgezogene Linie ist der <b>PPV</b>: die Aussagekraft eines positiven Ergebnisses. Er steigt bei niedriger Prävalenz steil an – dort verändern wenige Prozentpunkte Prävalenz alles – und flacht oberhalb von 30 % ab.</p><p>Die gestrichelte Linie ist der <b>NPV</b>, der negative prädiktive Wert: die Aussagekraft eines negativen Ergebnisses. Bei niedriger Prävalenz liegt er nahe 100 %. Ein negatives Ergebnis ist genau dort sehr beruhigend, wo ein positives fast nichts aussagt.</p><p>Prävalenz verschieben oder Test wechseln, um beide Werte zugleich zu sehen.</p>' },
        { h: 'PPV schätzen.', b: '<p>Sechs Situationen. Setting und Test sind bekannt. Schätzen, wie viele der positiven Ergebnisse echt sind, dann prüfen.</p>' }
      ],
      tiles: [['PHQ-9 bei 8 %', 'Allgemeinbevölkerung'], ['PHQ-9 bei 50 %', 'Psychotherapiepraxis'], ['Zwei-Fragen-Test bei 8 %', 'Allgemeinbevölkerung']],
      chartRead: function (p, ppv, npv) { return 'Bei ' + p + ' Prävalenz stimmt mit diesem Test ein positives Ergebnis in ' + ppv + ' und ein negatives in ' + npv + ' der Fälle.'; },
      chartPPV: 'PPV – Aussagekraft eines positiven Ergebnisses', chartNPV: 'NPV – Aussagekraft eines negativen Ergebnisses', axisX: 'Prävalenz', axisY: 'Prädiktiver Wert',
      roundLabel: function (i, n) { return 'Runde ' + i + ' von ' + n; },
      scenario: function (s, p, tname, se, sp) { return '<b>' + s + '</b>, Prävalenz ' + p + '. <b>' + tname + '</b>, Sensitivität ' + se + ', Spezifität ' + sp + '.'; },
      avgMiss: function (m) { return m + ' Punkte<small>Ihre mittlere Abweichung über sechs Runden</small>'; },
      endText: 'Die meisten schätzen bei niedriger Prävalenz zu hoch. Das ist der Basisratenfehler – und der Grund, warum ein positives Ergebnis aus einem Routine-Screening einen zweiten Blick verdient, keine Diagnose.'
    }
  };

  var state = { step: 1, lang: 'en', p: 8, se: 88, sp: 85, guess5: 50, guessed5: false, revealed5: false, guess11: 50, game: null };
  var slow = false;
  function t(k) { return I18N[state.lang][k]; }
  function pctInt(x) { return x + t('pct'); }
  function fmtPct(x) { return isNaN(x) ? '–' : Math.round(x) + t('pct'); }

  /* ---------- numbers ---------- */
  function figures(p, se, sp) {
    var sick = p, healthy = 100 - p;
    var ex = { tp: sick * se / 100, fn: sick * (1 - se / 100), tn: healthy * sp / 100, fp: healthy * (1 - sp / 100) };
    var parts = ['tp', 'fp', 'fn', 'tn'].map(function (k) { return { k: k, v: ex[k], f: Math.floor(ex[k] + 1e-9), rem: ex[k] - Math.floor(ex[k] + 1e-9) }; });
    var total = parts.reduce(function (a, q) { return a + q.f; }, 0);
    parts.slice().sort(function (a, b) { return b.rem - a.rem; }).slice(0, 100 - total).forEach(function (q) { q.f += 1; });
    var f = {}; parts.forEach(function (q) { f[q.k] = q.f; });
    f.sick = f.tp + f.fn; f.healthy = f.fp + f.tn; f.pos = f.tp + f.fp; f.neg = f.fn + f.tn;
    f.ppv = f.pos ? f.tp / f.pos * 100 : NaN; f.npv = f.neg ? f.tn / f.neg * 100 : NaN;
    return f;
  }
  function ppvAt(p, se, sp) { var n = p * se, d = n + (1 - p) * (1 - sp); return d > 0 ? n / d : NaN; }
  function npvAt(p, se, sp) { var n = (1 - p) * sp, d = n + p * (1 - se); return d > 0 ? n / d : NaN; }
  function params(step) {
    if (step <= 5) return { p: 8, se: 88, sp: 85 };
    if (step === 6) return { p: 50, se: 88, sp: 85 };
    if (step === 7) return { p: 8, se: 96, sp: 57 };
    if (step === 11 && state.game) { var sc = GAME[state.game.i]; return { p: sc.p, se: TESTS[sc.test].se, sp: TESTS[sc.test].sp }; }
    return { p: state.p, se: state.se, sp: state.sp };
  }

  /* ---------- figures ---------- */
  var people = [];
  function makePerson() {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 34'); svg.setAttribute('class', 'person grey'); svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(SVGNS, 'use'); use.setAttribute('href', '#person'); use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#person');
    svg.appendChild(use);
    ['bp', 'bm'].forEach(function (c) {
      var g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', c);
      var ci = document.createElementNS(SVGNS, 'circle'); ci.setAttribute('cx', 12); ci.setAttribute('cy', 24.5); ci.setAttribute('r', 6.3);
      var tx = document.createElementNS(SVGNS, 'text'); tx.setAttribute('x', 12); tx.setAttribute('y', 28.3); tx.textContent = c === 'bp' ? '+' : '−';
      g.appendChild(ci); g.appendChild(tx); svg.appendChild(g);
    });
    return svg;
  }
  function colsFor(n) { return Math.max(4, Math.min(20, Math.ceil(Math.sqrt(n * 2.6)))); }
  function layout(kind, f) {
    var idx = { tp: [], fp: [], tn: [], fn: [] }, n = 0, k;
    for (k = 0; k < f.tp; k++) idx.tp.push(n++);
    for (k = 0; k < f.fp; k++) idx.fp.push(n++);
    for (k = 0; k < f.tn; k++) idx.tn.push(n++);
    for (k = 0; k < f.fn; k++) idx.fn.push(n++);
    var m = function (list, cls) { return list.map(function (i) { return { i: i, cls: cls }; }); };
    var sickL = m(idx.tp, 'sick plus').concat(m(idx.fn, 'sick minus'));
    var healthyR = m(idx.fp, 'healthy plus').concat(m(idx.tn, 'healthy minus'));
    var strip = function (list) { return list.map(function (o) { return { i: o.i, cls: o.cls.split(' ')[0] }; }); };
    if (kind === 'grey') return { left: m(idx.tp.concat(idx.fp, idx.tn, idx.fn), 'grey'), right: [], capL: [100, t('capPeople')], capR: null };
    if (kind === 'truth') return { left: strip(sickL), right: strip(healthyR), capL: [f.sick, t('capSick')], capR: [f.healthy, t('capHealthy')] };
    if (kind === 'sens') return { left: sickL, right: strip(healthyR), capL: [f.sick, t('capSick')], capR: [f.healthy, t('capHealthy')], dimR: true };
    if (kind === 'spec') return { left: sickL, right: healthyR, capL: [f.sick, t('capSick')], capR: [f.healthy, t('capHealthy')], dimL: true };
    if (kind === 'both') return { left: sickL, right: healthyR, capL: [f.sick, t('capSick')], capR: [f.healthy, t('capHealthy')] };
    return { left: m(idx.tp, 'sick plus').concat(m(idx.fp, 'healthy plus')), right: m(idx.fn, 'sick minus').concat(m(idx.tn, 'healthy minus')),
      capL: [f.pos, t('capPlus')], capR: [f.neg, t('capMinus')], dimR: true };
  }
  function place(L) {
    var first = people.map(function (el) { return el.parentNode ? el.getBoundingClientRect() : null; });
    [['left', '#grid-left', '#g-left', 'dimL'], ['right', '#grid-right', '#g-right', 'dimR']].forEach(function (side) {
      var list = L[side[0]], grid = $(side[1]), group = $(side[2]), cols = colsFor(list.length);
      group.classList.toggle('hidden-group', list.length === 0);
      group.classList.toggle('dim', !!L[side[3]]);
      group.style.setProperty('--cols', cols); grid.style.setProperty('--cols', cols);
      list.forEach(function (o, n) { grid.appendChild(people[o.i]); people[o.i].setAttribute('class', 'person ' + o.cls); people[o.i].style.transitionDelay = slow ? (n * 5) + 'ms' : '0ms'; });
    });
    $('#stage').classList.toggle('slow', slow);
    $('#cap-left-n').textContent = L.capL ? L.capL[0] : ''; $('#cap-left-l').textContent = L.capL ? L.capL[1] : '';
    $('#cap-right-n').textContent = L.capR ? L.capR[0] : ''; $('#cap-right-l').textContent = L.capR ? L.capR[1] : '';
    people.forEach(function (el, i) {
      if (!first[i]) return;
      var last = el.getBoundingClientRect(), dx = first[i].left - last.left, dy = first[i].top - last.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) { el.style.transform = ''; return; }
      var saved = el.style.transitionDelay;
      el.style.transition = 'none'; el.style.transitionDelay = '0ms'; el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      void el.getBoundingClientRect();
      el.style.transition = ''; el.style.transitionDelay = saved; el.style.transform = '';
    });
    slow = false;
  }

  /* ---------- chart ---------- */
  function el(name, attrs, text) { var e = document.createElementNS(SVGNS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function renderChart(P) {
    var svg = $('#curve'); svg.innerHTML = '';
    var W = 640, H = 380, Lm = 64, R = 24, T = 24, B = 56, pw = W - Lm - R, ph = H - T - B;
    var x = function (p) { return Lm + p * pw; }, y = function (v) { return T + (1 - v) * ph; };
    for (var g = 0; g <= 100; g += 20) {
      svg.appendChild(el('line', { 'class': 'gridl', x1: x(g / 100), x2: x(g / 100), y1: T, y2: T + ph }));
      svg.appendChild(el('line', { 'class': 'gridl', x1: Lm, x2: Lm + pw, y1: y(g / 100), y2: y(g / 100) }));
      svg.appendChild(el('text', { 'class': 'tick', x: x(g / 100), y: T + ph + 20, 'text-anchor': 'middle' }, pctInt(g)));
      svg.appendChild(el('text', { 'class': 'tick', x: Lm - 8, y: y(g / 100) + 5, 'text-anchor': 'end' }, pctInt(g)));
    }
    svg.appendChild(el('line', { 'class': 'axis', x1: Lm, x2: Lm + pw, y1: T + ph, y2: T + ph }));
    svg.appendChild(el('line', { 'class': 'axis', x1: Lm, x2: Lm, y1: T, y2: T + ph }));
    svg.appendChild(el('text', { 'class': 'axis-label', x: Lm + pw / 2, y: H - 10, 'text-anchor': 'middle' }, t('axisX')));
    svg.appendChild(el('text', { 'class': 'axis-label', x: 16, y: T + ph / 2, 'text-anchor': 'middle', transform: 'rotate(-90 16 ' + (T + ph / 2) + ')' }, t('axisY')));
    var se = P.se / 100, sp = P.sp / 100, pp = [], np = [];
    for (var i = 0; i <= 200; i++) {
      var p = i / 200, vp = ppvAt(p, se, sp), vn = npvAt(p, se, sp);
      if (!isNaN(vp)) pp.push(x(p).toFixed(1) + ',' + y(vp).toFixed(1));
      if (!isNaN(vn)) np.push(x(p).toFixed(1) + ',' + y(vn).toFixed(1));
    }
    svg.appendChild(el('polyline', { 'class': 'npv', points: np.join(' ') }));
    svg.appendChild(el('polyline', { 'class': 'ppv', points: pp.join(' ') }));
    $('#chart-legend').innerHTML = '<span class="ck"><i class="ck-ppv"></i>' + t('chartPPV') + '</span><span class="ck"><i class="ck-npv"></i>' + t('chartNPV') + '</span>';
    var cp = P.p / 100, cx = x(cp), cvp = ppvAt(cp, se, sp), cvn = npvAt(cp, se, sp);
    svg.appendChild(el('line', { 'class': 'cur-line', x1: cx, x2: cx, y1: T, y2: T + ph }));
    var right = cp < 0.72, ax = right ? cx + 14 : cx - 14, an = right ? 'start' : 'end';
    if (!isNaN(cvp)) { svg.appendChild(el('circle', { 'class': 'pt', cx: cx, cy: y(cvp), r: 8 })); svg.appendChild(el('text', { 'class': 'lab', x: ax, y: y(cvp) + (cvp > 0.9 ? 26 : 6), 'text-anchor': an }, 'PPV ' + fmtPct(cvp * 100))); }
    if (!isNaN(cvn)) { svg.appendChild(el('circle', { 'class': 'pt hollow', cx: cx, cy: y(cvn), r: 8 })); svg.appendChild(el('text', { 'class': 'lab', x: ax, y: y(cvn) - 12, 'text-anchor': an }, 'NPV ' + fmtPct(cvn * 100))); }
    $('#chart-read').textContent = t('chartRead')(pctInt(P.p), fmtPct(cvp * 100), fmtPct(cvn * 100));
  }

  /* ---------- text of all sections ---------- */
  function sectionOf(s) { return s <= 8 ? 'secArg' : s === 9 ? 'secPlay' : s === 10 ? 'secCurve' : 'secGame'; }
  function renderTexts() {
    for (var s = 1; s <= N; s++) {
      var sec = $('#s' + s), P = params(s), f = figures(P.p, P.se, P.sp), st = t('steps')[s - 1], ppvS = fmtPct(f.ppv);
      var h = st.h, b = st.b;
      if (s === 5 && state.revealed5) { h = st.hr; b = st.br; }
      sec.querySelector('.section-label').textContent = t(sectionOf(s));
      sec.querySelector('.headline').textContent = typeof h === 'function' ? h(f, ppvS) : h;
      sec.querySelector('.body').innerHTML = typeof b === 'function' ? b(f, ppvS) : b;
      var term = sec.querySelector('.term'); term.hidden = !st.t; if (st.t) term.innerHTML = st.t;
    }
  }

  /* ---------- game ---------- */
  function startGame() { state.game = { i: 0, revealed: false, misses: [], done: false }; state.guess11 = 50; }

  /* ---------- render ---------- */
  function render() {
    var s = state.step, P = params(s), f = figures(P.p, P.se, P.sp), ppvS = fmtPct(f.ppv), g = state.game;
    renderTexts();
    $$('.step').forEach(function (sec) { sec.classList.toggle('active', Number(sec.dataset.step) === s); });
    $$('.bar-nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#s' + (s <= 8 ? 1 : s)); });
    $('#pic-pos').textContent = t('picPos')(s);

    // step 5 guess
    var g5 = $('.guess[data-for="5"]');
    g5.hidden = state.revealed5;
    g5.querySelector('.sl-guess').value = state.guess5; g5.querySelector('.out-guess').textContent = pctInt(state.guess5);
    var fb5 = $('#s5 .feedback'), f5 = figures(8, 88, 85);
    if (state.revealed5 && state.guessed5) { var d5 = Math.abs(state.guess5 - f5.ppv); fb5.textContent = d5 < 5 ? t('fbClose')(fmtPct(f5.ppv)) : t('fbOff')(fmtPct(f5.ppv), pctInt(state.guess5), Math.round(d5), state.guess5 > f5.ppv); fb5.hidden = false; } else fb5.hidden = true;

    // controls (steps 9 & 10 share state)
    $$('.sl-p').forEach(function (i) { i.value = state.p; }); $$('.out-p').forEach(function (o) { o.textContent = pctInt(state.p); });
    $$('.sl-se').forEach(function (i) { i.value = state.se; }); $$('.out-se').forEach(function (o) { o.textContent = pctInt(state.se); });
    $$('.sl-sp').forEach(function (i) { i.value = state.sp; }); $$('.out-sp').forEach(function (o) { o.textContent = pctInt(state.sp); });
    $$('.chip').forEach(function (c) {
      var on = c.dataset.preset === 'setting' ? SETTINGS[c.dataset.key] === state.p : TESTS[c.dataset.key].se === state.se && TESTS[c.dataset.key].sp === state.sp;
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    // game
    var g11 = $('.guess[data-for="11"]'), fb11 = $('#s11 .feedback');
    if (!g) { $('#round').hidden = true; g11.hidden = true; fb11.hidden = true; $('#btn-round-next').hidden = true; $('#game-end').hidden = true; }
    else {
      var sc = GAME[g.i], T2 = TESTS[sc.test];
      $('#round').hidden = g.done;
      $('#round-label').textContent = t('roundLabel')(g.i + 1, GAME.length);
      $('#scenario').innerHTML = t('scenario')(t(sc.setting), pctInt(sc.p), t(sc.test), pctInt(T2.se), pctInt(T2.sp));
      g11.hidden = g.revealed || g.done;
      g11.querySelector('.sl-guess').value = state.guess11; g11.querySelector('.out-guess').textContent = pctInt(state.guess11);
      var fg = figures(sc.p, T2.se, T2.sp);
      if (g.revealed && !g.done) { var d = Math.abs(state.guess11 - fg.ppv); fb11.textContent = d < 5 ? t('fbClose')(fmtPct(fg.ppv)) : t('fbOff')(fmtPct(fg.ppv), pctInt(state.guess11), Math.round(d), state.guess11 > fg.ppv); fb11.hidden = false; } else fb11.hidden = true;
      $('#btn-round-next').hidden = !(g.revealed && !g.done);
      $('#btn-round-next').textContent = g.i + 1 >= GAME.length ? t('finish') : t('nextRound');
      $('#game-end').hidden = !g.done;
      if (g.done) { var avg = g.misses.reduce(function (a, v) { return a + v; }, 0) / g.misses.length; $('#avg-miss').innerHTML = t('avgMiss')(Math.round(avg)); $('#end-text').textContent = t('endText'); }
    }

    // picture
    var revealed = s === 5 ? state.revealed5 : s === 11 ? !!(g && g.revealed) : true;
    var kind = s === 1 ? 'grey' : s === 2 ? 'truth' : s === 3 ? 'sens' : s === 4 ? 'spec' : s === 5 ? (revealed ? 'bytest' : 'both') : s === 11 ? (revealed ? 'bytest' : 'truth') : 'bytest';
    var gameDone = s === 11 && g && g.done;
    var showStage = !(s === 8 || s === 10 || gameDone);
    $('#stage').hidden = !showStage; $('#legend').hidden = !showStage;
    if (showStage) place(layout(kind, f));
    var showResult = showStage && kind === 'bytest';
    $('#result').hidden = !showResult;
    if (showResult) {
      $('#result-big').textContent = 'PPV ' + ppvS;
      $('#result-sub').textContent = (f.pos ? t('ofPlus')(f.tp, f.pos) : t('noPos')) + '. ' + (f.neg ? t('npvRead')(fmtPct(f.npv), f.tn, f.neg) : t('noNeg') + '.');
    }
    $('#tiles').hidden = s !== 8;
    if (s === 8) {
      var vals = [figures(8, 88, 85), figures(50, 88, 85), figures(8, 96, 57)];
      $('#tiles').innerHTML = t('tiles').map(function (lab, i) { return '<div class="tile"><span class="t-big">' + fmtPct(vals[i].ppv) + '</span><span class="t-lab"><b>' + lab[0] + '</b><br>' + lab[1] + '</span></div>'; }).join('');
    }
    $('#chart').hidden = s !== 10;
    if (s === 10) renderChart(P);
    $('#table-wrap').hidden = s !== 9;
    if (s === 9) {
      $('#c-tp').textContent = f.tp; $('#c-fn').textContent = f.fn; $('#c-fp').textContent = f.fp; $('#c-tn').textContent = f.tn;
      $('#c-sick').textContent = f.sick; $('#c-healthy').textContent = f.healthy; $('#c-pos').textContent = f.pos; $('#c-neg').textContent = f.neg;
      $('#f-ppv').innerHTML = f.tp + ' / ' + f.pos + ' = <span class="res">' + ppvS + '</span>';
      $('#f-npv').innerHTML = f.tn + ' / ' + f.neg + ' = <span class="res">' + fmtPct(f.npv) + '</span>';
    }
  }

  function applyLang() {
    document.documentElement.lang = state.lang; document.title = t('htmlTitle');
    $$('[data-i18n]').forEach(function (e) { e.textContent = t(e.dataset.i18n); });
    $$('[data-i18n-html]').forEach(function (e) { e.innerHTML = t(e.dataset.i18nHtml); });
    $$('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === state.lang ? 'true' : 'false'); });
    var demos = $$('.legend .badge-demo'); if (demos[1]) demos[1].classList.add('neg');
  }

  /* ---------- scroll observer ---------- */
  function observe() {
    var sections = $$('.step');
    function pick() {
      var mid = window.innerHeight * 0.45, best = null, bestD = Infinity;
      sections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var d = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0;
        if (d < bestD) { bestD = d; best = sec; }
      });
      var n = Number(best.dataset.step);
      if (n !== state.step) {
        if (n === 11 && !state.game) startGame();
        state.step = n; slow = true; render();
      }
    }
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { pick(); ticking = false; }); } }, { passive: true });
    window.addEventListener('resize', function () { pick(); if (state.step === 10) renderChart(params(10)); });
    pick();
  }

  var SECTION_IDS = ['hero'].concat([1,2,3,4,5,6,7,8,9,10,11].map(function (n) { return 's' + n; }));
  function currentIndex() {
    var y = window.scrollY + 61, cur = 0;
    SECTION_IDS.forEach(function (id, i) { if (document.getElementById(id).offsetTop - 60 <= y + 2) cur = i; });
    return cur;
  }
  function jump(delta) {
    var target = SECTION_IDS[Math.max(0, Math.min(SECTION_IDS.length - 1, currentIndex() + delta))];
    document.getElementById(target).scrollIntoView({ block: 'start' });
  }
  /* one section per wheel gesture; free scrolling only inside a section taller than the viewport */
  var wheelLock = 0;
  function onWheel(e) {
    if (Math.abs(e.deltaY) < 6 || e.ctrlKey) return;
    var pic = e.target.closest ? e.target.closest('.picture-col') : null;
    if (pic && pic.scrollHeight > pic.clientHeight + 2) {
      var atEnd = e.deltaY > 0 ? pic.scrollTop + pic.clientHeight >= pic.scrollHeight - 2 : pic.scrollTop <= 1;
      if (!atEnd) return;
    }
    var sec = document.getElementById(SECTION_IDS[currentIndex()]), r = sec.getBoundingClientRect();
    if (e.deltaY > 0 && r.bottom > window.innerHeight + 4) return;
    if (e.deltaY < 0 && r.top < 60 - 4) return;
    e.preventDefault();
    var now = Date.now();
    if (now - wheelLock < 900) return;
    wheelLock = now;
    jump(e.deltaY > 0 ? 1 : -1);
  }
  function bind() {
    for (var n = 1; n < N; n++) {
      var a = document.createElement('a'); a.className = 'next-link'; a.href = '#s' + (n + 1); a.setAttribute('data-i18n', 'cont');
      $('#s' + n + ' .step-inner').appendChild(a);
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('keydown', function (e) {
      var tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'A' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); jump(1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); jump(-1); }
    });
    $$('.lang-btn').forEach(function (b) { b.addEventListener('click', function () { state.lang = b.dataset.lang; applyLang(); render(); }); });
    $$('.guess').forEach(function (box) {
      var forStep = box.dataset.for, sl = box.querySelector('.sl-guess'), btn = box.querySelector('.btn-reveal');
      sl.addEventListener('input', function () { if (forStep === '5') { state.guess5 = Number(this.value); state.guessed5 = true; } else state.guess11 = Number(this.value); render(); });
      btn.addEventListener('click', function () {
        slow = true;
        if (forStep === '5') state.revealed5 = true;
        else if (state.game) { var sc = GAME[state.game.i], fg = figures(sc.p, TESTS[sc.test].se, TESTS[sc.test].sp); state.game.revealed = true; state.game.misses.push(Math.abs(state.guess11 - fg.ppv)); }
        render();
      });
    });
    $('#btn-round-next').addEventListener('click', function () {
      var g = state.game; if (!g) return;
      if (g.i + 1 >= GAME.length) g.done = true; else { g.i += 1; g.revealed = false; state.guess11 = 50; }
      slow = true; render();
    });
    $('#btn-again').addEventListener('click', function () { startGame(); render(); });
    $$('.sl-p').forEach(function (i) { i.addEventListener('input', function () { state.p = Number(this.value); render(); }); });
    $$('.sl-se').forEach(function (i) { i.addEventListener('input', function () { state.se = Number(this.value); render(); }); });
    $$('.sl-sp').forEach(function (i) { i.addEventListener('input', function () { state.sp = Number(this.value); render(); }); });
    $$('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        if (c.dataset.preset === 'setting') state.p = SETTINGS[c.dataset.key]; else { state.se = TESTS[c.dataset.key].se; state.sp = TESTS[c.dataset.key].sp; }
        render();
      });
    });
  }

  for (var i = 0; i < 100; i++) people.push(makePerson());
  bind(); applyLang(); render(); observe();
})();
