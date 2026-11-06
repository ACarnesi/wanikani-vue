// Taken and adapted from WaniKani website src files
// Retaining functionality from WaniKani to ensure minimal differences in answer checking logic between webapps

import { toHiragana, toRomaji } from "wanakana";

const punctuationRange = '\u3000-\u303f'; // https://jrgraphix.net/r/Unicode/3000-303F
const fullAndHalfWidthRange = '\uff00-\uff9f'; // https://jrgraphix.net/r/Unicode/FF00-FFEF
const hiraganaRange = '\u3040-\u309f'; // https://jrgraphix.net/r/Unicode/3040-309F
const katakanaRange = '\u30a0-\u30ff'; // https://jrgraphix.net/r/Unicode/30A0-30FF

const hiraganaUnassigned = '\u3040';
const hiraganaDakutens = '\u3099\u309b';
const hiraganaHandakutens = '\u309a\u309c';
const katakanaDoubleHyphen = '\u30a0';
const katakanaInterpunct = '\u30fb';

const nonKanaPattern = new RegExp(`[^${hiraganaRange}${katakanaRange}]|[${hiraganaUnassigned}|${hiraganaDakutens}|${hiraganaHandakutens}|${katakanaDoubleHyphen}|${katakanaInterpunct}]`);
const kanaPatternExtended = new RegExp(`[${punctuationRange}${hiraganaRange}${katakanaRange}${fullAndHalfWidthRange}]`);

export const normalizeReadingResponse = (response: string) =>
  normalizeResponse(response).replace(/n/g, "ん").replace(/\s/g, "");

export const normalizeResponse = (response: string) =>
  response
    .trim() // remove leading and trailing spaces
    .toLowerCase() // convert to lowercase letters
    .replace(/-/g, " ") // replace hyphen with space
    .replace(/\.|,|'|’|\/|:/g, ""); // replace periods, comma, colons, and apostrophe with blanks

export const normalizeReadingToHiragana = (response: string) => toHiragana(response, { convertLongVowelMark: false })

export const extractKana = (inputString: string) =>
  inputString.replace(nonKanaPattern, '').split('');

const isKanaPresent = (inputString: string) => kanaPatternExtended.test(inputString)

const isNonKanaPresent = (inputString: string) =>
{
  const testString = inputString[inputString.length - 1] === "n" ? inputString.slice(0, -1) : inputString
  // Test for any character that's not hiragana or katakana
  return nonKanaPattern.test(testString);
}

export const questionTypeAndResponseMatch = (questionType: string, response: string) =>
  (questionType === "reading" && !isNonKanaPresent(response)) || (questionType === "meaning" && !isKanaPresent(response))


// Levenshtein Helpers
// *******************
// *******************
const levenshteinTolerances: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 2, 7: 2 };

export function getLevenshteinTolerance(word: string): number
{
  return levenshteinTolerances[word.length] || 2 + Math.floor(word.length / 7) * 1; // is the * 1 to cast it to a number?
}

export function getLevenshteinDistance(s: string, t: string): number
{
  const d: Array<Array<number>> = [];
  const n = s.length;
  const m = t.length;

  if (n === 0) return m;
  if (m === 0) return n;

  for (let i = n; i >= 0; i -= 1)
  {
    d[i] = [i];
  }

  for (let j = m; j >= 0; j -= 1) d[0]![j] = j;

  for (let i = 1; i <= n; i += 1)
  {
    const sI = s.charAt(i - 1);

    for (let j = 1; j <= m; j += 1)
    {
      if (i === j && d[i]![j]! > 4) return n;

      const tJ = t.charAt(j - 1);
      const cost = sI === tJ ? 0 : 1;

      let mi = d[i - 1]![j]! + 1;
      const b = d[i]![j - 1]! + 1;
      const c = d[i - 1]![j - 1]! + cost;

      if (b < mi) mi = b;
      if (c < mi) mi = c;

      d[i]![j] = mi;

      if (i > 1 && j > 1 && sI === t.charAt(j - 2) && s.charAt(i - 2) === tJ)
      {
        d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + cost);
      }
    }
  }

  return d[n]![m]!;
}

// AnswerChecker Plugin Helpers
// *******************
// *******************
const soundAlikes: Record<string, string> = { "お": "う", "う": "お", "え": "い" };

function getEndingVowel(mora: string)
{
  const romaji = toRomaji(mora);
  return romaji[romaji.length - 1];
};

export function containsLongDash(kana: string)
{
  return kana.indexOf("ー") !== -1
}

export function reponseMatchesConvertedReading(reading: string, response: string)
{
  const convertedReading = convertDashesToVowels(reading)
  const normalizedResponse = toHiragana(response)
  return vowelsMatch(convertedReading, normalizedResponse, reading)
}

export function convertDashesToVowels(kana: string)
{
  let newKana = "";

  for (let i = 0; i < kana.length; i++)
  {
    if (kana[i] === "ー")
    {
      newKana += toHiragana(getEndingVowel(kana[i - 1]!));
    } else
    {
      newKana += toHiragana(kana[i]);
    }
  }
  return newKana;
}

export function vowelsMatch(convertedReading: string, response: string, reading: string)
{
  if (convertedReading.length !== response.length)
  {
    return false;
  }

  return convertedReading.split("").every((character, i) => charactersMatchWithTypos(response, reading, character, i))
}

export function charactersMatchWithTypos(response: string, reading: string, character: string, i: number)
{
  if (character === response[i])
  {
    return true;
  }

  const soundsAlike = soundAlikes[character] === response[i];
  const replacesADash = reading[i] === "ー";
  const notReplacingAVowel = Object.keys(soundAlikes).indexOf(reading[i - 1]!) === -1;

  return soundsAlike && replacesADash && notReplacingAVowel;
}

const smallKanaSuffix = ["ゃ", "ゅ", "ょ", "ャ", "ュ", "ョ"];
const smallKanaPrefix = ["っ", "ッ"];

function classifyKana(kana: string, i: number)
{
  const isCompoundPrefix = smallKanaPrefix.indexOf(kana[i]!) !== -1;
  const isCompoundSuffix = smallKanaSuffix.indexOf(kana[i + 1]!) !== -1;
  const isSurrounded =
    isCompoundPrefix && smallKanaSuffix.indexOf(kana[i + 2]!) !== -1;

  return {
    hasSmallKana: isCompoundPrefix || isCompoundSuffix,
    isSurrounded,
  };
}

function splitIntoMorae(kana: string)
{
  const morae = [];

  for (let i = 0; i < kana.length; i += 1)
  {
    const { hasSmallKana, isSurrounded } = classifyKana(kana, i);

    if (isSurrounded)
    {
      morae.push(kana[i] + kana[i + 1]! + kana[i + 2]);
      i += 2;
    } else if (hasSmallKana)
    {
      morae.push(kana[i] + kana[i + 1]!);
      i += 1;
    } else
    {
      morae.push(kana[i]);
    }
  }

  return morae;
}

export function toIME(kana: string)
{
  const morae = splitIntoMorae(kana);

  return morae
    .map((mora) =>
    {
      if (mora === "ん" || mora === "ン")
      {
        return "nn";
      }
      if (mora === "ー")
      {
        return "-";
      }
      return toRomaji(mora);
    })
    .join("");
}

// find a single n to be replaced by nn
const missingNRegEx = /[^n]n$/g
const missingNReplacer = (match: string) => match.replace('n', 'nn')
const addMissingNs = (response: string) => response.replace(missingNRegEx, missingNReplacer)

export function isIMEEquivalent(kana: string, response: string)
{
  return toHiragana(kana) === toHiragana(addMissingNs(response), { IMEMode: true });
}

//Check N Helper Functions

// use alternate mapping to be consistent with our
// kana chart and knowledge base
const customRomajiMapping = {
  ぢ: "di",
  づ: "du",
  ぢゃ: "dya",
  ぢゅ: "dyu",
  ぢょ: "dyo",
  ふ: "hu",
}

export function toRomajiCustom(kana: string)
{
  return toRomaji(kana, { customRomajiMapping });
}


// mora refers to the syllabic unit, ex. "na" or "i"

/**
 * Returns an array of mora in romaji
 * @param {string} kana A kana string like かな
 * @return {array} an array like ["ka", "na"]
 */
export const toRomajiMora = (kana: string) =>
  kana.split("").map((mora) =>
  {
    if (mora === "っ")
    {
      return "*"
    }
    return toRomajiCustom(mora)
  })

const identicalArrays = (a: string[], b: string[]) => a.length === b.length && a.every((element: string, index: number) => element === b[index])

const cloneAndSplice = (array: string[], start: number, deleteCount: number, ...items: string[]) =>
{
  const clone = array.slice()
  clone.splice(start, deleteCount, ...items)
  return clone
}

// This is a recursive function that takes an array with one set of mora and returns an array with all 
// permutations of this intial set of mora where a missing n could have been added. It does not care about 
// uniqueness of the permutations so there may be duplicates but for what we need this for, the duplicates
// dont matter.
const createMissingNPermutations = (permutations: string[][], startIndex = 0) =>
{
  const moras = permutations[permutations.length - 1] ?? [];

  const pushAndRecurse = (newMoras: string[], nextIndex = 0) =>
  {
    permutations.push(newMoras)
    createMissingNPermutations(permutations, nextIndex)
  }

  moras.forEach((mora, index) =>
  {
    //Only check if an 'n' is present, and we are beyond the past any recursive loop's starting index
    if (!mora.startsWith('n') || index < startIndex) { return }
    const nextChar = moras[index + 1]

    // found an n, check the next character and if it is a vowel `x` then replace it with the `Nx` 
    // if it is a ya, yu, yo then turn it into a nya, nyu, nyo by adding a `ni`.  The toRomajiCustom turns a 
    // にょ into a に and a よ so that is why we add ni instead of the combintation nyo.
    if (mora === 'n')
    {
      if (nextChar && /^[aeiou]$/.test(nextChar))
      {
        pushAndRecurse(cloneAndSplice(moras, index + 1, 1, `n${nextChar}`))
      }
      if (nextChar && /^(ya|yu|yo)$/.test(nextChar))
      {
        pushAndRecurse(cloneAndSplice(moras, index + 1, 0, 'ni'))
      }
    }

    // found a `Nx` that is not the first mora and not preceeded by an `n` so lets add the vowel permutation by 
    // removing this `Nx` and replacing with an `n` and an `x` where `x` is a vowel. i.e. split a な into ん and あ
    // after splitting the `Nx` we dont want to recurse from the beginning of the permutation as that will detect the
    // ん that we just entered and create an incorrect permutation. So instead we just recurse on the permutation from
    // the point after we add the ん.
    // We also check if the next char is a ya, yu, yo, preceeded by a ni and this case the user could being type n followed 
    // by ya instead of nya.  We replace the ni with an n and recurse from the next index.
    if (/^n[aeiou]$/.test(mora) && index > 0 && moras[index - 1] !== 'n')
    {
      const newPermutation = cloneAndSplice(moras, index, 1, 'n', mora.charAt(1))
      pushAndRecurse(newPermutation, index + 1)
      if (mora === 'ni' && nextChar && /^(ya|yu|yo)$/.test(nextChar))
      {
        pushAndRecurse(cloneAndSplice(moras, index, 1, 'n'), index + 1)
      }
    }
  })
  return permutations
}

const createTooManyNPermutations = (permutations: string[][], startIndex = 0) =>
{
  const moras = permutations[permutations.length - 1] ?? [];

  const pushAndRecurse = (newMoras: string[], nextIndex = 0) =>
  {
    permutations.push(newMoras)
    createTooManyNPermutations(permutations, nextIndex)
  }

  moras.forEach((mora, index) =>
  {
    //Only check if an 'n' is present, and we are beyond the past any recursive loop's starting index
    if (mora !== 'n' || index < startIndex) { return }

    // found an n, check the next character and if it is a na, nu, ne, or no then replace it with an a, u, e, or o 
    // if it is a ni followed by ya, yu, yo then remove the ni otherwise turn the ni into an i. 
    const nextChar = moras[index + 1]
    if (nextChar && /^n[aeou]$/.test(nextChar))
    {
      pushAndRecurse(cloneAndSplice(moras, index + 1, 1, nextChar.charAt(1)), index + 1)
    }
    if (nextChar === 'ni')
    {
      const nextNextChar = moras[index + 2];
      if (nextNextChar && /^(ya|yu|yo)$/.test(nextNextChar))
      {
        pushAndRecurse(cloneAndSplice(moras, index + 1, 1), index + 1)
      } else
      {
        pushAndRecurse(cloneAndSplice(moras, index + 1, 1, nextChar.charAt(1)), index + 1)
      }
    }
  })
  return permutations
}

// returns the index of of array `a` where a match is found in array `b`
export function findMatchingIndexInArrayOfArrays(a: string[][], b: string[][])
{
  return a.findIndex((arrayA) => b.some((arrayB) => identicalArrays(arrayA, arrayB)))
}

export function findIndexOfReadingWithTooFewNs(response: string, readingsContainingN: string[])
{
  return findIndexOfReadingMatchingPermutations(response, readingsContainingN, createMissingNPermutations)
}

export function findIndexOfReadingWithTooManyNs(response: string, readingsContainingN: string[])
{
  return findIndexOfReadingMatchingPermutations(response, readingsContainingN, createTooManyNPermutations)
}

function findIndexOfReadingMatchingPermutations(response: string, readingsContainingN: string[], permutationsFactory: (permutations: string[][], startIndex?: number) => string[][])
{
  const responsePermutations = permutationsFactory([toRomajiMora(response)])
  return findMatchingIndexInArrayOfArrays(readingsContainingN.map(toRomajiMora), responsePermutations)
}

// Check Small Hiragana Helpers

export function joinWordsNicely(words: string[])
{
  if (words.length === 1)
  {
    return words[0];
  }
  if (words.length === 2)
  {
    return `${words[0]} and ${words[1]}`;
  }

  return `${words.slice(0, words.length - 1).join(", ")} and ${words[words.length - 1]}`;
};

const smallPairs: Record<string, string> = {
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ャ: "ヤ",
  ュ: "ユ",
  ョ: "ヨ",
};

const CLASSIFICATIONS: Record<string, string> = {
  typo: "typo",
  mistake: "mistake",
};

function checkforTypo(userChar: string, expectedChar: string)
{
  if (userChar === smallPairs[expectedChar])
  {
    return expectedChar;
  }
  return false;
}

function classify(userChar: string, expectedChar: string)
{
  if (checkforTypo(userChar, expectedChar))
  {
    return CLASSIFICATIONS.typo;
  }
  if (userChar !== expectedChar)
  {
    return CLASSIFICATIONS.mistake;
  }
  return true;
}

function findCorrections(userResponse: string, expectedAnswer: string)
{
  const corrections = [];
  for (let i = 0; i < userResponse.length; i += 1)
  {
    const userChar = userResponse[i]!;
    const expectedChar = expectedAnswer[i]!;
    const result = classify(userChar, expectedChar);
    if (result === CLASSIFICATIONS.typo)
    {
      corrections.push({ expectedChar, expectedAnswer });
    }
    if (result === CLASSIFICATIONS.mistake)
    {
      return false;
    }
  }
  return corrections;
}

export function compareBigAndSmall(userResponse: string, expectedAnswer: string)
{
  if (userResponse.length !== expectedAnswer.length)
  {
    return false;
  }

  return findCorrections(userResponse, expectedAnswer);
}



export function isSubjectWithoutReadings(obj: string)
{
  return ['radical', 'kana_vocabulary'].includes(obj);
}