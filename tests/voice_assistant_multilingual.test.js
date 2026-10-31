import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  cleanTextForSpeech,
  LANG_BCP47_MAP,
  checkVoiceNavigationCommand
} from '../src/services/voiceService.ts';
import {
  buildGroundedPrompt,
  buildOfflineFallbackReply
} from '../server/controllers/aiController.js';
import { schemesData } from '../src/data/schemes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.resolve(__dirname, '..');

function pass(msg) {
  console.log(`  [PASS] ${msg}`);
}

console.log('================================================================');
console.log('    GOVSCHEME MULTILINGUAL VOICE ASSISTANT AUDIT SUITE          ');
console.log('================================================================\n');

// -------------------------------------------------------------
// GROUP 1: Text-to-Speech Cleaning & Natural Speech Formatting
// -------------------------------------------------------------
console.log('--- Group 1: TTS Natural Speech Sanitization ---');

{
  const rawText = `[Grounded Knowledge Engine • Live AI Provider Notice]

**PM Kisan Samman Nidhi**: Official financial assistance for small farmers.
### Key Benefits:
• ₹6,000 direct income support per year
• Direct benefit transfer (DBT) to bank account

Official portal: https://pmkisan.gov.in/portal/apply
*Legal Notice: Official eligibility is strictly determined by deterministic rules.*`;

  const cleaned = cleanTextForSpeech(rawText);

  // Markdown symbols stripped
  assert(!cleaned.includes('**'), 'Must not contain bold asterisks');
  assert(!cleaned.includes('###'), 'Must not contain header hashes');
  assert(!cleaned.includes('•'), 'Must not contain bullet characters');
  assert(!cleaned.includes('[Grounded Knowledge Engine'), 'Must strip bracketed system tags');
  assert(!cleaned.includes('https://pmkisan.gov.in/portal/apply'), 'Must strip external URLs');

  // Important content preserved
  assert(cleaned.includes('PM Kisan Samman Nidhi'), 'Must preserve scheme name');
  assert(cleaned.includes('6,000'), 'Must preserve financial figures');
  assert(cleaned.includes('Key Benefits'), 'Must preserve text headers');

  pass('1.1: cleanTextForSpeech strips markdown symbols, system tags, and raw URLs cleanly');
}

{
  const emptyClean = cleanTextForSpeech('');
  assert.strictEqual(emptyClean, '', 'Empty text returns empty string');
  pass('1.2: cleanTextForSpeech handles empty string safely');
}

// -------------------------------------------------------------
// GROUP 2: BCP 47 Language Mapping Parity
// -------------------------------------------------------------
console.log('\n--- Group 2: Regional BCP 47 Language Codes ---');

{
  const requiredLangs = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu'];
  for (const lng of requiredLangs) {
    assert(LANG_BCP47_MAP[lng], `BCP 47 tag exists for language ${lng}`);
    assert(LANG_BCP47_MAP[lng].endsWith('-IN'), `${lng} tag should target Indian locale (-IN)`);
  }
  pass('2.1: BCP 47 code map covers all 7 official platform languages with Indian locales');
}

// -------------------------------------------------------------
// GROUP 3: Multilingual Voice Navigation Commands
// -------------------------------------------------------------
console.log('\n--- Group 3: Multilingual Voice Navigation Commands ---');

{
  // English commands
  assert.strictEqual(checkVoiceNavigationCommand('go to dashboard'), 'dashboard');
  assert.strictEqual(checkVoiceNavigationCommand('show scheme details'), 'explore');
  assert.strictEqual(checkVoiceNavigationCommand('open my application'), 'applications');
  assert.strictEqual(checkVoiceNavigationCommand('show my document vault'), 'documents');
  assert.strictEqual(checkVoiceNavigationCommand('open profile'), 'profile');
  assert.strictEqual(checkVoiceNavigationCommand('talk to ai assistant'), 'assistant');
  pass('3.1: English voice navigation commands recognized accurately');

  // Tamil commands
  assert.strictEqual(checkVoiceNavigationCommand('முகப்புக்குச் செல்'), 'dashboard');
  assert.strictEqual(checkVoiceNavigationCommand('திட்டங்கள்'), 'explore');
  assert.strictEqual(checkVoiceNavigationCommand('விண்ணப்பங்கள்'), 'applications');
  assert.strictEqual(checkVoiceNavigationCommand('ஆவணங்கள்'), 'documents');
  assert.strictEqual(checkVoiceNavigationCommand('சுயவிவரம்'), 'profile');
  assert.strictEqual(checkVoiceNavigationCommand('உதவியாளர்'), 'assistant');
  pass('3.2: Tamil voice navigation commands recognized accurately');

  // Hindi commands
  assert.strictEqual(checkVoiceNavigationCommand('डैशबोर्ड'), 'dashboard');
  assert.strictEqual(checkVoiceNavigationCommand('योजनाएं दिखाओ'), 'explore');
  assert.strictEqual(checkVoiceNavigationCommand('आवेदन'), 'applications');
  assert.strictEqual(checkVoiceNavigationCommand('दस्तावेज़'), 'documents');
  assert.strictEqual(checkVoiceNavigationCommand('प्रोफाइल'), 'profile');
  assert.strictEqual(checkVoiceNavigationCommand('सहायक'), 'assistant');
  pass('3.3: Hindi voice navigation commands recognized accurately');

  // Telugu commands
  assert.strictEqual(checkVoiceNavigationCommand('పథకాలు'), 'explore');
  assert.strictEqual(checkVoiceNavigationCommand('దరఖాస్తులు'), 'applications');
  assert.strictEqual(checkVoiceNavigationCommand('పత్రాలు'), 'documents');
  pass('3.4: Telugu voice navigation commands recognized accurately');

  // Malayalam commands
  assert.strictEqual(checkVoiceNavigationCommand('പദ്ധതികൾ'), 'explore');
  assert.strictEqual(checkVoiceNavigationCommand('അപേക്ഷകൾ'), 'applications');
  assert.strictEqual(checkVoiceNavigationCommand('രേഖകൾ'), 'documents');
  pass('3.5: Malayalam voice navigation commands recognized accurately');

  // Marathi commands
  assert.strictEqual(checkVoiceNavigationCommand('योजना'), 'explore');
  assert.strictEqual(checkVoiceNavigationCommand('अर्ज'), 'applications');
  assert.strictEqual(checkVoiceNavigationCommand('कागदपत्रे'), 'documents');
  pass('3.6: Marathi voice navigation commands recognized accurately');

  // Gujarati commands
  assert.strictEqual(checkVoiceNavigationCommand('યોજનાઓ'), 'explore');
  assert.strictEqual(checkVoiceNavigationCommand('અરજીઓ'), 'applications');
  assert.strictEqual(checkVoiceNavigationCommand('દસ્તાવેજો'), 'documents');
  pass('3.7: Gujarati voice navigation commands recognized accurately');
}

// -------------------------------------------------------------
// GROUP 4: Backend AI Controller Language Grounding
// -------------------------------------------------------------
console.log('\n--- Group 4: Backend AI Controller Language Grounding ---');

{
  const topSchemes = schemesData.slice(0, 3);

  // Tamil prompt instruction
  const [taSystemPrompt] = buildGroundedPrompt('விவசாய உதவி', topSchemes, 'ta');
  assert(taSystemPrompt.includes('Tamil (தமிழ்)'), 'System prompt must instruct reply in Tamil');
  pass('4.1: buildGroundedPrompt instructs Tamil response for ta language code');

  // Hindi prompt instruction
  const [hiSystemPrompt] = buildGroundedPrompt('किसान सहायता', topSchemes, 'hi');
  assert(hiSystemPrompt.includes('Hindi (हिन्दी)'), 'System prompt must instruct reply in Hindi');
  pass('4.2: buildGroundedPrompt instructs Hindi response for hi language code');

  // English fallback when language omitted
  const [defaultPrompt] = buildGroundedPrompt('farmer assistance', topSchemes);
  assert(defaultPrompt.includes('English'), 'Default language in prompt builder is English');
  pass('4.3: buildGroundedPrompt defaults gracefully to English when language omitted');
}

// -------------------------------------------------------------
// GROUP 5: Multilingual Grounded Offline Fallback Engine
// -------------------------------------------------------------
console.log('\n--- Group 5: Multilingual Offline Grounded Fallback Engine ---');

{
  const testSchemes = [schemesData[0]];

  // Tamil offline fallback
  const taFallback = buildOfflineFallbackReply(testSchemes, 'Verified Catalogue Fact', 'ta');
  assert(taFallback.includes('அரசுத் திட்டம்:'), 'Tamil fallback must use Tamil labels');
  assert(taFallback.includes('அதிகாரப்பூர்வ விண்ணப்ப போர்ட்டல்:'), 'Tamil fallback includes Tamil portal label');
  pass('5.1: buildOfflineFallbackReply generates native Tamil fallback');

  // Hindi offline fallback
  const hiFallback = buildOfflineFallbackReply(testSchemes, 'Verified Catalogue Fact', 'hi');
  assert(hiFallback.includes('योजना:'), 'Hindi fallback must use Hindi labels');
  assert(hiFallback.includes('आधिकारिक आवेदन पोर्टल:'), 'Hindi fallback includes Hindi portal label');
  pass('5.2: buildOfflineFallbackReply generates native Hindi fallback');

  // Telugu offline fallback
  const teFallback = buildOfflineFallbackReply(testSchemes, 'Verified Catalogue Fact', 'te');
  assert(teFallback.includes('పథకం:'), 'Telugu fallback must use Telugu labels');
  pass('5.3: buildOfflineFallbackReply generates native Telugu fallback');

  // Malayalam offline fallback
  const mlFallback = buildOfflineFallbackReply(testSchemes, 'Verified Catalogue Fact', 'ml');
  assert(mlFallback.includes('പദ്ധതി:'), 'Malayalam fallback must use Malayalam labels');
  pass('5.4: buildOfflineFallbackReply generates native Malayalam fallback');

  // Marathi offline fallback
  const mrFallback = buildOfflineFallbackReply(testSchemes, 'Verified Catalogue Fact', 'mr');
  assert(mrFallback.includes('योजना:'), 'Marathi fallback must use Marathi labels');
  pass('5.5: buildOfflineFallbackReply generates native Marathi fallback');

  // Gujarati offline fallback
  const guFallback = buildOfflineFallbackReply(testSchemes, 'Verified Catalogue Fact', 'gu');
  assert(guFallback.includes('યોજના:'), 'Gujarati fallback must use Gujarati labels');
  pass('5.6: buildOfflineFallbackReply generates native Gujarati fallback');

  // English offline fallback
  const enFallback = buildOfflineFallbackReply(testSchemes, 'Verified Catalogue Fact', 'en');
  assert(enFallback.includes('Published Scheme:'), 'English fallback uses English labels');
  pass('5.7: buildOfflineFallbackReply generates native English fallback');
}

// -------------------------------------------------------------
// GROUP 6: Locale Dictionary Voice Keys Parity Audit
// -------------------------------------------------------------
console.log('\n--- Group 6: Locale Dictionary Voice Keys Parity Audit ---');

{
  const requiredKeys = [
    'navigatingTo',
    'kioskFoundSchemes',
    'kioskNoSchemesFound',
    'speechNotSupported',
    'micError',
    'listeningSpeakNow',
    'groundedEngineNotice',
    'basedOnQueryFound',
    'noSchemeFoundExplore',
    'officialEligibilityRuleNote',
    'qMoreEligibility',
    'qWhatDocsPrepare',
    'qHowTrackApp'
  ];

  const languages = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu'];
  for (const lng of languages) {
    const filePath = path.join(basePath, 'public', 'locales', lng, 'translation.json');
    assert(fs.existsSync(filePath), `Translation file exists for ${lng}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const key of requiredKeys) {
      assert(data[key], `Language [${lng}] must have voice key "${key}"`);
    }
  }
  pass('6.1: All 7 languages have complete parity across all 13 voice assistant keys');
}

console.log('\n================================================================');
console.log('   ALL MULTILINGUAL VOICE ASSISTANT TESTS PASSED (100% GREEN)   ');
console.log('================================================================');
